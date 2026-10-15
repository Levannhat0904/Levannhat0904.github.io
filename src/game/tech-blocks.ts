import * as THREE from "three";
import { techStack, type StackItem } from "@/config/profile";
import type { Car } from "./car";
import { CAR_RADIUS } from "./car";
import { ACCENT, BLOCKS_CENTER, ISLAND_RADIUS } from "./world";

const SIZE = 1;
const HALF = SIZE / 2;
const GRAVITY = 25;
const SPACING = 1.5;
const PER_ROW = 6;

type Block = {
  mesh: THREE.Mesh;
  home: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
};

// Face texture: tech name, plus its logo once the icon image has loaded.
function createFaceTexture(item: StackItem) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = (icon?: HTMLImageElement) => {
    ctx.fillStyle = "#f4f4f5";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);
    if (icon) ctx.drawImage(icon, 78, 46, 100, 100);
    ctx.fillStyle = "#18181b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = item.name.length > 10 ? 28 : 36;
    ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(item.name, 128, icon ? 192 : 128, 220);
    texture.needsUpdate = true;
  };

  draw();
  if (item.icon) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => draw(img);
    img.src = `https://cdn.simpleicons.org/${item.icon}`;
  }
  return texture;
}

// Snap an angle to the nearest quarter turn so blocks settle flat on a face.
const nearestQuarter = (a: number) => Math.round(a / (Math.PI / 2)) * (Math.PI / 2);

export function createTechBlocks(scene: THREE.Scene) {
  // One block per technology, even if it is listed in several groups.
  const items = [...new Map(techStack.flatMap((g) => g.items).map((i) => [i.name, i])).values()];
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);

  const blocks: Block[] = items.map((item, i) => {
    const material = new THREE.MeshStandardMaterial({ map: createFaceTexture(item), roughness: 0.6 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const home = new THREE.Vector3(
      BLOCKS_CENTER.x + (col - (PER_ROW - 1) / 2) * SPACING,
      HALF,
      BLOCKS_CENTER.z + (row - 2) * SPACING,
    );
    mesh.position.copy(home);
    scene.add(mesh);
    return { mesh, home, velocity: new THREE.Vector3(), spin: new THREE.Vector3() };
  });

  const toBlock = new THREE.Vector3();

  return {
    reset() {
      for (const b of blocks) {
        b.mesh.position.copy(b.home);
        b.mesh.rotation.set(0, 0, 0);
        b.velocity.set(0, 0, 0);
        b.spin.set(0, 0, 0);
      }
    },
    update(dt: number, car: Car) {
      const carSpeed = Math.abs(car.speed);

      for (const b of blocks) {
        const p = b.mesh.position;

        // Car hit: push the block away from the car and toss it up.
        toBlock.set(p.x - car.position.x, 0, p.z - car.position.z);
        const dist = toBlock.length();
        if (dist < CAR_RADIUS + HALF && p.y < 1.6 && dist > 0) {
          toBlock.divideScalar(dist);
          const push = carSpeed * 0.9 + 2;
          b.velocity.x = toBlock.x * push + car.forward.x * carSpeed * 0.5;
          b.velocity.z = toBlock.z * push + car.forward.z * carSpeed * 0.5;
          b.velocity.y = Math.max(b.velocity.y, 2 + carSpeed * 0.45);
          b.spin.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 12);
          p.x = car.position.x + toBlock.x * (CAR_RADIUS + HALF);
          p.z = car.position.z + toBlock.z * (CAR_RADIUS + HALF);
          car.speed *= 0.92;
        }

        b.velocity.y -= GRAVITY * dt;
        p.addScaledVector(b.velocity, dt);
        b.mesh.rotation.x += b.spin.x * dt;
        b.mesh.rotation.y += b.spin.y * dt;
        b.mesh.rotation.z += b.spin.z * dt;

        const onIsland = Math.hypot(p.x, p.z) < ISLAND_RADIUS + 3;
        if (onIsland && p.y <= HALF) {
          // Land: bounce a little, then slide to a stop and settle flat.
          p.y = HALF;
          b.velocity.y = b.velocity.y < -3 ? -b.velocity.y * 0.3 : 0;
          const friction = Math.max(0, 1 - 4 * dt);
          b.velocity.x *= friction;
          b.velocity.z *= friction;
          b.spin.multiplyScalar(Math.max(0, 1 - 6 * dt));
          b.mesh.rotation.x = THREE.MathUtils.damp(b.mesh.rotation.x, nearestQuarter(b.mesh.rotation.x), 10, dt);
          b.mesh.rotation.z = THREE.MathUtils.damp(b.mesh.rotation.z, nearestQuarter(b.mesh.rotation.z), 10, dt);
        }

        // Knocked into the sea: drop it back onto its home spot.
        if (p.y < -4) {
          p.set(b.home.x, 8, b.home.z);
          b.velocity.set(0, 0, 0);
          b.spin.set(0, 0, 0);
          b.mesh.rotation.set(0, 0, 0);
        }
      }

      // Keep resting blocks from overlapping each other.
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i].mesh.position;
          const c = blocks[j].mesh.position;
          if (Math.abs(a.y - c.y) > SIZE) continue;
          const dx = c.x - a.x;
          const dz = c.z - a.z;
          const d = Math.hypot(dx, dz);
          if (d < SIZE && d > 0.0001) {
            const overlap = (SIZE - d) / 2;
            a.x -= (dx / d) * overlap;
            a.z -= (dz / d) * overlap;
            c.x += (dx / d) * overlap;
            c.z += (dz / d) * overlap;
          }
        }
      }
    },
  };
}
