# Particle Life Simulation

[**▶ Live Demo**](https://lilbagi6.github.io/Particle-Life-Simulation/)

**Particle Life** is an interactive 2D simulation inspired by the "Game of Life" model and self-organization principles.  
The simulation features **6 particle types**, each with unique interactions. With a **force matrix**, particles can attract, repel, and form clusters and complex structures resembling cells or microorganisms.

---
## How it works?

The core logic of particle interactions is as follows: at very short distances, all particles repel each other until they reach a neutral point where the `force = 0`. 
Beyond this point, their behavior is defined by the `force matrix` up to the maximum `INTERACTION_RADIUS`. Outside this range, the forces gradually fade.

Feel free to explore the code and experiment with different parameters, but I recommend focusing on the `force matrix` values to see how they affect the overall behavior.

---
## 📸 Example

![Particle Simulation](Sim-gif.gif)


---
## Force matrix
    const force_matrix = [
    //Red  Green Blue ...
    [ 1.0, -0.5, 0.3, ... ],  // Forces for Red
    [ -0.5, 1.0, -0.2, ... ], // Forces for Green
    ...
    ];
  
---
##  Features

- **6 particle types** (each with its own color and mass).
- **Force matrix** to define interactions between all particle types.
- **Camera zoom** (mouse wheel).
- **Camera movement** — keys `WASD` or arrow keys.
- **Restart simulation** — key `R`.
- **Impulse reaction**: during strong collisions, particles can scatter apart.
- Realistic physics: smooth motion, damping of velocity, and soft collisions.

---

## ⚙ Adjustable Parameters

Main parameters are defined in `script.js`:

- `NUM_PARTICLES` — number of particles.
- `INTERACTION_RADIUS` — interaction radius of particles.
- `force_matrix` — force matrix between particle types  
  (positive = attraction, negative = repulsion).
- `MAX_SPEED` — maximum particle speed.
- `DAMPING` — velocity damping factor controlling inertia.
- `RADIUS` — distance at which the force between particles is zero.

---

## 🚀 How to Run Locally

1. **Clone the repository**  
   ```bash
   git clone https://github.com/lilbagi6/Particle-Life-Simulation.git

2. **Then navigate into the project folder:**
   ```bash
   cd Particle-Life-Simulation

3. Then open `index.html` directly 
