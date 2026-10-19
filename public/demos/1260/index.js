'use strict';

// 1260 = 2^2 * 3^2 * 5 * 7. The divisor lattice is C3 x C3 x C2 x C2.
// Includes 1 to complete the Hasse diagram.
//
// Controls:
//   Drag                  - default free 4D orbit
//   Ctrl + drag           - horizontal: XY, vertical: ZW
//   Alt + drag            - horizontal: XZ, vertical: YW
//   Shift + drag          - horizontal: XW, vertical: YZ
//
// If multiple modifiers are held simultaneously, the interaction falls back
// to the default free orbit to avoid ambiguity.
(() => {
  const canvas = document.getElementById('lattice');
  const ctx = canvas.getContext('2d');

  const primes = [2, 3, 5, 7];
  const powers = [2, 2, 1, 1];
  const colors = ['#1687a5', '#8c55d5', '#df823a', '#348f6b'];
  const nodes = [];
  const byNumber = new Map();
  const edges = [];

  for (let a = 0; a <= 2; a++)
    for (let b = 0; b <= 2; b++)
      for (let c = 0; c <= 1; c++)
        for (let d = 0; d <= 1; d++) {
          const exp = [a, b, c, d];
          const n = exp.reduce((v, e, i) => v * primes[i] ** e, 1);
          const node = { n, exp, position: null };
          nodes.push(node);
          byNumber.set(n, node);
        }

  for (const node of nodes) {
    for (let i = 0; i < 4; i++) {
      if (node.exp[i] === 0) continue;
      const target = byNumber.get(node.n / primes[i]);
      if (target) edges.push({ from: node, to: target, factor: primes[i], axis: i });
    }
  }

  // Screen-space 4D -> 2D projection, calibrated to the reference screenshot.
  // Each vector points toward multiplication by the given prime. Thus the
  // visible division arrows point in the opposite direction.
  const basis = [
    [-1.08, -0.99], // 2: division points down and right
    [ 0.08, -0.79], // 3: division points nearly straight down
    [ 0.32, -0.24], // 5: division points down and left
    [-0.69, -0.26]  // 7: division points right and slightly down
  ];

  let rotation = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => Number(i === j)));

  let dragging = false;
  let activePointerId = null;
  let lastX = 0;
  let lastY = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastFrame = null;
  let dragEndedAt = -Infinity;
  const resumeDelay = 2000;
  const rampDuration = 2000;

  // Bounded, oblique 4D orbit. Unlike an accumulating angular velocity,
  // these small, incommensurate oscillations return toward a readable view
  // instead of inevitably drifting into nearly collinear projections.
  // [plane i, plane j, amplitude in radians, angular frequency in rad/s]
  const orbitPlanes = [
    [0, 2,  0.105, 0.20],
    [1, 3, -0.090, 0.16],
    [0, 3,  0.070, 0.13],
    [1, 2,  0.065, 0.23]
  ];
  const orbitPreviousAngles = orbitPlanes.map(() => 0);
  let orbitTime = 0;

  const modifierModes = {
    ctrl:  [[0, 1], [2, 3]], // XY, ZW
    alt:   [[0, 2], [1, 3]], // XZ, YW
    shift: [[0, 3], [1, 2]]  // XW, YZ
  };

  function rotatePlane(i, j, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (let k = 0; k < 4; k++) {
      const ri = rotation[i][k];
      const rj = rotation[j][k];
      rotation[i][k] = c * ri - s * rj;
      rotation[j][k] = s * ri + c * rj;
    }
  }

  function project(exp) {
    const v = exp.map((x, i) => x - powers[i] / 2);
    const r = rotation.map(row => row.reduce((sum, x, j) => sum + x * v[j], 0));
    return [
      r.reduce((sum, x, i) => sum + x * basis[i][0], 0),
      r.reduce((sum, x, i) => sum + x * basis[i][1], 0)
    ];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function drawArrow(a, b, color, label) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    if (length < 0.01) return;

    const ux = dx / length;
    const uy = dy / length;
    const start = [a[0] + ux * 13, a[1] + uy * 13];
    const end = [b[0] - ux * 13, b[1] - uy * 13];

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();

    const size = 7;
    ctx.beginPath();
    ctx.moveTo(...end);
    ctx.lineTo(end[0] - ux * size - uy * 3.5, end[1] - uy * size + ux * 3.5);
    ctx.lineTo(end[0] - ux * size + uy * 3.5, end[1] - uy * size - ux * 3.5);
    ctx.closePath();
    ctx.fill();

    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const offset = 8;
    const lx = mx - uy * offset;
    const ly = my + ux * offset;

    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(String(label)).width;
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.fillRect(lx - tw / 2 - 2, ly - 8, tw + 4, 16);
    ctx.fillStyle = color;
    ctx.fillText(String(label), lx, ly);
  }

  function drawNode(node) {
    const [x, y] = node.position;
    const label = String(node.n);
    ctx.font = '13px system-ui, sans-serif';
    const textWidth = ctx.measureText(label).width;
    const w = textWidth + 12;
    const h = 23;

    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
    ctx.fillStyle = node.n === 1260 ? '#223e67' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = node.n === 1260 ? '#223e67' : '#a6bad1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = node.n === 1260 ? '#ffffff' : '#24364d';
    ctx.fillText(label, x, y + 0.5);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    if (!width || !height) return;

    const projected = nodes.map(n => ({ node: n, xy: project(n.exp) }));
    const xs = projected.map(p => p.xy[0]);
    const ys = projected.map(p => p.xy[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const margin = Math.max(55, Math.min(width, height) * 0.09);
    const scale = Math.min(
      (width - 2 * margin) / Math.max(maxX - minX, 0.1),
      (height - 2 * margin) / Math.max(maxY - minY, 0.1)
    );
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    for (const p of projected) {
      p.node.position = [
        width / 2 + (p.xy[0] - centerX) * scale,
        height / 2 + (p.xy[1] - centerY) * scale
      ];
    }

    for (const edge of edges) {
      drawArrow(edge.from.position, edge.to.position, colors[edge.axis], edge.factor);
    }
    for (const node of nodes) drawNode(node);
  }

  function getActiveModifierMode(event) {
    const active = [];
    if (event.ctrlKey) active.push('ctrl');
    if (event.altKey) active.push('alt');
    if (event.shiftKey) active.push('shift');
    if (active.length !== 1) return null;
    return active[0];
  }

  function applyDefaultOrbitDrag(dx, dy) {
    rotatePlane(0, 2, dx * 0.007);
    rotatePlane(1, 3, dy * 0.007);
    rotatePlane(0, 3, dy * 0.0022);
    rotatePlane(1, 2, dx * 0.0022);
  }

  function applyModifierDrag(mode, dx, dy) {
    const [[hi, hj], [vi, vj]] = modifierModes[mode];
    const speed = 0.007;
    rotatePlane(hi, hj, dx * speed);
    rotatePlane(vi, vj, dy * speed);
  }

  canvas.addEventListener('contextmenu', event => event.preventDefault());

  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    if (dragging) return;
    dragging = true;
    activePointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    dragEndedAt = performance.now(); // stop auto orbit immediately
    // Treat the current angle as the new center of the gentle orbit.
    // This avoids any sudden jump when interacting with the canvas.
    orbitTime = 0;
    orbitPreviousAngles.fill(0);
    canvas.classList.add('dragging');
    canvas.focus();
    event.preventDefault();
    // Deliberately do NOT call setPointerCapture().
  });

  // Listen on window so a drag started in the canvas keeps working when
  // the pointer moves elsewhere on the page. No pointer capture is used.
  window.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== activePointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    const mode = getActiveModifierMode(event);
    if (mode) {
      applyModifierDrag(mode, dx, dy);
    } else {
      applyDefaultOrbitDrag(dx, dy);
    }

    render();
    event.preventDefault();
  });

  function stopDrag(event) {
    if (!dragging) return;
    if (event && 'pointerId' in event && event.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    dragEndedAt = performance.now();
    canvas.classList.remove('dragging');
  }

  function animate(timestamp) {
    if (lastFrame === null) lastFrame = timestamp;
    const dt = Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;

    if (!dragging) {
      const t = Math.max(0, (timestamp - dragEndedAt - resumeDelay) / rampDuration);
      const u = Math.min(1, t);
      const speedFraction = u * u * (3 - 2 * u); // smoothstep
      if (speedFraction > 0) orbitTime += dt;
      // Rotations are applied as angle differences, not accumulated endlessly.
      // The smoothstep factor also ramps the motion up after the idle delay.
      orbitPlanes.forEach(([i, j, amplitude, frequency], index) => {
        const angle = speedFraction * amplitude * Math.sin(orbitTime * frequency);
        rotatePlane(i, j, angle - orbitPreviousAngles[index]);
        orbitPreviousAngles[index] = angle;
      });
    }

    render();
    requestAnimationFrame(animate);
  }

  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  window.addEventListener('blur', stopDrag);
  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(animate);
})();
