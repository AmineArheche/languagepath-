import React, { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import { ExerciseProvider } from "./context/ExerciseContext";
import { ContextTutor } from "./components/tutor/ContextTutor";
import { PwaUpdatePrompt } from "./components/common/PwaUpdatePrompt";
import { AuthModal } from "./components/auth/AuthModal";
import {
  TryOneExerciseModal,
  ONBOARDING_STORAGE_KEYS
} from "./components/onboarding/TryOneExerciseModal";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";

// Code-split pages for instant initial load and smaller bundle chunks
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then(m => ({ default: m.RoadmapPage })));
const ExamPrepPage = lazy(() => import("./pages/ExamPrepPage").then(m => ({ default: m.ExamPrepPage })));
const ReadingPage = lazy(() => import("./pages/ReadingPage").then(m => ({ default: m.ReadingPage })));
const LessonPage = lazy(() => import("./pages/LessonPage").then(m => ({ default: m.LessonPage })));
const PracticePage = lazy(() => import("./pages/PracticePage").then(m => ({ default: m.PracticePage })));
const GrammarPage = lazy(() => import("./pages/GrammarPage").then(m => ({ default: m.GrammarPage })));
const ConversationPage = lazy(() => import("./pages/ConversationPage").then(m => ({ default: m.ConversationPage })));
const WritingPage = lazy(() => import("./pages/WritingPage").then(m => ({ default: m.WritingPage })));
const SpeakingStudioPage = lazy(() => import("./pages/SpeakingStudioPage").then(m => ({ default: m.SpeakingStudioPage })));
const DictionaryPage = lazy(() => import("./pages/DictionaryPage").then(m => ({ default: m.DictionaryPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const GenderDrill = lazy(() => import("./components/quiz/GenderDrill").then(m => ({ default: m.GenderDrill })));

function PageLoadingSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    </div>
  );
}

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
          <Suspense fallback={<PageLoadingSkeleton />}>
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
          </Suspense>
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
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <ExerciseProvider>
            <AppContent />
          </ExerciseProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
