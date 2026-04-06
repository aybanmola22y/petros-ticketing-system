"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { TicketTable } from "@/components/tickets/ticket-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getTickets } from "@/lib/services/ticket-service";
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from "@/lib/constants";
import type { TicketStatus, TicketPriority, TicketCategory } from "@/types";

export default function AdminTicketsPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <AdminTickets />
      </AdminLayout>
    </RouteGuard>
  );
}

function AdminTickets() {
  const allTickets = getTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");

  const filtered = useMemo(() => {
    return allTickets.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || t.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [allTickets, search, statusFilter, priorityFilter, categoryFilter]);

  function handleReset() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  }

  const hasFilters =
    search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Tickets</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} of {allTickets.length} tickets shown
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {TICKET_STATUSES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {TICKET_PRIORITIES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TicketCategory | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TICKET_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={handleReset} size="sm">
            Reset
          </Button>
        )}
      </div>

      <TicketTable tickets={filtered} basePath="/admin/tickets" />
    </div>
  );
}
