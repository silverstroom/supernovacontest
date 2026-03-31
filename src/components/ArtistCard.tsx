import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="glass glass-hover rounded-2xl p-4 gradient-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display font-semibold text-foreground truncate">
            {artist.name}
          </h3>
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

      {/* Info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] text-muted-foreground">
        {artist.referent_name && (
          <span className="flex items-center gap-1">
            <User size={10} /> {artist.referent_name}
          </span>
        )}
        {artist.email && (
          <a href={`mailto:${artist.email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Mail size={10} /> {artist.email}
          </a>
        )}
        {artist.members && (
          <span className="flex items-center gap-1">
            <Users size={10} /> {artist.members} componenti
          </span>
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
          onClear={onClearRating ? () => onClearRating(artist.id) : undefined}
        />
      </div>
    </motion.div>
  );
};

export default ArtistCard;
