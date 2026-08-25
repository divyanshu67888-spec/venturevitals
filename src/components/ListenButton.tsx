import { useState, useRef, useCallback } from "react";
import { Volume2, Loader2, Square } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ListenButtonProps {
  text: string;
  label?: string;
}

const ListenButton = ({ text, label = "Listen" }: ListenButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = useCallback(async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // First, check if the function exists and the key is valid by calling a smoke test
      // Since it's a binary response, we'll use regular fetch with error parsing
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `TTS request failed with status ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("TTS error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to play audio.";
      toast({ 
        title: "Speech Error", 
        description: errorMessage.includes("ELEVENLABS_API_KEY") 
          ? "ElevenLabs API key is missing or invalid in Supabase secrets." 
          : errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, text]);

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPlaying ? (
        <Square className="w-3.5 h-3.5 text-primary" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {isPlaying ? "Stop" : label}
    </button>
  );
};

export default ListenButton;
