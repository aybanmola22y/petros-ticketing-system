import { Badge } from "@/components/ui/badge";
import type { TicketStatus, TicketPriority } from "@/types";
import { getStatusLabel, getPriorityLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<TicketStatus, "open" | "in_progress" | "resolved" | "closed"> = {
    open: "open",
    in_progress: "in_progress",
    resolved: "resolved",
    closed: "closed",
  };
  return (
    <Badge variant={variantMap[status]}>
      {getStatusLabel(status)}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variantMap: Record<TicketPriority, "low" | "medium" | "high" | "urgent"> = {
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "urgent",
  };
  return (
    <Badge variant={variantMap[priority]}>
      {getPriorityLabel(priority)}
    </Badge>
  );
}
