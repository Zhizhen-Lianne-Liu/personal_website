import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./fried-egg.css";

interface FragmentSpec {
  kind: "white" | "yolk";
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  delay: number;
  meldX: number;
  meldY: number;
  meldRotation: number;
}

interface FragmentDrag {
  index: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPieceX: number;
  startPieceY: number;
  startRotation: number;
}

type EggPhase = "ready" | "burst" | "reforming";

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

function createBurstFragments(impactDistance: number): FragmentSpec[] {
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
  const scatterScale = 0.72 + impactDistance * 0.72;
  let whiteIndex = 0;
  let yolkIndex = 0;

  return shuffledTemplates.map((fragment, index) => {
    const angle = angleOffset + index * angleStep + randomBetween(-0.18, 0.18);
    const distance =
      fragment.kind === "white"
        ? randomBetween(285, 430)
        : randomBetween(205, 345);
    const kindIndex = fragment.kind === "white" ? whiteIndex++ : yolkIndex++;
    const kindCount = fragment.kind === "white" ? 12 : 7;
    const meldAngle = (kindIndex / kindCount) * Math.PI * 2;
    const meldRadiusX =
      fragment.kind === "white"
        ? randomBetween(100, 126)
        : randomBetween(22, 34);
    const meldRadiusY =
      fragment.kind === "white" ? randomBetween(62, 82) : randomBetween(16, 26);

    return {
      ...fragment,
      x: Math.cos(angle) * distance * scatterScale,
      y: Math.sin(angle) * distance * 0.78 * scatterScale,
      rotation: randomBetween(-170, 170),
      delay: randomBetween(0, 0.11),
      meldX: Math.cos(meldAngle) * meldRadiusX,
      meldY: Math.sin(meldAngle) * meldRadiusY,
      meldRotation: randomBetween(-18, 18),
    };
  });
}

function getImpactDistance(clientX: number, clientY: number, eggRect: DOMRect) {
  const radiusX = Math.max(1, eggRect.width / 2);
  const radiusY = Math.max(1, eggRect.height / 2);
  const normalizedX = (clientX - (eggRect.left + radiusX)) / radiusX;
  const normalizedY = (clientY - (eggRect.top + radiusY)) / radiusY;

  return Math.min(1, Math.hypot(normalizedX, normalizedY));
}

function fragmentStyle(fragment: FragmentSpec): FragmentStyle {
  return {
    "--piece-x": `${fragment.x}px`,
    "--piece-y": `${fragment.y}px`,
    "--piece-rotation": `${fragment.rotation}deg`,
    "--piece-width": `${fragment.width}px`,
    "--piece-height": `${fragment.height}px`,
    "--piece-delay": `${fragment.delay}s`,
    "--piece-return-delay": `${fragment.delay * 0.5}s`,
    "--piece-meld-x": `${fragment.meldX}px`,
    "--piece-meld-y": `${fragment.meldY}px`,
    "--piece-meld-rotation": `${fragment.meldRotation}deg`,
  };
}

export default function FriedEgg() {
  const [burstFragments, setBurstFragments] = useState<FragmentSpec[]>([]);
  const [phase, setPhase] = useState<EggPhase>("ready");
  const sceneRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HTMLDivElement>(null);
  const fragmentDragRef = useRef<FragmentDrag | null>(null);
  const reformTimerRef = useRef(0);

  const startFragmentDrag = (
    event: ReactPointerEvent<HTMLSpanElement>,
    index: number,
  ) => {
    const fragment = burstFragments[index];
    if (!fragment) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
    fragmentDragRef.current = {
      index,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPieceX: fragment.x,
      startPieceY: fragment.y,
      startRotation: fragment.rotation,
    };
  };

  const moveFragment = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = fragmentDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    setBurstFragments((currentFragments) =>
      currentFragments.map((fragment, index) =>
        index === drag.index
          ? {
              ...fragment,
              x: drag.startPieceX + deltaX,
              y: drag.startPieceY + deltaY,
              rotation: drag.startRotation + deltaX * 0.18,
            }
          : fragment,
      ),
    );
  };

  const endFragmentDrag = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = fragmentDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    fragmentDragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const motion = motionRef.current;
    if (!scene || !motion || phase !== "ready") return;

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
      reset();
    };
  }, [phase]);

  useEffect(
    () => () => {
      window.clearTimeout(reformTimerRef.current);
    },
    [],
  );

  const reformEgg = () => {
    fragmentDragRef.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBurstFragments([]);
      setPhase("ready");
      return;
    }

    setPhase("reforming");
    window.clearTimeout(reformTimerRef.current);
    reformTimerRef.current = window.setTimeout(() => {
      setBurstFragments([]);
      setPhase("ready");
    }, 840);
  };

  return (
    <div ref={sceneRef} className={`fried-egg-scene is-${phase}`}>
      <svg
        className="egg-filter-definitions"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="egg-fragment-goo"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div ref={motionRef} className="egg-motion" data-hovered="false">
        <button
          className="fried-egg-button"
          type="button"
          onClick={(event) => {
            const target = event.target;
            const clickedEggShape =
              target instanceof Element &&
              target.closest(".egg-white, .egg-yolk, .egg-shine");

            if (event.detail === 0 || clickedEggShape) {
              const impactDistance =
                event.detail === 0 || !motionRef.current
                  ? 0
                  : getImpactDistance(
                      event.clientX,
                      event.clientY,
                      motionRef.current.getBoundingClientRect(),
                    );
              setBurstFragments(createBurstFragments(impactDistance));
              setPhase("burst");
            }
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
          disabled={phase !== "ready"}
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

      {burstFragments.length > 0 && (
        <div className="egg-fragments" aria-hidden="true">
          {burstFragments.map((fragment, index) => (
            <span
              key={`${fragment.kind}-${index}`}
              className={`egg-fragment fragment-${fragment.kind}`}
              style={fragmentStyle(fragment)}
              onPointerDown={(event) => startFragmentDrag(event, index)}
              onPointerMove={moveFragment}
              onPointerUp={endFragmentDrag}
              onPointerCancel={endFragmentDrag}
            ></span>
          ))}
        </div>
      )}

      {phase === "burst" && (
        <button className="egg-reset" type="button" onClick={reformEgg}>
          Fry another egg
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {phase === "burst"
          ? "The fried egg burst into pieces."
          : phase === "reforming"
            ? "The egg pieces are melding back together."
            : "The fried egg is ready."}
      </span>
    </div>
  );
}
