export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-3xl font-semibold text-slate-900 mt-2">
        {value}
      </h2>
    </div>
  );
}
