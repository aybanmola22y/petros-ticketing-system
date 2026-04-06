"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getUsers, addUser, updateUser } from "@/lib/services/user-service";
import { getTickets } from "@/lib/services/ticket-service";
import { formatDate } from "@/lib/utils";
import { PlusCircle, X, Pencil } from "lucide-react";
import type { User, UserRole } from "@/types";

export default function AdminUsersPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <UsersPage />
      </AdminLayout>
    </RouteGuard>
  );
}

function UsersPage() {
  const [users, setUsers] = useState(getUsers());
  const [editingUser, setEditingUser] = useState<User | "new" | null>(null);
  const tickets = getTickets();

  function getTicketCount(userId: string) {
    return tickets.filter((t) => t.userId === userId).length;
  }

  function getOpenTicketCount(userId: string) {
    return tickets.filter(
      (t) => t.userId === userId && (t.status === "open" || t.status === "in_progress")
    ).length;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} registered users
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setEditingUser("new")}>
          <PlusCircle className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.department} &middot; Member since{" "}
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                {user.role === "employee" && (
                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {getTicketCount(user.id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Tickets
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">
                        {getOpenTicketCount(user.id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="ml-4 flex items-center justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingUser(user)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      {editingUser && (
        <UserFormModal 
          userToEdit={editingUser === "new" ? undefined : editingUser}
          onClose={() => setEditingUser(null)} 
          onSave={(user) => {
            if (editingUser === "new") addUser(user);
            else updateUser(user.id, user);
            setUsers([...getUsers()]);
            setEditingUser(null);
          }} 
        />
      )}
    </div>
  );
}

const DEPARTMENTS = ["IT Operations", "Marketing", "Finance", "HR", "Sales", "Operations", "Executive", "Legal", "Other"];

function UserFormModal({ onClose, onSave, userToEdit }: {
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit?: User;
}) {
  const [form, setForm] = useState({
    fullName: userToEdit?.fullName || "",
    email: userToEdit?.email || "",
    role: userToEdit?.role || "employee" as UserRole,
    department: userToEdit?.department || "Marketing",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const copy = { ...e }; delete copy[key]; return copy; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email is required";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    onSave({
      id: userToEdit?.id || `user-new-${Date.now()}`,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      department: form.department,
      createdAt: userToEdit?.createdAt || new Date().toISOString(),
    });
  }

  const inputCls = "w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const errCls = "text-xs text-red-500 mt-1";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{userToEdit ? "Edit User" : "Add New User"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{userToEdit ? "Modify user details" : "Register a new employee or admin"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Name *</label>
              <input
                className={`${inputCls} ${errors.fullName ? "border-red-400" : ""}`}
                placeholder="e.g. John Doe"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
              {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Email Address *</label>
              <input
                type="email"
                className={`${inputCls} ${errors.email ? "border-red-400" : ""}`}
                placeholder="e.g. john.doe@company.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>

            {/* Department */}
            <div>
              <label className={labelCls}>Department *</label>
              <select className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className={labelCls}>Role *</label>
              <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value as UserRole)}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="gap-2">
              {userToEdit ? (
                <>Save Changes</>
              ) : (
                <><PlusCircle className="h-4 w-4" />Add User</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
