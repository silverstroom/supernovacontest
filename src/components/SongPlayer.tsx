import { useState, useRef } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface SongPlayerProps {
  title: string;
  url: string;
  index: number;
}

const getEmbedUrl = (url: string): string | null => {
  // YouTube
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  // SoundCloud - use widget
  if (url.includes("soundcloud.com")) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&color=%23e84393`;
  }

  // Spotify (handle /intl-xx/ paths too)
  const spMatch = url.match(/spotify\.com\/(?:intl-\w+\/)?track\/([\w]+)/);
  if (spMatch) return `https://open.spotify.com/embed/track/${spMatch[1]}`;

  // Bandcamp
  if (url.includes("bandcamp.com")) {
    return null; // Bandcamp doesn't support simple embeds without track ID, use external link
  }

  return null;
};

const SongPlayer = ({ title, url, index }: SongPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-display text-muted-foreground w-5">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {title || `Brano ${index}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {embedUrl && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </motion.button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      {isPlaying && embedUrl && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="rounded-lg overflow-hidden ml-8"
        >
          <iframe
            src={embedUrl}
            width="100%"
            height={url.includes("soundcloud") ? 166 : url.includes("spotify") ? 80 : 200}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="rounded-lg"
          />
        </motion.div>
      )}
    </div>
  );
};

export default SongPlayer;
