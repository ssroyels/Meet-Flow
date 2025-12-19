export const speakText = (
  text: string,
  lang: "en-US" | "hi-IN" = "en-US"
) => {
  if (!("speechSynthesis" in window)) return;

  // Purani aawaaz band
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};
