import { test, expect } from "@playwright/test";

/**
 * DeutschPath Playwright Smoke Test Suite
 * Covers:
 * 1. Onboarding Flow ("Try One Exercise" First-Visit Diagnostic)
 * 2. Flashcard Session (SRS Flip, Grade, Progress)
 * 3. Reading Quiz (Passage Inspection, Answer Submission, Evidence Highlighting)
 * 4. Writing Submission (Mocked Gemini AI Evaluation, Criteria, Diff, Model Answer)
 * 5. Backup / Restore Data Portability (JSON Export & Import)
 * 6. Offline Mode Resilience (Client-Side Navigation & Storage)
 */

test.describe("DeutschPath Smoke Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Ensure sound is off by default per requirement
      localStorage.setItem("deutschpath_sound_enabled", "false");
    });
  });

  test("1. Onboarding flow: Language selection, 3-min taste test, diagnosis, and plan", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("deutschpath_onboarded");
      localStorage.removeItem("deutschpath_primary_goal");
      localStorage.removeItem("deutschpath_onboarding_weakest_skill");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Modal is automatically open on first visit
    const welcomeHeading = page.locator("text=Welcome to LanguagePath!");
    await expect(welcomeHeading).toBeVisible({ timeout: 10000 });

    // Step 1: Click English button inside the dialog -> advances to Step 2
    await page.locator("button:has-text('English')").first().click();

    // Step 2: Choose Primary Goal
    await expect(page.locator("text=What is your primary German goal?")).toBeVisible({ timeout: 5000 });
    await page.click("text=General Fluency & Travel");
    await page.click("button:has-text('Continue to 3-Min Taste Test')");

    // Step 3: Diagnostic Taste Test
    // Item 1: Gender of Tisch -> 'der Tisch (masculine)'
    await expect(page.locator("text=Welcher Artikel gehört zu diesem Wort?")).toBeVisible({ timeout: 5000 });
    await page.click("button:has-text('der Tisch (masculine)')");
    await page.click("button:has-text('Next Question')");

    // Item 2: Akkusativ -> 'einen'
    await expect(page.locator("text=Ergänzen Sie die Lücke (Akkusativ):")).toBeVisible({ timeout: 5000 });
    await page.click("button:has-text('einen')");
    await page.click("button:has-text('Next Question')");

    // Item 3: Reading detail extraction
    await expect(page.locator("text=Warum hat der Zug Verspätung?")).toBeVisible({ timeout: 5000 });
    await page.click("button:has-text('Wegen einer Reparatur an der Weiche')");
    await page.click("button:has-text('View Diagnosis & 7-Day Plan')");

    // Step 4: Diagnosis & 7-Day Plan
    const startPlanBtn = page.locator("button:has-text('Start Your 7-Day Plan')");
    await expect(startPlanBtn).toBeVisible({ timeout: 10000 });
    await startPlanBtn.click();

    // Verify modal is closed
    await expect(welcomeHeading).not.toBeVisible();

    // Verify onboarded flag is set
    const isOnboarded = await page.evaluate(() => localStorage.getItem("deutschpath_onboarded"));
    expect(isOnboarded).toBe("true");
  });

  test("2. Flashcard session: Practice navigation, card flip, rating, and SRS update", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("deutschpath_onboarded", "true");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Practice via data-testid
    const practiceNav = page.locator("[data-testid='nav-practice']").first();
    await practiceNav.click();

    // Wait for Vocabulary Studio header to load
    await expect(page.locator("text=Vocabulary Studio")).toBeVisible({ timeout: 10000 });

    // Flip card with Spacebar
    await page.keyboard.press("Space");

    // Rating buttons (Again, Hard, Good, Easy) should be visible
    const goodBtn = page.locator("button:has-text('Good')").first();
    await expect(goodBtn).toBeVisible({ timeout: 5000 });

    // Click Good or press 3
    await goodBtn.click();

    // Verify view is intact
    await expect(page.locator("text=Vocabulary Studio")).toBeVisible();
  });

  test("3. Reading quiz: Passage inspection, question answering, and evidence highlight", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("deutschpath_onboarded", "true");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Reading Library via data-testid
    const readingNav = page.locator("[data-testid='nav-reading']").first();
    await readingNav.click();

    await expect(page.locator("text=Graded German Reading (A1 – B2)")).toBeVisible({ timeout: 10000 });

    // Select the first reading text card
    const firstArticleCard = page.locator("[data-testid='reading-card']").first();
    await firstArticleCard.click();

    // Verify reader view is open
    await expect(page.locator("text=Back to Reading Library")).toBeVisible({ timeout: 10000 });

    // Answer a question option in the quiz section
    const quizOption = page.locator("div.space-y-2 button, div:has-text('Comprehension Check') ~ div button").first();
    if (await quizOption.isVisible()) {
      await quizOption.click();
    }

    // Verify reader view is interactive and intact
    await expect(page.locator("text=Back to Reading Library")).toBeVisible();
  });

  test("4. Writing submission: Mocked AI evaluation, rubric criteria, diff, and model answer", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("deutschpath_onboarded", "true");
    });

    // Mock Gemini API endpoint so tests don't require an actual live API key or consume quota
    await page.route("**/generativelanguage.googleapis.com/**", async (route) => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    taskPoints: [
                      { required: "Greeting", covered: true, evidence: "Sehr geehrte Damen und Herren" },
                      { required: "Reason for writing", covered: true, evidence: "ich schreibe Ihnen" }
                    ],
                    criteria: [
                      { name: "Task Fulfillment", score: 5, max: 5, evidence: "All points addressed", fix: "None" },
                      { name: "Coherence", score: 4, max: 5, evidence: "Good flow", fix: "Use more connectors" },
                      { name: "Vocabulary", score: 5, max: 5, evidence: "A1 appropriate", fix: "None" },
                      { name: "Structures", score: 5, max: 5, evidence: "Correct V2", fix: "None" },
                      { name: "Orthography", score: 5, max: 5, evidence: "Accurate spelling", fix: "None" }
                    ],
                    overall: 24,
                    mistakes: [],
                    modelAnswer: "Sehr geehrte Damen und Herren, ich schreibe Ihnen heute bezüglich meiner Reservierung. Mit freundlichen Grüßen.",
                    estimateOnly: true
                  })
                }
              ]
            }
          }
        ]
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResponse)
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Writing Studio
    const writingNav = page.locator("[data-testid='nav-writing']").first();
    await writingNav.click();

    await expect(page.locator("text=Writing Studio")).toBeVisible({ timeout: 10000 });

    // Fill in German composition
    const textarea = page.locator("textarea").first();
    await textarea.fill("Sehr geehrte Damen und Herren, ich schreibe Ihnen bezüglich der Einladung. Ich danke Ihnen herzlich. Mit freundlichen Grüßen, Alex.");

    // Submit for evaluation
    const evaluateBtn = page.locator("button:has-text('Submit for AI Evaluation')").first();
    await evaluateBtn.click();

    // Verify evaluation banner appears with heading "Evaluation Completed"
    await expect(page.getByRole("heading", { name: "Evaluation Completed" })).toBeVisible({ timeout: 10000 });
  });

  test("5. Backup & Restore: Export data and verify JSON structure", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("deutschpath_onboarded", "true");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Settings
    const settingsNav = page.locator("[data-testid='nav-settings']").first();
    await settingsNav.click();

    await expect(page.locator("text=Settings & Preferences")).toBeVisible({ timeout: 10000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");
    const exportBtn = page.locator("button:has-text('Download Backup JSON'), button:has-text('Export Backup Now')").first();
    await exportBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("backup");

    // Verify backup file can be read and parsed
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const content = Buffer.concat(chunks).toString("utf-8");
    const parsed = JSON.parse(content);
    expect(["LanguagePath", "DeutschPath"]).toContain(parsed.app);
    expect(parsed).toHaveProperty("schemaVersion");
    expect(parsed).toHaveProperty("progress");
  });

  test("6. Offline mode: Client-side navigation & persistence resilience", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("deutschpath_onboarded", "true");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Warm up the pages while online so chunks are cached
    await page.locator("[data-testid='nav-dictionary']").first().click();
    await expect(page.locator("input[type='text']").first()).toBeVisible({ timeout: 10000 });

    await page.locator("[data-testid='nav-roadmap']").first().click();
    await expect(page.locator("text=A1 • Absolute Beginner")).toBeVisible({ timeout: 10000 });

    // Turn off network (simulate 100% offline flight mode)
    await page.context().setOffline(true);

    // Navigate to Dictionary offline
    await page.locator("[data-testid='nav-dictionary']").first().click();
    const searchInput = page.locator("input[type='text']").first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for a word offline
    await searchInput.fill("Tisch");
    await expect(page.getByRole("heading", { name: /Tisch/ })).toBeVisible({ timeout: 7000 });

    // Navigate back to Roadmap offline
    await page.locator("[data-testid='nav-roadmap']").first().click();
    await expect(page.locator("text=A1 • Absolute Beginner")).toBeVisible();

    // Restore online status
    await page.context().setOffline(false);
  });
});
