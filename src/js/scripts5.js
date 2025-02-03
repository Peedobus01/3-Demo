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

// Create Hemisphere Geometry (Half Sphere)
const hemisphereGeometry = new THREE.SphereGeometry(1, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const hemisphere = new THREE.Mesh(hemisphereGeometry, marsMaterial);
scene.add(hemisphere);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);
scene.add(camera);

// Seismic Wave Colors
const pWaveColor = 0xff4500; // Red for P-Waves
const sWaveColor = 0x00ced1; // Cyan for S-Waves

// Function to Create a Seismic Wave Path
function createSeismicWave(pointsArray, color) {
    const geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);
    const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    return new THREE.Line(geometry, material);
}

// Function to Generate Seismic Wave Paths
function generateWavePaths(waveType) {
    let color = waveType == "P" ? pWaveColor : sWaveColor;
    let waves = [];

    for (let i = -Math.PI / 6; i <= Math.PI / 6; i += Math.PI / 6) {
        let points = [];
        for (let t = 0; t <= 1; t += 0.1) {
            let r = 1 - t * 0.6;
            let x = r * Math.sin(i);
            let y = 1 - t * 1.5;
            let z = r * Math.cos(i);
            points.push(new THREE.Vector3(x, y, z));
        }
        waves.push(createSeismicWave(points, color));
    }
    return waves;
}

// Create Seismic Waves
const pWaves = generateWavePaths("P");
const sWaves = generateWavePaths("S");

// Add to Scene
pWaves.forEach(wave => scene.add(wave));
sWaves.forEach(wave => scene.add(wave));

// Camera Position
camera.position.z = 3;

// Orbit Controls (Only Declare Once)
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

// Start Animation
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
