// js/astroApi.js - client wrapper for the Vercel astro-proxy
// DEBUG VERSION - with detailed logging

const PROXY = '/api/astro-proxy';

async function callAstroWithRetry(endpoint, params, retries = 2) {
  console.log(`📞 Calling astro-proxy: ${endpoint}`);
  console.log('📦 Request payload:', { endpoint, params });
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const requestBody = JSON.stringify({ endpoint, params });
      console.log(`🔄 Attempt ${attempt + 1}/${retries}`);
      console.log('📤 Full request body:', requestBody);
      
      const res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });
      
      console.log(`📥 Response status: ${res.status}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response body:', errorText);
        
        let err;
        try {
          const errorJson = JSON.parse(errorText);
          err = new Error(errorJson.message || 'Astrology API error');
          console.error('❌ Parsed error:', errorJson);
        } catch {
          err = new Error(errorText || 'Unknown error');
        }
        throw err;
      }
      
      const data = await res.json();
      console.log('✅ Success response:', data);
      return data;
      
    } catch (error) {
      console.error(`❌ Astrology API attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries - 1) {
        console.error('💥 All retries exhausted, throwing error');
        throw error;
      }
      
      const waitTime = 1000 * (attempt + 1);
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

export async function getPlanets(params) {
  console.log('🪐 getPlanets() called');
  return callAstroWithRetry('western/planets', params);
}

export async function getHouses(params) {
  console.log('🏠 getHouses() called');
  return callAstroWithRetry('western/houses', params);
}

export async function getAspects(params) {
  console.log('🔺 getAspects() called');
  return callAstroWithRetry('western/aspects', params);
}

export async function getNatalWheelChart(params) {
  console.log('🎡 getNatalWheelChart() called');
  return callAstroWithRetry('western/natal-wheel-chart', params);
}