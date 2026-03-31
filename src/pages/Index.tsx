import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Artist } from "@/types/artist";
import ArtistCard from "@/components/ArtistCard";
import PasswordGate from "@/components/PasswordGate";
import logoSupernova from "@/assets/logo-supernova.png";

// Mock data - will be replaced with Gravity Forms API data
const MOCK_ARTISTS: Artist[] = [
  {
    id: "1",
    name: "Luna Nova",
    instagram: "lunanova_music",
    song1_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song1_title: "Stelle Cadenti",
    song2_url: "https://soundcloud.com/example/track",
    song2_title: "Notte Infinita",
    song3_url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    song3_title: "Aurora Boreale",
    city: "bologna",
  },
  {
    id: "2",
    name: "Eclissi",
    instagram: "eclissi_band",
    song1_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song1_title: "Ombre di Luce",
    song2_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song2_title: "Frammenti",
    song3_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song3_title: "Riflessi",
    city: "bologna",
  },
  {
    id: "3",
    name: "Nebula",
    instagram: "nebula_official",
    song1_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song1_title: "Galassia",
    song2_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song2_title: "Polvere di Stelle",
    song3_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    song3_title: "Orbita",
    city: "rende",
  },
];

const Index = () => {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("supernova_auth") === "true"
  );
  const [activeCity, setActiveCity] = useState<"bologna" | "rende">("bologna");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }

  const filteredArtists = MOCK_ARTISTS.filter((a) => a.city === activeCity).map(
    (a) => ({ ...a, rating: ratings[a.id] || 0 })
  );

  const handleRate = (artistId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [artistId]: rating }));
    // TODO: Save to database
  };

  const cities = [
    { key: "bologna" as const, label: "Finale Bologna" },
    { key: "rende" as const, label: "Finale Rende" },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSupernova} alt="Supernova" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-display font-bold gradient-text leading-tight">
                Supernova
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                il Contest del Color Fest
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("supernova_auth");
              setAuthenticated(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Esci
          </button>
        </div>
      </header>

      {/* City Tabs */}
      <div className="container max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2">
          {cities.map((city) => (
            <button
              key={city.key}
              onClick={() => setActiveCity(city.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-sm font-medium transition-all ${
                activeCity === city.key
                  ? "bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-primary-foreground shadow-lg"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin size={14} />
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Grid */}
      <div className="container max-w-4xl mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {filteredArtists.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground font-display">
                  Nessun artista iscritto per questa finale
                </p>
              </div>
            ) : (
              filteredArtists.map((artist, i) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onRate={handleRate}
                  index={i}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
