import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, MapPin, Star, TrendingUp } from "lucide-react";
import type { Artist } from "@/types/artist";

interface StatsViewProps {
  artists: Artist[];
  ratingsMap: Record<string, number>;
}

const StatsView = ({ artists, ratingsMap }: StatsViewProps) => {
  const stats = useMemo(() => {
    const bolognaArtists = artists
      .filter((a) => a.city === "bologna")
      .map((a) => ({ ...a, rating: ratingsMap[a.id] || 0 }))
      .filter((a) => a.rating > 0)
      .sort((a, b) => b.rating - a.rating);

    const rendeArtists = artists
      .filter((a) => a.city === "rende")
      .map((a) => ({ ...a, rating: ratingsMap[a.id] || 0 }))
      .filter((a) => a.rating > 0)
      .sort((a, b) => b.rating - a.rating);

    const totalBologna = artists.filter((a) => a.city === "bologna").length;
    const totalRende = artists.filter((a) => a.city === "rende").length;
    const totalRated = Object.keys(ratingsMap).length;
    const avgRating = totalRated > 0
      ? (Object.values(ratingsMap).reduce((a, b) => a + b, 0) / totalRated).toFixed(1)
      : "0";

    return { bolognaArtists, rendeArtists, totalBologna, totalRende, totalRated, avgRating };
  }, [artists, ratingsMap]);

  const getMedalColor = (pos: number) => {
    if (pos === 0) return "from-yellow-400 to-amber-500";
    if (pos === 1) return "from-gray-300 to-gray-400";
    if (pos === 2) return "from-orange-400 to-orange-600";
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Totale artisti", value: stats.totalBologna + stats.totalRende, icon: TrendingUp },
          { label: "Votati", value: stats.totalRated, icon: Star },
          { label: "Bologna", value: stats.totalBologna, icon: MapPin },
          { label: "Rende (CS)", value: stats.totalRende, icon: MapPin },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 text-center"
          >
            <stat.icon size={16} className="mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-display font-bold gradient-text">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Media voto */}
      <div className="glass rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Media voto generale</p>
        <p className="text-3xl font-display font-bold gradient-text">{stats.avgRating}<span className="text-base text-muted-foreground">/10</span></p>
      </div>

      {/* Top rated per city */}
      {[
        { title: "Top Bologna", artists: stats.bolognaArtists, city: "Bologna" },
        { title: "Top Rende (CS)", artists: stats.rendeArtists, city: "Rende" },
      ].map((section) => (
        <div key={section.title}>
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-star-filled" />
            {section.title}
          </h3>
          {section.artists.length === 0 ? (
            <p className="text-sm text-muted-foreground glass rounded-xl p-4 text-center">
              Nessun artista votato ancora
            </p>
          ) : (
            <div className="space-y-2">
              {section.artists.slice(0, 10).map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm ${
                    i < 3
                      ? `bg-gradient-to-br ${getMedalColor(i)} text-background`
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{artist.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={14} className="fill-star-filled text-star-filled" />
                    <span className="text-sm font-display font-semibold text-foreground">
                      {artist.rating}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsView;
