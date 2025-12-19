"use client";

export function useSpeechInput(onText: (text: string) => void) {
  const startListening = () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      console.warn("❌ SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const result = event.results[0];
      if (!result) return;

      const transcript = result[0].transcript;
      console.log("🎤 User said:", transcript);
      onText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech error:", event.error);
    };

    recognition.start();
  };

  return { startListening };
}
