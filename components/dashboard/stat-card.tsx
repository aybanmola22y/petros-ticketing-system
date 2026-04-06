import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: "blue" | "amber" | "green" | "gray" | "default";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = "default",
  className,
}: StatCardProps) {
  const colorMap = {
    default: "text-primary bg-primary/10",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    green: "text-green-600 bg-green-50",
    gray: "text-gray-600 bg-gray-100",
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center",
              colorMap[color]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
