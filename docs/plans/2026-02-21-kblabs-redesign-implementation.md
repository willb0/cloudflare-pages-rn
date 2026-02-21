# KB Labs Website Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild kblabs.us from a placeholder static page into a professional, visually stunning full agency site with Spline 3D hero, scroll animations, and 9 content sections.

**Architecture:** Astro static site with Tailwind CSS v4 for styling, Spline for interactive 3D hero, GSAP + Lenis for scroll animations. Deployed on Cloudflare Pages via GitHub integration (auto-deploy on push to main). Zero-JS by default except interactive islands (Spline, GSAP).

**Tech Stack:** Astro, Tailwind CSS v4, Spline (@splinetool/runtime), GSAP + ScrollTrigger, Lenis, Cloudflare Pages

**Design Doc:** `docs/plans/2026-02-21-kblabs-redesign-design.md`

---

## Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `public/.assetsignore`
- Modify: `.gitignore`

**Step 1: Back up existing site**

Move old static files into an `_archive/` directory so nothing is lost but the root is clean for Astro.

```bash
cd /home/kblabs/DevCode/KBLABS/cloudflare-pages-rn
mkdir -p _archive
mv index.html style.css css/ js/ fonts/ img/ favicon.png _archive/
```

Keep these at root (Astro/Cloudflare need them):
- `functions/` (Cloudflare Pages Functions)
- `_headers` (Cloudflare Headers config)
- `robots.txt` (will be replaced)
- `sitemap.xml` (will be auto-generated)
- `README.md`
- `docs/`

**Step 2: Initialize Astro**

```bash
cd /home/kblabs/DevCode/KBLABS/cloudflare-pages-rn
npm create astro@latest . -- --template minimal --typescript strict --install --git --skip-houston
```

If prompted about existing files, choose to continue (we archived the old ones).

**Step 3: Install dependencies**

```bash
npm install @astrojs/cloudflare @astrojs/sitemap
npm install tailwindcss @tailwindcss/vite
npm install gsap lenis
npm install @splinetool/runtime
npm install lucide-astro
```

**Step 4: Configure `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kblabs.us',
  output: 'static',
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Step 5: Configure `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "_archive"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./src/components/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@styles/*": ["./src/styles/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

**Step 6: Update `.gitignore`**

Append to `.gitignore`:

```
node_modules/
dist/
.astro/
.cache/
_archive/
.wrangler/
*.env
.env.*
```

**Step 7: Create `public/.assetsignore`**

```
_worker.js
_routes.json
```

**Step 8: Move static assets to `public/`**

```bash
mkdir -p public/img public/fonts public/spline
cp _archive/favicon.png public/
cp _archive/img/logo.jpg public/img/
cp _archive/img/logo-white.jpg public/img/
cp _archive/img/preview.png public/img/
```

**Step 9: Verify project builds**

```bash
npm run build
```

Expected: Astro builds successfully to `dist/`.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: initialize Astro project with Cloudflare adapter and Tailwind v4"
```

---

## Task 2: Design System - Global Styles, Fonts, Layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/styles/animations.css`
- Create: `src/layouts/Layout.astro`
- Create: `public/fonts/` (font files)

**Step 1: Download variable font files**

```bash
cd /home/kblabs/DevCode/KBLABS/cloudflare-pages-rn
# Space Grotesk variable font
curl -L -o public/fonts/SpaceGrotesk-Variable.woff2 "https://github.com/floriankarsten/space-grotesk/raw/master/fonts/woff2/SpaceGrotesk%5Bwght%5D.woff2"

# Inter variable font - download from GitHub releases
curl -L -o /tmp/inter.zip "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip"
unzip -j /tmp/inter.zip "Inter-4.1/InterVariable.woff2" -d public/fonts/
```

If curl fails, manually download from:
- Space Grotesk: https://github.com/floriankarsten/space-grotesk
- Inter: https://github.com/rsms/inter/releases

**Step 2: Create `src/styles/global.css`**

```css
@import "tailwindcss";

/* ===== Design Tokens ===== */
@theme {
  /* Backgrounds */
  --color-bg-primary: #0A0A0F;
  --color-bg-surface: #141418;
  --color-bg-surface-high: #1E1E24;

  /* Brand Gold */
  --color-gold: #E0B234;
  --color-gold-light: #F0D060;
  --color-gold-dark: #B8922A;

  /* Text */
  --color-text-primary: #F5F0E8;
  --color-text-secondary: #9A9488;
  --color-text-muted: #5C5850;

  /* Fonts */
  --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

/* ===== Font Faces ===== */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 300 700;
  font-display: swap;
  src: url('/fonts/SpaceGrotesk-Variable.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/InterVariable.woff2') format('woff2');
}

/* ===== Base ===== */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Gradient Text ===== */
.gradient-headline {
  background: linear-gradient(135deg, #F5F0E8 0%, #E0B234 50%, #B8922A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== Glassmorphism ===== */
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(224, 178, 52, 0.2);
  box-shadow: 0 8px 32px rgba(224, 178, 52, 0.1);
}

/* ===== Buttons ===== */
.btn-primary {
  background: linear-gradient(135deg, #E0B234 0%, #B8922A 100%);
  color: #0A0A0F;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
}

.btn-primary:hover {
  box-shadow: 0 4px 24px rgba(224, 178, 52, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #E0B234;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 12px;
  border: 1px solid #E0B234;
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
}

.btn-secondary:hover {
  background: rgba(224, 178, 52, 0.1);
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 3: Create `src/styles/animations.css`**

```css
/* GSAP target classes */
.reveal {
  opacity: 0;
  transform: translateY(40px);
}

.reveal-left {
  opacity: 0;
  transform: translateX(-40px);
}

.reveal-right {
  opacity: 0;
  transform: translateX(40px);
}

.reveal-scale {
  opacity: 0;
  transform: scale(0.95);
}

/* Scroll chevron bounce */
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

/* Gold line fill for process timeline */
@keyframes line-fill {
  from { background-size: 0% 100%; }
  to { background-size: 100% 100%; }
}

/* Marquee scroll for credibility strip */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}
```

**Step 4: Create `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import '../styles/animations.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'KB Labs | Development Agency',
  description = 'KB Labs is a development agency innovating at the intersection of AI, Security, Software Engineering, and Data.',
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="robots" content="index, follow" />
    <meta name="description" content={description} />
    <meta name="keywords" content="KB Labs, AI, Security, Software Engineering, Data, Development Agency" />

    <title>{title}</title>

    <link rel="icon" type="image/png" href="/favicon.png" />

    <!-- Preload critical fonts -->
    <link rel="preload" href="/fonts/SpaceGrotesk-Variable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "KB Labs",
      "url": "https://kblabs.us",
      "description": description,
      "email": "mail@kblabs.us",
      "sameAs": []
    })} />
  </head>
  <body class="bg-bg-primary text-text-primary font-body">
    <slot />
  </body>
</html>
```

**Step 5: Verify build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/styles/ src/layouts/ public/fonts/
git commit -m "feat: add design system with colors, typography, glassmorphism, and Layout component"
```

---

## Task 3: Navbar Component

**Files:**
- Create: `src/components/Navbar.astro`

**Step 1: Create `src/components/Navbar.astro`**

```astro
---
const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];
---

<nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2">
      <img src="/img/logo-white.jpg" alt="KB Labs" class="h-8 w-auto" />
    </a>

    <!-- Desktop Nav Links -->
    <div class="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
        <a
          href={link.href}
          class="text-sm font-medium text-text-secondary hover:text-gold transition-colors duration-200"
        >
          {link.label}
        </a>
      ))}
    </div>

    <!-- CTA Button -->
    <div class="hidden md:block">
      <a href="#contact" class="btn-primary text-sm">Start a Project</a>
    </div>

    <!-- Mobile Hamburger -->
    <button
      id="mobile-menu-btn"
      class="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Toggle menu"
      aria-expanded="false"
    >
      <span class="block w-6 h-0.5 bg-text-primary transition-all duration-300" id="bar1"></span>
      <span class="block w-6 h-0.5 bg-text-primary transition-all duration-300" id="bar2"></span>
      <span class="block w-6 h-0.5 bg-text-primary transition-all duration-300" id="bar3"></span>
    </button>
  </div>

  <!-- Mobile Menu Overlay -->
  <div
    id="mobile-menu"
    class="fixed inset-0 bg-bg-primary/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center gap-8 opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"
  >
    {navLinks.map((link) => (
      <a
        href={link.href}
        class="mobile-nav-link text-2xl font-display font-semibold text-text-primary hover:text-gold transition-colors"
      >
        {link.label}
      </a>
    ))}
    <a href="#contact" class="btn-primary text-lg mt-4">Start a Project</a>
  </div>
</nav>

<script>
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Solid background on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('bg-bg-primary/90', 'backdrop-blur-md', 'shadow-lg');
      } else {
        navbar.classList.remove('bg-bg-primary/90', 'backdrop-blur-md', 'shadow-lg');
      }
    }
    lastScroll = scrollY;
  });

  // Mobile menu toggle
  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('opacity-100');
    if (isOpen) {
      mobileMenu?.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu?.classList.add('opacity-0', 'pointer-events-none');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      mobileMenu?.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu?.classList.add('opacity-100', 'pointer-events-auto');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close mobile menu on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu?.classList.add('opacity-0', 'pointer-events-none');
      menuBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
</script>
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "feat: add sticky navbar with mobile menu and scroll transparency"
```

---

## Task 4: Footer Component

**Files:**
- Create: `src/components/Footer.astro`

**Step 1: Create `src/components/Footer.astro`**

```astro
---
const currentYear = new Date().getFullYear();

const navColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Process', href: '#process' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'AI & ML', href: '#services' },
      { label: 'Cybersecurity', href: '#services' },
      { label: 'Software Engineering', href: '#services' },
      { label: 'Data Engineering', href: '#services' },
    ],
  },
];
---

<footer class="border-t border-white/5 bg-bg-primary">
  <div class="max-w-7xl mx-auto px-6 py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
      <!-- Brand Column -->
      <div class="md:col-span-2">
        <a href="/" class="inline-block mb-4">
          <img src="/img/logo-white.jpg" alt="KB Labs" class="h-8 w-auto" />
        </a>
        <p class="text-text-secondary text-sm max-w-sm leading-relaxed">
          Innovating at the intersection of AI, Security, Software Engineering, and Data.
        </p>
        <!-- Social Icons -->
        <div class="flex gap-4 mt-6">
          <a href="https://github.com" target="_blank" rel="noopener" class="text-text-muted hover:text-gold transition-colors" aria-label="GitHub">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="text-text-muted hover:text-gold transition-colors" aria-label="LinkedIn">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>

      <!-- Nav Columns -->
      {navColumns.map((col) => (
        <div>
          <h4 class="font-display font-semibold text-text-primary text-sm mb-4">{col.title}</h4>
          <ul class="space-y-3">
            {col.links.map((link) => (
              <li>
                <a href={link.href} class="text-text-secondary text-sm hover:text-gold transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-text-muted text-xs">
        &copy; {currentYear} KB Labs. All rights reserved.
      </p>
      <p class="text-text-muted text-xs">
        Built on Cloudflare
      </p>
    </div>
  </div>
</footer>
```

**Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add footer with nav columns, social links, and copyright"
```

---

## Task 5: Hero Section

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/SplineScene.astro`

**Step 1: Create `src/components/SplineScene.astro`**

This loads the Spline 3D scene lazily with a gradient fallback.

```astro
---
interface Props {
  sceneUrl: string;
}
const { sceneUrl } = Astro.props;
---

<div class="spline-container absolute inset-0 z-0">
  <!-- CSS gradient fallback shown while Spline loads -->
  <div id="spline-fallback" class="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-surface to-bg-primary">
    <div class="absolute inset-0 opacity-20" style="background: radial-gradient(circle at 30% 40%, rgba(224, 178, 52, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(224, 178, 52, 0.1) 0%, transparent 50%);"></div>
  </div>
  <canvas id="spline-canvas" class="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-1000" data-scene={sceneUrl}></canvas>
</div>

<script>
  async function loadSpline() {
    const canvas = document.getElementById('spline-canvas') as HTMLCanvasElement;
    const fallback = document.getElementById('spline-fallback');
    if (!canvas) return;

    const sceneUrl = canvas.dataset.scene;
    if (!sceneUrl) return;

    // Check for WebGL support
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return; // Keep fallback visible

    try {
      const { Application } = await import('@splinetool/runtime');
      const app = new Application(canvas);
      await app.load(sceneUrl);

      // Fade in the 3D scene
      canvas.classList.remove('opacity-0');
      canvas.classList.add('opacity-100');

      // Fade out fallback
      if (fallback) {
        fallback.classList.add('opacity-0');
        setTimeout(() => fallback.remove(), 1000);
      }
    } catch (err) {
      console.warn('Spline scene failed to load, keeping fallback:', err);
    }
  }

  // Lazy load: only init when hero is visible
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadSpline();
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  const container = document.querySelector('.spline-container');
  if (container) observer.observe(container);
</script>
```

**Step 2: Create `src/components/Hero.astro`**

```astro
---
import SplineScene from './SplineScene.astro';
---

<section id="hero" class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
  <!-- 3D Background -->
  <SplineScene sceneUrl="/spline/hero-scene.splinecode" />

  <!-- Content Overlay -->
  <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
    <h1 class="font-display font-bold gradient-headline text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-6">
      KB Labs
    </h1>
    <p class="text-text-secondary text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed">
      Innovating at the intersection of AI, Security, Software Engineering, and Data.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#contact" class="btn-primary text-base">Start a Project</a>
      <a href="#work" class="btn-secondary text-base">See Our Work</a>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
    <a href="#services" class="animate-bounce-subtle block text-text-muted hover:text-gold transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  </div>
</section>
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/Hero.astro src/components/SplineScene.astro
git commit -m "feat: add hero section with Spline 3D scene and gradient fallback"
```

---

## Task 6: Services Section

**Files:**
- Create: `src/components/Services.astro`

**Step 1: Create `src/components/Services.astro`**

```astro
---
const services = [
  {
    title: 'AI & Machine Learning',
    description: 'Intelligent systems powered by NLP, computer vision, and predictive analytics. We build models that solve real business problems.',
    icon: 'brain',
  },
  {
    title: 'Cybersecurity',
    description: 'Threat detection, penetration testing, and security architecture. Protecting your infrastructure with defense-in-depth strategies.',
    icon: 'shield',
  },
  {
    title: 'Software Engineering',
    description: 'Full-stack development, cloud infrastructure, API design, and DevOps. Scalable systems built with modern best practices.',
    icon: 'code',
  },
  {
    title: 'Data Engineering',
    description: 'Data pipelines, analytics platforms, real-time processing, and governance. Turning raw data into actionable intelligence.',
    icon: 'database',
  },
];

const iconPaths: Record<string, string> = {
  brain: 'M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  database: 'M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2z',
};
---

<section id="services" class="py-24 md:py-32 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        What We Build
      </h2>
      <p class="text-text-secondary text-lg max-w-xl mx-auto">
        End-to-end solutions across four core disciplines.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {services.map((service, i) => (
        <div
          class="glass-card p-8 group reveal"
          style={`--perspective: 800px; transition-delay: ${i * 100}ms;`}
        >
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
            <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d={iconPaths[service.icon]} />
            </svg>
          </div>

          <h3 class="font-display font-semibold text-xl text-text-primary mb-3">
            {service.title}
          </h3>
          <p class="text-text-secondary text-sm leading-relaxed">
            {service.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add src/components/Services.astro
git commit -m "feat: add services section with glassmorphism cards"
```

---

## Task 7: Featured Work Section

**Files:**
- Create: `src/components/FeaturedWork.astro`

**Step 1: Create `src/components/FeaturedWork.astro`**

```astro
---
const projects = [
  {
    title: 'Project Alpha',
    description: 'Enterprise-grade AI platform for predictive maintenance and anomaly detection.',
    tags: ['Python', 'TensorFlow', 'AWS', 'React'],
    image: '/img/preview.png',
  },
  {
    title: 'Project Beta',
    description: 'Zero-trust security architecture for a Fortune 500 financial services firm.',
    tags: ['Rust', 'Kubernetes', 'Terraform', 'CloudFlare'],
    image: '/img/preview.png',
  },
  {
    title: 'Project Gamma',
    description: 'Real-time data pipeline processing 10M+ events per day for e-commerce analytics.',
    tags: ['Apache Kafka', 'Spark', 'PostgreSQL', 'Go'],
    image: '/img/preview.png',
  },
];
---

<section id="work" class="py-24 md:py-32 px-6 bg-bg-surface">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        Selected Projects
      </h2>
      <p class="text-text-secondary text-lg max-w-xl mx-auto">
        Placeholder projects - real case studies with screenshots coming soon.
      </p>
    </div>

    <div class="space-y-8">
      {projects.map((project, i) => (
        <div class="glass-card overflow-hidden reveal" style={`transition-delay: ${i * 150}ms;`}>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Screenshot -->
            <div class="relative overflow-hidden bg-bg-surface-high">
              <div class="aspect-video lg:aspect-auto lg:h-full p-8 flex items-center justify-center">
                <div class="relative w-full max-w-md">
                  <!-- Browser mockup frame -->
                  <div class="rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                    <div class="bg-bg-surface-high px-4 py-2 flex items-center gap-2 border-b border-white/5">
                      <div class="flex gap-1.5">
                        <div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                      </div>
                    </div>
                    <img src={project.image} alt={project.title} class="w-full" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="p-8 lg:p-12 flex flex-col justify-center">
              <h3 class="font-display font-bold text-2xl text-text-primary mb-3">
                {project.title}
              </h3>
              <p class="text-text-secondary leading-relaxed mb-6">
                {project.description}
              </p>
              <div class="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span class="text-xs font-medium px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add src/components/FeaturedWork.astro
git commit -m "feat: add featured work section with placeholder projects"
```

---

## Task 8: Tech Stack, About, Testimonials, Process Sections

**Files:**
- Create: `src/components/TechStack.astro`
- Create: `src/components/About.astro`
- Create: `src/components/Testimonials.astro`
- Create: `src/components/Process.astro`

**Step 1: Create `src/components/TechStack.astro`**

```astro
---
const categories = [
  {
    name: 'Frontend',
    techs: ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'TypeScript'],
  },
  {
    name: 'Backend',
    techs: ['Python', 'Go', 'Rust', 'Node.js', 'PostgreSQL'],
  },
  {
    name: 'Infrastructure',
    techs: ['AWS', 'Cloudflare', 'Terraform', 'Kubernetes', 'Docker'],
  },
  {
    name: 'AI / ML',
    techs: ['PyTorch', 'TensorFlow', 'LangChain', 'OpenAI', 'Hugging Face'],
  },
];
---

<section id="tech" class="py-24 md:py-32 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        Our Toolkit
      </h2>
      <p class="text-text-secondary text-lg max-w-xl mx-auto">
        Modern technologies chosen for reliability and performance.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((cat, i) => (
        <div class="reveal" style={`transition-delay: ${i * 100}ms;`}>
          <h3 class="font-display font-semibold text-gold text-sm uppercase tracking-wider mb-4">
            {cat.name}
          </h3>
          <ul class="space-y-3">
            {cat.techs.map((tech) => (
              <li class="glass-card px-4 py-3 text-sm text-text-primary hover:border-gold/20 transition-all cursor-default">
                {tech}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Create `src/components/About.astro`**

```astro
<section id="about" class="py-24 md:py-32 px-6 bg-bg-surface">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <!-- Story -->
      <div class="reveal">
        <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-8">
          Who We Are
        </h2>
        <div class="space-y-4 text-text-secondary leading-relaxed">
          <p>
            KB Labs is a development agency built by engineers, for engineers.
            We specialize in solving complex technical challenges across AI,
            security, software engineering, and data.
          </p>
          <p>
            We believe in shipping quality over quantity. Every project gets
            our full attention, from architecture to deployment and beyond.
          </p>
        </div>
      </div>

      <!-- Values -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'Quality First', desc: 'We ship production-grade code, not prototypes.' },
          { title: 'Security Native', desc: 'Security is built in from day one, not bolted on.' },
          { title: 'Data Driven', desc: 'Decisions backed by evidence, not assumptions.' },
          { title: 'Always Learning', desc: 'We invest in staying at the cutting edge.' },
        ].map((value, i) => (
          <div class="glass-card p-6 reveal" style={`transition-delay: ${i * 100}ms;`}>
            <div class="w-2 h-2 rounded-full bg-gold mb-3"></div>
            <h3 class="font-display font-semibold text-text-primary text-sm mb-1">{value.title}</h3>
            <p class="text-text-secondary text-xs leading-relaxed">{value.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

**Step 3: Create `src/components/Testimonials.astro`**

```astro
---
const testimonials = [
  {
    quote: 'KB Labs transformed our data infrastructure. What used to take hours now runs in seconds.',
    name: 'Client Name',
    role: 'CTO, Company',
  },
  {
    quote: 'Their security audit uncovered vulnerabilities our previous team missed entirely. Exceptional work.',
    name: 'Client Name',
    role: 'VP Engineering, Company',
  },
  {
    quote: 'The AI solution they built exceeded our expectations. A true force multiplier for our team.',
    name: 'Client Name',
    role: 'Director of Product, Company',
  },
];
---

<section id="testimonials" class="py-24 md:py-32 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        What Clients Say
      </h2>
    </div>

    <div class="space-y-6">
      {testimonials.map((t, i) => (
        <div class="glass-card p-8 md:p-10 reveal" style={`transition-delay: ${i * 100}ms;`}>
          <blockquote class="text-text-primary text-lg md:text-xl leading-relaxed mb-6 font-light">
            "{t.quote}"
          </blockquote>
          <div>
            <p class="font-display font-semibold text-gold text-sm">{t.name}</p>
            <p class="text-text-muted text-xs">{t.role}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 4: Create `src/components/Process.astro`**

```astro
---
const steps = [
  { number: '01', title: 'Discover', description: 'Understanding your challenge and defining success criteria.' },
  { number: '02', title: 'Design', description: 'Architecture, prototyping, and technical specification.' },
  { number: '03', title: 'Build', description: 'Iterative development with continuous feedback loops.' },
  { number: '04', title: 'Deploy & Scale', description: 'Launch, monitoring, optimization, and ongoing support.' },
];
---

<section id="process" class="py-24 md:py-32 px-6 bg-bg-surface">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        Our Process
      </h2>
      <p class="text-text-secondary text-lg max-w-xl mx-auto">
        A proven approach to delivering results.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      {steps.map((step, i) => (
        <div class="relative reveal" style={`transition-delay: ${i * 150}ms;`}>
          <!-- Connecting line (hidden on last item) -->
          {i < steps.length - 1 && (
            <div class="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent z-0"></div>
          )}

          <div class="glass-card p-8 relative z-10 h-full">
            <span class="font-display font-bold text-3xl text-gold/30 mb-4 block">
              {step.number}
            </span>
            <h3 class="font-display font-semibold text-text-primary text-lg mb-2">
              {step.title}
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 5: Commit**

```bash
git add src/components/TechStack.astro src/components/About.astro src/components/Testimonials.astro src/components/Process.astro
git commit -m "feat: add tech stack, about, testimonials, and process sections"
```

---

## Task 9: Contact Section

**Files:**
- Create: `src/components/Contact.astro`

**Step 1: Create `src/components/Contact.astro`**

```astro
<section id="contact" class="py-24 md:py-32 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display font-bold text-4xl md:text-5xl gradient-headline inline-block mb-4">
        Let's Build Something
      </h2>
      <p class="text-text-secondary text-lg max-w-xl mx-auto">
        Ready to start a project? Tell us about your challenge.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <!-- Contact Form -->
      <div class="lg:col-span-3 reveal">
        <form class="space-y-6" action="https://formsubmit.co/mail@kblabs.us" method="POST">
          <input type="hidden" name="_subject" value="New Project Inquiry from kblabs.us" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="https://kblabs.us/#contact" />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-text-secondary text-sm mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                class="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:border-gold/50 focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label for="email" class="block text-text-secondary text-sm mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:border-gold/50 focus:outline-none transition-colors"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label for="company" class="block text-text-secondary text-sm mb-2">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              class="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:border-gold/50 focus:outline-none transition-colors"
              placeholder="Your company"
            />
          </div>

          <div>
            <label for="message" class="block text-text-secondary text-sm mb-2">Project Description</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              class="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:border-gold/50 focus:outline-none transition-colors resize-none"
              placeholder="Tell us about your project..."
            ></textarea>
          </div>

          <button type="submit" class="btn-primary text-base w-full sm:w-auto">
            Send Message
          </button>
        </form>
      </div>

      <!-- Contact Info -->
      <div class="lg:col-span-2 reveal-right">
        <div class="glass-card p-8 h-full">
          <h3 class="font-display font-semibold text-text-primary text-lg mb-6">Get in Touch</h3>

          <div class="space-y-6">
            <div>
              <p class="text-text-muted text-xs uppercase tracking-wider mb-1">Email</p>
              <a href="mailto:mail@kblabs.us" class="text-gold hover:text-gold-light transition-colors text-sm">
                mail@kblabs.us
              </a>
            </div>

            <div>
              <p class="text-text-muted text-xs uppercase tracking-wider mb-1">Response Time</p>
              <p class="text-text-primary text-sm">Within 24 hours</p>
            </div>

            <div>
              <p class="text-text-muted text-xs uppercase tracking-wider mb-1">Based In</p>
              <p class="text-text-primary text-sm">United States</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add src/components/Contact.astro
git commit -m "feat: add contact section with form and info card"
```

---

## Task 10: Index Page - Compose All Sections

**Files:**
- Create: `src/pages/index.astro`

**Step 1: Create `src/pages/index.astro`**

```astro
---
import Layout from '@layouts/Layout.astro';
import Navbar from '@components/Navbar.astro';
import Hero from '@components/Hero.astro';
import Services from '@components/Services.astro';
import FeaturedWork from '@components/FeaturedWork.astro';
import TechStack from '@components/TechStack.astro';
import About from '@components/About.astro';
import Testimonials from '@components/Testimonials.astro';
import Process from '@components/Process.astro';
import Contact from '@components/Contact.astro';
import Footer from '@components/Footer.astro';
---

<Layout>
  <Navbar />
  <main>
    <Hero />
    <Services />
    <FeaturedWork />
    <TechStack />
    <About />
    <Testimonials />
    <Process />
    <Contact />
  </main>
  <Footer />
</Layout>
```

**Step 2: Verify build and dev server**

```bash
npm run build
npm run dev
```

Visit `http://localhost:4321` and verify all sections render correctly.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: compose all sections into index page"
```

---

## Task 11: GSAP Scroll Animations + Lenis Smooth Scroll

**Files:**
- Create: `src/scripts/scroll.ts`
- Modify: `src/layouts/Layout.astro` (add scroll init script)

**Step 1: Create `src/scripts/scroll.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  // Initialize Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Reveal animations (fade up)
  gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Reveal from left
  gsap.utils.toArray<HTMLElement>('.reveal-left').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Reveal from right
  gsap.utils.toArray<HTMLElement>('.reveal-right').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: 40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  return lenis;
}
```

**Step 2: Add scroll init to `src/layouts/Layout.astro`**

Add before the closing `</body>` tag:

```astro
<script>
  import { initScroll } from '../scripts/scroll';

  // Only init if user hasn't requested reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initScroll();
  }
</script>
```

**Step 3: Verify animations work in dev**

```bash
npm run dev
```

Scroll through the page - sections should fade in as they enter the viewport.

**Step 4: Commit**

```bash
git add src/scripts/scroll.ts src/layouts/Layout.astro
git commit -m "feat: add GSAP scroll animations and Lenis smooth scroll"
```

---

## Task 12: SEO Fixes + Updated robots.txt + Middleware

**Files:**
- Create: `public/robots.txt` (overwrite old one)
- Modify: `functions/_middleware.js`
- Delete: old `sitemap.xml` (Astro auto-generates via @astrojs/sitemap)

**Step 1: Update `public/robots.txt`**

```
User-agent: *
Disallow: /cdn-cgi/

Sitemap: https://kblabs.us/sitemap-index.xml
```

**Step 2: Update `functions/_middleware.js`**

Update the meta description and title to real content:

```js
export async function onRequest(context) {
  const { request, next } = context;
  const res = await next();
  const { pathname } = new URL(request.url);

  if (!(pathname === "/index.html" || pathname === "/")) {
    return res;
  }

  const ogtag = `
    <meta property="og:title" content="KB Labs | Development Agency" />
    <meta property="og:description" content="Innovating at the intersection of AI, Security, Software Engineering, and Data." />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="https://kblabs.us/img/preview.png" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="KB Labs | Development Agency" />
    <meta name="twitter:description" content="Innovating at the intersection of AI, Security, Software Engineering, and Data." />
  `;

  class ElementHandler {
    constructor(content) {
      this.content = content;
    }
    element(element) {
      element.append(this.content, { html: true });
    }
  }

  return new HTMLRewriter()
    .on("head", new ElementHandler(ogtag))
    .transform(res);
}
```

**Step 3: Remove old `sitemap.xml`**

```bash
rm /home/kblabs/DevCode/KBLABS/cloudflare-pages-rn/sitemap.xml
```

Astro's `@astrojs/sitemap` integration will auto-generate `sitemap-index.xml` at build time.

**Step 4: Verify build generates sitemap**

```bash
npm run build
ls dist/sitemap*
```

Expected: `sitemap-index.xml` and `sitemap-0.xml` exist in `dist/`.

**Step 5: Commit**

```bash
git add public/robots.txt functions/_middleware.js
git rm sitemap.xml
git commit -m "fix: update SEO - real meta descriptions, correct sitemap URL, auto-generated sitemap"
```

---

## Task 13: Build Verification + Deploy Test

**Files:** None (verification only)

**Step 1: Full clean build**

```bash
rm -rf dist/ .astro/
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Preview locally**

```bash
npm run preview
```

Visit `http://localhost:4321` and verify:
- All 9 sections render
- Navbar is sticky and transparent → solid on scroll
- Mobile hamburger menu works
- Scroll animations fire on section entry
- Contact form layout correct
- Footer renders with all content
- No console errors

**Step 3: Check Lighthouse locally**

Open Chrome DevTools > Lighthouse > Run audit on `http://localhost:4321`

Target scores:
- Performance: 75+ (without Spline scene loaded)
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify build and prepare for deployment"
```

---

## Task 14: Spline 3D Scene (Separate Phase)

**This task requires manual work in the Spline editor** and is documented here for reference.

**Step 1: Design the scene in Spline**

Open https://spline.design and create a new project:
- Canvas: transparent background
- Objects: 3-5 floating geometric shapes (icosahedron, torus knot, sphere) in gold/amber material
- Lighting: warm point light (gold tint) + subtle ambient light
- Animation: gentle rotation loop on each object
- Interaction: "Follow Mouse" event on shapes for parallax effect
- Keep polygon count low (< 50k total) for mobile performance

**Step 2: Export the scene**

- Export > Code > Vanilla JS
- Download the `.splinecode` file
- Place at `public/spline/hero-scene.splinecode`

**Step 3: Test integration**

```bash
npm run dev
```

Verify the 3D scene loads in the hero section with the gradient fallback fading out.

**Step 4: Commit**

```bash
git add public/spline/hero-scene.splinecode
git commit -m "feat: add Spline 3D hero scene"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Initialize Astro project | None |
| 2 | Design system + Layout | Task 1 |
| 3 | Navbar component | Task 2 |
| 4 | Footer component | Task 2 |
| 5 | Hero section + Spline placeholder | Task 2 |
| 6 | Services section | Task 2 |
| 7 | Featured Work section | Task 2 |
| 8 | Tech Stack + About + Testimonials + Process | Task 2 |
| 9 | Contact section | Task 2 |
| 10 | Index page (compose all) | Tasks 3-9 |
| 11 | GSAP + Lenis scroll animations | Task 10 |
| 12 | SEO fixes | Task 10 |
| 13 | Build verification | Tasks 11-12 |
| 14 | Spline 3D scene (manual) | Task 13 |

Tasks 3-9 can be executed in parallel after Task 2 completes.
