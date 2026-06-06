import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export default function Reports() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/candidates`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/deals`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/tasks`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/meetings`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/jobs`).catch(() => ({ data: [] })),
    ]).then(([l, c, p, d, t, m, j]) => {
      setLeads(l.data);
      setCandidates(c.data);
      setPlacements(p.data);
      setDeals(d.data);
      setTasks(t.data);
      setMeetings(m.data);
      setJobs(j.data);
      setLoading(false);
    });
  }, []);

  const totalCommission = placements.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const totalPipeline = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );

  const handlePrint = (reportType) => {
    const date = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    let content = "";

    if (reportType === "overview") {
      content = `
        <h2 style="color:#6366f1;margin-bottom:20px">📊 Overall CRM Summary Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
          <tr style="background:#f8f9fc"><th>Module</th><th>Total</th><th>Key Metric</th></tr>
          <tr><td>Leads</td><td>${leads.length}</td><td>Hot: ${leads.filter((l) => l.status === "Hot").length} | Warm: ${leads.filter((l) => l.status === "Warm").length}</td></tr>
          <tr style="background:#f8f9fc"><td>Candidates</td><td>${candidates.length}</td><td>Placed: ${candidates.filter((c) => c.stage === "Placed").length} | Interview: ${candidates.filter((c) => c.stage === "Interview").length}</td></tr>
          <tr><td>Placements</td><td>${placements.length}</td><td>Active: ${placements.filter((p) => p.status === "Active").length} | Commission: ₹${totalCommission.toLocaleString("en-IN")}</td></tr>
          <tr style="background:#f8f9fc"><td>Deals</td><td>${deals.length}</td><td>Pipeline: ₹${totalPipeline.toLocaleString("en-IN")} | Won: ₹${wonValue.toLocaleString("en-IN")}</td></tr>
          <tr><td>Job Orders</td><td>${jobs.length}</td><td>Open: ${jobs.filter((j) => j.status === "Open").length}</td></tr>
          <tr style="background:#f8f9fc"><td>Tasks</td><td>${tasks.length}</td><td>Pending: ${tasks.filter((t) => t.status === "Pending").length} | Done: ${tasks.filter((t) => t.status === "Done").length}</td></tr>
          <tr><td>Meetings</td><td>${meetings.length}</td><td>Upcoming: ${meetings.filter((m) => m.status === "Upcoming").length}</td></tr>
        </table>
      `;
    } else if (reportType === "placements") {
      content = `
        <h2 style="color:#6366f1;margin-bottom:20px">🏆 Placements Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
          <tr style="background:#f8f9fc"><th>#</th><th>Candidate</th><th>Job Title</th><th>Client Company</th><th>Start Date</th><th>Salary</th><th>Commission</th><th>Status</th></tr>
          ${placements
            .map(
              (p, i) => `
            <tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}">
              <td>${i + 1}</td><td>${p.candidateName || "—"}</td><td>${p.jobTitle || "—"}</td>
              <td>${p.clientCompany || "—"}</td><td>${p.startDate || "—"}</td>
              <td>₹${parseFloat(p.salary || 0).toLocaleString("en-IN")}</td>
              <td>₹${parseFloat(p.commission || 0).toLocaleString("en-IN")}</td>
              <td>${p.status || "—"}</td>
            </tr>
          `,
            )
            .join("")}
          <tr style="background:#eef2ff;font-weight:bold">
            <td colspan="6">TOTAL</td>
            <td>₹${totalCommission.toLocaleString("en-IN")}</td><td></td>
          </tr>
        </table>
      `;
    } else if (reportType === "leads") {
      content = `
        <h2 style="color:#6366f1;margin-bottom:20px">👤 Leads Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
          <tr style="background:#f8f9fc"><th>#</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Source</th><th>Status</th></tr>
          ${leads
            .map(
              (l, i) => `
            <tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}">
              <td>${i + 1}</td><td>${l.name || "—"}</td><td>${l.company || "—"}</td>
              <td>${l.email || "—"}</td><td>${l.phone || "—"}</td>
              <td>${l.source || "—"}</td><td>${l.status || "—"}</td>
            </tr>
          `,
            )
            .join("")}
        </table>
      `;
    } else if (reportType === "candidates") {
      content = `
        <h2 style="color:#6366f1;margin-bottom:20px">🪪 Candidates Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
          <tr style="background:#f8f9fc"><th>#</th><th>Name</th><th>Current Role</th><th>Skills</th><th>Experience</th><th>Location</th><th>Stage</th></tr>
          ${candidates
            .map(
              (c, i) => `
            <tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}">
              <td>${i + 1}</td><td>${c.name || "—"}</td><td>${c.currentRole || "—"}</td>
              <td>${c.skills || "—"}</td><td>${c.experience || "—"}</td>
              <td>${c.location || "—"}</td><td>${c.stage || "—"}</td>
            </tr>
          `,
            )
            .join("")}
        </table>
      `;
    } else if (reportType === "deals") {
      content = `
        <h2 style="color:#6366f1;margin-bottom:20px">🤝 Deals Report</h2>
        <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
          <tr style="background:#f8f9fc"><th>#</th><th>Deal Name</th><th>Account</th><th>Amount</th><th>Stage</th><th>Closing Date</th></tr>
          ${deals
            .map(
              (d, i) => `
            <tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}">
              <td>${i + 1}</td><td>${d.name || "—"}</td><td>${d.accountName || "—"}</td>
              <td>₹${parseFloat(d.amount || 0).toLocaleString("en-IN")}</td>
              <td>${d.stage || "—"}</td><td>${d.closingDate || "—"}</td>
            </tr>
          `,
            )
            .join("")}
          <tr style="background:#eef2ff;font-weight:bold">
            <td colspan="3">TOTAL PIPELINE</td>
            <td>₹${totalPipeline.toLocaleString("en-IN")}</td><td colspan="2"></td>
          </tr>
        </table>
      `;
    }

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>TechNext CRM Report</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Segoe UI',sans-serif; padding:40px; color:#0f1117; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; padding-bottom:20px; border-bottom:3px solid #6366f1; }
            .company { font-size:22px; font-weight:800; color:#6366f1; }
            .company-sub { font-size:11px; color:#6b7280; margin-top:4px; }
            .report-meta { text-align:right; font-size:12px; color:#6b7280; }
            .report-date { font-size:14px; font-weight:700; color:#0f1117; margin-bottom:4px; }
            table { border-color:#e5e7f0; }
            th { background:#f8f9fc; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; }
            td, th { border-color:#e5e7f0 !important; }
            .footer { margin-top:40px; text-align:center; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7f0; padding-top:16px; }
            @media print { body { padding:20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">TechNext Staffing Pvt. Ltd.</div>
              <div class="company-sub">Koramangala, Bengaluru - 560034 | info@technextstaffing.in</div>
            </div>
            <div class="report-meta">
              <div class="report-date">Generated: ${date}</div>
              <div>TechNext CRM Report</div>
            </div>
          </div>
          ${content}
          <div class="footer">
            This report was generated from TechNext CRM Portal · Confidential
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "placements", label: "Placements", icon: "🏆" },
    { id: "leads", label: "Leads", icon: "👤" },
    { id: "candidates", label: "Candidates", icon: "🪪" },
    { id: "deals", label: "Deals", icon: "🤝" },
    { id: "activities", label: "Activities", icon: "📅" },
  ];

  const StatCard = ({ icon, label, value, sub, color }) => (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: color + "20" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
      </div>
      <div style={s.statVal}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "4px solid #eef2ff",
            borderTop: "4px solid #6366f1",
          }}
        />
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          Loading reports...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Reports & Analytics</div>
          <div style={s.sub}>Real-time insights from your CRM data</div>
        </div>
        <div style={s.headerRight}>
          <button
            style={s.printBtn}
            onClick={() =>
              handlePrint(activeTab === "activities" ? "overview" : activeTab)
            }
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div style={s.statsGrid}>
              <StatCard
                icon="👤"
                label="Total Leads"
                value={leads.length}
                sub={`Hot: ${leads.filter((l) => l.status === "Hot").length}`}
                color="#6366f1"
              />
              <StatCard
                icon="🪪"
                label="Candidates"
                value={candidates.length}
                sub={`Placed: ${candidates.filter((c) => c.stage === "Placed").length}`}
                color="#10b981"
              />
              <StatCard
                icon="🏆"
                label="Placements"
                value={placements.length}
                sub={`Active: ${placements.filter((p) => p.status === "Active").length}`}
                color="#8b5cf6"
              />
              <StatCard
                icon="💰"
                label="Commission"
                value={`₹${(totalCommission / 100000).toFixed(1)}L`}
                sub="Total earned"
                color="#f59e0b"
              />
              <StatCard
                icon="🤝"
                label="Deal Pipeline"
                value={`₹${(totalPipeline / 100000).toFixed(1)}L`}
                sub={`Won: ₹${(wonValue / 100000).toFixed(1)}L`}
                color="#3b82f6"
              />
              <StatCard
                icon="📋"
                label="Job Orders"
                value={jobs.length}
                sub={`Open: ${jobs.filter((j) => j.status === "Open").length}`}
                color="#0ea5e9"
              />
              <StatCard
                icon="✅"
                label="Tasks"
                value={tasks.length}
                sub={`Pending: ${tasks.filter((t) => t.status === "Pending").length}`}
                color="#10b981"
              />
              <StatCard
                icon="📅"
                label="Meetings"
                value={meetings.length}
                sub={`Upcoming: ${meetings.filter((m) => m.status === "Upcoming").length}`}
                color="#6366f1"
              />
            </div>

            {/* Lead breakdown */}
            <div style={s.tableCard}>
              <div style={s.tableTitle}>Lead Status Breakdown</div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Count</th>
                    <th style={s.th}>Percentage</th>
                    <th style={s.th}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {["Hot", "Warm", "New", "Cold"].map((st) => {
                    const count = leads.filter((l) => l.status === st).length;
                    const pct =
                      leads.length > 0
                        ? Math.round((count / leads.length) * 100)
                        : 0;
                    const colors = {
                      Hot: "#ef4444",
                      Warm: "#f59e0b",
                      New: "#3b82f6",
                      Cold: "#6b7280",
                    };
                    return (
                      <tr key={st} style={s.trow}>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: colors[st] + "20",
                              color: colors[st],
                            }}
                          >
                            {st}
                          </span>
                        </td>
                        <td style={s.td}>{count}</td>
                        <td style={s.td}>{pct}%</td>
                        <td style={s.td}>
                          <div style={s.progTrack}>
                            <div
                              style={{
                                ...s.progFill,
                                width: `${pct}%`,
                                background: colors[st],
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Placements Tab */}
        {activeTab === "placements" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>
                All Placements ({placements.length})
              </div>
              <div style={s.tableSub}>
                Total Commission:{" "}
                <strong style={{ color: "#8b5cf6" }}>
                  ₹{totalCommission.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Candidate</th>
                  <th style={s.th}>Job Title</th>
                  <th style={s.th}>Client Company</th>
                  <th style={s.th}>Start Date</th>
                  <th style={s.th}>Salary</th>
                  <th style={s.th}>Commission</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {placements.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={s.empty}>
                      No placements yet
                    </td>
                  </tr>
                ) : (
                  placements.map((p, i) => (
                    <tr key={p.id} style={s.trow}>
                      <td style={s.td}>{i + 1}</td>
                      <td
                        style={{ ...s.td, fontWeight: "600", color: "#6366f1" }}
                      >
                        {p.candidateName || "—"}
                      </td>
                      <td style={s.td}>{p.jobTitle || "—"}</td>
                      <td style={s.td}>{p.clientCompany || "—"}</td>
                      <td style={s.td}>{p.startDate || "—"}</td>
                      <td style={{ ...s.td, fontWeight: "700" }}>
                        ₹{parseFloat(p.salary || 0).toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: "700", color: "#8b5cf6" }}
                      >
                        ₹{parseFloat(p.commission || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              p.status === "Active"
                                ? "#f0fdf4"
                                : p.status === "Completed"
                                  ? "#eff6ff"
                                  : "#fef2f2",
                            color:
                              p.status === "Active"
                                ? "#10b981"
                                : p.status === "Completed"
                                  ? "#3b82f6"
                                  : "#ef4444",
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>All Leads ({leads.length})</div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Source</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.empty}>
                      No leads yet
                    </td>
                  </tr>
                ) : (
                  leads.map((l, i) => {
                    const colors = {
                      Hot: "#ef4444",
                      Warm: "#f59e0b",
                      New: "#3b82f6",
                      Cold: "#6b7280",
                    };
                    return (
                      <tr key={l.id} style={s.trow}>
                        <td style={s.td}>{i + 1}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "600",
                            color: "#6366f1",
                          }}
                        >
                          {l.name || "—"}
                        </td>
                        <td style={s.td}>{l.company || "—"}</td>
                        <td style={s.td}>{l.email || "—"}</td>
                        <td style={s.td}>{l.phone || "—"}</td>
                        <td style={s.td}>
                          <span style={s.sourceChip}>{l.source || "—"}</span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background:
                                (colors[l.status] || "#6b7280") + "20",
                              color: colors[l.status] || "#6b7280",
                            }}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>
                All Candidates ({candidates.length})
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Skills</th>
                  <th style={s.th}>Experience</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.empty}>
                      No candidates yet
                    </td>
                  </tr>
                ) : (
                  candidates.map((c, i) => (
                    <tr key={c.id} style={s.trow}>
                      <td style={s.td}>{i + 1}</td>
                      <td
                        style={{ ...s.td, fontWeight: "600", color: "#6366f1" }}
                      >
                        {c.name || "—"}
                      </td>
                      <td style={s.td}>{c.currentRole || "—"}</td>
                      <td style={s.td}>
                        {c.skills
                          ? c.skills.split(",").slice(0, 2).join(", ")
                          : "—"}
                      </td>
                      <td style={s.td}>{c.experience || "—"}</td>
                      <td style={s.td}>{c.location || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: "#f5f3ff",
                            color: "#8b5cf6",
                          }}
                        >
                          {c.stage}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>All Deals ({deals.length})</div>
              <div style={s.tableSub}>
                Pipeline:{" "}
                <strong style={{ color: "#f59e0b" }}>
                  ₹{totalPipeline.toLocaleString("en-IN")}
                </strong>{" "}
                · Won:{" "}
                <strong style={{ color: "#10b981" }}>
                  ₹{wonValue.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Deal Name</th>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Closing Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={s.empty}>
                      No deals yet
                    </td>
                  </tr>
                ) : (
                  deals.map((d, i) => {
                    const stageColors = {
                      "Closed Won": "#10b981",
                      "Closed Lost": "#ef4444",
                      Negotiation: "#f59e0b",
                      Proposal: "#8b5cf6",
                      Qualified: "#3b82f6",
                      Prospecting: "#6b7280",
                    };
                    return (
                      <tr key={d.id} style={s.trow}>
                        <td style={s.td}>{i + 1}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "600",
                            color: "#6366f1",
                          }}
                        >
                          {d.name || "—"}
                        </td>
                        <td style={s.td}>{d.accountName || "—"}</td>
                        <td style={{ ...s.td, fontWeight: "700" }}>
                          ₹{parseFloat(d.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background:
                                (stageColors[d.stage] || "#6b7280") + "20",
                              color: stageColors[d.stage] || "#6b7280",
                            }}
                          >
                            {d.stage}
                          </span>
                        </td>
                        <td style={s.td}>{d.closingDate || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div style={s.tableCard}>
              <div style={s.tableTitle}>Recent Tasks ({tasks.length})</div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Task</th>
                    <th style={s.th}>Due Date</th>
                    <th style={s.th}>Priority</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 8).map((t) => (
                    <tr key={t.id} style={s.trow}>
                      <td style={s.td}>{t.title || "—"}</td>
                      <td style={s.td}>{t.dueDate || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              t.priority === "High" ? "#fef2f2" : "#fffbeb",
                            color:
                              t.priority === "High" ? "#ef4444" : "#f59e0b",
                          }}
                        >
                          {t.priority || "Normal"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              t.status === "Done" ? "#f0fdf4" : "#fef2f2",
                            color: t.status === "Done" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={s.tableCard}>
              <div style={s.tableTitle}>
                Recent Meetings ({meetings.length})
              </div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Title</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.slice(0, 8).map((m) => (
                    <tr key={m.id} style={s.trow}>
                      <td style={s.td}>{m.title || "—"}</td>
                      <td style={s.td}>{m.meetingDate || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              m.status === "Upcoming" ? "#f0fdf4" : "#f9fafb",
                            color:
                              m.status === "Upcoming" ? "#10b981" : "#6b7280",
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f8f9fc",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", gap: "10px" },
  printBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  tab: {
    background: "none",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  statVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
  },
  statSub: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  tableHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f3f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    padding: "16px 20px 12px",
  },
  tableSub: { fontSize: "12.5px", color: "#6b7280", padding: "0 20px 12px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
  th: {
    padding: "10px 16px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "11px 16px", fontSize: "13px", color: "#374151" },
  badge: {
    padding: "3px 9px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
  sourceChip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  progTrack: {
    width: "120px",
    height: "6px",
    background: "#f1f3f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progFill: { height: "100%", borderRadius: "3px", transition: "width 0.3s" },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },
};
