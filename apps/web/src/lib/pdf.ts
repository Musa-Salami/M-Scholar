"use client";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;

function ascii(text: string): string {
  return text
    .replace(/₦/g, "NGN ")
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x09\x20-\x7E]/g, " ");
}

function pdfString(text: string): string {
  return `(${ascii(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

function rgb(r: number, g: number, b: number): string {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`;
}

function estimateWidth(text: string, fontSize: number): number {
  return ascii(text).length * fontSize * 0.52;
}

function wrapLines(value: string, maxWidth: number, fontSize: number): string[] {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (estimateWidth(next, fontSize) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function formatPdfMoney(amount: number): string {
  return `NGN ${Math.round(amount).toLocaleString("en-NG")}`;
}

export class SimplePdf {
  private pages: string[][] = [[]];
  private y = MARGIN;
  private size = 11;
  private bold = false;
  private color = "0 0 0";
  private watermark: { text: string; r: number; g: number; b: number; size: number } | null = null;

  setWatermark(text: string, color: [number, number, number]) {
    this.watermark = {
      text,
      r: color[0],
      g: color[1],
      b: color[2],
      size: text.length > 8 ? 42 : 64,
    };
  }

  getY() {
    return this.y;
  }

  addPage() {
    this.pages.push([]);
    this.y = MARGIN;
  }

  ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - MARGIN) this.addPage();
  }

  setFont(size: number, bold = false) {
    this.size = size;
    this.bold = bold;
  }

  setColor(r: number, g: number, b: number) {
    this.color = rgb(r, g, b);
  }

  private push(cmd: string) {
    this.pages[this.pages.length - 1].push(cmd);
  }

  private pdfY(fromTop: number) {
    return PAGE_H - fromTop;
  }

  text(value: string, x: number, yFromTop = this.y, align: "left" | "center" | "right" = "left") {
    const clean = ascii(value);
    let tx = x;
    const width = estimateWidth(clean, this.size);
    if (align === "center") tx = x - width / 2;
    if (align === "right") tx = x - width;
    const font = this.bold ? "F2" : "F1";
    this.push(
      `BT /${font} ${this.size} Tf ${this.color} rg ${tx.toFixed(2)} ${this.pdfY(yFromTop + this.size * 0.8).toFixed(2)} Td ${pdfString(clean)} Tj ET`
    );
    return width;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.push(`${rgb(226, 232, 240)} RG 0.6 w ${x1.toFixed(2)} ${this.pdfY(y1).toFixed(2)} m ${x2.toFixed(2)} ${this.pdfY(y2).toFixed(2)} l S`);
  }

  heading(title: string, subtitle?: string) {
    this.setColor(15, 23, 42);
    this.setFont(18, true);
    this.text(title, MARGIN, this.y);
    this.y += 24;
    if (subtitle) {
      this.setFont(10, false);
      this.setColor(100, 116, 139);
      this.text(subtitle, MARGIN, this.y);
      this.y += 18;
    }
    this.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 16;
    this.setColor(15, 23, 42);
  }

  keyValues(rows: [string, string][]) {
    for (const [label, value] of rows) {
      this.ensureSpace(18);
      this.setFont(10, false);
      this.setColor(100, 116, 139);
      this.text(label, MARGIN, this.y);
      this.setColor(15, 23, 42);
      this.setFont(10, true);
      this.text(value, PAGE_W - MARGIN, this.y, "right");
      this.y += 16;
      this.line(MARGIN, this.y - 4, PAGE_W - MARGIN, this.y - 4);
    }
    this.y += 8;
  }

  paragraph(value: string) {
    this.setFont(9, false);
    this.setColor(100, 116, 139);
    const max = PAGE_W - MARGIN * 2;
    const words = ascii(value).split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (estimateWidth(next, 9) > max) {
        this.ensureSpace(14);
        this.text(line, MARGIN, this.y);
        this.y += 13;
        line = word;
      } else {
        line = next;
      }
    }
    if (line) {
      this.ensureSpace(14);
      this.text(line, MARGIN, this.y);
      this.y += 16;
    }
  }

  commentBox(title: string, body: string) {
    const boxW = PAGE_W - MARGIN * 2;
    const innerW = boxW - 12;
    const lines = wrapLines(body, innerW, 9);
    const h = 24 + lines.length * 13 + 8;
    this.ensureSpace(h);
    const top = this.y;
    this.push(
      `${rgb(248, 250, 252)} rg ${MARGIN.toFixed(2)} ${this.pdfY(top + h).toFixed(2)} ${boxW.toFixed(2)} ${h.toFixed(2)} re f`
    );
    this.push(
      `${rgb(203, 213, 225)} RG 0.8 w ${MARGIN.toFixed(2)} ${this.pdfY(top + h).toFixed(2)} ${boxW.toFixed(2)} ${h.toFixed(2)} re S`
    );
    this.setFont(9, true);
    this.setColor(15, 23, 42);
    this.text(title, MARGIN + 6, top + 8);
    this.setFont(9, false);
    this.setColor(51, 65, 85);
    lines.forEach((line, index) => {
      this.text(line, MARGIN + 6, top + 24 + index * 13);
    });
    this.y = top + h + 10;
  }

  signatureBlock(items: { role: string; name: string }[]) {
    this.ensureSpace(72);
    const count = Math.max(items.length, 1);
    const usable = PAGE_W - MARGIN * 2;
    const colW = usable / count;
    items.forEach((item, i) => {
      const x = MARGIN + i * colW + 6;
      this.line(x, this.y + 26, x + colW - 18, this.y + 26);
      this.setFont(8, true);
      this.setColor(15, 23, 42);
      this.text(item.role, x, this.y + 32);
      this.setFont(8, false);
      this.setColor(71, 85, 105);
      this.text(item.name, x, this.y + 44);
    });
    this.y += 62;
  }

  table(headers: string[], rows: string[][]) {
    const cols = Math.max(headers.length, 1);
    const usable = PAGE_W - MARGIN * 2;
    const colW = usable / cols;
    const rowH = 18;

    const drawHeader = () => {
      this.ensureSpace(rowH + 4);
      this.push(
        `${rgb(248, 250, 252)} rg ${MARGIN.toFixed(2)} ${this.pdfY(this.y + rowH - 4).toFixed(2)} ${usable.toFixed(2)} ${rowH.toFixed(2)} re f`
      );
      this.setFont(8, true);
      this.setColor(71, 85, 105);
      headers.forEach((h, i) => {
        this.text(h, MARGIN + i * colW + 4, this.y);
      });
      this.y += rowH;
    };

    drawHeader();
    this.setFont(8, false);
    this.setColor(15, 23, 42);

    if (rows.length === 0) {
      this.ensureSpace(rowH);
      this.setColor(148, 163, 184);
      this.text("No records", MARGIN + 4, this.y);
      this.y += rowH;
      return;
    }

    rows.forEach((row, idx) => {
      if (this.y + rowH > PAGE_H - MARGIN) {
        this.addPage();
        drawHeader();
        this.setFont(8, false);
        this.setColor(15, 23, 42);
      }
      if (idx % 2 === 1) {
        this.push(
          `${rgb(248, 250, 252)} rg ${MARGIN.toFixed(2)} ${this.pdfY(this.y + rowH - 4).toFixed(2)} ${usable.toFixed(2)} ${rowH.toFixed(2)} re f`
        );
      }
      row.forEach((cell, i) => {
        const raw = ascii(cell ?? "");
        const maxChars = Math.max(6, Math.floor((colW - 8) / (8 * 0.52)));
        this.text(raw.length > maxChars ? `${raw.slice(0, maxChars - 1)}...` : raw, MARGIN + i * colW + 4, this.y);
      });
      this.y += rowH;
    });
    this.y += 10;
  }

  private pageStream(commands: string[]): string {
    const mark = this.watermarkCommands();
    return `${mark}${commands.join("\n")}\n`;
  }

  private watermarkCommands(): string {
    if (!this.watermark) return "";
    const { text, r, g, b, size } = this.watermark;
    const angle = (32 * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = PAGE_W / 2;
    const cy = PAGE_H / 2;
    const shift = -estimateWidth(text, size) / 2;
    return [
      "q",
      "/GS1 gs",
      "BT",
      `/F2 ${size} Tf`,
      `${rgb(r, g, b)} rg`,
      `${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${cx.toFixed(2)} ${cy.toFixed(2)} Tm`,
      `${shift.toFixed(2)} 0 Td`,
      `${pdfString(text)} Tj`,
      "ET",
      "Q",
      "",
    ].join("\n");
  }

  save(filename: string) {
    const encoder = new TextEncoder();
    const objects: string[] = [];

    const fontRegular =
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    const fontBold =
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    const gstate = "<< /Type /ExtGState /ca 0.13 /CA 0.13 >>";

    objects.push(""); // 1 catalog placeholder
    objects.push(""); // 2 pages placeholder
    objects.push(fontRegular); // 3
    objects.push(fontBold); // 4
    objects.push(gstate); // 5

    const pageObjectNumbers: number[] = [];
    this.pages.forEach((cmds) => {
      const stream = this.pageStream(cmds);
      const streamBytes = encoder.encode(stream).byteLength;
      objects.push(`<< /Length ${streamBytes} >>\nstream\n${stream}endstream`);
      const contentNum = objects.length;
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentNum} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /GS1 5 0 R >> >> >>`
      );
      pageObjectNumbers.push(objects.length);
    });

    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

    const parts: Uint8Array[] = [];
    let offset = 0;
    const add = (chunk: Uint8Array) => {
      parts.push(chunk);
      offset += chunk.byteLength;
    };

    add(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0x80, 0x80, 0x80, 0x80, 0x0a]));
    const offsets = [0];
    objects.forEach((obj, i) => {
      offsets.push(offset);
      add(encoder.encode(`${i + 1} 0 obj\n${obj}\nendobj\n`));
    });
    const xrefPos = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i += 1) {
      xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    add(encoder.encode(xref));
    add(
      encoder.encode(
        `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`
      )
    );

    const bytes = new Uint8Array(offset);
    let copied = 0;
    parts.forEach((part) => {
      bytes.set(part, copied);
      copied += part.byteLength;
    });
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join(
    "\n"
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTablePdf(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][]
) {
  const pdf = new SimplePdf();
  pdf.heading(title, subtitle);
  pdf.table(headers, rows);
  pdf.save(filename);
}
