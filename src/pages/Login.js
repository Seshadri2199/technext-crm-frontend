import React, { useState } from "react";
import { login } from "../services/api";
import axios from "axios";
import logo from "../logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("Connection error. Make sure the server is running.");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (regForm.password !== regForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/users`, {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        role: regForm.role,
      });
      setSuccess("Account created! You can now login.");
      setRegForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Staff",
      });
      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 2000);
    } catch {
      setError("Registration failed. Email may already exist.");
    }
    setLoading(false);
  };

  const features = [
    { icon: "🎯", text: "Lead & Pipeline Management" },
    { icon: "👥", text: "Candidate Tracking & Placement" },
    { icon: "📊", text: "Reports & Analytics Dashboard" },
    { icon: "🔒", text: "Role-Based Access Control" },
    { icon: "📅", text: "Meetings, Tasks & Calls" },
    { icon: "🏢", text: "Client Account Management" },
  ];

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          {/* Logo */}
          <div style={s.brand}>
            <img src={logo} alt="TechNext" style={s.brandLogo} />
            <div>
              <div style={s.brandName}>TechNext CRM</div>
              <div style={s.brandTag}>Staffing Management Portal</div>
            </div>
          </div>

          {/* Hero Text */}
          <div style={s.hero}>
            <div style={s.heroLabel}>BUILT FOR STAFFING COMPANIES</div>
            <h1 style={s.heroTitle}>
              Manage Your
              <br />
              <span style={s.heroAccent}>Entire Staffing</span>
              <br />
              Operation
            </h1>
            <p style={s.heroDesc}>
              From lead generation to candidate placement — everything in one
              powerful CRM.
            </p>
          </div>

          {/* Features */}
          <div style={s.features}>
            {features.map((f, i) => (
              <div key={i} style={s.feature}>
                <div style={s.featureIcon}>{f.icon}</div>
                <span style={s.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={s.stats}>
            <div style={s.stat}>
              <div style={s.statNum}>18+</div>
              <div style={s.statLbl}>Modules</div>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <div style={s.statNum}>5</div>
              <div style={s.statLbl}>User Roles</div>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <div style={s.statNum}>100%</div>
              <div style={s.statLbl}>Customizable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.card}>
          {/* Logo on card */}
          <div style={s.cardLogoWrap}>
            <img src={logo} alt="TechNext" style={s.cardLogo} />
          </div>

          {/* Tab Toggle */}
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(mode === "login" ? s.tabActive : {}) }}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              Sign In
            </button>
            <button
              style={{ ...s.tab, ...(mode === "register" ? s.tabActive : {}) }}
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
            >
              Register
            </button>
            <div
              style={{
                ...s.tabIndicator,
                left: mode === "login" ? "4px" : "calc(50% + 0px)",
              }}
            />
          </div>

          {error && (
            <div style={s.alert}>
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div style={s.alertSuccess}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} style={s.form}>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? <span style={s.spinner} /> : null}
                {loading ? "Signing in..." : "Sign In →"}
              </button>
              <div style={s.hint}>
                Don't have an account?{" "}
                <span
                  style={s.link}
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  Create one
                </span>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} style={s.form}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>👤</span>
                  <input
                    style={s.input}
                    type="text"
                    placeholder="John Doe"
                    value={regForm.name}
                    onChange={(e) =>
                      setRegForm({ ...regForm, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="your@email.com"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🔒</span>
                    <input
                      style={s.input}
                      type="password"
                      placeholder="Min 6 chars"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Confirm Password</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🔒</span>
                    <input
                      style={s.input}
                      type="password"
                      placeholder="Repeat password"
                      value={regForm.confirmPassword}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Role</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🏷️</span>
                  <select
                    style={{ ...s.input, paddingLeft: "36px" }}
                    value={regForm.role}
                    onChange={(e) =>
                      setRegForm({ ...regForm, role: e.target.value })
                    }
                  >
                    <option value="Staff">Staff</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Sales">Sales</option>
                    <option value="HR Manager">HR Manager</option>
                  </select>
                </div>
                <div style={s.roleNote}>
                  ⚠️ Admin accounts are created by the system administrator
                  only.
                </div>
              </div>
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? <span style={s.spinner} /> : null}
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
              <div style={s.hint}>
                Already have an account?{" "}
                <span
                  style={s.link}
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Sign in
                </span>
              </div>
            </form>
          )}

          <div style={s.footer}>
            © 2026 TechNext Staffing Pvt. Ltd. · All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  left: {
    flex: 1,
    background:
      "linear-gradient(135deg, #0f1117 0%, #1a1f3a 50%, #0f1117 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    position: "relative",
    overflow: "hidden",
  },
  leftInner: {
    maxWidth: "480px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "52px",
  },
  brandLogo: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
    borderRadius: "12px",
    background: "#fff",
    padding: "4px",
  },
  brandName: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  brandTag: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginTop: "2px",
  },
  hero: { marginBottom: "40px" },
  heroLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#6366f1",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.15",
    letterSpacing: "-1.5px",
    marginBottom: "16px",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #6366f1, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroDesc: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: "1.7",
    maxWidth: "360px",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "40px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  featureIcon: { fontSize: "16px", flexShrink: 0 },
  featureText: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  stats: { display: "flex", alignItems: "center", gap: "24px" },
  stat: { textAlign: "center" },
  statNum: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-1px",
  },
  statLbl: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    marginTop: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statDiv: {
    width: "1px",
    height: "32px",
    background: "rgba(255,255,255,0.1)",
  },
  right: {
    width: "520px",
    minWidth: "520px",
    background: "#f8f9fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "36px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7f0",
  },
  cardLogoWrap: { textAlign: "center", marginBottom: "20px" },
  cardLogo: {
    width: "56px",
    height: "56px",
    objectFit: "contain",
    borderRadius: "12px",
    background: "#f8f9fc",
    padding: "4px",
    border: "1px solid #e5e7f0",
  },
  tabs: {
    display: "flex",
    background: "#f1f3f9",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "24px",
    position: "relative",
  },
  tab: {
    flex: 1,
    padding: "9px",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    background: "none",
    cursor: "pointer",
    borderRadius: "8px",
    color: "#6b7280",
    transition: "all 0.2s",
    position: "relative",
    zIndex: 1,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tabActive: { color: "#0f1117" },
  tabIndicator: {
    position: "absolute",
    top: "4px",
    width: "calc(50% - 4px)",
    height: "calc(100% - 8px)",
    background: "#fff",
    borderRadius: "7px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
  },
  form: { display: "flex", flexDirection: "column", gap: "0" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: "6px",
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    zIndex: 1,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 38px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    outline: "none",
    background: "#f8f9fc",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: "#0f1117",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  roleNote: { fontSize: "11px", color: "#9ca3af", marginTop: "5px" },
  btn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },
  alert: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  alertSuccess: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  hint: {
    textAlign: "center",
    fontSize: "12.5px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  link: { color: "#6366f1", fontWeight: "600", cursor: "pointer" },
  footer: {
    textAlign: "center",
    fontSize: "11px",
    color: "#9ca3af",
    borderTop: "1px solid #f1f3f9",
    paddingTop: "16px",
  },
};
