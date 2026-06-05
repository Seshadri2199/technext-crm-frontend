import React, { useState, useEffect } from "react";
import {
  getLeads,
  getCandidates,
  getJobOrders,
  getTasks,
} from "../services/api";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

function Analytics() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
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
    axios
      .get(`${BASE_URL}/deals`)
      .then((r) => setDeals(r.data))
      .catch(() => {});
  }, []);

  const totalDealValue = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const winRate =
    deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const placedCandidates = candidates.filter(
    (c) => c.stage === "Placed",
  ).length;
  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const hotLeads = leads.filter((l) => l.status === "Hot").length;

  const Donut = ({ value, max, color, label, sub }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <div style={s.donutWrap}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="46"
            textAnchor="middle"
            fontSize="14"
            fontWeight="800"
            fill="#1a1f3a"
          >
            {value}
          </text>
          <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#94a3b8">
            of {max}
          </text>
        </svg>
        <div style={s.donutLabel}>{label}</div>
        <div style={s.donutSub}>{sub}</div>
      </div>
    );
  };

  const HBar = ({ label, value, max, color }) => (
    <div style={s.hbarRow}>
      <div style={s.hbarLabel}>{label}</div>
      <div style={s.hbarTrack}>
        <div
          style={{
            ...s.hbarFill,
            width: `${max > 0 ? (value / max) * 100 : 0}%`,
            background: color,
          }}
        />
      </div>
      <div style={s.hbarVal}>{value}</div>
    </div>
  );

  const Gauge = ({ value, max, color, label }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div style={s.gaugeWrap}>
        <div style={s.gaugeLabel}>{label}</div>
        <div style={s.gaugeTrack}>
          <div
            style={{ ...s.gaugeFill, width: `${pct}%`, background: color }}
          />
          <div style={s.gaugeThumb(pct)} />
        </div>
        <div style={s.gaugeVals}>
          <span>0</span>
          <span style={{ fontWeight: 700, color }}>{value}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Analytics</span>
          <select style={s.select}>
            <option>Org Overview</option>
            <option>My Overview</option>
          </select>
        </div>
        <div style={s.headerRight}>
          <button style={s.outlineBtn}>Add Component</button>
          <button style={s.createBtn}>Create Dashboard</button>
        </div>
      </div>

      <div style={s.content}>
        {/* Top KPI Cards — like Zoho Analytics */}
        <div style={s.kpiRow}>
          <div style={s.kpiCard}>
            <div style={s.kpiTop}>
              <span style={s.kpiCardLabel}>LEADS THIS MONTH</span>
              <span style={s.kpiRefresh}>↻</span>
            </div>
            <div style={s.kpiCardVal}>{leads.length}</div>
            <div style={{ ...s.kpiCardChange, color: "#10b981" }}>
              ↑ {hotLeads} Hot leads
            </div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiTop}>
              <span style={s.kpiCardLabel}>REVENUE THIS MONTH</span>
              <span style={s.kpiRefresh}>↻</span>
            </div>
            <div style={s.kpiCardVal}>₹{(wonValue / 100000).toFixed(1)}L</div>
            <div
              style={{
                ...s.kpiCardChange,
                color: wonValue > 0 ? "#10b981" : "#ef4444",
              }}
            >
              {wonValue > 0 ? `↑ ${winRate}% win rate` : "No closed deals yet"}
            </div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiTop}>
              <span style={s.kpiCardLabel}>DEALS IN PIPELINE</span>
              <span style={s.kpiRefresh}>↻</span>
            </div>
            <div style={s.kpiCardVal}>{deals.length}</div>
            <div style={{ ...s.kpiCardChange, color: "#f59e0b" }}>
              ₹{(totalDealValue / 100000).toFixed(1)}L total value
            </div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiTop}>
              <span style={s.kpiCardLabel}>PLACEMENTS THIS MONTH</span>
              <span style={s.kpiRefresh}>↻</span>
            </div>
            <div style={s.kpiCardVal}>{placedCandidates}</div>
            <div style={{ ...s.kpiCardChange, color: "#10b981" }}>
              ↑ {openJobs} open positions
            </div>
          </div>
        </div>

        {/* Row 2 — Donut Charts */}
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}>Candidate Pipeline Overview</div>
            <div style={s.donutRow}>
              <Donut
                value={candidates.filter((c) => c.stage === "Interview").length}
                max={candidates.length}
                color="#6366f1"
                label="Interview"
                sub="stage"
              />
              <Donut
                value={
                  candidates.filter((c) => c.stage === "Shortlisted").length
                }
                max={candidates.length}
                color="#0ea5e9"
                label="Shortlisted"
                sub="stage"
              />
              <Donut
                value={candidates.filter((c) => c.stage === "Offered").length}
                max={candidates.length}
                color="#f59e0b"
                label="Offered"
                sub="stage"
              />
              <Donut
                value={placedCandidates}
                max={candidates.length}
                color="#10b981"
                label="Placed"
                sub="stage"
              />
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Deal Stage Distribution</div>
            <div style={s.donutRow}>
              {["Prospecting", "Qualified", "Proposal", "Negotiation"].map(
                (stage, i) => (
                  <Donut
                    key={stage}
                    value={deals.filter((d) => d.stage === stage).length}
                    max={deals.length || 1}
                    color={["#94a3b8", "#3b82f6", "#8b5cf6", "#f59e0b"][i]}
                    label={stage.split(" ")[0]}
                    sub="deals"
                  />
                ),
              )}
            </div>
          </div>
        </div>

        {/* Row 3 — Bar Charts */}
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}>Lead Generation Target — This Year</div>
            <div style={{ padding: "8px 0" }}>
              <Gauge
                value={leads.length}
                max={100}
                color="#e8505b"
                label="Lead Generation"
              />
              <div style={{ marginTop: 16 }}>
                <HBar
                  label="Hot"
                  value={hotLeads}
                  max={leads.length || 1}
                  color="#ef4444"
                />
                <HBar
                  label="Warm"
                  value={leads.filter((l) => l.status === "Warm").length}
                  max={leads.length || 1}
                  color="#f59e0b"
                />
                <HBar
                  label="New"
                  value={leads.filter((l) => l.status === "New").length}
                  max={leads.length || 1}
                  color="#3b82f6"
                />
                <HBar
                  label="Cold"
                  value={leads.filter((l) => l.status === "Cold").length}
                  max={leads.length || 1}
                  color="#94a3b8"
                />
              </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Revenue Target — This Year</div>
            <div style={{ padding: "8px 0" }}>
              <Gauge
                value={wonValue}
                max={1000000}
                color="#10b981"
                label="Revenue (₹)"
              />
              <div style={{ marginTop: 16 }}>
                {[
                  "Prospecting",
                  "Qualified",
                  "Proposal",
                  "Negotiation",
                  "Closed Won",
                ].map((stage) => {
                  const val = deals
                    .filter((d) => d.stage === stage)
                    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                  return (
                    <HBar
                      key={stage}
                      label={stage.split(" ")[0]}
                      value={Math.round(val / 1000)}
                      max={Math.round(totalDealValue / 1000) || 1}
                      color={stage === "Closed Won" ? "#10b981" : "#6366f1"}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4 — Activity Summary */}
        <div style={s.card}>
          <div style={s.cardTitle}>Activity Summary</div>
          <div style={s.activityGrid}>
            {[
              {
                label: "Total Leads",
                val: leads.length,
                color: "#3b82f6",
                icon: "👤",
              },
              {
                label: "Hot Leads",
                val: hotLeads,
                color: "#ef4444",
                icon: "🔥",
              },
              {
                label: "Open Jobs",
                val: openJobs,
                color: "#10b981",
                icon: "💼",
              },
              {
                label: "Total Candidates",
                val: candidates.length,
                color: "#6366f1",
                icon: "🪪",
              },
              {
                label: "Placed",
                val: placedCandidates,
                color: "#10b981",
                icon: "✅",
              },
              {
                label: "Pending Tasks",
                val: tasks.filter((t) => t.status === "Pending").length,
                color: "#f59e0b",
                icon: "⏳",
              },
              {
                label: "Done Tasks",
                val: tasks.filter((t) => t.status === "Done").length,
                color: "#10b981",
                icon: "✔️",
              },
              {
                label: "Total Deals",
                val: deals.length,
                color: "#8b5cf6",
                icon: "🤝",
              },
              {
                label: "Won Deals",
                val: wonDeals.length,
                color: "#10b981",
                icon: "🏆",
              },
              {
                label: "Pipeline Value",
                val: `₹${(totalDealValue / 100000).toFixed(1)}L`,
                color: "#1a1f3a",
                icon: "💰",
              },
            ].map((item) => (
              <div key={item.label} style={s.activityItem}>
                <div style={s.activityIcon}>{item.icon}</div>
                <div style={{ ...s.activityVal, color: item.color }}>
                  {item.val}
                </div>
                <div style={s.activityLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    flexWrap: "wrap",
    gap: "8px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#1a1f3a" },
  select: {
    padding: "5px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#475569",
    outline: "none",
    cursor: "pointer",
  },
  headerRight: { display: "flex", gap: "8px" },
  outlineBtn: {
    background: "#fff",
    color: "#1a1f3a",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "7px 14px",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
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
  content: { flex: 1, overflowY: "auto", padding: "20px" },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "18px",
  },
  kpiTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  kpiCardLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  kpiRefresh: { color: "#94a3b8", cursor: "pointer", fontSize: "14px" },
  kpiCardVal: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1a1f3a",
    letterSpacing: "-1px",
    marginBottom: "6px",
  },
  kpiCardChange: { fontSize: "12px", fontWeight: "600" },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
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
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  donutRow: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "8px",
  },
  donutWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  donutLabel: { fontSize: "11px", fontWeight: "600", color: "#475569" },
  donutSub: { fontSize: "10px", color: "#94a3b8" },
  hbarRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  hbarLabel: {
    fontSize: "11.5px",
    color: "#475569",
    width: "80px",
    flexShrink: 0,
  },
  hbarTrack: {
    flex: 1,
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "4px",
    overflow: "hidden",
  },
  hbarFill: { height: "100%", borderRadius: "4px", transition: "width 0.3s" },
  hbarVal: {
    fontSize: "11.5px",
    fontWeight: "600",
    color: "#1a1f3a",
    width: "30px",
    textAlign: "right",
  },
  gaugeWrap: { marginBottom: "8px" },
  gaugeLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "6px",
  },
  gaugeTrack: {
    height: "10px",
    background: "#f1f5f9",
    borderRadius: "5px",
    position: "relative",
    overflow: "visible",
  },
  gaugeFill: { height: "100%", borderRadius: "5px", transition: "width 0.3s" },
  gaugeThumb: (pct) => ({
    position: "absolute",
    top: "-4px",
    left: `${pct}%`,
    width: "18px",
    height: "18px",
    background: "#fff",
    border: "2px solid #1a1f3a",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
  }),
  gaugeVals: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "14px",
  },
  activityItem: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  activityIcon: { fontSize: "22px", marginBottom: "8px" },
  activityVal: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    marginBottom: "4px",
  },
  activityLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
};

export default Analytics;
