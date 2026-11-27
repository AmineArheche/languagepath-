import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Play,
  Square,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  SplitSquareVertical,
  Layers,
  Activity,
  Award
} from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech";
import {
  computeSpeakingMetrics,
  transcribeAudioWithGemini,
  evaluateSpeaking,
  computeShadowingAccuracy
} from "../../services/aiSpeakingService";
import { getRubric } from "../../data/rubrics/index";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { playSound } from "../../utils/soundEffects";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useProgress } from "../../context/ProgressContext";

/**
 * Interactive ExamModuleSprechen
 *
 * Flow:
 * 1. Task Card (Prompt Audio + Guidelines + Timer Specs)
 * 2. Prep Timer (30s Countdown with Skip option)
 * 3. Record (Web Speech API de-DE or MediaRecorder with explicit consent toggle)
 * 4. Transcript & Local Speech Metrics (WPM, pause count, fillers, sentence length, Nebensätze, verb-end accuracy)
 * 5. Official Exam Rubric Evaluation (Estimate Only label + approximate pronunciation notice)
 * 6. Shadowing Mode (0.75x slow playback, re-record, side-by-side transcript comparison)
 */
export function ExamModuleSprechen({
  moduleData,
  answers = {},
  onAnswerChange,
  isSubmitted,
  level = "A1",
  rubricInstitution = "goethe"
}) {
  const { speak, stop, isSpeaking } = useSpeech({ lang: "de-DE", rate: 0.95 });
  const progressContext = useProgress?.();
  const recordError = progressContext?.recordError;
  const [cloudConsent, setCloudConsent] = useLocalStorage("deutschpath_cloud_audio_consent", false);
  const [geminiApiKey] = useLocalStorage("deutschpath_gemini_api_key", "");

  // Active sub-part index in oral exam
  const [activePartIdx, setActivePartIdx] = useState(0);

  // Flow State: "idle" | "prep" | "recording" | "transcribed" | "evaluating" | "feedback"
  const [flowState, setFlowState] = useState("idle");
  const [prepTimeLeft, setPrepTimeLeft] = useState(30);

  // Recording & Transcription state
  const [transcript, setTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isMicAvailable, setIsMicAvailable] = useState(true);
  const [micErrorMessage, setMicErrorMessage] = useState(null);

  // Speech Recognition vs MediaRecorder
  const [speechRecSupported, setSpeechRecSupported] = useState(false);
  const speechRecognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const prepTimerRef = useRef(null);
  const startRecordingRef = useRef(null);
  const speechTimestampsRef = useRef([]);

  // Evaluation & Local Metrics
  const [metrics, setMetrics] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Shadowing Mode State
  const [shadowingState, setShadowingState] = useState("idle"); // "idle" | "playing" | "recording" | "compared"
  const [shadowingTranscript, setShadowingTranscript] = useState("");
  const [shadowingComparison, setShadowingComparison] = useState(null);

  const activeRubric = getRubric(rubricInstitution, level, "speaking");
  const parts = moduleData?.parts || [];
  const currentPart = parts[activePartIdx] || parts[0];

  // Detect Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        setSpeechRecSupported(true);
      }
    }
  }, []);

  // Prep Countdown Timer
  useEffect(() => {
    if (flowState === "prep") {
      if (prepTimeLeft <= 0) {
        startRecordingRef.current?.();
        return;
      }
      prepTimerRef.current = setTimeout(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(prepTimerRef.current);
    }
  }, [flowState, prepTimeLeft]);

  // Recording Timer
  useEffect(() => {
    if (flowState === "recording") {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(recordingTimerRef.current);
    }
  }, [flowState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
    };
  }, []);

  const handleStartPrep = () => {
    setMicErrorMessage(null);
    setFlowState("prep");
    setPrepTimeLeft(20);
    setTranscript("");
    setMetrics(null);
    setEvaluationResult(null);
    setShadowingComparison(null);
    playSound.correct();
  };

  const handleSkipPrep = () => {
    if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
    startRecording();
  };

  async function startRecording() {
    startRecordingRef.current = startRecording;
    setFlowState("recording");
    setRecordingSeconds(0);
    speechTimestampsRef.current = [];
    audioChunksRef.current = [];

    // Approach A: Native Web Speech API
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = "de-DE";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let currentSessionText = "";
          const now = Date.now() / 1000;
          for (let i = 0; i < event.results.length; i++) {
            currentSessionText += event.results[i][0].transcript;
          }
          setTranscript(currentSessionText);
          speechTimestampsRef.current.push({ start: now - 1, end: now });
        };

        recognition.onerror = (e) => {
          console.warn("SpeechRecognition error:", e.error);
          if (e.error === "not-allowed" || e.error === "permission-denied") {
            setIsMicAvailable(false);
            setMicErrorMessage("Microphone permission was denied. Please allow microphone access in your browser settings.");
            setFlowState("idle");
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        playSound.correct();
        return;
      } catch (err) {
        console.warn("SpeechRec start failed, falling back to MediaRecorder:", err);
      }
    }

    // Approach B: MediaRecorder fallback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250);
        playSound.correct();
      } catch (err) {
        console.warn("MediaRecorder mic access denied:", err);
        setIsMicAvailable(false);
        setMicErrorMessage("Could not access microphone. Please check browser permissions.");
        setFlowState("idle");
      }
    } else {
      setIsMicAvailable(false);
      setMicErrorMessage("Audio recording is not supported on this browser.");
      setFlowState("idle");
    }
  };

  const handleStopRecording = async () => {
    setFlowState("evaluating");

    // Stop Web Speech
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    // Stop MediaRecorder & process audio if applicable
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();

      // If no Web Speech transcript was produced, attempt cloud transcription if consented
      if (!transcript.trim()) {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (cloudConsent && geminiApiKey) {
            const cloudRes = await transcribeAudioWithGemini(audioBlob, geminiApiKey, "gemini-1.5-flash", true);
            setTranscript(cloudRes.transcript);
          }
        } catch (err) {
          console.warn("Cloud transcription notice:", err.message);
        }
      }
    }

    // Small delay to collect final results
    setTimeout(async () => {
      const finalTranscript = transcript.trim();
      const duration = Math.max(2, recordingSeconds);

      // Compute local metrics
      const computedMetrics = computeSpeakingMetrics(
        finalTranscript,
        duration,
        speechTimestampsRef.current
      );
      setMetrics(computedMetrics);

      // Evaluate against official speaking rubric
      const evalRes = await evaluateSpeaking({
        transcript: finalTranscript,
        level,
        taskTitle: currentPart?.title || "Mündliche Prüfung",
        promptAudio: currentPart?.promptAudio || "",
        guidelines: currentPart?.guidelines || [],
        rubricInstitution,
        durationSeconds: duration,
        metrics: computedMetrics,
        apiKey: geminiApiKey
      });

      setEvaluationResult(evalRes);
      setFlowState("feedback");
      playSound.fanfare();

      if (computedMetrics.verbEndAccuracy.total > 0 && computedMetrics.verbEndAccuracy.accuracyPercent < 100 && recordError) {
        recordError({
          module: "sprechen",
          level,
          category: "verb-position",
          subcategory: "verb-end",
          learnerText: finalTranscript,
          correct: "Finite verb placed at the end of subordinate clause (Nebensatz)",
          ruleId: "nebensatz-verb-end",
          itemId: currentPart?.title || "speaking-task"
        });
      }

      if (onAnswerChange) {
        onAnswerChange(`sp_${activePartIdx}`, {
          transcript: finalTranscript,
          overall: evalRes.overall,
          metrics: computedMetrics
        });
      }
    }, 600);
  };

  // Shadowing Mode Execution
  const handlePlayShadowingSentence = (text) => {
    setShadowingState("playing");
    speak(text, {
      rate: 0.75, // slow rate as requested
      onEnd: () => setShadowingState("idle")
    });
  };

  const handleStartShadowingRecord = async () => {
    setShadowingState("recording");
    setShadowingTranscript("");
    setShadowingComparison(null);

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = "de-DE";
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (e) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          setShadowingTranscript(text);
        };

        rec.onend = () => {
          // Compare with model sentence
          const targetSentence = evaluationResult?.correctedSentence || currentPart?.modelAnswer || "";
          const comparison = computeShadowingAccuracy(targetSentence, shadowingTranscript);
          setShadowingComparison(comparison);
          setShadowingState("compared");
          playSound.correct();
        };

        rec.start();
        playSound.correct();
      } catch (err) {
        console.warn("Shadowing speech rec error:", err);
        setShadowingState("idle");
      }
    } else {
      setShadowingState("idle");
      alert("Speech recognition is required for real-time shadowing comparison.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xl shadow-rose-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
              Mündliche Prüfung &bull; Level {level}
            </span>
            <span className="text-xs font-bold text-rose-100">
              Rubric: {activeRubric.institution} ({activeRubric.maxPoints} Pkt)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {moduleData?.title || "Sprechen (Speaking Module)"}
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl leading-relaxed mt-1">
            Practice realistic German oral exam tasks with audio examiner prompts, speech capture, instant local metrics, and shadowing drills.
          </p>
        </div>

        {/* Audio Cloud Consent Toggle */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 p-3 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <input
              id="cloud-consent"
              type="checkbox"
              checked={cloudConsent}
              onChange={(e) => setCloudConsent(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="cloud-consent" className="font-bold cursor-pointer select-none">
              Allow Gemini Cloud Audio STT
            </label>
          </div>
          <span className="text-[10px] text-rose-200">
            {cloudConsent ? "Explicit consent granted (never uploaded silently)" : "Local browser STT only"}
          </span>
        </div>
      </div>

      {/* Mic Error Notice */}
      {micErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Microphone Notice: </span>
            <span>{micErrorMessage}</span>
          </div>
        </div>
      )}

      {/* Part Tabs */}
      {parts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {parts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActivePartIdx(idx);
                setFlowState("idle");
                setEvaluationResult(null);
                setMetrics(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePartIdx === idx
                  ? "bg-rose-500 text-white shadow-2xs"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-rose-400"
              }`}
            >
              Teil {idx + 1}: {p.title?.slice(0, 24)}...
            </button>
          ))}
        </div>
      )}

      {/* 1. TASK CARD */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {currentPart?.title}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Mündliche Aufgabenstellung
            </h3>
          </div>

          {currentPart?.promptAudio && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => speak(currentPart.promptAudio)}
              icon={Volume2}
              className="text-xs"
            >
              Prüfer anhören (Examiner Prompt)
            </Button>
          )}
        </div>

        {/* Guidelines / Leitpunkte */}
        {currentPart?.guidelines && (
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
              Required Speaking Points (Leitpunkte):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentPart.guidelines.map((guide, gIdx) => (
                <div
                  key={gIdx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  &bull; {guide}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Start Prep Timer */}
        {flowState === "idle" && (
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Prep time: 20 seconds &bull; Speaking target: 60-90 words
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartPrep}
              icon={Mic}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-sm"
            >
              Start Task (Begin Preparation)
            </Button>
          </div>
        )}
      </div>

      {/* 2. PREP TIMER */}
      {flowState === "prep" && (
        <Card className="p-6 text-center space-y-4 border-2 border-amber-400 dark:border-amber-600 animate-in fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Preparation Time (Vorbereitungszeit)</span>
          </div>

          <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
            00:{prepTimeLeft < 10 ? `0${prepTimeLeft}` : prepTimeLeft}
          </div>

          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gather your thoughts and organize your speaking points. Recording will begin automatically when the timer reaches zero.
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={handleSkipPrep}
            icon={Play}
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold"
          >
            Skip Prep &amp; Start Speaking Now
          </Button>
        </Card>
      )}

      {/* 3. RECORDING WORKSPACE */}
      {flowState === "recording" && (
        <Card className="p-6 text-center space-y-4 border-2 border-rose-500 dark:border-rose-600 animate-pulse">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>Recording Active (Sprechen Sie jetzt auf Deutsch)</span>
          </div>

          <div className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono">
            00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
          </div>

          {/* Real-time transcript preview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-h-[80px] text-xs sm:text-sm text-slate-800 dark:text-slate-100 text-left leading-relaxed">
            {transcript || (
              <span className="text-slate-400 italic">
                Listening for spoken German... Speak clearly into your microphone.
              </span>
            )}
          </div>

          <Button
            variant="danger"
            size="lg"
            onClick={handleStopRecording}
            icon={Square}
            className="font-extrabold shadow-md"
          >
            Finish Speaking &amp; Evaluate
          </Button>
        </Card>
      )}

      {/* 4. EVALUATING LOADING */}
      {flowState === "evaluating" && (
        <Card className="p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Analyzing Spoken German &amp; Local Metrics...
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Computing words per minute, pause gaps, hesitation fillers, subordinate clause verb-end accuracy, and scoring against the {activeRubric.institution} rubric.
          </p>
        </Card>
      )}

      {/* 5. FEEDBACK & LOCAL METRICS SECTION */}
      {flowState === "feedback" && evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Estimated Score Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xl shadow-rose-500/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {activeRubric.institution} &bull; Mündlich {level}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/20 text-rose-100 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-300" />
                    Estimated Score Only
                  </span>
                  {evaluationResult.isOffline && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/25">
                      Basic Check (Offline)
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black">Oral Performance Assessment</h3>
                <p className="text-xs sm:text-sm text-rose-50 max-w-lg leading-relaxed">
                  {evaluationResult.feedback}
                </p>
              </div>

              {/* Score Display */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 min-w-[125px] text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">
                  Estimated Score
                </span>
                <div className="text-3xl sm:text-4xl font-black mt-0.5">
                  {evaluationResult.overall}
                  <span className="text-base opacity-80 font-bold">
                    /{evaluationResult.rubricMaxPoints || activeRubric.maxPoints || 25}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-rose-100 opacity-90">
                  (estimate only)
                </span>
              </div>
            </div>
          </div>

          {/* Honest Pronunciation Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Notice on Pronunciation: </span>
              <span>{evaluationResult.pronunciationDisclaimer}</span>
            </div>
          </div>

          {/* Captured Transcript with word count */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-slate-400">
                Transcribed German Speech
              </span>
              <span className="font-bold text-slate-500">
                {metrics?.wordCount || 0} Words in {metrics?.durationSeconds || 0}s
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text">
              "{transcript || "No speech recorded."}"
            </p>
          </Card>

          {/* LOCAL SPEECH METRICS GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Acoustic &amp; Linguistic Speaking Metrics</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {/* 1. WPM */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Pace</span>
                <div className="text-lg font-black text-rose-400">
                  {metrics?.wordsPerMinute || 0} <span className="text-[10px] text-slate-400">WPM</span>
                </div>
                <span className="text-[10px] text-slate-400">Target: 70-120</span>
              </div>

              {/* 2. Pause Count */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Pauses</span>
                <div className="text-lg font-black text-slate-100">
                  {metrics?.pauseCount || 0}
                </div>
                <span className="text-[10px] text-slate-400">&gt;1.2s gaps</span>
              </div>

              {/* 3. Filler Words */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Fillers (äh, ähm)</span>
                <div className="text-lg font-black text-amber-400">
                  {metrics?.fillers?.count || 0}
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {metrics?.fillers?.words?.join(", ") || "none"}
                </span>
              </div>

              {/* 4. Sentence Length */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Sentence</span>
                <div className="text-lg font-black text-slate-100">
                  {metrics?.averageSentenceLength || 0} <span className="text-[10px] text-slate-400">w/s</span>
                </div>
                <span className="text-[10px] text-slate-400">Sentence depth</span>
              </div>

              {/* 5. Subordinate Clauses */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Nebensätze</span>
                <div className="text-lg font-black text-indigo-400">
                  {metrics?.subordinateClausesUsed?.count || 0}
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {metrics?.subordinateClausesUsed?.list?.join(", ") || "none"}
                </span>
              </div>

              {/* 6. Verb-End Accuracy */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Verb-End Acc</span>
                <div className="text-lg font-black text-emerald-400">
                  {metrics?.verbEndAccuracy?.accuracyPercent || 100}%
                </div>
                <span className="text-[10px] text-slate-400">
                  {metrics?.verbEndAccuracy?.correct || 0}/{metrics?.verbEndAccuracy?.total || 0} clauses
                </span>
              </div>
            </div>
          </div>

          {/* Official Rubric Criteria Breakdown */}
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" />
              <span>{activeRubric.institution} Oral Examination Criteria</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {evaluationResult.criteria.map((c, cIdx) => (
                <div
                  key={cIdx}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {c.name}
                    </span>
                    <span className="font-black text-rose-600 dark:text-rose-400">
                      {c.score} / {c.max} Pkt
                    </span>
                  </div>

                  {c.evidence && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Observation: </strong>{c.evidence}
                    </p>
                  )}

                  {c.fix && (
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                      <strong>Improvement Tip: </strong>{c.fix}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* 6. SHADOWING MODE */}
          <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Shadowing Mode (Aussprache &amp; Intonationstraining)
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Listen at Slow Rate (0.75x) &amp; Repeat Aloud
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    handlePlayShadowingSentence(
                      evaluationResult.correctedSentence || currentPart?.modelAnswer || ""
                    )
                  }
                  icon={Volume2}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm"
                >
                  {shadowingState === "playing" ? "Playing..." : "Play Model (0.75x Slow)"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={shadowingState === "recording"}
                  onClick={handleStartShadowingRecord}
                  icon={Mic}
                  className="font-extrabold"
                >
                  {shadowingState === "recording" ? "Recording..." : "Record Shadowing"}
                </Button>
              </div>
            </div>

            {/* Target model sentence to shadow */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-900 text-xs sm:text-sm font-medium text-white leading-relaxed">
              "{evaluationResult.correctedSentence || currentPart?.modelAnswer || "Guten Tag! Ich möchte mich gerne vorstellen."}"
            </div>

            {/* Side-by-side transcripts comparison */}
            {shadowingComparison && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    Shadowing Accuracy Comparison
                  </span>
                  <span className="font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {shadowingComparison.accuracyPercent}% Word Match
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Target Model Sentence
                    </span>
                    <p className="leading-relaxed">
                      {shadowingComparison.diffWords.map((item, idx) => (
                        <span
                          key={idx}
                          className={`inline-block mx-0.5 px-1 py-0.2 rounded ${
                            item.matched
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                          }`}
                        >
                          {item.word}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Your Shadowing Recording
                    </span>
                    <p className="leading-relaxed text-slate-800 dark:text-slate-100">
                      "{shadowingTranscript || "No speech captured."}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset / Try Again Button */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setFlowState("idle");
                setEvaluationResult(null);
                setMetrics(null);
              }}
              icon={RotateCcw}
            >
              Practice This Part Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
