"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { TicketTable } from "@/components/tickets/ticket-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth-context";
import { getTicketsByUser } from "@/lib/services/ticket-service";

export default function EmployeeTicketsPage() {
  return (
    <RouteGuard requiredRole="employee">
      <EmployeeLayout>
        <EmployeeTickets />
      </EmployeeLayout>
    </RouteGuard>
  );
}

function EmployeeTickets() {
  const { user } = useAuth();
  if (!user) return null;

  const tickets = getTicketsByUser(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/employee/tickets/new">
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      <TicketTable tickets={tickets} basePath="/employee/tickets" />
    </div>
  );
}
