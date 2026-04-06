"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/auth-context";
import { mockUsers } from "@/lib/data/mock-users";
import { getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.replace("/admin/dashboard");
      else router.replace("/employee/dashboard");
    }
  }, [loading, user, router]);

  if (!loading && user) return null;

  function handleLogin(userId: string) {
    const u = login(userId);
    if (!u) return;
    if (u.role === "admin") router.push("/admin/dashboard");
    else router.push("/employee/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Petrosphere Incorporated</h1>
          <p className="text-muted-foreground mt-2">
            Ticketing System
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Select a demo account to continue. This is a mock login for
              demonstration purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center gap-4 rounded-lg border p-4 text-left hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0 group-hover:bg-primary/20 transition-colors">
                  {getInitials(user.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.department}
                  </p>
                </div>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="capitalize shrink-0"
                >
                  {user.role}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a demo system. No real authentication is used.
        </p>
      </div>
    </div>
  );
}
