const state = new Map();
const tracker = {
  correctSteps: new Set(),
  wrongAttempts: 0,
  hintsUsed: 0,
  completedExercises: new Set(),
  mistakeTypes: new Map(),
  transferSuccess: new Set(),
};

export function setupProgress(lessonId, totalSteps, container) {
  state.set(lessonId, { totalSteps, completed: new Set() });
  container.innerHTML = `
    <div class="progress-label" id="${lessonId}ProgressLabel">0% mastery - 0 of ${totalSteps} steps complete</div>
    <div class="progress-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="${lessonId}ProgressLabel">
      <div class="progress-bar" id="${lessonId}ProgressBar"></div>
    </div>
  `;
}

export function completeStep(lessonId, stepId) {
  const lesson = state.get(lessonId);
  if (!lesson) return;
  lesson.completed.add(stepId);
  updateProgressDom(lessonId);
}

export function isComplete(lessonId, stepId) {
  return state.get(lessonId)?.completed.has(stepId) || false;
}

export function unlockStep(card) {
  if (!card) return;
  card.classList.remove('locked');
  card.setAttribute('aria-disabled', 'false');
  card.querySelectorAll('input, button').forEach(element => {
    element.disabled = false;
  });
}

export function markStepTag(tag) {
  if (!tag) return;
  tag.classList.add('done');
  tag.textContent = 'Mastered';
}

export function masteryPercent(lessonId) {
  const lesson = state.get(lessonId);
  if (!lesson) return 0;
  return Math.round((lesson.completed.size / lesson.totalSteps) * 100);
}

export function recordCorrectStep(stepKey) {
  tracker.correctSteps.add(stepKey);
  renderMasteryScore();
}

export function recordWrongAttempt(mistakeType = 'general') {
  tracker.wrongAttempts += 1;
  const key = normaliseMistakeType(mistakeType);
  tracker.mistakeTypes.set(key, (tracker.mistakeTypes.get(key) || 0) + 1);
  renderMasteryScore();
}

export function recordHintUsed() {
  tracker.hintsUsed += 1;
  renderMasteryScore();
}

export function recordCompletedExercise(exerciseKey) {
  tracker.completedExercises.add(exerciseKey);
  renderMasteryScore();
}

export function recordTransferSuccess(transferKey = 'transfer') {
  tracker.transferSuccess.add(transferKey);
  renderMasteryScore();
}

export function getMasteryScore() {
  const correctPoints = tracker.correctSteps.size * 5;
  const exercisePoints = tracker.completedExercises.size * 8;
  const transferPoints = tracker.transferSuccess.size * 6;
  const hintSupport = Math.min(tracker.hintsUsed, 20) * 0.5;
  const wrongPenalty = Math.min(tracker.wrongAttempts, 30) * 0.8;
  const repeatedPenalty = getRepeatedMistakeEntries().length * 2;
  return clampScore(correctPoints + exercisePoints + transferPoints - hintSupport - wrongPenalty - repeatedPenalty);
}

export function renderMasteryScore() {
  const score = document.getElementById('mastery-score-title');
  if (!score) return;
  const repeated = getRepeatedMistakeEntries();
  score.textContent = `${getMasteryScore()}%`;
  setText('trackCorrectSteps', tracker.correctSteps.size);
  setText('trackWrongAttempts', tracker.wrongAttempts);
  setText('trackHintsUsed', tracker.hintsUsed);
  setText('trackCompletedExercises', tracker.completedExercises.size);
  setText('trackTransferSuccess', tracker.transferSuccess.size);
  setText('trackRepeatedMistakes', repeated.length ? repeated[0][0] : 'None');
}

function updateProgressDom(lessonId) {
  const lesson = state.get(lessonId);
  const label = document.getElementById(`${lessonId}ProgressLabel`);
  const bar = document.getElementById(`${lessonId}ProgressBar`);
  const wrap = bar?.parentElement;
  const percent = masteryPercent(lessonId);
  if (!lesson || !label || !bar) return;
  label.textContent = `${percent}% mastery - ${lesson.completed.size} of ${lesson.totalSteps} steps complete`;
  bar.style.width = `${percent}%`;
  wrap?.setAttribute('aria-valuenow', String(percent));
}

function normaliseMistakeType(mistakeType) {
  return String(mistakeType || 'general')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 72) || 'general';
}

function getRepeatedMistakeEntries() {
  return [...tracker.mistakeTypes.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value);
}