"use client";

import Link from "next/link";
import { Ticket, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/shared/auth-context";
import { getDashboardStats, getTicketsByUser } from "@/lib/services/ticket-service";
import { formatDate } from "@/lib/utils";

export default function EmployeeDashboardPage() {
  return (
    <RouteGuard requiredRole="employee">
      <EmployeeLayout>
        <EmployeeDashboard />
      </EmployeeLayout>
    </RouteGuard>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const stats = getDashboardStats(user.id);
  const recentTickets = getTicketsByUser(user.id).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your support tickets.
          </p>
        </div>
        <Button asChild>
          <Link href="/employee/tickets/new">
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tickets"
          value={stats.total}
          icon={<Ticket className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<Ticket className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Tickets</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employee/tickets">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No tickets yet. Create your first ticket to get started.
            </div>
          ) : (
            <div className="divide-y">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/employee/tickets/${ticket.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.ticketNumber} &middot; {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
