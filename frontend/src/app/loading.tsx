export default function RootLoading() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-48 rounded-lg bg-border/60 mb-2" />
      <div className="h-5 w-64 rounded-lg bg-border/40" />
    </div>
  );
}
