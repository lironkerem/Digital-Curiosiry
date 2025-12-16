// js/ui.natal.js
// Rendering for the Full Natal Chart Card
export function renderNatalChartBlock(astrologyResults) {
  const container = document.getElementById("natal-chart-output");
  if (!container) {
    console.warn("No #natal-chart-output container found.");
    return;
  }
  
  container.innerHTML = "";
  
  // === 1. Chart Wheel ===
  if (astrologyResults.natalChart && astrologyResults.natalChart.output) {
    const chartSection = document.createElement("div");
    chartSection.className = "natal-chart-section";
    const title = document.createElement("h3");
    title.textContent = "Your Natal Chart";
    chartSection.appendChild(title);
    
    const chartWrapper = document.createElement("div");
    chartWrapper.className = "natal-chart-svg";
    chartWrapper.innerHTML = `<img src="${astrologyResults.natalChart.output}" alt="Natal Chart" style="max-width: 100%; height: auto;">`;
    chartSection.appendChild(chartWrapper);
    container.appendChild(chartSection);
  }
  
  // === 2. Planetary Positions ===
  if (astrologyResults.planets && astrologyResults.planets.output) {
    const planetSection = document.createElement("div");
    planetSection.className = "natal-planets-section";
    const title = document.createElement("h3");
    title.textContent = "Planetary Positions";
    planetSection.appendChild(title);
    
    const table = document.createElement("table");
    table.className = "natal-table planets-table";
    table.innerHTML = `
      <thead>
        <tr><th>Planet</th><th>Sign</th><th>Degree</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.planets.output
          .map(p => `
          <tr>
            <td>${p.planet?.en || 'Unknown'}</td>
            <td>${p.zodiac_sign?.name?.en || 'Unknown'}</td>
            <td>${p.normDegree?.toFixed(2)}°</td>
          </tr>`)
          .join("")}
      </tbody>
    `;
    planetSection.appendChild(table);
    container.appendChild(planetSection);
  }
  
  // === 3. House Cusps ===
  if (astrologyResults.houses && astrologyResults.houses.output && astrologyResults.houses.output.Houses) {
    const houseSection = document.createElement("div");
    houseSection.className = "natal-houses-section";
    const title = document.createElement("h3");
    title.textContent = "House Cusps";
    houseSection.appendChild(title);
    
    const table = document.createElement("table");
    table.className = "natal-table houses-table";
    table.innerHTML = `
      <thead>
        <tr><th>House</th><th>Sign</th><th>Degree</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.houses.output.Houses
          .map(h => `
          <tr>
            <td>House ${h.House}</td>
            <td>${h.zodiac_sign?.name?.en || 'Unknown'}</td>
            <td>${h.normDegree?.toFixed(2)}°</td>
          </tr>`)
          .join("")}
      </tbody>
    `;
    houseSection.appendChild(table);
    container.appendChild(houseSection);
  }
  
  // === 4. Aspects ===
  if (astrologyResults.aspects && astrologyResults.aspects.output) {
    const aspectsSection = document.createElement("div");
    aspectsSection.className = "natal-aspects-section";
    const title = document.createElement("h3");
    title.textContent = "Aspects";
    aspectsSection.appendChild(title);
    
    const table = document.createElement("table");
    table.className = "natal-table aspects-table";
    table.innerHTML = `
      <thead>
        <tr><th>Planet 1</th><th>Aspect</th><th>Planet 2</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.aspects.output
          .map(a => `
          <tr>
            <td>${a.planet_1?.en || 'Unknown'}</td>
            <td>${a.aspect?.en || 'Unknown'}</td>
            <td>${a.planet_2?.en || 'Unknown'}</td>
          </tr>`)
          .join("")}
      </tbody>
    `;
    aspectsSection.appendChild(table);
    container.appendChild(aspectsSection);
  }
}