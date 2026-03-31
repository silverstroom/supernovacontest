import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, User, Users } from "lucide-react";
import type { Artist } from "@/types/artist";
import StarRating from "./StarRating";
import SongPlayer from "./SongPlayer";

interface ArtistCardProps {
  artist: Artist;
  onRate: (artistId: string, rating: number) => void;
  onClearRating?: (artistId: string) => void;
  onToggleFavorite?: (artistId: string) => void;
  isFavorite?: boolean;
  index: number;
}

const ArtistCard = ({ artist, onRate, onClearRating, onToggleFavorite, isFavorite, index }: ArtistCardProps) => {
  const songs = [
    { title: "Brano 1", url: artist.song1_url },
    { title: "Brano 2", url: artist.song2_url },
    { title: "Brano 3", url: artist.song3_url },
  ].filter((s) => s.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="glass glass-hover rounded-2xl p-5 gradient-border active:scale-[0.98] transition-transform"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-display font-semibold text-foreground truncate">
            {artist.name}
          </h3>
        </div>
        {onToggleFavorite && (
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggleFavorite(artist.id)}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0 ml-3 active:bg-secondary/80"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFavorite ? "filled" : "empty"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Heart
                  size={18}
                  className={isFavorite 
                    ? "fill-primary text-primary" 
                    : "text-muted-foreground"
                  }
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs text-muted-foreground">
        {artist.referent_name && (
          <span className="flex items-center gap-1.5">
            <User size={12} /> {artist.referent_name}
          </span>
        )}
        {artist.email && (
          <a href={`mailto:${artist.email}`} className="flex items-center gap-1.5 active:text-foreground transition-colors">
            <Mail size={12} /> {artist.email}
          </a>
        )}
        {artist.members && (
          <span className="flex items-center gap-1.5">
            <Users size={12} /> {artist.members} componenti
          </span>
        )}
      </div>

      {/* Songs */}
      <div className="space-y-3 mb-4">
        {songs.map((song, i) => (
          <SongPlayer key={i} title={song.title} url={song.url} index={i + 1} />
        ))}
      </div>

      {/* Rating */}
      <motion.div 
        className="pt-4 border-t border-border/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.04 + 0.3 }}
      >
        <StarRating
          rating={artist.rating || 0}
          onRate={(r) => onRate(artist.id, r)}
          onClear={onClearRating ? () => onClearRating(artist.id) : undefined}
        />
      </motion.div>
    </motion.div>
  );
};

export default ArtistCard;
