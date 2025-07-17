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
const generationFilter = document.getElementById("generationFilter");
const searchInput = document.getElementById("searchInput");
const tankTableBody = document.getElementById("tankTableBody");

// Details modal elements
const detailsOverlay = document.getElementById("tankDetailsOverlay");
const detailsCloseBtn = document.getElementById("detailsCloseBtn");
const detailsContent = document.getElementById("detailsContent");

detailsOverlay.style.display = "none";
let tanks = []; // Filled via fetch
const api = '/data-api/rest/Tank';

async function loadTanks() {
  console.log("→ loadTanks() called");
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    tanks = Array.isArray(json) ? json : (json.value || []);
    console.log("Fetched tanks:", tanks);
    populateFilters();
    renderTable(tanks);
  } catch (err) {
    console.error("Error loading tanks:", err);
    tankTableBody.innerHTML = `<tr><td colspan="5">Failed to load data: ${err.message}</td></tr>`;
  }
}

/* -------- TABLE RENDER (reduced cols + Details btn) -------- */
function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    tankTableBody.innerHTML = `<tr><td colspan="5" class="no-data">No tanks found.</td></tr>`;
    return;
  }

  tankTableBody.innerHTML = data.map((tank, idx) => {
    const safeModel = escapeHtml(tank.model);
    const safeRole = escapeHtml(tank.tankRole);
    const safeMan = escapeHtml(tank.manufacturer);
    const safePrice = formatNumber(tank.unitPrice);
    return `
      <tr data-index="${idx}">
        <td>${safeModel}</td>
        <td>${safeRole}</td>
        <td>${safeMan}</td>
        <td>${safePrice}</td>
        <td><button class="table-details-btn" data-action="details" data-index="${idx}">Details</button></td>
      </tr>
    `;
  }).join("");
}

/* -------- DETAILS MODAL -------- */
function showDetails(tank) {
  const html = buildDetailsHTML(tank);
  detailsContent.innerHTML = html;
  detailsOverlay.hidden = false;
  detailsOverlay.style.display = "flex";
}

function hideDetails() {
  detailsOverlay.hidden = true;
  detailsOverlay.style.display = "none";
  detailsContent.innerHTML = "";
}

function buildDetailsHTML(t) {
  // Fallback if fields absent
  const model = safeField(t.model);
  const generation = safeField(t.generation);
  const tankType = safeField(t.tankType);
  const role = safeField(t.tankRole);
  const country = safeField(t.country);
  const manufacturer = safeField(t.manufacturer);
  const weight = safeField(t.weight);
  const speed = safeField(t.speed);
  const fireRange = safeField(t.fireRange);
  const cannon = safeField(t.cannon);
  const engine = safeField(t.engine);
  const crew = safeField(t.crew);
  const unitPrice = safeField(t.unitPrice);
  const dateManufactured = safeField(t.dateManufactured);
  const image = t.image && String(t.image).trim() !== "" ? t.image : null;

  return `
    <h2>${escapeHtml(model)}</h2>
    <dl class="details-grid">
      <dt>Generation</dt><dd>${escapeHtml(generation)}</dd>
      <dt>Type</dt><dd>${escapeHtml(tankType)}</dd>
      <dt>Role</dt><dd>${escapeHtml(role)}</dd>
      <dt>Country</dt><dd>${escapeHtml(country)}</dd>
      <dt>Manufacturer</dt><dd>${escapeHtml(manufacturer)}</dd>
      <dt>Weight (t)</dt><dd>${escapeHtml(weight)}</dd>
      <dt>Speed (km/h)</dt><dd>${escapeHtml(speed)}</dd>
      <dt>Fire Range (km)</dt><dd>${escapeHtml(fireRange)}</dd>
      <dt>Cannon (mm)</dt><dd>${escapeHtml(cannon)}</dd>
      <dt>Engine</dt><dd>${escapeHtml(engine)}</dd>
      <dt>Crew</dt><dd>${escapeHtml(crew)}</dd>
      <dt>Unit Price ($M)</dt><dd>${escapeHtml(unitPrice)}</dd>
      <dt>Date Manufactured</dt><dd>${escapeHtml(dateManufactured)}</dd>
    </dl>
    <div class="details-image-wrapper">
      ${image
        ? `<img src="${escapeAttr(image)}" alt="${escapeAttr(model)}">`
        : `<em>No image available</em>`
      }
    </div>
  `;
}

/* -------- FILTER HELPERS -------- */
function getUniqueOptions(field) {
  return [...new Set(tanks.map(t => t[field]).filter(v => v !== null && v !== undefined && v !== ""))].sort();
}

function populateFilters() {
  resetSelect(typeFilter);
  resetSelect(roleFilter);
  resetSelect(countryFilter);
  resetSelect(manufacturerFilter);
  resetSelect(generationFilter);

  populateSelect(typeFilter, getUniqueOptions("tankType"));
  populateSelect(roleFilter, getUniqueOptions("tankRole"));
  populateSelect(countryFilter, getUniqueOptions("country"));
  populateSelect(manufacturerFilter, getUniqueOptions("manufacturer"));
  populateSelect(generationFilter, getUniqueOptions("generation"));
}

function resetSelect(sel) {
  // Keep the first option (All …), remove the rest
  while (sel.options.length > 1) sel.remove(1);
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
  const q = searchInput.value.trim().toLowerCase();
  const filtered = tanks.filter(tank => {
    return (
      (typeFilter.value === "" || tank.tankType === typeFilter.value) &&
      (roleFilter.value === "" || tank.tankRole === roleFilter.value) &&
      (countryFilter.value === "" || tank.country === countryFilter.value) &&
      (manufacturerFilter.value === "" || tank.manufacturer === manufacturerFilter.value) &&
      (generationFilter.value === "" || String(tank.generation) === generationFilter.value) &&
      (q === "" || (tank.model && tank.model.toLowerCase().includes(q)))
    );
  });

  renderTable(filtered);
}

/* -------- EVENT LISTENERS -------- */

// Filter + search
document.querySelectorAll(".filters select, .filters input").forEach(el => {
  el.addEventListener("input", applyFilters);
});

// Details button (event delegation on table)
tankTableBody.addEventListener("click", e => {
  const btn = e.target.closest("[data-action='details']");
  if (!btn) return;
  const idx = Number(btn.dataset.index);
  const dataSet = getCurrentlyRenderedData(); // needed because filtered table index !== original index?
  const tank = dataSet[idx];
  if (tank) showDetails(tank);
});

// Close modal
detailsCloseBtn.addEventListener("click", hideDetails);

// Close when clicking outside modal
detailsOverlay.addEventListener("click", e => {
  if (e.target === detailsOverlay) hideDetails();
});

// ESC key
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !detailsOverlay.hidden) hideDetails();
});

/* -------- TRACK CURRENTLY RENDERED DATA --------
   We keep a shallow copy of the array last passed to renderTable()
   so we can map button row indexes back to tank objects.
*/
let _lastRendered = [];
function renderTable(data) {
  _lastRendered = Array.isArray(data) ? data : [];
  if (_lastRendered.length === 0) {
    tankTableBody.innerHTML = `<tr><td colspan="5" class="no-data">No tanks found.</td></tr>`;
    return;
  }
  tankTableBody.innerHTML = _lastRendered.map((tank, idx) => {
    const safeModel = escapeHtml(tank.model);
    const safeRole = escapeHtml(tank.tankRole);
    const safeMan = escapeHtml(tank.manufacturer);
    const safePrice = formatNumber(tank.unitPrice);
    return `
      <tr data-index="${idx}">
        <td>${safeModel}</td>
        <td>${safeRole}</td>
        <td>${safeMan}</td>
        <td>${safePrice}</td>
        <td><button class="table-details-btn" data-action="details" data-index="${idx}">Details</button></td>
      </tr>
    `;
  }).join("");
}
function getCurrentlyRenderedData() {
  return _lastRendered;
}

/* -------- UTILS -------- */
function escapeHtml(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(v) {
  // Good enough for src/alt
  return escapeHtml(v).replace(/"/g, "&quot;");
}
function safeField(v) {
  return (v === null || v === undefined || v === "") ? "—" : v;
}
function formatNumber(v) {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (Number.isNaN(num)) return escapeHtml(v);
  // Limit to 2 decimals, strip trailing zeros
  return Number(num.toFixed(2)).toString();
}

if (detailsCloseBtn) {
  detailsCloseBtn.addEventListener("click", hideDetails);
}

detailsOverlay.addEventListener("click", e => {
  if (e.target === detailsOverlay) hideDetails();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && detailsOverlay.style.display === "flex") hideDetails();
});
/* -------- INIT -------- */
loadTanks();














