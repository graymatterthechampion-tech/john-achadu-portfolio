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

## Features

- Scroll-driven 3D particle background that morphs into a new shape for each section: a jagged mountain range, a globe, a lattice cube, a node network, a double helix and an envelope
- Hero sky with a static, floating mountain range, a ripple that pulses out from the highest peak, and shooting stars that streak in from both sides
- Tech-stack particle cloud: each skill drifts as scattered dust and assembles into its name when the cursor comes near; on touch screens the skills assemble in turn on their own, and tapping one forms it
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
