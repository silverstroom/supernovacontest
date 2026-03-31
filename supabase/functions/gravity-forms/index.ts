import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GF_BASE_URL = "https://www.colorfest.it/wp-json/gf/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GF_CONSUMER_KEY = Deno.env.get("GF_CONSUMER_KEY");
    const GF_CONSUMER_SECRET = Deno.env.get("GF_CONSUMER_SECRET");

    if (!GF_CONSUMER_KEY || !GF_CONSUMER_SECRET) {
      throw new Error("Gravity Forms API credentials not configured");
    }

    const credentials = btoa(`${GF_CONSUMER_KEY}:${GF_CONSUMER_SECRET}`);
    const allEntries: any[] = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = 100;

    // Use server-side search to only get Paid entries
    const searchParam = encodeURIComponent(JSON.stringify({
      field_filters: [{ key: "payment_status", value: "Paid" }]
    }));

    while (hasMore) {
      const gfUrl = `${GF_BASE_URL}/forms/1/entries?paging[page_size]=${pageSize}&paging[current_page]=${currentPage}&search=${searchParam}`;
      
      const response = await fetch(gfUrl, {
        headers: { "Authorization": `Basic ${credentials}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gravity Forms API error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const entries = data.entries || [];
      
      // Extra filter: must have artist name filled
      const validEntries = entries.filter((e: any) => 
        e["10"] && e["10"].trim() !== ""
      );

      const mapped = validEntries.map((e: any) => ({
        id: e.id,
        name: e["10"].trim(),
        city: e["24"] === "Finale di Bologna" ? "bologna" : "rende",
        song1_url: (e["29"] || "").trim(),
        song2_url: (e["30"] || "").trim(),
        song3_url: (e["31"] || "").trim(),
        referent_name: `${e["1.3"] || ""} ${e["1.6"] || ""}`.trim(),
        email: e["2"] || "",
        members: e["12"] || "",
        date_created: e.date_created,
      }));

      allEntries.push(...mapped);

      if (entries.length < pageSize) {
        hasMore = false;
      } else {
        currentPage++;
      }
    }

    return new Response(JSON.stringify({ entries: allEntries, total: allEntries.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
