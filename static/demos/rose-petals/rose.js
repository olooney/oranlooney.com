const PIP_POSITIONS = {
  1: [[60, 60]],
  2: [[30, 30], [90, 90]],
  3: [[30, 30], [60, 60], [90, 90]],
  4: [[30, 30], [30, 90], [90, 30], [90, 90]],
  5: [[30, 30], [30, 90], [60, 60], [90, 30], [90, 90]],
  6: [[30, 30], [30, 60], [30, 90], [90, 30], [90, 60], [90, 90]]
};

export function initializeRoseWidget(selector) {
  const root = document.querySelector(selector);

  if (!root) {
    throw new Error(`Rose widget root not found: ${selector}`);
  }

  const svg = root.querySelector('.rose svg');
  const answerEl = root.querySelector('.rose .answer');
  const petalCountEl = root.querySelector('#petal_count');
  const rerollButtonEl = root.querySelector('#reroll');
  const revealButtonEl = root.querySelector('#reveal');
  const hideButtonEl = root.querySelector('#hide');
  const confirmRevealDialogEl = root.querySelector('#rose-confirm');

  for (const [name, element] of Object.entries({
    svg,
    answerEl,
    petalCountEl,
    rerollButtonEl,
    revealButtonEl,
    hideButtonEl,
    confirmRevealDialogEl
  })) {
    if (!element) {
      throw new Error(`Rose widget element not found: ${name}`);
    }
  }

  let dice = [];
  let revealed = false;

// roll the five dice. In addition to the value shown, also add some random
// x/y jitter and a small random rotation.
  function rollDice(n) {
  return Array.from({ length: n }, (_, i) => ({
    value: Math.floor(Math.random() * 6) + 1,
    x: (i * 154) + 50 + (Math.random() * 20 - 10),
    y: 25 + (Math.random() * 20 - 10),
    angle: 20 - 40 * Math.random()
  }));
  }

  function drawDice(dice) {
  // clear out the SVG element entirely.
  svg.replaceChildren();

  // draw each die
  for (const die of dice) {
    // position each die in a strip with a small random rotation
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${die.x},${die.y}) rotate(${die.angle},60,60) scale(0.7)`);

    // square with rounded corner for the outline of each die
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", 120);
    rect.setAttribute("height", 120);
    rect.setAttribute("rx", 10);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("fill", "white");
    rect.setAttribute("stroke-width", 1);
    g.appendChild(rect);

    // traditional pip layout

    // draw the pips
    for (let i = 0; i < PIP_POSITIONS[die.value].length; i++) {
      const [cx, cy] = PIP_POSITIONS[die.value][i];
      const pip = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pip.setAttribute("cx", cx);
      pip.setAttribute("cy", cy);
      pip.setAttribute("r", 10);

      // color petals red when the answer is revealed
      const isPetal =
        (die.value === 3 && i !== 1) ||
        (die.value === 5 && i !== 2);
      pip.setAttribute("fill", revealed && isPetal ? "red" : "black");

      g.appendChild(pip);
    }

    svg.appendChild(g);
  }
  }

// calculate the current number of "petals" showing
  function computePetals(dice) {
  return dice.reduce((sum, d) => {
    if (d.value === 3) return sum + 2;
    if (d.value === 5) return sum + 4;
    return sum;
  }, 0);
  }

// reroll the dice and refresh the UI
  function reroll() {
  dice = rollDice(5);
  drawDice(dice);
  petalCountEl.textContent = computePetals(dice);
  }

// reveal the solution
  function reveal() {
  if (revealed) return;
  revealed = true;

  // reveal the text of the answer (hidden by default).
  answerEl.classList.add("revealed");

  // reroll the answer until examples of both a 3 and 5 are visible.
  while (dice.every(d => d.value !== 3) || dice.every(d => d.value !== 5)) {
    dice = rollDice(5);
  }

  // redraw the dice to pick up red petal pips.
  drawDice(dice);
  petalCountEl.textContent = computePetals(dice);

  revealButtonEl.classList.add("hidden");
  hideButtonEl.classList.remove("hidden");
  }

// show the modal dialog to confirm the reveal
  function revealDialog() {
  if (!confirmRevealDialogEl.open) {
    confirmRevealDialogEl.showModal();
  }
  }

// reveal the solution once confirmed
  function confirmReveal() {
  if (confirmRevealDialogEl.returnValue === "confirm") {
    reveal();
  }
  }

// hide the solution
  function hide() {
  if (!revealed) return;
  revealed = false;

  answerEl.classList.remove("revealed");
  drawDice(dice);

  revealButtonEl.classList.remove("hidden");
  hideButtonEl.classList.add("hidden");
  }

// click handlers
  rerollButtonEl.addEventListener("click", reroll);
  hideButtonEl.addEventListener("click", hide);
  revealButtonEl.addEventListener("click", revealDialog);
  confirmRevealDialogEl.addEventListener("close", confirmReveal);

  reroll();
}

