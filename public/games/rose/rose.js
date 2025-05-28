const svg = document.querySelector('.rose svg');
const answerEl = document.querySelector('.rose .answer');
const petalCountEl = document.getElementById('petal_count');
let dice = [];
let revealed = false;

function rollDice(n) {
  return Array.from({ length: n }, (_, i) => ({
    value: Math.floor(Math.random() * 6) + 1,
    x: (i * 154) + 50 + (Math.random() * 20 - 10),
    y: 25 + (Math.random() * 20 - 10),
    angle: 20 - 40 * Math.random()
  }));
}

function drawDice(dice) {
  svg.innerHTML = '';
  for (const die of dice) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${die.x},${die.y}) rotate(${die.angle},60,60) scale(0.7)`);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', 120);
    rect.setAttribute('height', 120);
    rect.setAttribute('rx', 10);
    rect.setAttribute('stroke', 'black');
    rect.setAttribute('fill', 'white');
    rect.setAttribute('stroke-width', 1);
    g.appendChild(rect);

    const pipPositions = {
      1: [[60, 60]],
      2: [[30, 30], [90, 90]],
      3: [[30, 30], [60, 60], [90, 90]],
      4: [[30, 30], [30, 90], [90, 30], [90, 90]],
      5: [[30, 30], [30, 90], [60, 60], [90, 30], [90, 90]],
      6: [[30, 30], [30, 60], [30, 90], [90, 30], [90, 60], [90, 90]]
    };

    for (let i = 0; i < pipPositions[die.value].length; i++) {
      const [cx, cy] = pipPositions[die.value][i];
      const pip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pip.setAttribute('cx', cx);
      pip.setAttribute('cy', cy);
      pip.setAttribute('r', 10);

      // color petals red when the answer is revealed
      const isPetal =
        (die.value === 3 && i !== 1) ||
        (die.value === 5 && i !== 2);
      pip.setAttribute('fill', revealed && isPetal ? 'red' : 'black');

      g.appendChild(pip);
    }

    svg.appendChild(g);
  }
}

function computePetals(dice) {
  return dice.reduce((sum, d) => {
    if (d.value === 3) return sum + 2;
    if (d.value === 5) return sum + 4;
    return sum;
  }, 0);
}

function reroll() {
  dice = rollDice(5);
  drawDice(dice);
  petalCountEl.textContent = computePetals(dice);
}

function reveal() {
  if ( revealed) return;
  revealed = true;

  // reveal the text of the answer (hidden by default).
  answerEl.classList.add('revealed');

  // reroll the answer until examples of both a 3 and 5 are visible.
  while ( dice.every(d => d.value != 3) || dice.every(d => d.value != 5) ) {
    dice = rollDice(5);
  }

  // redraw the dice to pick up red petal pips.
  drawDice(dice);
  petalCountEl.textContent = computePetals(dice);
}

document.getElementById('reroll').addEventListener('click', reroll);
document.getElementById('reveal').addEventListener('click', reveal);

reroll();
