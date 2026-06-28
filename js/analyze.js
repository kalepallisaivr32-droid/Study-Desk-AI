/* =====================================================
   analyze.js – Analyze Desk page logic
   Gemini Vision API integration + UI handling
   ===================================================== */

'use strict';

// ── Constants ─────────────────────────────────────────
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const SESSION_KEY_API = 'studyDeskAI_geminiKey';

// ── State ─────────────────────────────────────────────
let uploadedFile    = null;
let uploadedDataUrl = null;

// ── Elements ──────────────────────────────────────────
const apiKeyInput    = document.getElementById('api-key-input');
const btnSaveKey     = document.getElementById('btn-save-key');
const keyStatus      = document.getElementById('key-status');
const uploadArea     = document.getElementById('upload-area');
const fileInput      = document.getElementById('file-input');
const previewArea    = document.getElementById('preview-area');
const previewImg     = document.getElementById('preview-img');
const previewFname   = document.getElementById('preview-filename');
const previewSize    = document.getElementById('preview-size');
const btnAnalyze     = document.getElementById('btn-analyze');
const btnChangeImg   = document.getElementById('btn-change-img');
const btnAnalyzeAgain = document.getElementById('btn-analyze-again');
const overlay        = document.getElementById('analyzing-overlay');
const resultsSection = document.getElementById('results-section');

// ════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ════════════════════════════════════════════════════
function loadSavedKey() {
  const saved = sessionStorage.getItem(SESSION_KEY_API);
  if (saved) {
    apiKeyInput.value = saved;
    setKeyStatus(true);
  }
}

function setKeyStatus(active) {
  if (active) {
    keyStatus.textContent = '✅ Key Active';
    keyStatus.className   = 'key-status active';
  } else {
    keyStatus.textContent = '⛔ No Key';
    keyStatus.className   = 'key-status inactive';
  }
}

btnSaveKey.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key || !key.startsWith('AIza')) {
    showToast('Please enter a valid Gemini API key (starts with AIza...)');
    setKeyStatus(false);
    return;
  }
  sessionStorage.setItem(SESSION_KEY_API, key);
  setKeyStatus(true);
  showToast('API key saved for this session!', 'success');
});

apiKeyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnSaveKey.click();
});

loadSavedKey();

// ════════════════════════════════════════════════════
// FILE UPLOAD & DRAG/DROP
// ════════════════════════════════════════════════════
function validateAndLoadFile(file) {
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Invalid file type. Please upload JPG, PNG, or WEBP images.');
    return;
  }

  const maxSizeMB = 20;
  if (file.size > maxSizeMB * 1024 * 1024) {
    showToast(`File too large. Maximum size is ${maxSizeMB}MB.`);
    return;
  }

  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedDataUrl = e.target.result;
    showPreview(file, uploadedDataUrl);
  };
  reader.readAsDataURL(file);
}

function showPreview(file, dataUrl) {
  previewImg.src = dataUrl;
  document.getElementById('result-img').src = dataUrl;
  previewFname.textContent = file.name;
  previewSize.textContent  = formatBytes(file.size);
  uploadArea.classList.add('hidden');
  previewArea.classList.remove('hidden');
  resultsSection.classList.add('hidden');
  window.scrollTo({ top: uploadArea.offsetTop - 100, behavior: 'smooth' });
}

function resetUpload() {
  uploadedFile    = null;
  uploadedDataUrl = null;
  fileInput.value = '';
  previewArea.classList.add('hidden');
  uploadArea.classList.remove('hidden');
  resultsSection.classList.add('hidden');
}

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
fileInput.addEventListener('change', e => validateAndLoadFile(e.target.files[0]));

// Drag & Drop
uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  validateAndLoadFile(e.dataTransfer.files[0]);
});

btnChangeImg.addEventListener('click', resetUpload);
btnAnalyzeAgain.addEventListener('click', () => {
  resetUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ════════════════════════════════════════════════════
// ANALYSIS FLOW
// ════════════════════════════════════════════════════
btnAnalyze.addEventListener('click', async () => {
  const apiKey = sessionStorage.getItem(SESSION_KEY_API);
  if (!apiKey) {
    showToast('Please enter and save your Gemini API key first.');
    apiKeyInput.focus();
    return;
  }
  if (!uploadedDataUrl) {
    showToast('Please upload a desk image first.');
    return;
  }

  try {
    showOverlay();
    const result = await analyzeWithGemini(uploadedDataUrl, apiKey);
    hideOverlay();
    displayResults(result);
  } catch (err) {
    hideOverlay();
    console.error('Analysis error:', err);
    showToast(err.message || 'Analysis failed. Check your API key and try again.');
  }
});

// ── Loading Overlay Steps ─────────────────────────────
function showOverlay() {
  overlay.classList.remove('hidden');
  btnAnalyze.disabled = true;

  const steps = ['step-1','step-2','step-3','step-4'];
  let current = 0;

  steps.forEach(id => {
    const el = document.getElementById(id);
    el.className = 'analyzing-step';
  });

  const stepEl = document.getElementById(steps[0]);
  stepEl.className = 'analyzing-step active';
  current = 0;

  window._stepInterval = setInterval(() => {
    const prev = document.getElementById(steps[current]);
    if (prev) prev.className = 'analyzing-step done';
    current++;
    if (current < steps.length) {
      const next = document.getElementById(steps[current]);
      if (next) next.className = 'analyzing-step active';
    } else {
      clearInterval(window._stepInterval);
    }
  }, 1800);
}

function hideOverlay() {
  clearInterval(window._stepInterval);
  overlay.classList.add('hidden');
  btnAnalyze.disabled = false;
}

// ════════════════════════════════════════════════════
// GEMINI VISION API CALL
// ════════════════════════════════════════════════════
async function analyzeWithGemini(dataUrl, apiKey) {
  // Extract base64 data and mime type
  const [header, base64Data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)[1];

  const prompt = `You are an expert study desk organization analyst. Analyze this image of a study desk and respond ONLY with a valid JSON object (no markdown, no code blocks, just raw JSON).

Return this exact structure:
{
  "clutter_score": <integer 0-100, where 0=perfectly clean, 100=extremely messy>,
  "organization_level": "<Clean|Moderately Organized|Messy>",
  "desk_coverage_percent": <integer 0-100, how much of the desk surface is covered by objects>,
  "free_space_percent": <integer 0-100, percentage of desk that is clear and free>,
  "total_objects": <integer, total count of distinct objects detected>,
  "study_materials_count": <integer, count of books, notebooks, papers, stationery etc>,
  "electronics_count": <integer, count of laptop, monitor, phone, keyboard, mouse etc>,
  "detected_objects": [<array of strings, each a specific object name with emoji, e.g. "📚 Notebook", "💻 Laptop", "☕ Coffee Mug">],
  "description": "<2-3 sentence description of the desk state>",
  "suggestions": [<array of 4-6 specific actionable strings to improve organization>]
}

Be specific, realistic, and base all values on what is actually visible in the image. The clutter_score should reflect the overall messiness — score high (70-100) for very messy desks, medium (30-70) for moderately cluttered, and low (0-30) for clean desks.`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('No response from Gemini. Please try again.');

  // Parse JSON from response
  let parsed;
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Try to extract JSON object from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse AI response. Please try again.');
    }
  }

  return parsed;
}

// ════════════════════════════════════════════════════
// DISPLAY RESULTS
// ════════════════════════════════════════════════════
function displayResults(data) {
  // Scroll to results
  resultsSection.classList.remove('hidden');

  // ── Clutter Score Ring ──
  const score   = Math.max(0, Math.min(100, parseInt(data.clutter_score) || 0));
  const circumf = 402.12;
  const offset  = circumf - (circumf * score / 100);

  const ringFill = document.getElementById('score-ring-fill');
  const scoreEl  = document.getElementById('score-value');

  // Color based on score
  let ringColor, levelClass, levelIcon, levelText;
  if (score <= 30) {
    ringColor  = '#10B981'; levelClass = 'level-clean';
    levelIcon  = '✅'; levelText = 'Clean';
  } else if (score <= 65) {
    ringColor  = '#F59E0B'; levelClass = 'level-moderate';
    levelIcon  = '⚠️'; levelText = 'Moderately Organized';
  } else {
    ringColor  = '#EF4444'; levelClass = 'level-messy';
    levelIcon  = '🚨'; levelText = 'Messy';
  }

  ringFill.style.stroke = ringColor;
  setTimeout(() => {
    ringFill.style.strokeDashoffset = String(offset);
  }, 200);

  // Animated counter
  animateCounter(scoreEl, score, 1500);

  // Level badge
  const levelBadge = document.getElementById('clutter-level-badge');
  levelBadge.className = `clutter-level ${levelClass}`;
  document.getElementById('clutter-level-icon').textContent = levelIcon;
  document.getElementById('clutter-level-text').textContent = levelText;

  // Description
  document.getElementById('clutter-desc').textContent = data.description || '';

  // ── Result level badge (on image card) ──
  const resultBadge = document.getElementById('result-level-badge');
  const badgeStyles  = {
    'level-clean':    'background:rgba(16,185,129,.1);color:#10B981;',
    'level-moderate': 'background:rgba(245,158,11,.1);color:#F59E0B;',
    'level-messy':    'background:rgba(239,68,68,.1);color:#EF4444;'
  };
  resultBadge.setAttribute('style', badgeStyles[levelClass]);
  resultBadge.textContent = `${levelIcon} ${levelText}`;

  // ── Coverage bars ──
  const coverage  = Math.max(0, Math.min(100, parseInt(data.desk_coverage_percent) || 55));
  const freeSpace = Math.max(0, Math.min(100, parseInt(data.free_space_percent) || (100 - coverage)));

  document.getElementById('coverage-val').textContent   = `${coverage}%`;
  document.getElementById('free-space-val').textContent = `${freeSpace}%`;

  setTimeout(() => {
    document.getElementById('coverage-bar').style.width   = `${coverage}%`;
    document.getElementById('free-space-bar').style.width = `${freeSpace}%`;
  }, 400);

  // ── Statistics ──
  const total      = parseInt(data.total_objects) || 0;
  const study      = parseInt(data.study_materials_count) || 0;
  const electronics = parseInt(data.electronics_count) || 0;
  const freeStatPct = freeSpace;

  setTimeout(() => animateCounter(document.getElementById('stat-total'),      total,      800), 100);
  setTimeout(() => animateCounter(document.getElementById('stat-study'),       study,      900), 200);
  setTimeout(() => animateCounter(document.getElementById('stat-electronics'), electronics, 900), 300);
  document.getElementById('stat-free').textContent = `${freeStatPct}%`;

  // ── Detected Objects Tags ──
  const objectsList  = document.getElementById('objects-list');
  const objCountBadge = document.getElementById('obj-count-badge');
  const detectedObjs = data.detected_objects || [];

  objCountBadge.textContent = `${detectedObjs.length} item${detectedObjs.length !== 1 ? 's' : ''}`;
  objectsList.innerHTML = '';

  if (detectedObjs.length === 0) {
    objectsList.innerHTML = '<p style="color:var(--text-muted);font-size:.9rem;">No objects detected.</p>';
  } else {
    detectedObjs.forEach((obj, i) => {
      const tag = document.createElement('div');
      tag.className = 'object-tag';
      tag.style.animationDelay = `${i * 0.06}s`;
      tag.innerHTML = `<span>${obj}</span>`;
      objectsList.appendChild(tag);
    });
  }

  // ── Suggestions ──
  const suggList = document.getElementById('suggestions-list');
  suggList.innerHTML = '';
  const suggestions = data.suggestions || [
    'Remove unnecessary items from your desk surface.',
    'Organize notebooks and papers into neat stacks.',
    'Keep writing tools in a dedicated holder.',
    'Create more free workspace for studying.',
    'Group similar items together for easy access.'
  ];

  suggestions.forEach((sugg, i) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.style.animationDelay = `${i * 0.08}s`;
    item.innerHTML = `
      <div class="suggestion-num">${i + 1}</div>
      <p class="suggestion-text">${sugg}</p>
    `;
    suggList.appendChild(item);
  });

  // Scroll into view
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════
function animateCounter(el, target, duration) {
  if (!el) return;
  const start = 0;
  const step  = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  let startTime = null;
  requestAnimationFrame(step);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
