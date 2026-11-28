import React, { useState, useMemo } from "react";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2, HelpCircle } from "lucide-react";
import { getLessonById } from "../data/curriculum";
import { AudioButton } from "../components/common/AudioButton";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { QuizEngine } from "../components/quiz/QuizEngine";
import { useProgress } from "../context/ProgressContext";

export function LessonPage({ lessonId, onBack, onCompleteLesson }) {
  const { progress, completeLesson, activeTargetLanguage } = useProgress();
  const lesson = getLessonById(lessonId, activeTargetLanguage);
  const [activeTab, setActiveTab] = useState("learn"); // "learn" | "quiz"

  const quizQuestions = useMemo(() => {
    if (lesson?.quiz && lesson.quiz.length > 0) return lesson.quiz;
    if (!lesson?.words || lesson.words.length === 0) return [];

    const allWords = lesson.words;
    return allWords.map((word, idx) => {
      const headword = word.word || word.german;
      const meaning = word.translation || word.english;
      const otherMeanings = allWords
        .filter((w) => (w.translation || w.english) !== meaning)
        .map((w) => w.translation || w.english);

      const defaultDistractors = ["Hello", "Goodbye", "Friend", "Thank you", "Please", "City", "Time", "House", "Day"];
      const pool = Array.from(new Set([...otherMeanings, ...defaultDistractors]));
      const options = [meaning];
      for (const d of pool) {
        if (!options.includes(d) && options.length < 4) {
          options.push(d);
        }
      }
      const shuffledOptions = [...options].sort((a, b) => (a.charCodeAt(0) % 3) - (b.charCodeAt(0) % 3));
      const correctIndex = shuffledOptions.indexOf(meaning);

      return {
        id: `quiz-gen-${lesson.id}-${idx}`,
        question: `What is the correct translation of "${headword}"?`,
        options: shuffledOptions,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: `"${headword}" means "${meaning}".`
      };
    });
  }, [lesson]);

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
            Knowledge Check Quiz ({quizQuestions.length} Qs)
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
              {(lesson.words || []).map((word) => {
                const headword = word.word || word.german;
                const meaning = word.translation || word.english;
                const sentence = word.example || word.exampleDe;
                const sentenceTr = word.englishSentence || word.exampleEn;

                return (
                  <div
                    key={word.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {word.gender && <Badge gender={word.gender} size="sm" />}
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {headword}
                        </span>
                        {word.plural && (
                          <span className="text-xs text-slate-400 font-medium">({word.plural})</span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {meaning}
                      </div>

                      {sentence && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                          "{sentence}"{" "}
                          {sentenceTr && (
                            <span className="opacity-75">— {sentenceTr}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <AudioButton text={headword} size="md" />
                    </div>
                  </div>
                );
              })}
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
          questions={quizQuestions}
          xpReward={lesson.xp}
          onComplete={handleQuizSuccess}
        />
      )}
    </div>
  );
}
