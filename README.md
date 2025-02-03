
# **Mars Seismic Wave Simulation and Analysis**

This project simulates **seismic wave propagation** through the Martian core, focusing on P-Waves and S-Waves. The seismic waves are generated using **Bezier curves** and animated to simulate how seismic waves propagate from the surface to the Martian core.

---

## **Overview**

This simulation uses **Three.js** to visualize seismic waves propagating across Mars. The **P-Waves** and **S-Waves** are generated using quadratic Bezier curves and are animated to propagate across the Martian layers (mantle and core).

### **Key Features**:
- **Curved seismic waves** for both **P-Waves** and **S-Waves**.
- **Animation of wave propagation** from the top of the Martian hemisphere to the core.
- **Visual effects** to simulate realistic wave behavior using Three.js.
- **Support for animation speed and wave direction**.

---

## **Getting Started**

### **Dependencies**:
- **Three.js** for 3D graphics and animation.
- **OrbitControls.js** for interactive camera controls.
- **Custom shaders** for rendering lines.

You can install the necessary dependencies using:

```bash
npm install three
npm install three/examples/jsm/controls/OrbitControls.js
```

### **Installation**:

1. Clone the repository or download the project files.
2. Install the dependencies by running the command:
   ```bash
   npm install
   ```
3. Open the `index.html` in a browser or start a development server using `npm start`.

---

## **Seismic Wave Visualization**

### **Seismic Wave Types**:
- **P-Waves (Primary Waves)**: Longitudinal waves that travel through solids, liquids, and gases.
- **S-Waves (Secondary Waves)**: Transverse waves that travel only through solids.

Both wave types are represented with distinct colors and curves:
- **P-Waves**: Red (`0xff4500`)
- **S-Waves**: Cyan (`0x00ced1`)

### **Wave Propagation**:
- The waves start at the **top of the Martian hemisphere** and propagate toward the **core** (mantle-core boundary).
- **P-Waves** travel through the core, while **S-Waves** travel along the mantle but are blocked by the liquid core.

### **Animation**:
- The wave animation simulates the **expansion** of waves over time, where the wave travels from the start to the end points.
- The **`animateWaves`** function updates the wave's geometry based on time to simulate propagation.

---

## **Main Components**

### **1. Mars Scene Setup**

The scene is set up with:
- **Mars Hemisphere**: A half-sphere representing Mars, with textures for the crust, mantle, and core.
- **Wave Layers**: **Crust**, **Outer Core**, and **Inner Core** are modeled as **cylindrical layers**.
  
```js
const hemisphereGeometry = new THREE.SphereGeometry(1, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
```

### **2. Seismic Wave Creation**

Seismic waves are created using **Bezier curves**:
- **`THREE.QuadraticBezierCurve3`** is used to create a smooth path for the waves.
- The wave is rendered using `THREE.LineBasicMaterial` or **`THREE.MeshLine`** if better thickness control is needed.

```js
const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
```

### **3. Animation**

The **animation loop** updates the wave positions based on time, allowing the wave to propagate over time.

```js
function animateWaves(waves, speed) {
    waves.forEach((wave, index) => {
        const time = wave.userData.time;
        wave.userData.time += speed;
        if (wave.userData.time <= 1) {
            // Update the wave's position along the curve
            for (let i = 0; i < points.length; i++) {
                points[i] = curve.getPointAt(time);
            }
        }
        wave.geometry.attributes.position.needsUpdate = true;
    });
}
```

### **4. Camera & Controls**

- **OrbitControls** are used to interactively navigate the scene.
- **Lighting** is added to the scene for better visualization.

---

## **Customization Options**

### **Wave Speed**
You can adjust the wave speed by modifying the speed parameter in the `animateWaves` function:

```js
animateWaves(pWaves, 0.01);  // Adjust for P-Wave speed
animateWaves(sWaves, 0.008);  // Adjust for S-Wave speed
```

### **Line Thickness**
For line thickness, `THREE.CylinderGeometry` can be used to simulate thick lines instead of relying on `linewidth` which has inconsistent support in WebGL.

---

## **File Structure**

```plaintext
/
├── index.html           # Main HTML file to render the scene
├── main.js              # The main JavaScript file with Three.js setup
├── assets/
│   ├── mars.jpg         # Texture for the Mars surface
│   ├── core.png         # Texture for the inner core
│   └── outer_core.png   # Texture for the outer core
├── README.md            # Documentation for the project
└── package.json         # NPM configuration file
```

---

## **Conclusion**

This project provides a basic framework for simulating and visualizing seismic wave propagation through the Martian core. By using Three.js and animations, you can explore how seismic waves travel through different layers of the Martian interior and visualize phenomena like **shadow zones** and wave refraction.

---

Feel free to adjust the code for further customizations, such as **fading waves** or adding **more detailed wave propagation effects**! Let me know if you'd like to expand the functionality further.
