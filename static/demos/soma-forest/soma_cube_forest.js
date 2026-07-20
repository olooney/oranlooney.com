import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/PointerLockControls.js';

/* Config */
const SCALE = 8;
const GROUND_SIZE = 500;
const FOREST_SCALE = 7.0;
const TREE_HEIGHT = 4.0;
const TRUNK_WIDTH = 0.6;
const EYE_HEIGHT = 3;
const CROUCH_EYE_HEIGHT = 1.7;
const CROUCH_DURATION = 0.2;
const JUMP_SPEED = 12;
const GRAVITY = 32;
const WALK_SPEED = 15;
const RUN_SPEED = 30;
const PLAYER_RADIUS = 2.0;
const OPACITY_MIN = 0;
const OPACITY_MAX = 1;
const DEBUG_STEP_SECONDS = 1 / 60;
const VECTOR3_COMPONENTS = 3;
const LEFT_MOUSE_BUTTON = 0;
const ANGLE_MIN = 0;
const FULL_CIRCLE = Math.PI * 2;
const TREE_HEIGHT_HALF_DIVISOR = 2;
const BOARD_OFFSET = 1;
const UNIT_CUBE_SIZE = 1;
const CUBIE_PADDING = 0.005;
const PIECE_OPACITY = 0.6;
const EDGE_COLOR = 0x000000;
const CAMERA_FOV = 60;
const CAMERA_INITIAL_ASPECT = 1;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 3000;
const CAMERA_MIN_PITCH = -Math.PI / 2;
const CAMERA_MAX_PITCH = Math.PI / 2;
const PLAYER_START_X = 0;
const PLAYER_START_Z = 20;
const CLOUD_FIELD_CENTER_X = 0;
const CLOUD_FIELD_CENTER_Z = 20;
const FOG_COLOR = 0x87CEEB;
const FOG_NEAR = 64;
const FOG_FAR = 256;
const DIRECTIONAL_LIGHT_COLOR = 0xffffff;
const DIRECTIONAL_LIGHT_INTENSITY = 0.5;
const DIRECTIONAL_LIGHT_POSITION = [4, 4, 0];
const AMBIENT_LIGHT_COLOR = 0x808080;

/* Ground */
const GROUND_COLOR = 0xEBDDD1;
const GROUND_Y = 0;
const GROUND_ROTATION_X = -Math.PI / 2;
const GRID_DIVISION_SIZE = 5;
const GRID_COLOR_CENTER = 0x008800;
const GRID_COLOR = 0x00AA00;
const GRID_OPACITY = 0.5;
const GRID_Y = 0.01;

/* Trees */
const TREE_HEIGHT_VARIATION_COUNT = 4;
const TREE_HEIGHT_VARIATION_SCALE = 1.5;
const BOARD_ROTATION_STEP = 10;
const TARGET_ROTATION_STEP = Math.PI / 12;
const TRUNK_COLOR = 0x8B4513;
const TRUNK_OPACITY = 0.7;
const TRUNK_HEIGHT_PADDING = 0.1;
const TRUNK_CENTER_X = 0;
const TRUNK_CENTER_Z = 0;

/* Explosions */
const EXPLOSION_DISTANCE = 1.5;
const EXPLOSION_TRIGGER_DISTANCE = 30;
const EXPLOSION_SPEED = 0.3;
const EXPLOSION_HANG_TIME = 2.0;
const TARGET_OUTLINE_SIZE = 3.08;
const TARGET_OUTLINE_COLOR = 0xffffff;
const TARGET_OUTLINE_OPACITY = 0.5;
const TARGET_OUTLINE_RENDER_ORDER = 1;

/* SOMAP Mycelium Network */
const SOMAP_MIN_SHARED_PIECES = 4;
const SOMAP_NETWORK_Y = 0.04;
const SOMAP_MIN_OPACITY = -0.1;
const SOMAP_OPACITY_PER_SHARED_PIECE = 0.07;

/* Clouds */
const CLOUD_COUNT = 32;
const CLOUD_FIELD_RADIUS = 1000;
const CLOUD_MIN_HEIGHT = 100;
const CLOUD_MAX_HEIGHT = 150;
const CLOUD_CORE_MIN_CUBES = 2;
const CLOUD_CORE_MAX_CUBES = 4;
const CLOUD_DEPTH = 2;
const CLOUD_SEED = 2;
const CLOUD_SIZE_MULTIPLIERS = [1, 1.5, 2, 3];
const CLOUD_MATERIAL_OPACITIES = [0.38, 0.24, 0.1];
const CLOUD_COLOR = 0xffffff;
const CLOUD_CORE_DEPTH = 0;
const CLOUD_FIRST_LAYER_DEPTH = 1;
const CLOUD_CORE_SIZE_MIN = 16;
const CLOUD_CORE_SIZE_MAX = 26;
const CLOUD_CORE_POSITION_SPREAD = 0.45;
const CLOUD_CORE_MIN_Y_SPREAD = -0.14;
const CLOUD_CORE_MAX_Y_SPREAD = 0.22;
const CLOUD_CORE_MIN_SIZE_SCALE = 0.82;
const CLOUD_CORE_MAX_SIZE_SCALE = 1.15;
const CLOUD_LAYER_ONE_MIN_CUBES = 2;
const CLOUD_LAYER_ONE_MAX_CUBES = 4;
const CLOUD_LAYER_TWO_MIN_CUBES = 1;
const CLOUD_LAYER_TWO_MAX_CUBES = 2;
const CLOUD_LAYER_MIN_DIRECTION = -1;
const CLOUD_LAYER_MAX_DIRECTION = 1;
const CLOUD_LAYER_MIN_Y_DIRECTION = -0.35;
const CLOUD_LAYER_MAX_Y_DIRECTION = 0.35;
const CLOUD_LAYER_MIN_SIZE_SCALE = 0.48;
const CLOUD_LAYER_MAX_SIZE_SCALE = 0.72;
const CLOUD_LAYER_MIN_OFFSET_SCALE = 0.32;
const CLOUD_LAYER_MAX_OFFSET_SCALE = 0.5;
const CLOUD_MIN_Y_SCALE = 0.55;
const CLOUD_MAX_Y_SCALE = 0.8;

/* RNG */
const RANDOM_INCREMENT = 0x6D2B79F5;
const RANDOM_MULTIPLIER_ONE = 1;
const RANDOM_SHIFT_ONE = 15;
const RANDOM_SHIFT_TWO = 7;
const RANDOM_SHIFT_THREE = 14;
const RANDOM_MULTIPLIER_TWO = 61;
const RANDOM_UINT_MAX = 4294967296;

/* Skybox */
const SKY_TEXTURE_WIDTH = 16;
const SKY_TEXTURE_HEIGHT = 512;
const SKY_RADIUS = 900;
const SKY_WIDTH_SEGMENTS = 32;
const SKY_HEIGHT_SEGMENTS = 16;
const SKY_COLOR_STOPS = [
    [0.0, '#1e3f66'],
    [0.35, '#5fa9ff'],
    [0.7, '#bfe3ff'],
    [1.0, '#eaf6ff']
];

/* Help Instructions */
const INSTRUCTION_HTML = `
    <div>
    Welcome to the Soma Cube Forest! Here you will find all 480 possible solutions to the colored Soma puzzle, grouped by similarity.
    The mycelium network underfoot connects solutions that differ in only two or three pieces.</div>
    <ul style="margin: 10px 0 0 0; padding: 0 0 0 22px;">
        <li>Click to capture the mouse</li>
        <li>Esc: release the mouse and show controls</li>
    </ul>
    <p>Controls:</p>
    <ul>
        <li>Mouse: look around</li>
        <li>WASD or arrow keys: move</li>
        <li>Click cube: explode or collapse cube</li>
        <li>Scrollwheel on cube: rotate cube</li>
        <li>Shift: run</li>
        <li>Space: jump</li>
        <li>Hold C: crouch</li>
    </ul>
`;
const INSTRUCTION_LEFT = '50%';
const INSTRUCTION_TOP = '50%';
const INSTRUCTION_PADDING = '12px 16px';
const INSTRUCTION_BACKGROUND = 'rgba(255, 255, 255, 0.85)';
const INSTRUCTION_BORDER = '1px solid #999';
const INSTRUCTION_FONT = '24px sans-serif';
const INSTRUCTION_LINE_HEIGHT = '1.35';
const INSTRUCTION_MAX_WIDTH = '560px';
const INSTRUCTION_Z_INDEX = '10';
const INSTRUCTION_TRANSFORM = 'translate(-50%, -50%)';

/* Tetromino piece shapes */
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
        opacity: PIECE_OPACITY,
        side: THREE.DoubleSide
    });
});

/* Set the scene */
const cubieGeometry = new THREE.BoxGeometry(
    UNIT_CUBE_SIZE - CUBIE_PADDING * 2,
    UNIT_CUBE_SIZE - CUBIE_PADDING * 2,
    UNIT_CUBE_SIZE - CUBIE_PADDING * 2
);
const edgesBoxGeometry = new THREE.BoxGeometry(UNIT_CUBE_SIZE, UNIT_CUBE_SIZE, UNIT_CUBE_SIZE);
const edgesGeometry = new THREE.EdgesGeometry(edgesBoxGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR });
const targetOutlineGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(TARGET_OUTLINE_SIZE, TARGET_OUTLINE_SIZE, TARGET_OUTLINE_SIZE));
const targetOutlineMaterial = new THREE.LineBasicMaterial({
    color: TARGET_OUTLINE_COLOR,
    depthTest: false,
    transparent: true,
    opacity: TARGET_OUTLINE_OPACITY
});
const targetHitboxGeometry = new THREE.BoxGeometry(TARGET_OUTLINE_SIZE, TARGET_OUTLINE_SIZE, TARGET_OUTLINE_SIZE);
const targetHitboxMaterial = new THREE.MeshBasicMaterial({
    color: TARGET_OUTLINE_COLOR,
    transparent: true,
    opacity: OPACITY_MIN,
    depthWrite: false,
    side: THREE.DoubleSide
});
const trunkGeometry = new THREE.BoxGeometry(TRUNK_WIDTH, UNIT_CUBE_SIZE, TRUNK_WIDTH);
const trunkMaterial = new THREE.MeshStandardMaterial({
    color: TRUNK_COLOR,
    transparent: true,
    opacity: TRUNK_OPACITY,
    side: THREE.DoubleSide
});

/**
 * Builds a renderable Soma cube tree crown from a 3D solution board.
 * @param {number[][][]} board
 * @returns {THREE.Group}
 */
function newBoardGroup(board) {
    const boardGroup = new THREE.Group();
    const pieceGroups = new Map();
    const pieces = [];
    const cubies = [];

    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            for (let z = 0; z < board[x][y].length; z++) {
                const tetrominoIndex = board[x][y][z];

                if (tetrominoIndex > 0) {
                    const tetrominoData = tetrominos[tetrominoIndex - 1];
                    let pieceGroup = pieceGroups.get(tetrominoIndex);

                    if (!pieceGroup) {
                        pieceGroup = new THREE.Group();
                        pieceGroup.userData.directionSum = new THREE.Vector3();
                        pieceGroup.userData.cubieCount = 0;
                        pieceGroups.set(tetrominoIndex, pieceGroup);
                        boardGroup.add(pieceGroup);
                    }

                    const cubie = new THREE.Mesh(cubieGeometry, tetrominoData.material);
                    cubie.position.set(x - BOARD_OFFSET, y - BOARD_OFFSET, z - BOARD_OFFSET);
                    cubie.userData.boardGroup = boardGroup;

                    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    edges.position.copy(cubie.position);

                    pieceGroup.userData.directionSum.add(cubie.position);
                    pieceGroup.userData.cubieCount += 1;
                    pieceGroup.add(cubie);
                    pieceGroup.add(edges);
                    cubies.push(cubie);
                }
            }
        }
    }

    for (const pieceGroup of pieceGroups.values()) {
        const direction = pieceGroup.userData.directionSum
            .clone()
            .divideScalar(pieceGroup.userData.cubieCount);

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        pieces.push({ group: pieceGroup, direction });
    }

    boardGroup.userData.pieces = pieces;
    boardGroup.userData.cubies = cubies;
    boardGroup.userData.explosion = {
        phase: 'idle',
        elapsed: 0,
        progress: 0
    };

    const targetOutline = new THREE.LineSegments(targetOutlineGeometry, targetOutlineMaterial);
    targetOutline.visible = false;
    targetOutline.renderOrder = TARGET_OUTLINE_RENDER_ORDER;
    boardGroup.add(targetOutline);
    boardGroup.userData.targetOutline = targetOutline;

    const targetHitbox = new THREE.Mesh(targetHitboxGeometry, targetHitboxMaterial);
    targetHitbox.userData.boardGroup = boardGroup;
    boardGroup.add(targetHitbox);
    boardGroup.userData.targetHitbox = targetHitbox;

    return boardGroup;
}

/**
 * Converts each colored piece in a solution into a canonical cubie-position signature.
 * @param {number[][][]} solution
 * @returns {string[]}
 */
function getPiecePositionSignatures(solution) {
    const piecePositions = tetrominos.map(() => []);

    for (let x = 0; x < solution.length; x++) {
        for (let y = 0; y < solution[x].length; y++) {
            for (let z = 0; z < solution[x][y].length; z++) {
                const tetrominoIndex = solution[x][y][z];

                if (tetrominoIndex > 0) {
                    piecePositions[tetrominoIndex - 1].push(`${x},${y},${z}`);
                }
            }
        }
    }

    return piecePositions.map(positions => positions.sort().join('|'));
}

/**
 * Counts matching piece-position signatures between two indexed solutions.
 * @param {string[][]} pieceSignatures
 * @param {number} i
 * @param {number} j
 * @returns {number}
 */
function countSharedPieceSignatures(pieceSignatures, i, j) {
    let sharedPieces = 0;

    for (let pieceIndex = 0; pieceIndex < tetrominos.length; pieceIndex++) {
        if (pieceSignatures[i][pieceIndex] === pieceSignatures[j][pieceIndex]) {
            sharedPieces += 1;
        }
    }

    return sharedPieces;
}

/**
 * Counts how many colored pieces occupy identical cubies in two solutions.
 * @param {number[][][][]} solutions
 * @param {number} i
 * @param {number} j
 * @returns {number}
 */
function countSharedPieces(solutions, i, j) {
    return countSharedPieceSignatures([
        getPiecePositionSignatures(solutions[i]),
        getPiecePositionSignatures(solutions[j])
    ], 0, 1);
}

/**
 * Computes the line opacity for a SOMAP edge with the given shared-piece count.
 * @param {number} sharedPieces
 * @returns {number}
 */
function getSomapOpacity(sharedPieces) {
    return Math.min(OPACITY_MAX, SOMAP_MIN_OPACITY + SOMAP_OPACITY_PER_SHARED_PIECE * sharedPieces);
}

/**
 * Builds the ground-level SOMAP network from shared piece positions.
 * @param {number[][]} positions
 * @param {number[][][][]} solutions
 * @param {number} count
 * @returns {THREE.Group}
 */
function newSomapNetwork(positions, solutions, count) {
    const pieceSignatures = solutions.slice(0, count).map(getPiecePositionSignatures);
    const edgePointsBySharedPieces = new Map();

    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            const sharedPieces = countSharedPieceSignatures(pieceSignatures, i, j);

            if (sharedPieces >= SOMAP_MIN_SHARED_PIECES) {
                if (!edgePointsBySharedPieces.has(sharedPieces)) {
                    edgePointsBySharedPieces.set(sharedPieces, []);
                }

                const [fromX, fromZ] = positions[i];
                const [toX, toZ] = positions[j];

                edgePointsBySharedPieces.get(sharedPieces).push(
                    fromX * FOREST_SCALE, SOMAP_NETWORK_Y, fromZ * FOREST_SCALE,
                    toX * FOREST_SCALE, SOMAP_NETWORK_Y, toZ * FOREST_SCALE
                );
            }
        }
    }

    const networkGroup = new THREE.Group();

    for (const [sharedPieces, edgePoints] of edgePointsBySharedPieces) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePoints, VECTOR3_COMPONENTS));

        const material = new THREE.LineBasicMaterial({
            color: TRUNK_COLOR,
            transparent: true,
            opacity: getSomapOpacity(sharedPieces),
            depthWrite: false
        });

        networkGroup.add(new THREE.LineSegments(geometry, material));
    }

    return networkGroup;
}

/**
 * Builds the gradient sky sphere enclosing the forest.
 * @returns {THREE.Mesh}
 */
function newSky() {
    const skyCanvas = document.createElement('canvas');
        skyCanvas.width = SKY_TEXTURE_WIDTH;
        skyCanvas.height = SKY_TEXTURE_HEIGHT;

        const ctx = skyCanvas.getContext('2d');

        const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            skyCanvas.height
        );

        for (const [offset, color] of SKY_COLOR_STOPS) {
            gradient.addColorStop(offset, color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

        const texture = new THREE.CanvasTexture(skyCanvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;

        const geometry = new THREE.SphereGeometry(SKY_RADIUS, SKY_WIDTH_SEGMENTS, SKY_HEIGHT_SEGMENTS);

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            depthWrite: false
        });

        const sky = new THREE.Mesh(geometry, material);
        sky.position.set(0, 0, 0);

        return sky;
}

    /**
     * Creates a deterministic pseudo-random number generator from a seed.
     * @param {number} seed
     * @returns {() => number}
     */
function newRandom(seed) {
    let state = seed;

    return () => {
        state += RANDOM_INCREMENT;
        let value = state;
        value = Math.imul(value ^ value >>> RANDOM_SHIFT_ONE, value | RANDOM_MULTIPLIER_ONE);
        value ^= value + Math.imul(value ^ value >>> RANDOM_SHIFT_TWO, value | RANDOM_MULTIPLIER_TWO);

        return ((value ^ value >>> RANDOM_SHIFT_THREE) >>> 0) / RANDOM_UINT_MAX;
    };
}

/**
 * Samples a random floating-point number in the given range.
 * @param {() => number} random
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomBetween(random, min, max) {
    return min + random() * (max - min);
}

/**
 * Samples a random integer in the inclusive range.
 * @param {() => number} random
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(random, min, max) {
    return Math.floor(randomBetween(random, min, max + 1));
}

/**
 * Creates an unlit white cloud material with the given opacity.
 * @param {number} opacity
 * @returns {THREE.MeshBasicMaterial}
 */
function newCloudMaterial(opacity) {
    return new THREE.MeshBasicMaterial({
        color: CLOUD_COLOR,
        transparent: opacity < OPACITY_MAX,
        opacity,
        depthWrite: false,
        fog: false,
        side: THREE.DoubleSide
    });
}

/**
 * Builds the seeded field of blocky clouds around the given center.
 * @param {number} centerX
 * @param {number} centerZ
 * @returns {THREE.Group}
 */
function newCloudField(centerX, centerZ) {
    const random = newRandom(CLOUD_SEED);
    const cloudGroup = new THREE.Group();
    const cloudGeometry = new THREE.BoxGeometry(UNIT_CUBE_SIZE, UNIT_CUBE_SIZE, UNIT_CUBE_SIZE);
    const cloudMaterials = CLOUD_MATERIAL_OPACITIES.map(newCloudMaterial);

    /**
     * Adds one cube to a cloud layer.
     * @param {THREE.Group} parent
     * @param {THREE.Vector3} position
     * @param {number} size
     * @param {number} depth
     * @returns {{ position: THREE.Vector3, size: number, depth: number }}
     */
    function addCloudCube(parent, position, size, depth) {
        const cube = new THREE.Mesh(cloudGeometry, cloudMaterials[depth]);
        cube.position.copy(position);
        cube.scale.set(size, size * randomBetween(random, CLOUD_MIN_Y_SCALE, CLOUD_MAX_Y_SCALE), size);
        parent.add(cube);

        return { position, size, depth };
    }

    /**
     * Adds one outward layer of smaller cubes around existing cloud cubes.
     * @param {THREE.Group} parent
     * @param {{ position: THREE.Vector3, size: number, depth: number }[]} sourceCubes
     * @param {number} depth
     * @returns {{ position: THREE.Vector3, size: number, depth: number }[]}
     */
    function addCloudLayer(parent, sourceCubes, depth) {
        const nextCubes = [];

        for (const sourceCube of sourceCubes) {
            const childCount = depth === CLOUD_FIRST_LAYER_DEPTH
                ? randomInt(random, CLOUD_LAYER_ONE_MIN_CUBES, CLOUD_LAYER_ONE_MAX_CUBES)
                : randomInt(random, CLOUD_LAYER_TWO_MIN_CUBES, CLOUD_LAYER_TWO_MAX_CUBES);

            for (let i = 0; i < childCount; i++) {
                const direction = new THREE.Vector3(
                    randomBetween(random, CLOUD_LAYER_MIN_DIRECTION, CLOUD_LAYER_MAX_DIRECTION),
                    randomBetween(random, CLOUD_LAYER_MIN_Y_DIRECTION, CLOUD_LAYER_MAX_Y_DIRECTION),
                    randomBetween(random, CLOUD_LAYER_MIN_DIRECTION, CLOUD_LAYER_MAX_DIRECTION)
                );

                if (direction.lengthSq() === 0) {
                    direction.set(UNIT_CUBE_SIZE, GROUND_Y, GROUND_Y);
                }

                const size = sourceCube.size * randomBetween(random, CLOUD_LAYER_MIN_SIZE_SCALE, CLOUD_LAYER_MAX_SIZE_SCALE);
                const offset = direction.multiplyScalar((sourceCube.size + size) * randomBetween(random, CLOUD_LAYER_MIN_OFFSET_SCALE, CLOUD_LAYER_MAX_OFFSET_SCALE));
                const position = sourceCube.position.clone().add(offset);

                nextCubes.push(addCloudCube(parent, position, size, depth));
            }
        }

        return nextCubes;
    }

    for (let cloudIndex = 0; cloudIndex < CLOUD_COUNT; cloudIndex++) {
        const angle = randomBetween(random, ANGLE_MIN, FULL_CIRCLE);
        const radius = CLOUD_FIELD_RADIUS * Math.sqrt(random());
        const cloud = new THREE.Group();
        const coreCubes = [];
        const coreCount = randomInt(random, CLOUD_CORE_MIN_CUBES, CLOUD_CORE_MAX_CUBES);
        const coreSize = randomBetween(random, CLOUD_CORE_SIZE_MIN, CLOUD_CORE_SIZE_MAX);

        cloud.position.set(
            centerX + Math.cos(angle) * radius,
            randomBetween(random, CLOUD_MIN_HEIGHT, CLOUD_MAX_HEIGHT),
            centerZ + Math.sin(angle) * radius
        );

        for (let i = 0; i < coreCount; i++) {
            const position = new THREE.Vector3(
                randomBetween(random, -coreSize * CLOUD_CORE_POSITION_SPREAD, coreSize * CLOUD_CORE_POSITION_SPREAD),
                randomBetween(random, coreSize * CLOUD_CORE_MIN_Y_SPREAD, coreSize * CLOUD_CORE_MAX_Y_SPREAD),
                randomBetween(random, -coreSize * CLOUD_CORE_POSITION_SPREAD, coreSize * CLOUD_CORE_POSITION_SPREAD)
            );
            const size = coreSize * randomBetween(random, CLOUD_CORE_MIN_SIZE_SCALE, CLOUD_CORE_MAX_SIZE_SCALE);

            coreCubes.push(addCloudCube(cloud, position, size, CLOUD_CORE_DEPTH));
        }

        let layerCubes = coreCubes;

        for (let depth = CLOUD_FIRST_LAYER_DEPTH; depth <= CLOUD_DEPTH; depth++) {
            layerCubes = addCloudLayer(cloud, layerCubes, depth);
        }

        const sizeMultiplier = CLOUD_SIZE_MULTIPLIERS[randomInt(random, 0, CLOUD_SIZE_MULTIPLIERS.length - 1)];
        cloud.scale.setScalar(sizeMultiplier);
        cloudGroup.add(cloud);
    }

    return cloudGroup;
}

/**
 * Renders an interactive first-person Soma cube forest into a container element.
 * @param {number[][]} positions
 * @param {number[][][][]} solutions
 * @param {string} elementId
 * @returns {void}
 */
function renderSomaCubeForest(positions, solutions, elementId) {
    const container = document.getElementById(elementId);
    container.style.position = 'relative';

    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.left = INSTRUCTION_LEFT;
    instructions.style.top = INSTRUCTION_TOP;
    instructions.style.transform = INSTRUCTION_TRANSFORM;
    instructions.style.padding = INSTRUCTION_PADDING;
    instructions.style.background = INSTRUCTION_BACKGROUND;
    instructions.style.border = INSTRUCTION_BORDER;
    instructions.style.font = INSTRUCTION_FONT;
    instructions.style.lineHeight = INSTRUCTION_LINE_HEIGHT;
    instructions.style.maxWidth = INSTRUCTION_MAX_WIDTH;
    instructions.style.zIndex = INSTRUCTION_Z_INDEX;
    instructions.style.pointerEvents = 'none';
    instructions.innerHTML = INSTRUCTION_HTML;
    container.appendChild(instructions);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_INITIAL_ASPECT, CAMERA_NEAR, CAMERA_FAR);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(newSky());
    scene.add(newCloudField(CLOUD_FIELD_CENTER_X, CLOUD_FIELD_CENTER_Z));
    scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

    const directionalLight = new THREE.DirectionalLight(DIRECTIONAL_LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY);
    directionalLight.position.set(...DIRECTIONAL_LIGHT_POSITION);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR);
    scene.add(ambientLight);

    const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: GROUND_COLOR,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = GROUND_ROTATION_X;
    ground.position.y = GROUND_Y;
    scene.add(ground);

    const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE / GRID_DIVISION_SIZE, GRID_COLOR_CENTER, GRID_COLOR);
    grid.material.opacity = GRID_OPACITY;
    grid.material.transparent = true;
    grid.position.y = GRID_Y;
    scene.add(grid);

    const forestGroup = new THREE.Group();
    scene.add(forestGroup);

    const treeColliders = [];
    const explodableCubes = [];
    const explodableCubies = [];

    const count = Math.min(positions.length, solutions.length);
    scene.add(newSomapNetwork(positions, solutions, count));

    for (let i = 0; i < count; i++) {
        const [px, py] = positions[i];
        const board = solutions[i];

        const boardGroup = newBoardGroup(board);
        const treeHeight = TREE_HEIGHT + (i % TREE_HEIGHT_VARIATION_COUNT) / TREE_HEIGHT_VARIATION_SCALE;

        explodableCubes.push(boardGroup);
        explodableCubies.push(...boardGroup.userData.cubies);

        boardGroup.rotation.y = i * BOARD_ROTATION_STEP;

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.scale.y = treeHeight + TRUNK_HEIGHT_PADDING;
        trunk.position.set(TRUNK_CENTER_X, -treeHeight / TREE_HEIGHT_HALF_DIVISOR, TRUNK_CENTER_Z);
        boardGroup.add(trunk);

        boardGroup.position.set(px * FOREST_SCALE, treeHeight, py * FOREST_SCALE);
        forestGroup.add(boardGroup);

        treeColliders.push(new THREE.Vector3(
            boardGroup.position.x,
            GROUND_Y,
            boardGroup.position.z
        ));
    }

    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    const raycaster = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    controls.getObject().position.set(PLAYER_START_X, EYE_HEIGHT, PLAYER_START_Z);

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
    let isRunning = false;
    let isCrouching = false;
    let isGrounded = true;
    let currentEyeHeight = EYE_HEIGHT;
    let jumpOffset = 0;
    let verticalVelocity = 0;
    let targetedCube = null;
    let debugControlsEnabled = false;
    let debugExplosionsFrozen = false;

    /**
     * Updates movement state when a keyboard control is pressed.
     * @param {KeyboardEvent} event
     * @returns {void}
     */
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
            case 'Space':
                if (!event.repeat) {
                    jump();
                }
                break;
            case 'KeyC':
                isCrouching = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                isRunning = true;
                break;
        }
    };

    /**
     * Updates movement state when a keyboard control is released.
     * @param {KeyboardEvent} event
     * @returns {void}
     */
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
            case 'KeyC':
                isCrouching = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                isRunning = false;
                break;
        }
    };

    /**
     * Starts the normal exploded-view animation for a cube.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function triggerExplosion(boardGroup) {
        const explosion = boardGroup.userData.explosion;

        explosion.phase = 'out';
        explosion.elapsed = 0;
        explosion.isCollapsingByClick = false;
        boardGroup.userData.targetOutline.visible = false;

        if (targetedCube === boardGroup) {
            targetedCube = null;
        }
    }

    /**
     * Starts the collapse animation for an already exploded cube.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function collapseExplosion(boardGroup) {
        const explosion = boardGroup.userData.explosion;

        explosion.phase = 'in';
        explosion.elapsed = 0;
        explosion.isCollapsingByClick = true;
        boardGroup.userData.targetOutline.visible = false;

        if (targetedCube === boardGroup) {
            targetedCube = null;
        }
    }

    /**
     * Explodes an idle cube or collapses a cube that is already exploding.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function toggleExplosion(boardGroup) {
        if (boardGroup.userData.explosion.phase === 'idle') {
            triggerExplosion(boardGroup);
        } else {
            collapseExplosion(boardGroup);
        }
    }

    /**
     * Holds a cube at full explosion for browser-driven inspection.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function holdExplosion(boardGroup) {
        const explosion = boardGroup.userData.explosion;

        debugExplosionsFrozen = true;
        explosion.phase = 'hang';
        explosion.elapsed = 0;
        explosion.progress = 1;
        explosion.isCollapsingByClick = false;
        boardGroup.userData.targetOutline.visible = false;

        if (targetedCube === boardGroup) {
            targetedCube = null;
        }

        applyExplosion(boardGroup);
    }

    /**
    * Explodes or collapses the currently targeted cube on left mouse click.
     * @param {MouseEvent} event
     * @returns {void}
     */
    const onMouseDown = (event) => {
        if (event.button !== LEFT_MOUSE_BUTTON || !controls.isLocked) {
            return;
        }

        const target = getTargetedCube({ includeDistance: true });

        if (target && target.distance <= EXPLOSION_TRIGGER_DISTANCE) {
            toggleExplosion(target.boardGroup);
        }
    };

    /**
     * Rotates the currently targeted cube when the mouse wheel is scrolled.
     * @param {WheelEvent} event
     * @returns {void}
     */
    const onWheel = (event) => {
        if (!controls.isLocked) {
            return;
        }

        const target = getTargetedCube({ includeDistance: true });

        if (!target || target.distance > EXPLOSION_TRIGGER_DISTANCE) {
            return;
        }

        event.preventDefault();
        target.boardGroup.rotation.y += Math.sign(event.deltaY) * TARGET_ROTATION_STEP;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('wheel', onWheel, { passive: false });

    /**
     * Starts a jump when the player is grounded.
     * @returns {void}
     */
    function jump() {
        if (isGrounded) {
            verticalVelocity = JUMP_SPEED;
            isGrounded = false;
        }
    }

    /**
     * Applies the current explosion progress to each colored piece group.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function applyExplosion(boardGroup) {
        const explosion = boardGroup.userData.explosion;

        for (const piece of boardGroup.userData.pieces) {
            piece.group.position.copy(piece.direction).multiplyScalar(EXPLOSION_DISTANCE * explosion.progress);
        }
    }

    /**
     * Advances one cube's explosion animation state.
     * @param {THREE.Group} boardGroup
     * @param {number} delta
     * @returns {void}
     */
    function updateExplosion(boardGroup, delta) {
        const explosion = boardGroup.userData.explosion;

        switch (explosion.phase) {
            case 'out':
                explosion.isCollapsingByClick = false;
                explosion.progress = Math.min(1, explosion.progress + delta / EXPLOSION_SPEED);

                if (explosion.progress >= 1) {
                    explosion.phase = 'hang';
                    explosion.elapsed = 0;
                }
                break;
            case 'hang':
                explosion.isCollapsingByClick = false;
                explosion.elapsed += delta;

                if (explosion.elapsed >= EXPLOSION_HANG_TIME) {
                    explosion.phase = 'in';
                    explosion.elapsed = 0;
                }
                break;
            case 'in':
                explosion.progress = Math.max(0, explosion.progress - delta / EXPLOSION_SPEED);

                if (explosion.progress <= 0) {
                    explosion.phase = 'idle';
                    explosion.elapsed = 0;
                    explosion.isCollapsingByClick = false;
                }
                break;
        }

        applyExplosion(boardGroup);
    }

    /**
     * Keeps an inspected exploded cube open while it is targeted.
     * @param {THREE.Group} boardGroup
     * @returns {void}
     */
    function refreshInspectedExplosion(boardGroup) {
        const explosion = boardGroup.userData.explosion;

        if (explosion.phase === 'hang') {
            explosion.elapsed = 0;
        }
    }

    /**
     * Finds the closest cube under the center-screen reticle.
     * @param {{ includeDistance?: boolean }} [options]
     * @returns {THREE.Group | { boardGroup: THREE.Group, distance: number } | null}
     */
    function getTargetedCube(options = {}) {
        raycaster.setFromCamera(screenCenter, camera);

        const activeHitboxes = explodableCubes
            .filter(boardGroup => boardGroup.userData.explosion.phase !== 'idle')
            .map(boardGroup => boardGroup.userData.targetHitbox);
        const hitboxIntersections = raycaster.intersectObjects(activeHitboxes, false);
        const intersections = hitboxIntersections.length > 0
            ? hitboxIntersections
            : raycaster.intersectObjects(explodableCubies, false);

        if (intersections.length === 0) {
            return null;
        }

        const intersection = intersections[0];
        const boardGroup = intersection.object.userData.boardGroup;

        if (options.includeDistance) {
            return { boardGroup, distance: intersection.distance };
        }

        return boardGroup;
    }

    /**
     * Updates target outline visibility and inspected explosion hold state.
     * @returns {void}
     */
    function updateTargetedCube() {
        const target = controls.isLocked || debugControlsEnabled ? getTargetedCube({ includeDistance: true }) : null;

        if (target?.distance <= EXPLOSION_TRIGGER_DISTANCE) {
            refreshInspectedExplosion(target.boardGroup);
        }

        const nextTargetedCube = target?.distance <= EXPLOSION_TRIGGER_DISTANCE
            && target.boardGroup.userData.explosion.phase === 'idle'
            ? target.boardGroup
            : null;

        if (nextTargetedCube === targetedCube) {
            return;
        }

        if (targetedCube) {
            targetedCube.userData.targetOutline.visible = false;
        }

        targetedCube = nextTargetedCube;

        if (targetedCube) {
            targetedCube.userData.targetOutline.visible = true;
        }
    }

    /**
     * Advances player movement, crouch, jump, and tree collision state.
     * @param {number} delta
     * @returns {void}
     */
    function movePlayer(delta) {
        const player = controls.getObject();
        const speed = isRunning ? RUN_SPEED : WALK_SPEED;

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

        const targetEyeHeight = isCrouching ? CROUCH_EYE_HEIGHT : EYE_HEIGHT;
        const crouchStep = (EYE_HEIGHT - CROUCH_EYE_HEIGHT) * delta / CROUCH_DURATION;
        const eyeHeightDelta = targetEyeHeight - currentEyeHeight;
        currentEyeHeight += Math.sign(eyeHeightDelta) * Math.min(Math.abs(eyeHeightDelta), crouchStep);

        if (!isGrounded || verticalVelocity > 0) {
            verticalVelocity -= GRAVITY * delta;
            jumpOffset += verticalVelocity * delta;

            if (jumpOffset <= 0) {
                jumpOffset = 0;
                verticalVelocity = 0;
                isGrounded = true;
            }
        }

        player.position.y = currentEyeHeight + jumpOffset;

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

        player.position.y = currentEyeHeight + jumpOffset;
    }

    window.somaForestDebug = {
        /**
         * Enables pointer-lock-free debug controls.
         * @returns {void}
         */
        enable() {
            debugControlsEnabled = true;
            instructions.style.display = 'none';
        },
        /**
         * Disables pointer-lock-free debug controls.
         * @returns {void}
         */
        disable() {
            debugControlsEnabled = false;
            instructions.style.display = controls.isLocked ? 'none' : 'block';
        },
        /**
         * Freezes explosion animation updates.
         * @returns {void}
         */
        freezeExplosions() {
            debugExplosionsFrozen = true;
        },
        /**
         * Resumes explosion animation updates.
         * @returns {void}
         */
        resumeExplosions() {
            debugExplosionsFrozen = false;
        },
        /**
         * Rotates the debug camera by yaw and pitch deltas.
         * @param {number} [yaw]
         * @param {number} [pitch]
         * @returns {void}
         */
        look(yaw = 0, pitch = 0) {
            const player = controls.getObject();

            player.rotation.y += yaw;
            camera.rotation.x = Math.max(CAMERA_MIN_PITCH, Math.min(CAMERA_MAX_PITCH, camera.rotation.x + pitch));
        },
        /**
         * Sets debug movement button state.
         * @param {{ forward?: boolean, backward?: boolean, left?: boolean, right?: boolean, running?: boolean, crouching?: boolean }} [movement]
         * @returns {void}
         */
        setMovement(movement = {}) {
            moveForward = Boolean(movement.forward);
            moveBackward = Boolean(movement.backward);
            moveLeft = Boolean(movement.left);
            moveRight = Boolean(movement.right);
            isRunning = Boolean(movement.running);
            isCrouching = Boolean(movement.crouching);
        },
        /**
         * Advances the simulation by a fixed debug timestep.
         * @param {number} [seconds]
         * @returns {void}
         */
        step(seconds = DEBUG_STEP_SECONDS) {
            movePlayer(seconds);

            if (!debugExplosionsFrozen) {
                for (const boardGroup of explodableCubes) {
                    updateExplosion(boardGroup, seconds);
                }
            }

            updateTargetedCube();
            renderer.render(scene, camera);
        },
        jump,
        /**
         * Explodes or collapses the current debug target, optionally holding it open.
         * @param {{ hold?: boolean }} [options]
         * @returns {boolean}
         */
        explodeTarget(options = {}) {
            const target = getTargetedCube({ includeDistance: true });

            if (target && target.distance <= EXPLOSION_TRIGGER_DISTANCE) {
                if (options.hold) {
                    holdExplosion(target.boardGroup);
                } else {
                    toggleExplosion(target.boardGroup);
                }

                return true;
            }

            return false;
        },
        /**
         * Returns current debug camera, movement, and target state.
         * @returns {{ position: number[], yaw: number, pitch: number, isGrounded: boolean, isCrouching: boolean, isRunning: boolean, debugExplosionsFrozen: boolean, targetDistance: number | null, hasTarget: boolean }}
         */
        getState() {
            const player = controls.getObject();
            const target = getTargetedCube({ includeDistance: true });

            return {
                position: player.position.toArray(),
                yaw: player.rotation.y,
                pitch: camera.rotation.x,
                isGrounded,
                isCrouching,
                isRunning,
                debugExplosionsFrozen,
                targetDistance: target?.distance ?? null,
                hasTarget: Boolean(target)
            };
        }
    };

    /**
     * Synchronizes renderer and camera dimensions with the container.
     * @returns {void}
     */
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

    /**
     * Runs one animation frame for movement, explosions, targeting, and rendering.
     * @returns {void}
     */
    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        prevTime = time;

        if (controls.isLocked || debugControlsEnabled) {
            movePlayer(delta);
        }

        if (!debugExplosionsFrozen) {
            for (const boardGroup of explodableCubes) {
                updateExplosion(boardGroup, delta);
            }
        }

        updateTargetedCube();

        renderer.render(scene, camera);
    }

    animate();
}

export { countSharedPieces, renderSomaCubeForest };
