import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, RefreshCw, Calendar } from "lucide-react";
import { useArtists, useRatings } from "@/hooks/useArtists";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Artist } from "@/types/artist";
import ArtistCard from "@/components/ArtistCard";
import PasswordGate from "@/components/PasswordGate";
import logoSupernova from "@/assets/logo-supernova.png";

const EDITIONS = [
  { key: "2025-2026", label: "2025/2026" },
  { key: "2026-2027", label: "2026/2027" },
];

const Index = () => {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("supernova_auth") === "true"
  );
  const [activeCity, setActiveCity] = useState<"bologna" | "rende">("bologna");
  const [activeEdition, setActiveEdition] = useState("2025-2026");
  const queryClient = useQueryClient();

  const { data: artistsData, isLoading, error, refetch } = useArtists();
  const { data: ratingsData } = useRatings(activeEdition);

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }

  const ratingsMap: Record<string, number> = {};
  ratingsData?.forEach((r: any) => {
    ratingsMap[r.artist_entry_id] = r.rating;
  });

  const filteredArtists: Artist[] = (artistsData?.entries || [])
    .filter((a) => a.city === activeCity)
    .map((a) => ({ ...a, rating: ratingsMap[a.id] || 0 }));

  const handleRate = async (artistId: string, rating: number) => {
    const { error } = await supabase
      .from("ratings")
      .upsert(
        { artist_entry_id: artistId, rating, edition: activeEdition },
        { onConflict: "artist_entry_id,edition" }
      );
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["ratings", activeEdition] });
    }
  };

  const cities = [
    { key: "bologna" as const, label: "Bologna" },
    { key: "rende" as const, label: "Rende (CS)" },
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Aggiorna"
            >
              <RefreshCw size={14} />
            </button>
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
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {/* Edition selector */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <div className="flex gap-1">
            {EDITIONS.map((ed) => (
              <button
                key={ed.key}
                onClick={() => setActiveEdition(ed.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  activeEdition === ed.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {ed.label}
              </button>
            ))}
          </div>
        </div>

        {/* City Tabs */}
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
          {!isLoading && artistsData && (
            <div className="flex items-center ml-auto text-xs text-muted-foreground font-display">
              {filteredArtists.length} artisti
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground font-display">Caricamento artisti...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive font-display mb-2">Errore nel caricamento</p>
            <p className="text-muted-foreground text-sm">{(error as Error).message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-sm"
            >
              Riprova
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCity}-${activeEdition}`}
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
        )}
      </div>

      {/* Footer glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
