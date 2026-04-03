/* ─────────────────────────────────────────────────────────────────
   13. MARKETPLACE STORE THEMES
─────────────────────────────────────────────────────────────────── */
const MKT_THEMES = {
  flipkart: {
    name: 'Flipkart', icon: '📦',
    topbarBg: '#2874f0', topbarText: '#fff',
    catbarBg: '#fff', catbarText: '#333', catbarActive: '#2874f0',
    heroBg: 'linear-gradient(135deg, #2874f0 0%, #1a5fd4 60%, #0d4ebf 100%)',
    heroText: '#fff', heroAccent: '#FFD700',
    accentColor: '#2874f0', btnBg: '#2874f0', btnText: '#fff',
    badgeBg: '#FFD700', badgeText: '#1a1a1a',
    priceBg: '#388e3c', discBadge: '#ff6161',
    trustBg: '#f0f6ff', trustText: '#2874f0',
    footerBg: '#2874f0', footerText: '#fff', sortBg: '#f0f6ff',
    heroBadge: '⚡ The Big Flipkart Sale!',
    heroTitle: 'Big Savings, Bigger Smiles',
    heroSub: "Top-rated products at prices you'll love",
    font: "'Outfit', sans-serif",
    bodyBg: '#f1f3f6', cardBg: '#fff', cardBorder: '#e5e7eb',
    addToCartBg: '#2874f0', addToCartText: '#fff',
    buyNowBg: '#FFD700', buyNowText: '#222',
    starColor: '#ff6161',
  },
  amazon: {
    name: 'Amazon', icon: '🛒',
    topbarBg: '#131921', topbarText: '#fff',
    catbarBg: '#232f3e', catbarText: '#ddd', catbarActive: '#ff9900',
    heroBg: 'linear-gradient(135deg, #131921 0%, #1e2c3a 50%, #232f3e 100%)',
    heroText: '#fff', heroAccent: '#ff9900',
    accentColor: '#ff9900', btnBg: '#ff9900', btnText: '#111',
    badgeBg: '#ff9900', badgeText: '#111',
    priceBg: '#b12704', discBadge: '#cc0c39',
    trustBg: '#f7f7f7', trustText: '#146eb4',
    footerBg: '#232f3e', footerText: '#ccc', sortBg: '#f7f7f7',
    heroBadge: "⚡ Today's Deals — Up to 70% Off!",
    heroTitle: 'Everything You Need, Delivered',
    heroSub: 'Millions of products · Fast delivery · Trusted sellers',
    font: "'Outfit', sans-serif",
    bodyBg: '#eaeded', cardBg: '#fff', cardBorder: '#ddd',
    addToCartBg: '#ffd814', addToCartText: '#111',
    buyNowBg: '#ff9900', buyNowText: '#111',
    starColor: '#ff9900',
  },
  meesho: {
    name: 'Meesho', icon: '🛍️',
    topbarBg: '#9b26b6', topbarText: '#fff',
    catbarBg: '#fdf1ff', catbarText: '#7b1fa2', catbarActive: '#9b26b6',
    heroBg: 'linear-gradient(135deg, #9b26b6 0%, #c2185b 60%, #e91e8c 100%)',
    heroText: '#fff', heroAccent: '#FFD700',
    accentColor: '#9b26b6', btnBg: '#9b26b6', btnText: '#fff',
    badgeBg: '#FFD700', badgeText: '#7b1fa2',
    priceBg: '#c2185b', discBadge: '#e91e8c',
    trustBg: '#fdf1ff', trustText: '#9b26b6',
    footerBg: '#7b1fa2', footerText: '#fff', sortBg: '#fdf1ff',
    heroBadge: '💅 Super Sale — Trendy Finds!',
    heroTitle: 'Your Vibe, Your Style, Your Store',
    heroSub: 'Trendy ✦ Affordable ✦ Delivered to you',
    font: "'Outfit', sans-serif",
    bodyBg: '#faf0ff', cardBg: '#fff', cardBorder: '#e9d5ff',
    addToCartBg: '#9b26b6', addToCartText: '#fff',
    buyNowBg: '#e91e8c', buyNowText: '#fff',
    starColor: '#e91e8c',
  }
};

/* ─────────────────────────────────────────────────────────────────
   13b. GENERATE MARKETPLACE STORE PAGE
─────────────────────────────────────────────────────────────────── */
function generateStorePage() {
  if (cart.length === 0) { showToast('⚠️ Add products to cart first!'); return; }

  const t = MKT_THEMES[selectedMarketplace] || MKT_THEMES.amazon;
  const cartProducts = [...cart];
  const offerText = document.getElementById('offerInput')?.value.trim() || 'Limited Time Deal!';

  /* Apply theme to overlay */
  const overlay = document.getElementById('storeOverlay');
  overlay.style.background = t.bodyBg;
  overlay.style.fontFamily = t.font;

  /* Top Bar */
  document.getElementById('mktTopbar').style.background = t.topbarBg;
  document.getElementById('mktLogoIcon').textContent = t.icon;
  document.getElementById('mktLogoText').textContent = t.name + ' Store';
  document.getElementById('mktLogoText').style.color = t.topbarText;
  document.getElementById('mktFooterLogo').textContent = t.icon + ' ' + t.name + ' Store';

  const searchBtn = document.getElementById('mktStoreSearchBtn');
  searchBtn.style.background = t.btnBg;
  searchBtn.style.color = t.btnText;

  const cartBtn = document.getElementById('mktCartCount');
  cartBtn.style.background = t.badgeBg;
  cartBtn.style.color = t.badgeText;
  document.getElementById('mktCartBadge').textContent = cartProducts.length;

  const backBtn = document.getElementById('btnBackToApp');
  backBtn.style.cssText = 'background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.35);border-radius:50px;padding:9px 18px;font-family:Outfit,sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap;';

  /* Category Nav Bar */
  document.getElementById('mktCatbar').style.background = t.catbarBg;
  document.getElementById('mktCatbar').style.borderBottom = '1px solid ' + t.cardBorder;

  const categories = ['All', ...new Set(cartProducts.map(p => p.category))];
  const catbarInner = document.getElementById('mktCatbarInner');
  catbarInner.innerHTML = categories.map((cat, i) =>
    `<button class="mkt-cat-btn${i===0?' active':''}" data-cat="${cat}"
      style="color:${i===0?t.catbarActive:t.catbarText};
      border-bottom:3px solid ${i===0?t.catbarActive:'transparent'};
      background:transparent;border-left:none;border-right:none;border-top:none;
      padding:14px 22px;font-family:${t.font};font-size:0.9rem;font-weight:700;
      cursor:pointer;white-space:nowrap;transition:all 0.2s;">${cat}</button>`
  ).join('');

  catbarInner.querySelectorAll('.mkt-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      catbarInner.querySelectorAll('.mkt-cat-btn').forEach(b => {
        b.style.color = t.catbarText;
        b.style.borderBottomColor = 'transparent';
      });
      btn.style.color = t.catbarActive;
      btn.style.borderBottomColor = t.catbarActive;
      const cat = btn.dataset.cat;
      const filtered = cat === 'All' ? cartProducts : cartProducts.filter(p => p.category === cat);
      renderMktGrid(filtered, t, offerText);
    });
  });

  /* Hero Banner */
  document.getElementById('mktHero').style.background = t.heroBg;
  const heroBadge = document.getElementById('mktHeroBadge');
  heroBadge.textContent = t.heroBadge;
  heroBadge.style.cssText = `background:${t.badgeBg};color:${t.badgeText};display:inline-block;
    padding:6px 18px;border-radius:50px;font-size:0.85rem;font-weight:800;margin-bottom:16px;
    letter-spacing:0.02em;`;
  const heroTitleEl = document.getElementById('mktHeroTitle');
  heroTitleEl.textContent = t.heroTitle;
  heroTitleEl.style.color = t.heroText;
  document.getElementById('mktHeroSub').textContent = t.heroSub;
  document.getElementById('mktHeroSub').style.color = 'rgba(255,255,255,0.82)';
  document.getElementById('mktStatProducts').textContent = cartProducts.length;

  /* Hero featured image card */
  const fp = cartProducts[0];
  const fpDisc = Math.round(((fp.mrp - fp.price) / fp.mrp) * 100);
  document.getElementById('mktHeroImgCard').innerHTML = `
    <div style="position:relative;border-radius:18px;overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,0.35);border:3px solid rgba(255,255,255,0.2);">
      <img src="${fp.img}" alt="${fp.name}"
        style="width:100%;height:260px;object-fit:cover;display:block;"
        onerror="this.src='https://placehold.co/320x260/eee/333?text=${encodeURIComponent(fp.name)}'"/>
      <div style="position:absolute;bottom:0;left:0;right:0;
        background:rgba(0,0,0,0.72);padding:14px 16px;backdrop-filter:blur(8px);">
        <div style="color:#fff;font-size:0.9rem;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${fp.name}</div>
        <div style="color:${t.heroAccent};font-size:1.1rem;font-weight:900;">
          ₹${fp.price.toLocaleString('en-IN')}
          <span style="font-size:0.72rem;text-decoration:line-through;color:rgba(255,255,255,0.5);margin-left:8px;">₹${fp.mrp.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div style="position:absolute;top:12px;right:12px;background:${t.discBadge};color:#fff;
        font-size:0.75rem;font-weight:900;padding:5px 12px;border-radius:50px;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);">${fpDisc}% OFF</div>
    </div>`;

  /* Trust Strip */
  const trustStrip = document.getElementById('mktTrustStrip');
  trustStrip.style.background = t.trustBg;
  trustStrip.style.borderTop = '3px solid ' + t.accentColor;
  trustStrip.querySelectorAll('.mkt-trust-item').forEach(el => {
    el.style.color = t.trustText;
    el.style.fontWeight = '600';
  });

  /* Grid header */
  const gridTitle = document.getElementById('mktGridTitle');
  gridTitle.textContent = '🛍️ All Products — ' + t.name;
  gridTitle.style.color = t.accentColor;

  const sortSelect = document.getElementById('mktSortSelect');
  sortSelect.style.borderColor = t.accentColor;
  sortSelect.onchange = () => {
    let sorted = [...cartProducts];
    if (sortSelect.value === 'low')      sorted.sort((a,b) => a.price - b.price);
    else if (sortSelect.value === 'high') sorted.sort((a,b) => b.price - a.price);
    else if (sortSelect.value === 'discount')
      sorted.sort((a,b) => ((b.mrp-b.price)/b.mrp) - ((a.mrp-a.price)/a.mrp));
    renderMktGrid(sorted, t, offerText);
  };

  /* Footer */
  const footer = document.getElementById('mktFooter');
  footer.style.background = t.footerBg;
  footer.style.color = t.footerText;
  footer.querySelectorAll('a').forEach(a => {
    a.style.color = 'rgba(255,255,255,0.65)';
    a.style.textDecoration = 'none';
    a.style.display = 'block';
    a.style.marginBottom = '6px';
    a.style.fontSize = '0.85rem';
  });
  footer.querySelectorAll('h4').forEach(h => {
    h.style.color = '#fff';
    h.style.marginBottom = '12px';
    h.style.fontSize = '0.9rem';
    h.style.fontWeight = '700';
  });

  /* Render product grid */
  renderMktGrid(cartProducts, t, offerText);

  /* Show overlay */
  overlay.classList.add('active');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';

  /* Store search */
  const storeSearchInput = document.getElementById('mktStoreSearch');
  const storeSearchBtn2  = document.getElementById('mktStoreSearchBtn');
  const doStoreSearch = () => {
    const q = storeSearchInput.value.toLowerCase().trim();
    const filtered = q
      ? cartProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      : cartProducts;
    renderMktGrid(filtered, t, offerText);
    if (!filtered.length) showToast('No products matched.');
  };
  storeSearchBtn2.onclick = doStoreSearch;
  storeSearchInput.onkeydown = e => { if (e.key === 'Enter') doStoreSearch(); };

  /* Detail panel */
  document.getElementById('mktDetailClose').onclick = () =>
    document.getElementById('mktDetailOverlay').classList.remove('open');
  document.getElementById('mktDetailOverlay').onclick = e => {
    if (e.target === document.getElementById('mktDetailOverlay'))
      document.getElementById('mktDetailOverlay').classList.remove('open');
  };

  /* Back button */
  document.getElementById('btnBackToApp').onclick = closeStorePage;

  showToast('🏪 ' + t.name + ' Store launched with ' + cartProducts.length + ' product' + (cartProducts.length > 1 ? 's' : '') + '!');
}

/* ─────────────────────────────────────────────────────────────────
   13c. RENDER MARKETPLACE PRODUCT GRID
─────────────────────────────────────────────────────────────────── */
function renderMktGrid(products, t, offerText) {
  const grid = document.getElementById('mktProductGrid');
  document.getElementById('mktProductCount').textContent =
    products.length + ' product' + (products.length !== 1 ? 's' : '');

  if (!products.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;
      color:#888;font-size:1rem;">No products found.</div>`;
    return;
  }

  grid.innerHTML = '';
  products.forEach((p, idx) => {
    const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
    const stars = '★★★★' + (p.id % 3 === 0 ? '☆' : '★');
    const reviews = ((1200 + p.id * 137) % 3000) + 400;
    const br = selectedMarketplace === 'meesho' ? '20px' : '12px';

    const card = document.createElement('div');
    card.className = 'mkt-prod-card';
    card.style.cssText = `background:${t.cardBg};border:1px solid ${t.cardBorder};
      border-radius:${br};overflow:hidden;cursor:pointer;
      transition:transform 0.25s,box-shadow 0.25s;
      animation:mktCardIn 0.4s ease ${idx * 0.05}s both;`;

    card.innerHTML = `
      <div style="position:relative;height:200px;overflow:hidden;background:#f5f5f5;">
        <img src="${p.img}" alt="${p.name}"
          style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;"
          onerror="this.src='https://placehold.co/280x200/eee/333?text=${encodeURIComponent(p.name)}'"/>
        <span style="position:absolute;top:10px;left:10px;background:${t.discBadge};color:#fff;
          font-size:0.65rem;font-weight:800;padding:3px 9px;border-radius:50px;">${disc}% OFF</span>
        <span style="position:absolute;top:10px;right:10px;background:${t.badgeBg};color:${t.badgeText};
          font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:50px;">${p.badge}</span>
      </div>
      <div style="padding:14px 16px 16px;">
        <div style="font-size:0.68rem;color:${t.accentColor};font-weight:700;margin-bottom:4px;
          letter-spacing:0.06em;text-transform:uppercase;">${p.category}</div>
        <div style="font-size:0.88rem;font-weight:700;color:#1a1a1a;margin-bottom:6px;line-height:1.35;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
        <div style="color:${t.starColor};font-size:0.78rem;margin-bottom:8px;letter-spacing:2px;">
          ${stars} <span style="color:#666;font-size:0.7rem;letter-spacing:0;">(${reviews.toLocaleString('en-IN')})</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <span style="font-size:1.2rem;font-weight:900;color:#1a1a1a;">₹${p.price.toLocaleString('en-IN')}</span>
          <span style="font-size:0.78rem;text-decoration:line-through;color:#999;">₹${p.mrp.toLocaleString('en-IN')}</span>
          <span style="font-size:0.72rem;color:${t.priceBg};font-weight:700;">Save ₹${(p.mrp-p.price).toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="mkt-add-btn" style="width:100%;padding:10px;border:none;border-radius:8px;
            background:${t.addToCartBg};color:${t.addToCartText};font-size:0.85rem;font-weight:700;
            cursor:pointer;font-family:${t.font};">🛒 Add to Cart</button>
          <button class="mkt-buy-btn" style="width:100%;padding:10px;border:none;border-radius:8px;
            background:${t.buyNowBg};color:${t.buyNowText};font-size:0.85rem;font-weight:700;
            cursor:pointer;font-family:${t.font};">⚡ Buy Now</button>
        </div>
      </div>`;

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px)';
      card.style.boxShadow = '0 14px 40px rgba(0,0,0,0.14), 0 0 0 2px ' + t.accentColor + '55';
      const img = card.querySelector('img'); if (img) img.style.transform = 'scale(1.06)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''; card.style.boxShadow = '';
      const img = card.querySelector('img'); if (img) img.style.transform = '';
    });
    card.querySelector('.mkt-add-btn').addEventListener('click', e => {
      e.stopPropagation(); showToast('🛒 ' + p.name + ' added to cart!');
    });
    card.querySelector('.mkt-buy-btn').addEventListener('click', e => {
      e.stopPropagation(); openMktDetail(p, t, offerText);
    });
    card.addEventListener('click', () => openMktDetail(p, t, offerText));
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────────────────────
   13d. OPEN PRODUCT DETAIL PANEL
─────────────────────────────────────────────────────────────────── */
function openMktDetail(p, t, offerText) {
  const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const reviews = ((1200 + p.id * 137) % 3000) + 400;
  const stars = '★★★★' + (p.id % 3 === 0 ? '☆' : '★');

  document.getElementById('mktDetailPanel').style.border = '3px solid ' + t.accentColor;
  const closeBtn = document.getElementById('mktDetailClose');
  closeBtn.style.background = t.btnBg;
  closeBtn.style.color = t.btnText;
  closeBtn.style.cssText += `border:none;border-radius:8px;padding:10px 20px;
    font-size:0.9rem;font-weight:700;cursor:pointer;margin-bottom:24px;
    display:block;font-family:${t.font};`;

  document.getElementById('mktDetailContent').innerHTML = `
    <div class="mkt-detail-grid">
      <div>
        <div style="border-radius:16px;overflow:hidden;border:1px solid ${t.cardBorder};
          box-shadow:0 4px 20px rgba(0,0,0,0.08);margin-bottom:12px;">
          <img src="${p.img}" alt="${p.name}"
            style="width:100%;height:320px;object-fit:cover;display:block;"
            onerror="this.src='https://placehold.co/400x320/eee/333?text=${encodeURIComponent(p.name)}'"/>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;">
          ${[0,1,2].map(i=>`<div style="width:70px;height:70px;border-radius:8px;overflow:hidden;
            border:2px solid ${i===0?t.accentColor:t.cardBorder};cursor:pointer;flex-shrink:0;">
            <img src="${p.img}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>`).join('')}
        </div>
        <div style="background:${t.trustBg};border-radius:12px;padding:14px;">
          ${['🚚 Free delivery on all orders','↩️ 7-day easy returns','🔒 100% secure checkout','⭐ Trusted by millions'].map(item=>
            `<div style="font-size:0.78rem;color:${t.trustText};font-weight:600;padding:5px 0;
              border-bottom:1px solid ${t.cardBorder};">${item}</div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:0.7rem;color:${t.accentColor};font-weight:700;text-transform:uppercase;
          letter-spacing:0.07em;margin-bottom:6px;">${p.category}</div>
        <h2 style="font-size:1.45rem;font-weight:900;color:#1a1a1a;line-height:1.25;margin-bottom:10px;">${p.name}</h2>
        <div style="color:${t.starColor};margin-bottom:14px;font-size:0.9rem;letter-spacing:2px;">
          ${stars} <span style="color:#666;font-size:0.78rem;letter-spacing:0;">(${reviews.toLocaleString('en-IN')} reviews)</span>
        </div>
        <div style="background:linear-gradient(135deg,${t.accentColor}14,${t.accentColor}05);
          border-left:4px solid ${t.accentColor};border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:18px;">
          <div style="font-size:2rem;font-weight:900;color:#1a1a1a;">₹${p.price.toLocaleString('en-IN')}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
            <span style="text-decoration:line-through;color:#999;font-size:0.9rem;">₹${p.mrp.toLocaleString('en-IN')}</span>
            <span style="background:${t.discBadge};color:#fff;font-size:0.75rem;font-weight:800;
              padding:3px 10px;border-radius:50px;">${disc}% OFF</span>
          </div>
          <div style="font-size:0.78rem;color:${t.priceBg};font-weight:700;margin-top:6px;">
            🎉 You save ₹${(p.mrp-p.price).toLocaleString('en-IN')}
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#fff8e1,#fff3cd);border:1px solid #fcd34d;
          border-radius:10px;padding:10px 14px;margin-bottom:18px;font-size:0.8rem;color:#92400e;font-weight:600;">
          🎁 ${offerText} · Use code <strong>STARTIFY10</strong> for extra 10% OFF
        </div>
        <p style="font-size:0.9rem;color:#555;line-height:1.9;margin-bottom:16px;
          border-left:3px solid ${t.cardBorder};padding-left:14px;">${p.desc}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
          ${p.tags.map(tag=>`<span style="background:${t.sortBg};color:${t.accentColor};
            border:1px solid ${t.accentColor}55;font-size:0.75rem;font-weight:600;
            padding:4px 12px;border-radius:50px;">${tag}</span>`).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <span style="font-size:0.85rem;font-weight:700;color:#555;">Qty:</span>
          <div id="detailQtyCtrl" style="display:flex;align-items:center;border:1.5px solid ${t.cardBorder};
            border-radius:8px;overflow:hidden;background:#fff;">
            <button onclick="const s=document.getElementById('detailQtyVal');s.textContent=Math.max(1,parseInt(s.textContent)-1)"
              style="width:40px;height:42px;border:none;background:#f5f5f5;font-size:1.2rem;font-weight:700;cursor:pointer;">−</button>
            <span id="detailQtyVal" style="width:42px;text-align:center;font-weight:800;font-size:1rem;display:block;line-height:42px;">1</span>
            <button onclick="const s=document.getElementById('detailQtyVal');s.textContent=parseInt(s.textContent)+1"
              style="width:40px;height:42px;border:none;background:#f5f5f5;font-size:1.2rem;font-weight:700;cursor:pointer;">+</button>
          </div>
          <span style="font-size:0.78rem;color:#16a34a;font-weight:700;background:#dcfce7;
            padding:4px 12px;border-radius:50px;">✓ In Stock</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button onclick="showToast('🛒 Added to cart!')"
            style="padding:14px;border:none;border-radius:10px;
            background:${t.addToCartBg};color:${t.addToCartText};
            font-size:1rem;font-weight:800;cursor:pointer;
            box-shadow:0 4px 14px ${t.addToCartBg}66;font-family:${t.font};">
            🛒 Add to Cart
          </button>
          <button onclick="showToast('⚡ Ordering now on ${t.name}!')"
            style="padding:14px;border:none;border-radius:10px;
            background:${t.buyNowBg};color:${t.buyNowText};
            font-size:1rem;font-weight:800;cursor:pointer;
            box-shadow:0 4px 14px ${t.buyNowBg}66;font-family:${t.font};">
            ⚡ Buy Now on ${t.name}
          </button>
          <button onclick="showToast('♥ Saved to wishlist!')"
            style="padding:12px;border:1.5px solid ${t.cardBorder};border-radius:10px;
            background:transparent;color:#666;font-size:0.9rem;font-weight:600;cursor:pointer;
            font-family:${t.font};">
            ♡ Add to Wishlist
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('mktDetailOverlay').classList.add('open');
  document.getElementById('mktDetailPanel').scrollTop = 0;
}

function closeStorePage() {
  document.getElementById('storeOverlay').classList.remove('active');
  document.body.style.overflow = '';
  showToast('← Back to Startify AI');
}
