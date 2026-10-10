import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BookOpenText,
  BriefcaseBusiness,
  CircleUserRound,
  Code2,
  ExternalLink,
  Mail,
  Maximize2,
  MousePointer2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import FriedEgg from "./FriedEgg";
import "./desktop.css";

type AppId = "work" | "writing" | "about" | "contact";

interface AppDefinition {
  id: AppId;
  label: string;
  subtitle: string;
  route: string;
  icon: LucideIcon;
  color: string;
}

interface WindowState {
  open: boolean;
  maximized: boolean;
  z: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type DesktopState = Record<AppId, WindowState>;
type Action =
  | { type: "open" | "focus" | "close" | "maximize"; id: AppId }
  | { type: "move"; id: AppId; x: number; y: number }
  | {
      type: "resize";
      id: AppId;
      width: number;
      height: number;
      x: number;
      y: number;
    }
  | { type: "tidy" };

const apps: AppDefinition[] = [
  {
    id: "about",
    label: "About me",
    subtitle: "About me",
    route: "/about/",
    icon: CircleUserRound,
    color: "var(--os-green)",
  },
  {
    id: "work",
    label: "Projects",
    subtitle: "Projects",
    route: "/work/",
    icon: BriefcaseBusiness,
    color: "var(--os-blue)",
  },
  {
    id: "writing",
    label: "Writing",
    subtitle: "Writing",
    route: "/writing/",
    icon: BookOpenText,
    color: "var(--os-yellow)",
  },
  {
    id: "contact",
    label: "Say hello",
    subtitle: "Say hello",
    route: "/contact/",
    icon: Mail,
    color: "var(--os-lilac)",
  },
];

const initialState: DesktopState = {
  about: {
    open: false,
    maximized: false,
    z: 2,
    x: 72,
    y: 58,
    width: 610,
    height: 432,
  },
  work: {
    open: false,
    maximized: false,
    z: 3,
    x: 650,
    y: 150,
    width: 530,
    height: 400,
  },
  writing: {
    open: false,
    maximized: false,
    z: 1,
    x: 410,
    y: 80,
    width: 550,
    height: 430,
  },
  contact: {
    open: false,
    maximized: false,
    z: 1,
    x: 520,
    y: 190,
    width: 470,
    height: 330,
  },
};

function nextZ(state: DesktopState) {
  return Math.max(...Object.values(state).map((window) => window.z)) + 1;
}

function reducer(state: DesktopState, action: Action): DesktopState {
  if (action.type === "tidy") {
    const positions: Record<AppId, [number, number]> = {
      about: [52, 52],
      work: [680, 92],
      writing: [260, 150],
      contact: [430, 260],
    };

    return Object.fromEntries(
      Object.entries(state).map(([id, window]) => [
        id,
        {
          ...window,
          x: positions[id as AppId][0],
          y: positions[id as AppId][1],
          maximized: false,
        },
      ]),
    ) as DesktopState;
  }

  const current = state[action.id];
  if (action.type === "open") {
    return {
      ...state,
      [action.id]: {
        ...current,
        open: true,
        z: nextZ(state),
      },
    };
  }
  if (action.type === "focus") {
    if (
      current.z === Math.max(...Object.values(state).map((window) => window.z))
    )
      return state;
    return { ...state, [action.id]: { ...current, z: nextZ(state) } };
  }
  if (action.type === "close")
    return {
      ...state,
      [action.id]: { ...current, open: false },
    };
  if (action.type === "maximize") {
    return {
      ...state,
      [action.id]: {
        ...current,
        maximized: !current.maximized,
        z: nextZ(state),
      },
    };
  }
  if (action.type === "move")
    return { ...state, [action.id]: { ...current, x: action.x, y: action.y } };
  if (action.type !== "resize") return state;
  return {
    ...state,
    [action.id]: {
      ...current,
      width: action.width,
      height: action.height,
      x: action.x,
      y: action.y,
    },
  };
}

function joinPath(base: string, route: string) {
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return route === "/" ? cleanBase : `${cleanBase}${route.replace(/^\/+/, "")}`;
}

function AppContent({
  id,
  basePath,
  open,
}: {
  id: AppId;
  basePath: string;
  open: (id: AppId) => void;
}) {
  if (id === "work") {
    return (
      <div className="work-app">
        <div className="app-heading">
          <div>
            <p className="os-overline">Selected project · 2026</p>
            <h2>A calmer personal website</h2>
          </div>
          <span className="status-pill">In progress</span>
        </div>
        <p>
          Editorial content meets an original desktop interface, built as a fast
          static site.
        </p>
        <a
          className="inline-link"
          href={joinPath(basePath, "/writing/building-with-less/")}
        >
          Read the build note <ExternalLink size={15} />
        </a>
      </div>
    );
  }

  if (id === "writing") {
    return (
      <div className="writing-app">
        <div className="app-heading">
          <div>
            <h2>Writing</h2>
          </div>
        </div>
        <a
          className="note-row"
          href={joinPath(basePath, "/writing/building-with-less/")}
        >
          <span className="note-date">30.08.26</span>
          <span>
            <strong>Building this site with less</strong>
            <small>Design, Astro, and deliberate migration.</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
        <p className="empty-note">
          More notes are being reviewed before they move in.
        </p>
      </div>
    );
  }

  if (id === "about") {
    return (
      <div className="about-app">
        <div>
          <div className="about-heading">
            <img
              src={joinPath(basePath, "/pigeon.svg")}
              alt=""
              width="140"
              height="140"
            />
            <h1>Hello, I&rsquo;m Lianne.</h1>
          </div>
          <p>
            I care about making complicated things more legible, useful, and
            human. This site is a growing record of selected work and ideas.
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => open("contact")}
          >
            Say hello <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-app">
      <h2>Let&rsquo;s make something interesting.</h2>
      <p>
        The best current place to find me is GitHub. More contact details can be
        added after review.
      </p>
      <a
        className="contact-link"
        href="https://github.com/Zhizhen-Lianne-Liu"
        target="_blank"
        rel="noreferrer"
      >
        <Code2 size={22} /> GitHub <ExternalLink size={16} />
      </a>
    </div>
  );
}

function WindowFrame({
  app,
  state,
  isDesktop,
  basePath,
  dispatch,
}: {
  app: AppDefinition;
  state: WindowState;
  isDesktop: boolean;
  basePath: string;
  dispatch: (action: Action) => void;
}) {
  const content = (
    <section
      className={`os-window ${state.maximized ? "is-maximized" : ""}`}
      aria-label={`${app.label} window`}
      onPointerDown={() => dispatch({ type: "focus", id: app.id })}
    >
      <div
        className="os-titlebar"
        onDoubleClick={() => dispatch({ type: "maximize", id: app.id })}
      >
        <div className="os-window-controls">
          <button
            className="control-close"
            type="button"
            aria-label={`Close ${app.label}`}
            onClick={() => dispatch({ type: "close", id: app.id })}
          >
            <X size={11} />
          </button>
          <button
            className="control-maximize"
            type="button"
            aria-label={`${state.maximized ? "Restore" : "Maximize"} ${app.label}`}
            onClick={() => dispatch({ type: "maximize", id: app.id })}
          >
            <Maximize2 size={10} />
          </button>
        </div>
        <div className="window-title">
          <app.icon size={15} />
          <span>{app.label}</span>
        </div>
        <a
          href={joinPath(basePath, app.route)}
          className="window-route"
          target="_blank"
          rel="noreferrer"
          aria-label={`Pop ${app.label} into a new tab`}
        >
          <ExternalLink size={13} />
        </a>
      </div>
      <div className="os-window-body">
        <AppContent
          id={app.id}
          basePath={basePath}
          open={(id) => dispatch({ type: "open", id })}
        />
      </div>
    </section>
  );

  if (!isDesktop) return <div className="mobile-window">{content}</div>;

  if (state.maximized) {
    return (
      <div className="maximized-window" style={{ zIndex: state.z }}>
        {content}
      </div>
    );
  }

  return (
    <Rnd
      bounds=".os-wallpaper"
      cancel="button,a,.os-window-body"
      dragHandleClassName="os-titlebar"
      minWidth={340}
      minHeight={250}
      position={{ x: state.x, y: state.y }}
      size={{ width: state.width, height: state.height }}
      style={{ zIndex: state.z }}
      onDragStart={() => dispatch({ type: "focus", id: app.id })}
      onDragStop={(_, data) =>
        dispatch({ type: "move", id: app.id, x: data.x, y: data.y })
      }
      onResizeStart={() => dispatch({ type: "focus", id: app.id })}
      onResizeStop={(_, __, element, ___, position) =>
        dispatch({
          type: "resize",
          id: app.id,
          width: element.offsetWidth,
          height: element.offsetHeight,
          x: position.x,
          y: position.y,
        })
      }
    >
      {content}
    </Rnd>
  );
}

function Menu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="menu-trigger">
        {label}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="menu-content"
          sideOffset={7}
          align="start"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function DesktopShell({
  basePath = "/",
}: {
  basePath?: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isDesktop, setIsDesktop] = useState(false);
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 860px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const openApp = (id: AppId) => dispatch({ type: "open", id });
  const openApps = apps.filter((app) => state[app.id].open);

  return (
    <div className="os-shell">
      <header className="os-menubar">
        <div className="menu-left">
          <button
            className="os-mark"
            type="button"
            aria-label="Open About me"
            onClick={() => openApp("about")}
          >
            <img
              src={joinPath(basePath, "/pigeon.svg")}
              alt=""
              width="30"
              height="30"
            />
          </button>
          <Menu label="Lianne">
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => openApp("about")}
            >
              About me
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => openApp("contact")}
            >
              Say hello
            </DropdownMenu.Item>
          </Menu>
          <Menu label="Go">
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => openApp("work")}
            >
              Projects
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => openApp("writing")}
            >
              Writing
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => openApp("about")}
            >
              About me
            </DropdownMenu.Item>
          </Menu>
          <Menu label="View">
            <DropdownMenu.Item
              className="menu-item"
              onSelect={() => dispatch({ type: "tidy" })}
            >
              Tidy windows
            </DropdownMenu.Item>
          </Menu>
        </div>
        <div className="menu-right">
          <span className="desktop-hint">
            <MousePointer2 size={13} /> windows move
          </span>
          <span>{clock}</span>
        </div>
      </header>

      <main className="os-wallpaper">
        <FriedEgg />
        <div className="desktop-shortcuts" aria-label="Desktop shortcuts">
          {apps.map((app) => (
            <a
              key={app.id}
              href={joinPath(basePath, app.route)}
              className="desktop-shortcut"
              onClick={(event) => {
                event.preventDefault();
                openApp(app.id);
              }}
            >
              <span className="shortcut-icon" style={{ background: app.color }}>
                <app.icon size={31} strokeWidth={1.8} />
              </span>
              <span>{app.label}</span>
            </a>
          ))}
        </div>

        <div className="window-layer">
          {openApps.map((app) => (
            <WindowFrame
              key={app.id}
              app={app}
              state={state[app.id]}
              isDesktop={isDesktop}
              basePath={basePath}
              dispatch={dispatch}
            />
          ))}
        </div>

        <nav className="os-dock" aria-label="Applications">
          {apps.map((app) => {
            const Icon = app.icon;
            const active = state[app.id].open;
            return (
              <button
                key={app.id}
                type="button"
                className={active ? "is-active" : ""}
                aria-label={`Open ${app.label}`}
                aria-pressed={active}
                onClick={() => openApp(app.id)}
              >
                <span style={{ background: app.color }}>
                  <Icon size={24} />
                </span>
                <small>{app.subtitle}</small>
              </button>
            );
          })}
          <i aria-hidden="true"></i>
          <a
            href="https://github.com/Zhizhen-Lianne-Liu"
            target="_blank"
            rel="noreferrer"
            aria-label="Lianne on GitHub"
          >
            <span>
              <Code2 size={24} />
            </span>
            <small>GitHub</small>
          </a>
        </nav>
      </main>
    </div>
  );
}
