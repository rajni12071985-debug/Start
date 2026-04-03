/* ═══════════════════════════════════════════════════════════
   STARTIFY AI — BACKEND SERVER
   Node.js + Express  |  No DB  |  Demo-ready for Hackathon
═══════════════════════════════════════════════════════════ */

'use strict';

const express = require('express');
const cors    = require('cors');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Load .env manually (no dotenv dependency needed) ── */
function loadEnv(filepath) {
  try {
    const lines = fs.readFileSync(filepath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !(key.trim() in process.env)) {
        process.env[key.trim()] = value;
      }
    }
  } catch (e) { /* .env file not found — skip */ }
}
loadEnv(path.join(__dirname, '.env'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Log key status on startup (shows first 8 chars only for security)
console.log(`\n[Gemini] API Key: ${GEMINI_API_KEY ? '✅ Loaded (' + GEMINI_API_KEY.slice(0,8) + '...)' : '❌ NOT FOUND — check .env file'}`);

/* ── Call Gemini API (tries gemini-1.5-flash — stable free-tier model) ── */
function callGemini(query) {
  return new Promise((resolve, reject) => {
    const prompt =
      'You are a beginner-friendly business assistant.\n' +
      'Suggest a trending product based on the user\'s query.\n\n' +
      'Return ONLY valid JSON — no markdown, no code fences — with exactly these keys:\n' +
      '  product_name      (string)\n' +
      '  category          (string)\n' +
      '  demand            ("High" | "Medium" | "Low")\n' +
      '  target_audience   (string)\n' +
      '  profit_margin     (string, e.g. "65%")\n' +
      '  reason            (string, 1-2 sentences)\n' +
      '  alternatives      (array of 2 objects, each with: product_name, category, demand)\n\n' +
      `User Query: ${query}`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
    });

    // Use gemini-1.5-flash — the stable, free-tier available model
    const MODEL = 'gemini-1.5-flash';

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    console.log(`[Gemini] Calling model: ${MODEL} for query: "${query}"`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          console.log(`[Gemini] HTTP Status: ${res.statusCode}`);
          const parsed = JSON.parse(data);

          // Log Google's error clearly if present
          if (parsed.error) {
            console.error(`[Gemini] API Error ${parsed.error.code}: ${parsed.error.message}`);
            return reject(new Error(`Gemini API Error ${parsed.error.code}: ${parsed.error.message}`));
          }

          if (!parsed.candidates || !parsed.candidates[0]) {
            console.error('[Gemini] No candidates in response:', JSON.stringify(parsed).slice(0, 300));
            return reject(new Error('Gemini returned no candidates'));
          }

          let rawText = parsed.candidates[0].content.parts[0].text.trim();
          console.log(`[Gemini] Raw response: ${rawText.slice(0, 120)}...`);

          // Strip markdown code fences if Gemini wraps the JSON
          if (rawText.startsWith('```')) {
            rawText = rawText.split('\n').slice(1).join('\n').split('```')[0].trim();
          }

          resolve(JSON.parse(rawText));
        } catch (e) {
          console.error('[Gemini] Parse error:', e.message, '| Raw data:', data.slice(0, 300));
          reject(new Error(`Failed to parse Gemini response: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Gemini] Network error:', err.message);
      reject(err);
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Gemini API timeout after 15s')); });
    req.write(body);
    req.end();
  });
}

/* ── Middleware ── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── API Status check (open in browser to debug) ── */
app.get('/api-status', (req, res) => {
  res.json({
    server     : 'running',
    gemini_key : GEMINI_API_KEY ? `loaded (${GEMINI_API_KEY.slice(0,8)}...)` : 'NOT FOUND — check .env',
    model      : 'gemini-1.5-flash',
    key_valid  : GEMINI_API_KEY.length > 20
  });
});

/* ──────────────────────────────────────────────────────────
   PRODUCT CATALOGUE  (in-memory)
────────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: '1',
    name: 'Gold Diamond Necklace',
    category: 'Jewellery',
    price: 1299,
    mrp: 2499,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=85&auto=format&fit=crop',
    description: 'Elegant 18K gold pendant necklace with real diamond accent. Crafted for special occasions, anniversaries, and thoughtful gifting. Comes in premium packaging.',
    features: ['18K Gold Plated', 'Real Diamond Accent', 'Gift-Ready Packaging', 'Adjustable Chain Length', 'Nickel-Free & Hypoallergenic'],
    badge: 'Best Seller',
    theme_color: '#f0b840',
    keywords: ['jewellery', 'necklace', 'girls', 'women', 'gift', 'gold', 'diamond', 'accessories'],
    target_audience: 'Women aged 18–45, gift buyers, brides-to-be',
    demand: 'High',
    profit_margin: '55%',
    reason: 'Jewellery has consistently high demand with strong social-media virality. Gold-tone pieces are perennially trendy and command premium pricing.'
  },
  {
    id: '2',
    name: 'Smart LED Desk Lamp',
    category: 'LED Lamp',
    price: 799,
    mrp: 1499,
    image: 'https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d?w=400&q=85&auto=format&fit=crop',
    description: 'Adjustable smart LED lamp with touch control, 3 colour modes and USB charging port. Energy efficient and stylish — perfect for study desks and home offices.',
    features: ['Touch Control Dimmer', '3 Colour Modes (Warm/Cool/Natural)', 'USB Charging Port', 'Eye-Care Flicker-Free Tech', '360° Adjustable Arm'],
    badge: 'Trending',
    theme_color: '#00e5ff',
    keywords: ['led', 'lamp', 'light', 'students', 'study', 'desk', 'office', 'work from home', 'low budget', 'tech'],
    target_audience: 'Students, remote workers, homeowners aged 16–35',
    demand: 'High',
    profit_margin: '62%',
    reason: 'LED lamps rank among the top-10 dropshipping products globally. Remote work culture keeps demand permanently elevated year-round.'
  },
  {
    id: '3',
    name: 'Bestseller Book Bundle',
    category: 'Books',
    price: 499,
    mrp: 999,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=85&auto=format&fit=crop',
    description: 'Curated set of 3 bestselling books on mindset, productivity and financial freedom. Handpicked titles to help you grow personally and professionally.',
    features: ['Set of 3 Bestsellers', 'Mindset & Productivity Focus', 'Financial Independence Guide', 'Gift-Worthy Presentation', 'Suitable for Age 16+'],
    badge: 'Hot Pick',
    theme_color: '#b388ff',
    keywords: ['books', 'students', 'education', 'reading', 'learning', 'mindset', 'low budget', 'knowledge'],
    target_audience: 'Students, self-improvement enthusiasts, young professionals aged 16–30',
    demand: 'Medium',
    profit_margin: '48%',
    reason: 'Book bundles generate high AOV and repeat purchases. Self-improvement content is an evergreen category with strong buyer intent.'
  },
  {
    id: '4',
    name: 'Glow Serum Pro',
    category: 'Skincare',
    price: 649,
    mrp: 1299,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b26a7?w=400&q=85&auto=format&fit=crop',
    description: 'Advanced Vitamin C + Hyaluronic Acid serum for glass-like radiant skin. Dermatologist approved and fragrance-free formula. Suitable for all skin types.',
    features: ['Vitamin C + Hyaluronic Acid', 'Dermatologist Approved', 'Cruelty Free & Vegan', 'Fragrance-Free Formula', 'Visible Glow in 14 Days'],
    badge: 'New',
    theme_color: '#ff7043',
    keywords: ['skincare', 'serum', 'girls', 'women', 'beauty', 'glow', 'skin', 'face', 'vitamin c', 'beauty products'],
    target_audience: 'Women aged 18–40 interested in clean beauty and skincare routines',
    demand: 'High',
    profit_margin: '68%',
    reason: 'Skincare is the fastest-growing beauty segment. Vitamin C serums are a hero SKU with strong repeat purchase rates and organic social proof.'
  },
  {
    id: '5',
    name: 'Minimal Decor Vase',
    category: 'Home Decor',
    price: 449,
    mrp: 899,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=85&auto=format&fit=crop',
    description: 'Hand-crafted ceramic vase with abstract modern design. An art piece that elevates any living room, bedroom, or workspace. Perfect housewarming gift.',
    features: ['Handcrafted Ceramic', 'Abstract Modern Design', 'Matte Finish Coating', 'Perfect for Dried Flowers', 'Housewarming Gift Ideal'],
    badge: 'Exclusive',
    theme_color: '#66bb6a',
    keywords: ['home decor', 'vase', 'decor', 'interior', 'home', 'gift', 'aesthetic', 'room', 'housewarming'],
    target_audience: 'Homeowners and renters aged 25–50, interior decor enthusiasts',
    demand: 'Medium',
    profit_margin: '55%',
    reason: 'Home décor saw a 3× boost post-pandemic and sustained growth. Aesthetic products convert extremely well on Pinterest and Instagram.'
  },
  {
    id: '6',
    name: 'Premium Oversized Hoodie',
    category: 'Clothes',
    price: 899,
    mrp: 1799,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85&auto=format&fit=crop',
    description: '400GSM cotton-blend oversized hoodie with fleece interior. Ultra-cozy, unisex streetwear design. Available in 6 colours. Easy returns within 7 days.',
    features: ['400 GSM Heavy Cotton Blend', 'Fleece Interior Lining', 'Unisex Oversized Fit', 'Available in 6 Colours', 'Shrink-Resistant & Durable'],
    badge: 'Top Rated',
    theme_color: '#e0e0e0',
    keywords: ['hoodie', 'clothes', 'fashion', 'clothing', 'students', 'boys', 'girls', 'streetwear', 'winter', 'apparel'],
    target_audience: 'Gen-Z and millennials aged 16–30, streetwear lovers',
    demand: 'High',
    profit_margin: '60%',
    reason: 'Oversized hoodies dominate fashion trends across all demographics. Streetwear converts powerfully on Instagram Reels and Meesho.'
  },
  {
    id: '7',
    name: 'Luxury Minimalist Watch',
    category: 'Watch',
    price: 2499,
    mrp: 4999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85&auto=format&fit=crop',
    description: 'Swiss-movement slim watch with sapphire crystal glass and genuine leather strap. Timeless luxury aesthetic that pairs perfectly with formal and casual looks.',
    features: ['Swiss Quartz Movement', 'Sapphire Crystal Glass', 'Genuine Leather Strap', 'Water Resistant 30M', '2-Year Brand Warranty'],
    badge: 'Premium',
    theme_color: '#ffd54f',
    keywords: ['watch', 'luxury', 'men', 'boys', 'gift', 'premium', 'accessories', 'formal', 'style', 'fashion'],
    target_audience: 'Men and women aged 22–45, professionals, gift buyers',
    demand: 'High',
    profit_margin: '70%',
    reason: 'Watches have the highest profit margins in fashion accessories. Premium watch segments grow 18% YoY and have outstanding gifting appeal.'
  },
  {
    id: '8',
    name: 'Matte Luxe Lipstick',
    category: 'Makeup',
    price: 349,
    mrp: 699,
    image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2823?w=400&q=85&auto=format&fit=crop',
    description: 'Long-lasting 12-hour matte finish lipstick with moisturising formula. Bold, buildable colour payoff in 8 gorgeous shades. Zero transfer, all-day comfort.',
    features: ['12-Hour Long-Lasting Wear', 'Moisturising Matte Formula', 'Zero-Transfer Technology', '8 Gorgeous Shades', 'Cruelty-Free & Vegan'],
    badge: 'Fan Fave',
    theme_color: '#f48fb1',
    keywords: ['lipstick', 'makeup', 'beauty', 'girls', 'women', 'cosmetics', 'low budget', 'matte', 'lip colour'],
    target_audience: 'Women aged 16–38, beauty enthusiasts, makeup beginners',
    demand: 'High',
    profit_margin: '65%',
    reason: 'Cosmetics lead in impulse-buy categories. Lipstick has the highest reorder rate in beauty; it is recession-proof and extremely shareable on social media.'
  },
  {
    id: '9',
    name: 'Air-Boost Sneakers',
    category: 'Shoes',
    price: 1599,
    mrp: 2999,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85&auto=format&fit=crop',
    description: 'Ultra-lightweight running sneakers with responsive foam sole and breathable mesh upper. Engineered for all-day comfort — from gym sessions to casual street walks.',
    features: ['Ultra-Lightweight Design', 'Responsive Foam Sole', 'Breathable Mesh Upper', 'Unisex Sizing (UK 5–11)', 'Anti-Slip Rubber Outsole'],
    badge: 'New Arrival',
    theme_color: '#ef5350',
    keywords: ['shoes', 'sneakers', 'footwear', 'sports', 'running', 'gym', 'boys', 'men', 'fashion', 'fitness'],
    target_audience: 'Fitness enthusiasts, students, and sneakerheads aged 16–35',
    demand: 'High',
    profit_margin: '58%',
    reason: 'Footwear is a $400B global market. Sneakers have the strongest social proof loop — unboxing content and outfit-of-the-day posts drive organic reach.'
  },
  {
    id: '10',
    name: 'Wireless Bluetooth Earbuds',
    category: 'Electronics',
    price: 1199,
    mrp: 2499,
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b7c835?w=400&q=85&auto=format&fit=crop',
    description: 'Premium TWS earbuds with Active Noise Cancellation, 30-hour battery life, and crystal-clear call quality. IPX5 water-resistant for workouts and daily commutes.',
    features: ['Active Noise Cancellation', '30-Hour Battery (Earbuds + Case)', 'IPX5 Water Resistant', 'Touch Control Interface', 'Compatible with iOS & Android'],
    badge: 'Editor\'s Choice',
    theme_color: '#42a5f5',
    keywords: ['earbuds', 'bluetooth', 'wireless', 'audio', 'music', 'tech', 'students', 'electronics', 'gadgets', 'low budget', 'boys', 'girls'],
    target_audience: 'Tech-savvy students and professionals aged 18–35',
    demand: 'High',
    profit_margin: '63%',
    reason: 'TWS earbuds are the #1 consumer electronics product by search volume on Amazon India. Exceptional gifting potential and repeat purchases.'
  }
];

/* ── In-memory store ── */
let selectedProduct = null;   // POST /select-product stores here
let visitorCount    = Math.floor(Math.random() * 400) + 200;  // seed

/* ══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
══════════════════════════════════════════════════════════ */

/** Find a product by id (string or number) */
function findProduct(id) {
  return PRODUCTS.find(p => p.id === String(id)) || null;
}

/** Score a product against a query string */
function scoreProduct(product, query) {
  const q = query.toLowerCase();
  let score = 0;
  product.keywords.forEach(kw => {
    if (q.includes(kw)) score += kw.length > 4 ? 3 : 1;  // longer keyword = stronger signal
  });
  if (q.includes(product.category.toLowerCase())) score += 5;
  if (q.includes(product.name.toLowerCase()))     score += 8;
  return score;
}

/** Generate hashtags from product data */
function buildHashtags(product) {
  const cat = product.category.replace(/\s/g, '');
  return [
    `#${cat}`, '#ShopNow', '#SaleAlert',
    `#${product.name.split(' ')[0]}`, '#OnlineShopping',
    '#Startify', '#TrendingNow', '#MustHave',
    '#BuyNow', `#${cat}Sale`
  ];
}

/** Generate a social media caption */
function buildCaption(product, discount, offerText) {
  return [
    `✨ Introducing the ${product.name} — your new favourite ${product.category.toLowerCase()} essential!`,
    `🔥 ${offerText || 'Limited Time Offer'}! Get it now at ${discount}% OFF!`,
    `💫 ${product.description.slice(0, 90)}...`,
    `🛒 Limited stock. Don't miss out!`,
    `👆 Tap the link in bio to order now!`
  ].join('\n\n');
}

/** Pick a Pexels/Unsplash demo video URL */
function demoVideoUrl(category) {
  const videos = {
    'Jewellery':  'https://www.w3schools.com/html/mov_bbb.mp4',
    'Skincare':   'https://www.w3schools.com/html/mov_bbb.mp4',
    'Clothes':    'https://www.w3schools.com/html/mov_bbb.mp4',
    'Electronics':'https://www.w3schools.com/html/mov_bbb.mp4',
  };
  return videos[category] || 'https://www.w3schools.com/html/mov_bbb.mp4';
}

/** Randomise analytics data with slight drift each call */
function generateAnalytics() {
  visitorCount += Math.floor(Math.random() * 5);
  const orders = Math.floor(visitorCount * (0.04 + Math.random() * 0.04));
  const rate   = ((orders / visitorCount) * 100).toFixed(1);
  return {
    visitors        : visitorCount,
    orders          : orders,
    conversion_rate : `${rate}%`,
    revenue         : `₹${(orders * 850 + Math.floor(Math.random() * 2000)).toLocaleString('en-IN')}`,
    avg_order_value : `₹${(800 + Math.floor(Math.random() * 600)).toLocaleString('en-IN')}`,
    top_category    : 'Skincare',
    bounce_rate     : `${(30 + Math.floor(Math.random() * 25))}%`,
    session_duration: `${(1 + Math.random() * 3).toFixed(1)} min`,
    timestamp       : new Date().toISOString()
  };
}

/* ══════════════════════════════════════════════════════════
   ROOT — Health check
══════════════════════════════════════════════════════════ */
app.get('/', (req, res) => {
  res.json({
    message   : '⚡ Startify AI Backend — Running!',
    version   : '1.0.0',
    endpoints : [
      'POST /ai-assistant',
      'GET  /products',
      'GET  /product/:id',
      'POST /select-product',
      'POST /generate-post',
      'POST /generate-ads',
      'GET  /analytics'
    ]
  });
});

/* ══════════════════════════════════════════════════════════
   1. AI BUSINESS ASSISTANT
   POST /ai-assistant
══════════════════════════════════════════════════════════ */
app.post('/ai-assistant', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query field is required and must be a non-empty string.' });
  }

  /* ── Try Gemini AI first ── */
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const aiData = await callGemini(query.trim());

      const required = ['product_name', 'category', 'demand', 'target_audience', 'profit_margin', 'reason', 'alternatives'];
      if (!required.every(k => k in aiData)) throw new Error('Gemini response missing required fields.');

      const alternatives = Array.isArray(aiData.alternatives) ? aiData.alternatives.slice(0, 2) : [];

      return res.json({
        success         : true,
        query,
        ai_powered      : true,
        product_name    : aiData.product_name,
        category        : aiData.category,
        demand          : aiData.demand,
        target_audience : aiData.target_audience,
        profit_margin   : aiData.profit_margin,
        reason          : aiData.reason,
        alternatives
      });
    } catch (err) {
      console.error(`[Gemini] Error: ${err.message} — using keyword fallback.`);
    }
  }

  /* ── Fallback: keyword scoring ── */
  const scored = PRODUCTS.map(p => ({ product: p, score: scoreProduct(p, query) }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0].product;
  const suggestions = scored.slice(1, 4).map(s => ({
    id       : s.product.id,
    name     : s.product.name,
    category : s.product.category,
    price    : s.product.price,
    demand   : s.product.demand,
    image    : s.product.image
  }));

  return res.json({
    success         : true,
    query,
    ai_powered      : false,
    fallback_reason : 'AI service unavailable — showing smart keyword-based recommendation.',
    product_name    : best.name,
    category        : best.category,
    price           : best.price,
    image           : best.image,
    demand          : best.demand,
    target_audience : best.target_audience,
    profit_margin   : best.profit_margin,
    reason          : best.reason,
    suggestions
  });
});

/* ══════════════════════════════════════════════════════════
   2. PRODUCT LIST
   GET /products
══════════════════════════════════════════════════════════ */
app.get('/products', (req, res) => {
  const { category, search } = req.query;

  let list = PRODUCTS;

  if (category) {
    const cat = category.toLowerCase();
    list = list.filter(p => p.category.toLowerCase().includes(cat));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    );
  }

  return res.json({
    success : true,
    total   : list.length,
    products: list.map(p => ({
      id      : p.id,
      name    : p.name,
      category: p.category,
      price   : p.price,
      mrp     : p.mrp,
      image   : p.image,
      badge   : p.badge,
      demand  : p.demand,
      discount: Math.round(((p.mrp - p.price) / p.mrp) * 100)
    }))
  });
});

/* ══════════════════════════════════════════════════════════
   3. SELECT PRODUCT (in-memory)
   POST /select-product
══════════════════════════════════════════════════════════ */
app.post('/select-product', (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required.' });
  }

  const product = findProduct(product_id);
  if (!product) {
    return res.status(404).json({ error: `Product with id "${product_id}" not found.` });
  }

  selectedProduct = product;

  return res.json({
    success : true,
    message : `Product "${product.name}" selected successfully.`,
    product : {
      id      : product.id,
      name    : product.name,
      category: product.category,
      price   : product.price,
      image   : product.image
    }
  });
});

/* ══════════════════════════════════════════════════════════
   4. PRODUCT DETAIL (Landing Page Data)
   GET /product/:id
══════════════════════════════════════════════════════════ */
app.get('/product/:id', (req, res) => {
  const product = findProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ error: `Product with id "${req.params.id}" not found.` });
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return res.json({
    success     : true,
    id          : product.id,
    title       : product.name,
    category    : product.category,
    image       : product.image,
    price       : product.price,
    mrp         : product.mrp,
    discount    : `${discount}% OFF`,
    description : product.description,
    features    : product.features,
    badge       : product.badge,
    theme_color : product.theme_color,
    rating      : (4.5 + Math.random() * 0.4).toFixed(1),
    reviews     : Math.floor(Math.random() * 1500) + 500,
    in_stock    : true,
    target_audience: product.target_audience,
    demand      : product.demand,
    profit_margin: product.profit_margin
  });
});

/* ══════════════════════════════════════════════════════════
   5. POST GENERATOR
   POST /generate-post
══════════════════════════════════════════════════════════ */
app.post('/generate-post', (req, res) => {
  const { product_id, discount = 40, offer_text = 'Limited Time Deal!' } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required.' });
  }

  const product = findProduct(product_id);
  if (!product) {
    return res.status(404).json({ error: `Product with id "${product_id}" not found.` });
  }

  const discountNum  = Math.min(99, Math.max(1, Number(discount)));
  const salePrice    = Math.round(product.mrp * (1 - discountNum / 100));
  const hashtags     = buildHashtags(product);
  const caption      = buildCaption(product, discountNum, offer_text);

  const headlines = [
    `🔥 ${discountNum}% OFF on ${product.name}!`,
    `✨ Grab Your ${product.name} Before It's Gone!`,
    `⚡ Flash Sale: ${product.name} — Only ₹${salePrice.toLocaleString('en-IN')}!`,
    `💥 Deal of the Day: ${product.name} at ${discountNum}% OFF!`
  ];

  return res.json({
    success       : true,
    product_id    : product.id,
    product_name  : product.name,
    product_image : product.image,                     // image is never modified
    headline      : headlines[Math.floor(Math.random() * headlines.length)],
    discount_text : `${discountNum}% OFF`,
    original_price: `₹${product.mrp.toLocaleString('en-IN')}`,
    sale_price    : `₹${salePrice.toLocaleString('en-IN')}`,
    offer_text,
    bg_color      : product.theme_color,
    caption,
    hashtags,
    platform_tips : {
      instagram : 'Post at 6–9 PM | Use Reels for 3× reach | Tag 3 micro-influencers',
      facebook  : 'Boost post for ₹200–₹500 | Best days: Thu–Sat',
      whatsapp  : 'Send to existing customer list first for zero-cost reach'
    }
  });
});

/* ══════════════════════════════════════════════════════════
   6. ADS & VIDEO GENERATOR
   POST /generate-ads
══════════════════════════════════════════════════════════ */
app.post('/generate-ads', (req, res) => {
  const { product_id, discount = 40 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required.' });
  }

  const product = findProduct(product_id);
  if (!product) {
    return res.status(404).json({ error: `Product with id "${product_id}" not found.` });
  }

  const discountNum = Math.min(99, Math.max(1, Number(discount)));
  const salePrice   = Math.round(product.mrp * (1 - discountNum / 100));

  const adScript = {
    hook    : `🎯 Stop scrolling! This ${product.category} deal is unbelievable…`,
    problem : `Tired of overpriced ${product.category.toLowerCase()} products that don't deliver? We have the solution.`,
    reveal  : `Introducing the ${product.name} — only ₹${salePrice.toLocaleString('en-IN')}. That's ${discountNum}% OFF the original price!`,
    proof   : `Rated ⭐ 4.8/5 by over 2,000 verified buyers. Fast delivery. Easy returns. Zero risk.`,
    cta     : `🔥 Limited stock available! Tap below to order now before it sells out!`
  };

  const googleAd = {
    headline_1 : `${product.name} — ${discountNum}% OFF`,
    headline_2 : `Only ₹${salePrice.toLocaleString('en-IN')} Today`,
    headline_3 : `Free Delivery | Easy Returns`,
    description: `Shop the bestselling ${product.name} at ${discountNum}% OFF. ${product.features[0]}. ${product.features[1]}. Order now!`,
    display_url: 'www.startify.store'
  };

  const metaAd = {
    primary_text  : `✨ ${product.name} is ${discountNum}% cheaper today only! ${product.description.slice(0, 100)}…`,
    headline      : `${discountNum}% OFF — Limited Time`,
    call_to_action: 'Shop Now',
    image         : product.image
  };

  return res.json({
    success      : true,
    product_id   : product.id,
    product_name : product.name,
    product_image: product.image,
    ad_script    : adScript,
    google_ad    : googleAd,
    meta_ad      : metaAd,
    video_url    : demoVideoUrl(product.category),
    video_note   : 'Demo placeholder video. Replace with product video for production.',
    caption      : `🔥 ${product.name} — ${discountNum}% OFF Today Only! ₹${salePrice.toLocaleString('en-IN')} | Shop at startify.store`,
    hashtags     : buildHashtags(product),
    ad_tips      : [
      'Run for 3 days minimum before judging performance.',
      'Target audiences aged 18–35 for best CPM rates.',
      'A/B test hook (first 2 seconds) — it drives 80% of results.',
      `Best budget for ${product.category}: ₹300–₹700/day on Meta.`
    ]
  });
});

/* ══════════════════════════════════════════════════════════
   7. ANALYTICS
   GET /analytics
══════════════════════════════════════════════════════════ */
app.get('/analytics', (req, res) => {
  return res.json({
    success  : true,
    store_name: selectedProduct
      ? `${selectedProduct.name.split(' ').slice(0,2).join(' ')} Store`
      : 'Startify AI Store',
    ...(generateAnalytics()),
    top_products: PRODUCTS.slice(0, 5).map(p => ({
      id      : p.id,
      name    : p.name,
      category: p.category,
      sales   : Math.floor(Math.random() * 80) + 10
    })),
    chart_data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      visitors: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 20),
      orders  : Array.from({ length: 7 }, () => Math.floor(Math.random() * 12) + 2)
    }
  });
});

/* ══════════════════════════════════════════════════════════
   CATCH-ALL — 404
══════════════════════════════════════════════════════════ */
app.use((req, res) => {
  res.status(404).json({
    error  : 'Route not found.',
    hint   : 'Make a GET request to / to see all available endpoints.'
  });
});

/* ══════════════════════════════════════════════════════════
   START SERVER
══════════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n⚡ Startify AI Backend running on http://localhost:${PORT}`);
  console.log(`   GET  /products          – Product catalogue`);
  console.log(`   GET  /product/:id       – Product detail (landing page)`);
  console.log(`   POST /ai-assistant      – AI product recommendation`);
  console.log(`   POST /select-product    – Select active product`);
  console.log(`   POST /generate-post     – Social post generator`);
  console.log(`   POST /generate-ads      – Ads & video script`);
  console.log(`   GET  /analytics         – Store analytics\n`);
});
