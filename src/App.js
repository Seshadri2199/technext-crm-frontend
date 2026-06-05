import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Calls from "./pages/Calls";
import Contacts from "./pages/Contacts";
import Accounts from "./pages/Accounts";
import Deals from "./pages/Deals";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Workqueue from "./pages/Workqueue";
import Forecasts from "./pages/Forecasts";
import Documents from "./pages/Documents";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import logo from "./logo.jpg";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activePage, setActivePage] = useState("home");
  const [searchVal, setSearchVal] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage("home");
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowProfile(false);
  };
  const closeAll = () => {
    setShowNotif(false);
    setShowApps(false);
    setShowProfile(false);
    setShowQuickAdd(false);
  };

  const PAGE_TITLES = {
    home: "Home",
    leads: "Leads",
    contacts: "Contacts",
    accounts: "Accounts",
    deals: "Deals",
    forecasts: "Forecasts",
    documents: "Documents",
    campaigns: "Campaigns",
    jobs: "Job Orders",
    candidates: "Candidates",
    tasks: "Tasks",
    meetings: "Meetings",
    calls: "Calls",
    reports: "Reports",
    analytics: "Analytics",
    workqueue: "Workqueue",
    settings: "Settings",
  };

  const PAGE_ICONS = {
    home: "🏠",
    leads: "👤",
    contacts: "📇",
    accounts: "🏢",
    deals: "🤝",
    forecasts: "🎯",
    documents: "📄",
    campaigns: "📢",
    jobs: "📋",
    candidates: "🪪",
    tasks: "✅",
    meetings: "📅",
    calls: "📞",
    reports: "📊",
    analytics: "📈",
    workqueue: "⚡",
    settings: "⚙️",
  };

  const ComingSoon = ({ title }) => (
    <div style={cs.wrap}>
      <div style={cs.icon}>🚧</div>
      <div style={cs.title}>{title}</div>
      <div style={cs.sub}>This module is coming soon!</div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <Dashboard user={user} onNavigate={setActivePage} />;
      case "leads":
        return <Leads />;
      case "contacts":
        return <Contacts />;
      case "accounts":
        return <Accounts />;
      case "deals":
        return <Deals />;
      case "forecasts":
        return <Forecasts />;
      case "documents":
        return <Documents />;
      case "campaigns":
        return <Campaigns />;
      case "candidates":
        return <Candidates />;
      case "jobs":
        return <Jobs />;
      case "tasks":
        return <Tasks />;
      case "meetings":
        return <Meetings />;
      case "calls":
        return <Calls />;
      case "reports":
        return <Reports />;
      case "analytics":
        return <Analytics />;
      case "workqueue":
        return <Workqueue />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard user={user} onNavigate={setActivePage} />;
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const notifications = [
    {
      id: 1,
      text: "New lead added — Arjun Mehta",
      time: "2 mins ago",
      icon: "👤",
      unread: true,
    },
    {
      id: 2,
      text: "Meeting scheduled with Tech Mahindra",
      time: "1 hr ago",
      icon: "📅",
      unread: true,
    },
    {
      id: 3,
      text: "Task due: Follow up with Priya Sharma",
      time: "2 hrs ago",
      icon: "✅",
      unread: false,
    },
    {
      id: 4,
      text: "Candidate Sneha Rao moved to Interview",
      time: "3 hrs ago",
      icon: "🪪",
      unread: false,
    },
    {
      id: 5,
      text: "Deal updated: Infosys BPM Renewal",
      time: "5 hrs ago",
      icon: "🤝",
      unread: false,
    },
  ];

  const quickAddItems = [
    { label: "New Lead", icon: "👤", page: "leads" },
    { label: "New Candidate", icon: "🪪", page: "candidates" },
    { label: "New Job Order", icon: "📋", page: "jobs" },
    { label: "New Deal", icon: "🤝", page: "deals" },
    { label: "New Task", icon: "✅", page: "tasks" },
    { label: "New Meeting", icon: "📅", page: "meetings" },
    { label: "Log a Call", icon: "📞", page: "calls" },
    { label: "New Contact", icon: "📇", page: "contacts" },
  ];

  const apps = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "leads", label: "Leads", icon: "👤" },
    { id: "deals", label: "Deals", icon: "🤝" },
    { id: "candidates", label: "Candidates", icon: "🪪" },
    { id: "jobs", label: "Jobs", icon: "📋" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "meetings", label: "Meetings", icon: "📅" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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

  return (
    <div style={st.app} onClick={closeAll}>
      <Sidebar
        user={user}
        activePage={activePage}
        onNavigate={(p) => {
          setActivePage(p);
          closeAll();
        }}
        onLogout={handleLogout}
      />
      <div style={st.main}>
        {/* Professional Topbar */}
        <div style={st.topbar} onClick={(e) => e.stopPropagation()}>
          {/* Left — Breadcrumb */}
          <div style={st.tbLeft}>
            <div style={st.breadcrumb}>
              <span style={st.breadcrumbIcon}>{PAGE_ICONS[activePage]}</span>
              <span style={st.breadcrumbText}>
                {PAGE_TITLES[activePage] || activePage}
              </span>
            </div>
          </div>

          {/* Center — Search */}
          <div style={st.tbCenter}>
            <div style={st.searchBox}>
              <span style={st.searchIcon}>🔍</span>
              <input
                style={st.searchInput}
                placeholder="Search records, leads, candidates..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchVal.trim()) {
                    const t = searchVal.toLowerCase();
                    if (t.includes("lead")) setActivePage("leads");
                    else if (t.includes("contact")) setActivePage("contacts");
                    else if (t.includes("account")) setActivePage("accounts");
                    else if (t.includes("deal")) setActivePage("deals");
                    else if (t.includes("candidate"))
                      setActivePage("candidates");
                    else if (t.includes("job")) setActivePage("jobs");
                    else if (t.includes("task")) setActivePage("tasks");
                    else if (t.includes("meeting")) setActivePage("meetings");
                    else if (t.includes("call")) setActivePage("calls");
                    else if (t.includes("report")) setActivePage("reports");
                    else if (t.includes("analytic")) setActivePage("analytics");
                    else if (t.includes("setting")) setActivePage("settings");
                    setSearchVal("");
                  }
                }}
              />
              {searchVal && (
                <span style={st.searchClear} onClick={() => setSearchVal("")}>
                  ✕
                </span>
              )}
              <kbd style={st.searchKbd}>⏎</kbd>
            </div>
          </div>

          {/* Right — Actions */}
          <div style={st.tbRight}>
            {/* Quick Add */}
            <div style={{ position: "relative" }}>
              <button
                style={st.quickAdd}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowQuickAdd(!showQuickAdd);
                }}
                title="Quick Add"
              >
                <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
              </button>
              {showQuickAdd && (
                <div style={st.dropdown} onClick={(e) => e.stopPropagation()}>
                  <div style={st.dropHeader}>Quick Add</div>
                  <div style={st.dropGrid}>
                    {quickAddItems.map((item) => (
                      <div
                        key={item.label}
                        style={st.dropGridItem}
                        onClick={() => {
                          setActivePage(item.page);
                          closeAll();
                        }}
                      >
                        <span style={st.dropGridIcon}>{item.icon}</span>
                        <span style={st.dropGridLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                style={st.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowNotif(!showNotif);
                }}
              >
                <span style={{ fontSize: "16px" }}>🔔</span>
                {unreadCount > 0 && <span style={st.badge}>{unreadCount}</span>}
              </button>
              {showNotif && (
                <div
                  style={{ ...st.dropdown, width: "340px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={st.dropHeader}>
                    Notifications
                    <span style={st.dropAction}>Mark all read</span>
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        ...st.notifItem,
                        ...(n.unread ? st.notifUnread : {}),
                      }}
                    >
                      <div style={st.notifIcon}>{n.icon}</div>
                      <div style={st.notifBody}>
                        <div style={st.notifText}>{n.text}</div>
                        <div style={st.notifTime}>{n.time}</div>
                      </div>
                      {n.unread && <div style={st.notifDot} />}
                    </div>
                  ))}
                  <div style={st.dropFooter}>View all notifications</div>
                </div>
              )}
            </div>

            {/* Calendar */}
            <button
              style={st.iconBtn}
              title="Meetings"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("meetings");
                closeAll();
              }}
            >
              <span style={{ fontSize: "16px" }}>📅</span>
            </button>

            {/* Settings */}
            <button
              style={st.iconBtn}
              title="Settings"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("settings");
                closeAll();
              }}
            >
              <span style={{ fontSize: "16px" }}>⚙️</span>
            </button>

            {/* Apps */}
            <div style={{ position: "relative" }}>
              <button
                style={st.iconBtn}
                title="All Apps"
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowApps(!showApps);
                }}
              >
                <span style={{ fontSize: "16px" }}>⊞</span>
              </button>
              {showApps && (
                <div
                  style={{ ...st.dropdown, width: "256px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={st.dropHeader}>All Modules</div>
                  <div style={st.appsGrid}>
                    {apps.map((app) => (
                      <div
                        key={app.id}
                        style={st.appItem}
                        onClick={() => {
                          setActivePage(app.id);
                          closeAll();
                        }}
                      >
                        <div style={st.appIcon}>{app.icon}</div>
                        <div style={st.appLabel}>{app.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={st.tbDivider} />

            {/* User Profile */}
            <div style={{ position: "relative" }}>
              <div
                style={st.userChip}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowProfile(!showProfile);
                }}
              >
                <div
                  style={{
                    ...st.userAvatar,
                    background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}aa)`,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={st.userInfo}>
                  <div style={st.userName}>{user.name.split(" ")[0]}</div>
                  <div
                    style={{ ...st.userRole, color: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </div>
                </div>
                <span style={st.userChev}>▾</span>
              </div>
              {showProfile && (
                <div
                  style={{
                    ...st.dropdown,
                    width: "240px",
                    right: 0,
                    left: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={st.profileHead}>
                    <div
                      style={{
                        ...st.profileAvatar,
                        background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}aa)`,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={st.profileName}>{user.name}</div>
                      <div
                        style={{
                          ...st.profileRole,
                          color: getRoleColor(user.role),
                        }}
                      >
                        {user.role}
                      </div>
                      <div style={st.profileEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div style={st.dropDivider} />
                  <div
                    style={st.dropItem}
                    onClick={() => {
                      setActivePage("home");
                      closeAll();
                    }}
                  >
                    🏠 Home
                  </div>
                  <div
                    style={st.dropItem}
                    onClick={() => {
                      setActivePage("reports");
                      closeAll();
                    }}
                  >
                    📊 My Reports
                  </div>
                  <div
                    style={st.dropItem}
                    onClick={() => {
                      setActivePage("settings");
                      closeAll();
                    }}
                  >
                    ⚙️ Settings
                  </div>
                  <div style={st.dropDivider} />
                  <div
                    style={{ ...st.dropItem, ...st.dropLogout }}
                    onClick={handleLogout}
                  >
                    ↩ Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={st.content} onClick={closeAll}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

const cs = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "12px",
  },
  icon: { fontSize: "48px" },
  title: { fontSize: "20px", fontWeight: "700", color: "#0f1117" },
  sub: {
    fontSize: "13px",
    color: "#6b7280",
    maxWidth: "340px",
    textAlign: "center",
    lineHeight: "1.6",
  },
};

const st = {
  app: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f8f9fc",
  },
  topbar: {
    height: "56px",
    minHeight: "56px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: "16px",
    boxShadow: "0 1px 0 #e5e7f0",
    position: "relative",
    zIndex: 200,
  },
  tbLeft: { minWidth: "180px", display: "flex", alignItems: "center" },
  breadcrumb: { display: "flex", alignItems: "center", gap: "8px" },
  breadcrumbIcon: { fontSize: "16px" },
  breadcrumbText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f1117",
    letterSpacing: "-0.3px",
  },
  tbCenter: { flex: 1, display: "flex", justifyContent: "center" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8f9fc",
    border: "1.5px solid #e5e7f0",
    borderRadius: "10px",
    padding: "7px 12px",
    width: "100%",
    maxWidth: "420px",
    transition: "border-color 0.15s",
  },
  searchIcon: { fontSize: "13px", flexShrink: 0 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f1117",
    width: "100%",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  searchClear: {
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "12px",
    flexShrink: 0,
  },
  searchKbd: {
    background: "#f1f3f9",
    border: "1px solid #e5e7f0",
    borderRadius: "4px",
    padding: "1px 5px",
    fontSize: "10px",
    color: "#9ca3af",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  tbRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    minWidth: "fit-content",
  },
  quickAdd: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
    transition: "all 0.15s",
  },
  iconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "15px",
    height: "15px",
    background: "#ef4444",
    borderRadius: "50%",
    fontSize: "8px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    border: "2px solid #fff",
  },
  tbDivider: {
    width: "1px",
    height: "22px",
    background: "#e5e7f0",
    margin: "0 6px",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 10px 4px 4px",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    transition: "all 0.15s",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#0f1117",
    lineHeight: "1.2",
  },
  userRole: { fontSize: "10px", fontWeight: "600", lineHeight: "1.2" },
  userChev: { fontSize: "10px", color: "#9ca3af" },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    border: "1px solid #e5e7f0",
    zIndex: 999,
    overflow: "hidden",
    minWidth: "200px",
  },
  dropHeader: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    borderBottom: "1px solid #f1f3f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropAction: {
    fontSize: "11px",
    color: "#6366f1",
    cursor: "pointer",
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: "0",
  },
  dropGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px",
    padding: "8px",
  },
  dropGridItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  dropGridIcon: { fontSize: "16px" },
  dropGridLabel: { fontSize: "12px", color: "#374151", fontWeight: "500" },
  dropItem: {
    padding: "9px 16px",
    fontSize: "13px",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background 0.1s",
  },
  dropLogout: { color: "#ef4444" },
  dropDivider: { height: "1px", background: "#f1f3f9" },
  dropFooter: {
    padding: "10px 16px",
    textAlign: "center",
    fontSize: "12px",
    color: "#6366f1",
    cursor: "pointer",
    fontWeight: "600",
    borderTop: "1px solid #f1f3f9",
  },
  notifItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 16px",
    transition: "background 0.1s",
    cursor: "pointer",
  },
  notifUnread: { background: "#fafbff" },
  notifIcon: { fontSize: "18px", marginTop: "1px", flexShrink: 0 },
  notifBody: { flex: 1 },
  notifText: {
    fontSize: "12.5px",
    color: "#0f1117",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  notifTime: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  notifDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#6366f1",
    flexShrink: 0,
    marginTop: "5px",
  },
  appsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "4px",
    padding: "10px",
  },
  appItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 8px",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "background 0.1s",
  },
  appIcon: { fontSize: "22px", marginBottom: "5px" },
  appLabel: {
    fontSize: "10px",
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  profileHead: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #f1f3f9",
  },
  profileAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  profileName: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  profileRole: { fontSize: "11px", fontWeight: "600" },
  profileEmail: { fontSize: "11px", color: "#9ca3af", marginTop: "1px" },
  content: { flex: 1, overflowY: "auto" },
};

export default App;
