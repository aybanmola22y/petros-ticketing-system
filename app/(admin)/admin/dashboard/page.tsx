"use client";

import Link from "next/link";
import { Ticket, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getTickets } from "@/lib/services/ticket-service";
import { getUserById } from "@/lib/services/user-service";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </RouteGuard>
  );
}

function AdminDashboard() {
  const stats = getDashboardStats();
  const allTickets = getTickets();
  const recentTickets = allTickets.slice(0, 6);
  const urgentTickets = allTickets.filter(
    (t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed"
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all support tickets across the company.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Tickets"
          value={stats.total}
          icon={<Ticket className="h-5 w-5" />}
          color="default"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<Ticket className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          icon={<XCircle className="h-5 w-5" />}
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Tickets</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/tickets">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentTickets.map((ticket) => {
                  const requester = getUserById(ticket.userId);
                  return (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.ticketNumber} &middot;{" "}
                          {requester?.fullName} &middot; {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Urgent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No urgent tickets — great!
                </p>
              ) : (
                urgentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <p className="font-medium text-sm text-red-800 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={ticket.status} />
                      <span className="text-xs text-red-600">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
