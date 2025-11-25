// ============================================
// /api/astro-proxy.js
// This runs on the SERVER (Vercel serverless function)
// ============================================
import tzlookup from "tz-lookup";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, params } = req.body;

    if (!endpoint || !params) {
      return res.status(400).json({ error: "Missing endpoint or params" });
    }

    // SPECIAL CASE: timezone-only request from app.js fetchTimezoneWithRetry
    if (endpoint === 'timezone') {
      try {
        const tzone = await resolveTzOffset(params.lat, params.lon, params.dateOfBirth);
        return res.status(200).json({ tzone });
      } catch (tzError) {
        console.error("Timezone resolution failed:", tzError);
        return res.status(200).json({ tzone: 0 }); // Return 0 as fallback
      }
    }

    // Resolve timezone offset if not already provided
    if (!params.tzone && params.lat && params.lon && params.dateOfBirth) {
      try {
        params.tzone = await resolveTzOffset(params.lat, params.lon, params.dateOfBirth);
        console.log(`Resolved timezone offset: ${params.tzone}`);
      } catch (tzError) {
        console.error("Timezone resolution failed:", tzError);
        params.tzone = 0;
      }
    }

    if (!process.env.FREE_ASTRO_API_KEY) {
      console.error("FREE_ASTRO_API_KEY not set");
      return res.status(500).json({ error: "Astrology API not configured" });
    }

    // Call Free Astrology API
    const response = await fetch(`https://json.freeastrologyapi.com/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FREE_ASTRO_API_KEY
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Free Astrology API error:", response.status, data);
      return res.status(response.status).json({ 
        error: "Free Astrology API error", 
        details: data 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Astro Proxy Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}

async function resolveTzOffset(lat, lon, dateStr) {
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return 0;
    }

    const apiKey = process.env.TIMEZONEDB_API_KEY;
    if (!apiKey) {
      console.warn("TIMEZONEDB_API_KEY not set");
      return 0;
    }

    let tzName;
    try {
      tzName = tzlookup(latitude, longitude);
      console.log(`Timezone: ${tzName}`);
    } catch (e) {
      console.warn("tz-lookup failed:", e.message);
    }

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return 0;
    }
    
    const timestamp = Math.floor(dateObj.getTime() / 1000);
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}&time=${timestamp}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();

    if (data.status === "OK" && typeof data.gmtOffset === "number") {
      return data.gmtOffset / 3600;
    }
    
    return 0;
  } catch (err) {
    console.error("resolveTzOffset error:", err);
    return 0;
  }
}