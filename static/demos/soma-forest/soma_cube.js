import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';


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
        opacity: 0.5,
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

    boardGroup.rotation.z = Math.PI/3;
    boardGroup.rotation.x -= 1;

    return boardGroup;
}

function renderTetrominoBoard(board, elementId) { 
    // boilerplate setup
    var container = document.getElementById(elementId);
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(container.innerWidth, container.innerHeight);
    container.appendChild(renderer.domElement);

    // camera
    const aspectRatio = container.innerWidth/container.innerHeight;
    var camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);
    camera.position.z = 6.5; 

    // adapt to fill the outside container
    function syncSize() {
        var width = container.offsetWidth;
        var height = container.offsetHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', syncSize);
    syncSize();


    // scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // main model
    let boardGroup = newBoardGroup(board);
    scene.add(boardGroup);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.55);
    directionalLight.position.set(-4, 4, 0);
    scene.add(directionalLight);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x808080); // soft white light
    scene.add(ambientLight);

    // poor man's orbit controls
    var mouseIsDown = false;
    function onMouseMove(event) {
        if ( mouseIsDown ) { 
            boardGroup.rotation.z += event.movementX * 0.005;
            boardGroup.rotation.x += event.movementY * 0.005;
        }
    }
    document.documentElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', function(event) { 
        mouseIsDown = true; 
        document.body.classList.add('no-select');
    })
    window.addEventListener('mouseup', function(event) { 
        mouseIsDown = false; 
        document.body.classList.remove('no-select');
    })


    function animate() {
        requestAnimationFrame(animate);
        if ( !mouseIsDown ) {
            boardGroup.rotation.z += 0.001;
        }
        renderer.render(scene, camera);
    }

    animate();

    function update(board) {
        const oldBoardGroup = boardGroup;
        boardGroup = newBoardGroup(board);
        boardGroup.rotation.copy(oldBoardGroup.rotation);
        scene.remove(oldBoardGroup);
        scene.add(boardGroup);
    }
    return update;
} 

export { renderTetrominoBoard };
