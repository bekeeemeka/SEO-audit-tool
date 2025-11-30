# SEO Audit Tool — Standard (Client-side Demo)

This is the **Standard** version of the SEO Audit Tool (client-side). It extracts:
- Title
- Meta description
- Canonical
- Robots
- H1 / H2 headings
- Word count & estimated reading time
- Image list (with alt attributes)
- Link summary (internal/external)
- Simple suggestions

## How to use (local)
1. Open `index.html` in your browser (double click).
2. Enter a URL and click **Run Audit**.

## Important note about CORS
This project uses client-side `fetch()` to load other websites. Many sites block cross-origin requests from browsers (CORS), so fetching some external URLs will fail with an error like `Failed to fetch` or a console CORS warning.

If you want to audit arbitrary sites without CORS issues, deploy a tiny server-side proxy or use a serverless function. Example options:
- Netlify Functions / Vercel Serverless
- Small Flask/Express server that fetches the HTML and returns it to the client

## Deploying as a static site
1. Push this repo to GitHub.
2. Enable GitHub Pages in **Settings → Pages** (Branch: `main`, Folder: `/`).
3. Or deploy to Netlify (connect repo and deploy).

## License
MIT
