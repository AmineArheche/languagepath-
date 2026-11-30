import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendTutorMessage, getActiveGeminiModel as getTutorModel } from "./aiTutorService";
import { evaluateWriting, getActiveGeminiModel as getWritingModel } from "./aiWritingService";

// Mock localStorage for Node test runner
const mockStorage = {};
const localStorageMock = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }
};
globalThis.localStorage = localStorageMock;

describe("AI Services - Configurable Model & 404/429 Fallback Handling (Issue 5)", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Model Resolution", () => {
    it("should default to gemini-1.5-flash when no custom model is set", () => {
      expect(getTutorModel()).toBe("gemini-1.5-flash");
      expect(getWritingModel()).toBe("gemini-1.5-flash");
    });

    it("should use model stored in localStorage if present", () => {
      localStorageMock.setItem("deutschpath_gemini_model", JSON.stringify("gemini-2.0-flash"));
      expect(getTutorModel()).toBe("gemini-2.0-flash");
      expect(getWritingModel()).toBe("gemini-2.0-flash");
    });

    it("should prioritize customModel argument when passed", () => {
      expect(getTutorModel("gemini-1.5-pro")).toBe("gemini-1.5-pro");
      expect(getWritingModel("gemini-1.5-pro")).toBe("gemini-1.5-pro");
    });
  });

  describe("HTTP 404 & 429 Fallback in sendTutorMessage", () => {
    it("should handle HTTP 404 (model not found) with clear message and offline fallback", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "models/unknown-model not found" } })
      });

      const response = await sendTutorMessage({
        apiKey: "AIzaFakeValidKey12345",
        modelName: "non-existent-model",
        level: "A1",
        scenario: { id: "cafe", title: "Im Café", initialGreetings: { A1: "Hallo" } },
        conversationHistory: [],
        userMessage: "Ein Kaffee bitte"
      });

      expect(response).toBeDefined();
      expect(response.tutorReply).toBeDefined();
      expect(response.apiWarning).toMatch(/404/);
      expect(response.apiWarning).toContain("Check the model name in Settings");
    });

    it("should handle HTTP 429 (rate limit exceeded) with clear message and offline fallback", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Resource exhausted" } })
      });

      const response = await sendTutorMessage({
        apiKey: "AIzaFakeValidKey12345",
        level: "A1",
        scenario: { id: "cafe", title: "Im Café", initialGreetings: { A1: "Hallo" } },
        conversationHistory: [],
        userMessage: "Ein Kaffee bitte"
      });

      expect(response).toBeDefined();
      expect(response.tutorReply).toBeDefined();
      expect(response.apiWarning).toMatch(/429/);
      expect(response.apiWarning).toContain("rate limit exceeded");
    });
  });

  describe("HTTP 404 & 429 Fallback in evaluateWriting", () => {
    it("should handle HTTP 404 and return offline evaluation with apiWarning", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Model not found" } })
      });

      const result = await evaluateWriting({
        apiKey: "AIzaFakeValidKey12345",
        modelName: "invalid-model",
        level: "A1",
        taskTitle: "Email to Landlord",
        taskPrompt: "Inquire about rent",
        userText: "Sehr geehrter Herr Meyer, ich suche eine wohnung."
      });

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.apiWarning).toMatch(/404/);
    });

    it("should handle HTTP 429 and return offline evaluation with apiWarning", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Quota exceeded" } })
      });

      const result = await evaluateWriting({
        apiKey: "AIzaFakeValidKey12345",
        level: "A1",
        taskTitle: "Email to Landlord",
        taskPrompt: "Inquire about rent",
        userText: "Sehr geehrter Herr Meyer, ich suche eine wohnung."
      });

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.apiWarning).toMatch(/429/);
    });
  });
});
