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

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`, height: 200 };

  // SoundCloud
  if (url.includes("soundcloud.com")) {
    return {
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e84393&auto_play=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&visual=false`,
      height: 166,
    };
  }

  // Spotify (handle /intl-xx/ paths)
  const spMatch = url.match(/spotify\.com\/(?:intl-\w+\/)?track\/([\w]+)/);
  if (spMatch) return { embedUrl: `https://open.spotify.com/embed/track/${spMatch[1]}?theme=0`, height: 80 };

  // Bandcamp
  if (url.includes("bandcamp.com")) {
    // Bandcamp requires specific embed IDs we don't have, so use iframe with full page
    return null;
  }

  // Mixcloud
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
    <div className="space-y-2">
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
        <div className="flex items-center gap-1.5 shrink-0">
          {embedInfo ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isPlaying 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              }`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
            </motion.button>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
              title="Ascolta su piattaforma esterna"
            >
              <Music size={13} />
            </a>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
      <AnimatePresence>
        {isPlaying && embedInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: embedInfo.height + 8, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg overflow-hidden ml-8"
          >
            <iframe
              src={embedInfo.embedUrl}
              width="100%"
              height={embedInfo.height}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SongPlayer;
