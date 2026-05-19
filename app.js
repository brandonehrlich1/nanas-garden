const STORAGE_KEY = 'nanasGardenDataV3';
const PREVIOUS_STORAGE_KEY = 'nanasGardenDataV2';
const LEGACY_STORAGE_KEY = 'nanasGardenData';
const SECTIONS = [
  { id: 'sectionA', label: 'Raised Bed A' },
  { id: 'sectionB', label: 'Raised Bed B' }
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
  const cleanState = createEmptyState();
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) {
      return normalizeState(JSON.parse(currentRaw));
    }

    const previousRaw = localStorage.getItem(PREVIOUS_STORAGE_KEY);
    if (previousRaw) {
      const migrated = normalizeState(JSON.parse(previousRaw));
      saveState(migrated);
      return migrated;
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return cleanState;

    const legacyParsed = JSON.parse(legacyRaw);
    return migrateLegacyData(legacyParsed);
  } catch {
    return cleanState;
  }
}

function createEmptyState() {
  return {
    sections: { sectionA: [], sectionB: [] },
    beds: {
      sectionA: { backgroundImage: '' },
      sectionB: { backgroundImage: '' }
    }
  };
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
  const defaultZone = getDefaultZone(index);
  const name = String(plant.name || '').trim();
  return {
    id: String(plant.id || createPlantId()),
    sectionId: plant.sectionId === 'sectionB' ? 'sectionB' : 'sectionA',
    zoneLabel: String(plant.zoneLabel || plant.label || name || `Zone ${index + 1}`).trim(),
    zoneX: clampPercent(plant.zoneX ?? plant.x, defaultZone.x, 0, 92),
    zoneY: clampPercent(plant.zoneY ?? plant.y, defaultZone.y, 0, 92),
    zoneWidth: clampPercent(plant.zoneWidth ?? plant.width, defaultZone.width, 8, 100),
    zoneHeight: clampPercent(plant.zoneHeight ?? plant.height, defaultZone.height, 8, 100),
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
  editorTitle.textContent = plant.name ? `Tend ${plant.name} (${sectionLabel(sectionId)})` : `Plant ${plant.zoneLabel} (${sectionLabel(sectionId)})`;
  saveBtn.textContent = plant.name ? 'Update Growing Zone' : 'Plant This Zone';

  setValue('plantId', plant.id);
  setValue('sectionId', plant.sectionId);
  setValue('zoneLabel', plant.zoneLabel);
  setValue('zoneX', plant.zoneX);
  setValue('zoneY', plant.zoneY);
  setValue('zoneWidth', plant.zoneWidth);
  setValue('zoneHeight', plant.zoneHeight);
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
  setValue('zoneLabel', '');
  setValue('zoneX', 12);
  setValue('zoneY', 12);
  setValue('zoneWidth', 30);
  setValue('zoneHeight', 24);
  lookupInput.value = '';
  lookupStatus.textContent = '';
  showLookupPreview(null);
  editorTitle.textContent = 'Plant a Growing Zone';
  saveBtn.textContent = 'Save Growing Zone';
}

function renderGarden() {
  sectionsWrap.innerHTML = '';
  for (const section of SECTIONS) {
    const sectionCard = document.createElement('article');
    sectionCard.className = 'section-card';

    const header = document.createElement('div');
    header.className = 'section-card-head';
    header.innerHTML = `
      <div>
        <h3>${escapeHtml(section.label)}</h3>
        <p>A real-photo bed map with gentle tappable growing zones.</p>
      </div>
    `;
    sectionCard.appendChild(header);
    sectionCard.appendChild(createBedToolbar(section));
    sectionCard.appendChild(createBedMap(section));

    const plants = appState.sections[section.id];
    if (plants.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-note';
      empty.textContent = 'No mapped zones yet. Add a photo, then make the first cozy growing zone.';
      sectionCard.appendChild(empty);
    } else {
      const grid = document.createElement('div');
      grid.className = 'spots-grid';
      plants.forEach((plant) => {
        grid.appendChild(createSpotCard(section.id, plant));
      });
      sectionCard.appendChild(grid);
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-secondary';
    addBtn.textContent = `+ Plant a zone in ${section.label}`;
    addBtn.addEventListener('click', () => {
      resetForm();
      setValue('sectionId', section.id);
      setValue('zoneLabel', `New ${section.label} zone`);
      editorTitle.textContent = `Plant a Growing Zone (${section.label})`;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    sectionCard.appendChild(addBtn);
    sectionsWrap.appendChild(sectionCard);
  }
}

function createBedToolbar(section) {
  const toolbar = document.createElement('div');
  toolbar.className = 'bed-toolbar';

  const uploadLabel = document.createElement('label');
  uploadLabel.className = 'photo-upload btn-secondary';
  uploadLabel.textContent = appState.beds[section.id].backgroundImage ? 'Change bed photo' : 'Add bed photo';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', (event) => handleBedPhotoUpload(section.id, event));
  uploadLabel.appendChild(input);

  const zoneBtn = makeButton('+ Empty zone', 'btn-secondary', () => addEmptyZone(section.id));
  toolbar.appendChild(uploadLabel);
  toolbar.appendChild(zoneBtn);

  if (appState.beds[section.id].backgroundImage) {
    toolbar.appendChild(makeButton('Remove photo', 'btn-secondary', () => removeBedPhoto(section.id)));
  }

  return toolbar;
}

function createBedMap(section) {
  const bed = appState.beds[section.id];
  const map = document.createElement('div');
  map.className = bed.backgroundImage ? 'bed-map has-photo' : 'bed-map';

  if (bed.backgroundImage) {
    const img = document.createElement('img');
    img.src = bed.backgroundImage;
    img.alt = `${section.label} garden bed photo`;
    map.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'bed-placeholder';
    placeholder.innerHTML = `
      <span>🌿</span>
      <strong>Add the real ${escapeHtml(section.label)} photo</strong>
      <small>Then place growing zones over the picture.</small>
    `;
    map.appendChild(placeholder);
  }

  appState.sections[section.id].forEach((plant) => {
    map.appendChild(createZoneButton(section.id, plant));
  });

  return map;
}

function createZoneButton(sectionId, plant) {
  const zone = document.createElement('button');
  const waterInfo = getWateringStatus(plant);
  const isEmpty = !plant.name;
  zone.type = 'button';
  zone.className = `zone-marker ${isEmpty ? 'zone-empty' : 'zone-filled'}`;
  zone.style.left = `${plant.zoneX}%`;
  zone.style.top = `${plant.zoneY}%`;
  zone.style.width = `${plant.zoneWidth}%`;
  zone.style.height = `${plant.zoneHeight}%`;
  zone.setAttribute('aria-label', isEmpty ? `Plant ${plant.zoneLabel}` : `Open details for ${plant.name}`);
  zone.innerHTML = isEmpty ? `
    <span class="zone-label">${escapeHtml(plant.zoneLabel)}</span>
    <span class="zone-invite">Ready to plant</span>
  ` : `
    <span class="zone-label">${escapeHtml(plant.zoneLabel)}</span>
    <strong>${escapeHtml(plant.name)}</strong>
    <span>${escapeHtml(waterInfo.label)} · ${escapeHtml(plant.status)}</span>
    <small>${escapeHtml(plant.notes || 'Tap for notes & care')}</small>
  `;
  zone.addEventListener('click', () => startEdit(sectionId, plant.id));
  return zone;
}

function addEmptyZone(sectionId) {
  const index = appState.sections[sectionId].length;
  const defaults = getDefaultZone(index);
  const emptyZone = normalizePlant({
    id: createPlantId(),
    sectionId,
    zoneLabel: `Zone ${index + 1}`,
    zoneX: defaults.x,
    zoneY: defaults.y,
    zoneWidth: defaults.width,
    zoneHeight: defaults.height,
    status: 'watch',
    plantType: 'other',
    sunlight: 'unknown',
    wateringFrequency: 'unknown'
  }, index);

  appState.sections[sectionId].push(emptyZone);
  saveState(appState);
  renderGarden();
  startEdit(sectionId, emptyZone.id);
}

async function handleBedPhotoUpload(sectionId, event) {
  const [file] = event.target.files || [];
  if (!file) return;

  try {
    appState.beds[sectionId].backgroundImage = await readImageAsResizedDataUrl(file);
    saveState(appState);
    renderGarden();
  } catch (error) {
    alert(error.message || 'That photo could not be saved in this browser. Try a smaller image.');
  }
}

function removeBedPhoto(sectionId) {
  appState.beds[sectionId].backgroundImage = '';
  saveState(appState);
  renderGarden();
}

function createSpotCard(sectionId, plant) {
  const card = document.createElement('div');
  card.className = plant.name ? 'spot-card' : 'spot-card empty-zone-card';

  if (!plant.name) {
    card.innerHTML = `
      <h4>${escapeHtml(plant.zoneLabel)}</h4>
      <p>This mapped patch is waiting for something lovely.</p>
      <p><strong>Position:</strong> ${plant.zoneX}% / ${plant.zoneY}% · ${plant.zoneWidth}% × ${plant.zoneHeight}%</p>
    `;
  } else {
    const ageText = plant.plantingDate ? `${getDaysSince(plant.plantingDate)} day(s) old` : 'No planting date';
    const waterInfo = getWateringStatus(plant);
    const daysSinceWatered = getDaysSince(plant.lastWatered);

    card.innerHTML = `
      <h4>${escapeHtml(plant.name)} <span>${escapeHtml(plant.zoneLabel)}</span></h4>
      <p><strong>Health:</strong> ${escapeHtml(plant.status)}</p>
      <p><strong>Planted:</strong> ${formatDate(plant.plantingDate) || '—'} (${ageText})</p>
      <p><strong>Watered:</strong> ${formatDate(plant.lastWatered) || 'Not set'}${Number.isFinite(daysSinceWatered) ? ` (${daysSinceWatered} day(s) ago)` : ''}</p>
      <p><strong>Watering:</strong> <span class="${waterInfo.className}">${waterInfo.label}</span></p>
      <p><strong>Quick notes:</strong> ${escapeHtml(plant.notes || 'No note yet.')}</p>
      ${renderCareProfileForCard(plant.careProfile)}
    `;
  }

  const actions = document.createElement('div');
  actions.className = 'spot-actions';

  if (plant.name) {
    actions.appendChild(makeButton('Watered today', 'btn-primary', () => markWateredToday(sectionId, plant.id)));
  } else {
    actions.appendChild(makeButton('Plant here', 'btn-primary', () => startEdit(sectionId, plant.id)));
  }
  actions.appendChild(makeButton('Edit zone', 'btn-secondary', () => startEdit(sectionId, plant.id)));
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


function getDefaultZone(index) {
  const columns = 3;
  const row = Math.floor(index / columns);
  const col = index % columns;
  return {
    x: 6 + col * 31,
    y: 8 + (row % 3) * 29,
    width: 26,
    height: 22
  };
}

function clampPercent(value, fallback, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function readImageAsResizedDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The photo could not be prepared.'));
      img.onload = () => {
        const maxSize = 1400;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
  return sectionId === 'sectionB' ? 'Raised Bed B' : 'Raised Bed A';
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
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
