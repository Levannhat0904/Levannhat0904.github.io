import * as THREE from "three";
import { createCar } from "./car";
import { createInput, type Control } from "./input";
import { createTechBlocks } from "./tech-blocks";
import { createWorld, ZONES, type ZoneId } from "./world";

const SKY = "#9fd6f0";
const CAMERA_OFFSET = new THREE.Vector3(0, 16, -15);

type GameOptions = {
  container: HTMLElement;
  zoneLabels: Record<ZoneId, string>;
  onZoneChange: (zone: ZoneId | null) => void;
};

// Sets up renderer, scene and game loop inside `container`. Call `dispose` to tear it all down.
export function createGame({ container, zoneLabels, onZoneChange }: GameOptions) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 45, 110);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);

  scene.add(new THREE.HemisphereLight("#ffffff", "#5a7d4a", 1.4));
  const sun = new THREE.DirectionalLight("#fff4e0", 2.2);
  sun.position.set(-18, 30, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 90 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const world = createWorld(scene, zoneLabels);
  const car = createCar(scene);
  const blocks = createTechBlocks(scene);
  const input = createInput(() => reset());

  function reset() {
    car.reset();
    blocks.reset();
  }

  // Portrait screens see less width, so pull the camera back a bit.
  let cameraScale = 1;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    cameraScale = camera.aspect < 1 ? 1.6 : 1;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  const cameraTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  camera.position.copy(CAMERA_OFFSET).multiplyScalar(cameraScale);
  camera.lookAt(0, 0, 0);

  let activeZone: ZoneId | null = null;
  const timer = new THREE.Timer();

  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 1 / 30); // avoid huge steps after a stalled frame
    const time = timer.getElapsed();

    car.update(dt, input.state, world.obstacles, time);
    blocks.update(dt, car);

    const zone = ZONES.find((z) => Math.hypot(car.position.x - z.x, car.position.z - z.z) < z.radius);
    const nextZone = zone?.id ?? null;
    if (nextZone !== activeZone) {
      activeZone = nextZone;
      onZoneChange(activeZone);
    }
    world.update(time, activeZone);

    // Smooth follow camera with a fixed viewing angle.
    desiredCamera.copy(CAMERA_OFFSET).multiplyScalar(cameraScale).add(car.position);
    camera.position.lerp(desiredCamera, 1 - Math.exp(-4 * dt));
    cameraTarget.lerp(car.position, 1 - Math.exp(-6 * dt));
    camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
  });

  return {
    // Used by on-screen touch buttons.
    setControl(control: Control, pressed: boolean) {
      input.state[control] = pressed;
    },
    reset,
    setZoneLabels: world.setZoneLabels,
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      input.dispose();
      timer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of materials) {
            (m as THREE.MeshStandardMaterial).map?.dispose();
            m.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export type Game = ReturnType<typeof createGame>;
