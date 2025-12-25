// ============================================
// /api/astro-proxy.js - WITH PARAMETER MAPPING
// ============================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, params } = req.body;

    console.log('📥 Received request:', { endpoint, params });

    if (!endpoint || !params) {
      console.error('❌ Missing endpoint or params');
      return res.status(400).json({ error: "Missing endpoint or params" });
    }

    // SPECIAL CASE: timezone-only request
    if (endpoint === 'timezone') {
      console.log('🕐 Timezone request - returning 0 (UTC)');
      return res.status(200).json({ tzone: 0 });
    }

    // Map parameters to Free Astrology API format
    const apiParams = {
      year: params.year,
      month: params.month,
      date: params.date,
      hours: params.hours || 0,
      minutes: params.minutes || 0,
      seconds: params.seconds || 0,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone !== undefined ? params.timezone : (params.tzone !== undefined ? params.tzone : 0)
    };

    console.log('📦 Mapped params:', apiParams);

    // Check API key
    if (!process.env.FREE_ASTRO_API_KEY) {
      console.error("❌ FREE_ASTRO_API_KEY not set");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log('📡 Calling Free Astrology API:', endpoint);

    // Call Free Astrology API
    const apiUrl = `https://json.freeastrologyapi.com/${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FREE_ASTRO_API_KEY
      },
      body: JSON.stringify(apiParams)
    });

    console.log('📥 API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Free Astrology API error:", response.status, data);
      console.error("❌ Sent params:", JSON.stringify(apiParams));
      return res.status(response.status).json({ 
        error: "Free Astrology API error", 
        details: data,
        sentParams: apiParams
      });
    }

    console.log('✅ Success');
    return res.status(200).json(data);

  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}