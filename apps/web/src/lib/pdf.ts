"use client";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;
const HEADER_H = 58;
const FOOTER_H = 42;
const GOLD: [number, number, number] = [196, 149, 42];

export type PdfAccent = "sky" | "violet" | "emerald" | "amber";

export const PDF_ACCENTS: Record<PdfAccent, [number, number, number]> = {
  sky: [2, 132, 199],
  violet: [109, 40, 217],
  emerald: [4, 120, 87],
  amber: [180, 83, 9],
};

export interface PdfBrand {
  schoolName: string;
  motto?: string;
  address?: string;
  phone?: string;
  email?: string;
  accent: PdfAccent;
  documentType?: string;
}

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

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  return (name.slice(0, 2) || "MS").toUpperCase();
}

function mix(color: [number, number, number], toward: [number, number, number], amount: number): [number, number, number] {
  return [
    Math.round(color[0] + (toward[0] - color[0]) * amount),
    Math.round(color[1] + (toward[1] - color[1]) * amount),
    Math.round(color[2] + (toward[2] - color[2]) * amount),
  ];
}

export function formatPdfMoney(amount: number): string {
  return `NGN ${Math.round(amount).toLocaleString("en-NG")}`;
}

export class SimplePdf {
  private pages: string[][] = [[]];
  private y = HEADER_H + 18;
  private size = 11;
  private bold = false;
  private color = "0 0 0";
  private watermark: { text: string; r: number; g: number; b: number; size: number } | null = null;
  private brand: PdfBrand = {
    schoolName: "M-Scholar",
    motto: "Academic Excellence & Moral Values",
    accent: "sky",
    documentType: "Official record",
  };

  setBrand(brand: PdfBrand) {
    this.brand = { ...this.brand, ...brand };
  }

  setWatermark(text: string, color: [number, number, number]) {
    this.watermark = {
      text,
      r: color[0],
      g: color[1],
      b: color[2],
      size: text.length > 8 ? 40 : 58,
    };
  }

  getY() {
    return this.y;
  }

  addPage() {
    this.pages.push([]);
    this.y = HEADER_H + 18;
  }

  ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - FOOTER_H - 8) this.addPage();
  }

  setFont(size: number, bold = false) {
    this.size = size;
    this.bold = bold;
  }

  setColor(r: number, g: number, b: number) {
    this.color = rgb(r, g, b);
  }

  private accent(): [number, number, number] {
    return PDF_ACCENTS[this.brand.accent] ?? PDF_ACCENTS.sky;
  }

  private push(cmd: string) {
    this.pages[this.pages.length - 1].push(cmd);
  }

  private pdfY(fromTop: number) {
    return PAGE_H - fromTop;
  }

  private fillRect(x: number, yFromTop: number, w: number, h: number, color: [number, number, number]) {
    this.push(
      `${rgb(color[0], color[1], color[2])} rg ${x.toFixed(2)} ${this.pdfY(yFromTop + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  }

  private strokeRect(x: number, yFromTop: number, w: number, h: number, color: [number, number, number], width = 0.8) {
    this.push(
      `${rgb(color[0], color[1], color[2])} RG ${width} w ${x.toFixed(2)} ${this.pdfY(yFromTop + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
    );
  }

  private textCmd(
    value: string,
    x: number,
    yFromTop: number,
    size: number,
    bold: boolean,
    color: [number, number, number],
    align: "left" | "center" | "right" = "left"
  ): string {
    const clean = ascii(value);
    let tx = x;
    const width = estimateWidth(clean, size);
    if (align === "center") tx = x - width / 2;
    if (align === "right") tx = x - width;
    const font = bold ? "F2" : "F1";
    return `BT /${font} ${size} Tf ${rgb(color[0], color[1], color[2])} rg ${tx.toFixed(2)} ${this.pdfY(yFromTop + size * 0.8).toFixed(2)} Td ${pdfString(clean)} Tj ET`;
  }

  text(value: string, x: number, yFromTop = this.y, align: "left" | "center" | "right" = "left") {
    const parts = this.color.split(" ").map(Number);
    const color: [number, number, number] = [
      Math.round((parts[0] || 0) * 255),
      Math.round((parts[1] || 0) * 255),
      Math.round((parts[2] || 0) * 255),
    ];
    this.push(this.textCmd(value, x, yFromTop, this.size, this.bold, color, align));
    return estimateWidth(ascii(value), this.size);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [226, 232, 240]) {
    this.push(
      `${rgb(color[0], color[1], color[2])} RG 0.7 w ${x1.toFixed(2)} ${this.pdfY(y1).toFixed(2)} m ${x2.toFixed(2)} ${this.pdfY(y2).toFixed(2)} l S`
    );
  }

  heading(title: string, subtitle?: string) {
    if (!this.brand.documentType) this.brand.documentType = title;
    this.ensureSpace(36);
    const a = this.accent();
    this.fillRect(MARGIN, this.y, 18, 3, GOLD);
    this.setColor(a[0], a[1], a[2]);
    this.setFont(16, true);
    this.text(title, MARGIN, this.y + 10);
    this.y += 30;
    if (subtitle) {
      this.setFont(9, false);
      this.setColor(100, 116, 139);
      this.text(subtitle, MARGIN, this.y);
      this.y += 16;
    }
    this.line(MARGIN, this.y, PAGE_W - MARGIN, this.y, mix(a, [255, 255, 255], 0.7));
    this.y += 14;
    this.setColor(15, 23, 42);
  }

  keyValues(rows: [string, string][]) {
    const cols = rows.length > 3 ? 2 : 1;
    const gap = 8;
    const boxW = (PAGE_W - MARGIN * 2 - (cols - 1) * gap) / cols;
    const boxH = 32;
    rows.forEach((pair, index) => {
      const col = index % cols;
      if (col === 0) this.ensureSpace(boxH + 6);
      const x = MARGIN + col * (boxW + gap);
      const top = this.y;
      this.fillRect(x, top, boxW, boxH, [248, 250, 252]);
      this.strokeRect(x, top, boxW, boxH, [226, 232, 240], 0.5);
      this.fillRect(x, top, 3, boxH, this.accent());
      this.setFont(7, true);
      this.setColor(100, 116, 139);
      this.text(pair[0].toUpperCase(), x + 10, top + 6);
      this.setFont(10, true);
      this.setColor(15, 23, 42);
      this.text(pair[1], x + 10, top + 16);
      if (col === cols - 1 || index === rows.length - 1) this.y = top + boxH + 6;
    });
    this.y += 4;
  }

  callout(label: string, value: string) {
    const h = 36;
    this.ensureSpace(h + 8);
    const a = this.accent();
    const wash = mix(a, [255, 255, 255], 0.88);
    this.fillRect(MARGIN, this.y, PAGE_W - MARGIN * 2, h, wash);
    this.fillRect(MARGIN, this.y, 5, h, a);
    this.setFont(8, true);
    this.setColor(a[0], a[1], a[2]);
    this.text(label.toUpperCase(), MARGIN + 16, this.y + 8);
    this.setFont(14, true);
    this.setColor(15, 23, 42);
    this.text(value, PAGE_W - MARGIN - 14, this.y + 10, "right");
    this.y += h + 12;
  }

  paragraph(value: string) {
    this.setFont(9, false);
    this.setColor(71, 85, 105);
    const max = PAGE_W - MARGIN * 2;
    wrapLines(value, max, 9).forEach((line) => {
      this.ensureSpace(14);
      this.text(line, MARGIN, this.y);
      this.y += 13;
    });
    this.y += 6;
  }

  commentBox(title: string, body: string) {
    const boxW = PAGE_W - MARGIN * 2;
    const innerW = boxW - 20;
    const lines = wrapLines(body, innerW, 9);
    const h = 26 + lines.length * 13 + 10;
    this.ensureSpace(h);
    const top = this.y;
    const a = this.accent();
    this.fillRect(MARGIN, top, boxW, h, [248, 250, 252]);
    this.fillRect(MARGIN, top, 4, h, a);
    this.strokeRect(MARGIN, top, boxW, h, [226, 232, 240], 0.6);
    this.setFont(8, true);
    this.setColor(a[0], a[1], a[2]);
    this.text(title.toUpperCase(), MARGIN + 14, top + 8);
    this.setFont(9, false);
    this.setColor(51, 65, 85);
    lines.forEach((line, index) => {
      this.text(line, MARGIN + 14, top + 24 + index * 13);
    });
    this.y = top + h + 10;
  }

  signatureBlock(items: { role: string; name: string }[]) {
    this.ensureSpace(86);
    const count = Math.max(items.length, 1);
    const usable = PAGE_W - MARGIN * 2;
    const colW = usable / count;
    const a = this.accent();
    items.forEach((item, i) => {
      const x = MARGIN + i * colW;
      const isStamp = /stamp|seal/i.test(item.role);
      if (isStamp) {
        const cx = x + colW / 2;
        const cy = this.y + 22;
        this.strokeCircle(cx, cy, 18, a);
        this.setFont(6, true);
        this.setColor(a[0], a[1], a[2]);
        this.text("OFFICIAL", cx, cy - 6, "center");
        this.text("SEAL", cx, cy + 4, "center");
        this.setFont(8, true);
        this.setColor(15, 23, 42);
        this.text(item.role, cx, this.y + 48, "center");
        this.setFont(8, false);
        this.setColor(71, 85, 105);
        this.text(item.name, cx, this.y + 60, "center");
      } else {
        this.line(x + 8, this.y + 28, x + colW - 16, this.y + 28, [148, 163, 184]);
        this.setFont(8, true);
        this.setColor(15, 23, 42);
        this.text(item.role, x + 8, this.y + 36);
        this.setFont(8, false);
        this.setColor(71, 85, 105);
        this.text(item.name, x + 8, this.y + 50);
      }
    });
    this.y += 78;
  }

  private strokeCircle(cx: number, cyFromTop: number, r: number, color: [number, number, number]) {
    const cy = this.pdfY(cyFromTop);
    const k = 0.5523 * r;
    this.push(
      [
        `${rgb(color[0], color[1], color[2])} RG 1.2 w`,
        `${(cx).toFixed(2)} ${(cy + r).toFixed(2)} m`,
        `${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c`,
        `${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
        `${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
        `${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
        "S",
      ].join(" ")
    );
  }

  table(headers: string[], rows: string[][]) {
    const cols = Math.max(headers.length, 1);
    const usable = PAGE_W - MARGIN * 2;
    const colW = usable / cols;
    const rowH = 20;
    const a = this.accent();

    const drawHeader = () => {
      this.ensureSpace(rowH + 4);
      this.fillRect(MARGIN, this.y, usable, rowH, a);
      this.setFont(7.5, true);
      headers.forEach((h, i) => {
        this.push(this.textCmd(h, MARGIN + i * colW + 5, this.y + 6, 7.5, true, [255, 255, 255]));
      });
      this.y += rowH;
    };

    drawHeader();

    if (rows.length === 0) {
      this.ensureSpace(rowH);
      this.setColor(148, 163, 184);
      this.setFont(8, false);
      this.text("No records", MARGIN + 6, this.y + 4);
      this.y += rowH;
      return;
    }

    rows.forEach((row, idx) => {
      if (this.y + rowH > PAGE_H - FOOTER_H - 8) {
        this.addPage();
        drawHeader();
      }
      if (idx % 2 === 1) this.fillRect(MARGIN, this.y, usable, rowH, [248, 250, 252]);
      this.line(MARGIN, this.y + rowH, MARGIN + usable, this.y + rowH, [226, 232, 240]);
      row.forEach((cell, i) => {
        const raw = ascii(cell ?? "");
        const maxChars = Math.max(6, Math.floor((colW - 8) / (8 * 0.52)));
        const shown = raw.length > maxChars ? `${raw.slice(0, maxChars - 1)}...` : raw;
        this.push(this.textCmd(shown, MARGIN + i * colW + 5, this.y + 6, 8, false, [15, 23, 42]));
      });
      this.y += rowH;
    });
    this.y += 12;
  }

  private chromeCommands(pageIndex: number, pageCount: number): string[] {
    const a = this.accent();
    const school = this.brand.schoolName || "M-Scholar";
    const mark = initials(school);
    const cmds: string[] = [];
    const add = (cmd: string) => cmds.push(cmd);

    add(`${rgb(a[0], a[1], a[2])} rg 0 0 7 ${PAGE_H.toFixed(2)} re f`);
    add(`${rgb(a[0], a[1], a[2])} rg 0 ${this.pdfY(HEADER_H).toFixed(2)} ${PAGE_W.toFixed(2)} ${HEADER_H.toFixed(2)} re f`);
    add(`${rgb(GOLD[0], GOLD[1], GOLD[2])} rg 0 ${this.pdfY(HEADER_H + 4).toFixed(2)} ${PAGE_W.toFixed(2)} 4 re f`);
    add(`${rgb(255, 255, 255)} rg 18 ${this.pdfY(44).toFixed(2)} 28 28 re f`);
    add(this.textCmd(mark, 32, 21, 11, true, a, "center"));
    add(this.textCmd(school, 56, 16, 13, true, [255, 255, 255]));
    if (this.brand.motto) {
      add(this.textCmd(this.brand.motto, 56, 34, 8, false, [226, 232, 240]));
    }

    add(`${rgb(248, 250, 252)} rg 0 0 ${PAGE_W.toFixed(2)} ${FOOTER_H.toFixed(2)} re f`);
    add(`${rgb(a[0], a[1], a[2])} rg 0 ${FOOTER_H.toFixed(2)} ${PAGE_W.toFixed(2)} 2.2 re f`);
    const contact = [this.brand.address, this.brand.phone, this.brand.email].filter(Boolean).join("  |  ");
    add(this.textCmd(contact || "Official school record", MARGIN, PAGE_H - 18, 7, false, [100, 116, 139]));
    add(this.textCmd(`Page ${pageIndex} of ${pageCount}`, PAGE_W / 2, PAGE_H - 30, 7, false, [100, 116, 139], "center"));
    add(
      this.textCmd(this.brand.documentType || "Official record", PAGE_W - MARGIN, PAGE_H - 18, 7, true, a, "right")
    );
    return cmds;
  }

  private pageStream(commands: string[], pageIndex: number, pageCount: number): string {
    return `${this.watermarkCommands()}${commands.join("\n")}\n${this.chromeCommands(pageIndex, pageCount).join("\n")}\n`;
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
    const pageCount = this.pages.length;

    objects.push("");
    objects.push("");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    objects.push("<< /Type /ExtGState /ca 0.12 /CA 0.12 >>");

    const pageObjectNumbers: number[] = [];
    this.pages.forEach((cmds, index) => {
      const stream = this.pageStream(cmds, index + 1, pageCount);
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
    add(encoder.encode(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`));

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
  rows: string[][],
  brand?: PdfBrand
) {
  const pdf = new SimplePdf();
  if (brand) pdf.setBrand({ ...brand, documentType: brand.documentType || title });
  else pdf.setBrand({ schoolName: title, accent: "emerald", documentType: subtitle || title });
  pdf.heading(subtitle || title, new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }));
  pdf.table(headers, rows);
  pdf.save(filename);
}
