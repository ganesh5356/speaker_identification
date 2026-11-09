import re
import html
import subprocess
from pathlib import Path

def md_to_html(md_text):
    lines = md_text.splitlines()
    html_lines = []
    
    in_code_block = False
    code_block_content = []
    in_table = False
    table_rows = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Code blocks
        if line.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                code_text = html.escape("\n".join(code_block_content))
                html_lines.append(f"<pre><code>{code_text}</code></pre>")
                code_block_content = []
            else:
                in_code_block = True
                code_block_content = []
            i += 1
            continue
            
        if in_code_block:
            code_block_content.append(line)
            i += 1
            continue
            
        # Tables
        if "|" in line and line.strip().startswith("|") and line.strip().endswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(line.strip())
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                # Process table
                html_table = ["<div class='table-wrapper'><table>"]
                is_header = True
                for r_idx, row in enumerate(table_rows):
                    cols = [c.strip() for c in row.split("|")[1:-1]]
                    if r_idx == 1 and all(set(c).issubset({'-', ':', ' '}) for c in cols):
                        is_header = False
                        continue
                    
                    if is_header and r_idx == 0:
                        html_table.append("<thead><tr>")
                        for col in cols:
                            html_table.append(f"<th>{process_inlines(col)}</th>")
                        html_table.append("</tr></thead><tbody>")
                    else:
                        html_table.append("<tr>")
                        for col in cols:
                            html_table.append(f"<td>{process_inlines(col)}</td>")
                        html_table.append("</tr>")
                html_table.append("</tbody></table></div>")
                html_lines.append("\n".join(html_table))
                table_rows = []
        
        # Blank line
        if not line.strip():
            html_lines.append("")
            i += 1
            continue
            
        # Horizontal rule
        if line.strip() in ("---", "***", "___"):
            html_lines.append("<hr/>")
            i += 1
            continue
            
        # Blockquote / Examiner Answer
        if line.strip().startswith(">"):
            quote_text = line.strip()[1:].strip()
            # see if subsequent lines also start with >
            while i + 1 < len(lines) and lines[i+1].strip().startswith(">"):
                i += 1
                quote_text += " " + lines[i].strip()[1:].strip()
            html_lines.append(f"<blockquote class='answer-box'>{process_inlines(quote_text)}</blockquote>")
            i += 1
            continue
            
        # Headers
        if line.startswith("# "):
            html_lines.append(f"<h1>{process_inlines(line[2:])}</h1>")
        elif line.startswith("## "):
            html_lines.append(f"<h2>{process_inlines(line[3:])}</h2>")
        elif line.startswith("### "):
            html_lines.append(f"<h3>{process_inlines(line[4:])}</h3>")
        elif line.startswith("#### "):
            html_lines.append(f"<h4>{process_inlines(line[5:])}</h4>")
        # List items
        elif line.strip().startswith("- ") or line.strip().startswith("* "):
            content = line.strip()[2:]
            html_lines.append(f"<ul><li>{process_inlines(content)}</li></ul>")
        elif re.match(r"^\d+\.\s", line.strip()):
            m = re.match(r"^\d+\.\s", line.strip())
            content = line.strip()[m.end():]
            html_lines.append(f"<ol><li>{process_inlines(content)}</li></ol>")
        else:
            html_lines.append(f"<p>{process_inlines(line)}</p>")
            
        i += 1
        
    # merge consecutive <ul> and <ol>
    full_html = "\n".join(html_lines)
    full_html = re.sub(r"</ul>\s*<ul>", "\n", full_html)
    full_html = re.sub(r"</ol>\s*<ol>", "\n", full_html)
    return full_html

def process_inlines(text):
    text = html.escape(text)
    # Bold **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    # Italic *text*
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    # Inline code `code`
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    # Math formatting cleanup for PDF display
    text = text.replace(r"\tau", "&tau;")
    text = text.replace(r"\Delta", "&Delta;")
    text = text.replace(r"\mathcal{O}", "O")
    text = text.replace(r"\log_2", "log<sub>2</sub>")
    text = text.replace(r"\log_{10}", "log<sub>10</sub>")
    text = text.replace(r"\le", "&le;")
    text = text.replace(r"\ge", "&ge;")
    text = text.replace(r"\approx", "&asymp;")
    text = text.replace(r"\to", "&rarr;")
    text = text.replace(r"\cdot", "&middot;")
    text = text.replace(r"\times", "&times;")
    text = text.replace(r"\|\hat{\mathbf{e}}\|_2", "||&ecirc;||<sub>2</sub>")
    text = text.replace(r"\|\hat{\mathbf{c}}_s\|_2", "||&ccedil;<sub>s</sub>||<sub>2</sub>")
    return text

def build_styled_document(body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Voice Biometric & Voice Cloning Defense Guide (BiLSTM, FFT, MFCC)</title>
<style>
    @page {{
        size: A4;
        margin: 18mm 16mm 18mm 16mm;
        @bottom-right {{
            content: "Page " counter(page);
            font-size: 8pt;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #64748b;
        }}
    }}
    
    * {{
        box-sizing: border-box;
    }}
    
    body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.55;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }}
    
    h1 {{
        font-size: 19pt;
        font-weight: 800;
        color: #0f172a;
        margin-top: 0;
        margin-bottom: 8px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 8px;
        page-break-after: avoid;
    }}
    
    h2 {{
        font-size: 13.5pt;
        font-weight: 700;
        color: #1e3a8a;
        margin-top: 22px;
        margin-bottom: 10px;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 4px;
        page-break-after: avoid;
    }}
    
    h3 {{
        font-size: 11pt;
        font-weight: 700;
        color: #0369a1;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
    }}
    
    h4 {{
        font-size: 10pt;
        font-weight: 700;
        color: #334155;
        margin-top: 10px;
        margin-bottom: 4px;
        page-break-after: avoid;
    }}
    
    p {{
        margin-top: 4px;
        margin-bottom: 8px;
        text-align: justify;
    }}
    
    ul, ol {{
        margin-top: 4px;
        margin-bottom: 8px;
        padding-left: 22px;
    }}
    
    li {{
        margin-bottom: 4px;
    }}
    
    hr {{
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 18px 0;
    }}
    
    /* Code & Diagram Blocks */
    pre {{
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-left: 3px solid #3b82f6;
        border-radius: 4px;
        padding: 10px 14px;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 8.2pt;
        line-height: 1.35;
        overflow-x: auto;
        white-space: pre-wrap;
        margin: 8px 0 12px 0;
        page-break-inside: avoid;
    }}
    
    code {{
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 9pt;
        background: #f1f5f9;
        color: #0f172a;
        padding: 1px 4px;
        border-radius: 3px;
    }}
    
    /* Tables */
    .table-wrapper {{
        width: 100%;
        margin: 12px 0;
        page-break-inside: avoid;
    }}
    
    table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5pt;
        page-break-inside: avoid;
    }}
    
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        text-align: left;
        vertical-align: top;
    }}
    
    th {{
        background: #f1f5f9;
        font-weight: 700;
        color: #0f172a;
        border-bottom: 2px solid #94a3b8;
    }}
    
    tr:nth-child(even) td {{
        background: #f8fafc;
    }}
    
    /* Examiner Viva Answer Callouts */
    blockquote.answer-box {{
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-left: 4px solid #16a34a;
        padding: 8px 14px;
        margin: 6px 0 14px 0;
        border-radius: 4px;
        font-size: 9.5pt;
        color: #14532d;
        page-break-inside: avoid;
    }}
    
    blockquote.answer-box strong {{
        color: #15803d;
    }}
    
    .header-badge {{
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        background: #dbeafe;
        color: #1e40af;
        font-size: 8pt;
        font-weight: 700;
        margin-bottom: 8px;
    }}
</style>
</head>
<body>
    <div class="header-badge">FINAL-YEAR MAJOR PROJECT VIVA GUIDE (COURSE CODE: 23CSE750)</div>
    {body_html}
</body>
</html>
"""

def generate_pdf():
    project_dir = Path(r"C:\Users\khami\OneDrive\Documents\Speaker recongnition")
    md_file = project_dir / "reports" / "Voice_Recognition_Viva_Guide_BiLSTM_FFT_MFCC.md"
    html_file = project_dir / "reports" / "Voice_Recognition_Viva_Guide.html"
    pdf_file = project_dir / "reports" / "Voice_Recognition_Viva_Guide_BiLSTM_FFT_MFCC.pdf"
    
    print(f"Reading markdown: {md_file}")
    md_text = md_file.read_text(encoding="utf-8")
    
    print("Converting to HTML...")
    body_html = md_to_html(md_text)
    full_html = build_styled_document(body_html)
    
    html_file.write_text(full_html, encoding="utf-8")
    print(f"Saved HTML to: {html_file}")
    
    edge_path = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
    if not edge_path.exists():
        edge_path = Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe")
        
    print(f"Using browser: {edge_path}")
    
    cmd = [
        str(edge_path),
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={str(pdf_file)}",
        str(html_file)
    ]
    
    print("Rendering PDF...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and pdf_file.exists():
        size_kb = pdf_file.stat().st_size / 1024
        print(f"SUCCESS: PDF generated ({size_kb:.1f} KB) at: {pdf_file}")
    else:
        print(f"Error: {res.stderr}")

if __name__ == "__main__":
    generate_pdf()
