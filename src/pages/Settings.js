import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
  });
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [profile, setProfile] = useState({
    companyName: "TechNext Staffing Pvt. Ltd.",
    email: "info@technextstaffing.in",
    phone: "+91 80001 23456",
    city: "Bengaluru",
    website: "https://technextstaffing.in",
    address: "Koramangala, Bengaluru - 560034",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = () =>
    axios
      .get(`${BASE_URL}/users`)
      .then((res) => setUsers(res.data))
      .catch(() => {});

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      setInviteError("All fields are required.");
      return;
    }
    if (inviteForm.password.length < 6) {
      setInviteError("Password must be at least 6 characters.");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/users`, inviteForm);
      setInviteSuccess(`✅ ${inviteForm.name} has been added successfully!`);
      setInviteForm({ name: "", email: "", password: "", role: "Staff" });
      fetchUsers();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 2000);
    } catch {
      setInviteError("Failed to add member. Email may already exist.");
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "Admin":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Recruiter":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Sales":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "HR Manager":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const tabs = [
    { id: "profile", label: "Company Profile", icon: "🏢" },
    { id: "team", label: "Team Members", icon: "👥" },
    { id: "modules", label: "Module Settings", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Settings</span>
          <span style={s.titleSub}>Manage your CRM preferences</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Left Tabs */}
        <div style={s.leftPanel}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                ...s.tabItem,
                ...(activeTab === tab.id ? s.tabItemActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={s.tabIcon}>{tab.icon}</span>
              <span style={s.tabLabel}>{tab.label}</span>
              {activeTab === tab.id && <div style={s.tabIndicator} />}
            </div>
          ))}
        </div>

        {/* Right Content */}
        <div style={s.rightPanel}>
          {/* Company Profile */}
          {activeTab === "profile" && (
            <div style={s.card}>
              <div style={s.cardTitle}>Company Profile</div>
              <div style={s.cardSub}>Update your company information</div>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>Company Name</label>
                  <input
                    style={s.input}
                    value={profile.companyName}
                    onChange={(e) =>
                      setProfile({ ...profile, companyName: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input
                    style={s.input}
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Phone</label>
                  <input
                    style={s.input}
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>City</label>
                  <input
                    style={s.input}
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Website</label>
                  <input
                    style={s.input}
                    value={profile.website}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Address</label>
                  <input
                    style={s.input}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.cardFoot}>
                {saved && <span style={s.savedMsg}>✅ Changes saved!</span>}
                <button style={s.saveBtn} onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Team Members */}
          {activeTab === "team" && (
            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={s.cardTitle}>Team Members</div>
                  <div style={s.cardSub}>
                    {users.length} members in your organization
                  </div>
                </div>
                <button
                  style={s.inviteBtn}
                  onClick={() => {
                    setShowInviteModal(true);
                    setInviteError("");
                    setInviteSuccess("");
                  }}
                >
                  + Invite Member
                </button>
              </div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((m) => {
                    const rs = getRoleStyle(m.role);
                    return (
                      <tr key={m.id} style={s.trow}>
                        <td style={s.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                ...s.memberAvatar,
                                background: `linear-gradient(135deg,${rs.color}99,${rs.color})`,
                              }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <span
                              style={{ fontWeight: "600", color: "#0f1117" }}
                            >
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td style={s.td}>{m.email}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: rs.bg,
                              color: rs.color,
                            }}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: "#f0fdf4",
                              color: "#10b981",
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button style={s.editBtn}>Edit</button>
                            {m.role !== "Admin" && (
                              <button style={s.delBtn}>Remove</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Module Settings */}
          {activeTab === "modules" && (
            <div style={s.card}>
              <div style={s.cardTitle}>Module Settings</div>
              <div style={s.cardSub}>Enable or disable CRM modules</div>
              <div style={s.moduleList}>
                {[
                  {
                    name: "Leads",
                    desc: "Manage potential clients and leads",
                    on: true,
                  },
                  {
                    name: "Contacts",
                    desc: "Manage client contacts",
                    on: true,
                  },
                  {
                    name: "Accounts",
                    desc: "Manage client companies",
                    on: true,
                  },
                  { name: "Deals", desc: "Track deals and pipeline", on: true },
                  {
                    name: "Candidates",
                    desc: "Manage job candidates",
                    on: true,
                  },
                  {
                    name: "Job Orders",
                    desc: "Post and manage job openings",
                    on: true,
                  },
                  { name: "Tasks", desc: "Assign and track tasks", on: true },
                  {
                    name: "Meetings",
                    desc: "Schedule and track meetings",
                    on: true,
                  },
                  { name: "Calls", desc: "Log and track calls", on: true },
                  {
                    name: "Campaigns",
                    desc: "Run recruitment campaigns",
                    on: true,
                  },
                  { name: "Documents", desc: "Manage documents", on: true },
                  {
                    name: "Reports",
                    desc: "View reports and analytics",
                    on: true,
                  },
                ].map((mod) => (
                  <div key={mod.name} style={s.moduleItem}>
                    <div>
                      <div style={s.moduleName}>{mod.name}</div>
                      <div style={s.moduleDesc}>{mod.desc}</div>
                    </div>
                    <div
                      style={{
                        ...s.toggle,
                        ...(mod.on ? s.toggleOn : s.toggleOff),
                      }}
                    >
                      <div
                        style={{
                          ...s.toggleThumb,
                          ...(mod.on ? s.toggleThumbOn : s.toggleThumbOff),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div style={s.card}>
              <div style={s.cardTitle}>Notification Preferences</div>
              <div style={s.cardSub}>
                Control what notifications you receive
              </div>
              <div style={s.moduleList}>
                {[
                  { label: "New Lead assigned to me", on: true },
                  { label: "Meeting reminder (30 mins before)", on: true },
                  { label: "Task due today", on: true },
                  { label: "Deal stage changed", on: false },
                  { label: "New candidate added", on: true },
                  { label: "Placement confirmed", on: true },
                  { label: "Email when meeting is cancelled", on: true },
                  { label: "Weekly summary report", on: false },
                ].map((item) => (
                  <div key={item.label} style={s.moduleItem}>
                    <div style={s.moduleName}>{item.label}</div>
                    <div
                      style={{
                        ...s.toggle,
                        ...(item.on ? s.toggleOn : s.toggleOff),
                      }}
                    >
                      <div
                        style={{
                          ...s.toggleThumb,
                          ...(item.on ? s.toggleThumbOn : s.toggleThumbOff),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div style={s.card}>
              <div style={s.cardTitle}>Security Settings</div>
              <div style={s.cardSub}>
                Update your password and security preferences
              </div>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>Current Password</label>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>New Password</label>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Confirm New Password</label>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div style={s.cardFoot}>
                <button style={s.saveBtn}>Update Password</button>
              </div>
              <div
                style={{
                  borderTop: "1px solid #f1f3f9",
                  marginTop: "24px",
                  paddingTop: "20px",
                }}
              >
                <div
                  style={{
                    ...s.cardTitle,
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Active Sessions
                </div>
                <div style={s.moduleItem}>
                  <div>
                    <div style={s.moduleName}>
                      Current Session — Chrome, Windows
                    </div>
                    <div style={s.moduleDesc}>
                      Bengaluru, India · Active now
                    </div>
                  </div>
                  <span
                    style={{
                      ...s.badge,
                      background: "#f0fdf4",
                      color: "#10b981",
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Invite Team Member</div>
                <div style={s.modalSub}>Add a new member to your CRM</div>
              </div>
              <button
                style={s.closeBtn}
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInvite} style={s.modalBody}>
              {inviteError && <div style={s.alertErr}>⚠️ {inviteError}</div>}
              {inviteSuccess && <div style={s.alertOk}>{inviteSuccess}</div>}
              <div style={s.formGroup}>
                <label style={s.label}>Full Name *</label>
                <input
                  style={s.input}
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address *</label>
                <input
                  style={s.input}
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="priya@technext.in"
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password *</label>
                <input
                  style={s.input}
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Role *</label>
                <select
                  style={s.input}
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                >
                  <option>Staff</option>
                  <option>Recruiter</option>
                  <option>Sales</option>
                  <option>HR Manager</option>
                  <option>Admin</option>
                </select>
                <div style={s.roleNote}>
                  {inviteForm.role === "Admin"
                    ? "⚠️ Admin has full access to everything."
                    : inviteForm.role === "Recruiter"
                      ? "📋 Can access Candidates, Jobs, Tasks, Meetings, Calls"
                      : inviteForm.role === "Sales"
                        ? "💼 Can access Leads, Contacts, Accounts, Deals"
                        : inviteForm.role === "HR Manager"
                          ? "👥 Can access Candidates, Jobs, Meetings, Reports"
                          : "✅ Can access only Tasks and Meetings"}
                </div>
              </div>
              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    padding: "20px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
  },
  headerLeft: {},
  title: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f1117",
    display: "block",
  },
  titleSub: {
    fontSize: "13px",
    color: "#9ca3af",
    marginTop: "3px",
    display: "block",
  },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  leftPanel: {
    width: "220px",
    minWidth: "220px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    padding: "12px 8px",
  },
  tabItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "9px",
    marginBottom: "2px",
    position: "relative",
    transition: "all 0.15s",
  },
  tabItemActive: { background: "#eef2ff", color: "#4f46e5", fontWeight: "700" },
  tabIndicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "20px",
    background: "#6366f1",
    borderRadius: "0 3px 3px 0",
  },
  tabIcon: { fontSize: "16px", width: "20px", textAlign: "center" },
  tabLabel: { flex: 1 },
  rightPanel: { flex: 1, overflowY: "auto", padding: "24px" },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "24px",
    marginBottom: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "4px",
  },
  cardSub: { fontSize: "12.5px", color: "#9ca3af", marginBottom: "20px" },
  cardFoot: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f3f9",
  },
  savedMsg: { fontSize: "13px", color: "#10b981", fontWeight: "600" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#0f1117",
  },
  roleNote: {
    fontSize: "11.5px",
    color: "#6b7280",
    marginTop: "5px",
    padding: "6px 10px",
    background: "#f8f9fc",
    borderRadius: "6px",
    border: "1px solid #e5e7f0",
  },
  inviteBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  saveBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
  th: {
    padding: "10px 14px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  memberAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  moduleList: { display: "flex", flexDirection: "column", gap: "2px" },
  moduleItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #f8fafc",
  },
  moduleName: { fontSize: "13px", fontWeight: "500", color: "#0f1117" },
  moduleDesc: { fontSize: "11.5px", color: "#9ca3af", marginTop: "2px" },
  toggle: {
    width: "42px",
    height: "24px",
    borderRadius: "12px",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  toggleOn: { background: "#6366f1" },
  toggleOff: { background: "#e5e7f0" },
  toggleThumb: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: "3px",
    transition: "left 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  },
  toggleThumbOn: { left: "21px" },
  toggleThumbOff: { left: "3px" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,17,23,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 998,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "480px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: { fontSize: "17px", fontWeight: "800", color: "#0f1117" },
  modalSub: { fontSize: "12.5px", color: "#9ca3af", marginTop: "3px" },
  closeBtn: {
    background: "#f1f3f9",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
  },
  modalBody: { padding: "24px" },
  alertErr: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
  },
  alertOk: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
  },
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7f0",
    marginTop: "8px",
  },
  cancelBtn: {
    background: "#fff",
    color: "#6b7280",
    border: "1.5px solid #e5e7f0",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
