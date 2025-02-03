// import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mars_text from "./mars.jpg";
import color1 from "./core.png";
import color2 from "./outer_core.png";
import color3 from "./crust.png";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load Mars Texture
const textureLoader = new THREE.TextureLoader();
const marsTexture = textureLoader.load(mars_text);  
const marsBumpMap = textureLoader.load('https://www.solarsystemscope.com/textures/download/2k_mars_normal_map.jpg'); 

// Create Hemisphere Geometry (Half Sphere)
const hemisphereGeometry = new THREE.SphereGeometry(1, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2); // Top half

// Add Layers
const addLayer = (radius, height, texture) => {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const layer = new THREE.Mesh(geometry, material);
    layer.position.y = 0.0; // Adjust so it aligns with the hemisphere base
    scene.add(layer);
};

addLayer(0.6, 0.2, textureLoader.load(color3)); // Crust
addLayer(0.7, 0.15, textureLoader.load(color2)); // Outer Core
addLayer(0.4, 0.2, textureLoader.load(color1)); // Inner Core

// Mars Texture Material (for curved part)
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });

// Gray Material (for flat bottom)
const grayMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080, 
    side: THREE.DoubleSide // ✅ Ensures both sides receive light
});

// Combine Both Materials Using Groups
const hemisphere = new THREE.Group();

// Curved Part (Mars Texture)
const marsMesh = new THREE.Mesh(hemisphereGeometry, marsMaterial);
hemisphere.add(marsMesh);

// Flat Circle (Gray Base)
const baseGeometry = new THREE.CircleGeometry(1, 64);
const base = new THREE.Mesh(baseGeometry, grayMaterial);
base.rotation.x = -Math.PI / 2;  // Align with bottom
base.position.y = 0;  // Move it exactly to hemisphere's bottom
hemisphere.add(base);

// Add Hemisphere to Scene
scene.add(hemisphere);

// Seismic Wave Colors
const pWaveColor = 0xff4500; // Red for P-Waves
const sWaveColor = 0x00ced1; // Cyan for S-Waves

// Function to Create Curved Seismic Waves Using Quadratic Bezier Curve
function createSeismicWave(start, mid, end, color) {
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start), // Start point (Top of Hemisphere)
        new THREE.Vector3(...mid),   // Control point (Wave curvature)
        new THREE.Vector3(...end)    // End point (Mantle/Core)
    );

    const points = curve.getPoints(50); // Increase for smoother curves
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    return new THREE.Line(geometry, material);
}

// Generate P-Waves (Curved Paths Through the Core)
const pWaves = [];
const angles = [
    -Math.PI / 4, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 4, Math.PI / 5, -Math.PI / 5,
    -Math.PI / 3, -Math.PI / 2, Math.PI / 3, Math.PI / 2
];

angles.forEach(angle => {
    let start = [0, 1, 0];  // Top of the hemisphere
    let mid = [0, 0.5, 0];  // Midpoint for curvature
    let end = [Math.sin(angle), 0, Math.cos(angle) * 0.3]; // Ends in the core
    pWaves.push(createSeismicWave(start, mid, end, pWaveColor));
});

// Generate S-Waves (Curved Paths That Do Not Enter the Core)
const sWaves = [];

angles.forEach(angle => {
    let start = [0, 1, 0];  // Top of the hemisphere
    let mid = [0, 0.5, 0];  // Midpoint, avoiding core
    let end = [Math.sin(angle) * 0.8, 0, Math.cos(angle) * 0.8]; // Ends in the mantle
    sWaves.push(createSeismicWave(start, mid, end, sWaveColor));
});

// Add Waves to the Scene
pWaves.forEach(wave => scene.add(wave));
sWaves.forEach(wave => scene.add(wave));

// Camera Position
camera.position.z = 3;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;

// Animation Loop (Wave Expansion)
let waveTime = 0;
const animate = () => {
    requestAnimationFrame(animate);
    
    waveTime += 0.01;
    
    // Animate Seismic Waves Expanding
    function animateWaves(waves, speed) {
        waves.forEach((wave, index) => {
            let positions = wave.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(waveTime * speed + i * 0.01) * 0.002;
            }
            wave.geometry.attributes.position.needsUpdate = true;
        });
    }

    animateWaves(pWaves, 2.5);
    animateWaves(sWaves, 1.5);

    renderer.render(scene, camera);
};

animate();

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight); // Attach light to the camera
scene.add(camera); // Ensure camera is part of the scene

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
