export interface Project {
  title: string;
  summary: string;
  status: string;
  year: string;
  tags: string[];
  href?: string;
}

export const projects: Project[] = [
  {
    title: "A calmer personal website",
    summary:
      "A ground-up redesign focused on editorial clarity, lightweight delivery, and a deployment path that is easy to understand and reverse.",
    status: "In progress",
    year: "2026",
    tags: ["Design system", "Astro", "Accessibility"],
    href: "/writing/building-with-less/",
  },
];
