"use client";

import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MonitorSmartphone,
  Laptop,
  CheckCircle2,
  Wrench,
  Building2,
  Package,
  PlusCircle,
  X,
  FileDown,
  ClipboardList,
  LayoutGrid,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { getDevices, getDeviceStats, addDevice, updateDevice } from "@/lib/services/device-service";
import {
  getMaintenanceByPeriod,
  getMaintenanceByQuarter,
  computeMaintenanceStats,
} from "@/lib/services/maintenance-service";
import { exportReportAsHTML } from "@/lib/utils/report-export";
import { useAuth } from "@/components/shared/auth-context";
import type { Device, DeviceType, DeviceStatus, MaintenanceRecord } from "@/types";

export default function AdminDevicesPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <DevicesPage />
      </AdminLayout>
    </RouteGuard>
  );
}

// ─── Color maps ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<DeviceStatus, string> = {
  "In Use":       "bg-blue-100 text-blue-700 border-blue-200",
  "Available":    "bg-green-100 text-green-700 border-green-200",
  "Under Repair": "bg-amber-100 text-amber-700 border-amber-200",
  "Retired":      "bg-red-100 text-red-700 border-red-200",
};

const TYPE_COLORS: Record<DeviceType, string> = {
  Laptop:  "bg-indigo-100 text-indigo-700 border-indigo-200",
  Desktop: "bg-purple-100 text-purple-700 border-purple-200",
  Monitor: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Phone:   "bg-pink-100 text-pink-700 border-pink-200",
  Printer: "bg-orange-100 text-orange-700 border-orange-200",
  Other:   "bg-gray-100 text-gray-700 border-gray-200",
};

const CONDITION_COLORS = {
  Good: "text-green-600",
  Fair: "text-amber-600",
  Poor: "text-red-600",
};

const ISSUE_COLORS: Record<string, string> = {
  "Hardware Fix":           "bg-blue-50 text-blue-700 border-blue-200",
  "Software Fix":           "bg-purple-50 text-purple-700 border-purple-200",
  "Replacement":            "bg-red-50 text-red-700 border-red-200",
  "Preventive Maintenance": "bg-green-50 text-green-700 border-green-200",
  "Data Recovery":          "bg-amber-50 text-amber-700 border-amber-200",
  "Upgrade":                "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const MAINT_STATUS_COLORS = {
  Completed:    "bg-green-100 text-green-700 border-green-200",
  "In Progress":"bg-amber-100 text-amber-700 border-amber-200",
  Pending:      "bg-red-100 text-red-700 border-red-200",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

function DevicesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"inventory" | "reports">("inventory");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="text-muted-foreground mt-1">
            Company asset inventory &amp; IT maintenance audit
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <TabBtn
          active={tab === "inventory"}
          onClick={() => setTab("inventory")}
          icon={<LayoutGrid className="h-4 w-4" />}
          label="Inventory"
        />
        <TabBtn
          active={tab === "reports"}
          onClick={() => setTab("reports")}
          icon={<ClipboardList className="h-4 w-4" />}
          label="Maintenance &amp; Reports"
        />
      </div>

      {tab === "inventory" ? (
        <InventoryTab />
      ) : (
        <ReportsTab userName={user?.fullName ?? "IT Administrator"} />
      )}
    </div>
  );
}

function TabBtn({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
      dangerouslySetInnerHTML={undefined}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </span>
    </button>
  );
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────

function InventoryTab() {
  const [allDevices, setAllDevices] = useState<Device[]>(getDevices());
  const stats = useMemo(() => getDeviceStats(allDevices), [allDevices]);

  const [deptFilter, setDeptFilter]     = useState("All");
  const [typeFilter, setTypeFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingDevice, setEditingDevice] = useState<Device | "new" | null>(null);

  const departments = ["All", ...Object.keys(stats.byDepartment).sort()];
  const deviceTypes: (DeviceType | "All")[] = ["All","Laptop","Desktop","Monitor","Phone","Printer","Other"];
  const statuses: (DeviceStatus | "All")[]  = ["All","In Use","Available","Under Repair","Retired"];

  const filtered = useMemo(() => {
    return allDevices.filter((d) => {
      if (deptFilter   !== "All" && d.department !== deptFilter)   return false;
      if (typeFilter   !== "All" && d.type       !== typeFilter)   return false;
      if (statusFilter !== "All" && d.status     !== statusFilter) return false;
      return true;
    });
  }, [allDevices, deptFilter, typeFilter, statusFilter]);

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MonitorSmartphone className="h-5 w-5 text-indigo-500"/>} label="Total Devices"  value={allDevices.length}      bg="bg-indigo-50" />
        <StatCard icon={<Laptop           className="h-5 w-5 text-purple-500"/>} label="Laptops"        value={allDevices.filter(d=>d.type==="Laptop").length} bg="bg-purple-50" />
        <StatCard icon={<CheckCircle2     className="h-5 w-5 text-green-500"/>}  label="Available"      value={allDevices.filter(d=>d.status==="Available").length} bg="bg-green-50" />
        <StatCard icon={<Wrench          className="h-5 w-5 text-amber-500"/>}  label="Under Repair"   value={allDevices.filter(d=>d.status==="Under Repair").length} bg="bg-amber-50" />
      </div>

      {/* Filter + Add */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: deptFilter,   setter: setDeptFilter,   options: departments,  prefix: "All Departments" },
                { value: typeFilter,   setter: setTypeFilter,   options: deviceTypes,  prefix: "All Types" },
                { value: statusFilter, setter: setStatusFilter, options: statuses,     prefix: "All Statuses" },
              ].map(({ value, setter, options, prefix }, idx) => (
                <select
                  key={idx}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {options.map((o) => (
                    <option key={o} value={o}>{o === "All" ? prefix : o}</option>
                  ))}
                </select>
              ))}
              {(deptFilter !== "All" || typeFilter !== "All" || statusFilter !== "All") && (
                <button
                  onClick={() => { setDeptFilter("All"); setTypeFilter("All"); setStatusFilter("All"); }}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} of {allDevices.length} devices</span>
            <Button size="sm" className="ml-auto gap-2" onClick={() => setEditingDevice("new")}>
              <PlusCircle className="h-4 w-4" />
              Add Device
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />Device Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Device Name","Type","Serial No.","Department","Assigned To","Status","Condition","Purchase Date"].map((h, i) => (
                    <th
                      key={h}
                      className={`text-left px-4 py-3 font-medium text-muted-foreground ${
                        i === 2 ? "hidden md:table-cell" :
                        i === 4 ? "hidden sm:table-cell" :
                        i === 6 ? "hidden lg:table-cell" :
                        i === 7 ? "hidden xl:table-cell" : ""
                      }`}
                    >{h}</th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No devices match the selected filters.</td></tr>
                ) : (
                  filtered.map((device, idx) => (
                    <tr key={device.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 !== 0 ? "bg-muted/10" : ""}`}>
                      <td className="px-4 py-3 font-medium">{device.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[device.type]}`}>{device.type}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">{device.serialNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{device.department}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{device.assignedTo ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[device.status]}`}>{device.status}</span>
                      </td>
                      <td className={`px-4 py-3 hidden lg:table-cell text-xs font-medium ${CONDITION_COLORS[device.condition]}`}>{device.condition}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                        {new Date(device.purchaseDate).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingDevice(device)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Department Summary */}
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4" />Department Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.byDepartment).sort(([a],[b])=>a.localeCompare(b)).map(([dept, counts]) => (
            <Card key={dept}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{dept}</p>
                    <p className="text-2xl font-bold mt-1">{counts.total}</p>
                    <p className="text-xs text-muted-foreground">total devices</p>
                  </div>
                  <div className="text-right space-y-1 mt-0.5">
                    <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{counts.assigned}</span> assigned</div>
                    <div className="text-xs text-muted-foreground"><span className="font-medium text-green-600">{counts.available}</span> available</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(
                    allDevices.filter((d) => d.department === dept).reduce((acc, d) => { acc[d.type] = (acc[d.type] ?? 0) + 1; return acc; }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <span key={type} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[type as DeviceType]}`}>{count}× {type}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Device Modal */}
      {editingDevice && (
        <DeviceFormModal
          deviceToEdit={editingDevice === "new" ? undefined : editingDevice}
          onClose={() => setEditingDevice(null)}
          onSave={(updatedDevice) => {
            if (editingDevice === "new") addDevice(updatedDevice);
            else updateDevice(updatedDevice.id, updatedDevice);
            setAllDevices(getDevices());
            setEditingDevice(null);
          }}
        />
      )}
    </>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab({ userName }: { userName: string }) {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [periodType, setPeriodType] = useState<"monthly" | "quarterly">("monthly");
  const [year,  setYear]    = useState(currentYear);
  const [month, setMonth]   = useState(currentMonth);
  const [quarter, setQuarter] = useState<1|2|3|4>(Math.ceil(currentMonth / 3) as 1|2|3|4);

  const records = useMemo<MaintenanceRecord[]>(() => {
    if (periodType === "monthly")   return getMaintenanceByPeriod(year, month);
    return getMaintenanceByQuarter(year, quarter);
  }, [periodType, year, month, quarter]);

  const stats = useMemo(() => computeMaintenanceStats(records), [records]);

  const periodLabel = useMemo(() => {
    if (periodType === "monthly") return `${MONTHS[month - 1]} ${year}`;
    return `Q${quarter} ${year}`;
  }, [periodType, year, month, quarter]);

  function handleExport() {
    exportReportAsHTML(records, stats, {
      periodLabel,
      periodType,
      generatedBy: userName,
      generatedAt: new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),
    });
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Report Type</label>
              <div className="flex mt-1.5 rounded-lg border overflow-hidden">
                {(["monthly","quarterly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPeriodType(t)}
                    className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${periodType===t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="block mt-1.5 text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {periodType === "monthly" ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="block mt-1.5 text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quarter</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(Number(e.target.value) as 1|2|3|4)}
                  className="block mt-1.5 text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[1,2,3,4].map((q) => <option key={q} value={q}>Q{q} (Jan–Mar / Apr–Jun / Jul–Sep / Oct–Dec)</option>)}
                </select>
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={records.length === 0}
              className="ml-auto gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Period Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{periodLabel}</h2>
        <span className="text-sm text-muted-foreground">— {records.length} maintenance {records.length === 1 ? "record" : "records"}</span>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No maintenance records found for this period.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<ClipboardList className="h-5 w-5 text-indigo-500"/>} label="Total Requests" value={stats.total}       bg="bg-indigo-50" />
            <StatCard icon={<CheckCircle2  className="h-5 w-5 text-green-500"/>}  label="Completed"      value={stats.completed}    bg="bg-green-50" />
            <StatCard icon={<Wrench       className="h-5 w-5 text-amber-500"/>}  label="In Progress"    value={stats.inProgress}   bg="bg-amber-50" />
            <StatCard icon={<X            className="h-5 w-5 text-red-500"/>}    label="Pending"        value={stats.pending}      bg="bg-red-50" />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BreakdownCard title="By Issue Type" data={stats.byType as Record<string,number>} colorMap={ISSUE_COLORS} />
            <BreakdownCard title="By Device Type" data={stats.byDeviceType as Record<string,number>} colorMap={TYPE_COLORS} />
            <BreakdownCard title="By Department"  data={stats.byDepartment} />
          </div>

          {/* Records Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />Maintenance Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      {["Date","Device","Type","Department","Issue Type","Description","Technician","Resolved","Status"].map((h,i) => (
                        <th key={h} className={`text-left px-4 py-3 font-medium text-muted-foreground ${i===5?"hidden lg:table-cell":i===6?"hidden md:table-cell":i===7?"hidden xl:table-cell":""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, idx) => (
                      <tr key={r.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${idx%2!==0?"bg-muted/10":""}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                          {new Date(r.reportedDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{r.deviceName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[r.deviceType]}`}>{r.deviceType}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.department}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ISSUE_COLORS[r.issueType]}`}>{r.issueType}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell max-w-[200px]">{r.description}</td>
                        <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">{r.technician}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden xl:table-cell whitespace-nowrap">
                          {r.resolvedDate ? new Date(r.resolvedDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${MAINT_STATUS_COLORS[r.status]}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Device Form Modal ─────────────────────────────────────────────────────────

const DEPARTMENTS = ["IT Operations","Marketing","Finance","HR","Sales","Operations","Executive","Legal","Other"];

function DeviceFormModal({ onClose, onSave, deviceToEdit }: {
  onClose: () => void;
  onSave: (device: Device) => void;
  deviceToEdit?: Device;
}) {
  const [form, setForm] = useState({
    name: deviceToEdit?.name || "",
    type: deviceToEdit?.type || "Laptop" as DeviceType,
    serialNumber: deviceToEdit?.serialNumber || "",
    department: deviceToEdit?.department || "IT Operations",
    assignedTo: deviceToEdit?.assignedTo || "",
    status: deviceToEdit?.status || "Available" as DeviceStatus,
    condition: deviceToEdit?.condition || "Good" as "Good" | "Fair" | "Poor",
    purchaseDate: deviceToEdit?.purchaseDate || new Date().toISOString().split("T")[0],
    notes: deviceToEdit?.notes || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const copy = {...e}; delete copy[key]; return copy; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())         e.name         = "Device name is required";
    if (!form.serialNumber.trim()) e.serialNumber = "Serial number is required";
    if (!form.purchaseDate)        e.purchaseDate = "Purchase date is required";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      id: deviceToEdit?.id || `dev-new-${Date.now()}`,
      name:         form.name.trim(),
      type:         form.type,
      serialNumber: form.serialNumber.trim(),
      department:   form.department,
      assignedTo:   form.assignedTo.trim() || undefined,
      status:       form.status,
      condition:    form.condition,
      purchaseDate: form.purchaseDate,
      notes:        form.notes.trim() || undefined,
    });
  }

  const inputCls = "w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const errCls   = "text-xs text-red-500 mt-1";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{deviceToEdit ? "Edit Device" : "Add New Device"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {deviceToEdit ? "Update existing IT asset details" : "Register a new company-owned asset"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Device Name */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Device Name *</label>
              <input
                className={`${inputCls} ${errors.name ? "border-red-400" : ""}`}
                placeholder="e.g. PETRO-LT-023"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && <p className={errCls}>{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className={labelCls}>Device Type *</label>
              <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value as DeviceType)}>
                {(["Laptop","Desktop","Monitor","Phone","Printer","Other"] as DeviceType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div>
              <label className={labelCls}>Serial Number *</label>
              <input
                className={`${inputCls} font-mono ${errors.serialNumber ? "border-red-400" : ""}`}
                placeholder="e.g. SN-LP-20260330-023"
                value={form.serialNumber}
                onChange={(e) => set("serialNumber", e.target.value)}
              />
              {errors.serialNumber && <p className={errCls}>{errors.serialNumber}</p>}
            </div>

            {/* Department */}
            <div>
              <label className={labelCls}>Department *</label>
              <select className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className={labelCls}>Assigned To <span className="text-muted-foreground">(optional)</span></label>
              <input
                className={inputCls}
                placeholder="Employee full name"
                value={form.assignedTo}
                onChange={(e) => set("assignedTo", e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Status *</label>
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as DeviceStatus)}>
                {(["Available","In Use","Under Repair","Retired"] as DeviceStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className={labelCls}>Condition *</label>
              <select className={inputCls} value={form.condition} onChange={(e) => set("condition", e.target.value as "Good"|"Fair"|"Poor")}>
                {["Good","Fair","Poor"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className={labelCls}>Purchase Date *</label>
              <input
                type="date"
                className={`${inputCls} ${errors.purchaseDate ? "border-red-400" : ""}`}
                value={form.purchaseDate}
                onChange={(e) => set("purchaseDate", e.target.value)}
              />
              {errors.purchaseDate && <p className={errCls}>{errors.purchaseDate}</p>}
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Notes <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Any additional notes about this device..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="gap-2">
              {deviceToEdit ? (
                <>Save Changes</>
              ) : (
                <><PlusCircle className="h-4 w-4" />Register Device</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${bg}`}>{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title, data, colorMap,
}: {
  title: string;
  data: Record<string, number>;
  colorMap?: Record<string, string>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {entries.length === 0
          ? <p className="text-xs text-muted-foreground">No data</p>
          : entries.map(([key, count]) => (
            <div key={key} className="flex items-center gap-2">
              {colorMap && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[key] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>{key}</span>
              )}
              {!colorMap && <span className="flex-1 text-sm text-muted-foreground">{key}</span>}
              <span className="ml-auto font-bold text-sm">{count}</span>
            </div>
          ))
        }
      </CardContent>
    </Card>
  );
}
