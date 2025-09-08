"use client";

import MusicPlayer from "@/components/music-player";
import { useAudioContext } from "@/hooks/use-audio-context";

export default function MusicPanel() {
  const { audioContext, isAudioReady } = useAudioContext();
  return (
    <div className="p-4">
      <MusicPlayer audioContext={audioContext} isReady={isAudioReady} />
    </div>
  );
}
