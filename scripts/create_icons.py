#!/usr/bin/env python3
"""
生成 AI Web Summarizer 插件圖標
使用 Pillow 創建簡單的紫色漸變圖標
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """創建指定尺寸的圖標"""
    # 創建圖像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 創建漸變背景
    for y in range(size):
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + (162 - 234) * y / size)
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b, 255))
    
    # 繪製圓角矩形
    margin = size // 8
    draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=size // 4,
        fill=(102, 126, 234, 200),
        outline=(255, 255, 255, 100),
        width=max(1, size // 16)
    )
    
    # 添加文檔 emoji（使用簡單的矩形和線條模擬）
    doc_margin = size // 4
    doc_width = size // 2
    doc_height = size // 2
    
    # 文檔背景
    draw.rounded_rectangle(
        [(doc_margin, doc_margin), 
         (doc_margin + doc_width, doc_margin + doc_height)],
        radius=size // 16,
        fill=(255, 255, 255, 230)
    )
    
    # 文檔線條（模擬文本）
    line_color = (102, 126, 234, 200)
    line_spacing = size // 12
    for i in range(3):
        y = doc_margin + doc_height // 4 + i * line_spacing
        draw.line(
            [(doc_margin + size // 12, y), 
             (doc_margin + doc_width - size // 12, y)],
            fill=line_color,
            width=max(1, size // 16)
        )
    
    # 保存圖像
    img.save(output_path, 'PNG')
    print(f"已生成：{output_path} ({size}x{size})")

def main():
    # 確保 icons 目錄存在
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    # 生成三種尺寸的圖標
    sizes = [16, 48, 128]
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, output_path)
    
    print("\n✓ 所有圖標已生成完成！")

if __name__ == '__main__':
    main()
