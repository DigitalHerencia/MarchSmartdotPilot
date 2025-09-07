"use client"

export default function SheetOverlay({ text, visible = true }: { text: string; visible?: boolean }) {
  if (!visible) return null
  return (
    <div
      className="absolute top-2 right-2 bg-white/85 backdrop-blur rounded-md shadow p-2 text-xs max-w-[50%] pointer-events-none"
      aria-live="polite"
    >
      <div className="font-semibold text-gray-900 mb-1">Cue</div>
      <div className="text-gray-700 whitespace-pre-wrap">{text}</div>
    </div>
  )
}
