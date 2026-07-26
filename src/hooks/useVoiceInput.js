"use client";
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useVoiceInput — Reusable Web Speech API hook
 *
 * Returns:
 *   isRecording   — bool: mic is active
 *   interimText   — string: live in-flight words (grey in UI)
 *   finalText     — string: committed transcript so far
 *   error         — string | null: permission-denied / unsupported / etc.
 *   startRecording()
 *   stopRecording()
 *   toggleRecording()
 *   clearTranscript()
 */
export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  // accumulates finalised results across pause restarts
  const accumulatedRef = useRef("");

  // Check browser support once on mount
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const buildRecognition = useCallback(() => {
    if (!isSupported) return null;
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true;       // keep going past natural pauses
    r.interimResults = true;   // fire events as words arrive
    r.lang = "en-IN";          // good for Indian-accented English

    r.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedRef.current += t + " ";
          setFinalText(accumulatedRef.current.trim());
        } else {
          interim += t;
        }
      }
      setInterimText(interim);
    };

    r.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Microphone access denied. Please allow mic permissions and try again.");
      } else if (event.error === "no-speech") {
        // silently ignore — happens after silence, recognition will restart
      } else if (event.error === "aborted") {
        // user-initiated stop, ignore
      } else {
        setError(`Voice recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    r.onend = () => {
      // If we're still supposed to be recording (e.g. browser stopped after
      // a long pause), restart automatically
      if (recognitionRef.current && isRecording) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    };

    return r;
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError(null);
    // Build fresh recognition instance
    const r = buildRecognition();
    if (!r) return;
    recognitionRef.current = r;

    try {
      r.start();
      setIsRecording(true);
    } catch (e) {
      setError("Could not start microphone: " + e.message);
    }
  }, [isSupported, buildRecognition]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setInterimText("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const clearTranscript = useCallback(() => {
    accumulatedRef.current = "";
    setFinalText("");
    setInterimText("");
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  return {
    isRecording,
    interimText,
    finalText,
    error,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
  };
}
