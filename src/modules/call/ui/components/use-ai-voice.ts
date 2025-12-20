"use client";

let voicesLoaded = false;

export const useAIVoice = () => {
  const ensureVoices = () => {
    return new Promise<void>((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        voicesLoaded = true;
        resolve();
        return;
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voicesLoaded = true;
        resolve();
      };
    });
  };

  const speak = async (text: string, lang = "en-US") => {
    console.log("satya",text);
    if (!text) return;

    // 🔥 HARD RESET
    window.speechSynthesis.cancel();

    // 🔥 CRITICAL: ensure voices loaded
    if (!voicesLoaded) {
      await ensureVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log("🔊 AI speaking started");
    };

    utterance.onend = () => {
      console.log("✅ AI finished speaking");
    };

    utterance.onerror = (e) => {
      console.error("❌ Speech synthesis error:", e);
    };

    // 🔥 MUST BE CALLED
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
};
