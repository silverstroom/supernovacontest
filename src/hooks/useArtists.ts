import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GravityFormsResponse } from "@/types/artist";

export const useArtists = () => {
  return useQuery({
    queryKey: ["artists"],
    queryFn: async (): Promise<GravityFormsResponse> => {
      const { data, error } = await supabase.functions.invoke("gravity-forms");
      if (error) throw error;
      return data as GravityFormsResponse;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });
};

export const useRatings = (edition: string = "2025-2026") => {
  return useQuery({
    queryKey: ["ratings", edition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("edition", edition);
      if (error) throw error;
      return data;
    },
  });
};
