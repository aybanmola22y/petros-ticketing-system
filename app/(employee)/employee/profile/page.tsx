"use client";

import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/shared/auth-context";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getTicketsByUser } from "@/lib/services/ticket-service";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <RouteGuard requiredRole="employee">
      <EmployeeLayout>
        <Profile />
      </EmployeeLayout>
    </RouteGuard>
  );
}

function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const tickets = getTicketsByUser(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <UserAvatar user={user} size="lg" />
            <div>
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  &middot; {user.department}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Email
              </p>
              <p className="text-sm mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Department
              </p>
              <p className="text-sm mt-1">{user.department}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Member Since
              </p>
              <p className="text-sm mt-1">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Tickets
              </p>
              <p className="text-sm mt-1">{tickets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                {
                  label: "Open",
                  count: tickets.filter((t) => t.status === "open").length,
                  color: "text-blue-600",
                },
                {
                  label: "In Progress",
                  count: tickets.filter((t) => t.status === "in_progress")
                    .length,
                  color: "text-amber-600",
                },
                {
                  label: "Resolved",
                  count: tickets.filter((t) => t.status === "resolved").length,
                  color: "text-green-600",
                },
                {
                  label: "Closed",
                  count: tickets.filter((t) => t.status === "closed").length,
                  color: "text-gray-500",
                },
              ] as const
            ).map(({ label, count, color }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-muted/40">
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
