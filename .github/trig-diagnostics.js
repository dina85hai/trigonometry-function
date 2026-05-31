import { getQuadrant, isBoundaryAngle, isTanUndefined, referenceAngle, solveTrigEquation } from './trig-solver.js';
export function normaliseAnswer(value) {
  return String(value || '').trim().toLowerCase().replace(/cosine/g, 'cos').replace(/sine/g, 'sin').replace(/tangent/g, 'tan');
}

export function parseQuadrants(value) {
  const text = normaliseAnswer(value).replace(/quadrants?/g, '');
  const roman = { i: 1, ii: 2, iii: 3, iv: 4 };
  const found = [];
  text.split(/[\s,;]+/).filter(Boolean).forEach(part => {
    if (roman[part]) found.push(roman[part]);
    const n = Number(part);
    if (Number.isFinite(n)) found.push(n);
  });
  return found;
}

export function parseNumbers(value) {
  return (String(value).match(/-?\d+(\.\d+)?/g) || []).map(Number);
}

export function matchesNumbers(actual, expected, tolerance = 0.6) {
  if (actual.length !== expected.length) return false;
  const sortedActual = [...actual].sort((a, b) => a - b);
  const sortedExpected = [...expected].sort((a, b) => a - b);
  return sortedActual.every((value, index) => Math.abs(value - sortedExpected[index]) <= tolerance);
}

export function answerHasSigns(value, expected) {
  const text = String(value || '').toLowerCase();
  const named = ['sin', 'cos', 'tan'].map(name => {
    const match = text.match(new RegExp(`${name}[^+\-]*([+\-])`));
    return match ? match[1] : null;
  });
  const signs = named.every(Boolean) ? named : (text.match(/[+\-]/g) || []).slice(0, 3);
  return signs.length === 3 && signs.every((sign, index) => sign === expected[index]);
}

export function diagnoseMasteryStep(step, value) {
  if (Array.isArray(step.expected) && step.expected.every(item => typeof item === 'string')) {
    return answerHasSigns(value, step.expected) ? ok(step.correct) : fail(step.wrong);
  }
  if (Array.isArray(step.expected)) {
    const parsed = step.id === 'quadrant' || step.id === 'quadrants' ? parseQuadrants(value) : parseNumbers(value);
    return matchesNumbers(parsed, step.expected) ? ok(step.correct) : fail(step.wrong);
  }
  return normaliseAnswer(value) === step.expected ? ok(step.correct) : fail(step.wrong);
}

export function diagnoseTransfer(transfer, value) {
  if (Array.isArray(transfer.expected) && transfer.expected.every(item => typeof item === 'string')) {
    return answerHasSigns(value, transfer.expected) ? ok(transfer.correct) : fail(transfer.wrong);
  }
  return matchesNumbers(parseNumbers(value), transfer.expected) ? ok(transfer.correct) : fail(transfer.wrong);
}

export function diagnoseChallenge(challenge, value) {
  return matchesNumbers(parseNumbers(value), challenge.expected) ? ok(challenge.correct) : fail(challenge.wrong);
}

function ok(message) {
  return { ok: true, message };
}

function fail(message) {
  return { ok: false, message };
}

export function diagnoseTrigMistake(userAnswers, correctAnswers, trig, value) {
  const rawText = stringifyAnswerInput(userAnswers);
  const declaredTrig = extractTrigFunction(rawText, userAnswers);
  const originalUser = extractAnswerValues(userAnswers)
    .map(Number)
    .filter(x => !Number.isNaN(x));
  const user = [...originalUser].sort((a, b) => a - b);
  const correct = correctAnswers
    .map(Number)
    .sort((a, b) => a - b);

  if (!user.length && !rawText) {
    return 'Enter at least one angle so the mistake can be diagnosed.';
  }

  if (declaredTrig && declaredTrig !== trig) {
    return 'You used the wrong trig function. Check whether the equation uses sin, cos, or tan before solving.';
  }

  if (user.some(x => x < 0 || x > 360)) {
    return 'One of your answers is outside the required interval 0° ≤ θ ≤ 360°.';
  }

  if (hasDuplicateAngles(user)) {
    return 'You included a duplicate answer. Each solution should be written only once.';
  }

  if (trig === 'tan' && user.some(isTanUndefined)) {
    return 'Tangent is undefined at 90° and 270°, so those angles cannot be tangent-equation solutions.';
  }

  if (treatsBoundaryAsQuadrant(rawText, correct)) {
    return 'A boundary angle lies on an axis, not inside a quadrant. Use the exact boundary angle instead.';
  }

  if (matchesAngleSet(user, correct)) {
    return 'Correct. Your solutions match the equation in 0° ≤ θ ≤ 360°.';
  }

  if (user.length > 0 && user.length < correct.length) {
    return 'You found one solution, but this equation has more than one solution in 0° ≤ θ ≤ 360°.';
  }

  const ref = Number(referenceAngle(trig, value)?.toFixed(1));
  if (Number.isFinite(ref) && includesAngle(user, ref) && !includesAngle(correct, ref)) {
    return 'You used the reference angle as the final answer. First check the correct quadrant.';
  }

  if (confusedSecondAngle(user, correct, ref)) {
    return 'You confused 180° - θref with 360° - θref. Choose the formula that matches the correct quadrant.';
  }

  if (matchesOtherTrigFunction(user, trig, value)) {
    return 'Your angles match a different trig function. Recheck whether the equation is asking for sin, cos, or tan.';
  }

  if (hasWrongQuadrantText(rawText, correct) || hasWrongQuadrant(user, correct)) {
    return 'Your answer is in the wrong quadrant. Use the sign of the trig value to choose the correct quadrant.';
  }

  if (hasWrongSign(user, trig, value, rawText)) {
    return 'Your answers have the wrong sign for this trig equation. Check the ASTC signs before choosing quadrants.';
  }

  if (trig === 'tan' && correct.some(isTanUndefined) && !rawText.includes('undefined')) {
    return 'Remember that tangent is undefined at 90° and 270°.';
  }

  return 'Check the ASTC signs and calculate the final angles again.';
}

function extractAnswerValues(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    if (Array.isArray(input.answers)) return input.answers;
    if (Array.isArray(input.userAnswers)) return input.userAnswers;
    if (Array.isArray(input.values)) return input.values;
  }
  return parseNumbers(input);
}

function stringifyAnswerInput(input) {
  if (Array.isArray(input)) return input.join(' ').toLowerCase();
  if (input && typeof input === 'object') return Object.values(input).flat().join(' ').toLowerCase();
  return String(input || '').toLowerCase();
}

function extractTrigFunction(rawText, input) {
  const explicit = input && typeof input === 'object' ? input.trig || input.function || input.trigFunction : null;
  const text = normaliseAnswer(explicit || rawText);
  const match = text.match(/\b(sin|cos|tan)\b/);
  return match ? match[1] : null;
}

function hasDuplicateAngles(values) {
  return values.some((value, index) => values.slice(index + 1).some(other => nearlyEqual(value, other)));
}

function treatsBoundaryAsQuadrant(rawText, correct) {
  return correct.some(isBoundaryAngle) && /\b(quadrant|quad|qi|qii|qiii|qiv|i|ii|iii|iv)\b/i.test(rawText);
}

function confusedSecondAngle(user, correct, ref) {
  if (!Number.isFinite(ref)) return false;
  const angle180 = 180 - ref;
  const angle360 = 360 - ref;
  return (includesAngle(correct, angle180) && includesAngle(user, angle360)) || (includesAngle(correct, angle360) && includesAngle(user, angle180));
}

function matchesOtherTrigFunction(user, trig, value) {
  return ['sin', 'cos', 'tan']
    .filter(name => name !== trig)
    .some(name => matchesAngleSet(user, solveTrigEquation(name, value)));
}

function hasWrongSign(user, trig, value, rawText = '') {
  const expectedSign = Math.sign(Number(value));
  if (expectedSign === 0) return false;
  if (expectedSign > 0 && /negative|-/.test(rawText)) return true;
  if (expectedSign < 0 && /positive|\+/.test(rawText)) return true;
  return user.some(angle => {
    const actual = trigValueAt(trig, angle);
    return Number.isFinite(actual) && Math.sign(actual) !== 0 && Math.sign(actual) !== expectedSign;
  });
}

function hasWrongQuadrant(user, correct) {
  if (!user.length) return false;
  const correctQuadrants = correct.map(getQuadrant);
  return user.some(angle => !correctQuadrants.includes(getQuadrant(angle)));
}

function hasWrongQuadrantText(rawText, correct) {
  const submitted = parseQuadrants(rawText).map(number => `Quadrant ${['', 'I', 'II', 'III', 'IV'][number]}`).filter(text => !text.endsWith('undefined'));
  if (!submitted.length) return false;
  const correctQuadrants = correct.map(getQuadrant);
  return submitted.some(quadrant => !correctQuadrants.includes(quadrant));
}

function trigValueAt(trig, angle) {
  const rad = Number(angle) * Math.PI / 180;
  if (trig === 'sin') return Math.sin(rad);
  if (trig === 'cos') return Math.cos(rad);
  if (trig === 'tan') return isTanUndefined(angle) ? NaN : Math.tan(rad);
  return NaN;
}

function matchesAngleSet(actual, expected, tolerance = 0.6) {
  return matchesNumbers(actual, expected, tolerance);
}

function includesAngle(values, target, tolerance = 0.6) {
  return values.some(value => nearlyEqual(value, target, tolerance));
}

function nearlyEqual(a, b, tolerance = 0.6) {
  return Math.abs(Number(a) - Number(b)) <= tolerance;
}



