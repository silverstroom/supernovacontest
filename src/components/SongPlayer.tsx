import { useState } from "react";
import { Play, Pause, ExternalLink, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SongPlayerProps {
  title: string;
  url: string;
  index: number;
}

const getEmbedInfo = (url: string): { embedUrl: string; height: number } | null => {
  if (!url) return null;

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`, height: 200 };

  if (url.includes("soundcloud.com")) {
    return {
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e84393&auto_play=true&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&visual=false`,
      height: 166,
    };
  }

  const spMatch = url.match(/spotify\.com\/(?:intl-\w+\/)?track\/([\w]+)/);
  if (spMatch) return { embedUrl: `https://open.spotify.com/embed/track/${spMatch[1]}?theme=0`, height: 80 };

  if (url.includes("bandcamp.com")) return null;

  if (url.includes("mixcloud.com")) {
    return {
      embedUrl: `https://player-widget.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(url)}&hide_cover=1&mini=1`,
      height: 60,
    };
  }

  return null;
};

const getPlatformName = (url: string): string => {
  if (url.includes("spotify")) return "Spotify";
  if (url.includes("soundcloud")) return "SoundCloud";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("bandcamp")) return "Bandcamp";
  if (url.includes("mixcloud")) return "Mixcloud";
  return "Link";
};

const getPlatformColor = (url: string): string => {
  if (url.includes("spotify")) return "bg-[hsl(141,73%,42%)]/20 text-[hsl(141,73%,52%)]";
  if (url.includes("soundcloud")) return "bg-[hsl(18,100%,50%)]/20 text-[hsl(18,100%,60%)]";
  if (url.includes("youtube") || url.includes("youtu.be")) return "bg-[hsl(0,100%,50%)]/20 text-[hsl(0,100%,65%)]";
  if (url.includes("bandcamp")) return "bg-[hsl(195,80%,50%)]/20 text-[hsl(195,80%,60%)]";
  return "bg-muted text-muted-foreground";
};

const SongPlayer = ({ title, url, index }: SongPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedInfo = getEmbedInfo(url);
  const platform = getPlatformName(url);
  const platformColor = getPlatformColor(url);

  if (!url) return null;

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-display text-muted-foreground font-bold w-5 shrink-0">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {title || `Brano ${index}`}
          </p>
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md mt-0.5 font-medium ${platformColor}`}>
            {platform}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {embedInfo ? (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isPlaying 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-primary/20 text-primary active:bg-primary/30"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? "pause" : "play"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary active:bg-primary/30 transition-colors"
            >
              <Music size={15} />
            </a>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground active:text-foreground transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <AnimatePresence>
        {isPlaying && embedInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: embedInfo.height + 8, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-xl overflow-hidden ml-8"
          >
            <iframe
              src={embedInfo.embedUrl}
              width="100%"
              height={embedInfo.height}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SongPlayer;
