export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      <span className="text-sm text-neutral-500">{label}</span>
    </div>
  );
}
