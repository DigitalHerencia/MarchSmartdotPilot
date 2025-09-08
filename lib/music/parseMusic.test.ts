import { describe, it, expect } from "vitest";
import { parseMusicXml } from "./parseMusicXml";
import { parseMusicPdf } from "./parseMusicPdf";
import { PDFDocument } from "pdf-lib";

describe("music parsing", () => {
  it("parses tempo changes and phrases from MusicXML", async () => {
    const xml = `<?xml version="1.0"?>
<score-partwise>
  <part>
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <direction><sound tempo="100"/></direction>
      <note><duration>1</duration></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
    <measure number="2">
      <direction><sound tempo="110"/></direction>
      <note><duration>1</duration></note>
    </measure>
  </part>
</score-partwise>`;
    const file = new File([xml], "test.xml", { type: "application/xml" });
    const parsed = await parseMusicXml(file);
    expect(parsed.tempo).toBe(100);
    expect(parsed.tempoChanges).toHaveLength(2);
    expect(parsed.phrases).toEqual([
      { start: 1, end: 1 },
      { start: 2, end: 2 },
    ]);
  });

  it("parses basic data from PDF", async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText("Title: Test PDF", { y: 700 });
    page.drawText("Tempo: 90", { y: 680 });
    page.drawText("Time: 4/4", { y: 660 });
    page.drawText("Measures: 2", { y: 640 });
    page.drawText("Phrase 1: Measures 1-1", { y: 620 });
    page.drawText("Phrase 2: Measures 2-2", { y: 600 });
    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const file = new File([blob], "test.pdf", { type: "application/pdf" });
    const parsed = await parseMusicPdf(file);
    expect(parsed.tempo).toBe(90);
    expect(parsed.measures).toHaveLength(2);
    expect(parsed.phrases).toHaveLength(2);
  });
});
