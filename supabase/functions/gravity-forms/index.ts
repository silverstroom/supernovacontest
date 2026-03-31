import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "https://deno.land/x/supabase_functions_js@v2.95.0/src/cors.ts";

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

    const url = new URL(req.url);
    const formId = url.searchParams.get("form_id") || "1";
    const pageSize = url.searchParams.get("page_size") || "200";
    const page = url.searchParams.get("page") || "1";

    const credentials = btoa(`${GF_CONSUMER_KEY}:${GF_CONSUMER_SECRET}`);

    // Fetch all entries with pagination
    const allEntries: any[] = [];
    let currentPage = parseInt(page);
    let hasMore = true;

    while (hasMore) {
      const gfUrl = `${GF_BASE_URL}/forms/${formId}/entries?paging[page_size]=${pageSize}&paging[current_page]=${currentPage}`;
      
      const response = await fetch(gfUrl, {
        headers: {
          "Authorization": `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gravity Forms API error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const entries = data.entries || [];
      
      // Filter for paid entries with artist name
      const validEntries = entries.filter((e: any) => 
        e.payment_status === "Paid" && e["10"] && e["10"].trim() !== ""
      );

      const mapped = validEntries.map((e: any) => ({
        id: e.id,
        name: e["10"],
        city: e["24"] === "Finale di Bologna" ? "bologna" : "rende",
        song1_url: e["29"] || "",
        song2_url: e["30"] || "",
        song3_url: e["31"] || "",
        referent_name: `${e["1.3"] || ""} ${e["1.6"] || ""}`.trim(),
        email: e["2"] || "",
        date_created: e.date_created,
      }));

      allEntries.push(...mapped);

      if (entries.length < parseInt(pageSize)) {
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
