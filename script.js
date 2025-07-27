// --- Initial Params ---
const WIDTH = window.innerWidth; 
const HEIGHT = window.innerHeight;
const WORLD_WIDTH = 8000;   // Width of our field
const WORLD_HEIGHT = 4000;  // Height of our field
const NUM_PARTICLES = 1200; // Number of particles
const MAX_SPEED = 15.0;
const INITIAL_SPEED = 1.0;
const DAMPING = 0.95;
const CENTER = new THREE.Vector3(0, 0, 0);

const PARTICLE_TYPES = [
  { color: 0xff0000, mass: 1.0 },   // Red
  { color: 0x00ff00, mass: 1.0 },    // Green
  { color: 0x00aaff, mass: 4.0 },   // Blue
  { color: 0xfde910, mass: 2.0 },    // Yellow
  { color: 0xba55d3, mass: 3.0 },    // Purple
  { color: 0xff8c00, mass: 1.0 }     // Orange
];

// force_matrix: 
const force_matrix = [
   //R     G     B    Y     P     O
  [ 0.25, -0.8, -0.1, 0.1, -0.6, 0.0],      // Red
  [ -0.7, 0.0, -0.7, -0.1, 0.1, -0.1],      // Green
  [ 0.6, -0.2, -0.1, 0.2, -0.2, 0.0],       // Blue
  [ 0.6, 0.1, -0.2, 0.1, 0.3, 0.2],         // Yellow
  [ 0.6, 0.8, -0.5, -0.3, -0.05, -0.2],     // Purple
  [ 0.1, 0.3, 0.0, -0.3, -0.2, -0.4, 0.2]   // Orange
];

// --- Scene ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 5000);
camera.position.z = 1500; 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

// --- Create Particles ---
const particles = [];
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(NUM_PARTICLES * 5);
const colors = new Float32Array(NUM_PARTICLES * 5);

for (let i = 0; i < NUM_PARTICLES; i++) {
  const type = Math.floor(Math.random() * PARTICLE_TYPES.length);
  const x = Math.random() * WORLD_WIDTH - WORLD_WIDTH / 2;
  const y = Math.random() * WORLD_HEIGHT - WORLD_HEIGHT / 2;
  const z = 0;

  particles.push({
    position: new THREE.Vector3(x, y, z),
    velocity: new THREE.Vector3(
    (Math.random() - 0.5) * INITIAL_SPEED,
    (Math.random() - 0.5) * INITIAL_SPEED, 0),
    type: type,
    radius: 15,
    mass: PARTICLE_TYPES[type].mass
  });

  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;

  const color = new THREE.Color(PARTICLE_TYPES[type].color);
  colors[i * 3] = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

//
function createSolidCircleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white'; 
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}


const circleTexture = createSolidCircleTexture();
const material = new THREE.PointsMaterial({
  size: 15,
  map: circleTexture,
  vertexColors: true,
  transparent: true,
  alphaTest: 0.5 
});


const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);


// --- Interactions function ---
function applyInteractions() {
  const radius = 25;   // Min radius (repulsion)
  const interaction_radius = 280; // Interaction radius
  const localRadius = 50;  // Dense radius
  const densityThreshold = 30; // Number of neighbors
  const pressureFactor = 0.1; // Internal pressure

  for (let i = 0; i < NUM_PARTICLES; i++) {
    let p1 = particles[i];
    let force = new THREE.Vector3();
    let neighbors = 0;

    for (let j = 0; j < NUM_PARTICLES; j++) {
      if (i === j) continue;
      let p2 = particles[j];

      let direction = new THREE.Vector3().subVectors(p2.position, p1.position);
      let dist = direction.length();
      if (dist === 0 || dist > interaction_radius) continue;
      direction.normalize();

      if (dist < localRadius) neighbors++;

      if (dist < radius) {
        let overlap = radius - dist;
        force.add(direction.multiplyScalar(-overlap * 0.7 / p1.mass));
      } else {
        let t = 1 - (dist - radius) / (interaction_radius - radius);
        let strength = force_matrix[p1.type][p2.type] * t;
        force.add(direction.multiplyScalar(strength));
      }
    }

    if (neighbors > densityThreshold) {
      let pressure = (neighbors - densityThreshold) * pressureFactor;
      force.add(p1.velocity.clone().normalize().multiplyScalar(-pressure));
    }

    p1.velocity.add(force.divideScalar(p1.mass));
    p1.velocity.multiplyScalar(DAMPING);
    if (p1.velocity.length() > MAX_SPEED) {
      p1.velocity.setLength(MAX_SPEED);
    }
  }
}

// Pacman bounds
function pacmanBounds(p) {
  if (p.position.x < -WORLD_WIDTH / 2) {
    p.position.x = WORLD_WIDTH / 2;
  } else if (p.position.x > WORLD_WIDTH / 2) {
    p.position.x = -WORLD_WIDTH / 2;
  }

  if (p.position.y < -WORLD_HEIGHT / 2) {
    p.position.y = WORLD_HEIGHT / 2;
  } else if (p.position.y > WORLD_HEIGHT / 2) {
    p.position.y = -WORLD_HEIGHT / 2;
  }
}

// --- Wheel zoom ---
window.addEventListener('wheel', (event) => {
  if (event.deltaY < 0) {
    camera.position.z *= 0.9; 
  } else {
    camera.position.z *= 1.1; 
  }
});

// --- Camera movement ---
const cameraSpeed = 30;  
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

window.addEventListener('keydown', (event) => {
  if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
  if (keys.hasOwnProperty(event.key.toLowerCase())) keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
  if (keys.hasOwnProperty(event.key.toLowerCase())) keys[event.key.toLowerCase()] = false;
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === 'R') {
    resetSimulation();
  }

  if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
  if (keys.hasOwnProperty(event.key.toLowerCase())) keys[event.key.toLowerCase()] = true;
});

function updateCamera() {
  if (keys.w || keys.ArrowUp) camera.position.y += cameraSpeed;
  if (keys.s || keys.ArrowDown) camera.position.y -= cameraSpeed;
  if (keys.a || keys.ArrowLeft) camera.position.x -= cameraSpeed;
  if (keys.d || keys.ArrowRight) camera.position.x += cameraSpeed;
}

// Reset simulation
function resetSimulation() {
  particles.length = 0; 

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const type = Math.floor(Math.random() * PARTICLE_TYPES.length);
    const x = Math.random() * WORLD_WIDTH - WORLD_WIDTH / 2;
    const y = Math.random() * WORLD_HEIGHT - WORLD_HEIGHT / 2;
    const z = 0;

    particles.push({
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0),
      type: type,
      radius: 15,
      mass: PARTICLE_TYPES[type].mass
    });

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const color = new THREE.Color(PARTICLE_TYPES[type].color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  updateCamera();
  applyInteractions();

  for (let i = 0; i < NUM_PARTICLES; i++) {
    let p = particles[i];
    p.position.add(p.velocity);
    pacmanBounds(p);
    positions[i * 3] = p.position.x;
    positions[i * 3 + 1] = p.position.y;
    positions[i * 3 + 2] = p.position.z;
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
animate();