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

type FragmentTemplate = Pick<FragmentSpec, "kind" | "width" | "height">;
type FragmentStyle = CSSProperties & Record<`--${string}`, string>;

const fragmentTemplates: FragmentTemplate[] = [
  { kind: "white", width: 74, height: 46 },
  { kind: "white", width: 86, height: 55 },
  { kind: "white", width: 65, height: 79 },
  { kind: "white", width: 91, height: 50 },
  { kind: "white", width: 78, height: 53 },
  { kind: "white", width: 69, height: 84 },
  { kind: "white", width: 95, height: 48 },
  { kind: "white", width: 70, height: 62 },
  { kind: "white", width: 62, height: 70 },
  { kind: "white", width: 77, height: 43 },
  { kind: "white", width: 58, height: 71 },
  { kind: "white", width: 57, height: 75 },
  { kind: "yolk", width: 48, height: 40 },
  { kind: "yolk", width: 54, height: 36 },
  { kind: "yolk", width: 44, height: 52 },
  { kind: "yolk", width: 58, height: 38 },
  { kind: "yolk", width: 43, height: 47 },
  { kind: "yolk", width: 50, height: 34 },
  { kind: "yolk", width: 39, height: 45 },
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createBurstFragments(): FragmentSpec[] {
  const shuffledTemplates = [...fragmentTemplates];

  for (let index = shuffledTemplates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledTemplates[index], shuffledTemplates[swapIndex]] = [
      shuffledTemplates[swapIndex],
      shuffledTemplates[index],
    ];
  }

  const angleOffset = randomBetween(0, Math.PI * 2);
  const angleStep = (Math.PI * 2) / shuffledTemplates.length;

  return shuffledTemplates.map((fragment, index) => {
    const angle = angleOffset + index * angleStep + randomBetween(-0.18, 0.18);
    const distance =
      fragment.kind === "white"
        ? randomBetween(285, 430)
        : randomBetween(205, 345);

    return {
      ...fragment,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance * 0.78,
      rotation: randomBetween(-170, 170),
      delay: randomBetween(0, 0.11),
    };
  });
}

function fragmentStyle(fragment: FragmentSpec): FragmentStyle {
  return {
    "--piece-x": `${fragment.x}px`,
    "--piece-y": `${fragment.y}px`,
    "--piece-rotation": `${fragment.rotation}deg`,
    "--piece-width": `${fragment.width}px`,
    "--piece-height": `${fragment.height}px`,
    "--piece-delay": `${fragment.delay}s`,
  };
}

export default function FriedEgg() {
  const [burstFragments, setBurstFragments] = useState<FragmentSpec[]>([]);
  const burst = burstFragments.length > 0;
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
    };

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target;
      const hoveringEggShape =
        target instanceof Element &&
        target.closest(".egg-white, .egg-yolk, .egg-shine");
      if (!hoveringEggShape) {
        reset();
        return;
      }

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
      <div ref={motionRef} className="egg-motion" data-hovered="false">
        <button
          className="fried-egg-button"
          type="button"
          onClick={(event) => {
            const target = event.target;
            const clickedEggShape =
              target instanceof Element &&
              target.closest(".egg-white, .egg-yolk, .egg-shine");

            if (event.detail === 0 || clickedEggShape)
              setBurstFragments(createBurstFragments());
          }}
          onPointerMove={(event) => {
            const target = event.target;
            const hoveringEggShape =
              target instanceof Element &&
              target.closest(".egg-white, .egg-yolk, .egg-shine");
            if (motionRef.current)
              motionRef.current.dataset.hovered = hoveringEggShape
                ? "true"
                : "false";
          }}
          onPointerLeave={() => {
            if (motionRef.current) motionRef.current.dataset.hovered = "false";
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
          {burstFragments.map((fragment, index) => (
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
          onClick={() => setBurstFragments([])}
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
