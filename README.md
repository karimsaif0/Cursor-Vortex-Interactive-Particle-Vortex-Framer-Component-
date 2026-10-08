# 🌀 Cursor Vortex
### Interactive Particle Vortex · Framer Code Component

**Turn your cursor into a miniature black hole.** Cursor Vortex is a customizable, canvas-powered Framer component where glowing digital particles orbit, swirl, and react to your pointer. Press and hold to charge the vortex, then release to scatter particles across the scene.

[**✨ Live Demo**](https://cursorvortex.framer.website/) · [**👨‍💻 Creator on X**](https://x.com/karimsaif0)

---

## Experience it live

**[cursorvortex.framer.website](https://cursorvortex.framer.website/)**

Move your cursor to attract and spin the particles. **Press and hold** to amplify the gravity, then **release** for an energetic burst.

## ✨ Highlights

- **Interactive particle physics** — attraction, orbital motion, drag, swirl, and turbulence
- **Hold-to-charge interaction** — strengthen the vortex, then fling particles outward
- **4 particle styles** — Mixed, Glyphs, Pixels, and Dots
- **5 curated color palettes + Custom** — Event Horizon, Cyber, Plasma, Solar, Mono, and your own colors
- **Glowing core and elliptical ring** — optional black-hole center with luminous detailing
- **Motion trails** — configurable length and opacity
- **Idle demo animation** — animated movement when there's no pointer interaction
- **Detailed Framer property controls** — tune the look and physics directly in the right sidebar
- **Static preview and reduced-motion support** — uses Framer static-rendering and reduced-motion hooks
- **Viewport-aware runtime** — pauses animation when offscreen or when the page is hidden; pixel ratio is capped at 2
- **Touch control** — touch interaction can be enabled; default behavior preserves mobile scrolling

## 🧲 Ideal for

Creative portfolios · Interactive hero sections · Digital agencies · Futuristic SaaS and AI websites · Experimental design projects · Gaming and technology landing pages

## 🚀 Use in Framer

1. Open your **Framer** project.
2. Create a new **Code Component** named `KarimSaifCursorVortex.tsx`.
3. Copy the contents of [`KarimSaifCursorVortex.tsx`](./KarimSaifCursorVortex.tsx) into the component.
4. Drag the component onto the canvas and resize it to fit your section.
5. Customize its appearance and behavior from the Framer property panel.
6. Preview or publish your project to experience the pointer interaction.

**Requirements:** A Framer project supporting TypeScript/React code components. The component imports its Framer-specific controls and hooks from `framer`; no separate visual library is required.

## 🎛 Customize your vortex

| Group | Controls |
| --- | --- |
| **Colors** | Background, palette preset, custom primary/secondary/accent colors |
| **Particles** | Count, shape, size, variation, glyph mix, pixel snapping |
| **Physics** | Field radius, core radius, orbit strength, attraction, swirl, turbulence, drag |
| **Interaction** | Hold power, charge speed, release force, release scatter, release lift |
| **Lighting** | Particle glow, glow opacity, core display, core size, orbital ring |
| **Motion** | Trail display, length and opacity, speed, idle demo, delay |
| **Performance & layout** | Touch interaction, adaptive quality, corner radius |

### Color presets

- **Event Horizon** — white and deep purple
- **Cyber** — electric cyan, violet, and pink
- **Plasma** — bright white, magenta, and ultraviolet
- **Solar** — warm yellow, orange, and red
- **Mono** — white and cool grayscale
- **Custom** — make your own color palette

## ⚙️ Engineering notes

Cursor Vortex uses a 2D HTML canvas and pointer events. The implementation includes `ResizeObserver` for responsive sizing, `IntersectionObserver` for offscreen pausing, and `visibilitychange` handling to avoid running the animation in hidden browser tabs.

It provides a static frame for Framer static rendering and reduced-motion preferences, plus a DPR cap and optional adaptive trail quality. Device performance varies, so test heavier particle/glow settings on your target devices.

## 🛟 Support & feedback

Have an idea, question, or issue? Reach out:

- **X:** [@karimsaif0](https://x.com/karimsaif0)
- **Email:** [karimsaif010@gmail.com](mailto:karimsaif010@gmail.com)
- **Live preview:** [Cursor Vortex](https://cursorvortex.framer.website/)

---

**Made with 💛 by Karim Saif**  
*Crafted for designers who want websites to feel alive.*
