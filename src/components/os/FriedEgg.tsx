import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./fried-egg.css";

interface FragmentSpec {
  kind: "white" | "yolk";
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  delay: number;
}

type FragmentStyle = CSSProperties & Record<`--${string}`, string>;

const fragments: FragmentSpec[] = [
  {
    kind: "white",
    x: -238,
    y: -132,
    rotation: -48,
    width: 74,
    height: 46,
    delay: 0,
  },
  {
    kind: "white",
    x: -188,
    y: 74,
    rotation: 31,
    width: 86,
    height: 55,
    delay: 0.03,
  },
  {
    kind: "white",
    x: -112,
    y: -181,
    rotation: -18,
    width: 65,
    height: 79,
    delay: 0.06,
  },
  {
    kind: "white",
    x: -54,
    y: 149,
    rotation: 74,
    width: 91,
    height: 50,
    delay: 0.02,
  },
  {
    kind: "white",
    x: 42,
    y: -196,
    rotation: 22,
    width: 78,
    height: 53,
    delay: 0.05,
  },
  {
    kind: "white",
    x: 112,
    y: 143,
    rotation: -37,
    width: 69,
    height: 84,
    delay: 0.08,
  },
  {
    kind: "white",
    x: 184,
    y: -111,
    rotation: 56,
    width: 95,
    height: 48,
    delay: 0.02,
  },
  {
    kind: "white",
    x: 241,
    y: 44,
    rotation: 19,
    width: 70,
    height: 62,
    delay: 0.07,
  },
  {
    kind: "white",
    x: -257,
    y: 12,
    rotation: -9,
    width: 62,
    height: 70,
    delay: 0.09,
  },
  {
    kind: "white",
    x: 208,
    y: 126,
    rotation: 101,
    width: 77,
    height: 43,
    delay: 0.04,
  },
  {
    kind: "white",
    x: -145,
    y: 154,
    rotation: -81,
    width: 58,
    height: 71,
    delay: 0.1,
  },
  {
    kind: "white",
    x: 132,
    y: -174,
    rotation: 42,
    width: 57,
    height: 75,
    delay: 0.08,
  },
  {
    kind: "yolk",
    x: -130,
    y: -83,
    rotation: -28,
    width: 48,
    height: 40,
    delay: 0.02,
  },
  {
    kind: "yolk",
    x: -82,
    y: 91,
    rotation: 49,
    width: 54,
    height: 36,
    delay: 0.07,
  },
  {
    kind: "yolk",
    x: -23,
    y: -122,
    rotation: 11,
    width: 44,
    height: 52,
    delay: 0.04,
  },
  {
    kind: "yolk",
    x: 51,
    y: 109,
    rotation: -61,
    width: 58,
    height: 38,
    delay: 0,
  },
  {
    kind: "yolk",
    x: 109,
    y: -74,
    rotation: 37,
    width: 43,
    height: 47,
    delay: 0.09,
  },
  {
    kind: "yolk",
    x: 149,
    y: 42,
    rotation: 83,
    width: 50,
    height: 34,
    delay: 0.05,
  },
  {
    kind: "yolk",
    x: 15,
    y: 162,
    rotation: 18,
    width: 39,
    height: 45,
    delay: 0.1,
  },
];

function fragmentStyle(fragment: FragmentSpec): FragmentStyle {
  const scatterMultiplier = 1.55;
  return {
    "--piece-x": `${fragment.x * scatterMultiplier}px`,
    "--piece-y": `${fragment.y * scatterMultiplier}px`,
    "--piece-rotation": `${fragment.rotation}deg`,
    "--piece-width": `${fragment.width}px`,
    "--piece-height": `${fragment.height}px`,
    "--piece-delay": `${fragment.delay}s`,
  };
}

export default function FriedEgg() {
  const [burst, setBurst] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const motion = motionRef.current;
    if (!scene || !motion || burst) return;

    const precisePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!precisePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      motion.style.setProperty("--egg-x", "0px");
      motion.style.setProperty("--egg-y", "0px");
      motion.style.setProperty("--egg-rotate", "0deg");
      motion.style.setProperty("--yolk-x", "0px");
      motion.style.setProperty("--yolk-y", "0px");
      motion.dataset.nearby = "false";
    };

    const update = () => {
      frame = 0;
      const eggRect = motion.getBoundingClientRect();
      const centerX = eggRect.left + eggRect.width / 2;
      const centerY = eggRect.top + eggRect.height / 2;
      const deltaX = pointerX - centerX;
      const deltaY = pointerY - centerY;
      const distance = Math.max(1, Math.hypot(deltaX, deltaY));
      const proximity = Math.max(0, 1 - distance / 460);

      if (proximity === 0) {
        reset();
        return;
      }

      const directionX = deltaX / distance;
      const directionY = deltaY / distance;
      motion.style.setProperty("--egg-x", `${-directionX * proximity * 22}px`);
      motion.style.setProperty("--egg-y", `${-directionY * proximity * 16}px`);
      motion.style.setProperty(
        "--egg-rotate",
        `${directionX * proximity * -5}deg`,
      );
      motion.style.setProperty("--yolk-x", `${directionX * proximity * 17}px`);
      motion.style.setProperty("--yolk-y", `${directionY * proximity * 12}px`);
      motion.dataset.nearby = proximity > 0.32 ? "true" : "false";
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", reset);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [burst]);

  return (
    <div
      ref={sceneRef}
      className={`fried-egg-scene ${burst ? "is-burst" : ""}`}
    >
      <div ref={motionRef} className="egg-motion" data-nearby="false">
        <button
          className="fried-egg-button"
          type="button"
          onClick={(event) => {
            const target = event.target;
            const clickedEggShape =
              target instanceof Element &&
              target.closest(".egg-white, .egg-yolk, .egg-shine");

            if (event.detail === 0 || clickedEggShape) setBurst(true);
          }}
          disabled={burst}
          aria-label="Burst the fried egg"
        >
          <svg viewBox="0 0 430 310" role="img" aria-label="A jiggly fried egg">
            <path
              className="egg-white"
              d="M34 167C10 116 66 79 122 73C161 69 169 15 224 24C278 33 282 76 332 78C384 80 416 118 393 162C371 205 404 249 350 274C303 296 269 259 221 274C170 290 145 259 99 268C47 278 18 222 34 167Z"
            />
            <g className="egg-yolk-group">
              <path
                className="egg-yolk"
                d="M148 154C148 102 188 73 238 83C287 93 304 138 281 184C258 229 195 228 160 196C148 184 144 169 148 154Z"
              />
              <ellipse
                className="egg-shine"
                cx="209"
                cy="112"
                rx="25"
                ry="13"
              />
            </g>
          </svg>
        </button>
      </div>

      {burst && (
        <div className="egg-fragments" aria-hidden="true">
          {fragments.map((fragment, index) => (
            <span
              key={`${fragment.kind}-${index}`}
              className={`egg-fragment fragment-${fragment.kind}`}
              style={fragmentStyle(fragment)}
            ></span>
          ))}
        </div>
      )}

      {burst && (
        <button
          className="egg-reset"
          type="button"
          onClick={() => setBurst(false)}
        >
          Fry another egg
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {burst ? "The fried egg burst into pieces." : "The fried egg is ready."}
      </span>
    </div>
  );
}
