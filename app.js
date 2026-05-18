const STORAGE_KEY = 'nanasGardenData';
const sections = ['sectionA', 'sectionB'];

const defaultData = {
  sectionA: { name: '', date: '', notes: '' },
  sectionB: { name: '', date: '', notes: '' }
};

let appData = loadData();
let activeSection = 'sectionA';

const sectionTitle = document.getElementById('sectionTitle');
const plantForm = document.getElementById('plantForm');
const plantName = document.getElementById('plantName');
const plantDate = document.getElementById('plantDate');
const plantNotes = document.getElementById('plantNotes');

const savedName = document.getElementById('savedName');
const savedDate = document.getElementById('savedDate');
const savedNotes = document.getElementById('savedNotes');
const remindersList = document.getElementById('remindersList');
const seasonPill = document.getElementById('seasonPill');
const seasonChange = document.getElementById('seasonChange');

const sectionButtons = document.querySelectorAll('.section-btn');
sectionButtons.forEach((button) => {
  button.addEventListener('click', () => switchSection(button.dataset.section));
});

plantForm.addEventListener('submit', (event) => {
  event.preventDefault();

  appData[activeSection] = {
    name: plantName.value.trim(),
    date: plantDate.value,
    notes: plantNotes.value.trim()
  };

  saveData(appData);
  renderSection();
});

updateSeasonHeader();
renderSection();

function switchSection(sectionId) {
  activeSection = sectionId;
  sectionButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
  renderSection();
}

function renderSection() {
  const data = appData[activeSection];
  sectionTitle.textContent = activeSection === 'sectionA' ? 'Section A' : 'Section B';

  plantName.value = data.name;
  plantDate.value = data.date;
  plantNotes.value = data.notes;

  savedName.textContent = data.name || '—';
  savedDate.textContent = formatDate(data.date) || '—';
  savedNotes.textContent = data.notes || 'No notes yet.';

  renderReminders(data);
}

function renderReminders(data) {
  const reminders = getSeasonalReminders(data);
  remindersList.innerHTML = '';
  reminders.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    remindersList.appendChild(li);
  });
}

function getSeasonalReminders(data) {
  const season = getCurrentSeason();
  const reminders = [];

  reminders.push(`Current season: ${season.name}. ${season.tip}`);

  if (!data.date) {
    reminders.push('Add a planting date to track age-based reminders.');
  } else {
    const daysSincePlanting = getDaysSince(data.date);
    if (daysSincePlanting >= 0) {
      reminders.push(`Planted ${daysSincePlanting} day(s) ago. Check growth progress weekly.`);
    }
  }

  if (data.name) {
    reminders.push(`For ${data.name}, feel soil moisture every 2-3 days before watering.`);
  } else {
    reminders.push('Add a plant name to personalize reminders.');
  }

  if (season.daysToNextSeason <= 14) {
    reminders.push(`Season change coming in ${season.daysToNextSeason} day(s): prep for ${season.nextSeason}.`);
  }

  return reminders;
}

function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();

  const boundaries = [
    { name: 'Spring', start: new Date(year, 2, 20), nextSeason: 'Summer', tip: 'Watch for rapid growth; water when top soil is dry.' },
    { name: 'Summer', start: new Date(year, 5, 21), nextSeason: 'Fall', tip: 'Hot days may require more frequent watering.' },
    { name: 'Fall', start: new Date(year, 8, 22), nextSeason: 'Winter', tip: 'Reduce fertilizer and monitor cooler nights.' },
    { name: 'Winter', start: new Date(year, 11, 21), nextSeason: 'Spring', tip: 'Water less often and maximize indoor light.' }
  ];

  let season = boundaries[0];
  for (let i = boundaries.length - 1; i >= 0; i -= 1) {
    if (now >= boundaries[i].start) {
      season = boundaries[i];
      break;
    }
  }

  const nextStart = getNextSeasonStart(season.name, year);
  const daysToNextSeason = Math.ceil((nextStart - now) / (1000 * 60 * 60 * 24));

  return { ...season, daysToNextSeason };
}

function getNextSeasonStart(currentSeason, year) {
  if (currentSeason === 'Spring') return new Date(year, 5, 21);
  if (currentSeason === 'Summer') return new Date(year, 8, 22);
  if (currentSeason === 'Fall') return new Date(year, 11, 21);
  return new Date(year + 1, 2, 20);
}

function updateSeasonHeader() {
  const season = getCurrentSeason();
  seasonPill.textContent = `Now: ${season.name}`;
  seasonChange.textContent = `Next season (${season.nextSeason}) in ${season.daysToNextSeason} day(s).`;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return {
      sectionA: { ...defaultData.sectionA, ...parsed.sectionA },
      sectionB: { ...defaultData.sectionB, ...parsed.sectionB }
    };
  } catch {
    return { ...defaultData };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getDaysSince(dateString) {
  const planted = new Date(dateString + 'T00:00:00');
  const now = new Date();
  const diffMs = now - planted;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
