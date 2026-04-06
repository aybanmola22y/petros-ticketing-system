"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/shared/auth-context";
import {
  getTicketById,
  getRepliesByTicket,
  addReply,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
} from "@/lib/services/ticket-service";
import { getUsers, getUserById } from "@/lib/services/user-service";
import { addReplySchema, type AddReplyInput } from "@/lib/validations/ticket";
import { formatDateTime, timeAgo, getStatusLabel, getPriorityLabel } from "@/lib/utils";
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/lib/constants";
import type { TicketStatus, TicketPriority } from "@/types";
import { z } from "zod";

const internalReplySchema = z.object({
  message: z.string().min(5, "Message must be at least 5 characters"),
  isInternal: z.boolean().default(false),
});
type InternalReplyInput = z.infer<typeof internalReplySchema>;

export default function AdminTicketDetailPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <TicketDetail />
      </AdminLayout>
    </RouteGuard>
  );
}

function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState(getTicketById(id));
  const [replies, setReplies] = useState(getRepliesByTicket(id));
  const [replyType, setReplyType] = useState<"public" | "internal">("public");

  const admins = getUsers().filter((u) => u.role === "admin");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<InternalReplyInput>({
      resolver: zodResolver(internalReplySchema),
      defaultValues: { isInternal: false },
    });

  if (!ticket || !user) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const requester = getUserById(ticket.userId);
  const assignee = ticket.assignedTo ? getUserById(ticket.assignedTo) : null;

  function handleStatusChange(status: TicketStatus) {
    const updated = updateTicketStatus(ticket!.id, status);
    if (updated) {
      setTicket({ ...updated });
      toast.success(`Status updated to ${getStatusLabel(status)}`);
    }
  }

  function handlePriorityChange(priority: TicketPriority) {
    const updated = updateTicketPriority(ticket!.id, priority);
    if (updated) {
      setTicket({ ...updated });
      toast.success(`Priority updated to ${getPriorityLabel(priority)}`);
    }
  }

  function handleAssign(adminId: string) {
    const updated = assignTicket(ticket!.id, adminId);
    if (updated) {
      setTicket({ ...updated });
      const admin = getUserById(adminId);
      toast.success(`Ticket assigned to ${admin?.fullName ?? adminId}`);
    }
  }

  async function onSubmitReply(data: InternalReplyInput) {
    const reply = addReply({
      ticketId: ticket!.id,
      userId: user!.id,
      message: data.message,
      isInternal: replyType === "internal",
    });
    setReplies((prev) => [...prev, reply]);
    reset();
    toast.success(
      replyType === "internal" ? "Internal note added" : "Reply sent"
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-xs text-muted-foreground">
            {ticket.ticketNumber}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submitted {formatDateTime(ticket.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Conversation ({replies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {replies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No replies yet.
                </p>
              )}
              {replies.map((reply) => {
                const replyUser = getUserById(reply.userId);
                return (
                  <div
                    key={reply.id}
                    className={reply.isInternal ? "opacity-80" : ""}
                  >
                    <div className="flex gap-3">
                      {replyUser && (
                        <UserAvatar
                          user={replyUser}
                          size="sm"
                          className="shrink-0 mt-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">
                            {replyUser?.fullName ?? "Unknown"}
                          </span>
                          {reply.isInternal && (
                            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              <Lock className="h-3 w-3" />
                              Internal Note
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            reply.isInternal
                              ? "bg-amber-50 border border-amber-100 text-amber-950"
                              : "bg-muted/50"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator />

              {/* Reply Composer */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={replyType === "public" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReplyType("public")}
                  >
                    Public Reply
                  </Button>
                  <Button
                    type="button"
                    variant={replyType === "internal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReplyType("internal")}
                    className={replyType === "internal" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Internal Note
                  </Button>
                </div>
                <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-3">
                  <Textarea
                    placeholder={
                      replyType === "internal"
                        ? "Write an internal note (only visible to admins)..."
                        : "Write a reply to the requester..."
                    }
                    rows={3}
                    {...register("message")}
                    className={
                      replyType === "internal"
                        ? "border-amber-300 bg-amber-50 text-amber-950 placeholder:text-amber-900/60"
                        : ""
                    }
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Sending..."
                      : replyType === "internal"
                      ? "Add Note"
                      : "Send Reply"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Ticket Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Status
                </Label>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Priority
                </Label>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Assigned To
                </Label>
                <Select
                  value={ticket.assignedTo ?? "unassigned"}
                  onValueChange={(v) => {
                    if (v !== "unassigned") handleAssign(v);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Category
                </p>
                <p className="text-sm">{ticket.category}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Requester
                </p>
                {requester && (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={requester} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{requester.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {requester.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {requester.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Last Updated
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(ticket.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
