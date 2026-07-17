import json
import os
import fitz  # PyMuPDF
from PIL import Image
import io

def main():
    certs_path = "content/certificates.json"
    base_dir = "public"
    out_dir = os.path.join(base_dir, "assets", "certificate-previews")
    
    os.makedirs(out_dir, exist_ok=True)
    
    with open(certs_path, "r", encoding="utf-8") as f:
        certs = json.load(f)
        
    for cert in certs:
        pdf_path = cert.get("certificateFile")
        if not pdf_path or not pdf_path.endswith(".pdf"):
            continue
            
        full_pdf_path = os.path.join(base_dir, pdf_path.lstrip("/"))
        if not os.path.exists(full_pdf_path):
            print(f"File not found: {full_pdf_path}")
            continue
            
        basename = os.path.basename(full_pdf_path)
        name_without_ext = os.path.splitext(basename)[0]
        out_webp_path = os.path.join(out_dir, f"{name_without_ext}.webp")
        
        # Render first page
        try:
            doc = fitz.open(full_pdf_path)
            page = doc.load_page(0)  # page 1
            # Render at higher resolution: default is 72 dpi. We want ~1200px wide.
            rect = page.rect
            width = rect.width
            zoom = 1200 / width
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Convert to PIL Image
            img_data = pix.tobytes("ppm")
            img = Image.open(io.BytesIO(img_data))
            
            # Save as WebP
            img.save(out_webp_path, "WEBP", quality=85)
            print(f"Generated: {out_webp_path}")
            doc.close()
        except Exception as e:
            print(f"Error processing {full_pdf_path}: {e}")

if __name__ == '__main__':
    main()
