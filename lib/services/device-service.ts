import type { Device, DeviceType, DeviceStatus } from "@/types";
import { mockDevices } from "@/lib/data/mock-devices";

export function getDevices(): Device[] {
  return [...mockDevices];
}

export function addDevice(device: Device): Device {
  mockDevices.push(device);
  return device;
}

export function updateDevice(id: string, updates: Partial<Device>): Device | null {
  const idx = mockDevices.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  mockDevices[idx] = { ...mockDevices[idx], ...updates };
  return mockDevices[idx];
}

export function getDevicesByDepartment(department: string): Device[] {
  return mockDevices.filter((d) => d.department === department);
}

export function getDevicesByType(type: DeviceType): Device[] {
  return mockDevices.filter((d) => d.type === type);
}

export function getDevicesByStatus(status: DeviceStatus): Device[] {
  return mockDevices.filter((d) => d.status === status);
}

export function getDeviceStats(devices: Device[] = mockDevices) {
  const total = devices.length;
  const assigned = devices.filter((d) => d.assignedTo).length;
  const available = devices.filter((d) => d.status === "Available").length;
  const underRepair = devices.filter(
    (d) => d.status === "Under Repair"
  ).length;
  const retired = devices.filter((d) => d.status === "Retired").length;

  const byType = devices.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byDepartment = devices.reduce(
    (acc, d) => {
      if (!acc[d.department]) {
        acc[d.department] = { total: 0, assigned: 0, available: 0 };
      }
      acc[d.department].total += 1;
      if (d.assignedTo) acc[d.department].assigned += 1;
      if (d.status === "Available") acc[d.department].available += 1;
      return acc;
    },
    {} as Record<string, { total: number; assigned: number; available: number }>
  );

  return { total, assigned, available, underRepair, retired, byType, byDepartment };
}
