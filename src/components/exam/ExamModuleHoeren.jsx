import React, { useState, useEffect } from "react";
import {
  Headphones,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RotateCcw,
  Gauge,
  Sparkles,
  Mic,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play
} from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech";
import { Button } from "../common/Button";
import { splitGermanSentences } from "../../utils/textFormatting";
import { useExercise } from "../../context/ExerciseContext";

export function ExamModuleHoeren({ moduleData, answers = {}, onAnswerChange, isSubmitted }) {
  const exerciseState = useExercise();
  const registerExerciseContext = exerciseState?.registerExerciseContext;
  const clearExerciseContext = exerciseState?.clearExerciseContext;
  const updateExerciseContext = exerciseState?.updateExerciseContext;

  const [playCounts, setPlayCounts] = useState({});
  const [showScripts, setShowScripts] = useState({});
  const [activePlayingId, setActivePlayingId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
  const [shadowingSentence, setShadowingSentence] = useState(null); // { partKey, sentenceIdx, text }
  const [showVoiceTip, setShowVoiceTip] = useState(false);

  const { speak, stop, isSpeaking, hasGermanVoice, voiceSetupTip } = useSpeech({
    lang: "de-DE",
    rate: playbackSpeed
  });

  // Sync listening exercise context with ExerciseContext for ContextTutor
  useEffect(() => {
    if (!registerExerciseContext || !moduleData?.parts || moduleData.parts.length === 0) return;
    const p0 = moduleData.parts[0];
    const q0 = p0?.questions?.[0];
    registerExerciseContext({
      type: "hoeren",
      level: "A1",
      question: q0?.question || p0?.title || "Hörverstehen",
      passage: isSubmitted ? p0?.audioScript : "Hörverstehen task in progress. Note: transcript is hidden during active exam.",
      options: q0?.options || [],
      correctAnswer: q0 ? q0.options[q0.correctAnswer] : null,
      userAnswer: q0 && answers[q0.id] !== undefined ? q0.options[answers[q0.id]] : null,
      attemptCount: q0 && answers[q0.id] !== undefined ? 1 : 0
    });
  }, [moduleData, isSubmitted, registerExerciseContext]);

  useEffect(() => {
    return () => {
      if (clearExerciseContext) clearExerciseContext();
    };
  }, [clearExerciseContext]);

  const handleSelectAnswerOption = (q, optIdx) => {
    if (onAnswerChange) onAnswerChange(q.id, optIdx);
    if (updateExerciseContext) {
      updateExerciseContext({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: q.options[optIdx],
        attemptCount: 1
      });
    }
  };

  const handlePlayAudio = (partId, script, maxReplays = 2) => {
    const currentCount = playCounts[partId] || 0;

    // Check replay limit during active exam
    if (!isSubmitted && currentCount >= maxReplays) {
      return;
    }

    if (activePlayingId === partId && isSpeaking) {
      stop();
      setActivePlayingId(null);
      return;
    }

    stop();
    setActivePlayingId(partId);
    setShadowingSentence(null);
    setPlayCounts((prev) => ({
      ...prev,
      [partId]: (prev[partId] || 0) + 1
    }));
    speak(script, {
      rate: playbackSpeed,
      onEnd: () => setActivePlayingId(null)
    });
  };

  const handlePlaySentence = (partKey, sentenceIdx, sentenceText) => {
    const sentenceId = `${partKey}-s-${sentenceIdx}`;
    if (activePlayingId === sentenceId && isSpeaking) {
      stop();
      setActivePlayingId(null);
      return;
    }

    stop();
    setActivePlayingId(sentenceId);
    setShadowingSentence(null);
    speak(sentenceText, {
      rate: playbackSpeed,
      onEnd: () => setActivePlayingId(null)
    });
  };

  const handleShadowSentence = (partKey, sentenceIdx, sentenceText) => {
    const shadowId = `${partKey}-shadow-${sentenceIdx}`;
    stop();
    setActivePlayingId(shadowId);
    setShadowingSentence({ partKey, sentenceIdx, text: sentenceText });

    // Speak clearly at comfortable shadowing speed
    speak(sentenceText, {
      rate: Math.min(0.9, playbackSpeed),
      onEnd: () => {
        // Keep visual guidance active for learner to finish repeating
        setTimeout(() => {
          setActivePlayingId(null);
        }, 1200);
      }
    });
  };

  const toggleScript = (partId) => {
    // Only allow toggling transcript if exam is submitted
    if (!isSubmitted) return;
    setShowScripts((prev) => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  if (!moduleData) return null;

  return (
    <div className="space-y-8">
      {/* Voice Warning Banner (if no German voice detected in browser) */}
      {!hasGermanVoice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{voiceSetupTip.title}</span>
            </div>
            <button
              onClick={() => setShowVoiceTip(!showVoiceTip)}
              className="text-xs font-black underline hover:no-underline"
            >
              {showVoiceTip ? "Hide Setup Guide" : "Voice Setup Instructions"}
            </button>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {voiceSetupTip.message} For authentic Goethe listening comprehension practice, install a de-DE voice pack:
          </p>
          {showVoiceTip && (
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
              {voiceSetupTip.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Module Overview Banner & Global Speed Control */}
      <div className="p-4 sm:p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-sky-500 text-white shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {moduleData.title} • {moduleData.points} Punkte
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {moduleData.description} (Transcript strictly hidden during exam).
            </p>
          </div>
        </div>

        {/* Playback Speed Controller */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-sky-900 shadow-2xs self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 uppercase font-black px-2 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-sky-500" />
            Speed:
          </span>
          {[0.75, 0.95, 1.15].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => {
                setPlaybackSpeed(speed);
                if (isSpeaking) stop();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${playbackSpeed === speed
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              {speed === 0.95 ? "1.0x" : `${speed}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Parts */}
      {moduleData.parts.map((part, pIdx) => {
        const partKey = `part-${pIdx}`;
        const isPartPlaying = activePlayingId === partKey && isSpeaking;
        const timesPlayed = playCounts[partKey] || 0;
        const replayLimit = part.maxReplays || moduleData.maxReplays || 2;
        const isReplayLimitReached = !isSubmitted && timesPlayed >= replayLimit;

        // Break transcript into individual sentences for sentence-level replay
        const sentences = splitGermanSentences(part.audioScript);

        return (
          <div
            key={pIdx}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5"
          >
            {/* Part Header & Audio Controller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {part.title}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {part.instructions}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span>
                    Played: <strong className="text-slate-700 dark:text-slate-300">{timesPlayed}</strong> / {replayLimit} allowed
                  </span>
                  {isReplayLimitReached && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Replay limit reached
                    </span>
                  )}
                </div>
              </div>

              {/* Audio Play Button Bar */}
              <div className="flex items-center gap-2">
                <Button
                  variant={isPartPlaying ? "danger" : "primary"}
                  size="sm"
                  disabled={isReplayLimitReached && !isPartPlaying}
                  onClick={() => handlePlayAudio(partKey, part.audioScript, replayLimit)}
                  className={
                    !isPartPlaying
                      ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sm disabled:opacity-50"
                      : ""
                  }
                >
                  {isPartPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-1.5" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-1.5" />
                      {timesPlayed === 0
                        ? "Audio abspielen"
                        : `Wiederholen (${timesPlayed}/${replayLimit})`}
                    </>
                  )}
                </Button>

                {/* Transcript strictly hidden until exam is submitted */}
                {isSubmitted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleScript(partKey)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {showScripts[partKey] ? (
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 mr-1" />
                    )}
                    Script ({showScripts[partKey] ? "Verstecken" : "Anzeigen"})
                  </Button>
                )}
              </div>
            </div>

            {/* Audio Transcript View (strictly visible only after submit) */}
            {isSubmitted && showScripts[partKey] && (
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed space-y-2">
                <div className="flex items-center gap-2 not-italic font-black text-sky-700 dark:text-sky-300 text-xs uppercase tracking-wider">
                  <Headphones className="w-3.5 h-3.5" />
                  Offizieller Hörtext (Audio Script):
                </div>
                <p>"{part.audioScript}"</p>
              </div>
            )}

            {/* Sentence-Level Replay & Shadowing Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Sentence-Level Replay & Shadowing ({sentences.length} Sentences)
                </span>
                <span className="text-[10px] text-slate-400">
                  Listen & repeat aloud
                </span>
              </div>

              {/* Shadowing Active Notice */}
              {shadowingSentence?.partKey === partKey && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Mic className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Shadowing Mode: Repeat immediately after hearing:</span>
                  </div>
                  <p className="font-semibold italic pl-5">
                    "{shadowingSentence.text}"
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {sentences.map((sent, sIdx) => {
                  const sentId = `${partKey}-s-${sIdx}`;
                  const isSentPlaying = activePlayingId === sentId && isSpeaking;
                  const isSentShadowing =
                    activePlayingId === `${partKey}-shadow-${sIdx}` && isSpeaking;

                  return (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black flex items-center justify-center text-slate-500">
                          {sIdx + 1}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {isSubmitted ? sent : `Sentence ${sIdx + 1} (Audio)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Sentence Replay Button */}
                        <button
                          type="button"
                          onClick={() => handlePlaySentence(partKey, sIdx, sent)}
                          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${isSentPlaying
                            ? "bg-rose-500 text-white"
                            : "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100"
                            }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{isSentPlaying ? "Stop" : "Replay"}</span>
                        </button>

                        {/* Shadow This Sentence Button */}
                        <button
                          type="button"
                          onClick={() => handleShadowSentence(partKey, sIdx, sent)}
                          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${isSentShadowing
                            ? "bg-amber-500 text-white animate-pulse"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                            }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>Shadow</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4 pt-1">
              {part.questions.map((q, qIdx) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctAnswer;
                const isAnswered = selected !== undefined;

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {qIdx + 1}. {q.question}
                      </p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {q.points} Pkt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selected === optIdx;
                        const isThisCorrect = optIdx === q.correctAnswer;

                        let btnStyle =
                          "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-sky-400";
                        if (isSelected) {
                          btnStyle =
                            "border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 font-bold";
                        }
                        if (isSubmitted) {
                          if (isThisCorrect) {
                            btnStyle =
                              "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 font-bold";
                          } else if (isSelected) {
                            btnStyle =
                              "border-rose-500 bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 font-bold";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswerOption(q, optIdx)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm text-left transition-all ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations & Distractor Rationales (Revealed after Submit) */}
                    {isSubmitted && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        {isAnswered && !isCorrect && (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>Warum deine Antwort falsch ist:</span>
                            </div>
                            <p className="pl-5 text-slate-700 dark:text-slate-300">
                              {q.distractorRationale?.[selected] ||
                                q.distractorRationale?.[String(selected)] ||
                                "Diese Option widerspricht den Angaben in der Audiodurchsage."}
                            </p>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              Richtige Lösung ({String.fromCharCode(65 + q.correctAnswer)}: "{q.options[q.correctAnswer]}"):
                            </span>
                          </div>
                          <p className="pl-5 text-slate-700 dark:text-slate-300">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
