import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/PointerLockControls.js';

const SCALE = 8;
const GROUND_SIZE = 500;
const FOREST_SCALE = 7.0;
const TREE_HEIGHT = 4.0;
const TRUNK_WIDTH = 0.6;
const EYE_HEIGHT = 3;

const tetrominos = [
    {"index": 0, "name": "L", "color": "green", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0], [2, 0, 0]]},
    {"index": 1, "name": "N", "color": "magenta", "cubies": [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]]},
    {"index": 2, "name": "T", "color": "red", "cubies": [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0]]},
    {"index": 3, "name": "ΓL", "color": "blue", "cubies": [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0]]},
    {"index": 4, "name": "ΓM", "color": "orange", "cubies": [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]]},
    {"index": 5, "name": "ΓR", "color": "purple", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 1]]},
    {"index": 6, "name": "Γ", "color": "yellow", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0]]}
];

tetrominos.forEach(tetromino => {
    tetromino.material = new THREE.MeshStandardMaterial({
        color: tetromino.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
});

const padding = 0.005;
const cubieGeometry = new THREE.BoxGeometry(1 - padding * 2, 1 - padding * 2, 1 - padding * 2);
const edgesBoxGeometry = new THREE.BoxGeometry(1, 1, 1);

function newBoardGroup(board) {
    const boardGroup = new THREE.Group();
    const offset = 1;

    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            for (let z = 0; z < board[x][y].length; z++) {
                const tetrominoIndex = board[x][y][z];

                if (tetrominoIndex > 0) {
                    const tetrominoData = tetrominos[tetrominoIndex - 1];

                    const cubie = new THREE.Mesh(cubieGeometry, tetrominoData.material);
                    cubie.position.set(x - offset, y - offset, z - offset);

                    const edgesGeometry = new THREE.EdgesGeometry(edgesBoxGeometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    edges.position.copy(cubie.position);

                    boardGroup.add(cubie);
                    boardGroup.add(edges);
                }
            }
        }
    }

    return boardGroup;
}

function newSky() {
    const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 16;
        skyCanvas.height = 512;

        const ctx = skyCanvas.getContext('2d');

        const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            skyCanvas.height
        );

        gradient.addColorStop(0.0, '#1e3f66');
        gradient.addColorStop(0.35, '#5fa9ff');
        gradient.addColorStop(0.7, '#bfe3ff');
        gradient.addColorStop(1.0, '#eaf6ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

        const texture = new THREE.CanvasTexture(skyCanvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;

        const geometry = new THREE.SphereGeometry(900, 32, 16);

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            depthWrite: false
        });

        const sky = new THREE.Mesh(geometry, material);
        sky.position.set(0, 0, 0);

        return sky;
}

function renderSomaCubeForest(positions, solutions, elementId) {
    const container = document.getElementById(elementId);
    container.style.position = 'relative';

    const instructions = document.createElement('div');
    instructions.textContent = 'Click to capture the mouse. Then use WASD or arrow keys to move.';
    instructions.style.position = 'absolute';
    instructions.style.left = '50%';
    instructions.style.top = '25%';
    instructions.style.transform = 'translate(-50%, -50%)';
    instructions.style.padding = '12px 16px';
    instructions.style.background = 'rgba(255, 255, 255, 0.85)';
    instructions.style.border = '1px solid #999';
    instructions.style.font = '32px sans-serif';
    instructions.style.zIndex = '10';
    instructions.style.pointerEvents = 'none';
    container.appendChild(instructions);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(newSky());
    scene.fog = new THREE.Fog(0x87CEEB, 64, 256);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(4, 4, 0);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x808080);
    scene.add(ambientLight);

    const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xEBDDD1,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE / 5, 0x008800, 0x00AA00);
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    grid.position.y = 0.01;
    scene.add(grid);

    const forestGroup = new THREE.Group();
    scene.add(forestGroup);

    const treeColliders = [];
    const PLAYER_RADIUS = 2.0;

    const count = Math.min(positions.length, solutions.length);

    for (let i = 0; i < count; i++) {
        const [px, py] = positions[i];
        const board = solutions[i];

        const boardGroup = newBoardGroup(board);
        const treeHeight = TREE_HEIGHT + (i % 4) / 1.5;

        boardGroup.rotation.y = i * 10;

        const trunkGeometry = new THREE.BoxGeometry(TRUNK_WIDTH, treeHeight + 0.1, TRUNK_WIDTH);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, -treeHeight / 2, 0);
        boardGroup.add(trunk);

        boardGroup.position.set(px * FOREST_SCALE, treeHeight, py * FOREST_SCALE);
        forestGroup.add(boardGroup);

        treeColliders.push(new THREE.Vector3(
            boardGroup.position.x,
            0,
            boardGroup.position.z
        ));
    }

    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    controls.getObject().position.set(0, EYE_HEIGHT, 20);

    container.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
    });

    controls.addEventListener('unlock', () => {
        instructions.style.display = 'block';
    });

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const onKeyDown = (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveRight = true;
                break;
        }
    };

    const onKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    function syncSize() {
        const width = container.clientWidth;
        const height = container.clientHeight || 1;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', syncSize);
    syncSize();

    let prevTime = performance.now();
    const speed = 30;

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        prevTime = time;

        if (controls.isLocked) {
            const player = controls.getObject();

            let moveX = 0;
            let moveZ = 0;

            if (moveForward) {
                moveZ += speed * delta;
            }

            if (moveBackward) {
                moveZ -= speed * delta;
            }

            if (moveLeft) {
                moveX -= speed * delta;
            }

            if (moveRight) {
                moveX += speed * delta;
            }

            if (moveX !== 0) {
                controls.moveRight(moveX);
            }

            if (moveZ !== 0) {
                controls.moveForward(moveZ);
            }

            player.position.y = EYE_HEIGHT;

            for (const tree of treeColliders) {
                const dx = player.position.x - tree.x;
                const dz = player.position.z - tree.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance < PLAYER_RADIUS && distance > 0) {
                    const nx = dx / distance;
                    const nz = dz / distance;
                    const overlap = PLAYER_RADIUS - distance;

                    player.position.x += nx * overlap;
                    player.position.z += nz * overlap;
                }
            }

            player.position.y = EYE_HEIGHT;
        }

        renderer.render(scene, camera);
    }

    animate();
}

export { renderSomaCubeForest };
