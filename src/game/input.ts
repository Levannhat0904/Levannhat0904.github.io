export type Control = "forward" | "backward" | "left" | "right" | "brake";
export type InputState = Record<Control, boolean>;

const KEY_MAP: Record<string, Control> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "brake",
};

// Keyboard state shared with on-screen touch buttons, which write to the same `state`.
export function createInput(onReset: () => void) {
  const state: InputState = { forward: false, backward: false, left: false, right: false, brake: false };

  const isTyping = (e: KeyboardEvent) =>
    e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName);

  const onKeyDown = (e: KeyboardEvent) => {
    if (isTyping(e)) return;
    if (e.code === "KeyR") return onReset();
    const control = KEY_MAP[e.code];
    if (!control) return;
    e.preventDefault(); // keep arrows/space from scrolling the page
    state[control] = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const control = KEY_MAP[e.code];
    if (control) state[control] = false;
  };
  // Releasing keys while the tab is unfocused would otherwise leave them stuck.
  const releaseAll = () => {
    for (const k of Object.keys(state) as Control[]) state[k] = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", releaseAll);

  return {
    state,
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
    },
  };
}
