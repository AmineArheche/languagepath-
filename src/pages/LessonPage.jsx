import React, { useState } from "react";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2, HelpCircle } from "lucide-react";
import { getLessonById } from "../data/curriculum";
import { AudioButton } from "../components/common/AudioButton";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { QuizEngine } from "../components/quiz/QuizEngine";
import { useProgress } from "../context/ProgressContext";

export function LessonPage({ lessonId, onBack, onCompleteLesson }) {
  const lesson = getLessonById(lessonId);
  const { progress, completeLesson } = useProgress();
  const [activeTab, setActiveTab] = useState("learn"); // "learn" | "quiz"

  if (!lesson) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Lesson not found.</p>
        <Button onClick={onBack} className="mt-4">
          Back to Roadmap
        </Button>
      </div>
    );
  }

  const isCompleted = progress.completedLessons.includes(lesson.id);

  const handleQuizSuccess = (score, total) => {
    const passed = score / total >= 0.6;
    if (passed) {
      completeLesson(lesson.id, lesson.xp);
      if (onCompleteLesson) onCompleteLesson();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Roadmap</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {lesson.levelId} • Unit {lesson.unitNumber}
          </Badge>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Lesson Title & XP */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {lesson.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lesson.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-extrabold text-sm border border-amber-200 dark:border-amber-900">
              <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
              +{lesson.xp} XP
            </span>
          </div>
        </div>

        {/* Tab switch between Theory/Words and Quiz */}
        <div className="flex gap-2 mt-6 p-1 bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab("learn")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeTab === "learn"
                ? "bg-slate-700 text-amber-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vocabulary & Grammar ({lesson.words.length} items)
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeTab === "quiz"
                ? "bg-slate-700 text-amber-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Knowledge Check Quiz ({lesson.quiz?.length || 0} Qs)
          </button>
        </div>
      </div>

      {activeTab === "learn" ? (
        <div className="space-y-6">
          {/* Grammar Spotlight */}
          {lesson.grammarTip && (
            <Card className="p-5 border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                    Grammar Note & Sentence Rules
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-950/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                    {lesson.grammarTip}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Words List */}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 px-1">
              Lesson Vocabulary
            </h2>

            <div className="space-y-3">
              {lesson.words.map((word) => (
                <div
                  key={word.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {word.gender && <Badge gender={word.gender} size="sm" />}
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {word.german}
                      </span>
                      {word.plural && (
                        <span className="text-xs text-slate-400 font-medium">({word.plural})</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {word.english}
                    </div>

                    {word.exampleDe && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                        "{word.exampleDe}"{" "}
                        {word.exampleEn && (
                          <span className="opacity-75">— {word.exampleEn}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <AudioButton text={word.german} size="md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action to take the quiz */}
          <div className="pt-4 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setActiveTab("quiz")}
              icon={HelpCircle}
            >
              Take Quiz to Complete Lesson (+{lesson.xp} XP)
            </Button>
          </div>
        </div>
      ) : (
        /* Quiz Engine */
        <QuizEngine
          questions={lesson.quiz}
          xpReward={lesson.xp}
          onComplete={handleQuizSuccess}
        />
      )}
    </div>
  );
}
