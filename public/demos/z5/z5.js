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
let animationRequestId;
let isPaused = false;

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
  installControlHandlers();
  updateDrawLabel();

  resumeAnimation();
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
  animationRequestId = undefined;

  if (!isPaused) {
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      step(vector);
      draw(vector);
    }
  }

  if (cursorActive) {
    for (let i = 0; i < CURSOR_STEPS_PER_FRAME; i++) {
      step(cursor);
      draw(cursor);
    }
  }

  if (!isPaused || cursorActive) {
    requestFrame();
  }
}

function requestFrame() {
  if (animationRequestId === undefined) {
    animationRequestId = requestAnimationFrame(frame);
  }
}

function installControlHandlers() {
  const toggleButton = document.getElementById("toggle-animation");
  const clearButton = document.getElementById("clear-canvas");
  const downloadButton = document.getElementById("download-png");

  toggleButton.addEventListener("click", toggleAnimation);
  clearButton.addEventListener("click", clear);
  downloadButton.addEventListener("click", downloadPng);
}

function updateDrawLabel() {
  const drawLabel = document.getElementById("draw-label");
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  drawLabel.textContent = hasTouch ? "Press and Hold to Draw" : "Click and Hold to Draw";
}

function toggleAnimation() {
  if (isPaused) {
    resumeAnimation();
  } else {
    pauseAnimation();
  }
}

function pauseAnimation() {
  isPaused = true;

  if (animationRequestId !== undefined) {
    cancelAnimationFrame(animationRequestId);
    animationRequestId = undefined;
  }

  updateToggleButton();
}

function resumeAnimation() {
  isPaused = false;

  requestFrame();

  updateToggleButton();
}

function updateToggleButton() {
  const toggleButton = document.getElementById("toggle-animation");
  toggleButton.dataset.state = isPaused ? "paused" : "playing";
  toggleButton.setAttribute("aria-label", isPaused ? "Resume animation" : "Pause animation");
}

function downloadPng() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "z5.png";
  link.click();
}

// mouse tracking
function installMouseHandlers() {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);
  canvas.addEventListener("touchcancel", handleTouchEnd);
}

function stopCursor() {
  cursorActive = false;
}

function startCursor() {
  cursorActive = true;
  requestFrame();
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

function handleTouchStart(event) {
  event.preventDefault();
  setCursorPositionFromTouchEvent(event);
  startCursor();
}

function handleTouchMove(event) {
  event.preventDefault();
  setCursorPositionFromTouchEvent(event);
  startCursor();
}

function handleTouchEnd() {
  stopCursor();
}

function isLeftButton(event) {
  return event.button === 0;
}

function isLeftButtonStillDown(event) {
  return (event.buttons & 1) !== 0;
}

function setCursorPositionFromMouseEvent(event) {
  const point = getGridPointFromClientPoint(event);

  cursor[0] = point.y;
  cursor[1] = point.x;
}

function setCursorPositionFromTouchEvent(event) {
  if (event.touches.length === 0) {
    return;
  }

  const point = getGridPointFromClientPoint(event.touches[0]);

  cursor[0] = point.y;
  cursor[1] = point.x;
}

function getGridPointFromClientPoint(point) {
  const rect = canvas.getBoundingClientRect();

  const canvasX = point.clientX - rect.left;
  const canvasY = point.clientY - rect.top;

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
