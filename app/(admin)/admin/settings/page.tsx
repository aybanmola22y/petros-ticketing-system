"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Database, Palette } from "lucide-react";

const settingSections = [
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Configure email notifications for ticket updates, assignments, and escalations.",
    status: "Coming soon",
  },
  {
    icon: Shield,
    title: "Access Control",
    description:
      "Manage user roles and permissions. Define who can view, create, and manage tickets.",
    status: "Coming soon",
  },
  {
    icon: Database,
    title: "Data & Integration",
    description:
      "Connect to Supabase for persistent data storage and authentication.",
    status: "Supabase ready",
  },
  {
    icon: Palette,
    title: "Appearance",
    description:
      "Customize the look and feel of the ticketing system including branding and colors.",
    status: "Coming soon",
  },
];

export default function AdminSettingsPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    </RouteGuard>
  );
}

function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage system configuration and preferences.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-amber-800 font-medium">
            This is a demo environment with mock data. Settings shown below are
            placeholders for future configuration options.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {settingSections.map(({ icon: Icon, title, description, status }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{title}</h3>
                    <Badge
                      variant={
                        status === "Supabase ready" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supabase Integration Guide</CardTitle>
          <CardDescription>
            How to replace mock data with real Supabase backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded h-fit shrink-0">1</span>
              <p>
                Replace <code className="text-xs bg-muted px-1 rounded">lib/auth/mock-session.ts</code> with
                Supabase Auth (email/password or OAuth).
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded h-fit shrink-0">2</span>
              <p>
                Replace <code className="text-xs bg-muted px-1 rounded">lib/data/mock-*.ts</code> files with
                Supabase table queries in the service files.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded h-fit shrink-0">3</span>
              <p>
                Add Row-Level Security (RLS) policies to enforce that employees
                can only read their own tickets.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded h-fit shrink-0">4</span>
              <p>
                Update service functions to use <code className="text-xs bg-muted px-1 rounded">supabase.from()</code> queries
                instead of in-memory arrays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
