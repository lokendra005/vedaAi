export default function LibraryLoading() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold font-display text-text-primary">My Library</h1>
        <p className="text-text-secondary mt-1">
          Saved question papers and generated assessments
        </p>
      </header>
      <div className="space-y-3" aria-hidden>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="surface-card rounded-2xl h-20 animate-pulse bg-bg-off-white"
          />
        ))}
      </div>
    </div>
  );
}
