import React, { useState, useEffect } from "react";
import {
  getLeads,
  getCandidates,
  getJobOrders,
  getTasks,
  getMeetings,
} from "../services/api";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

function Reports() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    getLeads()
      .then((r) => setLeads(r.data))
      .catch(() => {});
    getCandidates()
      .then((r) => setCandidates(r.data))
      .catch(() => {});
    getJobOrders()
      .then((r) => setJobs(r.data))
      .catch(() => {});
    getTasks()
      .then((r) => setTasks(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/deals`)
      .then((r) => setDeals(r.data))
      .catch(() => {});
  }, []);

  const hotLeads = leads.filter((l) => l.status === "Hot").length;
  const warmLeads = leads.filter((l) => l.status === "Warm").length;
  const coldLeads = leads.filter((l) => l.status === "Cold").length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const filledJobs = jobs.filter((j) => j.status === "Filled").length;
  const placedCandidates = candidates.filter(
    (c) => c.stage === "Placed",
  ).length;
  const interviewCandidates = candidates.filter(
    (c) => c.stage === "Interview",
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const doneTasks = tasks.filter((t) => t.status === "Done").length;
  const totalDealValue = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );

  const Bar = ({ value, max, color }) => (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 4,
        height: 8,
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${max > 0 ? (value / max) * 100 : 0}%`,
          background: color,
          height: "100%",
          borderRadius: 4,
          transition: "width 0.3s",
        }}
      />
    </div>
  );

  const tabs = ["overview", "leads", "candidates", "jobs", "deals", "tasks"];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Reports</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.createBtn}>Create Report</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab}
            style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      <div style={s.content}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div style={s.kpiRow}>
              <div style={s.kpi}>
                <div style={s.kpiIcon}>👤</div>
                <div style={s.kpiVal}>{leads.length}</div>
                <div style={s.kpiLabel}>Total Leads</div>
                <div style={{ ...s.kpiChange, color: "#10b981" }}>
                  ↑ {hotLeads} Hot
                </div>
              </div>
              <div style={s.kpi}>
                <div style={s.kpiIcon}>🪪</div>
                <div style={s.kpiVal}>{candidates.length}</div>
                <div style={s.kpiLabel}>Total Candidates</div>
                <div style={{ ...s.kpiChange, color: "#10b981" }}>
                  ↑ {placedCandidates} Placed
                </div>
              </div>
              <div style={s.kpi}>
                <div style={s.kpiIcon}>💼</div>
                <div style={s.kpiVal}>{jobs.length}</div>
                <div style={s.kpiLabel}>Job Orders</div>
                <div style={{ ...s.kpiChange, color: "#10b981" }}>
                  ↑ {openJobs} Open
                </div>
              </div>
              <div style={s.kpi}>
                <div style={s.kpiIcon}>🤝</div>
                <div style={s.kpiVal}>
                  ₹{(totalDealValue / 100000).toFixed(1)}L
                </div>
                <div style={s.kpiLabel}>Pipeline Value</div>
                <div style={{ ...s.kpiChange, color: "#10b981" }}>
                  ↑ ₹{(wonValue / 100000).toFixed(1)}L Won
                </div>
              </div>
              <div style={s.kpi}>
                <div style={s.kpiIcon}>✅</div>
                <div style={s.kpiVal}>{tasks.length}</div>
                <div style={s.kpiLabel}>Total Tasks</div>
                <div style={{ ...s.kpiChange, color: "#ef4444" }}>
                  ↓ {pendingTasks} Pending
                </div>
              </div>
            </div>

            <div style={s.grid2}>
              {/* Leads by Status */}
              <div style={s.card}>
                <div style={s.cardTitle}>Leads by Status</div>
                <div style={s.barList}>
                  {[
                    { label: "Hot", val: hotLeads, color: "#ef4444" },
                    { label: "Warm", val: warmLeads, color: "#f59e0b" },
                    { label: "New", val: newLeads, color: "#3b82f6" },
                    { label: "Cold", val: coldLeads, color: "#94a3b8" },
                  ].map((item) => (
                    <div key={item.label} style={s.barRow}>
                      <span style={s.barLabel}>{item.label}</span>
                      <Bar
                        value={item.val}
                        max={leads.length}
                        color={item.color}
                      />
                      <span style={s.barVal}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidates by Stage */}
              <div style={s.card}>
                <div style={s.cardTitle}>Candidates by Stage</div>
                <div style={s.barList}>
                  {[
                    "Available",
                    "Screened",
                    "Interview",
                    "Shortlisted",
                    "Offered",
                    "Placed",
                  ].map((stage) => {
                    const count = candidates.filter(
                      (c) => c.stage === stage,
                    ).length;
                    return (
                      <div key={stage} style={s.barRow}>
                        <span style={s.barLabel}>{stage}</span>
                        <Bar
                          value={count}
                          max={candidates.length}
                          color="#6366f1"
                        />
                        <span style={s.barVal}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jobs by Status */}
              <div style={s.card}>
                <div style={s.cardTitle}>Job Orders by Status</div>
                <div style={s.barList}>
                  {["Open", "Sourcing", "On Hold", "Filled", "Closed"].map(
                    (status) => {
                      const count = jobs.filter(
                        (j) => j.status === status,
                      ).length;
                      return (
                        <div key={status} style={s.barRow}>
                          <span style={s.barLabel}>{status}</span>
                          <Bar
                            value={count}
                            max={jobs.length}
                            color="#10b981"
                          />
                          <span style={s.barVal}>{count}</span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Deals Pipeline */}
              <div style={s.card}>
                <div style={s.cardTitle}>Deals Pipeline</div>
                <div style={s.barList}>
                  {[
                    "Prospecting",
                    "Qualified",
                    "Proposal",
                    "Negotiation",
                    "Closed Won",
                    "Closed Lost",
                  ].map((stage) => {
                    const count = deals.filter((d) => d.stage === stage).length;
                    const val = deals
                      .filter((d) => d.stage === stage)
                      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                    return (
                      <div key={stage} style={s.barRow}>
                        <span style={s.barLabel}>{stage}</span>
                        <Bar
                          value={count}
                          max={deals.length || 1}
                          color={
                            stage === "Closed Won"
                              ? "#10b981"
                              : stage === "Closed Lost"
                                ? "#ef4444"
                                : "#f59e0b"
                          }
                        />
                        <span style={s.barVal}>
                          {count}{" "}
                          {val > 0 ? `· ₹${(val / 100000).toFixed(1)}L` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div style={s.card}>
            <div style={s.cardTitle}>Lead Report</div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Source</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} style={s.trow}>
                    <td style={s.tdLink}>{l.name}</td>
                    <td style={s.td}>{l.company}</td>
                    <td style={s.td}>{l.source}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...getBadge(l.status) }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      {l.createdAt
                        ? new Date(l.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div style={s.card}>
            <div style={s.cardTitle}>Candidate Report</div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Current Role</th>
                  <th style={s.th}>Skills</th>
                  <th style={s.th}>Experience</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} style={s.trow}>
                    <td style={s.tdLink}>{c.name}</td>
                    <td style={s.td}>{c.currentRole}</td>
                    <td style={s.td}>{c.skills}</td>
                    <td style={s.td}>{c.experience}</td>
                    <td style={s.td}>{c.location}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...getStageBadge(c.stage) }}>
                        {c.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div style={s.card}>
            <div style={s.cardTitle}>Job Orders Report</div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Openings</th>
                  <th style={s.th}>Priority</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} style={s.trow}>
                    <td style={s.tdLink}>{j.title}</td>
                    <td style={s.td}>{j.location}</td>
                    <td style={s.td}>{j.type}</td>
                    <td style={s.td}>{j.openings}</td>
                    <td style={s.td}>
                      <span
                        style={{ ...s.badge, ...getPriorityBadge(j.priority) }}
                      >
                        {j.priority}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...getStatusBadge(j.status) }}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div style={s.card}>
            <div style={s.cardTitle}>Deals Report</div>
            <div style={s.summaryRow}>
              <div style={s.summaryItem}>
                <div style={s.summaryVal}>
                  ₹{(totalDealValue / 100000).toFixed(1)}L
                </div>
                <div style={s.summaryLabel}>Total Pipeline</div>
              </div>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: "#10b981" }}>
                  ₹{(wonValue / 100000).toFixed(1)}L
                </div>
                <div style={s.summaryLabel}>Won</div>
              </div>
              <div style={s.summaryItem}>
                <div style={s.summaryVal}>{wonDeals.length}</div>
                <div style={s.summaryLabel}>Deals Won</div>
              </div>
              <div style={s.summaryItem}>
                <div style={s.summaryVal}>
                  {deals.length > 0
                    ? Math.round((wonDeals.length / deals.length) * 100)
                    : 0}
                  %
                </div>
                <div style={s.summaryLabel}>Win Rate</div>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Deal Name</th>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Closing Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} style={s.trow}>
                    <td style={s.tdLink}>{d.name}</td>
                    <td style={s.td}>{d.accountName}</td>
                    <td style={s.td}>
                      {d.amount
                        ? `₹${parseFloat(d.amount).toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{ ...s.badge, ...getDealStageBadge(d.stage) }}
                      >
                        {d.stage}
                      </span>
                    </td>
                    <td style={s.td}>{d.closingDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div style={s.card}>
            <div style={s.cardTitle}>Tasks Report</div>
            <div style={s.summaryRow}>
              <div style={s.summaryItem}>
                <div style={s.summaryVal}>{tasks.length}</div>
                <div style={s.summaryLabel}>Total Tasks</div>
              </div>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: "#ef4444" }}>
                  {pendingTasks}
                </div>
                <div style={s.summaryLabel}>Pending</div>
              </div>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: "#10b981" }}>
                  {doneTasks}
                </div>
                <div style={s.summaryLabel}>Done</div>
              </div>
              <div style={s.summaryItem}>
                <div style={s.summaryVal}>
                  {tasks.length > 0
                    ? Math.round((doneTasks / tasks.length) * 100)
                    : 0}
                  %
                </div>
                <div style={s.summaryLabel}>Completion Rate</div>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Subject</th>
                  <th style={s.th}>Due Date</th>
                  <th style={s.th}>Priority</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} style={s.trow}>
                    <td style={s.tdLink}>{t.title}</td>
                    <td style={s.td}>{t.dueDate || "—"}</td>
                    <td style={s.td}>
                      <span
                        style={{ ...s.badge, ...getPriorityBadge(t.priority) }}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(t.status === "Done"
                            ? { background: "#dcfce7", color: "#15803d" }
                            : { background: "#fee2e2", color: "#b91c1c" }),
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
        )}
      </div>
    </div>
  );
}

const getBadge = (status) => {
  switch (status) {
    case "Hot":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "Warm":
      return { background: "#fef3c7", color: "#92400e" };
    case "New":
      return { background: "#dbeafe", color: "#1d4ed8" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

const getStageBadge = (stage) => {
  switch (stage) {
    case "Placed":
      return { background: "#dcfce7", color: "#15803d" };
    case "Interview":
      return { background: "#ede9fe", color: "#5b21b6" };
    case "Offered":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

const getPriorityBadge = (p) => {
  switch (p) {
    case "Urgent":
    case "High":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "Medium":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#dbeafe", color: "#1d4ed8" };
  }
};

const getStatusBadge = (st) => {
  switch (st) {
    case "Open":
      return { background: "#dcfce7", color: "#15803d" };
    case "Filled":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "On Hold":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

const getDealStageBadge = (stage) => {
  switch (stage) {
    case "Closed Won":
      return { background: "#dcfce7", color: "#15803d" };
    case "Closed Lost":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "Negotiation":
      return { background: "#fef3c7", color: "#92400e" };
    default:
      return { background: "#dbeafe", color: "#1d4ed8" };
  }
};

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f4f5f7",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#1a1f3a" },
  headerRight: { display: "flex", gap: "8px" },
  createBtn: {
    background: "#1a1f3a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 16px",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: "0",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "0 20px",
  },
  tab: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.15s",
  },
  tabActive: {
    color: "#1a1f3a",
    fontWeight: "700",
    borderBottom: "2px solid #1a1f3a",
  },
  content: { flex: 1, overflowY: "auto", padding: "20px" },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  kpi: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "18px",
    textAlign: "center",
  },
  kpiIcon: { fontSize: "24px", marginBottom: "8px" },
  kpiVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1a1f3a",
    letterSpacing: "-1px",
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "4px",
  },
  kpiChange: { fontSize: "11px", fontWeight: "600", marginTop: "4px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "18px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1f3a",
    marginBottom: "16px",
  },
  barList: { display: "flex", flexDirection: "column", gap: "10px" },
  barRow: { display: "flex", alignItems: "center", gap: "10px" },
  barLabel: {
    fontSize: "12px",
    color: "#475569",
    width: "90px",
    flexShrink: 0,
  },
  barVal: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1a1f3a",
    width: "60px",
    textAlign: "right",
    flexShrink: 0,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  summaryItem: {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "center",
  },
  summaryVal: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1a1f3a",
    letterSpacing: "-0.5px",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "4px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "10px 12px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "10px 12px", fontSize: "12.5px", color: "#475569" },
  tdLink: {
    padding: "10px 12px",
    fontSize: "12.5px",
    color: "#3b82f6",
    fontWeight: "500",
  },
  badge: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
};

export default Reports;
