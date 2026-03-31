import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import type { Artist } from "@/types/artist";
import StarRating from "./StarRating";
import SongPlayer from "./SongPlayer";

interface ArtistCardProps {
  artist: Artist;
  onRate: (artistId: string, rating: number) => void;
  index: number;
}

const ArtistCard = ({ artist, onRate, index }: ArtistCardProps) => {
  const songs = [
    { title: artist.song1_title, url: artist.song1_url },
    { title: artist.song2_title, url: artist.song2_url },
    { title: artist.song3_title, url: artist.song3_url },
  ].filter((s) => s.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass glass-hover rounded-2xl p-5 gradient-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            {artist.name}
          </h3>
        </div>
        {artist.instagram && (
          <a
            href={
              artist.instagram.startsWith("http")
                ? artist.instagram
                : `https://instagram.com/${artist.instagram.replace("@", "")}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity shrink-0"
          >
            <Instagram size={16} />
          </a>
        )}
      </div>

      {/* Songs */}
      <div className="space-y-3 mb-4">
        {songs.map((song, i) => (
          <SongPlayer key={i} title={song.title} url={song.url} index={i + 1} />
        ))}
      </div>

      {/* Rating */}
      <div className="pt-3 border-t border-border/50">
        <StarRating
          rating={artist.rating || 0}
          onRate={(r) => onRate(artist.id, r)}
        />
      </div>
    </motion.div>
  );
};

export default ArtistCard;
