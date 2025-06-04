# Linen Count PWA

A multi-user offline linen inventory PWA built with Next.js.

## Project Structure

```
/my-linen-app
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-icon-180x180.png
│   ├── manifest.json
│   └── sw.js
├── pages/
│   ├── _app.js
│   ├── _document.js
│   └── index.js
├── next.config.js
├── package.json
└── README.md
```

## Getting Started Locally

1. **Clone the repo**  
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Run in development**  
   ```bash
   npm run dev
   ```  
   Open [http://localhost:3000](http://localhost:3000) in your browser. (Service worker is disabled in development.)

4. **Build & Export a static site**  
   ```bash
   npm run build
   npm run export
   ```  
   This generates an `out/` folder containing all static files (HTML, CSS, JS, `manifest.json`, icons, `sw.js`).

5. **Preview production**  
   ```bash
   npx serve out
   ```  
   Visit [http://localhost:5000](http://localhost:5000) to verify PWA behavior.

## Deploy to GitHub Pages

1. Ensure your **`package.json`** has a `"homepage"` field set to:  
   ```
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```

2. Install `gh-pages` (already in devDependencies).  
   ```bash
   npm install
   ```

3. Run the deploy script:  
   ```bash
   npm run deploy
   ```  
   This will build, export, and push the contents of `out/` to the `gh-pages` branch automatically.

4. After a minute, your PWA will be live at:  
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

## PWA Features

- **Offline caching** via `sw.js` (or via `next-pwa` if enabled).  
- **`manifest.json`**—defines name, icons, theme color, and start URL.  
- **iOS Support**: add to home screen → runs standalone (no Safari UI).  

### Installing on iPhone

1. Open Safari on your iPhone.  
2. Navigate to `https://<your-username>.github.io/<repo-name>/`.  
3. Tap the “Share” button (square + arrow), then “Add to Home Screen.”  
4. Tap “Add.” The app icon appears on your home screen.  
5. Launch it; you’ll be offline-capable immediately.  
