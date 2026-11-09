import re
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Preformatted, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(
                36, 810,
                "Voice Biometric Intelligence & Cloning Detection — BiLSTM, FFT & MFCC Guide"
            )
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 804, 559, 804)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(36, 36, 559, 36)
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 25, page_str)
        self.drawString(36, 25, "B.Tech CSE Major Project (23CSE750) — Technical Reference & Viva Guide")
        self.restoreState()


def clean_inline_md(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic *text*
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    # Code `code`
    text = re.sub(r"`(.+?)`", r'<font face="Courier" color="#0f172a">\1</font>', text)
    # Symbols
    text = text.replace(r"\tau", "&tau;")
    text = text.replace(r"\Delta", "&Delta;")
    text = text.replace(r"\mathcal{O}", "O")
    text = text.replace(r"\le", "&le;")
    text = text.replace(r"\ge", "&ge;")
    text = text.replace(r"\to", "&rarr;")
    text = text.replace(r"\approx", "&asymp;")
    text = text.replace(r"\cdot", "&middot;")
    text = text.replace(r"\times", "&times;")
    return text


def parse_and_build_pdf():
    project_dir = Path(r"C:\Users\khami\OneDrive\Documents\Speaker recongnition")
    md_path = project_dir / "reports" / "Voice_Recognition_Viva_Guide_BiLSTM_FFT_MFCC.md"
    pdf_path = project_dir / "reports" / "Voice_Recognition_Viva_Guide_BiLSTM_FFT_MFCC.pdf"
    
    print(f"Reading markdown from: {md_path}")
    raw_md = md_path.read_text(encoding="utf-8")
    lines = raw_md.splitlines()
    
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    
    sub_title_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=5
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=3
    )
    
    answer_box_style = ParagraphStyle(
        'AnswerBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#14532d')
    )
    
    flowables = []
    
    # Document Header Title Block
    flowables.append(Paragraph("Voice Biometric Intelligence &amp; Voice Cloning Detection", title_style))
    flowables.append(Paragraph("<b>COMPREHENSIVE TECHNICAL &amp; VIVA DEFENSE GUIDE (BiLSTM, FFT, MFCC)</b> &mdash; B.Tech CSE (23CSE750)", sub_title_style))
    flowables.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=10))
    
    in_code = False
    code_lines = []
    in_table = False
    table_raw_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Code block
        if stripped.startswith("```"):
            if in_code:
                in_code = False
                code_text = "\n".join(code_lines)
                pre = Preformatted(
                    code_text,
                    ParagraphStyle(
                        'CodeText',
                        fontName='Courier',
                        fontSize=7.2,
                        leading=9.2,
                        textColor=colors.HexColor('#0f172a')
                    )
                )
                t_box = Table([[pre]], colWidths=[523])
                t_box.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                    ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#cbd5e1')),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ]))
                flowables.append(Spacer(1, 4))
                flowables.append(t_box)
                flowables.append(Spacer(1, 4))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            i += 1
            continue
            
        if in_code:
            code_lines.append(line)
            i += 1
            continue
            
        # Tables
        if "|" in line and stripped.startswith("|") and stripped.endswith("|"):
            if not in_table:
                in_table = True
                table_raw_lines = []
            table_raw_lines.append(stripped)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                # Build Table
                parsed_rows = []
                is_header = True
                for r_idx, r_text in enumerate(table_raw_lines):
                    cols = [c.strip() for c in r_text.split("|")[1:-1]]
                    if r_idx == 1 and all(set(c).issubset({'-', ':', ' '}) for c in cols):
                        is_header = False
                        continue
                    
                    row_cells = []
                    for c_idx, col in enumerate(cols):
                        c_fmt = clean_inline_md(col)
                        style_to_use = ParagraphStyle(
                            'TH', parent=body_style,
                            fontName='Helvetica-Bold' if is_header and r_idx == 0 else 'Helvetica',
                            fontSize=7.6,
                            leading=10,
                            textColor=colors.HexColor('#0f172a') if is_header and r_idx == 0 else colors.HexColor('#1e293b')
                        )
                        row_cells.append(Paragraph(c_fmt, style_to_use))
                    parsed_rows.append(row_cells)
                
                if parsed_rows:
                    num_cols = len(parsed_rows[0])
                    avail_width = 523
                    col_w = [avail_width / num_cols] * num_cols
                    # Custom adjust for 5-col comparison table
                    if num_cols == 5:
                        col_w = [110, 85, 100, 114, 114]
                    
                    t_flowable = Table(parsed_rows, colWidths=col_w, repeatRows=1)
                    t_flowable.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#cbd5e1')),
                        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                        ('TOPPADDING', (0,0), (-1,-1), 4),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                        ('LEFTPADDING', (0,0), (-1,-1), 5),
                        ('RIGHTPADDING', (0,0), (-1,-1), 5),
                    ]))
                    flowables.append(Spacer(1, 5))
                    flowables.append(t_flowable)
                    flowables.append(Spacer(1, 5))
                table_raw_lines = []
                
        if not stripped:
            i += 1
            continue
            
        if stripped in ("---", "***", "___"):
            flowables.append(Spacer(1, 4))
            flowables.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#e2e8f0"), spaceAfter=6))
            i += 1
            continue
            
        # Blockquote (Examiner Answer Box)
        if stripped.startswith(">"):
            quote_content = stripped[1:].strip()
            while i + 1 < len(lines) and lines[i+1].strip().startswith(">"):
                i += 1
                quote_content += " " + lines[i].strip()[1:].strip()
                
            q_fmt = clean_inline_md(quote_content)
            p_ans = Paragraph(q_fmt, answer_box_style)
            box = Table([[p_ans]], colWidths=[523])
            box.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
                ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#bbf7d0')),
                ('LINEBEFORE', (0,0), (0,-1), 3.0, colors.HexColor('#16a34a')),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ]))
            flowables.append(Spacer(1, 3))
            flowables.append(box)
            flowables.append(Spacer(1, 4))
            i += 1
            continue
            
        # Headings
        if line.startswith("# "):
            # Handled in title
            i += 1
            continue
        elif line.startswith("## "):
            h_text = clean_inline_md(line[3:])
            flowables.append(Paragraph(h_text, h1_style))
        elif line.startswith("### "):
            h_text = clean_inline_md(line[4:])
            flowables.append(Paragraph(h_text, h2_style))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            b_text = clean_inline_md(stripped[2:])
            flowables.append(Paragraph(f"&bull; {b_text}", bullet_style))
        elif re.match(r"^\d+\.\s", stripped):
            m = re.match(r"^\d+\.\s", stripped)
            prefix = stripped[:m.end()]
            rest = clean_inline_md(stripped[m.end():])
            flowables.append(Paragraph(f"<b>{prefix}</b> {rest}", bullet_style))
        else:
            p_text = clean_inline_md(stripped)
            flowables.append(Paragraph(p_text, body_style))
            
        i += 1
        
    print(f"Building PDF with {len(flowables)} flowable blocks...")
    doc.build(flowables, canvasmaker=NumberedCanvas)
    
    if pdf_path.exists():
        size_kb = pdf_path.stat().st_size / 1024
        print(f"SUCCESS: PDF created at {pdf_path} ({size_kb:.1f} KB)")
    else:
        print("ERROR: PDF file not found after build.")

if __name__ == "__main__":
    parse_and_build_pdf()
