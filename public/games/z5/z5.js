// simulation configuration
const GRID_WIDTH = 256;
const GRID_HEIGHT = 256;
const SCALE = 2;

const STRIDES = [1, 1, 3, 3, 3];
const BOUNDS = [GRID_HEIGHT, GRID_WIDTH, 256, 256, 256];

const STEPS_PER_FRAME = 256;
const CURSOR_STEPS_PER_FRAME = 32;

let canvas;
let ctx;

let vector;
let cursor;
let cursorActive = false;

// re-implement RNG for deterministic seeding and reproducibility
let rngState = 37 >>> 0;

function random() {
  rngState = (1664525 * rngState + 1013904223) >>> 0;
  return rngState / 0x100000000;
}

function randInt(n) {
  return Math.floor(random() * n);
}

function makeVector() {
  return BOUNDS.map(randInt);
}

// global setup
function init() {
  canvas = document.getElementById("ctx");

  if (!canvas) {
    throw new Error('Canvas element with id "ctx" not found.');
  }

  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  vector = makeVector();
  cursor = makeVector();

  clear();
  installMouseHandlers();

  requestAnimationFrame(frame);
}

function clear() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// take one small step by STRIDE in a random direction along a random axis.
function step(v) {
  const axis = randInt(5);
  const stride = STRIDES[axis];
  const delta = randInt(2) ? -stride : stride;

  v[axis] = (v[axis] + delta + BOUNDS[axis]) % BOUNDS[axis];
}

// plot the current cursor vector to the canvas as one scaled "pixel."
function draw(v) {
  const y = v[0];
  const x = v[1];

  const r = v[2];
  const g = v[3];
  const b = v[4];

  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
}

// run many iterations of the simulation each animation frame.
function frame() {
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    step(vector);
    draw(vector);
  }

  if (cursorActive) {
    for (let i = 0; i < CURSOR_STEPS_PER_FRAME; i++) {
      step(cursor);
      draw(cursor);
    }
  }

  requestAnimationFrame(frame);
}

// mouse tracking
function installMouseHandlers() {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  canvas.addEventListener("mouseup", handleMouseUp);
}

function stopCursor() {
  cursorActive = false;
}

function startCursor() {
  cursorActive = true;
}

function handleMouseDown(event) {
  if (isLeftButton(event)) {
    setCursorPositionFromMouseEvent(event);
    startCursor();
  }
}

function handleMouseMove(event) {
  if (!isLeftButtonStillDown(event)) {
    stopCursor();
    return;
  }

  setCursorPositionFromMouseEvent(event);
  startCursor();
}

function handleMouseLeave() {
  stopCursor();
}

function handleMouseUp(event) {
  if (isLeftButton(event)) {
    stopCursor();
  }
}

function isLeftButton(event) {
  return event.button === 0;
}

function isLeftButtonStillDown(event) {
  return (event.buttons & 1) !== 0;
}

function setCursorPositionFromMouseEvent(event) {
  const point = getGridPointFromMouseEvent(event);

  cursor[0] = point.y;
  cursor[1] = point.x;
}

function getGridPointFromMouseEvent(event) {
  const rect = canvas.getBoundingClientRect();

  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;

  const x = Math.floor((canvasX / rect.width) * GRID_WIDTH);
  const y = Math.floor((canvasY / rect.height) * GRID_HEIGHT);

  return {
    x: clamp(x, 0, GRID_WIDTH - 1),
    y: clamp(y, 0, GRID_HEIGHT - 1),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

init();
