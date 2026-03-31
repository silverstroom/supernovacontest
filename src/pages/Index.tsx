import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, RefreshCw, Search, X } from "lucide-react";
import { useArtists, useRatings } from "@/hooks/useArtists";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Artist } from "@/types/artist";
import ArtistCard from "@/components/ArtistCard";
import PasswordGate from "@/components/PasswordGate";
import BottomNav, { type TabKey } from "@/components/BottomNav";
import StatsView from "@/components/StatsView";
import logoSupernova from "@/assets/logo-supernova.png";
import logoColorfest from "@/assets/logo-colorfest.png";

const EDITIONS = [
  { key: "color-fest-14", label: "Color Fest XIV", subtitle: "Agosto 2026", edition: "2025-2026", active: true },
  { key: "color-fest-15", label: "Color Fest XV", subtitle: "Prossimamente", edition: "2026-2027", active: false },
];

const Index = () => {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("supernova_auth") === "true"
  );
  const [activeCity, setActiveCity] = useState<"bologna" | "rende">("bologna");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [activeEdition, setActiveEdition] = useState(EDITIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("supernova_favorites");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const queryClient = useQueryClient();
  const { data: artistsData, isLoading, error, refetch } = useArtists();
  const { data: ratingsData } = useRatings(activeEdition.edition);

  const ratingsMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    ratingsData?.forEach((r: any) => { map[r.artist_entry_id] = r.rating; });
    return map;
  }, [ratingsData]);

  const allArtists: Artist[] = useMemo(() => {
    if (!activeEdition.active) return [];
    return (artistsData?.entries || []).map((a) => ({ ...a, rating: ratingsMap[a.id] || 0 }));
  }, [artistsData, ratingsMap, activeEdition]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("supernova_favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleRate = useCallback(async (artistId: string, rating: number) => {
    await supabase
      .from("ratings")
      .upsert(
        { artist_entry_id: artistId, rating, edition: activeEdition.edition },
        { onConflict: "artist_entry_id,edition" }
      );
    queryClient.invalidateQueries({ queryKey: ["ratings", activeEdition.edition] });
  }, [queryClient]);

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }

  const cities = [
    { key: "bologna" as const, label: "Bologna" },
    { key: "rende" as const, label: "Rende (CS)" },
  ];

  const getFilteredArtists = (): { unrated: Artist[]; rated: Artist[] } => {
    let list = allArtists;

    if (activeTab === "favorites") {
      list = list.filter((a) => favorites.has(a.id));
    } else if (activeTab === "home") {
      list = list.filter((a) => a.city === activeCity);
    }

    if (activeTab === "search" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }

    const unrated = list.filter((a) => !a.rating || a.rating === 0);
    const rated = list.filter((a) => a.rating && a.rating > 0);

    return { unrated, rated };
  };

  const { unrated: unratedArtists, rated: ratedArtists } = getFilteredArtists();
  const totalFiltered = unratedArtists.length + ratedArtists.length;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground font-display">Caricamento artisti...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-destructive font-display mb-2">Errore nel caricamento</p>
          <p className="text-muted-foreground text-sm">{(error as Error).message}</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-sm">
            Riprova
          </button>
        </div>
      );
    }

    if (activeTab === "stats") {
      return <StatsView artists={allArtists} ratingsMap={ratingsMap} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${activeCity}-${searchQuery}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {totalFiltered === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-display">
                {activeTab === "search" ? "Nessun risultato" 
                  : activeTab === "favorites" ? "Nessun preferito salvato"
                  : "Nessun artista iscritto"}
              </p>
            </div>
          ) : (
            <>
              {unratedArtists.map((artist, i) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onRate={handleRate}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.has(artist.id)}
                  index={i}
                />
              ))}
              {ratedArtists.length > 0 && (
                <>
                  <div className="pt-4 pb-1">
                    <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
                      Già votati
                    </p>
                  </div>
                  {ratedArtists.map((artist, i) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onRate={handleRate}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(artist.id)}
                      index={unratedArtists.length + i}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoSupernova} alt="Supernova" className="h-8 w-8" />
            <img src={logoColorfest} alt="Color Fest" className="h-6" />
            <div className="border-l border-border pl-2.5">
              <h1 className="text-sm font-display font-bold gradient-text leading-tight">
                Supernova
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                {activeEdition.label} · {activeEdition.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => { localStorage.removeItem("supernova_auth"); setAuthenticated(false); }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Esci
            </button>
          </div>
        </div>
        <div className="border-b border-border/30" />
      </header>

      <div className="container max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Search bar (only on search tab) */}
        {activeTab === "search" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca artista o band..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-display"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </motion.div>
        )}

        {/* Edition selector (on home tab) */}
        {activeTab === "home" && (
          <div className="flex gap-2">
            {EDITIONS.map((ed) => (
              <button
                key={ed.key}
                onClick={() => setActiveEdition(ed)}
                className={`flex-1 px-3 py-2 rounded-xl font-display text-xs font-medium transition-all text-center ${
                  activeEdition.key === ed.key
                    ? "bg-foreground text-background shadow-sm"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block font-semibold">{ed.label}</span>
                <span className="block text-[10px] opacity-70">{ed.subtitle}</span>
              </button>
            ))}
          </div>
        )}

        {/* City Tabs (only on home tab) */}
        {activeTab === "home" && (
          <div className="flex gap-2">
            {cities.map((city) => (
              <button
                key={city.key}
                onClick={() => setActiveCity(city.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm font-medium transition-all flex-1 justify-center ${
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
        )}

        {/* Count */}
        {activeTab !== "stats" && !isLoading && (
          <p className="text-xs text-muted-foreground font-display">
            {totalFiltered} {totalFiltered === 1 ? "artista" : "artisti"}
            {activeTab === "home" && ` · Finale ${activeCity === "bologna" ? "Bologna" : "Rende"}`}
          </p>
        )}

        {/* Content */}
        {renderContent()}
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
