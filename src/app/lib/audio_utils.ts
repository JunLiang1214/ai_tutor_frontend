
export const getAudio = async (text: string) => {
  try {
    console.log("getting audio --------------------------");
    const response = await fetch("http://127.0.0.1:8000/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.blob();
    if (!response.ok) {
      console.log("---------------------------------------- error 184");
    }
    if (data ){
        const audioUrl = URL.createObjectURL(data)
        return audioUrl;
    } 
  } catch (error) {
    console.error("error", error);
  }
};

export const playAudio = async (audio_path: string) => {
  const audio = new Audio(audio_path);
  return new Promise((resolve, reject) => {
    audio.onended = resolve;
    audio.onerror = reject;
    audio.play();
  });
};
