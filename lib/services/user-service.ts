import type { User } from "@/types";
import { mockUsers } from "@/lib/data/mock-users";
import { getCurrentUser, loginAsUser, logoutUser } from "@/lib/auth/mock-session";

export { getCurrentUser, loginAsUser, logoutUser };

export function getUsers(): User[] {
  return [...mockUsers];
}

export function getUserById(userId: string): User | null {
  return mockUsers.find((u) => u.id === userId) ?? null;
}

export function addUser(user: User): void {
  mockUsers.push(user);
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;
  mockUsers[index] = { ...mockUsers[index], ...updates };
  return mockUsers[index];
}
