---
title: "Building this site with less"
description: "A short note on choosing a small static stack and being deliberate about what gets migrated."
publishedAt: 2026-08-30
tags:
  - Design
  - Astro
  - Process
draft: false
---

Personal websites have a habit of accumulating layers: an old build system, experiments that became permanent, and pages that no longer reflect their author. This rebuild starts from a different premise: **every part of the site has to earn its place**.

## Static by default

Astro turns the site into ordinary HTML, CSS, and assets at build time. That is a good match for a portfolio and collection of writing. There is no application server to maintain, and pages do not depend on JavaScript to be useful.

JavaScript is still available when an interaction genuinely needs it. The distinction is that it is a choice rather than the baseline cost of every page.

## Content is not luggage

The rebuild does not automatically bring every old page along. Existing articles will be reviewed individually. Experiments can remain archived, and claims will be rewritten when the implementation no longer supports them.

> A clean repository is useful, but a clear editorial point of view matters more.

## Room to evolve

The first release is deliberately compact: work, writing, about, and contact. Structured Markdown leaves room for longer case studies, and Astro can host interactive components later without turning the entire site into a client-side application.

For now, the aim is simple: a fast, legible place that feels considered on a phone as well as a large screen.
