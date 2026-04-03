import re
with open('c:/Users/PRAGATI/OneDrive/Desktop/STARTIFY/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to find `/* ── 8b. Generate Social Post ── */` and `/* ───` (start of section 9)
# The text has broken unicode like `/* â”€â”€ 8b. Generate Social Post â”€â”€ */`
# and `/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n   9. LANDING PAGE MODAL`

match_start = re.search(r'/\*.{1,10}8b\. Generate Social Post.*?\*/', text)
match_end = re.search(r'/\*.{1,80}9\. LANDING PAGE MODAL.{1,40}\*/', text, flags=re.DOTALL)

if not match_start or not match_end:
    print("Could not find delimiters")
else:
    start_idx = match_start.start()
    end_idx = match_end.start()
    
    # We will replace everything in between with the correct code
    correct_code = """/* ── 8b. Generate Social Post ── */
function generatePost() {
  const p = getSelectedProduct();
  if (!p) return;
  const { discount, salePrice, offerText } = getAIInputs(p);

  hideAllOutputs();
  postSection.style.display = 'block';
  postSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Build Instagram post using product's own colour theme
  const t = p.theme;
  instagramPost.style.background = t.bg;
  instagramPost.innerHTML = `
    <div style="padding:22px 22px 0;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="width:36px;height:36px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;color:#000;">SA</div>
        <div>
          <div style="font-size:0.85rem;font-weight:700;color:${t.text}">startify.store</div>
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.5)">Sponsored</div>
        </div>
      </div>
    </div>
    <div style="position:relative;width:100%;height:240px;overflow:hidden;">
      <img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://via.placeholder.com/340x240/0d0d0d/00ff88?text=${encodeURIComponent(p.name)}'"/>
      <div style="position:absolute;top:14px;right:14px;background:${t.accent};color:#000;font-weight:900;font-size:1.1rem;padding:8px 14px;border-radius:50px;box-shadow:0 4px 16px rgba(0,0,0,0.3);">
        ${discount}% OFF
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));padding:16px;">
        <div style="font-size:0.85rem;font-weight:700;color:#fff;">${p.name}</div>
      </div>
    </div>
    <div style="padding:16px 22px 22px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div>
          <span style="font-size:1.4rem;font-weight:900;color:${t.accent}">₹${Number(salePrice).toLocaleString('en-IN')}</span>
          <span style="font-size:0.8rem;text-decoration:line-through;color:rgba(255,255,255,0.4);margin-left:8px;">₹${p.mrp.toLocaleString('en-IN')}</span>
        </div>
        <button style="background:${t.accent};color:#000;border:none;border-radius:50px;padding:8px 18px;font-weight:700;font-size:0.8rem;cursor:pointer;">Shop Now</button>
      </div>
      <div style="font-size:0.75rem;color:${t.text};opacity:0.8;line-height:1.6;">${offerText} · Tap the link in bio to grab yours!</div>
      <div style="display:flex;gap:16px;margin-top:12px;font-size:1.1rem;">
        <span style="cursor:pointer;">❤️</span>
        <span style="cursor:pointer;">💬</span>
        <span style="cursor:pointer;">✈️</span>
      </div>
    </div>`;

  // Captions & hashtags
  const captions = [
    `✨ Introducing the ${p.name} — your new favourite ${p.category.toLowerCase()} essential!`,
    `🔥 ${offerText} Get it now for just ₹${Number(salePrice).toLocaleString('en-IN')} (Was ₹${p.mrp.toLocaleString('en-IN')}) — ${discount}% OFF!`,
    `💫 ${p.desc.slice(0, 90)}...`,
    `🛒 Limited stock available. Don't miss out!`,
    `👆 Tap the link in bio to order now!`
  ];
  const hashtags = [
    `#${p.category.replace(/\s/g, '')}`, '#ShopNow', '#SaleAlert',
    `#${p.name.split(' ')[0]}`, '#LimitedOffer', '#Startify', '#OnlineShopping',
    '#TrendingNow', `#${selectedMarketplace.charAt(0).toUpperCase() + selectedMarketplace.slice(1)}`, '#MustHave'
  ];

  postMeta.innerHTML = `
    <h3>📝 Caption</h3>
    <p class="post-caption">${captions.join('<br/><br/>')}</p>
    <h3 style="margin-bottom:12px;">🏷️ Hashtags</h3>
    <div class="post-hashtags">${hashtags.map(h => `<span class="hashtag">${h}</span>`).join('')}</div>
    <br/>
    <button class="btn-copy" id="copyCaption">📋 Copy Caption</button>`;

  document.getElementById('copyCaption').addEventListener('click', () => {
    const text = captions.join('\\n\\n') + '\\n\\n' + hashtags.join(' ');
    navigator.clipboard.writeText(text).then(() => showToast('Caption copied!')).catch(() => showToast('Copy failed — select manually'));
  });

  showToast('📸 Social post generated!');
}

/* ── 8c. Generate Ad & Video ── */
async function generateAd() {
  const p = getSelectedProduct();
  if (!p) return;
  const { discount, salePrice, offerText } = getAIInputs(p);

  hideAllOutputs();
  adSection.style.display = 'block';
  adSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Clear old timer
  if (videoTimerInterval) clearInterval(videoTimerInterval);

  // Video Box
  let seconds = 8;
  videoBox.innerHTML = `
    <div class="video-inner">
      <img class="video-product-img" src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/120x120/0d0d0d/00ff88?text=IMG'"/>
      <div class="video-timer" id="videoTimer">0:08</div>
      <div class="video-label">⏳ 8-Second Ad Preview Playing…</div>
    </div>
    <div class="video-progress-bar" id="videoProgress"></div>`;

  const timerEl = document.getElementById('videoTimer');
  videoTimerInterval = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = \`0:0\${Math.max(0, seconds)}\`;
    if (seconds <= 0) clearInterval(videoTimerInterval);
  }, 1000);

  adScript.innerHTML = \`<div class="ad-script-title">📜 Generating AI Video Script...</div><div class="ad-script-text">Please wait while Gemini writes your ad...</div>\`;

  try {
    const res = await fetch('http://localhost:3000/generate-ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: String(p.id), discount })
    });
    const data = await res.json();

    if (data.success && data.ad_script) {
      const s = data.ad_script;
      const scriptLines = [
        { label: 'HOOK (0–2s)', text: s.hook || '' },
        { label: 'PROBLEM (2–4s)', text: s.problem || '' },
        { label: 'REVEAL (4–6s)', text: s.reveal || '' },
        { label: 'CTA (6–8s)', text: s.cta || '' }
      ];
      if (s.visual_notes) {
        scriptLines.push({ label: 'VISUALS & DIRECTING', text: s.visual_notes });
      }

      adScript.innerHTML = `
        <div class="ad-script-title">✨ Gemini Video Director Script</div>
        <div class="ad-script-text">
          ${scriptLines.map(x => \`<p style="margin-bottom:12px;"><strong style="color:var(--text);font-size:0.75rem;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em;">\${x.label}</strong><span class="\${x.label.includes('HOOK') || x.label.includes('CTA') ? 'ad-hook' : ''}">\${x.text}</span></p>\`).join('')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-copy" id="copyScript">📋 Copy Script</button>
        </div>`;
        
      document.getElementById('copyScript').addEventListener('click', () => {
        const text = scriptLines.map(x => \`[\${x.label}]\\n\${x.text}\`).join('\\n\\n');
        navigator.clipboard.writeText(text).then(() => showToast('Script copied!')).catch(() => showToast('Copy failed'));
      });
      showToast('🎬 Gemini generated script ready!');
    } else {
        throw new Error(data.error || "Failed to generate");
    }
  } catch (err) {
      adScript.innerHTML = \`<div class="ad-script-text" style="color:var(--red);">Error getting script: \${err.message}. Make sure the backend server (app.py) is running.</div>\`;
  }
}
\n"""
    
    new_text = text[:start_idx] + correct_code + text[end_idx:]
    with open('c:/Users/PRAGATI/OneDrive/Desktop/STARTIFY/app.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Done writing to app.js")
