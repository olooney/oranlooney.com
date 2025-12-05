import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/PointerLockControls.js';

const SCALE = 8;
const GROUND_SIZE = 1000;
const FOREST_SCALE = 10.0;
const TREE_HEIGHT = 5.0;
const TRUNK_WIDTH = 0.6;
const EYE_HEIGHT = 3;

const tetrominos = [
    {"index": 0, "name": "L", "color": "green", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0], [2, 0, 0]]},
    {"index": 1, "name": "N", "color": "magenta", "cubies": [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]]},
    {"index": 2, "name": "T", "color": "red", "cubies": [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0]]},
    {"index": 3, "name": "\u0393L", "color": "blue", "cubies": [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0]]},
    {"index": 4, "name": "\u0393M", "color": "orange", "cubies": [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]]},
    {"index": 5, "name": "\u0393R", "color": "purple", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 1]]},
    {"index": 6, "name": "\u0393", "color": "yellow", "cubies": [[0, 0, 0], [0, 1, 0], [1, 0, 0]]}
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
const cubieGeometry = new THREE.BoxGeometry(1 - padding*2, 1 - padding*2, 1 - padding*2);
const edgesBoxGeometry = new THREE.BoxGeometry(1, 1, 1);

function newBoardGroup(board) {
    const boardGroup = new THREE.Group();
    const offset = 1; // center the cube

    for ( let x = 0; x < board.length; x++ ) {
        for ( let y = 0; y < board[x].length; y++ ) {
            for ( let z = 0; z < board[x][y].length; z++ ) {
                const tetrominoIndex = board[x][y][z];
                if ( tetrominoIndex > 0 ) {
                    // solid cubie mesh
                    const tetrominoData = tetrominos[tetrominoIndex - 1];
                    const cubie = new THREE.Mesh(cubieGeometry, tetrominoData.material);
                    cubie.position.set(x - offset, y - offset, z - offset);

                    // edges
                    const edgesGeometry = new THREE.EdgesGeometry(edgesBoxGeometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    
                    // Position the edges with the cubie
                    edges.position.copy(cubie.position);

                    boardGroup.add(cubie);
                    boardGroup.add(edges);
                }
            }
        }
    }

    // boardGroup.rotation.z = Math.PI/3;
    // boardGroup.rotation.x -= 1;

    return boardGroup;
}


function renderTetrominoForest(positions, solutions, elementId) {
    const container = document.getElementById(elementId);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(4, 4, 0);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x808080);
    scene.add(ambientLight);

    // Ground plane + grid (optional but helpful)
    const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE/5, 0x008800, 0x00AA00);
    grid.position.y = +0.01;
    scene.add(grid);

    // Forest of boards
    const forestGroup = new THREE.Group();
    scene.add(forestGroup);

    const fixedHeight = 4;
    const count = Math.min(positions.length, solutions.length);

    for (let i = 0; i < count; i++) {
        const [px, py] = positions[i];
        const board = solutions[i];

        const boardGroup = newBoardGroup(board);
        const treeHeight = TREE_HEIGHT + (i % 5)/2.0;

        // tree trunk 
        const trunkGeometry = new THREE.BoxGeometry(TRUNK_WIDTH, treeHeight, TRUNK_WIDTH);
        const trunkMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,   // brown
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        trunk.position.set(0, -treeHeight / 2, 0);
        boardGroup.add(trunk);


        boardGroup.position.set(px * FOREST_SCALE, treeHeight, py * FOREST_SCALE);
        forestGroup.add(boardGroup);
    }

    // Pointer lock controls (mouse-look FPS)
    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    // Initial position
    controls.getObject().position.set(0, EYE_HEIGHT, 20);

    // Click anywhere on the container to lock the pointer
    container.addEventListener('click', () => {
        controls.lock();
    });

    // Movement state
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

    // Resize handling
    function syncSize() {
        const width = container.clientWidth;
        const height = container.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', syncSize);
    syncSize();

    // Animation loop with constant-speed XZ movement
    let prevTime = performance.now();
    const speed = 30; // units per second

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        prevTime = time;

        if (controls.isLocked) {
            let moveX = 0;
            let moveZ = 0;

            if (moveForward)  moveZ += speed * delta;
            if (moveBackward) moveZ -= speed * delta;
            if (moveLeft)     moveX -= speed * delta;
            if (moveRight)    moveX += speed * delta;

            if (moveX !== 0) controls.moveRight(moveX);
            if (moveZ !== 0) controls.moveForward(moveZ);

            // keep movement on XZ plane
            controls.getObject().position.y = EYE_HEIGHT;
        }

        renderer.render(scene, camera);
    }

    animate();
}

export { renderTetrominoForest };
