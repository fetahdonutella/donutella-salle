type StatCardProps = {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "text-indigo-700",
  good: "text-emerald-700",
  warn: "text-rose-700",
};

export default function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}
