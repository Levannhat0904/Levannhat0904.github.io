import * as THREE from "three";

const FONT = "600 64px system-ui, -apple-system, 'Segoe UI', sans-serif";

// Billboard text label drawn on a canvas, so no font files need to be loaded.
export function createLabelSprite(text: string, accent: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);

  const draw = (value: string) => {
    ctx.font = FONT;
    const width = Math.ceil(ctx.measureText(value).width) + 96;
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    // Pill background with an accent border.
    ctx.fillStyle = "rgba(10, 10, 11, 0.82)";
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, height - 6, (height - 6) / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = FONT;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, width / 2, height / 2 + 4);

    texture.needsUpdate = true;
    const worldHeight = 1.1;
    sprite.scale.set((worldHeight * width) / height, worldHeight, 1);
  };

  draw(text);
  return { sprite, setText: draw };
}
