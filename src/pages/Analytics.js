import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
  Legend,
} from "recharts";

const BASE_URL = "http://localhost:8080/api";
const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#ec4899",
];

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7f0",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#0f1117",
              marginBottom: "4px",
            }}
          >
            {label}
          </p>
          {payload.map((p, i) => (
            <p
              key={i}
              style={{ fontSize: "12px", color: p.color, margin: "2px 0" }}
            >
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Recruitment Funnel
  const funnelData = [
    { name: "Total Leads", value: leads.length, fill: "#6366f1" },
    {
      name: "Hot Leads",
      value: leads.filter((l) => l.status === "Hot").length,
      fill: "#8b5cf6",
    },
    { name: "Candidates", value: candidates.length, fill: "#3b82f6" },
    {
      name: "Interviews",
      value: candidates.filter((c) => c.stage === "Interview").length,
      fill: "#10b981",
    },
    {
      name: "Offered",
      value: candidates.filter((c) => c.stage === "Offered").length,
      fill: "#f59e0b",
    },
    { name: "Placed", value: placements.length, fill: "#ef4444" },
  ];

  // Lead Source distribution
  const leadSources = [
    "LinkedIn",
    "Referral",
    "Website",
    "Cold Call",
    "Event",
    "Other",
  ]
    .map((src) => ({
      name: src,
      value: leads.filter((l) => l.source === src).length,
    }))
    .filter((d) => d.value > 0);

  // Candidate skill distribution
  const skillMap = {};
  candidates.forEach((c) => {
    if (c.skills)
      c.skills.split(",").forEach((sk) => {
        const s = sk.trim();
        if (s) skillMap[s] = (skillMap[s] || 0) + 1;
      });
  });
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Deal stage analysis
  const dealStages = [
    "Prospecting",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ].map((stage) => ({
    stage,
    count: deals.filter((d) => d.stage === stage).length,
    value: deals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
  }));

  // Monthly trend (simulated)
  const monthlyTrend = [
    { month: "Jan", leads: 8, candidates: 5, placements: 2, revenue: 180000 },
    { month: "Feb", leads: 12, candidates: 8, placements: 3, revenue: 270000 },
    { month: "Mar", leads: 15, candidates: 10, placements: 4, revenue: 380000 },
    { month: "Apr", leads: 10, candidates: 7, placements: 3, revenue: 290000 },
    { month: "May", leads: 18, candidates: 12, placements: 5, revenue: 470000 },
    {
      month: "Jun",
      leads: leads.length,
      candidates: candidates.length,
      placements: placements.length,
      revenue: placements.reduce(
        (sum, p) => sum + (parseFloat(p.commission) || 0),
        0,
      ),
    },
  ];

  // Task completion
  const taskCompletion = [
    {
      name: "Done",
      value: tasks.filter((t) => t.status === "Done").length,
      fill: "#10b981",
    },
    {
      name: "Pending",
      value: tasks.filter((t) => t.status === "Pending").length,
      fill: "#f59e0b",
    },
  ];

  // Placement by company
  const companyMap = {};
  placements.forEach((p) => {
    if (p.clientCompany)
      companyMap[p.clientCompany] = (companyMap[p.clientCompany] || 0) + 1;
  });
  const placementsByCompany = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const KPICard = ({ icon, label, value, change, color }) => (
    <div style={s.kpiCard}>
      <div style={s.kpiTop}>
        <div style={{ ...s.kpiIcon, background: color + "20" }}>
          <span style={{ fontSize: "18px" }}>{icon}</span>
        </div>
        {change && (
          <span
            style={{
              ...s.kpiChange,
              color: parseFloat(change) >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {parseFloat(change) >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={s.kpiVal}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
    </div>
  );

  const totalCommission = placements.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const conversionRate =
    leads.length > 0 ? Math.round((placements.length / leads.length) * 100) : 0;
  const avgSalary =
    placements.length > 0
      ? Math.round(
          placements.reduce((sum, p) => sum + (parseFloat(p.salary) || 0), 0) /
            placements.length,
        )
      : 0;

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
          Loading analytics...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Advanced Analytics</div>
          <div style={s.sub}>Deep insights into your staffing operations</div>
        </div>
        <div style={s.periodToggle}>
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              style={{
                ...s.periodBtn,
                ...(period === p ? s.periodBtnActive : {}),
              }}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content}>
        {/* KPI Row */}
        <div style={s.kpiGrid}>
          <KPICard
            icon="🏆"
            label="Total Placements"
            value={placements.length}
            change="12"
            color="#8b5cf6"
          />
          <KPICard
            icon="💰"
            label="Total Commission"
            value={`₹${(totalCommission / 100000).toFixed(1)}L`}
            change="8"
            color="#f59e0b"
          />
          <KPICard
            icon="📊"
            label="Conversion Rate"
            value={`${conversionRate}%`}
            change="5"
            color="#6366f1"
          />
          <KPICard
            icon="💼"
            label="Avg Salary"
            value={`₹${(avgSalary / 100000).toFixed(1)}L`}
            change="3"
            color="#10b981"
          />
          <KPICard
            icon="👤"
            label="Total Leads"
            value={leads.length}
            change="15"
            color="#3b82f6"
          />
          <KPICard
            icon="🪪"
            label="Candidates"
            value={candidates.length}
            change="10"
            color="#0ea5e9"
          />
        </div>

        {/* Row 1: Trend + Funnel */}
        <div style={s.chartRow}>
          <div style={{ ...s.chartCard, flex: 2 }}>
            <div style={s.chartTitle}>📈 Monthly Performance Trend</div>
            <div style={s.chartSub}>
              Leads, Candidates & Placements over 6 months
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#g1)"
                  name="Leads"
                />
                <Area
                  type="monotone"
                  dataKey="candidates"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#g2)"
                  name="Candidates"
                />
                <Area
                  type="monotone"
                  dataKey="placements"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#g3)"
                  name="Placements"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>🎯 Recruitment Funnel</div>
            <div style={s.chartSub}>Lead to placement conversion</div>
            <div style={{ padding: "10px 0" }}>
              {funnelData.map((item, i) => {
                const maxVal = funnelData[0].value || 1;
                const pct = Math.round((item.value / maxVal) * 100);
                return (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "#6b7280",
                        marginBottom: "3px",
                      }}
                    >
                      <span style={{ fontWeight: "600" }}>{item.name}</span>
                      <span style={{ fontWeight: "700", color: item.fill }}>
                        {item.value}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#f1f3f9",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: item.fill,
                          borderRadius: "4px",
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Sources + Skills + Task */}
        <div style={s.chartRow}>
          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>📡 Lead Sources</div>
            <div style={s.chartSub}>Where leads come from</div>
            {leadSources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {leadSources.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={s.legend}>
                  {leadSources.map((item, i) => (
                    <div key={i} style={s.legendItem}>
                      <div
                        style={{
                          ...s.legendDot,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                      <span style={s.legendLabel}>{item.name}</span>
                      <span style={s.legendVal}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={s.noData}>No lead data</div>
            )}
          </div>

          <div style={{ ...s.chartCard, flex: 1.5 }}>
            <div style={s.chartTitle}>💻 Top Skills in Demand</div>
            <div style={s.chartSub}>Most common candidate skills</div>
            {topSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topSkills} layout="vertical" barSize={16}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f3f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#374151" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Candidates" radius={[0, 4, 4, 0]}>
                    {topSkills.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={s.noData}>Add candidate skills to see data</div>
            )}
          </div>

          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>✅ Task Completion</div>
            <div style={s.chartSub}>{tasks.length} total tasks</div>
            {tasks.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={taskCompletion}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskCompletion.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={s.legend}>
                  {taskCompletion.map((item, i) => (
                    <div key={i} style={s.legendItem}>
                      <div style={{ ...s.legendDot, background: item.fill }} />
                      <span style={s.legendLabel}>{item.name}</span>
                      <span style={s.legendVal}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  {tasks.length > 0
                    ? Math.round(
                        (tasks.filter((t) => t.status === "Done").length /
                          tasks.length) *
                          100,
                      )
                    : 0}
                  % Complete
                </div>
              </>
            ) : (
              <div style={s.noData}>No task data</div>
            )}
          </div>
        </div>

        {/* Row 3: Deal stages + Placements by company */}
        <div style={s.chartRow}>
          <div style={{ ...s.chartCard, flex: 1.5 }}>
            <div style={s.chartTitle}>🤝 Deal Pipeline by Stage</div>
            <div style={s.chartSub}>Count and value per stage</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dealStages} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f3f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                  {dealStages.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>🏢 Placements by Client</div>
            <div style={s.chartSub}>Top hiring companies</div>
            {placementsByCompany.length > 0 ? (
              <div style={{ padding: "8px 0" }}>
                {placementsByCompany.map((item, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ color: "#374151", fontWeight: "600" }}>
                        {item.name}
                      </span>
                      <span
                        style={{
                          color: COLORS[i % COLORS.length],
                          fontWeight: "700",
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "#f1f3f9",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(item.value / placementsByCompany[0].value) * 100}%`,
                          background: COLORS[i % COLORS.length],
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={s.noData}>No placement data</div>
            )}
          </div>

          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>📊 Quick Insights</div>
            <div style={s.chartSub}>Key performance metrics</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingTop: "8px",
              }}
            >
              {[
                {
                  label: "Lead → Placement Rate",
                  value: `${conversionRate}%`,
                  color: "#6366f1",
                },
                {
                  label: "Open Job Orders",
                  value: jobs.filter((j) => j.status === "Open").length,
                  color: "#10b981",
                },
                {
                  label: "Won Deals",
                  value: deals.filter((d) => d.stage === "Closed Won").length,
                  color: "#f59e0b",
                },
                {
                  label: "Avg Commission",
                  value:
                    placements.length > 0
                      ? `₹${Math.round(totalCommission / placements.length).toLocaleString("en-IN")}`
                      : "—",
                  color: "#8b5cf6",
                },
                {
                  label: "Interviews Scheduled",
                  value: candidates.filter((c) => c.stage === "Interview")
                    .length,
                  color: "#3b82f6",
                },
                {
                  label: "Upcoming Meetings",
                  value: meetings.filter((m) => m.status === "Upcoming").length,
                  color: "#0ea5e9",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    background: "#f8f9fc",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
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
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  periodToggle: {
    display: "flex",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  periodBtn: {
    background: "none",
    border: "none",
    padding: "7px 14px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  periodBtnActive: { background: "#6366f1", color: "#fff", fontWeight: "700" },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    gap: "12px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  kpiTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  kpiIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiChange: { fontSize: "11px", fontWeight: "700" },
  kpiVal: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  kpiLabel: {
    fontSize: "11.5px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
  },
  chartRow: { display: "flex", gap: "14px" },
  chartCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  chartTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "3px",
  },
  chartSub: { fontSize: "11.5px", color: "#9ca3af", marginBottom: "14px" },
  legend: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" },
  legendItem: { display: "flex", alignItems: "center", gap: "5px" },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: { fontSize: "11px", color: "#6b7280" },
  legendVal: { fontSize: "11px", fontWeight: "700", color: "#0f1117" },
  noData: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    color: "#9ca3af",
    fontSize: "13px",
  },
};
