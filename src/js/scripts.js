// Import necessary modules
import { CSG } from 'three-csg-ts'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
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

// Create Core Layers
const createCoreLayer = (radius, color) => {
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.5
    });
    const layer = new THREE.Mesh(geometry, material);
    scene.add(layer);
    return layer;
};

const innerCore = createCoreLayer(0.2, 0xff6600); // Inner Core
const outerCore = createCoreLayer(0.35, 0xff9900); // Outer Core
const mantle = createCoreLayer(0.5, 0xffcc00); // Mantle
const crust = createCoreLayer(0.65, 0xffff00); // Crust

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
    innerCore.rotation.y += 0.005;
    outerCore.rotation.y += 0.004;
    mantle.rotation.y += 0.003;
    crust.rotation.y += 0.002;
    renderer.render(scene, camera);
};

animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
