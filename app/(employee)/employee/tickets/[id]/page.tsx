"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/shared/auth-context";
import {
  getTicketById,
  getRepliesByTicket,
  addReply,
} from "@/lib/services/ticket-service";
import { getUserById } from "@/lib/services/user-service";
import { addReplySchema, type AddReplyInput } from "@/lib/validations/ticket";
import { formatDateTime, timeAgo } from "@/lib/utils";

export default function EmployeeTicketDetailPage() {
  return (
    <RouteGuard requiredRole="employee">
      <EmployeeLayout>
        <TicketDetail />
      </EmployeeLayout>
    </RouteGuard>
  );
}

function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [replies, setReplies] = useState(getRepliesByTicket(id));
  const ticket = getTicketById(id);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<AddReplyInput>({
      resolver: zodResolver(addReplySchema),
      defaultValues: { isInternal: false },
    });

  if (!ticket || !user || ticket.userId !== user.id) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const requester = getUserById(ticket.userId);
  const assignee = ticket.assignedTo ? getUserById(ticket.assignedTo) : null;

  async function onSubmitReply(data: AddReplyInput) {
    const reply = addReply({
      ticketId: ticket!.id,
      userId: user!.id,
      message: data.message,
      isInternal: false,
    });
    setReplies((prev) => [...prev, reply]);
    reset();
    toast.success("Reply added");
  }

  const publicReplies = replies.filter((r) => !r.isInternal);

  return (
    <div className="space-y-6 max-w-3xl">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
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
                Conversation ({publicReplies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicReplies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No replies yet.
                </p>
              )}
              {publicReplies.map((reply) => {
                const replyUser = getUserById(reply.userId);
                const isCurrentUser = reply.userId === user.id;
                return (
                  <div key={reply.id} className="flex gap-3">
                    {replyUser && (
                      <UserAvatar user={replyUser} size="sm" className="shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {replyUser?.fullName ?? "Unknown"}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-muted-foreground">(you)</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-3 py-2">
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator />

              <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="message">Add a reply</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your reply here..."
                    rows={3}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reply"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
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
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Assigned To
                </p>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={assignee} size="sm" />
                    <p className="text-sm">{assignee.fullName}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
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
