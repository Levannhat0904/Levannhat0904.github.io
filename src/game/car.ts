import * as THREE from "three";
import type { InputState } from "./input";
import { ACCENT, ISLAND_RADIUS, type Obstacle } from "./world";

const MAX_SPEED = 16;
const MAX_REVERSE = 7;
const ACCELERATION = 20;
const REVERSE_ACCELERATION = 12;
const DRAG = 1.4;
const BRAKE = 5;
const TURN_RATE = 2.4;
const WHEEL_RADIUS = 0.36;
export const CAR_RADIUS = 1.3;

const START = new THREE.Vector3(0, 0, 0);

function createCarMesh() {
  const car = new THREE.Group();
  const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, flatShading: true, ...extra });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.7), mat(ACCENT));
  body.position.y = 0.6;
  car.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 1.3), mat("#1c1c20"));
  cabin.position.set(0, 1.1, -0.2);
  car.add(cabin);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 1.36), mat(ACCENT));
  roof.position.set(0, 1.41, -0.2);
  car.add(roof);

  for (const x of [-0.5, 0.5]) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.18, 0.06),
      mat("#fff7c2", { emissive: "#fff3a0", emissiveIntensity: 1.2 }),
    );
    light.position.set(x, 0.65, 1.36);
    car.add(light);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.06),
      mat("#ff3b3b", { emissive: "#ff2020", emissiveIntensity: 0.8 }),
    );
    tail.position.set(x, 0.65, -1.36);
    car.add(tail);
  }

  // Each wheel: pivot (steering around Y) -> mesh (spinning around its own axle).
  const wheelGeo = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 14);
  const wheelMat = mat("#222226");
  const hubMat = mat("#d9d9de");
  const wheels: { pivot: THREE.Group; mesh: THREE.Group; front: boolean }[] = [];
  for (const [x, z] of [[-0.85, 0.9], [0.85, 0.9], [-0.85, -0.9], [0.85, -0.9]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, WHEEL_RADIUS, z);
    const mesh = new THREE.Group();
    const tyre = new THREE.Mesh(wheelGeo, wheelMat);
    tyre.rotation.z = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.14), hubMat);
    mesh.add(tyre, hub);
    pivot.add(mesh);
    car.add(pivot);
    wheels.push({ pivot, mesh, front: z > 0 });
  }

  car.traverse((o) => (o.castShadow = true));
  return { car, body, wheels };
}

export function createCar(scene: THREE.Scene) {
  const { car, body, wheels } = createCarMesh();
  scene.add(car);

  const position = START.clone();
  let heading = 0; // radians, 0 = facing +Z
  let speed = 0;
  let steer = 0;

  const forward = new THREE.Vector3();

  return {
    object: car,
    position,
    get speed() {
      return speed;
    },
    set speed(v: number) {
      speed = v;
    },
    get forward() {
      return forward.set(Math.sin(heading), 0, Math.cos(heading));
    },
    reset() {
      position.copy(START);
      heading = 0;
      speed = 0;
    },
    update(dt: number, input: InputState, obstacles: Obstacle[], time: number) {
      // Throttle, reverse, drag and brake.
      if (input.forward) speed += ACCELERATION * dt;
      else if (input.backward) speed -= REVERSE_ACCELERATION * dt;
      else speed -= speed * DRAG * dt;
      if (input.brake) speed -= speed * BRAKE * dt;
      speed = THREE.MathUtils.clamp(speed, -MAX_REVERSE, MAX_SPEED);

      // Steering scales with speed so the car cannot spin in place.
      const steerTarget = (input.left ? 1 : 0) - (input.right ? 1 : 0);
      steer = THREE.MathUtils.damp(steer, steerTarget, 12, dt);
      heading += steer * TURN_RATE * dt * THREE.MathUtils.clamp(speed / 6, -1, 1);

      position.x += Math.sin(heading) * speed * dt;
      position.z += Math.cos(heading) * speed * dt;

      // Bounce off trees and rocks.
      for (const o of obstacles) {
        const dx = position.x - o.x;
        const dz = position.z - o.z;
        const dist = Math.hypot(dx, dz);
        const min = o.r + CAR_RADIUS * 0.8;
        if (dist < min && dist > 0) {
          position.x = o.x + (dx / dist) * min;
          position.z = o.z + (dz / dist) * min;
          speed *= -0.3;
        }
      }

      // Keep the car on the island.
      const edge = ISLAND_RADIUS + 2.5;
      const r = Math.hypot(position.x, position.z);
      if (r > edge) {
        position.x *= edge / r;
        position.z *= edge / r;
        speed *= -0.3;
      }

      car.position.copy(position);
      car.rotation.y = heading;
      // Small body roll/bob for a livelier feel.
      body.rotation.z = -steer * Math.min(Math.abs(speed) / MAX_SPEED, 1) * 0.08;
      body.position.y = 0.6 + Math.sin(time * 18) * 0.012 * Math.min(Math.abs(speed), 1);

      for (const w of wheels) {
        w.mesh.rotation.x += (speed * dt) / WHEEL_RADIUS;
        if (w.front) w.pivot.rotation.y = steer * 0.45;
      }
    },
  };
}

export type Car = ReturnType<typeof createCar>;
