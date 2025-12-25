export interface MetricCardProps {
  icon: string; // <-- Add this line
  title: string;
  value: number;
  subtitle: string;
}

export function MetricCard({ icon, title, value, subtitle }: MetricCardProps) {
  return (
    <div className="...">
      <div className="text-3xl">{icon}</div> {/* <-- Use the icon */}
      <div className="font-bold">{title}</div>
      <div className="text-2xl">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}
// ...