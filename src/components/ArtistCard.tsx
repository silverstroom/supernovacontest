import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Artist } from "@/types/artist";
import StarRating from "./StarRating";
import SongPlayer from "./SongPlayer";

interface ArtistCardProps {
  artist: Artist;
  onRate: (artistId: string, rating: number) => void;
  onToggleFavorite?: (artistId: string) => void;
  isFavorite?: boolean;
  index: number;
}

const ArtistCard = ({ artist, onRate, onToggleFavorite, isFavorite, index }: ArtistCardProps) => {
  const songs = [
    { title: "Brano 1", url: artist.song1_url },
    { title: "Brano 2", url: artist.song2_url },
    { title: "Brano 3", url: artist.song3_url },
  ].filter((s) => s.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="glass glass-hover rounded-2xl p-4 gradient-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display font-semibold text-foreground truncate">
            {artist.name}
          </h3>
          {artist.referent_name && (
            <p className="text-xs text-muted-foreground truncate">
              Ref: {artist.referent_name}
            </p>
          )}
        </div>
        {onToggleFavorite && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(artist.id)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 ml-2"
          >
            <Heart
              size={16}
              className={isFavorite 
                ? "fill-primary text-primary" 
                : "text-muted-foreground"
              }
            />
          </motion.button>
        )}
      </div>

      {/* Songs */}
      <div className="space-y-2.5 mb-3">
        {songs.map((song, i) => (
          <SongPlayer key={i} title={song.title} url={song.url} index={i + 1} />
        ))}
      </div>

      {/* Rating */}
      <div className="pt-3 border-t border-border/40">
        <StarRating
          rating={artist.rating || 0}
          onRate={(r) => onRate(artist.id, r)}
        />
      </div>
    </motion.div>
  );
};

export default ArtistCard;
