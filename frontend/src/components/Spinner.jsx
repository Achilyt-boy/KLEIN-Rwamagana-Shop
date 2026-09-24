export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-var(--text-muted)">
      <span className="h-8 w-8 animate-spin rounded-full border border-solid border-var(--border) border-t-var(--accent)" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
