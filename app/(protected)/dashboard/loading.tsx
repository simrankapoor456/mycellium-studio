export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-12 w-56 rounded-2xl bg-sage/30" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <div className="h-72 rounded-[1.75rem] bg-paper/80" key={item} />)}
      </div>
    </div>
  );
}
