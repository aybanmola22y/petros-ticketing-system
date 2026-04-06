import type { MaintenanceRecord } from "@/types";
import type { MaintenanceStats } from "@/lib/services/maintenance-service";

export interface ReportMeta {
  periodLabel: string;
  periodType: "monthly" | "quarterly";
  generatedBy: string;
  generatedAt: string;
}

export function exportReportAsHTML(
  records: MaintenanceRecord[],
  stats: MaintenanceStats,
  meta: ReportMeta
): void {
  const html = buildReportHTML(records, stats, meta);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Slight delay so styles load before print dialog
  setTimeout(() => win.print(), 600);
}

function row(label: string, value: string | number, highlight = false): string {
  return `<tr class="${highlight ? "highlight" : ""}">
    <td class="label">${label}</td>
    <td class="value">${value}</td>
  </tr>`;
}

function buildReportHTML(
  records: MaintenanceRecord[],
  stats: MaintenanceStats,
  meta: ReportMeta
): string {
  const ISSUE_COLORS: Record<string, string> = {
    "Hardware Fix": "#3b82f6",
    "Software Fix": "#8b5cf6",
    "Replacement": "#ef4444",
    "Preventive Maintenance": "#10b981",
    "Data Recovery": "#f59e0b",
    "Upgrade": "#06b6d4",
  };

  const byTypeRows = (Object.entries(stats.byType) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(
      ([type, count]) =>
        `<div class="breakdown-item">
          <div class="breakdown-dot" style="background:${ISSUE_COLORS[type] ?? "#6b7280"}"></div>
          <span class="breakdown-label">${type}</span>
          <span class="breakdown-count">${count}</span>
        </div>`
    )
    .join("");

  const byDeviceRows = (Object.entries(stats.byDeviceType) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(
      ([type, count]) =>
        `<div class="breakdown-item">
          <span class="breakdown-label">${type}</span>
          <span class="breakdown-count">${count}</span>
        </div>`
    )
    .join("");

  const byDeptRows = (Object.entries(stats.byDepartment) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(
      ([dept, count]) =>
        `<div class="breakdown-item">
          <span class="breakdown-label">${dept}</span>
          <span class="breakdown-count">${count}</span>
        </div>`
    )
    .join("");

  const detailRows = records
    .sort(
      (a, b) =>
        new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime()
    )
    .map((r, i) => {
      const statusClass =
        r.status === "Completed"
          ? "status-completed"
          : r.status === "In Progress"
            ? "status-progress"
            : "status-pending";
      const resolvedDisplay = r.resolvedDate
        ? new Date(r.resolvedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        : "—";
      return `<tr class="${i % 2 === 0 ? "" : "alt"}">
        <td>${new Date(r.reportedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
        <td><strong>${r.deviceName}</strong></td>
        <td><span class="tag tag-device">${r.deviceType}</span></td>
        <td>${r.department}</td>
        <td><span class="tag tag-issue" style="background:${ISSUE_COLORS[r.issueType] ?? "#6b7280"}20;color:${ISSUE_COLORS[r.issueType] ?? "#6b7280"};border-color:${ISSUE_COLORS[r.issueType] ?? "#6b7280"}40">${r.issueType}</span></td>
        <td class="desc">${r.description}</td>
        <td>${r.technician}</td>
        <td>${resolvedDisplay}</td>
        <td><span class="${statusClass}">${r.status}</span></td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IT Maintenance Report — ${meta.periodLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a; /* 60% Navy Text */
      background: #ffffff; /* 10% White Canvas */
      font-size: 12px;
      line-height: 1.5;
    }

    /* Cover / Header */
    .cover {
      background: #0f172a;
      color: #fff;
      padding: 48px 56px 40px;
      position: relative;
      overflow: hidden;
      border-bottom: 4px solid #eab308; /* 30% Gold Accent */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cover::after {
      content: '';
      position: absolute;
      right: -60px; top: -60px;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: rgba(234, 179, 8, 0.05); /* Gold glow */
    }
    .cover-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 36px;
    }
    .logo-icon {
      width: 44px; height: 44px;
      background: #eab308;
      color: #0f172a;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; letter-spacing: -1px;
    }
    .logo-text { font-size: 16px; font-weight: 600; opacity: 0.9; }
    .logo-sub  { font-size: 11px; color: #eab308; margin-top: 1px; }
    .cover-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; color: #eab308; }
    .cover-subtitle { font-size: 15px; opacity: 0.8; margin-bottom: 28px; }
    .cover-meta {
      display: flex; gap: 32px;
      border-top: 1px solid rgba(234, 179, 8, 0.3);
      padding-top: 20px;
    }
    .cover-meta-item label { font-size: 10px; color: #eab308; text-transform: uppercase; letter-spacing: 0.8px; }
    .cover-meta-item p    { font-size: 13px; font-weight: 600; margin-top: 2px; }

    /* Body */
    .body { padding: 40px 56px; }

    /* Section */
    .section-title {
      font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.8px;
      color: #eab308; /* Gold */
      border-bottom: 2px solid #eab308;
      padding-bottom: 6px;
      margin-bottom: 16px;
      margin-top: 32px;
    }
    .section-title:first-child { margin-top: 0; }

    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 4px; }
    .kpi-card {
      border: 1px solid rgba(15, 23, 42, 0.1); /* Navy border */
      background: #ffffff;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .kpi-value { font-size: 30px; font-weight: 700; color: #eab308; line-height: 1; }
    .kpi-label { font-size: 11px; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .kpi-card.green .kpi-value { color: #059669; }
    .kpi-card.amber .kpi-value { color: #d97706; }
    .kpi-card.red   .kpi-value { color: #dc2626; }

    /* Breakdown */
    .breakdown-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .breakdown-col h4 {
      font-size: 11px; font-weight: 700; color: #eab308;
      text-transform: uppercase; letter-spacing: 0.6px;
      margin-bottom: 10px;
    }
    .breakdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid rgba(15, 23, 42, 0.1);
    }
    .breakdown-item:last-child { border-bottom: none; }
    .breakdown-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .breakdown-label { flex: 1; font-weight: 500; color: #0f172a; }
    .breakdown-count {
      font-weight: 700; font-size: 13px;
      background: #eab308;
      color: #0f172a;
      padding: 1px 8px;
      border-radius: 20px;
    }

    /* Table */
    .detail-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .detail-table thead th {
      background: #eab308; /* Gold Header */
      color: #0f172a; /* Navy Text */
      padding: 10px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .detail-table tbody tr { border-bottom: 1px solid rgba(15, 23, 42, 0.1); }
    .detail-table tbody tr.alt { background: rgba(15, 23, 42, 0.02); }
    .detail-table tbody td { padding: 8px 10px; vertical-align: top; color: #0f172a; }
    .detail-table tbody td.desc { max-width: 200px; color: #334155; }

    .tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      border: 1px solid;
      white-space: nowrap;
    }
    .tag-device { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
    .status-completed { color: #059669; font-weight: 600; }
    .status-progress  { color: #d97706; font-weight: 600; }
    .status-pending   { color: #dc2626; font-weight: 600; }

    /* Footer */
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #eab308;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
    }
    .sig-line { border-top: 1px solid #0f172a; margin-top: 32px; padding-top: 6px; font-size: 10px; color: #475569; }
    .sig-label { font-size: 10px; color: #0f172a; margin-bottom: 28px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }

    .confidential {
      text-align: center;
      margin-top: 24px;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media print {
      body { font-size: 11px; background: #ffffff !important; color: #0f172a !important; }
      .cover, .kpi-card, .detail-table thead, .breakdown-count, .logo-icon {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .body { padding: 28px 40px; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>

<!-- Cover Header -->
<div class="cover">
  <div class="cover-logo">
    <div class="logo-icon">PI</div>
    <div>
      <div class="logo-text">Petrosphere Incorporated</div>
      <div class="logo-sub">Information Security & Digital Solutions Department</div>
    </div>
  </div>
  <div class="cover-title">IT Asset Maintenance Report</div>
  <div class="cover-subtitle">${meta.periodType === "quarterly" ? "Quarterly" : "Monthly"} Summary — ${meta.periodLabel}</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <label>Report Type</label>
      <p>${meta.periodType === "quarterly" ? "Quarterly Report" : "Monthly Report"}</p>
    </div>
    <div class="cover-meta-item">
      <label>Period</label>
      <p>${meta.periodLabel}</p>
    </div>
    <div class="cover-meta-item">
      <label>Prepared By</label>
      <p>${meta.generatedBy}</p>
    </div>
    <div class="cover-meta-item">
      <label>Date Generated</label>
      <p>${meta.generatedAt}</p>
    </div>
    <div class="cover-meta-item">
      <label>Total Records</label>
      <p>${stats.total} maintenance ${stats.total === 1 ? "record" : "records"}</p>
    </div>
  </div>
</div>

<div class="body">

  <!-- Executive Summary -->
  <div class="section-title">Executive Summary</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${stats.total}</div>
      <div class="kpi-label">Total Requests</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-value">${stats.completed}</div>
      <div class="kpi-label">Completed</div>
    </div>
    <div class="kpi-card amber">
      <div class="kpi-value">${stats.inProgress}</div>
      <div class="kpi-label">In Progress</div>
    </div>
    <div class="kpi-card red">
      <div class="kpi-value">${stats.pending}</div>
      <div class="kpi-label">Pending</div>
    </div>
  </div>

  <!-- Breakdown -->
  <div class="section-title" style="margin-top:28px">Breakdown</div>
  <div class="breakdown-grid">
    <div class="breakdown-col">
      <h4>By Issue Type</h4>
      ${byTypeRows}
    </div>
    <div class="breakdown-col">
      <h4>By Device Type</h4>
      ${byDeviceRows}
    </div>
    <div class="breakdown-col">
      <h4>By Department</h4>
      ${byDeptRows}
    </div>
  </div>

  <!-- Detailed Records -->
  <div class="section-title">Detailed Maintenance Records</div>
  <table class="detail-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Device</th>
        <th>Type</th>
        <th>Department</th>
        <th>Issue Type</th>
        <th>Description</th>
        <th>Technician</th>
        <th>Resolved</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${detailRows}
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="footer">
    <div>
      <div class="sig-label">Prepared by</div>
      <div class="sig-line">${meta.generatedBy}<br>IT Department</div>
    </div>
    <div>
      <div class="sig-label">Reviewed by</div>
      <div class="sig-line">IT Manager</div>
    </div>
    <div>
      <div class="sig-label">Approved by</div>
      <div class="sig-line">Department Head</div>
    </div>
  </div>

  <div class="confidential">Confidential — For Internal Use Only</div>
</div>

</body>
</html>`;
}
