import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  RotateCcw,
  Key,
  HelpCircle,
  MessageCircle,
  Bot,
  AlertCircle,
  Coffee,
  Briefcase,
  Activity,
  Train,
  Check
} from "lucide-react";
import {
  SCENARIOS,
  getScenarioById,
  sendTutorMessage
} from "../services/aiTutorService";
import { ScenarioSelector } from "../components/conversation/ScenarioSelector";
import { ChatMessage } from "../components/conversation/ChatMessage";
import { ApiKeyModal } from "../components/conversation/ApiKeyModal";
import { Button } from "../components/common/Button";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useProgress } from "../context/ProgressContext";

const QUICK_PROMPTS = {
  cafe: ["Ich möchte einen Kaffee, bitte.", "Haben Sie Kuchen?", "Die Rechnung, bitte!"],
  interview: ["Mein Name ist David.", "Ich habe fünf Jahre Erfahrung.", "Ich lerne gern neue Dinge."],
  doctor: ["Mein Kopf tut sehr weh.", "Seit zwei Tagen habe ich Fieber.", "Welche Tabletten soll ich nehmen?"],
  station: ["Wann fährt der nächste Zug nach Berlin?", "Auf welchem Gleis?", "Eine Fahrkarte, bitte."],
  free: ["Hallo! Wie geht es dir?", "Das Wetter ist heute sehr schön.", "Ich lerne Deutsch mit DeutschPath!"]
};

export function ConversationPage() {
  const { checkAndUpdateStreak, recordError } = useProgress();
  const [level, setLevel] = useLocalStorage("deutschpath_tutor_level", "A1");
  const [scenarioId, setScenarioId] = useLocalStorage("deutschpath_tutor_scenario", "cafe");
  const [apiKey, setApiKey] = useLocalStorage("deutschpath_gemini_api_key", "");

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const scenario = getScenarioById(scenarioId);
  const messagesEndRef = useRef(null);

  // Conversation history: [{ id, sender: 'tutor'|'user', text, translation, correction }]
  const [history, setHistory] = useLocalStorage(
    `deutschpath_chat_${scenarioId}_${level}`,
    []
  );

  // Initialize initial greeting if history is empty
  useEffect(() => {
    if (history.length === 0) {
      const initialGreeting = scenario.initialGreetings[level] || scenario.initialGreetings.A1;
      setHistory([
        {
          id: `msg-${Date.now()}`,
          sender: "tutor",
          text: initialGreeting,
          translation: "Hello! Welcome. How can I help you today?"
        }
      ]);
    }
  }, [scenarioId, level]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    checkAndUpdateStreak();
    setInputMessage("");

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      correction: null
    };

    const updatedHistory = [...history, newUserMsg];
    setHistory(updatedHistory);
    setIsLoading(true);
    setChatError(null);

    try {
      const response = await sendTutorMessage({
        apiKey,
        level,
        scenario,
        conversationHistory: history,
        userMessage: textToSend
      });

      if (response.apiWarning) {
        setChatError(response.apiWarning);
      }

      // Attach correction to the user's message
      const historyWithCorrection = updatedHistory.map((m) =>
        m.id === userMsgId ? { ...m, correction: response.correction } : m
      );

      // Record error to errorLedger if tutor detected mistakes
      if (response.correction && response.correction.hasErrors && recordError) {
        let cat = "case";
        let subcat = "grammar";
        const expl = (response.correction.explanation || "").toLowerCase();
        if (
          expl.includes("article") ||
          expl.includes("gender") ||
          expl.includes("der") ||
          expl.includes("die") ||
          expl.includes("das")
        ) {
          cat = "article-gender";
          subcat = "article";
        } else if (expl.includes("verb") || expl.includes("position") || expl.includes("v2")) {
          cat = "verb-position";
          subcat = "V2";
        } else if (expl.includes("spelling") || expl.includes("capital")) {
          cat = "spelling";
          subcat = "orthography";
        } else if (expl.includes("word") || expl.includes("vocabulary")) {
          cat = "vocabulary";
          subcat = "word-choice";
        }

        recordError({
          module: "conversation",
          level,
          category: cat,
          subcategory: subcat,
          learnerText: response.correction.original || textToSend,
          correct: response.correction.corrected,
          ruleId: `conversation-${scenarioId}`,
          itemId: `chat-${userMsgId}`,
          word:
            cat === "article-gender" || cat === "vocabulary"
              ? response.correction.corrected
              : undefined
        });
      }

      // Add tutor reply
      const tutorMsg = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: response.tutorReply,
        translation: response.translation
      };

      setHistory([...historyWithCorrection, tutorMsg]);
    } catch (err) {
      console.error("Error communicating with AI tutor:", err);
      setChatError(
        err.message ||
          "Could not get response from AI Tutor. Please check your API key or network connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const initialGreeting = scenario.initialGreetings[level] || scenario.initialGreetings.A1;
    setHistory([
      {
        id: `msg-${Date.now()}`,
        sender: "tutor",
        text: initialGreeting,
        translation: "Hello! Welcome. How can I help you today?"
      }
    ]);
  };

  const handleSelectScenario = (newId) => {
    setScenarioId(newId);
  };

  const handleSelectLevel = (newLvl) => {
    setLevel(newLvl);
  };

  const currentQuickPrompts = QUICK_PROMPTS[scenario.id] || QUICK_PROMPTS.free;
  const lastTutorMessage = [...history].reverse().find((m) => m.sender === "tutor");

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>AI German Tutor</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
              Interactive Conversation
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time German roleplay with instant grammar corrections and English explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApiKeyModalOpen(true)}
            icon={Key}
          >
            {apiKey ? "API Key Configured" : "Add Gemini API Key"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetChat}
            icon={RotateCcw}
            title="Restart current conversation"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Level & Scenario Selector */}
      <ScenarioSelector
        selectedLevel={level}
        onSelectLevel={handleSelectLevel}
        selectedScenarioId={scenarioId}
        onSelectScenario={handleSelectScenario}
      />

      {/* Active Conversation Container */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col h-[520px]">
        {/* Chat top info bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {scenario.character}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ({scenario.title.split("(")[0].trim()} &bull; Level {level})
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400">
            Replies strictly in German
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {history.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              tutorCharacter={scenario.character}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 animate-pulse py-2 px-3">
              <Bot className="w-4 h-4 text-amber-500" />
              <span>{scenario.character} schreibt auf Deutsch...</span>
            </div>
          )}

          {/* Error Banner */}
          {chatError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{chatError}</span>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="underline font-bold text-rose-700 dark:text-rose-300 shrink-0 hover:text-rose-900"
              >
                Configure Key
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Quick Suggestions:
          </span>
          {currentQuickPrompts.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(promptText)}
              className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-300 shrink-0 shadow-2xs transition-all active:scale-95"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-slate-900 rounded-b-3xl border-t border-slate-800 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Antworte auf Deutsch (${level}: "${currentQuickPrompts[0]}")...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!inputMessage.trim() || isLoading}
            icon={Send}
            size="md"
            className="rounded-2xl"
          >
            Send
          </Button>
        </form>
      </div>

      {/* Global "I don't understand" translation banner for last tutor turn */}
      {lastTutorMessage && lastTutorMessage.translation && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Tip:</strong> If you ever get stuck, click the "I don't understand (Translate)" button under the tutor's bubble or use the suggested reply chips!
            </span>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={setApiKey}
      />
    </div>
  );
}
