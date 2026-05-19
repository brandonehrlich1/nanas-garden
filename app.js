const STORAGE_KEY = 'nanasGardenDataV4';
const PREVIOUS_STORAGE_KEYS = ['nanasGardenDataV3', 'nanasGardenDataV2', 'nanasGardenData'];
const SECTIONS = [
  { id: 'sectionA', label: 'Upper Bed', nickname: 'Raised Bed A' },
  { id: 'sectionB', label: 'Lower Bed', nickname: 'Raised Bed B' }
];

const PLANT_TYPE_TIPS = {
  flower: 'Flowers usually like spent blooms pinched off and steady moisture.',
  herb: 'Herbs often do best with regular trimming and good light.',
  vegetable: 'Vegetables often need steady water and extra food as they produce.',
  other: 'Check the plant tag for the best specific care routine.'
};

const WATERING_INTERVAL_DAYS = {
  daily: 1,
  'every 2-3 days': 3,
  weekly: 7,
  unknown: null
};

const SPOT_PRESETS = {
  'upper-left': { label: 'Upper left', x: 22, y: 20 },
  'upper-middle': { label: 'Upper middle', x: 50, y: 25 },
  'upper-right': { label: 'Upper right', x: 74, y: 22 },
  'middle-left': { label: 'Middle left', x: 34, y: 50 },
  center: { label: 'Center', x: 54, y: 46 },
  'middle-right': { label: 'Middle right', x: 64, y: 48 },
  'lower-left': { label: 'Lower left', x: 30, y: 72 },
  'lower-middle': { label: 'Lower middle', x: 50, y: 74 },
  'lower-right': { label: 'Lower right', x: 74, y: 76 }
};

const MOCK_PLANT_PROFILES = [
  makeMockProfile({
    lookupKey: 'bush early girl tomato',
    commonName: 'Bush Early Girl Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Compact tomato. Keep soil evenly moist, support heavy fruiting stems, and feed regularly once fruit sets.',
    generatedTasks: ['Check soil moisture each morning during warm weather.', 'Adjust a small cage as fruit clusters get heavier.', 'Feed with tomato fertilizer every 2 weeks while fruiting.'],
    tags: ['tomato', 'determinate', 'container friendly']
  }),
  makeMockProfile({
    lookupKey: 'roma tomato',
    commonName: 'Roma Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Paste tomato that likes steady moisture and support. Water at the soil to help keep leaves dry.',
    generatedTasks: ['Water deeply when the top inch of soil is dry.', 'Tie stems to a stake or cage as the plant grows.', 'Remove yellow lower leaves to improve airflow.'],
    tags: ['tomato', 'paste', 'sauce']
  }),
  makeMockProfile({
    lookupKey: 'sweet million cherry tomato',
    commonName: 'Sweet Million Cherry Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Vigorous cherry tomato that can produce long clusters. Give strong support, steady water, and frequent harvesting.',
    generatedTasks: ['Harvest ripe cherry tomatoes every 1 to 2 days.', 'Guide new vines back into the cage or onto supports.', 'Feed lightly every 2 weeks during peak harvest.'],
    tags: ['tomato', 'cherry', 'indeterminate']
  }),
  makeMockProfile({
    lookupKey: 'sun sugar yellow cherry tomato',
    commonName: 'Sun Sugar Yellow Cherry Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Sweet yellow-orange cherry tomato with vigorous growth. It benefits from a tall cage, even moisture, and regular picking.',
    generatedTasks: ['Pick ripe fruit often to keep production going.', 'Check that vines are supported after storms or wind.', 'Mulch the soil surface to help even out moisture.'],
    tags: ['tomato', 'yellow cherry', 'indeterminate']
  }),
  makeMockProfile({
    lookupKey: 'jalapeno pepper',
    commonName: 'Jalapeño Pepper',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'every 2-3 days',
    careNotes: 'Warm-season pepper. Let the top of the soil begin to dry between deep waterings, and harvest green or red peppers when firm.',
    generatedTasks: ['Check soil moisture every 2 to 3 days before watering.', 'Harvest firm peppers to encourage more blooms.', 'Watch for aphids on new growth and rinse them off early.'],
    tags: ['pepper', 'hot pepper', 'container friendly']
  }),
  makeMockProfile({
    lookupKey: 'slicing cucumber',
    commonName: 'Slicing Cucumber',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Fast-growing cucumber that needs consistent water and room to climb or trail. Pick fruit before it gets oversized.',
    generatedTasks: ['Water consistently so fruit does not turn bitter.', 'Guide vines away from other plants.', 'Harvest cucumbers when they are firm and medium sized.'],
    tags: ['cucumber', 'vine', 'slicing']
  }),
  makeMockProfile({
    lookupKey: 'marigold',
    commonName: 'Marigold',
    plantType: 'flower',
    sunlight: 'full sun',
    wateringFrequency: 'every 2-3 days',
    careNotes: 'Easy annual flower. Deadhead spent blooms and water at the soil line after the top layer begins to dry.',
    generatedTasks: ['Pinch off faded flowers weekly for more blooms.', 'Water when the top inch of soil feels dry.', 'Trim leggy stems to keep the plant bushy.'],
    tags: ['flower', 'annual', 'pollinator friendly']
  })
];

const plantLookupProvider = createMockPlantLookupProvider(MOCK_PLANT_PROFILES);

let appState = loadState();
let editingPlantId = null;
let openSheetPlant = null;

const seasonPill = document.getElementById('seasonPill');
const seasonTip = document.getElementById('seasonTip');
const seasonChange = document.getElementById('seasonChange');
const categoryTips = document.getElementById('categoryTips');
const sectionsWrap = document.getElementById('sectionsWrap');
const dailySummary = document.getElementById('dailySummary');
const plantForm = document.getElementById('plantForm');
const editorTitle = document.getElementById('editorTitle');
const editorDetails = document.getElementById('editorDetails');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const showAddPlantBtn = document.getElementById('showAddPlantBtn');
const lookupInput = document.getElementById('lookupInput');
const lookupBtn = document.getElementById('lookupBtn');
const lookupStatus = document.getElementById('lookupStatus');
const lookupPreview = document.getElementById('lookupPreview');
const plantSheet = document.getElementById('plantSheet');
const plantSheetContent = document.getElementById('plantSheetContent');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const closeSheetBtn = document.getElementById('closeSheetBtn');

plantForm.addEventListener('submit', handleSavePlant);
cancelEditBtn.addEventListener('click', resetForm);
lookupBtn.addEventListener('click', handlePlantLookup);
showAddPlantBtn.addEventListener('click', openAddPlantForm);
document.getElementById('sectionId').addEventListener('change', updateHiddenSpotFields);
document.getElementById('spotPreset').addEventListener('change', updateHiddenSpotFields);
closeSheetBtn.addEventListener('click', closePlantSheet);
sheetBackdrop.addEventListener('click', closePlantSheet);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePlantSheet();
});

renderSeasonPanel();
renderGarden();
renderDailySummary();
resetForm();

function loadState() {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) return normalizeState(JSON.parse(currentRaw));

    for (const key of PREVIOUS_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const migrated = key === 'nanasGardenData' ? migrateLegacyData(JSON.parse(raw)) : normalizeState(JSON.parse(raw));
      saveState(migrated);
      return migrated;
    }

    const seeded = createSeededState();
    saveState(seeded);
    return seeded;
  } catch {
    const seeded = createSeededState();
    saveState(seeded);
    return seeded;
  }
}

function createEmptyState() {
  return {
    sections: { sectionA: [], sectionB: [] },
    beds: { sectionA: { backgroundImage: '' }, sectionB: { backgroundImage: '' } }
  };
}

function createSeededState() {
  const plantedOn = '2026-05-01';
  const lastWatered = getTodayISO();
  const seed = createEmptyState();
  seed.sections.sectionA = [
    seedPlant('sectionA', 'Bush Early Girl Tomato', 'upper-right', 72, 18, '🍅', plantedOn, lastWatered, 'Already tucked into the upper right of the upper bed.'),
    seedPlant('sectionA', 'Sun Sugar Yellow Cherry Tomato', 'middle-right', 64, 48, '🍅', plantedOn, lastWatered, 'A sweet yellow cherry tomato in the middle right.'),
    seedPlant('sectionA', 'Sweet Million Cherry Tomato', 'lower-right', 72, 74, '🍅', plantedOn, lastWatered, 'Cherry tomato in the lower right corner.'),
    seedPlant('sectionA', 'Roma Tomato', 'lower-left', 30, 72, '🍅', plantedOn, lastWatered, 'Roma tomato in the lower left.'),
    seedPlant('sectionA', 'Marigold cluster', 'middle-left', 38, 45, '🌼', plantedOn, lastWatered, 'Bright companion flowers near the middle left.'),
    seedPlant('sectionA', 'Marigold cluster', 'upper-middle', 50, 25, '🌼', plantedOn, lastWatered, 'Sunny marigolds near the upper middle.')
  ];
  seed.sections.sectionB = [
    seedPlant('sectionB', 'Slicing Cucumber', 'upper-left', 22, 20, '🥒', plantedOn, lastWatered, 'Cucumber placed in the upper left.'),
    seedPlant('sectionB', 'Jalapeño Pepper', 'upper-right', 74, 22, '🌶️', plantedOn, lastWatered, 'Pepper plant in the upper right.'),
    seedPlant('sectionB', 'Marigold cluster', 'middle-left', 34, 50, '🌼', plantedOn, lastWatered, 'Marigolds in the center-left area.'),
    seedPlant('sectionB', 'Marigold cluster', 'center', 54, 46, '🌼', plantedOn, lastWatered, 'Marigolds blooming near the center.'),
    seedPlant('sectionB', 'Tomato plant', 'lower-right', 74, 76, '🍅', plantedOn, lastWatered, 'Tomato plant in the lower right.')
  ];
  return seed;
}

function seedPlant(sectionId, name, spotPreset, x, y, icon, plantingDate, lastWatered, notes) {
  const profile = getSeedCareProfile(name);
  return normalizePlant({
    id: `seed-${sectionId}-${normalizeLookupText(name)}-${x}-${y}`,
    sectionId,
    zoneLabel: SPOT_PRESETS[spotPreset]?.label || 'Garden spot',
    zoneX: x,
    zoneY: y,
    zoneWidth: 18,
    zoneHeight: 18,
    icon,
    name,
    plantType: profile?.plantType || (name.toLowerCase().includes('marigold') ? 'flower' : 'vegetable'),
    plantingDate,
    sunlight: profile?.sunlight || 'full sun',
    wateringFrequency: profile?.wateringFrequency || 'unknown',
    notes,
    lastWatered,
    status: 'thriving',
    careProfile: profile
  });
}

function getSeedCareProfile(name) {
  const lookupName = name.toLowerCase().includes('marigold') ? 'marigold' : name;
  const matched = findMockProfile(normalizeLookupText(lookupName), new Map(MOCK_PLANT_PROFILES.map((profile) => [normalizeLookupText(profile.lookupKey), profile])));
  return matched ? normalizeCareProfile({ ...matched, provider: 'mock-local', matchedFrom: matched.commonName }) : null;
}

function normalizeState(state) {
  const base = createEmptyState();
  if (!state || typeof state !== 'object' || !state.sections) return base;
  for (const section of SECTIONS) {
    const spots = Array.isArray(state.sections[section.id]) ? state.sections[section.id] : [];
    base.sections[section.id] = spots.map((plant, index) => normalizePlant(plant, index)).filter(Boolean);
    base.beds[section.id] = normalizeBed(state.beds?.[section.id]);
  }
  return base;
}

function normalizeBed(bed) {
  return { backgroundImage: typeof bed?.backgroundImage === 'string' ? bed.backgroundImage : '' };
}

function normalizePlant(plant, index = 0) {
  if (!plant || typeof plant !== 'object') return null;
  const defaultSpot = getDefaultSpot(index);
  const name = String(plant.name || '').trim();
  return {
    id: String(plant.id || createPlantId()),
    sectionId: plant.sectionId === 'sectionB' ? 'sectionB' : 'sectionA',
    zoneLabel: String(plant.zoneLabel || plant.label || defaultSpot.label || 'Garden spot').trim(),
    zoneX: clampPercent(plant.zoneX ?? plant.x, defaultSpot.x, 0, 92),
    zoneY: clampPercent(plant.zoneY ?? plant.y, defaultSpot.y, 0, 92),
    zoneWidth: clampPercent(plant.zoneWidth ?? plant.width, 18, 12, 32),
    zoneHeight: clampPercent(plant.zoneHeight ?? plant.height, 18, 12, 32),
    icon: String(plant.icon || getPlantIcon(name, plant.plantType)).trim(),
    name,
    plantType: asEnum(plant.plantType, ['flower', 'herb', 'vegetable', 'other'], 'other'),
    plantingDate: plant.plantingDate || '',
    sunlight: asEnum(plant.sunlight, ['full sun', 'partial sun', 'shade', 'unknown'], 'unknown'),
    wateringFrequency: asEnum(plant.wateringFrequency, ['daily', 'every 2-3 days', 'weekly', 'unknown'], 'unknown'),
    notes: String(plant.notes || '').trim(),
    lastWatered: plant.lastWatered || '',
    status: asEnum(plant.status, ['thriving', 'watch', 'struggling', 'done/removed'], 'watch'),
    careProfile: normalizeCareProfile(plant.careProfile)
  };
}

function migrateLegacyData(legacyData) {
  const state = createEmptyState();
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
  return state;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleSavePlant(event) {
  event.preventDefault();
  const plant = readPlantFromForm();
  if (editingPlantId) updatePlant(plant);
  else addPlant(plant);
  saveState(appState);
  renderGarden();
  renderDailySummary();
  openPlantSheet(plant.sectionId, plant.id);
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
    status: formData.get('status'),
    careProfile: readCareProfileFromForm(formData),
    zoneLabel: formData.get('zoneLabel'),
    zoneX: formData.get('zoneX'),
    zoneY: formData.get('zoneY'),
    zoneWidth: formData.get('zoneWidth'),
    zoneHeight: formData.get('zoneHeight')
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
  renderDailySummary();
  closePlantSheet();
  if (editingPlantId === plantId) resetForm();
}

function markWateredToday(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;
  plant.lastWatered = getTodayISO();
  saveState(appState);
  renderGarden();
  renderDailySummary();
  openPlantSheet(sectionId, plantId);
  if (editingPlantId === plantId) setValue('lastWatered', plant.lastWatered);
}

function addNote(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;
  const note = window.prompt(`Add a note for ${plant.name}:`, plant.notes || '');
  if (note === null) return;
  plant.notes = note.trim();
  saveState(appState);
  renderGarden();
  renderDailySummary();
  openPlantSheet(sectionId, plantId);
}

function startEdit(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;
  editingPlantId = plantId;
  editorDetails.open = true;
  editorTitle.textContent = plant.name ? `Edit ${plant.name}` : 'Add a Plant';
  saveBtn.textContent = plant.name ? 'Save Changes' : 'Save Plant';
  setValue('plantId', plant.id);
  setValue('sectionId', plant.sectionId);
  setValue('zoneLabel', plant.zoneLabel);
  setValue('zoneX', plant.zoneX);
  setValue('zoneY', plant.zoneY);
  setValue('zoneWidth', plant.zoneWidth);
  setValue('zoneHeight', plant.zoneHeight);
  setValue('spotPreset', getNearestSpotPreset(plant.zoneX, plant.zoneY));
  setValue('name', plant.name);
  setValue('plantType', plant.plantType);
  setValue('plantingDate', plant.plantingDate);
  setValue('sunlight', plant.sunlight);
  setValue('wateringFrequency', plant.wateringFrequency);
  setValue('notes', plant.notes);
  setValue('lastWatered', plant.lastWatered);
  setValue('status', plant.status);
  setValue('careProfile', plant.careProfile ? JSON.stringify(plant.careProfile) : '');
  lookupInput.value = plant.name || '';
  showLookupPreview(plant.careProfile);
  document.getElementById('editorPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openAddPlantForm() {
  resetForm();
  editorDetails.open = true;
  document.getElementById('editorPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editingPlantId = null;
  plantForm.reset();
  setValue('plantId', '');
  setValue('sectionId', 'sectionA');
  setValue('spotPreset', 'center');
  setValue('status', 'thriving');
  setValue('plantType', 'vegetable');
  setValue('sunlight', 'full sun');
  setValue('wateringFrequency', 'daily');
  setValue('plantingDate', getTodayISO());
  setValue('lastWatered', '');
  setValue('careProfile', '');
  updateHiddenSpotFields();
  lookupInput.value = '';
  lookupStatus.textContent = '';
  showLookupPreview(null);
  editorTitle.textContent = 'Add or Edit a Plant';
  saveBtn.textContent = 'Save Plant';
}

function updateHiddenSpotFields() {
  const preset = SPOT_PRESETS[document.getElementById('spotPreset').value] || SPOT_PRESETS.center;
  setValue('zoneLabel', preset.label);
  setValue('zoneX', preset.x);
  setValue('zoneY', preset.y);
  setValue('zoneWidth', 18);
  setValue('zoneHeight', 18);
}

function renderGarden() {
  sectionsWrap.innerHTML = '';
  for (const section of SECTIONS) {
    const sectionCard = document.createElement('article');
    sectionCard.className = 'section-card';
    sectionCard.innerHTML = `
      <div class="section-card-head">
        <div>
          <h3>${escapeHtml(section.label)}</h3>
          <p>${escapeHtml(section.nickname)} · tap any plant</p>
        </div>
      </div>
    `;
    sectionCard.appendChild(createBedMap(section));
    sectionsWrap.appendChild(sectionCard);
  }
}

function createBedMap(section) {
  const map = document.createElement('div');
  map.className = `bed-map bed-map-${section.id}`;
  map.setAttribute('aria-label', `${section.label} virtual raised bed`);
  map.innerHTML = `
    <div class="soil-texture" aria-hidden="true"></div>
    <div class="bed-path bed-path-top" aria-hidden="true"></div>
    <div class="bed-path bed-path-bottom" aria-hidden="true"></div>
  `;
  appState.sections[section.id].forEach((plant) => {
    map.appendChild(createPlantMarker(section.id, plant));
  });
  map.addEventListener('click', (event) => handleBedTap(event, section.id, map));
  return map;
}

function createPlantMarker(sectionId, plant) {
  const marker = document.createElement('button');
  const waterInfo = getWateringStatus(plant);
  marker.type = 'button';
  marker.className = `plant-marker plant-${plant.plantType}`;
  marker.style.left = `${plant.zoneX}%`;
  marker.style.top = `${plant.zoneY}%`;
  marker.setAttribute('aria-label', `Open ${plant.name || 'plant'} details`);
  marker.innerHTML = `
    <span class="plant-icon" aria-hidden="true">${escapeHtml(getPlantArt(plant))}</span>
    <span class="plant-name">${escapeHtml(plant.name || 'New plant')}</span>
    <span class="plant-water ${waterInfo.className}">${escapeHtml(getGrowthStageLabel(plant))}</span>
  `;
  marker.dataset.plantId = plant.id;
  marker.addEventListener('click', (e) => { e.stopPropagation(); openPlantSheet(sectionId, plant.id); highlightSelection(plant.id);});
  return marker;
}

function openPlantSheet(sectionId, plantId) {
  const plant = appState.sections[sectionId].find((item) => item.id === plantId);
  if (!plant) return;
  openSheetPlant = { sectionId, plantId };
  const waterInfo = getWateringStatus(plant);
  plantSheetContent.innerHTML = `
    <p class="sheet-kicker">${escapeHtml(sectionLabel(sectionId))}</p>
    <p class='sheet-kicker'>A cozy check-in</p><h2><span class='plant-art'>${escapeHtml(getPlantArt(plant))}</span> ${escapeHtml(plant.name)}</h2>
    <div class="sheet-info">
      <p><strong>What it likes</strong><span>${escapeHtml(getCareSummary(plant))}</span></p>
      <p><strong>Watch for</strong><span>${escapeHtml(getWatchFor(plant))}</span></p>
      <p><strong>Water status</strong><span class="${waterInfo.className}">${escapeHtml(waterInfo.label)} · ${escapeHtml(formatDate(plant.lastWatered) || 'Not watered yet')}</span></p>
      <p><strong>Notes</strong><span>${escapeHtml(plant.notes || 'No note yet.')}</span></p>
    </div>
    <p><strong>Helpful tasks</strong></p>${renderCareTasks(plant.careProfile)}
    <div class="sheet-actions" id="sheetActions"></div>
  `;
  const actions = plantSheetContent.querySelector('#sheetActions');
  actions.appendChild(makeButton('Watered Today', 'btn-primary', () => markWateredToday(sectionId, plant.id)));
  actions.appendChild(makeButton('Add Note', 'btn-secondary', () => addNote(sectionId, plant.id)));
  actions.appendChild(makeButton('Edit Name', 'btn-secondary', () => startEdit(sectionId, plant.id)));
  actions.appendChild(makeButton('Remove', 'btn-danger quiet-danger', () => removePlant(sectionId, plant.id)));
  plantSheet.hidden = false;
  sheetBackdrop.hidden = false;
  requestAnimationFrame(() => plantSheet.classList.add('is-open'));
}

function closePlantSheet() {
  openSheetPlant = null;
  plantSheet.classList.remove('is-open');
  plantSheet.hidden = true;
  sheetBackdrop.hidden = true;
}

async function handlePlantLookup() {
  const query = lookupInput.value.trim() || document.getElementById('name').value.trim();
  if (!query) {
    lookupStatus.textContent = 'Enter a plant name first.';
    lookupStatus.className = 'lookup-status status-watch';
    return;
  }
  lookupBtn.disabled = true;
  lookupStatus.textContent = 'Looking up your plant...';
  lookupStatus.className = 'lookup-status';
  try {
    const result = await plantLookupProvider.lookupCareProfile(query);
    applyLookupResult(result);
    lookupStatus.textContent = `I found a likely match: ${result.commonName}.`; 
    lookupStatus.className = 'lookup-status status-thriving';
  } catch (error) {
    setValue('careProfile', '');
    showLookupPreview(null);
    lookupStatus.textContent = 'I could not find a close match yet. Try a simple name like Roma tomato.';
    lookupStatus.className = 'lookup-status status-struggling';
  } finally {
    lookupBtn.disabled = false;
  }
}

function applyLookupResult(result) {
  setValue('name', result.commonName);
  setValue('plantType', result.plantType);
  setValue('sunlight', result.sunlight);
  setValue('wateringFrequency', result.wateringFrequency);
  setValue('notes', result.careNotes);
  setValue('careProfile', JSON.stringify(result));
  showLookupPreview(result);
  saveBtn.textContent = 'Save to Garden';
}

function readCareProfileFromForm(formData) {
  const rawProfile = formData.get('careProfile');
  if (!rawProfile) return null;
  try {
    return normalizeCareProfile(JSON.parse(rawProfile));
  } catch {
    return null;
  }
}

function normalizeCareProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const generatedTasks = Array.isArray(profile.generatedTasks)
    ? profile.generatedTasks.map((task) => String(task).trim()).filter(Boolean).slice(0, 6)
    : [];
  const tags = Array.isArray(profile.tags)
    ? profile.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 6)
    : [];
  return {
    provider: String(profile.provider || 'mock-local'),
    matchedFrom: String(profile.matchedFrom || '').trim(),
    commonName: String(profile.commonName || '').trim(),
    plantType: asEnum(profile.plantType, ['flower', 'herb', 'vegetable', 'other'], 'other'),
    sunlight: asEnum(profile.sunlight, ['full sun', 'partial sun', 'shade', 'unknown'], 'unknown'),
    wateringFrequency: asEnum(profile.wateringFrequency, ['daily', 'every 2-3 days', 'weekly', 'unknown'], 'unknown'),
    careNotes: String(profile.careNotes || '').trim(),
    generatedTasks,
    tags
  };
}

function showLookupPreview(profile) {
  if (!profile) {
    lookupPreview.innerHTML = '';
    lookupPreview.hidden = true;
    return;
  }
  lookupPreview.hidden = false;
  lookupPreview.innerHTML = `
    <h3>Care Tips</h3>
    <p><strong>${escapeHtml(profile.commonName)}</strong> · ${escapeHtml(profile.sunlight)} · ${escapeHtml(profile.wateringFrequency)}</p>
    <p>${escapeHtml(profile.careNotes)}</p>
  `;
}

function renderCareTasks(profile) {
  if (!profile || !Array.isArray(profile.generatedTasks) || profile.generatedTasks.length === 0) return '';
  return `<div class="care-tasks"><strong>Gentle reminders</strong><ul>${profile.generatedTasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul></div>`;
}

function getCareSummary(plant) {
  if (plant.careProfile?.careNotes) return plant.careProfile.careNotes;
  return PLANT_TYPE_TIPS[plant.plantType] || PLANT_TYPE_TIPS.other;
}

function createMockPlantLookupProvider(profiles) {
  const profilesByKey = new Map(profiles.map((profile) => [normalizeLookupText(profile.lookupKey), profile]));
  return {
    providerName: 'mock-local',
    async lookupCareProfile(query) {
      const normalizedQuery = normalizeLookupText(query);
      const matchedProfile = findMockProfile(normalizedQuery, profilesByKey);
      if (!matchedProfile) throw new Error('No local care tips matched that plant yet. Try tomato, cucumber, jalapeño, or marigold.');
      return normalizeCareProfile({ ...matchedProfile, provider: this.providerName, matchedFrom: matchedProfile.commonName });
    }
  };
}

function findMockProfile(normalizedQuery, profilesByKey) {
  if (profilesByKey.has(normalizedQuery)) return profilesByKey.get(normalizedQuery);
  const queryTokens = new Set(normalizedQuery.split(' ').filter(Boolean));
  for (const [key, profile] of profilesByKey.entries()) {
    const keyTokens = key.split(' ').filter(Boolean);
    const everyKeyTokenFound = keyTokens.every((token) => queryTokens.has(token));
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery) || everyKeyTokenFound) return profile;
  }
  if (normalizedQuery.includes('tomato')) return profilesByKey.get('roma tomato');
  return null;
}

function normalizeLookupText(text) {
  return String(text || '').toLowerCase().replace(/[ñ]/g, 'n').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function makeMockProfile(profile) {
  return Object.freeze({ ...profile, provider: 'mock-local' });
}

function getWateringStatus(plant) {
  const interval = WATERING_INTERVAL_DAYS[plant.wateringFrequency];
  if (!interval || !plant.lastWatered) return { label: 'Check water', className: 'status-watch' };
  const days = getDaysSince(plant.lastWatered);
  if (!Number.isFinite(days)) return { label: 'Check water', className: 'status-watch' };
  if (days >= interval) return { label: 'Water today', className: 'status-struggling' };
  if (days === interval - 1) return { label: 'Water soon', className: 'status-watch' };
  return { label: 'Watered', className: 'status-thriving' };
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
    { name: 'Summer', start: new Date(year, 5, 21), nextSeason: 'Fall', tip: 'Heat can dry raised beds faster. Morning watering is gentle on plants.' },
    { name: 'Fall', start: new Date(year, 8, 22), nextSeason: 'Winter', tip: 'Growth may slow down. Ease up on heavy feeding.' },
    { name: 'Winter', start: new Date(year, 11, 21), nextSeason: 'Spring', tip: 'Many plants need less water now. Watch for cold snaps.' }
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

function getDefaultSpot(index) {
  const presets = Object.values(SPOT_PRESETS);
  return presets[index % presets.length];
}

function getNearestSpotPreset(x, y) {
  let nearest = 'center';
  let nearestDistance = Infinity;
  for (const [key, preset] of Object.entries(SPOT_PRESETS)) {
    const distance = Math.hypot(Number(x) - preset.x, Number(y) - preset.y);
    if (distance < nearestDistance) {
      nearest = key;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function getPlantIcon(name, plantType) {
  const text = String(name || '').toLowerCase();
  if (text.includes('tomato')) return '🍅';
  if (text.includes('marigold')) return '🌼';
  if (text.includes('cucumber')) return '🥒';
  if (text.includes('pepper') || text.includes('jalape')) return '🌶️';
  if (plantType === 'flower') return '🌸';
  if (plantType === 'herb') return '🌿';
  return '🌱';
}

function clampPercent(value, fallback, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
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
  document.getElementById(id).value = value ?? '';
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
  return sectionId === 'sectionB' ? 'Lower Bed' : 'Upper Bed';
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function handleBedTap(event, sectionId, map) {
  if (event.target.closest('.plant-marker')) return;
  const rect = map.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  map.style.setProperty('--tap-x', `${x}%`);
  map.style.setProperty('--tap-y', `${y}%`);
  map.style.setProperty('--tap-visible', '1');
  setTimeout(() => map.style.setProperty('--tap-visible', '0'), 250);
  const plants = appState.sections[sectionId] || [];
  let nearest = null;
  let best = 9;
  plants.forEach((p)=>{const d=Math.hypot(p.zoneX-x,p.zoneY-y); if (d<best){best=d; nearest=p;}});
  if (nearest) { openPlantSheet(sectionId, nearest.id); highlightSelection(nearest.id); return; }
  showEmptyPlacement(map, x, y);
  openAddAt(sectionId, x, y);
}
function openAddAt(sectionId, x, y){
  openAddPlantForm();
  setValue('sectionId', sectionId);
  setValue('zoneLabel','Garden spot');
  setValue('zoneX', Math.round(x));
  setValue('zoneY', Math.round(y));
  setValue('zoneWidth',18);setValue('zoneHeight',18);
  lookupInput.focus();
  lookupStatus.textContent='What did the plant tag say?';
}
function showEmptyPlacement(map,x,y){const d=document.createElement('div');d.className='empty-placement';d.style.left=`${x}%`;d.style.top=`${y}%`;map.appendChild(d);setTimeout(()=>d.remove(),900);}
function highlightSelection(plantId){document.querySelectorAll('.plant-marker').forEach((n)=>n.classList.toggle('is-selected',n.dataset.plantId===plantId));}
function getPlantArt(plant){ return plant.icon || getPlantIcon(plant.name, plant.plantType);}
function getWatchFor(plant){ if (plant.plantType==='flower') return 'Faded blooms and thirsty soil.'; if (plant.name.toLowerCase().includes('tomato')) return 'Droopy leaves in heat and crowded vines.'; return 'Dry soil and changes in leaf color.';}
function renderDailySummary(){
  const lines=[];
  for (const section of SECTIONS){for (const plant of appState.sections[section.id]){const w=getWateringStatus(plant); if (w.label==='Water today') lines.push(`${plant.name} may need water today.`); if (plant.name.toLowerCase().includes('marigold')) lines.push('Marigolds are blooming happily.'); if (plant.name.toLowerCase().includes('cucumber')) lines.push('Check cucumber vines for fresh new growth.');}}
  if (!lines.length) lines.push('Everything looks calm today — take a happy peek at your beds.');
  lines.push('Warm days can dry raised beds faster this week.');
  dailySummary.innerHTML = `<h3>Today in Nana\'s Garden</h3><ul>${[...new Set(lines)].slice(0,4).map(l=>`<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

function getGrowthStageLabel(plant){const d=getDaysSince(plant.plantingDate);if(!Number.isFinite(d)||d<14)return "seedling";if(d<35)return "growing";if((plant.plantType==="flower"&&d>=35)||d<60)return "flowering";if(d<85)return "fruiting";return "harvest-ready";}
