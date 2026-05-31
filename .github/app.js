import { formatAngleList, getAngleLocation, getQuadrant, getQuadrantText, getReferenceAngle, getSigns, getTrigSignsAt, signWord, solveTrigEquation, toRad } from './trig-solver.js';
import { CVA_FLOW, LESSONS, TRIG_SOLUTION_BANK, trigExercises } from './questions.js';
import { diagnoseChallenge, diagnoseMasteryStep, diagnoseTransfer, diagnoseTrigMistake } from './trig-diagnostics.js';
import {
  completeStep,
  isComplete,
  markStepTag,
  recordCompletedExercise,
  recordCorrectStep,
  recordHintUsed,
  recordTransferSuccess,
  recordWrongAttempt,
  renderMasteryScore,
  setupProgress,
  unlockStep,
} from './progress.js';

const state = { currentAngle: 45, graphTrig: 'sin', eqConst: 0.5, practiceIndex: 0 };
const EQUATION_MASTERY = [
  {
    step: 1,
    inputs: ['eqMInput1'],
    hints: ['Look at the function before θ.', 'The function name is written before the bracket.', 'The function is sin.'],
    check: () => /^(sin|sine)$/i.test($('#eqMInput1').value.trim()),
    ok: 'Correct. The trig function is sine, written as sin(θ).',
    wrong: 'Not yet. The function name is the part before (θ), so this equation uses sine.'
  },
  {
    step: 2,
    inputs: ['eqMInput2a', 'eqMInput2b'],
    hints: ['Use inverse sine to find the reference angle.', 'Calculate sin⁻¹(0.5).', 'sin⁻¹(0.5) = 30°.'],
    check: () => matchesEqNumbers([$('#eqMInput2a').value], [0.5], 0.01) && matchesEqNumbers([$('#eqMInput2b').value], [30]),
    ok: 'Correct. The reference angle is 30° because sin(30°) = 0.5.',
    wrong: 'Not yet. The expression should be sin⁻¹(0.5) = 30°.'
  },
  {
    step: 3,
    inputs: ['eqMInput3a', 'eqMInput3b'],
    hints: ['Sine is positive in two quadrants.', 'Use ASTC.', 'Sine is positive in Quadrants I and II.'],
    check: () => matchesQuadrants([$('#eqMInput3a').value, $('#eqMInput3b').value], [1, 2]),
    ok: 'Correct. Positive sine belongs in Quadrants I and II.',
    wrong: 'Not yet. Since sin(θ) is positive, choose the quadrants above the x-axis.'
  },
  {
    step: 4,
    inputs: ['eqMInput4a', 'eqMInput4b', 'eqMInput4c'],
    hints: ['Use the reference angle.', 'Quadrant I = 30°, Quadrant II = 180° - 30°.', 'The solutions are 30° and 150°.'],
    check: () => matchesEqNumbers([$('#eqMInput4a').value], [30]) && matchesEqNumbers([$('#eqMInput4b').value], [30]) && matchesEqNumbers([$('#eqMInput4c').value], [150]),
    ok: 'Correct. The two solutions are 30° and 150°.',
    wrong: 'Not yet. Use θ₁ = 30° and θ₂ = 180° − 30° = 150°.'
  },
  {
    step: 5,
    inputs: ['eqMInput5a', 'eqMInput5b'],
    hints: ['Write both solutions.', 'Use θ = answer 1 or answer 2.', 'θ = 30° or 150°.'],
    check: () => matchesEqNumbers([$('#eqMInput5a').value, $('#eqMInput5b').value], [30, 150]),
    ok: 'Mastered. θ = 30° or 150°.',
    wrong: 'Not yet. The final answer must include both solutions: 30° and 150°.'
  }
];
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const EXTRA_LESSONS = {
  learn: {
    title: 'Learn Trig Functions',
    structure: {
      cva: ['<strong>Concrete:</strong> connect angle rotation to vertical, horizontal, and ratio meaning.', '<strong>Visual:</strong> compare graph height with unit-circle position using the slider.', '<strong>Abstract:</strong> name the patterns as sin(θ), cos(θ), and tan(θ).'],
      thinking: ['Level 1: read up/down and left/right movement.', 'Level 2: compare graph shapes and repeating cycles.', 'Level 3: generalize with function notation.', 'Level 4: explain signs and boundary behavior from the function definitions.'],
      mastery: ['Use the visual model before formulas.', 'Explain each function from the unit circle.', 'Transfer the meaning to equations and sign patterns.'],
    },
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Sine is vertical movement, cosine is horizontal movement, and tangent compares vertical to horizontal.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'The graph repeats because the point returns to the same places on the circle.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Use sin(θ), cos(θ), and tan(θ) as functions of an angle θ.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Predict values and signs before calculating exact numbers.' },
    ],
  },
  practice: {
    title: 'Guided Practice',
    structure: {
      cva: ['<strong>Concrete:</strong> start from a specific angle or equation.', '<strong>Visual:</strong> choose the quadrant or graph intersection.', '<strong>Abstract:</strong> write the sign pattern or solution set.'],
      thinking: ['Level 1: identify the known information.', 'Level 2: use a visual pattern.', 'Level 3: apply the rule.', 'Level 4: transfer to a new prompt.'],
      mastery: ['Learner answers step by step.', 'Steps cannot be skipped.', 'Feedback and hints appear immediately.'],
    },
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Name the angle, equation, or target value first.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'Use quadrants and reference angles to organize the work.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Convert the visual result into signs or degree solutions.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Transfer the method after all guided steps are mastered.' },
    ],
  },
  clinic: {
    title: 'Mistake Clinic',
    structure: {
      cva: ['<strong>Concrete:</strong> inspect a student answer.', '<strong>Visual:</strong> locate the quadrant or boundary issue.', '<strong>Abstract:</strong> name the exact trig-rule error.'],
      thinking: ['Level 1: ask what the equation or angle says.', 'Level 2: compare the answer to the correct quadrant pattern.', 'Level 3: identify the rule being misused.', 'Level 4: correct the solution and explain why.'],
      mastery: ['Diagnose common mistakes.', 'Use hints to repair reasoning.', 'Write corrected trig-only solutions.'],
    },
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Check whether the answer has the right sign meaning.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'Use ASTC, graph intersections, and boundary angles to spot mismatches.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Classify the mistake as sign, reference-angle, boundary, or missing-solution error.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Repair the work and state the corrected trig solution.' },
    ],
  },
  challenge: {
    title: 'Challenge Mode',
    structure: {
      cva: ['<strong>Concrete:</strong> face a fresh trig prompt.', '<strong>Visual:</strong> mentally place it on the graph or unit circle.', '<strong>Abstract:</strong> produce the final signs or solutions.'],
      thinking: ['Level 1: identify the function and sign.', 'Level 2: choose possible quadrants.', 'Level 3: apply reference-angle notation.', 'Level 4: answer without guided unlocking.'],
      mastery: ['No step-by-step scaffold.', 'Immediate feedback still supports learning.', 'Challenges stay within sine, cosine, tangent, signs, and equations.'],
    },
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Read the prompt and decide what trig reasoning is needed.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'Mentally map the angle or equation to quadrants and graph positions.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Use ASTC, θ_ref, and 0° ≤ θ ≤ 360° notation.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Give a complete answer and diagnose your own likely mistakes.' },
    ],
  },
};
const TOPIC_DETAILS = {
  'Learn Trig Functions': {
    concrete: 'A rotating point has a height, a horizontal position, and a slope-like comparison. These become sine, cosine, and tangent.',
    visual: 'Use the slider, unit circle, and three graphs to see how sin, cos, and tan change as θ moves.',
    abstract: 'sin(θ) = y, cos(θ) = x, and tan(θ) = y / x on the unit circle.',
    guided: ['Identify whether the point is above or below the x-axis.', 'Identify whether the point is left or right of the y-axis.', 'Write which trig function uses y, x, or y/x.'],
    mistake: 'Do not swap sine and cosine: sine follows vertical y, cosine follows horizontal x.',
    transfer: 'Change the angle from 45° to 135° and predict which function changes sign.'
  },
  'Unit Circle & Signs': {
    concrete: 'An angle tells where the rotating point sits: above, below, left, or right.',
    visual: 'Use the unit circle, quadrant labels, boundary-angle table, and ASTC pattern.',
    abstract: 'QI: all positive, QII: sin positive, QIII: tan positive, QIV: cos positive.',
    guided: ['Enter the quadrant for the angle.', 'Enter the positive trig function in that quadrant.', 'Enter the signs of sin, cos, and tan.'],
    mistake: 'Do not treat boundary angles as quadrants; 90° and 270° make tangent undefined.',
    transfer: 'Change 315° to 150° and write the new sign pattern.'
  },
  'Solve Trig Equations': {
    concrete: 'A trig equation asks where a trig function reaches a target value.',
    visual: 'Use graph intersections and unit-circle positions to find every matching angle.',
    abstract: 'Find θ_ref with inverse trig, then place it in the quadrants allowed by the sign of k.',
    guided: ['Enter the reference angle.', 'Enter the correct solution quadrants.', 'Enter all θ values in 0° ≤ θ ≤ 360°.'],
    mistake: 'Do not stop after one answer when the interval can contain two or more solutions.',
    transfer: 'Change cos(θ) = −0.5 to tan(θ) = 1 and solve again.'
  },
  'Guided Practice': {
    concrete: 'Work from a specific angle or equation instead of a general rule first.',
    visual: 'Use the quadrant or graph position before writing the abstract answer.',
    abstract: 'Convert the visual reasoning into signs, θ_ref, or final solution notation.',
    guided: ['Answer Step 1 first.', 'Unlock and answer Step 2.', 'Unlock and complete the final answer.'],
    mistake: 'If a step is locked, the previous reasoning is incomplete.',
    transfer: 'After mastering the guided item, solve the transfer question with one changed angle or function.'
  },
  'Mistake Clinic': {
    concrete: 'Start from a wrong student answer and ask what it claims.',
    visual: 'Check whether the claimed angle lands in the correct quadrant or boundary position.',
    abstract: 'Name the error: sign error, reference-angle error, boundary error, or missing-solution error.',
    guided: ['Identify the trig function.', 'Identify the sign and quadrants.', 'Enter the corrected solutions.'],
    mistake: 'The most common error is using positive-function quadrants for a negative trig value.',
    transfer: 'Change the mistaken cosine equation to a tangent equation and diagnose the new answer.'
  },
  'Challenge Mode': {
    concrete: 'Face a fresh trig prompt without the full guided scaffold.',
    visual: 'Mentally place the prompt on the unit circle or graph.',
    abstract: 'Use ASTC, θ_ref, and complete solution-set notation.',
    guided: ['Read the prompt.', 'Choose the relevant trig rule.', 'Enter the final answer and check it.'],
    mistake: 'Before submitting, check sign, quadrant, boundary angles, and missing second solutions.',
    transfer: 'Change one number or function in the challenge and solve the new version.'
  }
};
window.addEventListener('DOMContentLoaded', () => {
  renderStaticLessons();
  bindTabs();
  bindSignVisuals();
  bindSignSolver();
  bindEquationMasterySolver();
  bindGraphEquationSolver();
  bindGuidedPractice();
  bindMistakeDiagnosis();
  bindChallengeMode();
  startHeroAnimation();
  updateAngle(45);
  renderMasteryScore();

  updateEquationVisuals();
});

function renderStaticLessons() {
  renderLessonStructure('learnStructure', EXTRA_LESSONS.learn, 'section-blue');
  renderCvaFlow($("#learnCvaFlow"), [0, 1, 2]);
  renderFocus('learnFocus', 'Concrete Trig Function Focus', LESSONS.signs.focus);
  renderThinking('learnThinking', '4 Thinking Framework: Learn Trig Functions', EXTRA_LESSONS.learn.thinking);
  renderWorkedExample('learnWorkedExample', LESSONS.signs.workedExample, 'section-green', 'btn-green');
  renderLessonStructure('signsStructure', { ...LESSONS.signs, title: 'Unit Circle & Signs' }, 'section-blue');
  renderThinking('signsThinking', '4 Thinking Framework: Unit Circle & Signs', LESSONS.signs.thinking);
  renderBoundaryTable();
  renderCvaFlow($('#signCvaFlow'), [0, 1, 2, 3]);
  renderWorkedExample('signWorkedExample', LESSONS.signs.workedExample, 'section-green', 'btn-green');
  renderLessonStructure('solveStructure', { ...LESSONS.equations, title: 'Solve Trig Equations' }, 'section-blue');
  renderThinking('solveThinking', '4 Thinking Framework: Solve Trig Equations', LESSONS.equations.thinking);
  renderReferenceRules();
  renderSolvingInfo();
  renderSolutionBank();
  renderCvaFlow($('#equationCvaFlow'), [0, 1, 2, 3]);
  renderWorkedExamples('solveWorkedExample', LESSONS.equations.workedExamples);
  renderLessonStructure('practiceStructure', EXTRA_LESSONS.practice, 'section-blue');
  renderThinking('practiceThinking', '4 Thinking Framework: Guided Practice', EXTRA_LESSONS.practice.thinking);
  renderGuidedPractice();
  renderLessonStructure('clinicStructure', EXTRA_LESSONS.clinic, 'section-blue');
  renderThinking('clinicThinking', '4 Thinking Framework: Mistake Clinic', EXTRA_LESSONS.clinic.thinking);
  renderMistakeSection();
  renderLessonStructure('challengeStructure', EXTRA_LESSONS.challenge, 'section-blue');
  renderThinking('challengeThinking', '4 Thinking Framework: Challenge Mode', EXTRA_LESSONS.challenge.thinking);
  renderChallengeMode();
}

function bindTabs() {
  $$('.tab-btn').forEach(button => button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    $$('.tab-btn').forEach(item => item.classList.toggle('active', item === button));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.lesson === tab));
    updateAngle(state.currentAngle);
    updateEquationVisuals();
  }));
}
function renderLessonStructure(targetId, lesson, sectionClass) {
  const target = document.getElementById(targetId);
  const details = TOPIC_DETAILS[lesson.title];
  target.innerHTML = `
    <section class="section ${sectionClass} topic-shell">
      <div class="cva-badge-row">${renderCvaBadges()}</div>
      <h2 class="topic-title">${lesson.title}</h2>
      <div class="topic-grid">
        ${topicBlock('Concrete:', details.concrete)}
        ${topicBlock('Visual:', details.visual)}
        ${topicBlock('Abstract:', details.abstract)}
        <div class="topic-block topic-wide">
          <h3>Guided Solver:</h3>
          <p>Step-by-step embedded input boxes.</p>
          <div class="mini-solver-grid">
            ${details.guided.map((prompt, index) => `
              <label class="mini-step">
                <span>Step ${index + 1}</span>
                <input type="text" placeholder="${prompt}">
              </label>
            `).join('')}
          </div>
        </div>
        ${topicBlock('Mistake Check:', details.mistake)}
        ${topicBlock('Transfer:', details.transfer)}
      </div>
    </section>
  `;
}

function topicBlock(title, text) {
  return `<div class="topic-block"><h3>${title}</h3><p>${text}</p></div>`;
}

function renderFocus(targetId, title, cards) {
  document.getElementById(targetId).innerHTML = `<section class="section section-teal"><h3 class="text-teal-900">${title}</h3><div class="grid-2">${cards.map(card => `<div class="info-card"><h4 class="text-teal-900">${card.title}</h4><p>${card.text}</p></div>`).join('')}</div></section>`;
}

function renderThinking(targetId, title, levels) {
  document.getElementById(targetId).innerHTML = `<section class="section section-slate"><h3>${title}</h3><div class="thinking-grid">${levels.map((level, index) => `<div class="thinking-card"><span class="thinking-level thinking-badge thinking-badge-${index + 1}">${level.level}: ${level.title}</span><p>${level.text}</p></div>`).join('')}</div></section>`;
}

function renderBoundaryTable() {
  const rows = LESSONS.signs.boundaryRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  $('#signsBoundary').innerHTML = `<section class="section section-orange"><h3 class="text-orange-900">Boundary Angles for sin, cos, and tan</h3><div class="info-card"><div class="table-scroll"><table class="trig-table"><thead><tr><th>θ</th><th>sin(θ)</th><th>cos(θ)</th><th>tan(θ)</th><th>Unit-circle point</th></tr></thead><tbody>${rows}</tbody></table></div><div class="hint-box mt-2"><strong>Trig check:</strong> tangent is undefined exactly when cos(θ) = 0, because tan(θ) = sin(θ) / cos(θ).</div></div></section>`;
}

function renderReferenceRules() {
  const rows = LESSONS.equations.referenceRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  $('#solveReference').innerHTML = `<section class="section section-green"><h3 class="text-green-900">Reference Angle Rules</h3><div class="grid-2"><div class="info-card"><h4 class="text-green-900">Find θ_ref</h4><p>Use the positive size of the trig value: θ_ref = sin⁻¹(|k|), cos⁻¹(|k|), or tan⁻¹(|k|).</p></div><div class="info-card"><h4 class="text-green-900">Place θ_ref in the Correct Quadrants</h4><p>Use the sign of k with ASTC. Negative values use the opposite quadrants.</p></div></div><div class="info-card mt-2"><div class="table-scroll"><table class="trig-table"><thead><tr><th>Quadrant</th><th>Angle from θ_ref</th><th>Positive trig ratio</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
}

function renderSolvingInfo() {
  $('#solveInfo').innerHTML = `<section class="section section-purple"><h3 class="text-purple-900">Solving Trigonometric Equations</h3><div class="info-card"><div class="answer-box mb-2"><strong>General Form:</strong><p>trig(θ) = k, where trig is sin, cos, or tan</p></div><ol class="steps-list"><li>Find the reference angle using inverse trig functions.</li><li>Determine which quadrants have solutions based on the sign of k.</li><li>Calculate all solutions in the interval 0° ≤ θ ≤ 360°.</li><li>Check boundary angles when k is 0, 1, −1, or tangent is undefined.</li></ol></div></section>`;
}

function renderSolutionBank() {
  const rows = TRIG_SOLUTION_BANK.map(item => '<tr><td>' + item.functionName + '</td><td>' + item.equation + '</td><td>' + item.solutions + '</td><td>' + item.note + '</td></tr>').join('');
  $('#solveInfo').insertAdjacentHTML('beforeend', '<section class="section section-yellow mt-2"><h3 class="text-yellow-900">Common Trig Solution Bank</h3><div class="info-card"><div class="table-scroll"><table class="trig-table"><thead><tr><th>Function</th><th>Equation or Angle</th><th>Solution in 0&deg; &le; &theta; &le; 360&deg;</th><th>Reason</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="hint-box mt-2"><strong>Boundary reminder:</strong> boundary angles are not quadrants, duplicate solutions are removed, and tan(90&deg;) and tan(270&deg;) are undefined.</div></div></section>');
}

function renderCvaBadges() {
  return CVA_FLOW.map((item, index) => `<span class="cva-badge cva-badge-${index + 1}"><strong>${item.label}:</strong> ${item.text}</span>`).join('');
}

function renderCvaFlow(container, activeIndexes = [0, 1, 2, 3, 4]) {
  if (!container) return;
  container.innerHTML = CVA_FLOW.map((item, index) => `<div class="cva-chip ${activeIndexes.includes(index) ? 'active' : ''}"><strong>${item.label}:</strong><span>${item.text}</span></div>`).join('');
}


function renderWorkedExamples(targetId, examples) {
  const id = `${targetId}Solution`;
  document.getElementById(targetId).innerHTML = `<section class="section section-blue worked-examples-section"><div class="example-header"><h3>Worked Examples</h3><button class="btn btn-blue toggle-btn" type="button" data-toggle-example="${id}">Show Examples</button></div><div class="worked-example-grid example-solution" id="${id}">${examples.map(example => `<article class="worked-example-card"><span class="mastery-tag">${example.title}</span><div class="worked-row worked-equation"><strong>Given equation:</strong> ${example.equation}</div><div class="worked-row worked-reference"><strong>Reference angle:</strong> ${example.reference}</div><div class="worked-row worked-astc"><strong>ASTC quadrant reasoning:</strong> ${example.reasoning}</div><div class="worked-row worked-calculation"><strong>Calculate each solution:</strong><ul>${example.calculations.map(item => `<li>${item}</li>`).join('')}</ul></div><div class="worked-final"><strong>Final answer:</strong> ${example.answer}</div></article>`).join('')}</div></section>`;
  document.querySelector(`[data-toggle-example="${id}"]`).addEventListener('click', event => {
    const solution = document.getElementById(id);
    solution.classList.toggle('show');
    event.currentTarget.textContent = solution.classList.contains('show') ? 'Hide Examples' : 'Show Examples';
  });
}
function renderWorkedExample(targetId, example, sectionClass, buttonClass) {
  const id = `${targetId}Solution`;
  document.getElementById(targetId).innerHTML = `<section class="section ${sectionClass}"><div class="example-header"><h3>${example.title}</h3><button class="btn ${buttonClass} toggle-btn" type="button" data-toggle-example="${id}">Show Solution</button></div><div class="info-card"><p><strong>Question:</strong> ${example.question}</p><div class="example-solution" id="${id}">${example.steps.map((step, index) => `<p><strong>Step ${index + 1}:</strong> ${step}</p>`).join('')}<div class="answer-box">${example.answer}</div></div></div></section>`;
  document.querySelector(`[data-toggle-example="${id}"]`).addEventListener('click', event => {
    const solution = document.getElementById(id);
    const showing = solution.classList.toggle('show');
    event.currentTarget.textContent = showing ? 'Hide Solution' : 'Show Solution';
  });
}

function bindSignVisuals() {
  const slider = $('#angleSlider');
  if (!slider) return;
  const presets = [45, 135, 225, 315, 90, 270];
  $('#anglePresets').innerHTML = presets.map(value => `<button class="preset-btn ${value % 90 === 0 ? 'alt' : ''}" type="button" data-angle="${value}">${value}°</button>`).join('');
  slider.addEventListener('input', event => updateAngle(Number(event.target.value)));
  $$('#anglePresets [data-angle]').forEach(button => button.addEventListener('click', () => updateAngle(Number(button.dataset.angle))));
}

function updateAngle(value) {
  state.currentAngle = Number(value);
  if ($('#angleSlider')) $('#angleSlider').value = state.currentAngle;
  const quadrant = getQuadrant(state.currentAngle);
  if ($('#angleLabel')) $('#angleLabel').textContent = `Angle: ${state.currentAngle}° (${getAngleLocation(state.currentAngle)})`;
  drawTrigGraph($('#sinCanvas'), 'sin', state.currentAngle, '#16a34a');
  drawTrigGraph($('#cosCanvas'), 'cos', state.currentAngle, '#2563eb');
  drawTrigGraph($('#tanCanvas'), 'tan', state.currentAngle, '#ea580c');
  drawUnitCircle($('#unitCircleCanvas'), state.currentAngle);
  const signs = getTrigSignsAt(state.currentAngle);
  updateBadge($('#sinBadge'), `sin(${state.currentAngle}°) is ${signWord(signs.sin)}`, signs.sin);
  updateBadge($('#cosBadge'), `cos(${state.currentAngle}°) is ${signWord(signs.cos)}`, signs.cos);
  updateBadge($('#tanBadge'), `tan(${state.currentAngle}°) is ${signWord(signs.tan)}`, signs.tan);
}

function updateBadge(element, text, sign) {
  if (!element) return;
  element.textContent = text;
  element.className = `badge ${sign === '+' ? 'badge-green' : sign === '-' ? 'badge-red' : 'badge-gray'} mt-1`;
}

function bindSignSolver() {
  const input = $('#signAngleInput');
  if (!input) return;
  const button = $('#signSolveBtn');
  input.addEventListener('input', () => {
    button.disabled = !input.value || Number.isNaN(Number(input.value));
    $('#signFormulaBox').classList.toggle('hidden', button.disabled);
    resetAnimatedBlocks('sign', 3);
  });
  button.addEventListener('click', showSignSolution);
}

function showSignSolution() {
  const angle = Number($('#signAngleInput').value);
  const location = getAngleLocation(angle);
  const quadrant = getQuadrant(angle);
  const signs = getSigns(quadrant) || getTrigSignsAt(angle);
  setStepText('signStep0', `${angle}° is ${location}.`);
  setStepText('signStep1', quadrant.includes('axis') ? 'Boundary angles sit directly on an axis, so use exact unit-circle values.' : `In ${quadrant}, ASTC decides which trig ratio is positive.`);
  setStepText('signStep2', `sin is ${signWord(signs.sin)}, cos is ${signWord(signs.cos)}, and tan is ${signWord(signs.tan)}.`);
  $('#signFinalBox p').textContent = `sin(${angle}°) ${signs.sin}, cos(${angle}°) ${signs.cos}, tan(${angle}°) ${signs.tan}`;
  revealBlocks(['signStep0', 'signStep1', 'signStep2', 'signFinalBox']);
  $('#signPlaceholder').style.display = 'none';
}
function bindGraphEquationSolver() {
  renderGraphTrigButtons();
  if (!$('#eqConstSlider')) return;
  $('#eqConstPresets').innerHTML = [0.5, 0.707, 0.866, -0.5, 0, 1].map(value => `<button class="preset-btn purple" type="button" data-const="${value}">${value}</button>`).join('');
  $('#eqConstSlider').addEventListener('input', event => { state.eqConst = Number(event.target.value); updateEquationVisuals(); });
  $$('#eqConstPresets [data-const]').forEach(button => button.addEventListener('click', () => { state.eqConst = Number(button.dataset.const); updateEquationVisuals(); }));
}

function renderGraphTrigButtons() {
  renderTrigButtons($('#graphTrigButtons'), state.graphTrig, trig => { state.graphTrig = trig; renderGraphTrigButtons(); updateEquationVisuals(); });
}

function renderTrigButtons(container, activeTrig, onSelect) {
  if (!container) return;
  container.innerHTML = ['sin', 'cos', 'tan'].map(trig => `<button class="trig-btn ${trig === activeTrig ? 'active' : ''}" type="button" data-trig="${trig}">${trig}(θ)</button>`).join('');
  container.querySelectorAll('[data-trig]').forEach(button => button.addEventListener('click', () => onSelect(button.dataset.trig)));
}

function updateEquationVisuals() {
  if (!$('#eqConstSlider')) return;
  $('#eqConstSlider').value = state.eqConst;
  $('#eqConstLabel').textContent = `Constant Value: ${state.eqConst}`;
  $('#eqDisplay').textContent = `${state.graphTrig}(θ) = ${state.eqConst}`;
  const solutions = solveTrigEquation(state.graphTrig, state.eqConst);
  $('#eqSolutionsBox').innerHTML = solutions.length ? solutions.map((solution, index) => `<p>θ<sub>${index + 1}</sub> = ${solution.toFixed(1)}°</p>`).join('') : '<p>No real solutions for this value.</p>';
  drawEqGraph($('#eqGraphCanvas'), state.graphTrig, state.eqConst, solutions);
  drawEqCircle($('#eqCircleCanvas'), solutions);
  if (solutions.length) {
    const ref = getReferenceAngle(state.graphTrig, state.eqConst);
    const signWordText = Math.abs(state.eqConst) < 1e-9 ? 'zero' : state.eqConst > 0 ? 'positive' : 'negative';
    $('#eqStepSolution').innerHTML = `<p><strong>Step 1:</strong> Given equation: ${state.graphTrig}(θ) = ${state.eqConst}</p><p><strong>Step 2:</strong> Find reference angle: θ_ref = ${state.graphTrig}⁻¹(${Math.abs(state.eqConst).toFixed(3)}) = <strong>${ref.toFixed(1)}°</strong></p><p><strong>Step 3:</strong> The value is ${signWordText}, so use <strong>${getQuadrantText(state.graphTrig, state.eqConst)}</strong>.</p><p><strong>Step 4:</strong> Solutions: θ = ${formatAngleList(solutions)}</p>`;
  } else {
    $('#eqStepSolution').innerHTML = '<p>No real solutions for this value.</p>';
  }
}

const THINKING_LEVEL_LABELS = {
  1: 'Level 1: Intuition & Basic Logic',
  2: 'Level 2: Pattern & Visual Structure',
  3: 'Level 3: Abstraction & Generalization',
  4: 'Level 4: Application & Challenge',
};

const GUIDED_PRACTICE_THINKING_LEVELS = { 1: 1, 2: 3, 3: 2, 4: 4 };

const GUIDED_PRACTICE_STEPS = [
  { key: 'function', title: 'Step 1: Identify the trig function.' },
  { key: 'reference', title: 'Step 2: Find the reference angle.' },
  { key: 'quadrants', title: 'Step 3: Choose quadrants or boundary angles.' },
  { key: 'solutions', title: 'Step 4: Write all final solutions.' },
];

function renderGuidedPractice() {
  const container = $('#guidedPractice');
  if (!container) return;
  const exercise = trigExercises[state.practiceIndex];
  const ref = getPracticeReferenceAngle(exercise);
  container.innerHTML = `
    <section class="section section-orange guided-practice-shell">
      <h3 class="text-orange-900">Guided Trig Equation Practice</h3>
      <p class="locked-note">Choose one trig equation. Complete each step in order, use hints when needed, diagnose mistakes, then answer the transfer question.</p>
      <div class="cva-badge-row">${renderCvaBadges()}</div>
      <div class="practice-picker" id="practicePicker">
        ${trigExercises.map((item, index) => `<button class="preset-btn ${index === state.practiceIndex ? 'active' : ''}" type="button" data-practice-index="${index}">${item.equation}</button>`).join('')}
      </div>
      <div class="practice-layout">
        <div>
          <div class="info-card mb-2">
            <span class="mastery-tag">Practice ${state.practiceIndex + 1} of ${trigExercises.length}</span>
            <h4>${exercise.equation}</h4>
            <p class="small-text">Solve for 0° ≤ θ ≤ 360°.</p>
          </div>
          <div id="guidedPracticeProgress"></div>
          <div class="mastery-steps">
            ${guidedPracticeStepMarkup(1, exercise, ref)}
            ${guidedPracticeStepMarkup(2, exercise, ref)}
            ${guidedPracticeStepMarkup(3, exercise, ref)}
            ${guidedPracticeStepMarkup(4, exercise, ref)}
          </div>
        </div>
        <div>
          <div class="diagnosis-box mb-2" id="practiceDiagnosis">Mistake diagnosis appears after each check.</div>
          <div class="transfer-box locked-transfer" id="practiceTransferBox">
            <h4 class="text-teal-900">Transfer Question</h4>
            <p class="small-text mb-2">${exercise.transfer}</p>
            <input type="text" id="practiceTransferInput" class="inp-orange mb-2" placeholder="enter all solutions" disabled>
            <button class="btn btn-green" type="button" id="practiceTransferBtn" disabled>Check Transfer</button>
            <div id="practiceTransferFeedback" class="feedback hidden"></div>
          </div>
          <div class="celebration-box hidden" id="practiceCelebration">✓ Mastery complete. You solved ${exercise.equation} and unlocked the transfer question.</div>
        </div>
      </div>
    </section>`;
  setupProgress('guidedPractice', GUIDED_PRACTICE_STEPS.length, $('#guidedPracticeProgress'));
}

function thinkingLevelBadge(level) {
  return `<span class="thinking-badge thinking-badge-${level}">${THINKING_LEVEL_LABELS[level]}</span>`;
}

function guidedPracticeStepMarkup(stepNumber, exercise, ref) {
  const locked = stepNumber > 1;
  const attrs = locked ? 'disabled' : '';
  const inputClass = stepNumber === 4 ? 'wide-eq-input' : 'inline-eq-input';
  const prompt = getGuidedPrompt(stepNumber, exercise, ref);
  return `<div class="mastery-card ${locked ? 'locked' : ''} mb-2" id="practiceStep${stepNumber}" data-practice-step="${stepNumber}">
    <div class="step-badge-row"><span class="mastery-tag" id="practiceTag${stepNumber}">Step ${stepNumber}</span>${thinkingLevelBadge(GUIDED_PRACTICE_THINKING_LEVELS[stepNumber])}</div>
    <h4>${GUIDED_PRACTICE_STEPS[stepNumber - 1].title}</h4>
    <p class="small-text mb-2">${prompt}</p>
    <input id="practiceInput${stepNumber}" class="${inputClass}" type="text" aria-label="guided practice step ${stepNumber}" ${attrs}>
    <div class="hint-row" id="practiceHints${stepNumber}">${getGuidedHints(stepNumber, exercise, ref).map((hint, index) => `<button class="btn btn-gray hint-btn" type="button" data-practice-hint="${index}" ${attrs}>Level ${index + 1} Hint</button>`).join('')}</div>
    <button class="btn btn-orange" type="button" id="practiceCheck${stepNumber}" ${attrs}>Check Step ${stepNumber}</button>
    <div class="mastery-step-feedback hidden" id="practiceFeedback${stepNumber}"></div>
  </div>`;
}

function bindGuidedPractice() {
  const container = $('#guidedPractice');
  if (!container) return;
  bindGuidedPracticeControls();
}

function bindGuidedPracticeControls() {
  $$('#practicePicker [data-practice-index]').forEach(button => {
    button.addEventListener('click', () => {
      state.practiceIndex = Number(button.dataset.practiceIndex);
      renderGuidedPractice();
      bindGuidedPracticeControls();
    });
  });
  GUIDED_PRACTICE_STEPS.forEach((_, index) => {
    const stepNumber = index + 1;
    const stepCard = $(`#practiceStep${stepNumber}`);
    const checkButton = $(`#practiceCheck${stepNumber}`);
    if (!stepCard || !checkButton) return;
    stepCard.addEventListener('click', event => {
      if (event.currentTarget.classList.contains('locked')) {
        setGuidedStepFeedback(stepNumber, false, `Complete Step ${stepNumber - 1} correctly before opening this step.`);
        recordWrongAttempt('locked guided practice step');
      }
    });
    checkButton.addEventListener('click', () => checkGuidedPracticeStep(stepNumber));
    $$(`#practiceHints${stepNumber} [data-practice-hint]`).forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (stepCard.classList.contains('locked')) {
          setGuidedStepFeedback(stepNumber, false, `Complete Step ${stepNumber - 1} correctly before using these hints.`);
          recordWrongAttempt('locked guided practice hint');
          return;
        }
        const exercise = trigExercises[state.practiceIndex];
        const hints = getGuidedHints(stepNumber, exercise, getPracticeReferenceAngle(exercise));
        recordHintUsed();
        setGuidedStepFeedback(stepNumber, false, hints[Number(button.dataset.practiceHint)]);
      });
    });
  });
  $('#practiceTransferBtn')?.addEventListener('click', checkPracticeTransfer);
}

function checkGuidedPracticeStep(stepNumber) {
  const card = $(`#practiceStep${stepNumber}`);
  if (card.classList.contains('locked')) {
    setGuidedStepFeedback(stepNumber, false, `Complete Step ${stepNumber - 1} correctly before opening this step.`);
    recordWrongAttempt('locked guided practice step');
    return;
  }
  const exercise = trigExercises[state.practiceIndex];
  const input = $(`#practiceInput${stepNumber}`);
  const result = validateGuidedStep(stepNumber, exercise, input.value);
  setGuidedStepFeedback(stepNumber, result.ok, result.message);
  $('#practiceDiagnosis').innerHTML = `<strong>${result.ok ? 'Diagnosis:' : 'Mistake diagnosis:'}</strong> ${result.diagnosis}`;
  if (!result.ok) {
    recordWrongAttempt(result.diagnosis);
    shakeGuidedInput(input);
    return;
  }
  input.classList.remove('input-error-shake');
  if (isComplete('guidedPractice', stepNumber)) return;
  recordCorrectStep(`guided-${state.practiceIndex}-step-${stepNumber}`);
  completeStep('guidedPractice', stepNumber);
  markStepTag($(`#practiceTag${stepNumber}`));
  const next = $(`#practiceStep${stepNumber + 1}`);
  if (next) unlockStep(next);
  else {
    recordCompletedExercise(`guided-${state.practiceIndex}`);
    unlockPracticeTransfer(exercise);
  }
}

function validateGuidedStep(stepNumber, exercise, rawValue) {
  const value = String(rawValue || '').trim();
  const ref = getPracticeReferenceAngle(exercise);
  if (stepNumber === 1) {
    const ok = normalisePracticeText(value) === exercise.trig;
    return {
      ok,
      message: ok ? `Correct. The trig function is ${exercise.trig}.` : 'Not yet. Look at the function before θ.',
      diagnosis: ok ? 'The function was identified before solving.' : diagnoseTrigMistake({ trig: value, answers: [] }, exercise.solutions, exercise.trig, exercise.value),
    };
  }
  if (stepNumber === 2) {
    const ok = matchesEqNumbers([value], [ref], 0.6);
    return {
      ok,
      message: ok ? `Correct. The reference angle is ${ref.toFixed(1)}°.` : `Not yet. Use ${exercise.trig}⁻¹(${Math.abs(exercise.value)}) to find θref.`,
      diagnosis: ok ? 'The reference angle matches the target trig value.' : diagnoseTrigMistake(parsePracticeNumbers(value), exercise.solutions, exercise.trig, exercise.value),
    };
  }
  if (stepNumber === 3) {
    const ok = matchesPracticeLocations(value, exercise.solutions);
    return {
      ok,
      message: ok ? `Correct. Use ${practiceLocationText(exercise.solutions)}.` : 'Not yet. Use the sign and ASTC before writing final angles.',
      diagnosis: ok ? 'The correct quadrants or boundary angles were selected.' : diagnoseTrigMistake(value, exercise.solutions, exercise.trig, exercise.value),
    };
  }
  const answers = parsePracticeNumbers(value);
  const ok = matchesEqNumbers(answers, exercise.solutions);
  return {
    ok,
    message: ok ? `Correct. θ = ${formatAngleList(exercise.solutions)}.` : 'Not yet. Check every solution in the interval.',
    diagnosis: diagnoseTrigMistake(answers, exercise.solutions, exercise.trig, exercise.value),
  };
}

function unlockPracticeTransfer(exercise) {
  $('#practiceTransferInput').disabled = false;
  $('#practiceTransferBtn').disabled = false;
  $('#practiceTransferBox').classList.remove('locked-transfer');
  $('#practiceCelebration').classList.remove('hidden');
  $('#practiceDiagnosis').innerHTML = `<strong>Final celebration:</strong> You completed all guided steps for ${exercise.equation}.`;
}

function checkPracticeTransfer() {
  const exercise = trigExercises[state.practiceIndex];
  const transfer = parseTransferExercise(exercise.transfer);
  const answers = parsePracticeNumbers($('#practiceTransferInput').value);
  const ok = matchesEqNumbers(answers, transfer.solutions);
  setFeedback('practiceTransferFeedback', {
    ok,
    message: ok ? `Transfer complete. θ = ${formatAngleList(transfer.solutions)}.` : diagnoseTrigMistake(answers, transfer.solutions, transfer.trig, transfer.value),
  });
  if (ok) recordTransferSuccess(`guided-transfer-${state.practiceIndex}`);
  else {
    recordWrongAttempt('transfer question');
    shakeGuidedInput($('#practiceTransferInput'));
  }
}

function getGuidedPrompt(stepNumber, exercise, ref) {
  if (stepNumber === 1) return `In ${exercise.equation}, write the trig function.`;
  if (stepNumber === 2) return `Find θref for ${exercise.equation}.`;
  if (stepNumber === 3) return `Write the correct quadrants or boundary angles for ${exercise.equation}.`;
  return `Write all solutions for ${exercise.equation}.`;
}

function getGuidedHints(stepNumber, exercise, ref) {
  if (stepNumber === 1) return ['Look before θ.', 'The function name is sin, cos, or tan.', `The function is ${exercise.trig}.`];
  if (stepNumber === 2) return ['Use inverse trig with the positive value.', `Calculate ${exercise.trig}⁻¹(${Math.abs(exercise.value)}).`, `θref = ${ref.toFixed(1)}°.`];
  if (stepNumber === 3) return ['Use the sign of the trig value.', 'Use ASTC and check boundary angles.', `Use ${practiceLocationText(exercise.solutions)}.`];
  return ['Write every solution in the interval.', 'Separate answers with commas or “or”.', `θ = ${formatAngleList(exercise.solutions)}.`];
}

function getPracticeReferenceAngle(exercise) {
  return Number(getReferenceAngle(exercise.trig, exercise.value).toFixed(1));
}

function parseTransferExercise(equation) {
  const trig = equation.match(/sin|cos|tan/)?.[0];
  let value = Number((equation.match(/=\s*(-?\d+(?:\.\d+)?)/) || [])[1]);
  if (equation.includes('-0.5')) value = -0.5;
  if (equation.includes('= 0')) value = 0;
  if (equation.includes('= 1')) value = 1;
  if (equation.includes('= -1')) value = -1;
  return { trig, value, solutions: solveTrigEquation(trig, value) };
}

function matchesPracticeLocations(rawValue, solutions) {
  const text = String(rawValue || '').toLowerCase();
  const locations = solutions.map(getQuadrant);
  const numericBoundaryAnswers = parsePracticeNumbers(rawValue);
  if (numericBoundaryAnswers.length && locations.every(location => location.includes('axis'))) {
    return matchesEqNumbers(numericBoundaryAnswers, solutions);
  }
  if (locations.some(location => location.includes('axis'))) {
    return locations.every(location => text.includes('boundary') || text.includes('axis') || text.includes(location.replace('positive ', '').replace('negative ', '')));
  }
  const expected = [...new Set(locations.map(location => location.replace('Quadrant ', '').toLowerCase()))];
  const roman = { i: 'i', ii: 'ii', iii: 'iii', iv: 'iv', '1': 'i', '2': 'ii', '3': 'iii', '4': 'iv' };
  const actual = String(rawValue || '').replace(/quadrants?/gi, '').split(/[\s,;]+/).map(part => roman[part.toLowerCase()] || part.toLowerCase()).filter(Boolean);
  return expected.length === actual.length && expected.every(item => actual.includes(item));
}

function practiceLocationText(solutions) {
  return [...new Set(solutions.map(getQuadrant))].join(' and ');
}

function parsePracticeNumbers(value) {
  return (String(value).match(/-?\d+(\.\d+)?/g) || []).map(Number);
}

function normalisePracticeText(value) {
  return String(value || '').trim().toLowerCase().replace(/sine/g, 'sin').replace(/cosine/g, 'cos').replace(/tangent/g, 'tan');
}

function setGuidedStepFeedback(step, ok, message) {
  const box = $(`#practiceFeedback${step}`);
  const icon = ok ? '✓' : '!';
  box.className = ok ? 'mastery-step-feedback feedback-ok' : 'mastery-step-feedback feedback-err';
  box.innerHTML = `<span class="feedback-icon" aria-hidden="true">${icon}</span><span><strong>${ok ? 'Correct' : 'Try again'}:</strong> ${message}</span>`;
}

function shakeGuidedInput(input) {
  input.classList.remove('input-error-shake');
  void input.offsetWidth;
  input.classList.add('input-error-shake');
  window.setTimeout(() => input.classList.remove('input-error-shake'), 650);
}
function bindMastery(lessonId, mastery, container) {
  container.innerHTML = `<section class="section ${lessonId === 'signs' ? 'section-purple' : 'section-orange'}"><h3>${mastery.title}</h3><p class="locked-note">${mastery.note}</p><div class="cva-flow" id="${lessonId}MasteryFlow"></div><div id="${lessonId}Progress"></div><div class="mastery-panel"><div>${mastery.steps.map((step, index) => masteryStepMarkup(lessonId, step, index)).join('')}</div><div><div id="${lessonId}Feedback" class="diagnosis-box mb-2">Mistake diagnosis appears here after each check.</div><div class="transfer-box"><h4 class="text-teal-900">Transfer Question</h4><p class="small-text mb-2">${mastery.transfer.prompt}</p><input type="text" id="${lessonId}TransferInput" class="${lessonId === 'signs' ? 'inp-purple' : 'inp-orange'} mb-2" placeholder="${mastery.transfer.placeholder}" disabled><button class="btn btn-green" type="button" id="${lessonId}TransferBtn" disabled>Check Transfer</button><div id="${lessonId}TransferFeedback" class="feedback hidden"></div></div></div></div></section>`;
  renderCvaFlow($(`#${lessonId}MasteryFlow`), [2, 3, 4]);
  setupProgress(lessonId, mastery.steps.length, $(`#${lessonId}Progress`));
  mastery.steps.forEach((step, index) => {
    const card = $(`#${lessonId}-${step.id}-card`);
    card.addEventListener('click', () => { if (card.classList.contains('locked')) setFeedback(`${lessonId}Feedback`, { ok: false, message: step.hint }); });
    $(`#${lessonId}-${step.id}-button`).addEventListener('click', () => checkMasteryStep(lessonId, mastery, step, index));
  });
  $(`#${lessonId}TransferBtn`).addEventListener('click', () => setFeedback(`${lessonId}TransferFeedback`, diagnoseTransfer(mastery.transfer, $(`#${lessonId}TransferInput`).value)));
}

function masteryStepMarkup(lessonId, step, index) {
  return `<div class="mastery-card ${index > 0 ? 'locked' : ''} mb-2" id="${lessonId}-${step.id}-card"><div class="step-badge-row"><span class="mastery-tag" id="${lessonId}-${step.id}-tag">${step.label}</span>${thinkingLevelBadge(Math.min(index + 1, 4))}</div><p class="mb-2"><strong>${step.prompt}</strong></p><input type="text" id="${lessonId}-${step.id}-input" class="${lessonId === 'signs' ? 'inp-purple' : 'inp-orange'} mb-2" placeholder="${step.placeholder}" ${index > 0 ? 'disabled' : ''}><button class="btn ${lessonId === 'signs' ? 'btn-purple' : 'btn-orange'}" type="button" id="${lessonId}-${step.id}-button" ${index > 0 ? 'disabled' : ''}>Check ${step.label}</button></div>`;
}

function checkMasteryStep(lessonId, mastery, step, index) {
  const card = $(`#${lessonId}-${step.id}-card`);
  if (card.classList.contains('locked')) { setFeedback(`${lessonId}Feedback`, { ok: false, message: step.hint }); return; }
  const result = diagnoseMasteryStep(step, $(`#${lessonId}-${step.id}-input`).value);
  setFeedback(`${lessonId}Feedback`, result);
  if (!result.ok || isComplete(lessonId, step.id)) return;
  completeStep(lessonId, step.id);
  markStepTag($(`#${lessonId}-${step.id}-tag`));
  const next = mastery.steps[index + 1];
  if (next) unlockStep($(`#${lessonId}-${next.id}-card`));
  else { $(`#${lessonId}TransferInput`).disabled = false; $(`#${lessonId}TransferBtn`).disabled = false; }
}
const COMMON_TRIG_MISTAKES = [
  {
    title: 'Forgot the second solution',
    why: 'Learners often stop after the reference angle and forget the same trig value can appear in another quadrant within 0&deg; &le; &theta; &le; 360&deg;.',
    visual: 'sin(&theta;) = 0.5 hits the unit circle above the x-axis in Quadrant I and Quadrant II.',
    practice: 'Mini practice: Solve sin(&theta;) = 0.5. How many solutions should you write?',
  },
  {
    title: 'Used wrong quadrant',
    why: 'The reference angle is correct, but the final angle was placed in a quadrant where the trig sign does not match the equation.',
    visual: 'cos(&theta;) < 0 means the point is on the left side of the unit circle: Quadrants II and III.',
    practice: 'Mini practice: For cos(&theta;) = -0.5, which quadrants contain the answers?',
  },
  {
    title: 'Used wrong sign',
    why: 'The equation sign was ignored, so a positive-value quadrant was used for a negative value or the reverse.',
    visual: 'tan(&theta;) = -1 belongs where sine and cosine have opposite signs: Quadrants II and IV.',
    practice: 'Mini practice: For tan(&theta;) = -1, should the answers be in Quadrants I and III or II and IV?',
  },
  {
    title: 'Used reference angle as final answer',
    why: '&theta;<sub>ref</sub> only gives the acute angle to the x-axis. It is not always one of the final angles.',
    visual: 'For cos(&theta;) = -&radic;3/2, &theta;<sub>ref</sub> = 30&deg;, but the final angles are 180&deg; - 30&deg; and 180&deg; + 30&deg;.',
    practice: 'Mini practice: If &theta;<sub>ref</sub> = 30&deg; and cosine is negative, what are the final angles?',
  },
  {
    title: 'Confused sine, cosine, and tangent',
    why: 'Sine tracks vertical position, cosine tracks horizontal position, and tangent compares sine to cosine.',
    visual: 'sin uses y-values, cos uses x-values, and tan is undefined when the x-value is 0.',
    practice: 'Mini practice: Which function is positive in Quadrants I and II: sine, cosine, or tangent?',
  },
  {
    title: 'Forgot tangent is undefined at 90&deg; and 270&deg;',
    why: 'tan(&theta;) = sin(&theta;) / cos(&theta;), so tangent is undefined when cos(&theta;) = 0.',
    visual: 'At 90&deg; and 270&deg;, the point lies on the y-axis and the x-coordinate is 0.',
    practice: 'Mini practice: Is tan(90&deg;) equal to 0 or undefined?',
  },
  {
    title: 'Treated axis angles as quadrants',
    why: 'Boundary angles lie exactly on an axis, not inside Quadrant I, II, III, or IV.',
    visual: '0&deg;, 90&deg;, 180&deg;, 270&deg;, and 360&deg; are axis positions on the unit circle.',
    practice: 'Mini practice: Is 180&deg; in a quadrant or on the negative x-axis?',
  },
  {
    title: 'Answer outside interval',
    why: 'The required interval is 0&deg; &le; &theta; &le; 360&deg;. Answers outside that interval do not belong in the final set.',
    visual: 'A full turn starts at 0&deg; and ends at 360&deg;; negative coterminal angles must be rewritten inside the interval.',
    practice: 'Mini practice: Replace -30&deg; with the matching angle between 0&deg; and 360&deg;.',
  },
];
function renderMistakeSection() {
  $('#equationMistakes').innerHTML = `<section class="section section-red"><h3 class="text-red-900">Common Trig Mistakes</h3><div class="cva-flow" id="clinicCvaFlow"></div><div class="mistake-clinic-grid">${COMMON_TRIG_MISTAKES.map((card, index) => `<article class="mistake-clinic-card"><span class="mastery-tag">Mistake ${index + 1}</span><h4>${card.title}</h4><div class="mistake-explain"><strong>Why it happens:</strong><p>${card.why}</p></div><div class="visual-correction"><strong>Visual correction:</strong><p>${card.visual}</p></div><div class="mini-practice"><strong>${card.practice}</strong></div></article>`).join('')}</div></section>`;
  renderCvaFlow($('#clinicCvaFlow'), [0, 1, 2, 3, 4]);
}

function bindMistakeDiagnosis() {
  const button = $('#challengeBtn');
  if (!button) return;
  button.addEventListener('click', () => setFeedback('challengeFeedback', diagnoseChallenge(LESSONS.equations.mistakes.challenge, $('#challengeInput').value)));
}

const CHALLENGE_LEVELS = [
  {
    level: 1,
    title: 'Identify trig signs',
    prompt: 'Determine the signs of sin, cos, and tan for θ = 240°.',
    placeholder: 'e.g., -, -, +',
    type: 'signs',
    expected: ['-', '-', '+'],
    correct: 'Correct. 240° is in Quadrant III, so sin is negative, cos is negative, and tan is positive.',
    diagnosis: 'Quadrant III has x < 0 and y < 0. Sine follows y, cosine follows x, and tangent is positive when sine and cosine have the same sign.',
  },
  {
    level: 2,
    title: 'Find reference angles',
    prompt: 'Find θref for cos(θ) = -√3/2.',
    placeholder: 'degrees',
    type: 'reference',
    expected: [30],
    correct: 'Correct. The reference angle is 30° because cos(30°) = √3/2.',
    diagnosis: 'Use the positive size of the trig value for θref. The negative sign chooses quadrants later; it does not make θref negative.',
  },
  {
    level: 3,
    title: 'Solve trig equations',
    prompt: 'Solve tan(θ) = -1 for 0° ≤ θ ≤ 360°.',
    placeholder: 'enter all solutions',
    type: 'equation',
    trig: 'tan',
    value: -1,
    expected: [135, 315],
    correct: 'Correct. tan is negative in Quadrants II and IV, so θ = 135° or 315°.',
  },
  {
    level: 4,
    title: 'Apply to a real-world trig scenario',
    prompt: 'A rotating beacon reaches half of its maximum vertical height when sin(θ) = 0.5. During one full turn, what angles θ satisfy this?',
    placeholder: 'enter all angles',
    type: 'scenario',
    trig: 'sin',
    value: 0.5,
    expected: [30, 150],
    correct: 'Correct. The beacon reaches that height at θ = 30° and θ = 150° during one full rotation.',
  },
];

function renderChallengeMode() {
  $('#challengeMode').innerHTML = `<section class="section section-purple"><h3 class="text-purple-900">Challenge Mode</h3><div class="cva-flow" id="challengeCvaFlow"></div><div class="challenge-level-grid">${CHALLENGE_LEVELS.map(challenge => `<article class="challenge-level-card"><div class="step-badge-row"><span class="mastery-tag">Level ${challenge.level}</span>${thinkingLevelBadge(challenge.level)}</div><h4>${challenge.title}</h4><p class="small-text mb-2">${challenge.prompt}</p><input type="text" id="challengeLevel${challenge.level}Input" class="inp-purple mb-2" placeholder="${challenge.placeholder}"><button class="btn btn-purple" type="button" id="challengeLevel${challenge.level}Btn">Check Level ${challenge.level}</button><div id="challengeLevel${challenge.level}Feedback" class="feedback hidden"></div></article>`).join('')}</div></section>`;
  renderCvaFlow($('#challengeCvaFlow'), [0, 1, 2, 3, 4]);
}

function bindChallengeMode() {
  CHALLENGE_LEVELS.forEach(challenge => {
    $(`#challengeLevel${challenge.level}Btn`).addEventListener('click', () => checkChallengeLevel(challenge));
  });
}

function checkChallengeLevel(challenge) {
  const input = $(`#challengeLevel${challenge.level}Input`);
  const value = input.value;
  let result;
  if (challenge.type === 'signs') {
    const ok = matchesSignPattern(value, challenge.expected);
    result = {
      ok,
      message: ok ? `${challenge.correct} Diagnosis: ${challenge.diagnosis}` : `Not yet. Diagnosis: ${challenge.diagnosis}`,
    };
  } else if (challenge.type === 'reference') {
    const ok = matchesEqNumbers(parsePracticeNumbers(value), challenge.expected);
    result = {
      ok,
      message: ok ? `${challenge.correct} Diagnosis: ${challenge.diagnosis}` : `Not yet. Diagnosis: ${challenge.diagnosis}`,
    };
  } else {
    const answers = parsePracticeNumbers(value);
    const ok = matchesEqNumbers(answers, challenge.expected);
    const diagnosis = ok ? 'The solution set matches the interval and the correct quadrants.' : diagnoseTrigMistake(answers, challenge.expected, challenge.trig, challenge.value);
    result = {
      ok,
      message: ok ? `${challenge.correct} Diagnosis: ${diagnosis}` : `Not yet. Diagnosis: ${diagnosis}`,
    };
  }
  setFeedback(`challengeLevel${challenge.level}Feedback`, result);
  if (result.ok) {
    recordCorrectStep(`challenge-level-${challenge.level}`);
    if (challenge.level === 4) recordCompletedExercise('challenge-mode');
  } else {
    recordWrongAttempt(`challenge level ${challenge.level}`);
    shakeGuidedInput(input);
  }
}

function matchesSignPattern(rawValue, expected) {
  const text = String(rawValue || '').toLowerCase();
  const named = ['sin', 'cos', 'tan'].map(name => {
    const match = text.match(new RegExp(`${name}[^+\-]*(positive|negative|[+\-])`));
    if (!match) return null;
    return match[1] === 'positive' || match[1] === '+' ? '+' : '-';
  });
  const wordSigns = (text.match(/positive|negative/g) || []).map(word => word === 'positive' ? '+' : '-');
  const signs = named.every(Boolean) ? named : wordSigns.length ? wordSigns.slice(0, 3) : (text.match(/[+\-]/g) || []).slice(0, 3);
  return signs.length === expected.length && signs.every((sign, index) => sign === expected[index]);
}

function setFeedback(id, result) {
  const box = document.getElementById(id);
  box.className = result.ok ? 'feedback feedback-ok mb-2' : 'feedback feedback-err mb-2';
  box.innerHTML = `<span class="feedback-icon">${result.ok ? '✓' : '✗'}</span><p>${result.message}</p>`;
}

function setStepText(id, text, html = false) {
  const p = $(`#${id} p`);
  if (html) p.innerHTML = text; else p.textContent = text;
}

function revealBlocks(ids) {
  ids.forEach((id, index) => setTimeout(() => document.getElementById(id).classList.add('visible'), index * 250));
}

function resetAnimatedBlocks(prefix, count) {
  for (let index = 0; index < count; index += 1) document.getElementById(`${prefix}Step${index}`)?.classList.remove('visible');
  document.getElementById(`${prefix}FinalBox`)?.classList.remove('visible');
  if (document.getElementById(`${prefix}Placeholder`)) document.getElementById(`${prefix}Placeholder`).style.display = 'block';
}

function drawTrigGraph(canvas, type, currentAngle, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, ox = 28, oy = H / 2, w = W - 46, h = 62;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; [oy - h, oy, oy + h].forEach(y => { ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + w, y); ctx.stroke(); });
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox, 15); ctx.lineTo(ox, H - 18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + w, oy); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  if (type === 'tan') [[1, 89], [91, 269], [271, 359]].forEach(([start, end]) => drawCurve(ctx, type, start, end, ox, oy, w, h)); else drawCurve(ctx, type, 0, 360, ox, oy, w, h);
  const value = trigValue(type, currentAngle), x = ox + (currentAngle / 360) * w, clipped = Math.max(-3, Math.min(3, value)), y = type === 'tan' ? oy - clipped * (h / 3) : oy - value * h;
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.font = 'bold 12px Nunito'; ctx.fillText(`y = ${type}(θ)`, ox + 6, 18);
}

function drawCurve(ctx, type, start, end, ox, oy, w, h) {
  ctx.beginPath(); let first = true;
  for (let degree = start; degree <= end; degree += 1) {
    const x = ox + (degree / 360) * w, value = trigValue(type, degree), clipped = Math.max(-3, Math.min(3, value)), y = type === 'tan' ? oy - clipped * (h / 3) : oy - value * h;
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function trigValue(type, degree) {
  if (type === 'sin') return Math.sin(toRad(degree));
  if (type === 'cos') return Math.cos(toRad(degree));
  return Math.tan(toRad(degree));
}

function drawUnitCircle(canvas, angleDeg) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = 95;
  ctx.clearRect(0, 0, W, H); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(W - 20, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, H - 20); ctx.stroke();
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ['I', 'II', 'III', 'IV'].forEach((q, i) => { const positions = [[55, -55], [-65, -55], [-70, 65], [55, 65]]; ctx.fillStyle = ['#16a34a', '#2563eb', '#ea580c', '#9333ea'][i]; ctx.font = 'bold 13px Nunito'; ctx.fillText(q, cx + positions[i][0], cy + positions[i][1]); });
  const rad = toRad(angleDeg), px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad);
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#334155'; ctx.font = 'bold 12px Nunito'; ctx.fillText(`${angleDeg}°`, px + 8, py - 8);
}

function drawEqGraph(canvas, trig, constant, solutions) {
  if (!canvas) return;
  drawTrigGraph(canvas, trig, 0, '#8b5cf6');
  const ctx = canvas.getContext('2d'), ox = 28, oy = canvas.height / 2, w = canvas.width - 46, h = 62;
  const y = trig === 'tan' ? oy - Math.max(-3, Math.min(3, constant)) * (h / 3) : oy - constant * h;
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + w, y); ctx.stroke(); ctx.setLineDash([]);
  (solutions || []).forEach(solution => { const x = ox + (solution / 360) * w; ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); });
}

function drawEqCircle(canvas, solutions) {
  if (!canvas) return;
  drawUnitCircle(canvas, 0);
  const ctx = canvas.getContext('2d'), cx = canvas.width / 2, cy = canvas.height / 2, r = 95;
  solutions.forEach(solution => { const rad = toRad(solution), px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.font = 'bold 10px Nunito'; ctx.fillText(`${solution.toFixed(1)}°`, px + 8, py - 8); });
}

function startHeroAnimation() {
  let angle = 0;
  const tick = () => {
    angle = (angle + 1) % 360;
    drawTrigGraph($('#learnHeroCanvas'), 'sin', angle, '#16a34a');
    drawUnitCircle($('#signHeroCanvas'), angle);
    drawEqGraph($('#equationHeroCanvas'), 'sin', 0.5, solveTrigEquation('sin', 0.5));
    requestAnimationFrame(tick);
  };
  tick();
}







function bindEquationMasterySolver() {
  if (!$('#eqMStep1')) return;
  setupProgress('eqMastery', EQUATION_MASTERY.length, $('#eqMasteryProgress'));
  unlockStep($('#eqMStep1'));
  EQUATION_MASTERY.forEach(step => {
    renderEquationHints(step);
    $(`#eqMCheck${step.step}`).addEventListener('click', () => checkEquationMasteryStep(step));
    $(`#eqMStep${step.step}`).addEventListener('click', event => {
      if (event.currentTarget.classList.contains('locked')) {
        setEquationStepFeedback(step.step, false, `Complete Step ${step.step - 1} correctly before opening this step.`);
        recordWrongAttempt('locked equation mastery step');
      }
    });
  });
}
function renderEquationHints(step) {
  const target = $(`#eqMHints${step.step}`);
  target.innerHTML = step.hints.map((hint, index) => `<button class="btn btn-gray hint-btn" type="button" data-step="${step.step}" data-hint="${index}" ${step.step > 1 ? 'disabled' : ''}>Level ${index + 1} Hint</button>`).join('');
  target.querySelectorAll('[data-hint]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      if ($(`#eqMStep${step.step}`).classList.contains('locked')) {
        setEquationStepFeedback(step.step, false, `Complete Step ${step.step - 1} correctly before using these hints.`);
        recordWrongAttempt('locked equation mastery hint');
        return;
      }
      recordHintUsed();
      setEquationStepFeedback(step.step, false, step.hints[Number(button.dataset.hint)]);
    });
  });
}

function checkEquationMasteryStep(step) {
  if ($(`#eqMStep${step.step}`).classList.contains('locked')) {
    setEquationStepFeedback(step.step, false, `Complete Step ${step.step - 1} correctly before opening this step.`);
    recordWrongAttempt('locked equation mastery step');
    return;
  }
  const correct = step.check();
  setEquationStepFeedback(step.step, correct, correct ? step.ok : step.wrong);
  if (!correct) {
    recordWrongAttempt(`equation mastery step ${step.step}`);
    shakeEquationInputs(step);
    return;
  }
  clearEquationInputErrors(step);
  if (isComplete('eqMastery', step.step)) return;
  recordCorrectStep(`eqMastery-step-${step.step}`);
  if (step.step === EQUATION_MASTERY.length) recordCompletedExercise('eqMastery');
  completeStep('eqMastery', step.step);
  markStepTag($(`#eqMTag${step.step}`));
  const nextStep = EQUATION_MASTERY.find(item => item.step === step.step + 1);
  if (nextStep) unlockStep($(`#eqMStep${nextStep.step}`));
}

function setEquationStepFeedback(step, ok, message) {
  const box = $(`#eqMFeedback${step}`);
  const icon = ok ? '✓' : '!';
  const label = ok ? 'Correct' : 'Try again';
  const prefix = ok ? 'Great work. ' : '';
  box.className = ok ? 'mastery-step-feedback feedback-ok' : 'mastery-step-feedback feedback-err';
  box.innerHTML = `<span class="feedback-icon" aria-hidden="true">${icon}</span><span><strong>${label}:</strong> ${prefix}${message}</span>`;
}

function shakeEquationInputs(step) {
  step.inputs.forEach(id => {
    const input = $(`#${id}`);
    if (!input) return;
    input.classList.remove('input-error-shake');
    void input.offsetWidth;
    input.classList.add('input-error-shake');
    window.setTimeout(() => input.classList.remove('input-error-shake'), 650);
  });
}

function clearEquationInputErrors(step) {
  step.inputs.forEach(id => $(`#${id}`)?.classList.remove('input-error-shake'));
}

function matchesEqNumbers(rawValues, expected, tolerance = 0.6) {
  const actual = rawValues.flatMap(value => (String(value).match(/-?\d+(\.\d+)?/g) || []).map(Number)).sort((a, b) => a - b);
  const target = [...expected].sort((a, b) => a - b);
  return actual.length === target.length && actual.every((value, index) => Math.abs(value - target[index]) <= tolerance);
}

function matchesQuadrants(rawValues, expected) {
  const roman = { i: 1, ii: 2, iii: 3, iv: 4 };
  const actual = rawValues.map(value => String(value).trim().toLowerCase()).map(value => roman[value] || Number(value)).filter(Number.isFinite).sort((a, b) => a - b);
  const target = [...expected].sort((a, b) => a - b);
  return actual.length === target.length && actual.every((value, index) => value === target[index]);
}



















