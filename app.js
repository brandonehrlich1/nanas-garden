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

const MOCK_PLANT_PROFILES = [
  makeMockProfile({
    lookupKey: 'bush early girl tomato',
    commonName: 'Bush Early Girl Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Compact determinate tomato. Keep soil evenly moist, support heavy fruiting stems, and feed regularly once fruit sets.',
    generatedTasks: [
      'Check pot moisture each morning during warm weather.',
      'Add or adjust a small cage as fruit clusters get heavier.',
      'Feed with tomato fertilizer every 2 weeks while fruiting.'
    ],
    tags: ['tomato', 'determinate', 'container friendly']
  }),
  makeMockProfile({
    lookupKey: 'roma tomato',
    commonName: 'Roma Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Paste tomato that likes steady moisture and support. Avoid overhead watering to reduce leaf disease pressure.',
    generatedTasks: [
      'Water deeply when the top inch of soil is dry.',
      'Tie stems to a stake or cage as the plant grows.',
      'Remove yellow lower leaves to improve airflow.'
    ],
    tags: ['tomato', 'paste', 'sauce']
  }),
  makeMockProfile({
    lookupKey: 'sweet million cherry tomato',
    commonName: 'Sweet Million Cherry Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Vigorous cherry tomato that can produce long clusters. Give strong support, steady water, and frequent harvesting.',
    generatedTasks: [
      'Harvest ripe cherry tomatoes every 1 to 2 days.',
      'Guide new vines back into the cage or onto supports.',
      'Feed lightly every 2 weeks during peak harvest.'
    ],
    tags: ['tomato', 'cherry', 'indeterminate']
  }),
  makeMockProfile({
    lookupKey: 'sun sugar tomato',
    commonName: 'Sun Sugar Tomato',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Sweet orange cherry tomato with vigorous growth. It benefits from a tall cage, even moisture, and regular picking.',
    generatedTasks: [
      'Pick orange ripe fruit often to keep production going.',
      'Check that vines are supported after storms or wind.',
      'Mulch the pot surface to help even out moisture.'
    ],
    tags: ['tomato', 'orange cherry', 'indeterminate']
  }),
  makeMockProfile({
    lookupKey: 'jalapeno pepper',
    commonName: 'Jalapeño Pepper',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'every 2-3 days',
    careNotes: 'Warm-season pepper. Let the top of the soil begin to dry between deep waterings, and harvest green or red peppers when firm.',
    generatedTasks: [
      'Check soil moisture every 2 to 3 days before watering.',
      'Harvest firm peppers to encourage more blooms.',
      'Watch for aphids on new growth and rinse them off early.'
    ],
    tags: ['pepper', 'hot pepper', 'container friendly']
  }),
  makeMockProfile({
    lookupKey: 'slicing cucumber',
    commonName: 'Slicing Cucumber',
    plantType: 'vegetable',
    sunlight: 'full sun',
    wateringFrequency: 'daily',
    careNotes: 'Fast-growing cucumber that needs consistent water and room to climb or trail. Pick fruit before it gets oversized.',
    generatedTasks: [
      'Water consistently so fruit does not turn bitter.',
      'Train vines onto a trellis or guide them away from other pots.',
      'Harvest cucumbers when they are firm and medium sized.'
    ],
    tags: ['cucumber', 'vine', 'slicing']
  }),
  makeMockProfile({
    lookupKey: 'marigold',
    commonName: 'Marigold',
    plantType: 'flower',
    sunlight: 'full sun',
    wateringFrequency: 'every 2-3 days',
    careNotes: 'Easy annual flower. Deadhead spent blooms and water at the soil line after the top layer begins to dry.',
    generatedTasks: [
      'Pinch off faded flowers weekly for more blooms.',
      'Water when the top inch of soil feels dry.',
      'Trim leggy stems to keep the plant bushy.'
    ],
    tags: ['flower', 'annual', 'pollinator friendly']
  })
];

const plantLookupProvider = createMockPlantLookupProvider(MOCK_PLANT_PROFILES);


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
const lookupInput = document.getElementById('lookupInput');
const lookupBtn = document.getElementById('lookupBtn');
const lookupStatus = document.getElementById('lookupStatus');
const lookupPreview = document.getElementById('lookupPreview');

plantForm.addEventListener('submit', handleSavePlant);
cancelEditBtn.addEventListener('click', resetForm);
lookupBtn.addEventListener('click', handlePlantLookup);

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
    status: asEnum(plant.status, ['thriving', 'watch', 'struggling', 'done/removed'], 'watch'),
    careProfile: normalizeCareProfile(plant.careProfile)
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
    status: formData.get('status'),
    careProfile: readCareProfileFromForm(formData)
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
  setValue('careProfile', plant.careProfile ? JSON.stringify(plant.careProfile) : '');
  lookupInput.value = plant.name || '';
  showLookupPreview(plant.careProfile);

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
  setValue('careProfile', '');
  lookupInput.value = '';
  lookupStatus.textContent = '';
  showLookupPreview(null);
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
    ${renderCareProfileForCard(plant.careProfile)}
  `;

  const actions = document.createElement('div');
  actions.className = 'spot-actions';

  actions.appendChild(makeButton('Mark watered today', 'btn-primary', () => markWateredToday(sectionId, plant.id)));
  actions.appendChild(makeButton('Edit', 'btn-secondary', () => startEdit(sectionId, plant.id)));
  actions.appendChild(makeButton('Remove', 'btn-danger', () => removePlant(sectionId, plant.id)));

  card.appendChild(actions);
  return card;
}


async function handlePlantLookup() {
  const query = lookupInput.value.trim() || document.getElementById('name').value.trim();
  if (!query) {
    lookupStatus.textContent = 'Enter a plant name or paste plant-tag text first.';
    lookupStatus.className = 'lookup-status status-watch';
    return;
  }

  lookupBtn.disabled = true;
  lookupStatus.textContent = 'Looking up local mock care profile...';
  lookupStatus.className = 'lookup-status';

  try {
    const result = await plantLookupProvider.lookupCareProfile(query);
    applyLookupResult(result);
    lookupStatus.textContent = `Suggested care profile found: ${result.commonName}`;
    lookupStatus.className = 'lookup-status status-thriving';
  } catch (error) {
    setValue('careProfile', '');
    showLookupPreview(null);
    lookupStatus.textContent = error.message || 'No local mock profile matched that plant yet.';
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
    <h3>Suggested Care Profile</h3>
    <p><strong>${escapeHtml(profile.commonName)}</strong> · ${escapeHtml(profile.sunlight)} · ${escapeHtml(profile.wateringFrequency)}</p>
    <p>${escapeHtml(profile.careNotes)}</p>
    ${renderTaskList(profile.generatedTasks)}
    <p class="lookup-source">Provider: ${escapeHtml(profile.provider)}${profile.matchedFrom ? ` · Matched: ${escapeHtml(profile.matchedFrom)}` : ''}</p>
  `;
}

function renderCareProfileForCard(profile) {
  if (!profile) return '';
  return `
    <div class="care-profile-card">
      <p><strong>Care notes:</strong> ${escapeHtml(profile.careNotes || 'No care notes generated.')}</p>
      ${renderTaskList(profile.generatedTasks, 'Generated tasks')}
    </div>
  `;
}

function renderTaskList(tasks, heading = 'Generated Tasks') {
  if (!Array.isArray(tasks) || tasks.length === 0) return '';
  return `
    <div class="task-list">
      <strong>${escapeHtml(heading)}:</strong>
      <ul>${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul>
    </div>
  `;
}

function createMockPlantLookupProvider(profiles) {
  const profilesByKey = new Map(profiles.map((profile) => [normalizeLookupText(profile.lookupKey), profile]));

  return {
    providerName: 'mock-local',
    async lookupCareProfile(query) {
      const normalizedQuery = normalizeLookupText(query);
      const matchedProfile = findMockProfile(normalizedQuery, profilesByKey);
      if (!matchedProfile) {
        throw new Error('No local mock profile matched that plant yet. Try one of the tomato, pepper, cucumber, or marigold examples.');
      }

      return normalizeCareProfile({
        ...matchedProfile,
        provider: this.providerName,
        matchedFrom: matchedProfile.commonName
      });
    }
  };
}

function findMockProfile(normalizedQuery, profilesByKey) {
  if (profilesByKey.has(normalizedQuery)) return profilesByKey.get(normalizedQuery);

  const queryTokens = new Set(normalizedQuery.split(' ').filter(Boolean));
  for (const [key, profile] of profilesByKey.entries()) {
    const keyTokens = key.split(' ').filter(Boolean);
    const everyKeyTokenFound = keyTokens.every((token) => queryTokens.has(token));
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery) || everyKeyTokenFound) {
      return profile;
    }
  }

  return null;
}

function normalizeLookupText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function makeMockProfile(profile) {
  return Object.freeze({ ...profile, provider: 'mock-local' });
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
