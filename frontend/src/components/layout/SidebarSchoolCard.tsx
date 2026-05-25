export function SidebarSchoolCard() {
  return (
    <div className="rounded-2xl bg-white/10 p-3 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white"
        aria-hidden
      >
        DPS
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          Delhi Public School, Sector-4, Bokaro
        </p>
        <p className="text-xs text-white/90 truncate">Bokaro Steel City</p>
      </div>
    </div>
  );
}
