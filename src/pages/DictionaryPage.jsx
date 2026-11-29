import React, { useState, useMemo } from "react";
import { Search, Star, Volume2, BookOpen, Filter } from "lucide-react";
import { getAllWords } from "../data/curriculum";
import { AudioButton } from "../components/common/AudioButton";
import { Badge } from "../components/common/Badge";
import { useProgress } from "../context/ProgressContext";

export function DictionaryPage() {
  const { progress, toggleStarCard, allFlashcards } = useProgress();
  const curriculumWords = useMemo(() => getAllWords(), []);

  // Merge curriculum words and all flashcards (avoiding duplicates by german word)
  const combinedWords = useMemo(() => {
    const map = new Map();

    allFlashcards.forEach((card) => {
      map.set(card.german.toLowerCase(), {
        id: card.id,
        german: card.german,
        gender: card.article,
        article: card.article,
        english: card.english,
        plural: card.plural,
        exampleDe: card.exampleDe,
        exampleEn: card.exampleEn,
        level: card.level,
        unitTitle: card.unit
      });
    });

    curriculumWords.forEach((word) => {
      const key = word.german.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          ...word,
          article: word.gender
        });
      }
    });

    return Array.from(map.values());
  }, [allFlashcards, curriculumWords]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");

  const filteredWords = useMemo(() => {
    return combinedWords.filter((w) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        w.german.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.exampleDe && w.exampleDe.toLowerCase().includes(q));

      const matchLevel = selectedLevel === "all" || w.level === selectedLevel;

      const art = w.article || w.gender;
      const matchGender =
        selectedGender === "all" ||
        (selectedGender === "none" ? !art : art?.toLowerCase() === selectedGender.toLowerCase());

      return matchSearch && matchLevel && matchGender;
    });
  }, [combinedWords, searchQuery, selectedLevel, selectedGender]);

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Vocabulary Glossary
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search, listen to, and review German vocabulary across A1 to B2 plus all your flashcards.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in German or English (e.g. 'Tisch', 'table', 'Bahnhof')..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 mr-1">Level:</span>
            {["all", "A1", "A2", "B1", "B2"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLevel === lvl
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {lvl === "all" ? "All Levels" : lvl}
              </button>
            ))}
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 mr-1">Gender:</span>
            {["all", "der", "die", "das"].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedGender === g
                    ? g === "der"
                      ? "bg-blue-600 text-white"
                      : g === "die"
                      ? "bg-rose-600 text-white"
                      : g === "das"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {g === "all" ? "All" : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
        Found {filteredWords.length} words
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredWords.map((word) => {
          const isStarred = progress.starredCards?.includes(word.id);
          const article = word.article || word.gender;

          return (
            <div
              key={word.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {article ? (
                      <Badge gender={article} size="sm" />
                    ) : (
                      <Badge variant="outline" size="sm">
                        {word.partOfSpeech || "Word"}
                      </Badge>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {word.level}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleStarCard(word.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      isStarred
                        ? "text-amber-500"
                        : "text-slate-300 dark:text-slate-600 hover:text-slate-500"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isStarred ? "fill-amber-500" : ""}`} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {word.german}
                  {word.plural && word.plural !== "-" && (
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      (pl: {word.plural})
                    </span>
                  )}
                </h3>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  {word.english}
                </p>

                {word.exampleDe && (
                  <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                    "{word.exampleDe}"
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {word.unitTitle || "Vocabulary"}
                </span>
                <AudioButton
                  text={`${article ? article + " " : ""}${word.german}`}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
