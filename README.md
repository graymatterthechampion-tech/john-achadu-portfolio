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
- Contact form with client-side validation, delivered to my inbox through Web3Forms
- Contact form handles slow networks, failed requests and double submits, keeps the visitor's message on failure, and includes a hidden spam trap
- Respects the `prefers-reduced-motion` setting for CSS animations

## Project structure

```
.
├── index.html    Page markup and Tailwind theme config
├── style.css     Custom styles, animations, and component classes
├── script.js     Navbar, menu, scrollspy, typing effect, reveals, contact form
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

## Configuration

The contact form sends messages through [Web3Forms](https://web3forms.com).

1. Create an access key at web3forms.com using the email address that should receive messages.
2. In `script.js`, replace `PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE` with that key.

Until a key is set, the form tells visitors to email me directly instead of failing silently.

## Deployment

The site is static, so it can be deployed to Vercel with no configuration: import the repository and deploy. Vercel serves `index.html` at the site root.

## Known limitations

- Tailwind is loaded from the Play CDN, which is intended for development rather than production.

## Roadmap

- [x] Connect the contact form so messages are actually delivered
- [x] Align project cards with my current work and CV
- [ ] Add a Three.js particle background with reduced-motion and no-WebGL fallbacks
- [ ] Deploy to Vercel

## Contact

- Email: graymatterthechampion@gmail.com
- GitHub: [graymatterthechampion-tech](https://github.com/graymatterthechampion-tech)
