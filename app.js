/* SEO Audit Tool - Client-side Standard Demo
   Notes:
   - Many sites block client-side fetch (CORS). For full audit, use a small server proxy.
   - This script parses the fetched HTML and extracts useful SEO signals.
*/
const form = document.getElementById('auditForm');
const urlInput = document.getElementById('urlInput');
const results = document.getElementById('results');
const lastRun = document.getElementById('lastRun');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');

const titleResult = document.getElementById('titleResult');
const descResult = document.getElementById('descResult');
const canonResult = document.getElementById('canonResult');
const robotsResult = document.getElementById('robotsResult');
const h1sEl = document.getElementById('h1s');
const h2sEl = document.getElementById('h2s');
const wordCountEl = document.getElementById('wordCount');
const readingTimeEl = document.getElementById('readingTime');
const imagesSummary = document.getElementById('imagesSummary');
const imagesList = document.getElementById('imagesList');
const totalLinks = document.getElementById('totalLinks');
const internalExternal = document.getElementById('internalExternal');
const linkList = document.getElementById('linkList');
const suggestionsList = document.getElementById('suggestionsList');

function safeText(node){ return node ? node.textContent.trim() : ''; }

function humanTime(words){
  const wpm = 200;
  const minutes = Math.max(1, Math.round(words / wpm));
  return minutes + ' min read';
}

function parseAndShow(doc, baseUrl){
  // Metadata
  titleResult.textContent = doc.querySelector('title')?.textContent || '—';
  descResult.textContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '—';
  canonResult.textContent = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '—';
  robotsResult.textContent = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '—';

  // Headings
  const h1s = Array.from(doc.querySelectorAll('h1')).map(e=>safeText(e));
  const h2s = Array.from(doc.querySelectorAll('h2')).map(e=>safeText(e));
  h1sEl.textContent = h1s.length ? h1s.join('\n') : 'None';
  h2sEl.textContent = h2s.length ? h2s.join('\n') : 'None';

  // Content word count
  const bodyText = safeText(doc.body);
  const words = bodyText.split(/\s+/).filter(Boolean);
  wordCountEl.textContent = words.length;
  readingTimeEl.textContent = humanTime(words.length);

  // Images
  const imgs = Array.from(doc.querySelectorAll('img')).map(img => ({src: img.getAttribute('src')||img.src, alt: img.getAttribute('alt')||''}));
  imagesSummary.textContent = imgs.length ? imgs.length + ' images found' : 'No images';
  imagesList.textContent = imgs.length ? imgs.map(i=>`${i.src} — alt: "${i.alt}"`).join('\n') : '';

  // Links
  const anchors = Array.from(doc.querySelectorAll('a')).map(a => ({href: a.getAttribute('href')||a.href,text:a.textContent.trim()}));
  totalLinks.textContent = anchors.length;
  const internal = anchors.filter(a => a.href && (a.href.startsWith(baseUrl) || a.href.startsWith('/') || (!a.href.startsWith('http') && !a.href.startsWith('mailto'))));
  const external = anchors.filter(a => a.href && a.href.startsWith('http') && !a.href.startsWith(baseUrl));
  internalExternal.textContent = `${internal.length} internal / ${external.length} external`;
  linkList.textContent = anchors.length ? anchors.map(a=>`${a.href} — "${a.text}"`).slice(0,200).join('\n') : '';

  // Suggestions (simple heuristics)
  const suggestions = [];
  if(!descResult.textContent || descResult.textContent === '—') suggestions.push('Add a meta description (50–160 chars).');
  if(h1s.length === 0) suggestions.push('Add one H1 heading.');
  if(h1s.length > 1) suggestions.push('Use a single H1 for the main title.');
  if(imgs.length && imgs.filter(i=>!i.alt).length) suggestions.push(`${imgs.filter(i=>!i.alt).length} images missing alt text.`);
  if(words.length < 300) suggestions.push('Page content <300 words — consider adding more useful content.');
  if(canonResult.textContent === '—') suggestions.push('Add a canonical link if duplicates exist.');
  suggestionsList.innerHTML = suggestions.length ? suggestions.map(s=>`<li>${s}</li>`).join('') : '<li>No immediate suggestions found (client-side checks only)</li>';

  results.classList.remove('hidden');
}

async function fetchHTML(url){
  // ensure protocol
  let u = url;
  if(!u.startsWith('http')) u = 'https://' + u;
  const res = await fetch(u);
  if(!res.ok) throw new Error('Failed to fetch: ' + res.status);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return {doc, baseUrl: (new URL(u)).origin};
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const url = urlInput.value.trim();
  if(!url) return;
  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  lastRun.textContent = new Date().toLocaleString();
  try{
    const {doc, baseUrl} = await fetchHTML(url);
    parseAndShow(doc, baseUrl);
  }catch(err){
    // Friendly error message and hint about CORS
    alert('Error fetching the URL. Many sites block direct client-side requests (CORS). See README for proxy instructions.\n\n' + err.message);
  }finally{
    runBtn.disabled = false;
    runBtn.textContent = 'Run Audit';
  }
});

clearBtn.addEventListener('click', ()=>{
  urlInput.value = '';
  results.classList.add('hidden');
  lastRun.textContent = 'Not run yet';
});
