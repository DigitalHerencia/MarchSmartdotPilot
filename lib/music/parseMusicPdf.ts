import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  ParsedMusicSchema,
  type ParsedMusic,
  type Phrase,
  type TempoChange,
} from "@/schemas/musicSchema";

export async function parseMusicPdf(file: File): Promise<ParsedMusic> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: buffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str: string }>;
    text += items.map((item) => item.str).join(" ") + "\n";
  }
  const titleMatch = text.match(/Title[:\s]+(.+)/i);
  const tempoMatch = text.match(/Tempo[:\s]+(\d+)/i);
  const timeMatch = text.match(/Time(?:\s*Signature)?[:\s]+(\d+)\s*\/\s*(\d+)/i);
  const measureMatch = text.match(/Measures[:\s]+(\d+)/i);
  const phraseRegex = /Phrase\s*(\d+)\s*:\s*Measures?\s*(\d+)-(\d+)/gi;
  const phrases: Phrase[] = [];
  let m: RegExpExecArray | null;
  while ((m = phraseRegex.exec(text))) {
    phrases.push({ start: Number(m[2]), end: Number(m[3]) });
  }
  const beats = timeMatch ? Number(timeMatch[1]) : 4;
  const beatValue = timeMatch ? Number(timeMatch[2]) : 4;
  const totalMeasures = measureMatch
    ? Number(measureMatch[1])
    : phrases.length
    ? Math.max(...phrases.map((p) => p.end))
    : 0;
  const measures = Array.from({ length: totalMeasures }, (_, idx) => ({
    number: idx + 1,
    durationBeats: beats,
  }));
  const tempo = tempoMatch ? Number(tempoMatch[1]) : 120;
  const tempoChanges: TempoChange[] = [{ measure: 1, bpm: tempo }];
  const parsed = {
    title: titleMatch?.[1].trim(),
    tempo,
    timeSignature: { beats, beatValue },
    measures,
    phrases,
    tempoChanges,
  };
  return ParsedMusicSchema.parse(parsed);
}
