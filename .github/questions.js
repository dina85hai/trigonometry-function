export const trigExercises = [
  {
    trig: "sin",
    value: 0.5,
    equation: "sin(θ) = 0.5",
    solutions: [30, 150],
    transfer: "sin(θ) = -0.5"
  },
  {
    trig: "sin",
    value: -0.5,
    equation: "sin(θ) = -0.5",
    solutions: [210, 330],
    transfer: "sin(θ) = 1"
  },
  {
    trig: "cos",
    value: 0.5,
    equation: "cos(θ) = 0.5",
    solutions: [60, 300],
    transfer: "cos(θ) = -0.5"
  },
  {
    trig: "cos",
    value: -0.866,
    equation: "cos(θ) = -√3/2",
    solutions: [150, 210],
    transfer: "cos(θ) = 0"
  },
  {
    trig: "tan",
    value: 1,
    equation: "tan(θ) = 1",
    solutions: [45, 225],
    transfer: "tan(θ) = -1"
  },
  {
    trig: "tan",
    value: -1,
    equation: "tan(θ) = -1",
    solutions: [135, 315],
    transfer: "tan(θ) = 0"
  },
  {
    trig: "sin",
    value: 1,
    equation: "sin(θ) = 1",
    solutions: [90],
    transfer: "sin(θ) = 0"
  },
  {
    trig: "cos",
    value: 0,
    equation: "cos(θ) = 0",
    solutions: [90, 270],
    transfer: "cos(θ) = 1"
  }
];
export const CVA_FLOW = [
  { label: 'Concrete', text: 'Real-life meaning.' },
  { label: 'Visual', text: 'Unit circle, graph, slider, or animation.' },
  { label: 'Abstract', text: 'Formula, ASTC, inverse trig, reference angle.' },
  { label: 'Practice', text: 'Guided step-by-step solving.' },
  { label: 'Transfer', text: 'New but related question.' },
];


export const TRIG_SOLUTION_BANK = [
  { functionName: 'sin', equation: 'sin(&theta;) = 0.5', solutions: '30&deg;, 150&deg;', note: 'Sine is positive in Quadrants I and II.' },
  { functionName: 'sin', equation: 'sin(&theta;) = -0.5', solutions: '210&deg;, 330&deg;', note: 'Sine is negative in Quadrants III and IV.' },
  { functionName: 'sin', equation: 'sin(&theta;) = 1', solutions: '90&deg;', note: 'Boundary angle on the positive y-axis.' },
  { functionName: 'sin', equation: 'sin(&theta;) = 0', solutions: '0&deg;, 180&deg;, 360&deg;', note: 'Boundary angles on the x-axis.' },
  { functionName: 'cos', equation: 'cos(&theta;) = 0.5', solutions: '60&deg;, 300&deg;', note: 'Cosine is positive in Quadrants I and IV.' },
  { functionName: 'cos', equation: 'cos(&theta;) = -&radic;3/2', solutions: '150&deg;, 210&deg;', note: 'Cosine is negative in Quadrants II and III.' },
  { functionName: 'cos', equation: 'cos(&theta;) = 0', solutions: '90&deg;, 270&deg;', note: 'Boundary angles on the y-axis.' },
  { functionName: 'cos', equation: 'cos(&theta;) = 1', solutions: '0&deg;, 360&deg;', note: 'Boundary angles on the positive x-axis.' },
  { functionName: 'tan', equation: 'tan(&theta;) = 1', solutions: '45&deg;, 225&deg;', note: 'Tangent is positive in Quadrants I and III.' },
  { functionName: 'tan', equation: 'tan(&theta;) = -1', solutions: '135&deg;, 315&deg;', note: 'Tangent is negative in Quadrants II and IV.' },
  { functionName: 'tan', equation: 'tan(&theta;) = 0', solutions: '0&deg;, 180&deg;, 360&deg;', note: 'Boundary angles on the x-axis.' },
  { functionName: 'tan', equation: 'tan(90&deg;)', solutions: 'undefined', note: 'cos(90&deg;) = 0, so tangent is undefined.' },
  { functionName: 'tan', equation: 'tan(270&deg;)', solutions: 'undefined', note: 'cos(270&deg;) = 0, so tangent is undefined.' },
];

export const LESSONS = {
  signs: {
    title: 'Unit Circle & Quadrant Signs',
    structure: {
      cva: [
        '<strong>Concrete:</strong> read a rotating point as right/left and above/below positions.',
        '<strong>Visual:</strong> use the unit circle, function graphs, slider, and animation.',
        '<strong>Abstract:</strong> apply sin from y, cos from x, tan from y/x, and ASTC notation.',
      ],
      thinking: [
        'Level 1: intuition and basic logic.',
        'Level 2: pattern and visual structure.',
        'Level 3: abstraction and generalization.',
        'Level 4: application and challenge.',
      ],
      mastery: [
        'Answer quadrant, positive function, then sign pattern.',
        'Later steps stay locked until the current answer is correct.',
        'Feedback gives correction, hints, and transfer practice.',
      ],
    },
    focus: [
      { title: 'Sine', text: 'sin(θ) follows the vertical value on the unit circle and changes sign above or below the x-axis.' },
      { title: 'Cosine', text: 'cos(θ) follows the horizontal value on the unit circle and changes sign left or right of the y-axis.' },
      { title: 'Tangent', text: 'tan(θ) compares sine and cosine signs. It is positive when sin and cos have the same sign.' },
      { title: 'Boundary Angles', text: 'At 0°, 90°, 180°, 270°, and 360°, one function may be zero or tangent may be undefined.' },
    ],
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Start with the point on the unit circle: above means sin is positive, right means cos is positive.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'Use the four quadrants to see the repeating sign pattern for sin, cos, and tan.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Use ASTC and the unit-circle notation (cos θ, sin θ) to decide signs for any angle.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Diagnose boundary angles and transfer the sign pattern to unfamiliar angles.' },
    ],
    boundaryRows: [
      ['0°', '0', '1', '0', '(1, 0)'],
      ['90°', '1', '0', 'undefined', '(0, 1)'],
      ['180°', '0', '−1', '0', '(−1, 0)'],
      ['270°', '−1', '0', 'undefined', '(0, −1)'],
      ['360°', '0', '1', '0', '(1, 0)'],
    ],
    workedExample: {
      title: 'Worked Example',
      question: 'Determine the signs of sin, cos, and tan for an angle of 210°.',
      steps: [
        'Identify the quadrant. 210° is between 180° and 270°, so it is in <strong>Quadrant III</strong>.',
        'Apply ASTC. In Quadrant III, only tangent is positive.',
        'Therefore sin(210°) is negative, cos(210°) is negative, and tan(210°) is positive.',
      ],
      answer: 'Answer: sin(−), cos(−), tan(+)',
    },
    mastery: {
      id: 'signs',
      title: 'Mastery Solver: Sign Pattern Practice',
      note: 'Answer each step in order. Locked steps give a hint when selected and unlock only after the current step is correct.',
      steps: [
        { id: 'quadrant', label: 'Step 1', prompt: 'Concrete angle: 315°. Which quadrant is it in?', placeholder: 'e.g., IV or 4', expected: [4], hint: '<strong>Hint:</strong> 315° is between 270° and 360°.', correct: 'Correct. 315° is in Quadrant IV.', wrong: '<strong>Diagnosis:</strong> Check the interval first. Quadrant IV is the last quarter-turn, from 270° to 360°.' },
        { id: 'positive', label: 'Step 2', prompt: 'Visual sign: in that quadrant, which function is positive?', placeholder: 'sin, cos, or tan', expected: 'cos', hint: '<strong>Hint:</strong> Use ASTC: QI All, QII Sin, QIII Tan, QIV Cos.', correct: 'Correct. In Quadrant IV, cosine is positive because the x-coordinate is positive.', wrong: '<strong>Diagnosis:</strong> For 315°, only cosine is positive.' },
        { id: 'signs', label: 'Step 3', prompt: 'Abstract result: enter signs for sin, cos, tan.', placeholder: 'e.g., -, +, -', expected: ['-', '+', '-'], hint: '<strong>Hint:</strong> If only cosine is positive, sine and tangent are negative.', correct: 'Mastered. For 315°: sin is negative, cos is positive, and tan is negative.', wrong: '<strong>Diagnosis:</strong> QIV means sin(−), cos(+), tan(−).' },
      ],
      transfer: { prompt: 'Without calculating exact values, what is the sign pattern for 150°?', placeholder: 'sin, cos, tan signs', expected: ['+', '-', '-'], correct: 'Transfer complete. 150° is in Quadrant II, so sin(+), cos(−), tan(−).', wrong: 'Try the quadrant first: 150° is between 90° and 180°, so Quadrant II. In QII only sine is positive.' },
    },
  },
  equations: {
    title: 'Reference Angles & Trig Equations',
    structure: {
      cva: [
        '<strong>Concrete:</strong> treat the equation as a target sine, cosine, or tangent value.',
        '<strong>Visual:</strong> locate matching points on the graph and unit circle.',
        '<strong>Abstract:</strong> use θ_ref, quadrant signs, and solution notation on 0° ≤ θ ≤ 360°.',
      ],
      thinking: [
        'Level 1: understand the target value.',
        'Level 2: find all visual matches.',
        'Level 3: generalize with reference-angle rules.',
        'Level 4: handle boundary angles and diagnose mistakes.',
      ],
      mastery: [
        'Answer reference angle, quadrants, then final solutions.',
        'Steps unlock only after correct answers.',
        'Hints respond to skipped steps and common trig mistakes.',
      ],
    },
    focus: [
      { title: 'Reference Angle', text: 'Use the positive size of the trig value to find the acute reference angle.' },
      { title: 'Quadrant Signs', text: 'Use the sign of the trig value to choose the correct quadrants before writing answers.' },
      { title: 'Boundary Angles', text: 'Check 0°, 90°, 180°, 270°, and 360° when the trig value is 0, 1, −1, or tangent is undefined.' },
      { title: 'Common Mistakes', text: 'Avoid using the final angle as the reference angle, choosing wrong sign quadrants, or missing a second solution.' },
    ],
    thinking: [
      { level: 'Level 1', title: 'Intuition & Basic Logic', text: 'Read the equation as a target value for sin, cos, or tan.' },
      { level: 'Level 2', title: 'Pattern & Visual Structure', text: 'Use the graph and unit circle to locate all matching positions, not just the first one.' },
      { level: 'Level 3', title: 'Abstraction & Generalization', text: 'Find θ_ref with inverse trig, then use quadrant signs to write the full solution set.' },
      { level: 'Level 4', title: 'Application & Challenge', text: 'Handle boundary angles and diagnose sign, reference-angle, and missing-solution mistakes.' },
    ],
    referenceRows: [
      ['I', 'θ = θ_ref', 'sin, cos, tan'],
      ['II', 'θ = 180° − θ_ref', 'sin'],
      ['III', 'θ = 180° + θ_ref', 'tan'],
      ['IV', 'θ = 360° − θ_ref', 'cos'],
    ],
    workedExamples: [
      {
        title: 'Example 1',
        equation: 'sin(θ) = 0.5',
        reference: 'θref = 30°',
        reasoning: 'Sine is positive in Quadrants I and II.',
        calculations: ['Quadrant I: θ = 30°', 'Quadrant II: θ = 180° - 30° = 150°'],
        answer: 'θ = 30°, 150°',
      },
      {
        title: 'Example 2',
        equation: 'cos(θ) = -√3/2',
        reference: 'θref = 30°',
        reasoning: 'Cosine is negative in Quadrants II and III.',
        calculations: ['Quadrant II: θ = 180° - 30° = 150°', 'Quadrant III: θ = 180° + 30° = 210°'],
        answer: 'θ = 150°, 210°',
      },
      {
        title: 'Example 3',
        equation: 'tan(θ) = 1',
        reference: 'θref = 45°',
        reasoning: 'Tangent is positive in Quadrants I and III.',
        calculations: ['Quadrant I: θ = 45°', 'Quadrant III: θ = 180° + 45° = 225°'],
        answer: 'θ = 45°, 225°',
      },
    ],    workedExample: {
      title: 'Worked Example',
      question: 'Solve sin(&theta;) = 0.5 for 0&deg; &le; &theta; &le; 360&deg;.',
      steps: [
        'Read the target value directly: sin(&theta;) = 0.5.',
        'Find the reference angle: θ_ref = sin⁻¹(0.5) = <strong>30°</strong>.',
        'Since sine is positive, choose Quadrants I and II.',
        'Quadrant I gives 30°. Quadrant II gives 180° − 30° = 150°.',
      ],
      answer: 'Answer: θ = 30° or θ = 150°',
    },
    mastery: {
      id: 'equations',
      title: 'Mastery Solver: Trig Equation Practice',
      note: 'Answer each step in order. Locked steps give a hint when selected and unlock only after the current step is correct.',
      steps: [
        { id: 'reference', label: 'Step 1', prompt: 'Solve: cos(θ) = −0.5 for 0° ≤ θ ≤ 360°. Enter the reference angle.', placeholder: 'degrees', expected: [60], hint: '<strong>Hint:</strong> Use the positive size: cos⁻¹(0.5).', correct: 'Correct. cos⁻¹(0.5) gives the reference angle 60°.', wrong: '<strong>Diagnosis:</strong> Use the positive size of the ratio for the reference angle: cos⁻¹(0.5) = 60°.' },
        { id: 'quadrants', label: 'Step 2', prompt: 'Which quadrants contain the solutions?', placeholder: 'e.g., II, III', expected: [2, 3], hint: '<strong>Hint:</strong> Negative cosine means x-coordinate is negative.', correct: 'Correct. Cosine is negative in Quadrants II and III.', wrong: '<strong>Diagnosis:</strong> Decide from the sign first: negative cosine means Quadrants II and III.' },
        { id: 'solutions', label: 'Step 3', prompt: 'Enter all solutions in degrees, separated by commas.', placeholder: 'e.g., 120, 240', expected: [120, 240], hint: '<strong>Hint:</strong> Combine 60° with QII and QIII.', correct: 'Mastered. QII gives 180° − 60° = 120°, and QIII gives 180° + 60° = 240°.', wrong: '<strong>Diagnosis:</strong> Combine the 60° reference angle with QII and QIII: 180° − 60° and 180° + 60°.' },
      ],
      transfer: { prompt: 'Now solve: tan(θ) = 1 for 0° ≤ θ ≤ 360°.', placeholder: 'enter both solutions', expected: [45, 225], correct: 'Transfer complete. tan is positive in Quadrants I and III, so θ = 45° or 225°.', wrong: 'Use tan⁻¹(1) = 45°, then place positive tangent in Quadrants I and III.' },
    },
    mistakes: {
      cards: [
        { title: 'Wrong quadrants', text: 'Use the sign of sin, cos, or tan before writing final angles.' },
        { title: 'Reference angle confusion', text: 'θ_ref is the acute angle to the x-axis, not necessarily a final solution.' },
        { title: 'Missing boundary checks', text: 'Check 0°, 90°, 180°, 270°, and 360° when k is 0, 1, −1, or tangent is undefined.' },
      ],
      challenge: { prompt: 'Diagnose this answer: cos(&theta;) = -&radic;3/2 gives &theta; = 30&deg;, 330&deg;.', hint: 'The sign of cosine must decide the quadrants.', placeholder: 'e.g. 150, 210', expected: [150, 210], correct: 'Correct diagnosis. The mistaken answer used positive-cosine quadrants. Negative cosine belongs in QII and QIII.', wrong: 'Not quite. The error is a quadrant-sign error: cos(&theta;) is negative, so choose Quadrants II and III with a 30&deg; reference angle.' },
    },
  },
};




