# KB Labs Website Redesign - Design Document

**Date:** 2026-02-21
**Status:** Approved
**Domain:** https://kblabs.us/
**Repo:** willb0/cloudflare-pages-rn

---

## Overview

Full redesign of the KB Labs development agency website from a minimal single-page placeholder to a professional, visually stunning full agency site with interactive 3D elements, smooth scroll animations, and comprehensive content sections.

## Current State

- Single-page static HTML site (182 lines) hosted on Cloudflare Pages
- Two content blocks: hero with gradient text + "Get in Touch" CTA
- Forked from DavidJKTofan/cloudflare-pages-template, customized Aug 2024
- Zero-build deployment (raw HTML/CSS/JS pushed to Cloudflare Pages via GitHub integration)
- Multiple SEO/meta issues (placeholder descriptions, broken sitemap URL, missing www DNS)
- No footer, no services detail, no portfolio, no forms, no social links

## Deployment Architecture (Unchanged)

```
GitHub (willb0/cloudflare-pages-rn) → push to main
       |
Cloudflare Pages (Astro build → static output)
       |
Edge: functions/_middleware.js (HTMLRewriter injects OG tags)
       |
DNS: kblabs.us → Cloudflare anycast IPs (proxied A records)
     Nameservers: izabella/damon.ns.cloudflare.com
```

The deployment pipeline stays on Cloudflare Pages. The key change is adding an **Astro build step** (Cloudflare Pages runs `astro build` on push). The Cloudflare Pages adapter for Astro handles this natively.

## Design Decisions

### Framework: Astro

- Ships zero JavaScript to the browser by default
- Native Cloudflare Pages adapter (`@astrojs/cloudflare`)
- Component islands: Spline 3D loads as an isolated interactive island
- Tailwind v4 integration via `@astrojs/tailwind`
- File-based routing for future multi-page expansion

### CSS: Tailwind CSS v4

- Native 3D utilities (`perspective`, `rotate-x`, `translate-z`, `transform-3d`)
- Zero runtime overhead (static CSS generation)
- Design token consistency across all sections
- Arbitrary value support for fine-tuning 3D effects

### 3D Hero: Spline (Self-Hosted)

- Interactive 3D scene responding to mouse movement
- Self-hosted runtime.js + .splinecode file (eliminates third-party latency)
- Lazy-loaded with CSS gradient fallback matching dark+gold palette
- Explicit dimensions pre-set to prevent CLS
- Brotli compressed (~550KB total)

### Scroll Animations: GSAP + ScrollTrigger + Lenis

- GSAP ScrollTrigger for section reveal animations (fade, slide, scale)
- Lenis for smooth momentum scrolling
- Loaded as Astro islands, not blocking initial render

### Visual Aesthetic: Dark + Gold (Brand Evolution)

Evolving the existing black-to-gold (#000000 to #e0b234) into a refined premium dark palette.

## Design System

### Color Palette

```css
/* Backgrounds */
--bg-primary:      #0A0A0F;   /* deep near-black, warm undertone */
--bg-surface:      #141418;   /* card/section backgrounds */
--bg-surface-high: #1E1E24;   /* elevated elements, hover states */

/* Brand Gold */
--gold-primary:    #E0B234;   /* from current brand */
--gold-light:      #F0D060;   /* highlights, hover accents */
--gold-dark:       #B8922A;   /* pressed states, borders */

/* Text */
--text-primary:    #F5F0E8;   /* warm near-white */
--text-secondary:  #9A9488;   /* muted body text, warm gray */
--text-muted:      #5C5850;   /* subtle labels */

/* Utility */
--border:          rgba(224, 178, 52, 0.12);  /* subtle gold border */
--glass-bg:        rgba(255, 255, 255, 0.04); /* glassmorphism fill */
--glass-border:    rgba(255, 255, 255, 0.08); /* glassmorphism stroke */
```

### Gradient Effects

```css
/* Hero headline gradient: white -> gold -> dark gold */
.gradient-headline {
  background: linear-gradient(135deg, #F5F0E8 0%, #E0B234 50%, #B8922A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* CTA button gradient */
.gradient-cta {
  background: linear-gradient(135deg, #E0B234 0%, #B8922A 100%);
}

/* Subtle gold glow for 3D elements */
.gold-glow {
  box-shadow: 0 0 60px rgba(224, 178, 52, 0.15);
}
```

### Typography

| Role | Font | Weight | Size (Desktop) |
|------|------|--------|----------------|
| Display H1 | Space Grotesk | 700 | 72-96px |
| Section H2 | Space Grotesk | 600 | 48-56px |
| Subsection H3 | Space Grotesk | 500 | 32-36px |
| Body | Inter | 400 | 16-18px |
| Body Bold | Inter | 600 | 16-18px |
| Mono/Code | JetBrains Mono | 400 | 14-16px |
| Label/Caption | Inter | 500 | 12-14px |

### Glassmorphism Card Component

```css
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
```

### Button Styles

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | Gold gradient | #0A0A0F (dark) | none |
| Secondary | transparent | #E0B234 (gold) | 1px gold |
| Ghost | transparent | #F5F0E8 (white) | none |

All buttons: `border-radius: 12px`, `padding: 12px 28px`, `font-weight: 600`.

## Site Structure

### Navigation (Sticky)

- Dark transparent navbar, becomes solid on scroll
- Logo (left) + Section links (center) + "Start a Project" CTA button (right)
- Mobile: hamburger menu with full-screen dark overlay
- Smooth scroll to section anchors

### Section 1: Hero

- Full viewport height (100vh)
- **Background:** Interactive Spline 3D scene
  - Floating geometric shapes (icosahedrons, torus knots) in gold/amber tones
  - Particle field connecting shapes (network/constellation aesthetic)
  - Mouse parallax: shapes subtly follow cursor
  - Ambient gold glow lighting
  - Falls back to animated CSS gradient on load / no WebGL
- **Foreground overlay:**
  - H1: "KB Labs" in gradient headline (white -> gold)
  - Tagline: "Innovating at the intersection of AI, Security, Software Engineering, and Data."
  - Two CTAs: "Start a Project" (primary gold) + "See Our Work" (secondary outline)
- **Bottom edge:** Animated scroll-down chevron

### Section 2: Credibility Strip

- Auto-scrolling horizontal marquee of tech partner/client logos
- Grayscale logos, colorize on hover
- Subtle fade edges (gradient mask on left/right)
- Optional: "Trusted by" or "Built with" label above

### Section 3: Services

- Section heading: "What We Build"
- 4 glassmorphism cards in a 2x2 grid (stacks to 1-column on mobile)
- CSS 3D tilt-on-hover effect (Tailwind `rotate-x`, `rotate-y`, `perspective`)
- Each card:
  - Gold accent icon (Lucide or Phosphor icon set)
  - Service name (H3)
  - 2-3 sentence description
  - "Learn more" link

**Service areas:**
1. **AI & Machine Learning** - Intelligent systems, NLP, computer vision, predictive analytics
2. **Cybersecurity** - Threat detection, penetration testing, security architecture, compliance
3. **Software Engineering** - Full-stack development, cloud infrastructure, API design, DevOps
4. **Data Engineering** - Pipelines, analytics platforms, real-time processing, data governance

### Section 4: Featured Work / Case Studies

- Section heading: "Selected Projects"
- 2-3 full-width case study cards
- Each card:
  - Project screenshot in perspective CSS 3D mockup (browser/device frame)
  - Project name + client (if applicable)
  - Brief description (1-2 sentences)
  - Technology stack tags (pill badges)
  - "View Case Study" link
- GSAP scroll-triggered stagger reveal (cards slide in sequentially)
- **Note:** Project content and screenshots to be populated with accurate information in a later phase

### Section 5: Tech Stack Showcase

- Section heading: "Our Toolkit"
- Horizontal scrolling or responsive grid of tech logos
- Organized by category tabs: Frontend | Backend | Infrastructure | AI/ML | Security
- CSS 3D hover effect on each logo (subtle lift + glow)
- Monochrome by default, gold tint on hover

### Section 6: About / Team

- Section heading: "Who We Are"
- Left column: agency origin story, mission statement (3-4 short paragraphs)
- Right column: team photos in a grid with hover effect (name + role overlay)
- Values/ethos in 3-4 short iconic statements with gold accent icons

### Section 7: Testimonials

- Section heading: "What Clients Say"
- 3-5 client quotes in stacked glassmorphism cards
- Subtle parallax depth effect (cards at different translateZ offsets)
- Client name, role, company below each quote
- Optional: star rating or highlight metric

### Section 8: Process / How We Work

- Section heading: "Our Process"
- 4 numbered steps in a horizontal timeline (vertical on mobile)
- Each step has: number, title, 1-2 sentence description, icon
- GSAP scroll-triggered: steps animate in sequentially as user scrolls
- Connecting line between steps animates gold fill as user progresses

**Steps:**
1. **Discover** - Understanding your challenge and defining success criteria
2. **Design** - Architecture, prototyping, and technical specification
3. **Build** - Iterative development with continuous feedback loops
4. **Deploy & Scale** - Launch, monitoring, optimization, and ongoing support

### Section 9: Contact / Start a Project

- Section heading: "Let's Build Something"
- Left column: contact form (name, email, company, project description, budget range)
- Right column: direct contact info (email: mail@kblabs.us), timezone, response time
- Gold gradient submit button
- Optional: Calendly embed for scheduling calls

### Footer

- Dark background (#0A0A0F with subtle top border)
- Logo + tagline (left)
- Navigation links in columns (center)
- Social media icons (right): GitHub, LinkedIn, Twitter/X
- Bottom bar: copyright, privacy policy link, "Built on Cloudflare" badge
- Back-to-top button

## SEO Fixes (Included in Redesign)

| Issue | Fix |
|-------|-----|
| Meta description placeholder | Replace with real description in Astro layout |
| robots.txt sitemap URL | Update to `https://kblabs.us/sitemap.xml` |
| sitemap.xml lastmod | Auto-generate with `@astrojs/sitemap` |
| Logo alt text | Update to "KB Labs" |
| Logo not clickable | Wrap in `<a href="/">` |
| www.kblabs.us not configured | Add DNS CNAME + redirect in Cloudflare Dashboard |
| Missing structured data | Add JSON-LD Organization schema |
| node_modules committed | Add to .gitignore |

## Performance Strategy

### Budget

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID/INP | < 200ms |
| CLS | 0 |
| Lighthouse Performance | 75-85 |
| Initial page weight | < 500KB (before Spline) |
| Spline scene (lazy) | ~550KB (Brotli) |

### Optimization Techniques

1. **Spline lazy loading** - IntersectionObserver defers WebGL context. CSS gradient fallback shows immediately
2. **Astro islands** - Only Spline + GSAP hydrate as interactive islands. All other sections are zero-JS static HTML
3. **Brotli compression** - Enabled on Cloudflare (better than GZIP by ~15%)
4. **Font loading** - `font-display: swap` + preload critical fonts
5. **Image optimization** - Astro `<Image>` component with WebP/AVIF + responsive srcset
6. **CSS-only 3D** - Service cards, tech logos use Tailwind 3D transforms (no JS)
7. **GSAP code-splitting** - ScrollTrigger loaded only when needed via dynamic import
8. **Cloudflare Early Hints** - Preload critical assets before HTML parsing completes

### Fallbacks

- **No WebGL**: Static gradient background + still image matching 3D scene aesthetic
- **Reduced motion**: `prefers-reduced-motion` disables all animations, shows static layout
- **Slow connection**: Spline deferred indefinitely on `Save-Data` header or slow effective connection type

## File Structure (New)

```
cloudflare-pages-rn/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.png
│   ├── robots.txt              (auto-generated or manual)
│   ├── img/
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   ├── preview.png         (OG image, 1200x630)
│   │   ├── projects/           (case study screenshots - later phase)
│   │   └── team/               (team photos - later phase)
│   ├── fonts/
│   │   ├── SpaceGrotesk-*.woff2
│   │   └── Inter-*.woff2
│   └── spline/
│       └── hero-scene.splinecode  (self-hosted 3D scene)
├── src/
│   ├── layouts/
│   │   └── Layout.astro        (base HTML layout, meta tags, fonts)
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── SplineScene.astro   (client:visible island)
│   │   ├── CredibilityStrip.astro
│   │   ├── Services.astro
│   │   ├── FeaturedWork.astro
│   │   ├── TechStack.astro
│   │   ├── About.astro
│   │   ├── Testimonials.astro
│   │   ├── Process.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   └── ScrollAnimations.astro (client:visible GSAP island)
│   ├── pages/
│   │   └── index.astro         (composes all sections)
│   └── styles/
│       ├── global.css          (Tailwind base + custom properties)
│       └── animations.css      (custom keyframes, GSAP target classes)
├── functions/
│   └── _middleware.js          (updated OG tag injection)
├── _headers
├── docs/
│   └── plans/
│       └── 2026-02-21-kblabs-redesign-design.md
└── .gitignore
```

## Implementation Phases

### Phase 1: Foundation
- Initialize Astro project with Tailwind v4 + Cloudflare adapter
- Create Layout.astro with design system (colors, fonts, meta)
- Build Navbar and Footer components
- Set up Lenis smooth scroll
- Fix all SEO issues

### Phase 2: Sections (Static)
- Build Hero section with CSS gradient fallback (no Spline yet)
- Build Services, About, Process, Contact sections
- Build Credibility Strip, Tech Stack, Testimonials
- All sections as static Astro components with Tailwind styling

### Phase 3: 3D + Animations
- Design and export Spline 3D hero scene
- Integrate as lazy-loaded Astro island
- Add GSAP ScrollTrigger animations to all sections
- Add CSS 3D hover effects to service cards and tech logos

### Phase 4: Content + Polish
- Populate case studies with accurate project info and screenshots
- Add team photos and bios
- Add real testimonials
- Finalize contact form integration
- Test across devices and browsers

### Phase 5: Deploy + SEO
- Configure www redirect in Cloudflare
- Verify Lighthouse scores
- Submit updated sitemap to Google Search Console
- Test social preview cards (OG/Twitter)

## Open Items (Later Phase)

- [ ] Accurate project/case study content with screenshots
- [ ] Team photos and bios
- [ ] Real client testimonials
- [ ] Contact form backend (Cloudflare Workers or third-party)
- [ ] Social media account links
- [ ] Privacy policy page
- [ ] Analytics integration (Cloudflare Web Analytics or Plausible)
