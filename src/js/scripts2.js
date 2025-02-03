// Import necessary modules
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

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Load Mars Texture
const textureLoader = new THREE.TextureLoader();
const marsTexture = textureLoader.load(mars_texture);

// Create Mars Sphere
const marsGeometry = new THREE.SphereGeometry(1, 64, 64);
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
    metalness: 0.3,
    roughness: 0.7
});
const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);

// Create Cutter (Half of Mars)
const cutterGeometry = new THREE.BoxGeometry(2, 2, 2);
cutterGeometry.translate(1, 0, 0);
const cutterMesh = new THREE.Mesh(cutterGeometry, new THREE.MeshBasicMaterial());

// Perform CSG subtraction (cutting Mars)
const marsCSG = CSG.fromMesh(marsMesh);
const cutterCSG = CSG.fromMesh(cutterMesh);
const cutMars = marsCSG.subtract(cutterCSG);
const marsFinal = CSG.toMesh(cutMars, new THREE.Matrix4(), marsMaterial);
scene.add(marsFinal);

// Fix the cut surface alignment
const cutSurfaceGeometry = new THREE.CircleGeometry(1, 64);
const layerTexture = new THREE.CanvasTexture(generateLayerTexture());
const layerMaterial = new THREE.MeshStandardMaterial({
    map: layerTexture,
    side: THREE.DoubleSide
});
const cutSurface = new THREE.Mesh(cutSurfaceGeometry, layerMaterial);

// **Fix Rotation and Position**
cutSurface.rotation.y = -Math.PI / 2;  // Ensure it's exactly aligned
cutSurface.position.x = 0.0;           // Ensure it matches the sphere's cut
scene.add(cutSurface);

// Add Point Light for better visibility
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(2, 2, 5);
scene.add(pointLight);

// Camera Setup
camera.position.z = 3;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation Loop
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();

// Window Resize Handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Function to Generate Layered Texture for Cut Surface
function generateLayerTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Define Layers (from Core to Crust)
    const colors = ['#8B0000', '#B22222', '#D2691E', '#F4A460', '#FFD700']; 

    for (let i = 0; i < colors.length; i++) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, (size / 2) * ((i + 1) / colors.length), 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.closePath();
    }

    return canvas;
}
