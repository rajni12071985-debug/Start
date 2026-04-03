# =============================================================
#  STARTIFY AI - BACKEND SERVER (Python Flask)
#  Run: python app.py
#  Runs on http://localhost:3000
# =============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
import json
from typing import Any, Dict, List
import itertools

# -- Load .env file manually (no third-party dependency needed) -
def _load_env(filepath: str) -> None:
    """Read key=value pairs from .env and set them as env vars."""
    if not os.path.isfile(filepath):
        return
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value

_load_env(os.path.join(os.path.dirname(__file__), ".env"))

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

app = Flask(__name__)
CORS(app)  # Allow all origins for hackathon demo

# -------------------------------------------------------------
#  IN-MEMORY PRODUCT CATALOGUE
# -------------------------------------------------------------
PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "1",
        "name": "Gold Diamond Necklace",
        "category": "Jewellery",
        "price": 1299,
        "mrp": 2499,
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=85&auto=format&fit=crop",
        "description": "Elegant 18K gold pendant necklace with real diamond accent. Crafted for special occasions, anniversaries, and thoughtful gifting. Comes in premium packaging.",
        "features": ["18K Gold Plated", "Real Diamond Accent", "Gift-Ready Packaging", "Adjustable Chain Length", "Nickel-Free & Hypoallergenic"],
        "badge": "Best Seller",
        "theme_color": "#f0b840",
        "keywords": ["jewellery", "necklace", "girls", "women", "gift", "gold", "diamond", "accessories"],
        "target_audience": "Women aged 18-45, gift buyers, brides-to-be",
        "demand": "High",
        "profit_margin": "55%",
        "reason": "Jewellery has consistently high demand with strong social-media virality. Gold-tone pieces are perennially trendy and command premium pricing."
    },
    {
        "id": "2",
        "name": "Smart LED Desk Lamp",
        "category": "LED Lamp",
        "price": 799,
        "mrp": 1499,
        "image": "https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d?w=400&q=85&auto=format&fit=crop",
        "description": "Adjustable smart LED lamp with touch control, 3 colour modes and USB charging port. Energy efficient and stylish - perfect for study desks and home offices.",
        "features": ["Touch Control Dimmer", "3 Colour Modes (Warm/Cool/Natural)", "USB Charging Port", "Eye-Care Flicker-Free Tech", "360 Adjustable Arm"],
        "badge": "Trending",
        "theme_color": "#00e5ff",
        "keywords": ["led", "lamp", "light", "students", "study", "desk", "office", "work from home", "low budget", "tech"],
        "target_audience": "Students, remote workers, homeowners aged 16-35",
        "demand": "High",
        "profit_margin": "62%",
        "reason": "LED lamps rank among the top-10 dropshipping products globally. Remote work culture keeps demand permanently elevated year-round."
    },
    {
        "id": "3",
        "name": "Bestseller Book Bundle",
        "category": "Books",
        "price": 499,
        "mrp": 999,
        "image": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=85&auto=format&fit=crop",
        "description": "Curated set of 3 bestselling books on mindset, productivity and financial freedom. Handpicked titles to help you grow personally and professionally.",
        "features": ["Set of 3 Bestsellers", "Mindset & Productivity Focus", "Financial Independence Guide", "Gift-Worthy Presentation", "Suitable for Age 16+"],
        "badge": "Hot Pick",
        "theme_color": "#b388ff",
        "keywords": ["books", "students", "education", "reading", "learning", "mindset", "low budget", "knowledge"],
        "target_audience": "Students, self-improvement enthusiasts, young professionals aged 16-30",
        "demand": "Medium",
        "profit_margin": "48%",
        "reason": "Book bundles generate high AOV and repeat purchases. Self-improvement content is an evergreen category with strong buyer intent."
    },
    {
        "id": "4",
        "name": "Glow Serum Pro",
        "category": "Skincare",
        "price": 649,
        "mrp": 1299,
        "image": "https://images.unsplash.com/photo-1570194065650-d99fb4b26a7?w=400&q=85&auto=format&fit=crop",
        "description": "Advanced Vitamin C + Hyaluronic Acid serum for glass-like radiant skin. Dermatologist approved and fragrance-free formula. Suitable for all skin types.",
        "features": ["Vitamin C + Hyaluronic Acid", "Dermatologist Approved", "Cruelty Free & Vegan", "Fragrance-Free Formula", "Visible Glow in 14 Days"],
        "badge": "New",
        "theme_color": "#ff7043",
        "keywords": ["skincare", "serum", "girls", "women", "beauty", "glow", "skin", "face", "vitamin c", "beauty products"],
        "target_audience": "Women aged 18-40 interested in clean beauty and skincare routines",
        "demand": "High",
        "profit_margin": "68%",
        "reason": "Skincare is the fastest-growing beauty segment. Vitamin C serums are a hero SKU with strong repeat purchase rates and organic social proof."
    },
    {
        "id": "5",
        "name": "Minimal Decor Vase",
        "category": "Home Decor",
        "price": 449,
        "mrp": 899,
        "image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=85&auto=format&fit=crop",
        "description": "Hand-crafted ceramic vase with abstract modern design. An art piece that elevates any living room, bedroom, or workspace. Perfect housewarming gift.",
        "features": ["Handcrafted Ceramic", "Abstract Modern Design", "Matte Finish Coating", "Perfect for Dried Flowers", "Housewarming Gift Ideal"],
        "badge": "Exclusive",
        "theme_color": "#66bb6a",
        "keywords": ["home decor", "vase", "decor", "interior", "home", "gift", "aesthetic", "room", "housewarming"],
        "target_audience": "Homeowners and renters aged 25-50, interior decor enthusiasts",
        "demand": "Medium",
        "profit_margin": "55%",
        "reason": "Home decor saw a 3x boost post-pandemic and sustained growth. Aesthetic products convert extremely well on Pinterest and Instagram."
    },
    {
        "id": "6",
        "name": "Premium Oversized Hoodie",
        "category": "Clothes",
        "price": 899,
        "mrp": 1799,
        "image": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85&auto=format&fit=crop",
        "description": "400GSM cotton-blend oversized hoodie with fleece interior. Ultra-cozy, unisex streetwear design. Available in 6 colours. Easy returns within 7 days.",
        "features": ["400 GSM Heavy Cotton Blend", "Fleece Interior Lining", "Unisex Oversized Fit", "Available in 6 Colours", "Shrink-Resistant & Durable"],
        "badge": "Top Rated",
        "theme_color": "#e0e0e0",
        "keywords": ["hoodie", "clothes", "fashion", "clothing", "students", "boys", "girls", "streetwear", "winter", "apparel"],
        "target_audience": "Gen-Z and millennials aged 16-30, streetwear lovers",
        "demand": "High",
        "profit_margin": "60%",
        "reason": "Oversized hoodies dominate fashion trends across all demographics. Streetwear converts powerfully on Instagram Reels and Meesho."
    },
    {
        "id": "7",
        "name": "Luxury Minimalist Watch",
        "category": "Watch",
        "price": 2499,
        "mrp": 4999,
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85&auto=format&fit=crop",
        "description": "Swiss-movement slim watch with sapphire crystal glass and genuine leather strap. Timeless luxury aesthetic that pairs perfectly with formal and casual looks.",
        "features": ["Swiss Quartz Movement", "Sapphire Crystal Glass", "Genuine Leather Strap", "Water Resistant 30M", "2-Year Brand Warranty"],
        "badge": "Premium",
        "theme_color": "#ffd54f",
        "keywords": ["watch", "luxury", "men", "boys", "gift", "premium", "accessories", "formal", "style", "fashion"],
        "target_audience": "Men and women aged 22-45, professionals, gift buyers",
        "demand": "High",
        "profit_margin": "70%",
        "reason": "Watches have the highest profit margins in fashion accessories. Premium watches grow 18% YoY and have outstanding gifting appeal."
    },
    {
        "id": "8",
        "name": "Matte Luxe Lipstick",
        "category": "Makeup",
        "price": 349,
        "mrp": 699,
        "image": "https://images.unsplash.com/photo-1586495777744-4e6232bf2823?w=400&q=85&auto=format&fit=crop",
        "description": "Long-lasting 12-hour matte finish lipstick with moisturising formula. Bold, buildable colour payoff in 8 gorgeous shades. Zero transfer, all-day comfort.",
        "features": ["12-Hour Long-Lasting Wear", "Moisturising Matte Formula", "Zero-Transfer Technology", "8 Gorgeous Shades", "Cruelty-Free & Vegan"],
        "badge": "Fan Fave",
        "theme_color": "#f48fb1",
        "keywords": ["lipstick", "makeup", "beauty", "girls", "women", "cosmetics", "low budget", "matte", "lip colour"],
        "target_audience": "Women aged 16-38, beauty enthusiasts, makeup beginners",
        "demand": "High",
        "profit_margin": "65%",
        "reason": "Cosmetics lead in impulse-buy categories. Lipstick has the highest reorder rate in beauty and is recession-proof."
    },
    {
        "id": "9",
        "name": "Air-Boost Sneakers",
        "category": "Shoes",
        "price": 1599,
        "mrp": 2999,
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85&auto=format&fit=crop",
        "description": "Ultra-lightweight running sneakers with responsive foam sole and breathable mesh upper. Engineered for all-day comfort from gym sessions to casual street walks.",
        "features": ["Ultra-Lightweight Design", "Responsive Foam Sole", "Breathable Mesh Upper", "Unisex Sizing (UK 5-11)", "Anti-Slip Rubber Outsole"],
        "badge": "New Arrival",
        "theme_color": "#ef5350",
        "keywords": ["shoes", "sneakers", "footwear", "sports", "running", "gym", "boys", "men", "fashion", "fitness"],
        "target_audience": "Fitness enthusiasts, students, and sneakerheads aged 16-35",
        "demand": "High",
        "profit_margin": "58%",
        "reason": "Footwear is a $400B global market. Sneakers have the strongest social proof loop - unboxing content drives organic reach."
    },
    {
        "id": "10",
        "name": "Wireless Bluetooth Earbuds",
        "category": "Electronics",
        "price": 1199,
        "mrp": 2499,
        "image": "https://images.unsplash.com/photo-1590658165737-15a047b7c835?w=400&q=85&auto=format&fit=crop",
        "description": "Premium TWS earbuds with Active Noise Cancellation, 30-hour battery life, and crystal-clear call quality. IPX5 water-resistant for workouts and daily commutes.",
        "features": ["Active Noise Cancellation", "30-Hour Battery (Earbuds + Case)", "IPX5 Water Resistant", "Touch Control Interface", "Compatible with iOS & Android"],
        "badge": "Editor's Choice",
        "theme_color": "#42a5f5",
        "keywords": ["earbuds", "bluetooth", "wireless", "audio", "music", "tech", "students", "electronics", "gadgets", "low budget", "boys", "girls"],
        "target_audience": "Tech-savvy students and professionals aged 18-35",
        "demand": "High",
        "profit_margin": "63%",
        "reason": "TWS earbuds are the #1 consumer electronics product by search volume on Amazon India. Exceptional gifting potential."
    }
]

# In-memory state
selected_product: Dict[str, Any] = {}
visitor_count: int = random.randint(200, 600)


# -------------------------------------------------------------
#  HELPER FUNCTIONS
# -------------------------------------------------------------

def find_product(pid: str) -> Dict[str, Any]:
    """Return product dict by id, or empty dict if not found."""
    return next((p for p in PRODUCTS if p["id"] == str(pid)), {})


def score_product(product: Dict[str, Any], query: str) -> int:
    """Score a product against a search query using keyword matching."""
    q: str = query.lower()
    keywords: List[Any] = list(product.get("keywords", []))

    kw_scores: List[int] = [
        int(3) if len(str(kw)) > 4 else int(1)
        for kw in keywords
        if str(kw) in q
    ]
    cat_score: int = int(5) if str(product.get("category", "")).lower() in q else int(0)
    name_score: int = int(8) if str(product.get("name", "")).lower() in q else int(0)

    return int(sum(kw_scores)) + cat_score + name_score


def build_hashtags(product: dict) -> list:
    cat = product["category"].replace(" ", "")
    name_word = product["name"].split()[0]
    return [
        f"#{cat}", "#ShopNow", "#SaleAlert",
        f"#{name_word}", "#OnlineShopping",
        "#Startify", "#TrendingNow", "#MustHave",
        "#BuyNow", f"#{cat}Sale"
    ]


def build_caption(product: Dict[str, Any], discount: int, offer_text: str) -> str:
    desc_snippet = product["description"][:90]
    lines = [
        f"Introducing the {product['name']} - your new favourite {product['category'].lower()} essential!",
        f"{offer_text}! Get it now at {discount}% OFF!",
        f"{desc_snippet}...",
        "Limited stock. Don't miss out!",
        "Tap the link in bio to order now!"
    ]
    return "\n\n".join(lines)


def generate_analytics() -> Dict[str, Any]:
    global visitor_count
    visitor_count = 100
    visitor_count += random.randint(0, 6)
    orders = int(visitor_count * (0.04 + random.random() * 0.04))
    rate = round((orders / visitor_count) * 100, 1) if visitor_count else 0
    revenue = orders * 850 + random.randint(0, 2000)
    return {
        "visitors": visitor_count,
        "orders": orders,
        "conversion_rate": f"{rate}%",
        "revenue": f"Rs.{revenue:,}",
        "avg_order_value": f"Rs.{random.randint(800, 1400):,}",
        "top_category": "Skincare",
        "bounce_rate": f"{random.randint(30, 55)}%",
        "session_duration": f"{round(1 + random.random() * 3, 1)} min",
    }


# -------------------------------------------------------------
#  GEMINI AI HELPERS
# -------------------------------------------------------------

def call_gemini(query: str) -> Dict[str, Any]:
    """Call Gemini 2.0 Flash API and return a parsed JSON dict."""
    import urllib.request
    import urllib.error

    gemini_url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    )

    prompt = (
        "You are a beginner-friendly business assistant.\n"
        "Suggest a trending product based on the user's query.\n\n"
        "Return ONLY valid JSON - no markdown, no code fences - with exactly these keys:\n"
        "  product_name      (string)\n"
        "  category          (string)\n"
        "  demand            (\"High\" | \"Medium\" | \"Low\")\n"
        "  target_audience   (string)\n"
        "  profit_margin     (string, e.g. \"65%\")\n"
        "  reason            (string, 1-2 sentences)\n"
        "  alternatives      (array of 2 objects, each with: product_name, category, demand)\n\n"
        f"User Query: {query}"
    )

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 512
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        gemini_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        body: Dict[str, Any] = json.loads(resp.read().decode("utf-8"))

    raw_text: str = body["candidates"][0]["content"]["parts"][0]["text"].strip()

    # Strip markdown code fences if Gemini wraps the JSON anyway
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    result: Dict[str, Any] = json.loads(raw_text)
    return result


def encode_image(image_url: str):
    import urllib.request
    import base64
    import mimetypes
    try:
        if image_url.startswith("http"):
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                content_type = response.headers.get_content_type()
                return base64.b64encode(response.read()).decode('utf-8'), content_type
        else:
            # Local file fallback
            local_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), image_url.strip("/"))
            with open(local_path, "rb") as f:
                content_type = mimetypes.guess_type(local_path)[0] or "image/png"
                return base64.b64encode(f.read()).decode('utf-8'), content_type
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None, None

def call_gemini_video_script(product: Dict[str, Any], sale_price: int, discount: int) -> Dict[str, Any]:
    b64_img, mime_type = encode_image(product.get("image", ""))
    import urllib.request
    import json
    
    gemini_url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    )

    prompt = (
        f"You are an expert video ad director. Analyze the provided product image and details to create a highly converting 8-second video ad script.\n"
        f"Product: {product['name']}\n"
        f"Category: {product['category']}\n"
        f"Sale Price: Rs.{sale_price:,} ({discount}% OFF!)\n"
        f"Description: {product['description']}\n\n"
        "Return ONLY valid JSON with exactly these keys:\n"
        "  hook       (string, 0-2s hook text)\n"
        "  problem    (string, 2-4s text)\n"
        "  reveal     (string, 4-6s text)\n"
        "  cta        (string, 6-8s text)\n"
        "  visual_notes (string, brief visual description based on the image)"
    )

    parts = [{"text": prompt}]
    if b64_img and mime_type:
        parts.append({
            "inlineData": {
                "mimeType": mime_type,
                "data": b64_img
            }
        })
        
    payload = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        gemini_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    raw_text = body["candidates"][0]["content"]["parts"][0]["text"].strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    return json.loads(raw_text)


def build_fallback_response(query: str) -> Dict[str, Any]:
    """Keyword-scored fallback when Gemini is unavailable."""
    scored: List[Dict[str, Any]] = sorted(PRODUCTS, key=lambda p: score_product(p, query), reverse=True)
    best: Dict[str, Any] = scored[0]
    alts: List[Dict[str, Any]] = [
        {"product_name": str(p["name"]), "category": str(p["category"]), "demand": str(p["demand"])}
        for p in scored
        if scored.index(p) in (1, 2)
    ]
    return {
        "product_name": best["name"],
        "category": best["category"],
        "demand": best["demand"],
        "target_audience": best["target_audience"],
        "profit_margin": best["profit_margin"],
        "reason": best["reason"],
        "alternatives": alts,
        "image": best["image"],
        "price": best["price"],
        "ai_powered": False,
        "fallback_reason": "AI service unavailable - showing smart keyword-based recommendation."
    }


# -------------------------------------------------------------
#  ROUTES
# -------------------------------------------------------------

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Startify AI Backend - Running!",
        "version": "1.0.0",
        "endpoints": [
            "POST /ai-assistant",
            "GET  /products",
            "GET  /product/<id>",
            "POST /select-product",
            "POST /generate-post",
            "POST /generate-ads",
            "GET  /analytics"
        ]
    })


# -- 1. AI BUSINESS ASSISTANT  POST /ai-assistant ------------
@app.route("/ai-assistant", methods=["POST"])
def ai_assistant():
    data = request.get_json(silent=True) or {}
    query: str = str(data.get("query", "")).strip()

    if not query:
        return jsonify({"error": "query field is required and must be a non-empty string."}), 400

    # Try Gemini AI first
    if GEMINI_API_KEY and GEMINI_API_KEY not in ("your_gemini_api_key_here", ""):
        try:
            ai_data = call_gemini(query)

            required = {"product_name", "category", "demand",
                        "target_audience", "profit_margin", "reason", "alternatives"}
            if not required.issubset(ai_data.keys()):
                raise ValueError("Gemini response missing required fields.")

            alternatives = ai_data["alternatives"]
            if isinstance(alternatives, list):
                alt_list: List[Any] = [x for x in itertools.islice(alternatives, 2)]
                alternatives = alt_list
            else:
                alternatives = []

            return jsonify({
                "success": True,
                "query": query,
                "ai_powered": True,
                "product_name": ai_data["product_name"],
                "category": ai_data["category"],
                "demand": ai_data["demand"],
                "target_audience": ai_data["target_audience"],
                "profit_margin": ai_data["profit_margin"],
                "reason": ai_data["reason"],
                "alternatives": alternatives
            })

        except Exception as ex:
            print(f"[Gemini] Error: {ex} - using fallback.")

    # Fallback: smart keyword scoring
    fallback = build_fallback_response(query)
    return jsonify({"success": True, "query": query, **fallback})


# -- 2. PRODUCT LIST  GET /products --------------------------
@app.route("/products", methods=["GET"])
def get_products():
    category = request.args.get("category", "").lower()
    search = request.args.get("search", "").lower()

    products = list(PRODUCTS)
    if category:
        products = [p for p in products if category in p["category"].lower()]
    if search:
        products = [p for p in products if
                    search in p["name"].lower() or
                    search in p["category"].lower() or
                    any(search in k for k in p["keywords"])]

    return jsonify({
        "success": True,
        "total": len(products),
        "products": [
            {
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "price": p["price"],
                "mrp": p["mrp"],
                "image": p["image"],
                "badge": p["badge"],
                "demand": p["demand"],
                "discount": round(((p["mrp"] - p["price"]) / p["mrp"]) * 100)
            }
            for p in products
        ]
    })


# -- 3. SELECT PRODUCT  POST /select-product -----------------
@app.route("/select-product", methods=["POST"])
def select_product():
    global selected_product
    data = request.get_json(silent=True) or {}
    product_id: str = str(data.get("product_id", "")).strip()

    if not product_id:
        return jsonify({"error": "product_id is required."}), 400

    product = find_product(product_id)
    if not product:
        return jsonify({"error": f'Product with id "{product_id}" not found.'}), 404

    selected_product = product
    return jsonify({
        "success": True,
        "message": f'Product "{product["name"]}" selected successfully.',
        "product": {
            "id": product["id"],
            "name": product["name"],
            "category": product["category"],
            "price": product["price"],
            "image": product["image"]
        }
    })


# -- 4. PRODUCT DETAIL  GET /product/<id> --------------------
@app.route("/product/<pid>", methods=["GET"])
def get_product(pid: str):
    product = find_product(pid)
    if not product:
        return jsonify({"error": f'Product with id "{pid}" not found.'}), 404

    discount = round(((product["mrp"] - product["price"]) / product["mrp"]) * 100)
    return jsonify({
        "success": True,
        "id": product["id"],
        "title": product["name"],
        "category": product["category"],
        "image": product["image"],
        "price": product["price"],
        "mrp": product["mrp"],
        "discount": f"{discount}% OFF",
        "description": product["description"],
        "features": product["features"],
        "badge": product["badge"],
        "theme_color": product["theme_color"],
        
        "reviews": random.randint(500, 2000),
        "in_stock": True,
        "target_audience": product["target_audience"],
        "demand": product["demand"],
        "profit_margin": product["profit_margin"]
    })


# -- 5. POST GENERATOR  POST /generate-post ------------------
@app.route("/generate-post", methods=["POST"])
def generate_post():
    data = request.get_json(silent=True) or {}
    product_id: str = str(data.get("product_id", "")).strip()
    discount: int = int(data.get("discount", 40))
    offer_text: str = str(data.get("offer_text", "Limited Time Deal!"))

    if not product_id:
        return jsonify({"error": "product_id is required."}), 400

    product = find_product(product_id)
    if not product:
        return jsonify({"error": f'Product with id "{product_id}" not found.'}), 404

    discount = min(99, max(1, discount))
    sale_price = round(product["mrp"] * (1 - discount / 100))
    hashtags = build_hashtags(product)
    caption = build_caption(product, discount, offer_text)

    headlines = [
        f"{discount}% OFF on {product['name']}!",
        f"Grab Your {product['name']} Before It's Gone!",
        f"Flash Sale: {product['name']} - Only Rs.{sale_price:,}!",
        f"Deal of the Day: {product['name']} at {discount}% OFF!"
    ]

    return jsonify({
        "success": True,
        "product_id": product["id"],
        "product_name": product["name"],
        "product_image": product["image"],
        "headline": random.choice(headlines),
        "discount_text": f"{discount}% OFF",
        "original_price": f"Rs.{product['mrp']:,}",
        "sale_price": f"Rs.{sale_price:,}",
        "offer_text": offer_text,
        "bg_color": product["theme_color"],
        "caption": caption,
        "hashtags": hashtags,
        "platform_tips": {
            "instagram": "Post at 6-9 PM | Use Reels for 3x reach | Tag 3 micro-influencers",
            "facebook": "Boost post for Rs.200-500 | Best days: Thu-Sat",
            "whatsapp": "Send to existing customer list first for zero-cost reach"
        }
    })


# -- 6. ADS & VIDEO GENERATOR  POST /generate-ads ------------
@app.route("/generate-ads", methods=["POST"])
def generate_ads():
    data = request.get_json(silent=True) or {}
    product_id: str = str(data.get("product_id", "")).strip()
    discount: int = int(data.get("discount", 40))

    if not product_id:
        return jsonify({"error": "product_id is required."}), 400

    product = find_product(product_id)
    if not product:
        return jsonify({"error": f'Product with id "{product_id}" not found.'}), 404

    discount = min(99, max(1, discount))
    sale_price = round(product["mrp"] * (1 - discount / 100))
    cat: str = product["category"]

    ad_script = {
        "hook": f"Stop scrolling! This {cat} deal is unbelievable...",
        "problem": f"Tired of overpriced {cat.lower()} products that don't deliver? We have the solution.",
        "reveal": f"Introducing the {product['name']} - only Rs.{sale_price:,}. That's {discount}% OFF the original price!",
        "proof": "Rated 4.8/5 by over 2,000 verified buyers. Fast delivery. Easy returns. Zero risk.",
        "cta": "Limited stock available! Tap below to order now before it sells out!"
    }

    if GEMINI_API_KEY and GEMINI_API_KEY not in ("your_gemini_api_key_here", ""):
        try:
            ai_data = call_gemini_video_script(product, sale_price, discount)
            ad_script = {
                "hook": "🎯 " + ai_data.get("hook", ad_script["hook"]),
                "problem": "💡 " + ai_data.get("problem", ad_script["problem"]),
                "reveal": "🔥 " + ai_data.get("reveal", ad_script["reveal"]),
                "cta": "🛍️ " + ai_data.get("cta", ad_script["cta"]),
                "visual_notes": "📸 " + ai_data.get("visual_notes", "")
            }
        except Exception as e:
            print(f"[Gemini] Error generating ad script: {e}")


    google_ad = {
        "headline_1": f"{product['name']} - {discount}% OFF",
        "headline_2": f"Only Rs.{sale_price:,} Today",
        "headline_3": "Free Delivery | Easy Returns",
        "description": f"Shop the bestselling {product['name']} at {discount}% OFF. {str(product['features'][0])}. {str(product['features'][1])}. Order now!",
        "display_url": "www.startify.store"
    }

    meta_ad = {
        "primary_text": f"{product['name']} is {discount}% cheaper today only! {product['description'][:100]}...",
        "headline": f"{discount}% OFF - Limited Time",
        "call_to_action": "Shop Now",
        "image": product["image"]
    }

    return jsonify({
        "success": True,
        "product_id": product["id"],
        "product_name": product["name"],
        "product_image": product["image"],
        "ad_script": ad_script,
        "google_ad": google_ad,
        "meta_ad": meta_ad,
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "video_note": "Demo placeholder video. Replace with product video for production.",
        "caption": f"{product['name']} - {discount}% OFF Today Only! Rs.{sale_price:,} | Shop at startify.store",
        "hashtags": build_hashtags(product),
        "ad_tips": [
            "Run for 3 days minimum before judging performance.",
            "Target audiences aged 18-35 for best CPM rates.",
            "A/B test hook (first 2 seconds) - it drives 80% of results.",
            f"Best budget for {cat}: Rs.300-700/day on Meta."
        ]
    })


# -- 7. ANALYTICS  GET /analytics ----------------------------
@app.route("/analytics", methods=["GET"])
def analytics():
    store_name = (
        " ".join(selected_product["name"].split()[:2]) + " Store"
        if selected_product else "Startify AI Store"
    )
    stats = generate_analytics()
    return jsonify({
        "success": True,
        "store_name": store_name,
        **stats,
        "top_products": [
            {
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "sales": random.randint(10, 90)
            }
            for p in itertools.islice(PRODUCTS, 5)
        ],
        "chart_data": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "visitors": [random.randint(20, 80) for _ in range(7)],
            "orders": [random.randint(2, 14) for _ in range(7)]
        }
    })


# -- 404 handler ---------------------------------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Route not found.",
        "hint": "Make a GET request to / to see all available endpoints."
    }), 404


# -------------------------------------------------------------
#  START
# -------------------------------------------------------------
if __name__ == "__main__":
    print("\nStartify AI Backend running on http://localhost:3000")
    print("   GET  /products          - Product catalogue")
    print("   GET  /product/<id>      - Product detail (landing page)")
    print("   POST /ai-assistant      - AI product recommendation")
    print("   POST /select-product    - Select active product")
    print("   POST /generate-post     - Social post generator")
    print("   POST /generate-ads      - Ads & video script")
    print("   GET  /analytics         - Store analytics\n")
    app.run(host="0.0.0.0", port=3000, debug=True)
