const STORAGE_KEY = 'nanasGardenDataV2';
const LEGACY_STORAGE_KEY = 'nanasGardenData';
const SECTIONS = [
  { id: 'sectionA', label: 'Section A' },
  { id: 'sectionB', label: 'Section B' }
];

const PLANT_TYPE_TIPS = {
  flower: 'Flowers usually like regular deadheading and steady moisture.',
  herb: 'Herbs often do best with regular trimming and good light.',
  vegetable: 'Vegetables often need extra feeding as they produce.',
  other: 'Check the plant tag for the best specific care routine.'
};

const WATERING_INTERVAL_DAYS = {
  daily: 1,
  'every 2-3 days': 3,
  weekly: 7,
  unknown: null
};

let appState = loadState();
let editingPlantId = null;

const seasonPill = document.getElementById('seasonPill');
const seasonTip = document.getElementById('seasonTip');
const seasonChange = document.getElementById('seasonChange');
const categoryTips = document.getElementById('categoryTips');
const sectionsWrap = document.getElementById('sectionsWrap');

const plantForm = document.getElementById('plantForm');
const editorTitle = document.getElementById('editorTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

plantForm.addEventListener('submit', handleSavePlant);
cancelEditBtn.addEventListener('click', resetForm);

renderSeasonPanel();
renderGarden();
resetForm();

function loadState() {
  const cleanState = { sections: { sectionA: [], sectionB: [] } };
  try {
    const v2Raw = localStorage.getItem(STORAGE_KEY);
    if (v2Raw) {
      const parsedV2 = JSON.parse(v2Raw);
      return normalizeState(parsedV2);
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return cleanState;

    const legacyParsed = JSON.parse(legacyRaw);
    return migrateLegacyData(legacyParsed);
  } catch {
    return cleanState;
  }
}

function normalizeState(state) {
  const base = { sections: { sectionA: [], sectionB: [] } };
  if (!state || typeof state !== 'object' || !state.sections) return base;

  for (const section of SECTIONS) {
    const spots = Array.isArray(state.sections[section.id]) ? state.sections[section.id] : [];
    base.sections[section.id] = spots.map(normalizePlant).filter(Boolean);
  }

  return base;
}

function normalizePlant(plant) {
  if (!plant || typeof plant !== 'object') return null;
  return {
    id: String(plant.id || createPlantId()),
    sectionId: plant.sectionId === 'sectionB' ? 'sectionB' : 'sectionA',
    name: String(plant.name || '').trim(),
    plantType: asEnum(plant.plantType, ['flower', 'herb', 'vegetable', 'other'], 'other'),
    plantingDate: plant.plantingDate || '',
    sunlight: asEnum(plant.sunlight, ['full sun', 'partial sun', 'shade', 'unknown'], 'unknown'),
    wateringFrequency: asEnum(plant.wateringFrequency, ['daily', 'every 2-3 days', 'weekly', 'unknown'], 'unknown'),
    notes: String(plant.notes || '').trim(),
    lastWatered: plant.lastWatered || '',
    status: asEnum(plant.status, ['thriving', 'watch', 'struggling', 'done/removed'], 'watch')
  };
}

function migrateLegacyData(legacyData) {
  const state = { sections: { sectionA: [], sectionB: [] } };

  for (const section of SECTIONS) {
    const legacyPlant = legacyData?.[section.id];
    if (!legacyPlant || typeof legacyPlant !== 'object') continue;
    if (!legacyPlant.name && !legacyPlant.date && !legacyPlant.notes) continue;

    state.sections[section.id].push(normalizePlant({
      id: createPlantId(),
      sectionId: section.id,
      name: legacyPlant.name || 'Unnamed Plant',
      plantType: 'other',
      plantingDate: legacyPlant.date || '',
      sunlight: 'unknown',
      wateringFrequency: 'unknown',
      notes: legacyPlant.notes || '',
      lastWatered: '',
      status: 'watch'
    }));
  }

  saveState(state);
  return state;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleSavePlant(event) {
  event.preventDefault();
  const plant = readPlantFromForm();

  if (editingPlantId) {
    updatePlant(plant);
  } else {
    addPlant(plant);
  }

  saveState(appState);
  renderGarden();
  resetForm();
}

function readPlantFromForm() {
  const formData = new FormData(plantForm);
  return normalizePlant({
    id: formData.get('plantId') || createPlantId(),
    sectionId: formData.get('sectionId') || 'sectionA',
    name: formData.get('name'),
    plantType: formData.get('plantType'),
    plantingDate: formData.get('plantingDate'),
    sunlight: formData.get('sunlight'),
    wateringFrequency: formData.get('wateringFrequency'),
    notes: formData.get('notes'),
    lastWatered: formData.get('lastWatered'),
    status: formData.get('status')
  });
}

function addPlant(plant) {
  appState.sections[plant.sectionId].push(plant);
}

function updatePlant(updatedPlant) {
  for (const section of SECTIONS) {
    const idx = appState.sections[section.id].findIndex((plant) => plant.id === editingPlantId);
    if (idx === -1) continue;

    appState.sections[section.id].splice(idx, 1);
    appState.sections[updatedPlant.sectionId].push(updatedPlant);
    return;
  }
}

function removePlant(sectionId, plantId) {
  appState.sections[sectionId] = appState.sections[sectionId].filter((plant) => plant.id !== plantId);
  saveState(appState);
  renderGarden();
  if (editingPlantId === plantId) resetForm();
}

function markWateredToday(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;
  plant.lastWatered = getTodayISO();
  saveState(appState);
  renderGarden();
  if (editingPlantId === plantId) {
    document.getElementById('lastWatered').value = plant.lastWatered;
  }
}

function startEdit(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;

  editingPlantId = plantId;
  editorTitle.textContent = `Edit Plant Spot (${sectionLabel(sectionId)})`;
  saveBtn.textContent = 'Update Plant Spot';

  setValue('plantId', plant.id);
  setValue('sectionId', plant.sectionId);
  setValue('name', plant.name);
  setValue('plantType', plant.plantType);
  setValue('plantingDate', plant.plantingDate);
  setValue('sunlight', plant.sunlight);
  setValue('wateringFrequency', plant.wateringFrequency);
  setValue('notes', plant.notes);
  setValue('lastWatered', plant.lastWatered);
  setValue('status', plant.status);

  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function resetForm() {
  editingPlantId = null;
  plantForm.reset();
  setValue('plantId', '');
  setValue('sectionId', 'sectionA');
  setValue('status', 'thriving');
  setValue('plantType', 'flower');
  setValue('sunlight', 'full sun');
  setValue('wateringFrequency', 'daily');
  editorTitle.textContent = 'Add a Plant Spot';
  saveBtn.textContent = 'Save Plant Spot';
}

function renderGarden() {
  sectionsWrap.innerHTML = '';
  for (const section of SECTIONS) {
    const sectionCard = document.createElement('article');
    sectionCard.className = 'section-card';

    const title = document.createElement('h3');
    title.textContent = section.label;
    sectionCard.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'spots-grid';

    const plants = appState.sections[section.id];
    if (plants.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-note';
      empty.textContent = 'No plant spots yet. Add one below.';
      sectionCard.appendChild(empty);
    } else {
      plants.forEach((plant) => {
        grid.appendChild(createSpotCard(section.id, plant));
      });
      sectionCard.appendChild(grid);
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-secondary';
    addBtn.textContent = `+ Add plant to ${section.label}`;
    addBtn.addEventListener('click', () => {
      resetForm();
      setValue('sectionId', section.id);
      editorTitle.textContent = `Add a Plant Spot (${section.label})`;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    sectionCard.appendChild(addBtn);
    sectionsWrap.appendChild(sectionCard);
  }
}

function createSpotCard(sectionId, plant) {
  const card = document.createElement('div');
  card.className = 'spot-card';

  const ageText = plant.plantingDate ? `${getDaysSince(plant.plantingDate)} day(s) old` : 'No planting date';
  const waterInfo = getWateringStatus(plant);
  const daysSinceWatered = getDaysSince(plant.lastWatered);

  card.innerHTML = `
    <h4>${escapeHtml(plant.name || 'Unnamed Plant')}</h4>
    <p><strong>Status:</strong> ${plant.status}</p>
    <p><strong>Planted:</strong> ${formatDate(plant.plantingDate) || '—'} (${ageText})</p>
    <p><strong>Watered:</strong> ${formatDate(plant.lastWatered) || 'Not set'}${Number.isFinite(daysSinceWatered) ? ` (${daysSinceWatered} day(s) ago)` : ''}</p>
    <p><strong>Watering due:</strong> <span class="${waterInfo.className}">${waterInfo.label}</span></p>
    <p><strong>Quick note:</strong> ${escapeHtml(plant.notes || 'No note yet.')}</p>
  `;

  const actions = document.createElement('div');
  actions.className = 'spot-actions';

  actions.appendChild(makeButton('Mark watered today', 'btn-primary', () => markWateredToday(sectionId, plant.id)));
  actions.appendChild(makeButton('Edit', 'btn-secondary', () => startEdit(sectionId, plant.id)));
  actions.appendChild(makeButton('Remove', 'btn-danger', () => removePlant(sectionId, plant.id)));

  card.appendChild(actions);
  return card;
}

function getWateringStatus(plant) {
  const interval = WATERING_INTERVAL_DAYS[plant.wateringFrequency];
  if (!interval || !plant.lastWatered) {
    return { label: 'Unknown', className: 'status-watch' };
  }

  const days = getDaysSince(plant.lastWatered);
  if (!Number.isFinite(days)) return { label: 'Unknown', className: 'status-watch' };
  if (days >= interval) return { label: 'Due now', className: 'status-struggling' };
  if (days === interval - 1) return { label: 'Due soon', className: 'status-watch' };
  return { label: 'On track', className: 'status-thriving' };
}

function renderSeasonPanel() {
  const season = getCurrentSeason();
  seasonPill.textContent = `Current season: ${season.name}`;
  seasonTip.textContent = season.tip;
  seasonChange.textContent = `Next season (${season.nextSeason}) starts in ${season.daysToNextSeason} day(s).`;

  categoryTips.innerHTML = '';
  Object.entries(PLANT_TYPE_TIPS).forEach(([key, tip]) => {
    const li = document.createElement('li');
    li.textContent = `${capitalize(key)}: ${tip}`;
    categoryTips.appendChild(li);
  });
}

function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const boundaries = [
    { name: 'Spring', start: new Date(year, 2, 20), nextSeason: 'Summer', tip: 'Growth can speed up. Check soil moisture more often.' },
    { name: 'Summer', start: new Date(year, 5, 21), nextSeason: 'Fall', tip: 'Heat can dry pots faster. Shade stress can happen in hot afternoons.' },
    { name: 'Fall', start: new Date(year, 8, 22), nextSeason: 'Winter', tip: 'Growth may slow down. Ease up on heavy feeding.' },
    { name: 'Winter', start: new Date(year, 11, 21), nextSeason: 'Spring', tip: 'Many plants need less water now. Keep good window light.' }
  ];

  let season = boundaries[0];
  for (let i = boundaries.length - 1; i >= 0; i -= 1) {
    if (now >= boundaries[i].start) {
      season = boundaries[i];
      break;
    }
  }

  const nextStart = getNextSeasonStart(season.name, year);
  const daysToNextSeason = Math.max(0, Math.ceil((nextStart - now) / 86400000));
  return { ...season, daysToNextSeason };
}

function getNextSeasonStart(seasonName, year) {
  if (seasonName === 'Spring') return new Date(year, 5, 21);
  if (seasonName === 'Summer') return new Date(year, 8, 22);
  if (seasonName === 'Fall') return new Date(year, 11, 21);
  return new Date(year + 1, 2, 20);
}

function getDaysSince(dateString) {
  if (!dateString) return NaN;
  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return NaN;
  return Math.floor((new Date() - target) / 86400000);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function createPlantId() {
  return `plant-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function asEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function setValue(id, value) {
  document.getElementById(id).value = value || '';
}

function makeButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function sectionLabel(sectionId) {
  return sectionId === 'sectionB' ? 'Section B' : 'Section A';
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getTodayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
