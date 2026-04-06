"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  MonitorSmartphone,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth-context";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";


const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/devices", label: "Devices", icon: MonitorSmartphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const NavLinks = () => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <span className="font-semibold text-lg tracking-tight">
            Petrosphere Incorporated
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavLinks />
        </nav>
        {user && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-sidebar-foreground">
                  {user.fullName}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {user.department}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-center text-xs text-sidebar-foreground/50 tracking-wide">
              Developed by PetroCore<span className="text-red-500 font-bold">X</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
              <span className="font-semibold text-lg">Petrosphere Incorporated</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sidebar-foreground/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <NavLinks />
            </nav>
            {user && (
              <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-sidebar-foreground">
                      {user.fullName}
                    </p>
                  </div>
                  <button onClick={handleLogout}>
                    <LogOut className="h-4 w-4 text-sidebar-foreground/50" />
                  </button>
                </div>
                <div className="mt-4 text-center text-xs text-sidebar-foreground/50 tracking-wide">
                  Developed by PetroCore<span className="text-red-500 font-bold">X</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
              <UserAvatar user={user} size="sm" />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
