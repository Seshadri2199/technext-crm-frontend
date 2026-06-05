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

export default function Dashboard({ user, onNavigate }) {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [deals, setDeals] = useState([]);

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
    getMeetings()
      .then((r) => setMeetings(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/deals`)
      .then((r) => setDeals(r.data))
      .catch(() => {});
  }, []);

  const role = user.role;
  const pendingTasks = tasks.filter((t) => t.status === "Pending");
  const upcomingMeetings = meetings.filter((m) => m.status === "Upcoming");
  const hotLeads = leads.filter((l) => l.status === "Hot").length;
  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const placedCandidates = candidates.filter(
    (c) => c.stage === "Placed",
  ).length;
  const totalDealValue = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "#ef4444";
      case "Recruiter":
        return "#10b981";
      case "Sales":
        return "#3b82f6";
      case "HR Manager":
        return "#8b5cf6";
      case "Staff":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const StatCard = ({ label, value, sub, color, icon, onClick }) => (
    <div
      style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
      onClick={onClick}
    >
      <div style={s.statTop}>
        <div style={{ ...s.statIconWrap, background: `${color}15` }}>
          <span style={{ fontSize: "20px" }}>{icon}</span>
        </div>
        <div style={{ ...s.statTrend, color }}>↑</div>
      </div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );

  const getBadge = (status) => {
    switch (status) {
      case "Hot":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Warm":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "New":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Cold":
        return { bg: "#f9fafb", color: "#6b7280" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "Placed":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Interview":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "Offered":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "Screened":
        return { bg: "#eff6ff", color: "#3b82f6" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.greeting}>
            {getGreeting()}, {user.name.split(" ")[0]} 👋
          </div>
          <div style={s.headerSub}>
            Here's what's happening in your CRM today
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.dateBadge}>
            📅{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div
            style={{
              ...s.roleBadge,
              background: `${getRoleColor(role)}15`,
              color: getRoleColor(role),
              border: `1px solid ${getRoleColor(role)}30`,
            }}
          >
            {role}
          </div>
        </div>
      </div>

      <div style={s.content}>
        {/* Stats Grid */}
        {(role === "Admin" || role === "Sales") && (
          <div style={s.statsGrid}>
            <StatCard
              label="Total Leads"
              value={leads.length}
              sub={`${hotLeads} Hot`}
              color="#ef4444"
              icon="👤"
              onClick={() => onNavigate("leads")}
            />
            <StatCard
              label="Active Deals"
              value={deals.length}
              sub={`₹${(totalDealValue / 100000).toFixed(1)}L pipeline`}
              color="#f59e0b"
              icon="🤝"
              onClick={() => onNavigate("deals")}
            />
            <StatCard
              label="Open Tasks"
              value={pendingTasks.length}
              sub="Needs attention"
              color="#6366f1"
              icon="✅"
              onClick={() => onNavigate("tasks")}
            />
            <StatCard
              label="Meetings"
              value={upcomingMeetings.length}
              sub="Upcoming"
              color="#0ea5e9"
              icon="📅"
              onClick={() => onNavigate("meetings")}
            />
          </div>
        )}

        {(role === "Recruiter" || role === "HR Manager") && (
          <div style={s.statsGrid}>
            <StatCard
              label="Total Candidates"
              value={candidates.length}
              sub={`${placedCandidates} Placed`}
              color="#10b981"
              icon="🪪"
              onClick={() => onNavigate("candidates")}
            />
            <StatCard
              label="Open Jobs"
              value={openJobs}
              sub="Active openings"
              color="#6366f1"
              icon="📋"
              onClick={() => onNavigate("jobs")}
            />
            <StatCard
              label="Open Tasks"
              value={pendingTasks.length}
              sub="Needs attention"
              color="#f59e0b"
              icon="✅"
              onClick={() => onNavigate("tasks")}
            />
            <StatCard
              label="Meetings"
              value={upcomingMeetings.length}
              sub="Upcoming"
              color="#0ea5e9"
              icon="📅"
              onClick={() => onNavigate("meetings")}
            />
          </div>
        )}

        {role === "Staff" && (
          <div style={s.statsGrid}>
            <StatCard
              label="My Tasks"
              value={pendingTasks.length}
              sub="Pending"
              color="#6366f1"
              icon="✅"
              onClick={() => onNavigate("tasks")}
            />
            <StatCard
              label="Meetings"
              value={upcomingMeetings.length}
              sub="Upcoming"
              color="#0ea5e9"
              icon="📅"
              onClick={() => onNavigate("meetings")}
            />
            <StatCard
              label="Completed"
              value={tasks.filter((t) => t.status === "Done").length}
              sub="Tasks done"
              color="#10b981"
              icon="✔️"
              onClick={() => onNavigate("tasks")}
            />
            <StatCard
              label="Total Tasks"
              value={tasks.length}
              sub="All time"
              color="#f59e0b"
              icon="📋"
              onClick={() => onNavigate("tasks")}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div style={s.mainGrid}>
          {/* Tasks Panel */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}>
                <span style={s.panelDot("#6366f1")} />
                My Open Tasks
              </div>
              <button style={s.panelBtn} onClick={() => onNavigate("tasks")}>
                View All →
              </button>
            </div>
            <div style={s.panelBody}>
              {pendingTasks.length === 0 ? (
                <div style={s.empty}>
                  <div style={s.emptyIcon}>✅</div>
                  <div style={s.emptyText}>All tasks completed!</div>
                </div>
              ) : (
                pendingTasks.slice(0, 6).map((task) => (
                  <div key={task.id} style={s.taskRow}>
                    <div style={s.taskCheck} />
                    <div style={s.taskBody}>
                      <div style={s.taskTitle}>{task.title}</div>
                      <div style={s.taskMeta}>
                        {task.dueDate && (
                          <span
                            style={{
                              ...s.taskDue,
                              ...(new Date(task.dueDate) < new Date()
                                ? { color: "#ef4444" }
                                : {}),
                            }}
                          >
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        ...s.taskBadge,
                        ...(task.priority === "High"
                          ? { background: "#fef2f2", color: "#ef4444" }
                          : task.priority === "Medium"
                            ? { background: "#fffbeb", color: "#f59e0b" }
                            : { background: "#eff6ff", color: "#3b82f6" }),
                      }}
                    >
                      {task.priority || "Normal"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Meetings Panel */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}>
                <span style={s.panelDot("#0ea5e9")} />
                Upcoming Meetings
              </div>
              <button style={s.panelBtn} onClick={() => onNavigate("meetings")}>
                View All →
              </button>
            </div>
            <div style={s.panelBody}>
              {upcomingMeetings.length === 0 ? (
                <div style={s.empty}>
                  <div style={s.emptyIcon}>📅</div>
                  <div style={s.emptyText}>No upcoming meetings</div>
                </div>
              ) : (
                upcomingMeetings.slice(0, 5).map((m) => (
                  <div key={m.id} style={s.meetRow}>
                    <div style={s.meetDate}>
                      <div style={s.meetDay}>
                        {m.meetingDate
                          ? new Date(m.meetingDate).getDate()
                          : "--"}
                      </div>
                      <div style={s.meetMonth}>
                        {m.meetingDate
                          ? new Date(m.meetingDate).toLocaleString("default", {
                              month: "short",
                            })
                          : "--"}
                      </div>
                    </div>
                    <div style={s.meetBody}>
                      <div style={s.meetTitle}>{m.title}</div>
                      <div style={s.meetMeta}>
                        {m.meetingTime || "--"} · {m.location || "TBD"}
                      </div>
                    </div>
                    <span
                      style={{
                        ...s.meetBadge,
                        background: "#f0fdf4",
                        color: "#10b981",
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={s.mainGrid}>
          {/* Leads — Admin/Sales */}
          {(role === "Admin" || role === "Sales") && (
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>
                  <span style={s.panelDot("#ef4444")} />
                  Recent Leads
                </div>
                <button style={s.panelBtn} onClick={() => onNavigate("leads")}>
                  View All →
                </button>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Company</th>
                    <th style={s.th}>Source</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 5).map((lead) => {
                    const b = getBadge(lead.status);
                    return (
                      <tr key={lead.id} style={s.tr}>
                        <td style={s.tdLink}>{lead.name}</td>
                        <td style={s.td}>{lead.company}</td>
                        <td style={s.td}>{lead.source || "—"}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: b.bg,
                              color: b.color,
                            }}
                          >
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Candidates — Admin/Recruiter/HR */}
          {(role === "Admin" ||
            role === "Recruiter" ||
            role === "HR Manager") && (
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>
                  <span style={s.panelDot("#10b981")} />
                  Recent Candidates
                </div>
                <button
                  style={s.panelBtn}
                  onClick={() => onNavigate("candidates")}
                >
                  View All →
                </button>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.slice(0, 5).map((c) => {
                    const b = getStageBadge(c.stage);
                    return (
                      <tr key={c.id} style={s.tr}>
                        <td style={s.tdLink}>{c.name}</td>
                        <td style={s.td}>{c.currentRole || "—"}</td>
                        <td style={s.td}>{c.location || "—"}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: b.bg,
                              color: b.color,
                            }}
                          >
                            {c.stage}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Staff — Activity summary */}
          {role === "Staff" && (
            <div style={{ ...s.panel, gridColumn: "1/-1" }}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>
                  <span style={s.panelDot("#6366f1")} />
                  My Activity Summary
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "16px",
                }}
              >
                {[
                  {
                    label: "Pending Tasks",
                    val: pendingTasks.length,
                    color: "#6366f1",
                    icon: "⏳",
                  },
                  {
                    label: "Meetings Today",
                    val: upcomingMeetings.length,
                    color: "#0ea5e9",
                    icon: "📅",
                  },
                  {
                    label: "Completed Tasks",
                    val: tasks.filter((t) => t.status === "Done").length,
                    color: "#10b981",
                    icon: "✅",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      ...s.actCard,
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: item.color,
                      }}
                    >
                      {item.val}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "500",
                        marginTop: "4px",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    background: "#f8f9fc",
    minHeight: "100%",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  header: {
    background: "linear-gradient(135deg,#0f1117 0%,#1a1f3a 100%)",
    padding: "28px 28px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {},
  greeting: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  headerSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
    marginTop: "4px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  dateBadge: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  roleBadge: {
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "700",
  },
  content: { padding: "20px 24px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7f0",
    transition: "all 0.2s",
  },
  statTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  statIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statTrend: { fontSize: "14px", fontWeight: "700" },
  statValue: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "600",
    marginTop: "6px",
  },
  statSub: { fontSize: "11px", color: "#9ca3af", marginTop: "3px" },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  panel: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  panelHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid #f1f3f9",
  },
  panelTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
  },
  panelDot: (color) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),
  panelBtn: {
    background: "none",
    border: "none",
    fontSize: "12px",
    color: "#6366f1",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  panelBody: { padding: "8px" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px",
    gap: "8px",
  },
  emptyIcon: { fontSize: "32px" },
  emptyText: { fontSize: "13px", color: "#9ca3af", fontWeight: "500" },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: "8px",
    transition: "background 0.1s",
    cursor: "pointer",
  },
  taskCheck: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    border: "1.5px solid #d1d5db",
    flexShrink: 0,
  },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle: {
    fontSize: "13px",
    color: "#0f1117",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  taskMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "2px",
  },
  taskDue: { fontSize: "11px", color: "#9ca3af" },
  taskBadge: {
    padding: "2px 7px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
  },
  meetRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 10px",
    borderRadius: "8px",
    transition: "background 0.1s",
    cursor: "pointer",
  },
  meetDate: {
    width: "40px",
    textAlign: "center",
    background: "#f8f9fc",
    borderRadius: "8px",
    padding: "6px 4px",
    flexShrink: 0,
  },
  meetDay: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f1117",
    lineHeight: 1,
  },
  meetMonth: {
    fontSize: "9px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  meetBody: { flex: 1, minWidth: 0 },
  meetTitle: {
    fontSize: "13px",
    color: "#0f1117",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meetMeta: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  meetBadge: {
    padding: "2px 7px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "9px 18px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    background: "#f8f9fc",
    borderBottom: "1px solid #f1f3f9",
  },
  tr: {
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.1s",
    cursor: "pointer",
  },
  td: { padding: "10px 18px", fontSize: "12.5px", color: "#374151" },
  tdLink: {
    padding: "10px 18px",
    fontSize: "12.5px",
    color: "#6366f1",
    fontWeight: "500",
  },
  badge: {
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  actCard: {
    background: "#f8f9fc",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #e5e7f0",
  },
};
