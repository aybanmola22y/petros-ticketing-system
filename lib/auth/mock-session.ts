"use client";

import type { User } from "@/types";
import { mockUsers } from "@/lib/data/mock-users";

const SESSION_KEY = "ticketing_current_user_id";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function loginAsUser(userId: string): User | null {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return null;
  localStorage.setItem(SESSION_KEY, userId);
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
