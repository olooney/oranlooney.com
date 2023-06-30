import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';

function makePlayfairCanvas(cipher, size) {
    // Create a 512x512 canvas and get the 2D context
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    //document.body.appendChild(canvas);
    var context = canvas.getContext('2d');

    // Set the background color
    context.fillStyle = '#dddddd';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set the font and color for the text
    var fontSize = Math.round(0.1171875 * size);
    context.font = fontSize + 'px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';

    // Set the color for the grid
    var gridColor = '#000000';

    // Calculate the size of each cell
    var cellSize = canvas.width / 5;

    // Draw the grid and the text
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            // Draw the grid
            context.strokeStyle = gridColor;
            context.lineWidth = Math.max(5 * size / 1024, 1)
            context.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            
            // Draw the text
            var letter = cipher.charAt(i * 5 + j);
            context.fillText(letter, i * cellSize + cellSize / 2, j * cellSize + cellSize / 2);
        }
    }

    return canvas;
}


function generatePlayfairTexture(cipher) {
    var canvas = makePlayfairCanvas(cipher, 1024);

    // Create a texture from the canvas
    var texture = new THREE.CanvasTexture(canvas);

    // tile/repeat/wrap the texture so the animation works.
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
}


function renderPlayfairTorus(cipher, elementId) { 
    // boilerplate setup
    var container = document.getElementById(elementId);
    while (container.firstChild) { container.removeChild(container.firstChild); }
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.innerWidth, container.innerHeight);
    container.appendChild(renderer.domElement);

    // camera
    var camera = new THREE.PerspectiveCamera(75, container.innerWidth/container.innerHeight, 0.1, 1000);
    camera.position.z = 3; 

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
    var geometry = new THREE.TorusGeometry(1, 0.5, 16, 100);
    var texture = generatePlayfairTexture(cipher);
    var material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    var torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    torus.rotation.z = Math.PI/2;
    torus.rotation.x -= 1;

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x808080); // soft white light
    scene.add(ambientLight);

    // poor man's orbit controls
    var mouseIsDown = false;
    function onMouseMove(event) {
        if ( mouseIsDown ) { 
            torus.rotation.y += event.movementX * 0.005;
            torus.rotation.x += event.movementY * 0.005;
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
        
        // torus slowly rotates and the texture continuously
        // fountains out from the center of the torus.
        torus.rotation.z += 0.002;
        material.map.offset.y += 0.0005;
        material.map.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();
} 

function renderPlayfairCanvas(cipher, elementId) {
    var container = document.getElementById(elementId);
    while (container.firstChild) { container.removeChild(container.firstChild); }
    var canvas = makePlayfairCanvas(cipher, 512);
    container.appendChild(canvas);
}

export { renderPlayfairCanvas, renderPlayfairTorus };
