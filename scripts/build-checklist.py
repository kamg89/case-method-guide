"""Build the printable handout from the same content used by the learning summary.

Run with Python 3 and reportlab installed. The generated PDF is committed so normal
Vite builds and GitHub Pages deployments do not require a Python runtime.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'src/checklist.json').read_text())
OUTPUT = ROOT / 'public/downloads/case-preparation-checklist.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 612, 792  # US Letter; also fits A4 when printed to fit.
MARGIN = 38
INK = HexColor('#292b28')
ACCENT = HexColor('#722d36')
MUTED = HexColor('#51554f')
RULE = HexColor('#c6c6bf')
styles = {
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=11.5, leading=15.2,
                           textColor=INK, alignment=TA_LEFT),
    'subtitle': ParagraphStyle('subtitle', fontName='Helvetica', fontSize=10.5,
                               leading=14, textColor=MUTED),
    'footer': ParagraphStyle('footer', fontName='Helvetica', fontSize=8,
                             leading=10.4, textColor=MUTED),
}

# Measure first. A future copy change must not silently produce a second page,
# clip the footer, or shrink the body text to an unreadable size.
blocks = []
for section in DATA['sections']:
    blocks.append(('section', section['title'], 26))
    for item in section['items']:
        paragraph = Paragraph(f"<b>{escape(item['lead'])}</b> {escape(item['text'])}", styles['body'])
        _, height = paragraph.wrap(WIDTH - 2 * MARGIN - 20, HEIGHT)
        blocks.append(('item', paragraph, height + 7))

subtitle = Paragraph(escape(DATA['subtitle']), styles['subtitle'])
_, subtitle_height = subtitle.wrap(WIDTH - 2 * MARGIN, HEIGHT)
footer = Paragraph(escape(DATA['footer']), styles['footer'])
_, footer_height = footer.wrap(WIDTH - 2 * MARGIN, HEIGHT)
start_y = HEIGHT - MARGIN - 41 - subtitle_height - 6
last_y = start_y - sum(block[2] for block in blocks)
footer_top = MARGIN + footer_height
if last_y < footer_top + 15:
    raise ValueError(f'Checklist does not fit one page: content ends at {last_y:.1f}; footer needs {footer_top + 15:.1f}. Shorten the text.')

canvas = Canvas(str(OUTPUT), pagesize=(WIDTH, HEIGHT), pageCompression=1, invariant=1)
canvas.setTitle(DATA['title'])
canvas.setAuthor('Kamyar Goudarzi')
canvas.setSubject('A one-page student checklist for reading, analyzing, and discussing cases')
canvas.setFillColor(ACCENT)
canvas.setFont('Helvetica-Bold', 23)
canvas.drawString(MARGIN, HEIGHT - MARGIN - 20, DATA['title'])
subtitle.drawOn(canvas, MARGIN, HEIGHT - MARGIN - 35 - subtitle_height)

y = start_y
for kind, value, height in blocks:
    if kind == 'section':
        y -= 17
        canvas.setFillColor(ACCENT)
        canvas.setFont('Helvetica-Bold', 12)
        canvas.drawString(MARGIN, y, value)
        y -= 9
    else:
        body_height = height - 7
        canvas.setStrokeColor(MUTED)
        canvas.setLineWidth(0.7)
        canvas.rect(MARGIN + 1, y - 10, 8, 8, stroke=1, fill=0)
        value.drawOn(canvas, MARGIN + 20, y - body_height)
        y -= height

canvas.setStrokeColor(RULE)
canvas.setLineWidth(0.6)
canvas.line(MARGIN, footer_top + 8, WIDTH - MARGIN, footer_top + 8)
footer.drawOn(canvas, MARGIN, MARGIN)
canvas.showPage()
canvas.save()
print(f'Created {OUTPUT.relative_to(ROOT)}; 1 page; body 11.5 pt; bottom clearance {last_y - footer_top:.1f} pt.')
