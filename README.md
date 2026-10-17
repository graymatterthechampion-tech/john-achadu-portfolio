# John Achadu — Developer Portfolio

Personal portfolio of **John Achadu**, a software developer based in Lagos, Nigeria. A single-page, hand-built site that presents my skills, projects and learning journey.

Live site: https://john-achadu-portfolio.vercel.app

## Tech stack

| Layer | Tools |
|---|---|
| Markup | HTML5 |
| Styling | CSS3, Tailwind CSS v3 (compiled to a static `tailwind.css`) |
| Behaviour | Vanilla JavaScript, no framework |
| 3D | Three.js r169 with custom GLSL shaders, loaded through an import map |
| Contact form | Web3Forms |
| Icons | Devicon |
| Hosting | Vercel |

## Design

Light theme: warm cream background with ink text, using the neutral palette of the reference portfolio, and a deep teal accent of my own.

| Token | Colour | Used for |
|---|---|---|
| `paper` | `#EBE7E0` | Page background |
| `panel` | `#E2DDD4` | Alternate sections, mobile menu |
| `panel2` | `#F3F0EA` | Cards, inputs |
| `ink` | `#1F1F23` | Headings and main text |
| `mist` | `#5B5A60` | Body and secondary text |
| `hairline` | `#CECBC5` | Borders |
| `signal` | `#0A6B58` | Accent: labels, links, primary button |
| `volt` | `#5A4BD6` | Secondary accent |

Every text colour meets WCAG AA contrast (4.5:1) on the backgrounds it sits on. Sections after the hero sit on cream at 86% opacity so the 3D shapes show through as texture without competing with the text.

## Features

- Scroll-driven 3D particle background that morphs into a new shape for each section: a jagged mountain range, a globe, a lattice cube, a node network, a double helix and an envelope
- Hero sky with a static, floating mountain range, a ripple that pulses out from the highest peak, and shooting stars that streak in from both sides
- Centred hero, with proportions measured from the reference design and scaled with `clamp()` and `min()` for every screen size
- Tech-stack particle scene: each skill assembles from drifting dust as it scrolls towards the middle of the screen and blows apart as it scrolls away; hovering or tapping a word scatters it
- Real terrain: the hero landscape is Chappal Waddi, Nigeria's highest point (2,419 m), built from SRTM elevation data at true vertical scale and drawn as scan rows so ridges and river valleys read like routes; falls back to generated mountains if the heightmap cannot load
- Performance safeguards: phones that report 2 GB of memory or less, or 2 CPU cores or fewer, start with fewer particles at 1x resolution, and any device that averages under about 30 fps after warm-up automatically drops to half the particles
- The 3D layer is skipped entirely for reduced-motion users, devices without WebGL2, and when the CDN fails, leaving the rest of the site untouched
- Contact form delivered through Web3Forms, with validation, a request timeout, double-submit protection, a hidden spam trap, and the visitor's message kept if sending fails
- Downloadable CV (`John-Achadu-CV.pdf`)
- Responsive navbar and mobile menu, scrollspy, and scroll-reveal animations

## Project structure

```
.
├── index.html            Page markup
├── style.css             Custom styles, animations and component classes
├── tailwind.css          Compiled Tailwind utilities (generated, do not edit by hand)
├── tailwind.config.js    Tailwind theme: colours and fonts
├── tailwind.input.css    Tailwind entry file
├── script.js             Navbar, menu, scrollspy, reveals, contact form
├── scene.js              Three.js particle background (ES module)
├── skills.js             Skill particles on a 2D canvas (ES module)
├── favicon.svg           Site icon
├── assets/
│   └── chappal-waddi-heightmap.png   Elevation heightmap of Chappal Waddi (greyscale, 640 x 198)
├── John-Achadu-CV.pdf    Public copy of my CV
└── README.md
```

## Running locally

No install is needed to view the site.

**Option 1: VS Code Live Server.** Right-click `index.html` and choose **Open with Live Server**.

**Option 2: Python**
```bash
python3 -m http.server 5500
```
Then open http://localhost:5500.

An internet connection is required, because Three.js, Devicon and the fonts load from CDNs.

## Rebuilding Tailwind

`tailwind.css` only contains the classes the site uses. After adding or changing Tailwind classes in `index.html` or the scripts, rebuild it:

```bash
npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
```

Commit the regenerated `tailwind.css`. Vercel serves it as a static file, so no build step is needed there.

## Configuration

The contact form sends messages through [Web3Forms](https://web3forms.com). The access key lives in `script.js` as `WEB3FORMS_ACCESS_KEY`. Web3Forms access keys are designed to be public; they only allow sending to the inbox they were created for. If the key is missing, the form tells visitors to email me directly instead of failing silently.

## Deployment

The site is static and deployed on Vercel from the `main` branch. Pushing to `main` triggers a new deployment.

## Credits

Terrain: Chappal Waddi, Taraba State, Nigeria. SRTM elevation data courtesy of the U.S. Geological Survey, via Mapzen Terrain Tiles (AWS Open Data). The heightmap covers about 24 x 7.5 km around the summit at 38 m resolution; elevations 855 m to 2,429 m are scaled to 0 to 255.

The visual concept of a scroll-morphing particle background was inspired by [Kizito Udeinya's portfolio](https://kizito-udeinya.vercel.app). All code on this site was written for it.

## Known limitations

- Three.js, Devicon and Google Fonts load from public CDNs.
- The 3D scene has been tested in desktop and emulated mobile browsers; real low-end devices rely on the automatic quality fallback.

## Roadmap

- [x] Connect the contact form so messages are actually delivered
- [x] Align the site with my CV
- [x] Three.js particle background with reduced-motion, no-WebGL and slow-device fallbacks
- [x] Deploy to Vercel
- [x] Compile Tailwind instead of using the Play CDN
- [ ] Link each public project to its repository (BulkMail stays private; code walkthrough on request)
- [ ] Public BulkMail demo with its own database and sending disabled
- [ ] Add project screenshots to the Work cards

## Contact

- Email: graymatterthechampion@gmail.com
- GitHub: [graymatterthechampion-tech](https://github.com/graymatterthechampion-tech)
