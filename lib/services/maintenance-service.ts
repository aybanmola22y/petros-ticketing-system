import type { MaintenanceRecord, DeviceType, IssueType } from "@/types";
import { mockMaintenanceRecords } from "@/lib/data/mock-maintenance";

export function getMaintenanceRecords(): MaintenanceRecord[] {
  return mockMaintenanceRecords;
}

export function getMaintenanceByPeriod(
  year: number,
  month?: number
): MaintenanceRecord[] {
  return mockMaintenanceRecords.filter((r) => {
    const date = new Date(r.reportedDate);
    if (date.getFullYear() !== year) return false;
    if (month !== undefined && date.getMonth() + 1 !== month) return false;
    return true;
  });
}

export function getMaintenanceByQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4
): MaintenanceRecord[] {
  const quarterMap: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
  };
  const months = quarterMap[quarter];
  return mockMaintenanceRecords.filter((r) => {
    const date = new Date(r.reportedDate);
    return (
      date.getFullYear() === year && months.includes(date.getMonth() + 1)
    );
  });
}

export interface MaintenanceStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  byType: Record<IssueType, number>;
  byDeviceType: Partial<Record<DeviceType, number>>;
  byDepartment: Record<string, number>;
}

export function computeMaintenanceStats(
  records: MaintenanceRecord[]
): MaintenanceStats {
  const byType = {} as Record<IssueType, number>;
  const byDeviceType = {} as Partial<Record<DeviceType, number>>;
  const byDepartment: Record<string, number> = {};

  for (const r of records) {
    byType[r.issueType] = (byType[r.issueType] ?? 0) + 1;
    byDeviceType[r.deviceType] = (byDeviceType[r.deviceType] ?? 0) + 1;
    byDepartment[r.department] = (byDepartment[r.department] ?? 0) + 1;
  }

  return {
    total: records.length,
    completed: records.filter((r) => r.status === "Completed").length,
    inProgress: records.filter((r) => r.status === "In Progress").length,
    pending: records.filter((r) => r.status === "Pending").length,
    byType,
    byDeviceType,
    byDepartment,
  };
}
