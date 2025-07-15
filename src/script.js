// Dummy data simulating fetched data from DB
/*const tanks = [
  {
    model: "T-90",
    generation: 3,
    tankType: "medium",
    tankRole: "assault",
    country: "Russia",
    manufacturer: "Uralvagonzavod",
    weight: 46.5,
    speed: 60,
    fireRange: 5.0,
    cannon: 125,
    engine: "diesel",
    crew: 3,
    unitPrice: 3.5,
    dateManufactured: "1993-01-01",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/T-90_at_Engineering_Technologies_2012.jpg/640px-T-90_at_Engineering_Technologies_2012.jpg"
  },
  {
    model: "M1 Abrams",
    generation: 3,
    tankType: "heavy",
    tankRole: "assault",
    country: "USA",
    manufacturer: "General Dynamics",
    weight: 62.0,
    speed: 67.6,
    fireRange: 4.5,
    cannon: 120,
    engine: "turbine",
    crew: 4,
    unitPrice: 8.9,
    dateManufactured: "1980-01-01",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/M1A2_Abrams_with_TUSK.JPG/640px-M1A2_Abrams_with_TUSK.JPG"
  }
  // Add more tank objects if needed
];*/
console.log("Loading tanks...");
const typeFilter = document.getElementById("typeFilter");
const roleFilter = document.getElementById("roleFilter");
const countryFilter = document.getElementById("countryFilter");
const manufacturerFilter = document.getElementById("manufacturerFilter");
generationFilter = document.getElementById("generationFilter");
const searchInput = document.getElementById("searchInput");
const tankTableBody = document.getElementById("tankTableBody");

let tanks = []; // Will hold data fetched from DB
const api = '/data-api/rest/Tank';
async function loadTanks() {
  console.log("→ loadTanks() called");
  try {
    
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = await res.json();
    tanks = Array.isArray(json) ? json : (json.value || []);
    console.log("Loading tanks...");
    console.log(tanks);
    populateFilters();
    renderTable(tanks);
  } catch (err) {
    console.error("Error loading tanks:", err);
    tankTableBody.innerHTML = `<tr><td colspan="15">Failed to load data: ${err.message}</td></tr>`;
  }
}

function renderTable(data) {
  tankTableBody.innerHTML = data.map(tank => `
    <tr>
      <td>${tank.model}</td>
      <td>${tank.tankType}</td>
      <td>${tank.tankRole}</td>
      <td>${tank.country}</td>
      <td>${tank.manufacturer}</td>
      <td>${tank.generation}</td>
      <td>${tank.weight}</td>
      <td>${tank.speed}</td>
      <td>${tank.fireRange}</td>
      <td>${tank.cannon}</td>
      <td>${tank.engine}</td>
      <td>${tank.crew}</td>
      <td>${tank.unitPrice}</td>
      <td>${tank.dateManufactured}</td>
      <td><img src="${tank.image}" alt="${tank.model}" /></td>
    </tr>
  `).join("");
}

function getUniqueOptions(field) {
  return [...new Set(tanks.map(t => t[field]))];
}

function populateFilters() {
  populateSelect(typeFilter, getUniqueOptions("tankType"));
  populateSelect(roleFilter, getUniqueOptions("tankRole"));
  populateSelect(countryFilter, getUniqueOptions("country"));
  populateSelect(manufacturerFilter, getUniqueOptions("manufacturer"));
  populateSelect(generationFilter, getUniqueOptions("generation"));
}

function populateSelect(selectElement, options) {
  options.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    selectElement.appendChild(opt);
  });
}

function applyFilters() {
  let filtered = tanks.filter(tank => {
    return (
      (typeFilter.value === "" || tank.tankType === typeFilter.value) &&
      (roleFilter.value === "" || tank.tankRole === roleFilter.value) &&
      (countryFilter.value === "" || tank.country === countryFilter.value) &&
      (manufacturerFilter.value === "" || tank.manufacturer === manufacturerFilter.value) &&
      (generationFilter.value === "" || tank.generation == generationFilter.value) &&
      (searchInput.value === "" || tank.model.toLowerCase().includes(searchInput.value.toLowerCase()))
    );
  });

  renderTable(filtered);
}

document.querySelectorAll("select, input").forEach(el => {
  el.addEventListener("input", applyFilters);
});

loadTanks();
