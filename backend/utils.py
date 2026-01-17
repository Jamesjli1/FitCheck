from io import BytesIO
from PIL import Image

def compress_image(image_bytes: bytes, content_type: str, max_size_mb: float = 1.0, max_dimension: int = 1536) -> tuple[bytes, str]:
    """
    Compress image if it's too large.
    Returns: (compressed_bytes, mime_type)
    """
    # Check if image is already small enough
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb <= max_size_mb:
        return image_bytes, content_type
    
    # Open image
    img = Image.open(BytesIO(image_bytes))
    
    # Resize if dimensions are too large
    if max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Convert to RGB if necessary (removes alpha channel for JPEG)
    if img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = rgb_img
    
    # Save with compression
    output = BytesIO()
    
    # Determine format and quality
    if content_type in ['image/jpeg', 'image/jpg']:
        img.save(output, format='JPEG', quality=85, optimize=True)
        mime_type = 'image/jpeg'
    elif content_type == 'image/png':
        img.save(output, format='PNG', optimize=True)
        mime_type = 'image/png'
    elif content_type == 'image/webp':
        img.save(output, format='WEBP', quality=85, method=6)
        mime_type = 'image/webp'
    else:
        # Default to JPEG for other formats
        img.save(output, format='JPEG', quality=85, optimize=True)
        mime_type = 'image/jpeg'
    
    compressed_bytes = output.getvalue()
    
    # If compression didn't help much, return original
    if len(compressed_bytes) >= len(image_bytes):
        return image_bytes, content_type
    
    return compressed_bytes, mime_type