import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import { ExerciseProvider } from "./context/ExerciseContext";
import { ContextTutor } from "./components/tutor/ContextTutor";
import { PwaUpdatePrompt } from "./components/common/PwaUpdatePrompt";
import { AuthModal } from "./components/auth/AuthModal";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import {
  TryOneExerciseModal,
  ONBOARDING_STORAGE_KEYS
} from "./components/onboarding/TryOneExerciseModal";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";

// Direct resilient imports for instantaneous 0ms page transitions
import { DashboardPage } from "./pages/DashboardPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { ExamPrepPage } from "./pages/ExamPrepPage";
import { ReadingPage } from "./pages/ReadingPage";
import { LessonPage } from "./pages/LessonPage";
import { PracticePage } from "./pages/PracticePage";
import { GrammarPage } from "./pages/GrammarPage";
import { ConversationPage } from "./pages/ConversationPage";
import { WritingPage } from "./pages/WritingPage";
import { SpeakingStudioPage } from "./pages/SpeakingStudioPage";
import { DictionaryPage } from "./pages/DictionaryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GenderDrill } from "./components/quiz/GenderDrill";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("roadmap");
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [showTasteTest, setShowTasteTest] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_STORAGE_KEYS.COMPLETED)) {
        setShowTasteTest(true);
      }
    } catch {}
  }, []);

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setCurrentPage("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenTasteTest={() => setShowTasteTest(true)}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex">
        {/* Desktop Sidebar Navigation */}
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Dynamic Page Views */}
        <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
          <ErrorBoundary onNavigate={handleNavigate}>
            {currentPage === "dashboard" && (
              <DashboardPage onNavigate={handleNavigate} />
            )}

            {currentPage === "roadmap" && (
              <RoadmapPage
                onSelectLesson={handleSelectLesson}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === "exam" && <ExamPrepPage />}

            {currentPage === "reading" && <ReadingPage />}

            {currentPage === "writing" && <WritingPage />}

            {currentPage === "speaking" && (
              <SpeakingStudioPage onNavigate={handleNavigate} />
            )}

            {currentPage === "conversation" && <ConversationPage />}

            {currentPage === "lesson" && (
              <LessonPage
                lessonId={activeLessonId}
                onBack={() => handleNavigate("roadmap")}
                onCompleteLesson={() => {}}
              />
            )}

            {currentPage === "practice" && (
              <PracticePage onNavigate={handleNavigate} />
            )}

            {currentPage === "grammar" && <GrammarPage />}

            {currentPage === "gender" && (
              <div className="py-4">
                <GenderDrill />
              </div>
            )}

            {currentPage === "dictionary" && <DictionaryPage />}

            {currentPage === "profile" && <ProfilePage onNavigate={handleNavigate} />}

            {currentPage === "settings" && <SettingsPage />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Floating Context-Aware AI Tutor */}
      <ContextTutor />

      {/* User Login & Registration Modal */}
      <AuthModal />

      {/* PWA Service Worker Update Prompt & Offline Ready Notice */}
      <PwaUpdatePrompt />

      {/* No-login First-Visit "Try One Exercise" Diagnostic Flow */}
      <TryOneExerciseModal
        isOpen={showTasteTest}
        onClose={() => setShowTasteTest(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProgressProvider>
            <ExerciseProvider>
              <AppContent />
            </ExerciseProvider>
          </ProgressProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
