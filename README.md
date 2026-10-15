# JohnnyMax — Developer Portfolio

Personal portfolio of **John Achadu (JohnnyMax)**, a full-stack JavaScript engineer based in Lagos, Nigeria. A single-page, hand-built site that presents my skills, projects, and learning journey.

## Tech stack

| Layer | Tools |
|---|---|
| Markup | HTML5 |
| Styling | CSS3, Tailwind CSS (Play CDN) |
| Behaviour | Vanilla JavaScript (no framework, no build step) |
| Icons | Devicon |
| Fonts | Google Fonts: Black Ops One, Rubik Spray Paint, Inter, JetBrains Mono, Space Grotesk |

## Features

- Navbar that turns solid once the page is scrolled
- Responsive mobile menu with `aria-expanded` state
- Scrollspy that highlights the nav link for the section in view
- Hero terminal with a typing effect that cycles through roles
- Scroll-reveal animations powered by `IntersectionObserver`
- Skill bars that fill when their group scrolls into view
- Contact form with client-side validation
- Respects the `prefers-reduced-motion` setting for CSS animations

## Project structure

```
.
├── index.html    Page markup and Tailwind theme config
├── style.css     Custom styles, animations, and component classes
├── script.js     Navbar, menu, scrollspy, typing effect, reveals, form validation
└── README.md
```

## Running locally

No install or build step is needed.

**Option 1: VS Code Live Server**
1. Install the Live Server extension.
2. Right-click `index.html` and choose **Open with Live Server**.

**Option 2: Python**
```bash
python3 -m http.server 5500
```
Then open http://localhost:5500.

An internet connection is required, because Tailwind, Devicon, and the fonts load from CDNs.

## Deployment

The site is static, so it can be deployed to Vercel with no configuration: import the repository and deploy. Vercel serves `index.html` at the site root.

## Known limitations

- The contact form validates input but does not send messages yet.
- Tailwind is loaded from the Play CDN, which is intended for development rather than production.

## Roadmap

- [ ] Connect the contact form so messages are actually delivered
- [ ] Align project cards with my current work and CV
- [ ] Add a Three.js particle background with reduced-motion and no-WebGL fallbacks
- [ ] Deploy to Vercel

## Contact

- Email: graymatterthechampion@gmail.com
- GitHub: [graymatterthechampion-tech](https://github.com/graymatterthechampion-tech)
