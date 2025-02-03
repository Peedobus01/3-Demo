// import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import mars_text from "./mars.jpg";


import color1 from "./crust.png";
import color2 from "./outer_core.png";
import color3 from "./core.png";


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


// Add Mantle (Dark Brown)
const geometry1 = new THREE.CylinderGeometry(1, 1, 0.1, 64);
const colorTexture1 = textureLoader.load(color1); // Load the image

const material1 = new THREE.MeshStandardMaterial({
    map: colorTexture1 // Assign the image texture to the material
});
const layer1 = new THREE.Mesh(geometry1, material1);
layer1.position.y = 0.0; // Adjust so it aligns with the hemisphere base
scene.add(layer1);


// Add Outer Core (Orange)

const geometry2 = new THREE.CylinderGeometry(0.61, 0.61, 0.15, 64);
const colorTexture2 = textureLoader.load(color2); // Load the image

const material2 = new THREE.MeshStandardMaterial({
    map: colorTexture2 // Assign the image texture to the material
});
const layer2 = new THREE.Mesh(geometry2, material2);
layer2.position.y = 0.0; // Adjust so it aligns with the hemisphere base
scene.add(layer2);

// Add Inner Core (Yellow)

const geometry3 = new THREE.CylinderGeometry(0.51, 0.51, 0.2, 64);
const colorTexture3 = textureLoader.load(color3); // Load the image

const material3 = new THREE.MeshStandardMaterial({
    map: colorTexture3 // Assign the image texture to the material
});
const layer3 = new THREE.Mesh(geometry3, material3);
layer3.position.y = 0.0; // Adjust so it aligns with the hemisphere base
scene.add(layer3);


// Mars Texture Material (for curved part)
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });

// Gray Material (for flat bottom)
const grayMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    side: THREE.DoubleSide //  Ensures both sides receive light
});

// Combine Both Materials Using Groups
const hemisphere = new THREE.Group();

// Curved Part (Mars Texture)
const marsMesh = new THREE.Mesh(hemisphereGeometry, marsMaterial);
hemisphere.add(marsMesh);

// Flat Circle (Gray Base)
const baseGeometry = new THREE.CircleGeometry(1, 64);

const base = new THREE.Mesh(baseGeometry, grayMaterial);

// Fix Rotation & Positioning
base.rotation.x = -Math.PI / 2;  // Align with bottom
base.position.y = 0;  // Move it exactly to hemisphere's bottom
hemisphere.add(base);

// Add Hemisphere to Scene
scene.add(hemisphere);

// Seismic Wave Colors
const pWaveColor = 0x000000; // black for P-Waves
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
    const material = new THREE.LineBasicMaterial({ color, linewidth: 10000000 });

    return new THREE.Line(geometry, material);
}

// Generate P-Waves (Curved Paths Through the Core)
const pWaves = [];
const angles = [-Math.PI / 5,-Math.PI / 6, -Math.PI /12,-Math.PI / 24, 0,Math.PI / 24, Math.PI / 12, Math.PI / 6,Math.PI / 5]; // Angles for different wave directions

angles.forEach(angle => {
    let start = [0, -0.11, 1];  // Top of the hemisphere
    let mid = [0, -0.11, 0];  // Midpoint for curvature
    let end = [Math.sin(angle) * 2, -0.11, -Math.cos(angle) * 0.8]; // Ends in the core
    pWaves.push(createSeismicWave(start, mid, end, pWaveColor));
});

// Generate S-Waves (Curved Paths That Do Not Enter the Core)
const sWaves = [];

angles.forEach(angle => {
    let start = [0, -0.09, 1];  // Top of the hemisphere
    let mid = [0, -0.09, 0.6];  // Midpoint, avoiding core
    let end = [Math.sin(angle) * 2, -0.09, -Math.cos(angle) * 0.2]; // Ends in the mantle
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


// Loop (No Auto Rotation)
const animate = () => {
    requestAnimationFrame(animate);
    // base.rotation.y += 0.005; // Rotate Core
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

// Camera Position
camera.position.z = 3;

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});