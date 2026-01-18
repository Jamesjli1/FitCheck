import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("SHOPIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SHOPIFY_CLIENT_SECRET")
SAVED_CATALOG = os.getenv("SHOPIFY_SAVED_CATALOG")

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("Missing SHOPIFY_CATALOG_CLIENT_ID / SHOPIFY_CATALOG_CLIENT_SECRET in .env")
if not SAVED_CATALOG:
    raise RuntimeError("Missing SHOPIFY_SAVED_CATALOG_ID in .env")

AUTH_URL = "https://api.shopify.com/auth/access_token"
MCP_URL = "https://discover.shopifyapps.com/global/mcp"


def get_token() -> str:
    resp = requests.post(
        AUTH_URL,
        json={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "client_credentials",
        },
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"No access_token in response: {data}")
    return token


def call_mcp(token: str):
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "id": 1,
        "params": {
            "name": "search_global_products",
            "arguments": {
                "query": "I need a crewneck sweater",
                "context": "buyer looking for sustainable fashion",
                "limit": 2,
                "saved_catalog": SAVED_CATALOG,
            },
        },
    }

    resp = requests.post(
        MCP_URL,
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        timeout=30,
    )
    
    resp.raise_for_status()
    return resp.json()


def format_mcp_response(mcp_response: dict) -> dict:
    """
    Extract and parse the stringified JSON returned by Shopify MCP
    """
    text_blob = mcp_response["result"]["content"][0]["text"]
    parsed = json.loads(text_blob)
    return parsed



def search_products_by_style(token: str, query: str, context: str = "", limit: int = 10) -> dict:
    """
    Search for products using Shopify MCP with custom query.
    
    Args:
        token: Shopify auth token
        query: Search query (e.g., "charcoal wool overshirt")
        context: Additional context
        limit: Max results (default 10)
    
    Returns:
        Formatted MCP response with offers
    """
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "id": 1,
        "params": {
            "name": "search_global_products",
            "arguments": {
                "query": query,
                "context": context,
                "limit": limit,
                "saved_catalog": SAVED_CATALOG,
            },
        },
    }

    resp = requests.post(
        MCP_URL,
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        timeout=30,
    )
    resp.raise_for_status()
    return format_mcp_response(resp.json())


def parse_shopify_offers_to_recommendations(parsed_mcp: dict, reasons: list = None) -> list:
    """
    Convert Shopify MCP offers to Recommendation objects matching frontend type.
    
    Args:
        parsed_mcp: Parsed JSON response from Shopify MCP with "offers" key
        reasons: List of reasons explaining the recommendations
    
    Returns:
        List of recommendation dicts matching frontend Recommendation type
    """
    if reasons is None:
        reasons = ["Matches your style"]
    
    recommendations = []
    
    for offer in parsed_mcp.get("offers", []):
        # Basic product info
        title = offer.get("title", "Unknown Product")
        
        # Get URL from first variant
        url = None
        variants = offer.get("variants", [])
        if variants and len(variants) > 0:
            url = variants[0].get("variantUrl")
        
        # Price info
        price_obj = offer.get("priceRange", {}).get("min", {})
        price = None
        if price_obj.get("amount"):
            currency = price_obj.get("currency", "USD")
            amount = price_obj.get("amount")
            # Amount is in cents, convert to dollars
            amount_decimal = float(amount) / 100
            price = f"${amount_decimal:.2f}" if currency == "USD" else f"{amount_decimal:.2f} {currency}"
        
        # Vendor info
        vendor = None
        variants = offer.get("variants", [])
        if variants and variants[0].get("shop"):
            vendor = variants[0]["shop"].get("name")
        
        # Extract colors & sizes from options
        colors = []
        sizes = []
        for option in offer.get("options", []):
            name = option.get("name", "").lower()
            values = [v.get("value") for v in option.get("values", [])]
            
            if "color" in name:
                colors = values
            elif "size" in name:
                sizes = values
        
        # Image URL - get from media attribute
        image_url = None
        media = offer.get("media", [])
        if media and len(media) > 0:
            image_url = media[0].get("url")
        
        # Rating info
        rating = offer.get("rating")
        rating_count = offer.get("ratingCount")
        
        # Build recommendation object
        recommendation = {
            "id": offer.get("id"),
            "title": title,
            "price": price,
            "imageUrl": image_url,
            "productUrl": url,
            "rating": rating,
            "ratingCount": rating_count,
            "vendor": vendor,
            "sizes": sizes,
            "colors": colors,
            "tags": [],
            "description": offer.get("description"),
            "inStock": offer.get("availableForSale", True),
            "reasons": reasons,
        }
        
        recommendations.append(recommendation)
    
    return recommendations



if __name__ == "__main__":
    token = get_token()
    raw_result = call_mcp(token)

    # 🔹 Parse MCP response
    formatted = format_mcp_response(raw_result)

    # 🔹 Pretty print full structured response
    # print("FULL FORMATTED RESPONSE:")
    # print(json.dumps(formatted, indent=2))

    parsed = format_mcp_response(raw_result)
    products = extract_minimal_products(parsed)

    for p in products:
        print("Product:", p["product_name"])
        print("Shop:", p["shop_name"])
        print("Price:", p["price"])
        print("URL:", p["url"])
        print("Colors:", ", ".join(p["colors"]) if p["colors"] else "N/A")
        print("Sizes:", ", ".join(p["sizes"]) if p["sizes"] else "N/A")
        print("-" * 40)

    # 🔹 Optional: clean summary
    # print("\nSUMMARY:")
    # for offer in formatted.get("offers", []):
    #     price = offer["priceRange"]["min"]
    #     shop = offer["variants"][0]["shop"]["name"]
    #     print(f"- {offer['title']} | {price['amount']} {price['currency']} | {shop}")