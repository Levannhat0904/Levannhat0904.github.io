import * as THREE from "three";
import { createLabelSprite } from "./label-sprite";

export const ISLAND_RADIUS = 30;
export const ACCENT = "#42bc2a";

export type ZoneId = "about" | "stack" | "contact";
export type Obstacle = { x: number; z: number; r: number };

export const ZONES: { id: ZoneId; x: number; z: number; radius: number }[] = [
  { id: "about", x: 0, z: 14, radius: 3.2 },
  { id: "stack", x: -15, z: -4, radius: 3.2 },
  { id: "contact", x: 15, z: -4, radius: 3.2 },
];

// Area kept free of trees so the tech blocks have room.
export const BLOCKS_CENTER = { x: -12, z: -15 };

// Deterministic pseudo-random numbers so the island looks the same on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const flat = (color: string) => new THREE.MeshStandardMaterial({ color, flatShading: true });

function createTree(rand: () => number) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.4, 6), flat("#7a5232"));
  trunk.position.y = 0.7;
  tree.add(trunk);
  const greens = ["#2f8f3a", "#3aa34a", "#26803a"];
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.1 - i * 0.25, 1.3, 7),
      flat(greens[i]),
    );
    cone.position.y = 1.6 + i * 0.7;
    tree.add(cone);
  }
  tree.scale.setScalar(0.8 + rand() * 0.6);
  tree.rotation.y = rand() * Math.PI;
  tree.traverse((o) => (o.castShadow = true));
  return tree;
}

function createZoneMarker(color: string) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.6, 3.2, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.02;
  group.add(disc);

  // Soft light column so zones are visible from across the island.
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 5, 32, 1, true),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.position.y = 2.5;
  group.add(beam);
  return { group, ring, disc };
}

export function createWorld(scene: THREE.Scene, zoneLabels: Record<ZoneId, string>) {
  const rand = seeded(42);
  const obstacles: Obstacle[] = [];

  // Island: grass top, sand rim, water around it.
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS + 1.5, 2, 48), flat("#6cc04a"));
  grass.position.y = -1;
  grass.receiveShadow = true;
  scene.add(grass);

  const sand = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_RADIUS + 4, ISLAND_RADIUS + 6, 2, 48), flat("#e8d29a"));
  sand.position.y = -1.05;
  sand.receiveShadow = true;
  scene.add(sand);

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(400, 64),
    new THREE.MeshStandardMaterial({ color: "#2a8fbf", transparent: true, opacity: 0.92, roughness: 0.3 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.7;
  scene.add(water);

  // Distance from point (x, z) to the straight road between spawn (0, 0) and (zx, zz).
  const distToRoad = (x: number, z: number, zx: number, zz: number) => {
    const t = THREE.MathUtils.clamp((x * zx + z * zz) / (zx * zx + zz * zz), 0, 1);
    return Math.hypot(x - zx * t, z - zz * t);
  };

  // Trees and rocks, kept away from the spawn point, zones, the roads to them and the block field.
  const isFree = (x: number, z: number) =>
    Math.hypot(x, z) > 6 &&
    ZONES.every((zone) => distToRoad(x, z, zone.x, zone.z) > 3) &&
    ZONES.every((zone) => Math.hypot(x - zone.x, z - zone.z) > zone.radius + 3) &&
    Math.hypot(x - BLOCKS_CENTER.x, z - BLOCKS_CENTER.z) > 7;

  let placed = 0;
  while (placed < 34) {
    const angle = rand() * Math.PI * 2;
    const dist = 4 + rand() * (ISLAND_RADIUS - 6);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    if (!isFree(x, z)) continue;
    placed++;
    if (rand() < 0.75) {
      const tree = createTree(rand);
      tree.position.set(x, 0, z);
      scene.add(tree);
      obstacles.push({ x, z, r: 0.5 });
    } else {
      const size = 0.5 + rand() * 0.7;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), flat("#8b8f99"));
      rock.position.set(x, size * 0.5, z);
      rock.rotation.set(rand(), rand(), rand());
      rock.castShadow = true;
      scene.add(rock);
      obstacles.push({ x, z, r: size * 0.9 });
    }
  }

  // Clouds drifting slowly overhead.
  const clouds = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, transparent: true, opacity: 0.95 });
  for (let i = 0; i < 9; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + rand(), 0), cloudMat);
      puff.position.set(j * 1.4 - 1.4, rand() * 0.5, rand() * 0.6);
      cloud.add(puff);
    }
    cloud.position.set((rand() - 0.5) * 90, 12 + rand() * 6, (rand() - 0.5) * 90);
    clouds.add(cloud);
  }
  scene.add(clouds);

  // Zone markers with floating labels.
  const zones = ZONES.map((zone) => {
    const marker = createZoneMarker(ACCENT);
    marker.group.position.set(zone.x, 0, zone.z);
    const label = createLabelSprite(zoneLabels[zone.id], ACCENT);
    label.sprite.position.set(zone.x, 3.4, zone.z);
    scene.add(marker.group, label.sprite);
    return { ...zone, marker, label };
  });

  return {
    obstacles,
    setZoneLabels(labels: Record<ZoneId, string>) {
      zones.forEach((z) => z.label.setText(labels[z.id]));
    },
    update(time: number, activeZone: ZoneId | null) {
      water.position.y = -0.7 + Math.sin(time * 0.8) * 0.06;
      clouds.children.forEach((c, i) => {
        c.position.x += 0.004 * (1 + (i % 3));
        if (c.position.x > 50) c.position.x = -50;
      });
      zones.forEach((z, i) => {
        z.label.sprite.position.y = 3.4 + Math.sin(time * 2 + i) * 0.15;
        const active = z.id === activeZone;
        (z.marker.disc.material as THREE.MeshBasicMaterial).opacity = active ? 0.35 : 0.12 + Math.sin(time * 3 + i) * 0.05;
        z.marker.ring.scale.setScalar(active ? 1.05 : 1);
      });
    },
  };
}
