// import * as THREE from 'three';
import { CSG } from 'three-csg-ts'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mars_texture from "./mars.jpg";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load Textures
const textureLoader = new THREE.TextureLoader();
const marsTexture = textureLoader.load(mars_texture);  
const marsBumpMap = textureLoader.load('https://www.solarsystemscope.com/textures/download/2k_mars_normal_map.jpg'); 

// Create Mars Sphere
const marsGeometry = new THREE.SphereGeometry(1, 64, 64);
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
    bumpMap: marsBumpMap,
    bumpScale: 0.05,
});
const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);

// Create Cutter to Slice Half of Mars
const cutterGeometry = new THREE.BoxGeometry(2, 2, 2);
cutterGeometry.translate(1, 0, 0); // Position to cut right half
const cutterMesh = new THREE.Mesh(cutterGeometry, new THREE.MeshBasicMaterial());

const marsCSG = CSG.fromMesh(marsMesh);
const cutterCSG = CSG.fromMesh(cutterMesh);
const cutMars = marsCSG.subtract(cutterCSG);
const marsFinal = CSG.toMesh(cutMars, new THREE.Matrix4(), marsMaterial);

// Add Cut Mars to Scene
scene.add(marsFinal);

// Create Core Sphere
const coreGeometry = new THREE.SphereGeometry(0.5, 64, 64);
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6600, // Lava-like color
    emissive: 0xff3300, // Glow effect
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Lighting
const light = new THREE.PointLight(0xffffff, 0.5);
light.position.set(2, 2, 5);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);
scene.add(camera);

// Camera Position
camera.position.z = 3;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation Loop
const animate = () => {
    requestAnimationFrame(animate);
    // marsFinal.rotation.y += 0.005; // Rotate Mars
    core.rotation.y += 0.005; // Rotate Core
    renderer.render(scene, camera);
};

animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});