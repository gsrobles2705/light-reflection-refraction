// Marks drawn over each statement image while the solution is revealed. Coordinates are pixels of the image itself
// (problema-10.jpg is 1000×954, problema-11.jpg 1000×907, problema-13.jpg 1000×834). A mark shows from step `step` on
// (the step with that index is on screen) and, when it has `until`, disappears once the step after `until` appears,
// so a result can replace a question mark. Angles are in degrees, counter-clockwise from the +x axis (y points up).

export const PROBLEM_FIGURES = {
  10: {
    size: [1000, 954],
    marks: [
      { type: 'pill', step: 0, until: 4, x: 810, y: 545, text: 'n aceite = ?', tone: 'ask' },
      { type: 'pill', step: 0, x: 470, y: 612, text: 'n = 1,5', tone: 'info' },
      { type: 'ray', step: 1, from: [322, 580], to: [537, 452], tone: 'ray' },
      { type: 'arc', step: 2, at: [537, 452], r: 70, from: 180, to: 210.8, tone: 'angle' },
      { type: 'pill', step: 2, x: 445, y: 482, text: '30°', tone: 'angle', small: true },
      { type: 'line', step: 3, from: [537, 452], to: [537, 575], tone: 'normal' },
      { type: 'arc', step: 3, at: [537, 452], r: 62, from: 210.8, to: 270, tone: 'angle' },
      { type: 'pill', step: 3, x: 498, y: 548, text: '60°', tone: 'angle', small: true },
      { type: 'ray', step: 4, from: [537, 452], to: [770, 452], tone: 'out' },
      { type: 'pill', step: 4, x: 735, y: 424, text: '90°', tone: 'out', small: true },
      { type: 'pill', step: 5, x: 810, y: 545, text: 'n ≈ 1,3', tone: 'result' },
    ],
  },
  11: {
    size: [1000, 907],
    marks: [
      { type: 'pill', step: 0, x: 450, y: 652, text: 'n = 5/4', tone: 'info' },
      { type: 'ray', step: 1, from: [325, 548], to: [601, 548], tone: 'ray' },
      { type: 'line', step: 2, from: [601, 548], to: [725, 548], tone: 'normal' },
      { type: 'arc', step: 2, at: [601, 548], r: 70, from: -32.5, to: 0, tone: 'angle' },
      { type: 'pill', step: 2, x: 722, y: 512, text: 'θ', tone: 'angle', small: true },
      { type: 'line', step: 2, from: [601 - 0.538 * 90, 548 + 0.843 * 90], to: [601 + 0.538 * 110, 548 - 0.843 * 110], tone: 'normal' },
      { type: 'arc', step: 2, at: [601, 548], r: 62, from: 180, to: 237.5, tone: 'angle' },
      { type: 'pill', step: 2, until: 4, x: 482, y: 590, text: '90° − θ', tone: 'angle', small: true },
      { type: 'ray', step: 3, from: [607, 538], to: [745, 626], tone: 'out' },
      { type: 'pill', step: 3, x: 775, y: 585, text: '90°', tone: 'out', small: true },
      { type: 'pill', step: 4, x: 830, y: 350, text: 'θ = 37°', tone: 'info', small: true },
      { type: 'pill', step: 5, x: 482, y: 590, text: '53°', tone: 'result', small: true },
      { type: 'pill', step: 5, x: 810, y: 420, text: '90° − 37° = 53°', tone: 'result', small: true },
    ],
  },
  13: {
    size: [1000, 834],
    marks: [
      { type: 'pill', step: 0, until: 5, x: 600, y: 330, text: 'n = ?', tone: 'ask' },
      { type: 'ray', step: 1, from: [432, 368], to: [508, 490], tone: 'ray' },
      { type: 'arc', step: 2, at: [508, 490], r: 58, from: 122, to: 180, tone: 'angle' },
      { type: 'pill', step: 2, x: 428, y: 432, text: '60°', tone: 'angle', small: true },
      { type: 'line', step: 3, from: [508, 440], to: [508, 560], tone: 'normal' },
      { type: 'arc', step: 3, at: [508, 490], r: 72, from: 90, to: 122, tone: 'angle' },
      { type: 'pill', step: 3, x: 590, y: 398, text: 'θ₁ = 30°', tone: 'angle', small: true },
      { type: 'ray', step: 4, from: [508, 490], to: [612, 607], tone: 'out' },
      { type: 'arc', step: 4, at: [508, 490], r: 52, from: -90, to: -48.4, tone: 'angle' },
      { type: 'pill', step: 4, x: 400, y: 600, text: 'θ₂ = 45°', tone: 'out', small: true },
      { type: 'pill', step: 5, x: 770, y: 600, text: 'n·sen 30° = sen 45°', tone: 'info', small: true },
      { type: 'pill', step: 6, x: 600, y: 330, text: 'n = √2', tone: 'result' },
    ],
  },
}
