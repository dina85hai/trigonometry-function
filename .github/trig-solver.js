export function toRad(degrees) {
  return degrees * Math.PI / 180;
}

export function normalizeAngle(deg) {
  return ((Number(deg) % 360) + 360) % 360;
}

export function isBoundaryAngle(deg) {
  const n = normalizeAngle(deg);
  return n === 0 || n === 90 || n === 180 || n === 270 || n === 360;
}

export function getQuadrant(deg) {
  const n = normalizeAngle(deg);

  if (n === 0) return 'positive x-axis';
  if (n === 90) return 'positive y-axis';
  if (n === 180) return 'negative x-axis';
  if (n === 270) return 'negative y-axis';

  if (n > 0 && n < 90) return 'Quadrant I';
  if (n > 90 && n < 180) return 'Quadrant II';
  if (n > 180 && n < 270) return 'Quadrant III';
  return 'Quadrant IV';
}

export function isTanUndefined(deg) {
  const n = normalizeAngle(deg);
  return n === 90 || n === 270;
}

export function referenceAngle(trig, value) {
  const v = Math.abs(Number(value));

  if (trig === 'sin') return Math.asin(v) * 180 / Math.PI;
  if (trig === 'cos') return Math.acos(v) * 180 / Math.PI;
  if (trig === 'tan') return Math.atan(v) * 180 / Math.PI;

  return null;
}

export function uniqueSolutions(solutions) {
  return [...new Set(
    solutions
      .map(x => Number(x.toFixed(6)))
      .filter(x => x >= 0 && x <= 360)
  )].sort((a, b) => a - b);
}

export function solveTrigEquation(trig, value) {
  const v = Number(value);

  if ((trig === 'sin' || trig === 'cos') && (v < -1 || v > 1)) {
    return [];
  }

  let solutions = [];

  if (trig === 'sin') {
    const ref = Math.asin(Math.abs(v)) * 180 / Math.PI;

    if (v > 0) solutions = [ref, 180 - ref];
    else if (v < 0) solutions = [180 + ref, 360 - ref];
    else solutions = [0, 180, 360];
  }

  if (trig === 'cos') {
    const ref = Math.acos(Math.abs(v)) * 180 / Math.PI;

    if (v > 0) solutions = [ref, 360 - ref];
    else if (v < 0) solutions = [180 - ref, 180 + ref];
    else solutions = [90, 270];
  }

  if (trig === 'tan') {
    const ref = Math.atan(Math.abs(v)) * 180 / Math.PI;

    if (v > 0) solutions = [ref, 180 + ref];
    else if (v < 0) solutions = [180 - ref, 360 - ref];
    else solutions = [0, 180, 360];
  }

  return uniqueSolutions(solutions);
}

export function tidyDegree(value) {
  return Math.round(value * 10) / 10;
}

export function uniqueAngles(values) {
  return uniqueSolutions(values).map(tidyDegree);
}

export function getAngleLocation(degrees) {
  const quadrant = getQuadrant(degrees);
  return quadrant.includes('axis') ? `on the ${quadrant}` : `in ${quadrant}`;
}

export function getSigns(quadrant) {
  const key = String(quadrant).replace('Quadrant ', '');
  const map = {
    I: { sin: '+', cos: '+', tan: '+' },
    II: { sin: '+', cos: '-', tan: '-' },
    III: { sin: '-', cos: '-', tan: '+' },
    IV: { sin: '-', cos: '+', tan: '-' },
  };
  return map[key] || null;
}

export function signFromValue(value) {
  if (Math.abs(value) < 1e-9) return '0';
  return value > 0 ? '+' : '-';
}

export function getTrigSignsAt(degrees) {
  const rad = toRad(degrees);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tan = isTanUndefined(degrees) ? 'undefined' : signFromValue(Math.tan(rad));
  return { sin: signFromValue(sin), cos: signFromValue(cos), tan };
}

export function signWord(sign) {
  if (sign === '+') return 'positive';
  if (sign === '-') return 'negative';
  if (sign === '0') return 'zero';
  return 'undefined';
}

export function getReferenceAngle(trig, rawValue) {
  return referenceAngle(trig, rawValue);
}

export function getQuadrantText(trig, rawValue) {
  const value = Number(rawValue);
  if (Math.abs(value) < 1e-9) return 'boundary angles';
  const positive = value > 0;
  if (trig === 'sin') return positive ? 'Quadrants I and II' : 'Quadrants III and IV';
  if (trig === 'cos') return positive ? 'Quadrants I and IV' : 'Quadrants II and III';
  return positive ? 'Quadrants I and III' : 'Quadrants II and IV';
}

export function formatAngleList(solutions) {
  return solutions.map(value => `${Number(value).toFixed(1)}°`).join(' or ');
}
