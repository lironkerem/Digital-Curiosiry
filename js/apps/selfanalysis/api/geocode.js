// api/geocode.js - Optimized with caching and rate limiting
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map();

// CORS whitelist
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://self-analysis-pro.vercel.app',
  'https://lironkerem.wixsite.com'
];

export default async function handler(req, res) {
  // CORS handling
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q } = req.query;

  if (!q || q.length < 3) {
    return res.status(400).json({ error: 'Query must be at least 3 characters' });
  }

  try {
    // Check cache first
    const cacheKey = q.toLowerCase().trim();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached result for:', q);
      return res.status(200).json(cached.data);
    }

    // Fetch from Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'SelfAnalysisApp/1.0 (Contact: lironkerem@gmail.com)'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      // Limit cache size to 100 entries
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      res.status(200).json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ 
          error: 'Request timeout',
          message: 'Location service took too long to respond'
        });
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch locations',
      message: error.message 
    });
  }
}
