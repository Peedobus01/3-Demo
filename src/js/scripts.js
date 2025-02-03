// Import Three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load Textures
const textureLoader = new THREE.TextureLoader();
const marsTexture = textureLoader.load('mars.jpg');  // Mars surface texture
const coreTexture = textureLoader.load('core.jpg');  // Inner core texture
const mantleTexture = textureLoader.load('mantle.jpg');  // Mantle texture

// Create Mars Layers
const createLayer = (radius, color, texture) => {
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({ map: texture || new THREE.Color(color) });
    const layer = new THREE.Mesh(geometry, material);
    scene.add(layer);
    return layer;
};

// Create Crust, Mantle, and Core layers for Mars
createLayer(1.0, 0xFF4500, marsTexture); // Crust
createLayer(0.7, 0x8B4513, mantleTexture); // Mantle
createLayer(0.4, 0xFFD700, coreTexture);  // Core (Inner core)

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enableRotate = true;
camera.position.z = 3;

// Initialize P-Wave and S-Wave spheres
let pWaveRadius = 0.1;
let sWaveRadius = 0.1;
const pWaveSpeed = 0.01;
const sWaveSpeed = 0.008;

// Function to create a propagating wave (P-wave or S-wave)
function createWave(material, initialRadius, speed, stopAtRadius) {
    const wave = new THREE.Mesh(
        new THREE.SphereGeometry(initialRadius, 16, 16),
        new THREE.MeshBasicMaterial({ color: material, wireframe: true })
    );
    wave.position.set(0, 0, 0);  // Start from center of the Mars model
    scene.add(wave);
    
    let radius = initialRadius;
    const waveAnimation = () => {
        if (radius < stopAtRadius) {
            radius += speed;
            wave.scale.set(radius, radius, radius);  // Increase wave size
        } else {
            wave.material.color.set(0xFF0000);  // Change color when reaching core
        }
        requestAnimationFrame(waveAnimation);
        renderer.render(scene, camera);
    };
    waveAnimation();
}

// Function to simulate P-Wave propagation
function simulatePWave() {
    createWave(0x0000ff, pWaveRadius, pWaveSpeed, 1.5);  // P-wave propagates through all layers
}

// Function to simulate S-Wave propagation
function simulateSWave() {
    createWave(0x00ff00, sWaveRadius, sWaveSpeed, 0.7);  // S-wave propagates only through solid layers
}

// Start simulations for P-Wave and S-Wave
simulatePWave();
simulateSWave();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    controls.update();  // Update controls for smooth rotation/zoom
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// S-Wave Shadow Zone (cannot propagate through the liquid core)
const sWaveShadowZone = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 64, 64),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5,
        transparent: true
    })
);
scene.add(sWaveShadowZone);

// P-Wave Shadow Zone (refracted P-wave after passing the core)
const pWaveShadowZone = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 64, 64),
    new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        opacity: 0.3,
        transparent: true
    })
);
scene.add(pWaveShadowZone);