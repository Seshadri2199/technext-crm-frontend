import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = "http://localhost:8080/api";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Payslips() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editModal, setEditModal] = useState(null); // payslip being edited
  const [adjustments, setAdjustments] = useState({
    bonusAmount: 0,
    bonusReason: "",
    extraDeduction: 0,
    extraDeductionReason: "",
    workingDays: 26,
    presentDays: 26,
    lopDays: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["Admin", "HR Manager"].includes(currentUser.role);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => {
        setEmployees(r.data);
        if (!isAdmin) {
          const own = r.data.find((e) => e.email === currentUser.email);
          if (own) {
            setSelectedEmp(own);
            fetchEmployeeHistory(own.id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchAllHistory();
  }, [activeTab, month, year]);

  const fetchAllHistory = () => {
    setHistoryLoading(true);
    axios
      .get(`${BASE_URL}/payslips/month/${month}/year/${year}`)
      .then((r) => {
        setPayslipHistory(r.data);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  };

  const fetchEmployeeHistory = (empId) => {
    axios
      .get(`${BASE_URL}/payslips/employee/${empId}`)
      .then((r) => setPayslipHistory(r.data))
      .catch(() => {});
  };

  const calcSalary = (emp, adj = adjustments) => {
    const basic = parseFloat(
      emp.basicSalary || emp.basic_salary || emp.basicSalary || 0,
    );
    const lopDed =
      adj.lopDays > 0 ? (basic / (adj.workingDays || 26)) * adj.lopDays : 0;
    const effBasic = basic - lopDed;
    const hra = Math.round(effBasic * 0.4);
    const transport = 2000;
    const medical = 1250;
    const special = Math.round(effBasic * 0.15);
    const bonus = parseFloat(adj.bonusAmount) || 0;
    const gross =
      Math.round(effBasic) + hra + transport + medical + special + bonus;
    const pf = Math.round(effBasic * 0.12);
    const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const profTax = basic <= 10000 ? 0 : basic <= 15000 ? 150 : 200;
    const tds = basic > 50000 ? Math.round(gross * 0.1) : 0;
    const extraDed = parseFloat(adj.extraDeduction) || 0;
    const totalDed = pf + esi + profTax + tds + extraDed;
    return {
      basic: Math.round(effBasic),
      hra,
      transport,
      medical,
      special,
      bonus,
      lopDeduction: Math.round(lopDed),
      grossSalary: gross,
      pf,
      esi,
      professionalTax: profTax,
      tds,
      extraDed,
      totalDeductions: totalDed,
      netSalary: gross - totalDed,
    };
  };

  const calcFromHistory = (ps) => ({
    basic: parseFloat(ps.basicSalary || 0),
    hra: parseFloat(ps.hra || 0),
    transport: parseFloat(ps.transport || 0),
    medical: parseFloat(ps.medical || 0),
    special: parseFloat(ps.specialAllowance || 0),
    bonus: parseFloat(ps.bonus || 0),
    lopDeduction: parseFloat(ps.lopDeduction || 0),
    grossSalary: parseFloat(ps.grossSalary || 0),
    pf: parseFloat(ps.pf || 0),
    esi: parseFloat(ps.esi || 0),
    professionalTax: parseFloat(ps.professionalTax || 0),
    tds: parseFloat(ps.tds || 0),
    extraDed: parseFloat(ps.extraDeduction || 0),
    totalDeductions: parseFloat(ps.totalDeductions || 0),
    netSalary: parseFloat(ps.netSalary || 0),
  });

  const numberToWords = (num) => {
    num = Math.round(num);
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + numberToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + numberToWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        numberToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + numberToWords(num % 100000) : "")
      );
    return (
      numberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
    );
  };

  const getEmpInfo = (empId) => employees.find((e) => e.id === empId) || {};

  const printPayslip = (ps, sal, empInfo, pMonth, pYear) => {
    const emp = { ...empInfo, ...ps };
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Payslip</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;color:#0f1117;font-size:13px}
      .hdr{display:flex;justify-content:space-between;padding-bottom:16px;border-bottom:3px solid #6366f1;margin-bottom:20px}
      .cn{font-size:22px;font-weight:800;color:#6366f1}.cs{font-size:11px;color:#6b7280;margin-top:3px}
      .pt{font-size:18px;font-weight:800;text-align:right}.pp{font-size:12px;color:#6b7280;text-align:right;margin-top:4px}
      .conf{font-size:10px;color:#ef4444;font-weight:700;text-align:right;margin-top:2px}
      .ei{display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#f8f9fc;padding:16px;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7f0}
      .er{display:flex;gap:8px;margin-bottom:8px}.el{font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;min-width:110px}
      .ev{font-size:12px;font-weight:700;color:#0f1117}
      .sg{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
      .sc{border:1px solid #e5e7f0;border-radius:8px;overflow:hidden}
      .et{padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;background:#f0fdf4;color:#10b981}
      .dt{padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;background:#fef2f2;color:#ef4444}
      table{width:100%;border-collapse:collapse}td{padding:8px 14px;font-size:12px;border-bottom:1px solid #f8f9fc}
      td:last-child{text-align:right;font-weight:600}.tr{background:#f8f9fc;font-weight:800}
      .tr td{padding:10px 14px;font-size:13px;border-top:2px solid #e5e7f0}
      .ns{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:20px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
      .na{font-size:28px;font-weight:900;letter-spacing:-1px}.nw{font-size:11px;opacity:0.7;margin-top:4px}
      .fs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px;border-top:1px solid #e5e7f0;padding-top:20px}
      .fb{text-align:center}.fl{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:30px}
      .fl2{border-top:1px solid #374151;padding-top:6px;font-size:11px;color:#6b7280}
      .gen{text-align:center;font-size:10px;color:#9ca3af;margin-top:20px;border-top:1px solid #f1f3f9;padding-top:12px}
      @media print{body{padding:15px}}
    </style></head><body>
      <div class="hdr">
        <div><div class="cn">TechNext Staffing Pvt. Ltd.</div><div class="cs">Koramangala, Bengaluru - 560034, Karnataka</div><div class="cs">info@technextstaffing.in</div></div>
        <div><div class="pt">SALARY PAYSLIP</div><div class="pp">${MONTHS[(pMonth || month) - 1]} ${pYear || year}</div><div class="conf">🔒 CONFIDENTIAL</div></div>
      </div>
      <div class="ei">
        <div>
          <div class="er"><span class="el">Employee Name</span><span class="ev">${ps.employeeName || emp.name || "—"}</span></div>
          <div class="er"><span class="el">Employee ID</span><span class="ev">${emp.employeeId || emp.employee_id || "TN00" + emp.id || "—"}</span></div>
          <div class="er"><span class="el">Designation</span><span class="ev">${emp.role || "—"}</span></div>
          <div class="er"><span class="el">Department</span><span class="ev">${emp.department || "—"}</span></div>
        </div>
        <div>
          <div class="er"><span class="el">Pay Period</span><span class="ev">${MONTHS[(pMonth || month) - 1]} ${pYear || year}</span></div>
          <div class="er"><span class="el">Working Days</span><span class="ev">${ps.workingDays || 26}</span></div>
          <div class="er"><span class="el">Days Present</span><span class="ev">${ps.presentDays || 26}</span></div>
          <div class="er"><span class="el">LOP Days</span><span class="ev">${ps.lopDays || 0}</span></div>
        </div>
      </div>
      <div class="sg">
        <div class="sc">
          <div class="et">💰 Earnings</div>
          <table>
            <tr><td>Basic Salary</td><td>₹${Number(sal.basic || sal.basicSalary || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>HRA (40%)</td><td>₹${Number(sal.hra || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Transport Allowance</td><td>₹${Number(sal.transport || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Medical Allowance</td><td>₹${Number(sal.medical || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td>Special Allowance</td><td>₹${Number(sal.special || sal.specialAllowance || 0).toLocaleString("en-IN")}</td></tr>
            ${Number(sal.bonus || 0) > 0 ? `<tr><td>${ps.bonusReason || "Bonus"}</td><td>₹${Number(sal.bonus).toLocaleString("en-IN")}</td></tr>` : ""}
            <tr class="tr"><td>Gross Salary</td><td>₹${Number(sal.grossSalary || 0).toLocaleString("en-IN")}</td></tr>
          </table>
        </div>
        <div class="sc">
          <div class="dt">📉 Deductions</div>
          <table>
            <tr><td>Provident Fund (12%)</td><td>₹${Number(sal.pf || 0).toLocaleString("en-IN")}</td></tr>
            ${Number(sal.esi || 0) > 0 ? `<tr><td>ESI (0.75%)</td><td>₹${Number(sal.esi).toLocaleString("en-IN")}</td></tr>` : ""}
            <tr><td>Professional Tax</td><td>₹${Number(sal.professionalTax || 0).toLocaleString("en-IN")}</td></tr>
            ${Number(sal.tds || 0) > 0 ? `<tr><td>TDS</td><td>₹${Number(sal.tds).toLocaleString("en-IN")}</td></tr>` : ""}
            ${Number(sal.lopDeduction || 0) > 0 ? `<tr><td>LOP Deduction (${ps.lopDays} days)</td><td>₹${Number(sal.lopDeduction).toLocaleString("en-IN")}</td></tr>` : ""}
            ${Number(sal.extraDed || sal.extraDeduction || 0) > 0 ? `<tr><td>${ps.extraDeductionReason || "Other Deduction"}</td><td>₹${Number(sal.extraDed || sal.extraDeduction).toLocaleString("en-IN")}</td></tr>` : ""}
            <tr class="tr"><td>Total Deductions</td><td>₹${Number(sal.totalDeductions || 0).toLocaleString("en-IN")}</td></tr>
          </table>
        </div>
      </div>
      <div class="ns">
        <div><div style="font-size:13px;font-weight:600;opacity:0.8">NET SALARY PAYABLE</div>
          <div class="na">₹${Number(sal.netSalary || 0).toLocaleString("en-IN")}</div>
          <div class="nw">${numberToWords(Number(sal.netSalary || 0))} Rupees Only</div>
        </div>
        <div style="text-align:right"><div style="font-size:13px;font-weight:600;opacity:0.8">Payment Mode</div>
          <div style="font-size:14px;font-weight:700;margin-top:4px">Bank Transfer</div>
        </div>
      </div>
      <div class="fs">
        <div class="fb"><div class="fl">Employee Signature</div><div class="fl2">${ps.employeeName || emp.name}</div></div>
        <div class="fb"><div class="fl">HR Manager</div><div class="fl2">Authorized Signatory</div></div>
        <div class="fb"><div class="fl">Company Seal</div><div class="fl2">TechNext Staffing Pvt. Ltd.</div></div>
      </div>
      <div class="gen">Computer-generated payslip. Generated on ${new Date().toLocaleDateString("en-IN")} via TechNext CRM Portal.</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleSavePayslip = async () => {
    if (!selectedEmp) return;
    setSaving(true);
    setSavedMsg("");
    const sal = calcSalary(selectedEmp);
    const payload = {
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      month,
      year,
      basicSalary: sal.basic,
      hra: sal.hra,
      transport: sal.transport,
      medical: sal.medical,
      specialAllowance: sal.special,
      bonus: sal.bonus,
      bonusReason: adjustments.bonusReason,
      grossSalary: sal.grossSalary,
      pf: sal.pf,
      esi: sal.esi,
      professionalTax: sal.professionalTax,
      tds: sal.tds,
      lopDays: adjustments.lopDays,
      lopDeduction: sal.lopDeduction,
      extraDeduction: sal.extraDed,
      extraDeductionReason: adjustments.extraDeductionReason,
      totalDeductions: sal.totalDeductions,
      netSalary: sal.netSalary,
      workingDays: adjustments.workingDays,
      presentDays: adjustments.presentDays,
      status: "Generated",
      generatedBy: currentUser.name,
    };
    try {
      await axios.post(`${BASE_URL}/payslips`, payload);
      setSavedMsg("✅ Saved successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setSavedMsg("⚠️ Save failed.");
    }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/payslips`, editModal);
      setSavedMsg("✅ Payslip updated!");
      setEditModal(null);
      fetchAllHistory();
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setSavedMsg("⚠️ Update failed.");
    }
    setSaving(false);
  };

  const handleAutoGenerate = async () => {
    if (
      !window.confirm(
        `Auto-generate payslips for ALL employees for ${MONTHS[month - 1]} ${year}?`,
      )
    )
      return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/payslips/auto-generate`);
      setSavedMsg("✅ Auto-generated for all employees!");
      fetchAllHistory();
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (e) {
      setSavedMsg("⚠️ Failed.");
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (id, status) => {
    await axios.put(`${BASE_URL}/payslips/${id}/status`, { status });
    fetchAllHistory();
  };

  const handleExportExcel = () => {
    const data = employees.map((emp) => {
      const sal = calcSalary(emp);
      return {
        "Employee ID": emp.employeeId || emp.employee_id || "TN00" + emp.id,
        Name: emp.name,
        Department: emp.department || "—",
        Designation: emp.role,
        Month: `${MONTHS[month - 1]} ${year}`,
        Basic: sal.basic,
        HRA: sal.hra,
        Transport: sal.transport,
        Medical: sal.medical,
        Special: sal.special,
        Gross: sal.grossSalary,
        PF: sal.pf,
        "Prof Tax": sal.professionalTax,
        TDS: sal.tds,
        "Total Deductions": sal.totalDeductions,
        "Net Salary": sal.netSalary,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `TechNext_Payroll_${MONTHS[month - 1]}_${year}.xlsx`,
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Generated":
        return { bg: "#eff6ff", color: "#3b82f6" };
      default:
        return { bg: "#fffbeb", color: "#f59e0b" };
    }
  };

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
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>Loading...</div>
      </div>
    );

  const avatarColors = {
    Admin: "#ef4444",
    Recruiter: "#10b981",
    Sales: "#3b82f6",
    "HR Manager": "#8b5cf6",
    Staff: "#6b7280",
  };
  const totalPayroll = employees.reduce(
    (sum, emp) => sum + calcSalary(emp).netSalary,
    0,
  );

  // ===== EMPLOYEE SELF VIEW =====
  if (!isAdmin) {
    const own = employees.find((e) => e.email === currentUser.email);
    if (!own)
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          Profile not found.
        </div>
      );
    const sal = calcSalary(own);
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <div style={s.title}>My Payslip 💵</div>
            <div style={s.sub}>Your monthly salary statement</div>
          </div>
          <div style={s.headerRight}>
            <div style={s.periodWrap}>
              <select
                style={s.periodSelect}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                style={s.periodSelect}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              style={s.printBtn}
              onClick={() => printPayslip(own, sal, own, month, year)}
            >
              🖨️ Download / Print
            </button>
          </div>
        </div>
        <div style={s.empViewBody}>
          <div style={s.empInfoCard}>
            <div
              style={{
                ...s.empAvatarLg,
                background: avatarColors[own.role] || "#6366f1",
              }}
            >
              {own.name.charAt(0)}
            </div>
            <div>
              <div style={s.empNameLg}>{own.name}</div>
              <div style={s.empRoleLg}>
                {own.role} · {own.department || "—"}
              </div>
              <div style={s.empIdLg}>
                ID: {own.employeeId || own.employee_id || "TN00" + own.id}
              </div>
            </div>
            <div style={s.empPeriodBadge}>
              {MONTHS[month - 1]} {year}
            </div>
          </div>
          <div style={s.netBanner}>
            <div>
              <div style={s.netBannerLabel}>
                NET SALARY — {MONTHS[month - 1]} {year}
              </div>
              <div style={s.netBannerAmount}>
                ₹{sal.netSalary.toLocaleString("en-IN")}
              </div>
              <div style={s.netBannerWords}>
                {numberToWords(sal.netSalary)} Rupees Only
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={s.netBannerLabel}>Payment Mode</div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginTop: "4px",
                }}
              >
                Bank Transfer
              </div>
            </div>
          </div>
          <div style={s.breakdownGrid}>
            <div style={s.breakCard}>
              <div style={{ ...s.breakTitle, color: "#10b981" }}>
                💰 Earnings
              </div>
              {[
                { l: "Basic Salary", v: sal.basic },
                { l: "HRA (40%)", v: sal.hra },
                { l: "Transport", v: sal.transport },
                { l: "Medical", v: sal.medical },
                { l: "Special Allowance", v: sal.special },
              ].map((r) => (
                <div key={r.l} style={s.breakRow}>
                  <span style={s.breakLabel}>{r.l}</span>
                  <span style={s.breakVal}>₹{r.v.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={s.breakTotal}>
                <span>Gross Salary</span>
                <span style={{ color: "#10b981" }}>
                  ₹{sal.grossSalary.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div style={s.breakCard}>
              <div style={{ ...s.breakTitle, color: "#ef4444" }}>
                📉 Deductions
              </div>
              {[
                { l: "PF (12%)", v: sal.pf },
                ...(sal.esi > 0 ? [{ l: "ESI", v: sal.esi }] : []),
                { l: "Professional Tax", v: sal.professionalTax },
                ...(sal.tds > 0 ? [{ l: "TDS", v: sal.tds }] : []),
              ].map((r) => (
                <div key={r.l} style={s.breakRow}>
                  <span style={s.breakLabel}>{r.l}</span>
                  <span style={{ ...s.breakVal, color: "#ef4444" }}>
                    ₹{r.v.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <div style={s.breakTotal}>
                <span>Total Deductions</span>
                <span style={{ color: "#ef4444" }}>
                  ₹{sal.totalDeductions.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
          <div style={s.historyCard}>
            <div style={s.historyTitle}>📅 Payslip History (Saved Records)</div>
            {payslipHistory.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                No saved payslips yet. Admin will generate them monthly.
              </div>
            ) : (
              <div style={s.historyGrid}>
                {payslipHistory.map((ps) => {
                  const hSal = calcFromHistory(ps);
                  const empInfo = getEmpInfo(ps.employeeId);
                  return (
                    <div
                      key={ps.id}
                      style={s.historyItem}
                      onClick={() =>
                        printPayslip(ps, hSal, empInfo, ps.month, ps.year)
                      }
                    >
                      <div style={s.historyMonth}>
                        {MONTHS[(ps.month || 1) - 1]} {ps.year}
                      </div>
                      <div style={s.historyAmt}>
                        ₹{Number(ps.netSalary || 0).toLocaleString("en-IN")}
                      </div>
                      <div
                        style={{
                          ...s.historyStatus,
                          background: getStatusStyle(ps.status).bg,
                          color: getStatusStyle(ps.status).color,
                        }}
                      >
                        {ps.status}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          marginTop: "4px",
                        }}
                      >
                        🖨️ Click to print
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN / HR MANAGER VIEW =====
  const sal = selectedEmp ? calcSalary(selectedEmp) : null;

  return (
    <div style={s.page}>
      {/* Edit Modal */}
      {editModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  ✏️ Edit Payslip — {editModal.employeeName}
                </div>
                <div style={s.modalSub}>
                  {MONTHS[(editModal.month || 1) - 1]} {editModal.year}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setEditModal(null)}>
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Working Days</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.workingDays || 26}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        workingDays: parseInt(e.target.value) || 26,
                      })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Present Days</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.presentDays || 26}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        presentDays: parseInt(e.target.value) || 26,
                      })
                    }
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>LOP Days</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  value={editModal.lopDays || 0}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      lopDays: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Basic Salary</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.basicSalary || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        basicSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Gross Salary</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.grossSalary || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        grossSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Bonus (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    value={editModal.bonus || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        bonus: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Bonus Reason</label>
                  <input
                    style={s.input}
                    value={editModal.bonusReason || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        bonusReason: e.target.value,
                      })
                    }
                    placeholder="e.g. Performance Bonus"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Extra Deduction (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    value={editModal.extraDeduction || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        extraDeduction: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Deduction Reason</label>
                  <input
                    style={s.input}
                    value={editModal.extraDeductionReason || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        extraDeductionReason: e.target.value,
                      })
                    }
                    placeholder="e.g. Advance Recovery"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Total Deductions</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.totalDeductions || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        totalDeductions: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Net Salary</label>
                  <input
                    style={{ ...s.input, fontWeight: "700", color: "#10b981" }}
                    type="number"
                    value={editModal.netSalary || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        netSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={editModal.status || "Generated"}
                  onChange={(e) =>
                    setEditModal({ ...editModal, status: e.target.value })
                  }
                >
                  <option>Generated</option>
                  <option>Paid</option>
                  <option>Pending</option>
                </select>
              </div>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "9px",
                  padding: "10px 14px",
                  fontSize: "12.5px",
                  color: "#92400e",
                  marginBottom: "12px",
                }}
              >
                ⚠️ Manual edits override auto-calculated values. Make sure
                totals are correct before saving.
              </div>
              <div style={s.modalFoot}>
                <button style={s.cancelBtn} onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button
                  style={s.printBtnSm}
                  onClick={() => {
                    const sal = calcFromHistory(editModal);
                    const empInfo = getEmpInfo(editModal.employeeId);
                    printPayslip(
                      editModal,
                      sal,
                      empInfo,
                      editModal.month,
                      editModal.year,
                    );
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  style={s.saveBtn}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <div>
          <div style={s.title}>Payslip Generator 💵</div>
          <div style={s.sub}>
            Generate, edit, save and manage employee payslips
          </div>
        </div>
        <div style={s.headerRight}>
          {savedMsg && (
            <span
              style={{
                fontSize: "13px",
                color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                fontWeight: "600",
              }}
            >
              {savedMsg}
            </span>
          )}
          <button
            style={s.autoBtn}
            onClick={handleAutoGenerate}
            disabled={saving}
          >
            {saving ? "⏳..." : "⚡ Auto-Generate All"}
          </button>
          <button style={s.excelBtn} onClick={handleExportExcel}>
            📊 Export Excel
          </button>
          {selectedEmp && (
            <>
              <button
                style={s.saveDbBtn}
                onClick={handleSavePayslip}
                disabled={saving}
              >
                {saving ? "⏳..." : "💾 Save to DB"}
              </button>
              <button
                style={s.printBtn}
                onClick={() =>
                  printPayslip(selectedEmp, sal, selectedEmp, month, year)
                }
              >
                🖨️ Print PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div style={s.tabs}>
        {[
          { id: "generate", label: "Generate Payslip", icon: "📄" },
          { id: "history", label: "Saved History", icon: "💾" },
          { id: "all", label: "All Employees", icon: "👥" },
          { id: "summary", label: "Summary", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={s.body}>
        {/* Generate Tab */}
        {activeTab === "generate" && (
          <div style={s.generateLayout}>
            <div style={s.formPanel}>
              <div style={s.formCard}>
                <div style={s.cardTitle}>📅 Pay Period</div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Month</label>
                    <select
                      style={s.input}
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Year</label>
                    <select
                      style={s.input}
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div style={s.formCard}>
                <div style={s.cardTitle}>👤 Select Employee</div>
                <div style={s.empList}>
                  {employees.map((emp) => {
                    const es = calcSalary(emp);
                    return (
                      <div
                        key={emp.id}
                        style={{
                          ...s.empItem,
                          ...(selectedEmp?.id === emp.id
                            ? s.empItemActive
                            : {}),
                        }}
                        onClick={() => setSelectedEmp(emp)}
                      >
                        <div
                          style={{
                            ...s.empAvatar,
                            background: avatarColors[emp.role] || "#6366f1",
                          }}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <div style={s.empInfo}>
                          <div style={s.empName}>{emp.name}</div>
                          <div style={s.empRole}>
                            {emp.role} · {emp.department || "—"}
                          </div>
                        </div>
                        <div style={s.empSalary}>
                          ₹{es.netSalary.toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {selectedEmp && (
                <div style={s.formCard}>
                  <div style={s.cardTitle}>⚙️ Adjustments</div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Working Days</label>
                      <input
                        style={s.input}
                        type="number"
                        value={adjustments.workingDays}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            workingDays: parseInt(e.target.value) || 26,
                          })
                        }
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Present Days</label>
                      <input
                        style={s.input}
                        type="number"
                        value={adjustments.presentDays}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            presentDays: parseInt(e.target.value) || 26,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>LOP Days</label>
                    <input
                      style={s.input}
                      type="number"
                      min="0"
                      value={adjustments.lopDays}
                      onChange={(e) =>
                        setAdjustments({
                          ...adjustments,
                          lopDays: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Bonus (₹)</label>
                      <input
                        style={s.input}
                        type="number"
                        min="0"
                        value={adjustments.bonusAmount}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            bonusAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Bonus Reason</label>
                      <input
                        style={s.input}
                        value={adjustments.bonusReason}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            bonusReason: e.target.value,
                          })
                        }
                        placeholder="e.g. Performance"
                      />
                    </div>
                  </div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Extra Deduction (₹)</label>
                      <input
                        style={s.input}
                        type="number"
                        min="0"
                        value={adjustments.extraDeduction}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            extraDeduction: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Reason</label>
                      <input
                        style={s.input}
                        value={adjustments.extraDeductionReason}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            extraDeductionReason: e.target.value,
                          })
                        }
                        placeholder="e.g. Advance"
                      />
                    </div>
                  </div>
                  <button
                    style={{ ...s.saveDbBtn, width: "100%", marginTop: "4px" }}
                    onClick={handleSavePayslip}
                    disabled={saving}
                  >
                    {saving
                      ? "⏳ Saving..."
                      : "💾 Save This Payslip to Database"}
                  </button>
                  {savedMsg && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12.5px",
                        color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {savedMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={s.previewPanel}>
              {!selectedEmp ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: "60px", marginBottom: "16px" }}>
                    📄
                  </div>
                  <div style={s.emptyTitle}>Select an Employee</div>
                  <div style={s.emptySub}>
                    Choose an employee to preview and save their payslip
                  </div>
                </div>
              ) : (
                sal && (
                  <div style={s.payslipCard}>
                    <div style={s.psHeader}>
                      <div>
                        <div style={s.psCompany}>
                          TechNext Staffing Pvt. Ltd.
                        </div>
                        <div style={s.psCompanySub}>
                          Koramangala, Bengaluru - 560034
                        </div>
                        <div style={s.psCompanySub}>
                          info@technextstaffing.in
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={s.psTitle}>SALARY PAYSLIP</div>
                        <div style={s.psPeriod}>
                          {MONTHS[month - 1]} {year}
                        </div>
                        <div style={s.psConfidential}>🔒 CONFIDENTIAL</div>
                      </div>
                    </div>
                    <div style={s.psDivider} />
                    <div style={s.psEmpGrid}>
                      <div>
                        {[
                          { l: "Employee Name", v: selectedEmp.name },
                          {
                            l: "Employee ID",
                            v:
                              selectedEmp.employeeId ||
                              selectedEmp.employee_id ||
                              "TN00" + selectedEmp.id,
                          },
                          { l: "Designation", v: selectedEmp.role },
                          { l: "Department", v: selectedEmp.department || "—" },
                        ].map((r) => (
                          <div key={r.l} style={s.psEmpRow}>
                            <span style={s.psEmpLabel}>{r.l}</span>
                            <span style={s.psEmpVal}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        {[
                          {
                            l: "Pay Period",
                            v: `${MONTHS[month - 1]} ${year}`,
                          },
                          { l: "Working Days", v: adjustments.workingDays },
                          { l: "Days Present", v: adjustments.presentDays },
                          { l: "LOP Days", v: adjustments.lopDays },
                        ].map((r) => (
                          <div key={r.l} style={s.psEmpRow}>
                            <span style={s.psEmpLabel}>{r.l}</span>
                            <span style={s.psEmpVal}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={s.psSalaryGrid}>
                      <div style={s.psSalaryCard}>
                        <div
                          style={{
                            ...s.psSalaryTitle,
                            background: "#f0fdf4",
                            color: "#10b981",
                          }}
                        >
                          💰 Earnings
                        </div>
                        {[
                          { l: "Basic Salary", v: sal.basic },
                          { l: "HRA (40%)", v: sal.hra },
                          { l: "Transport", v: sal.transport },
                          { l: "Medical", v: sal.medical },
                          { l: "Special", v: sal.special },
                          ...(sal.bonus > 0
                            ? [
                                {
                                  l: adjustments.bonusReason || "Bonus",
                                  v: sal.bonus,
                                },
                              ]
                            : []),
                        ].map((r) => (
                          <div key={r.l} style={s.psRow}>
                            <span style={s.psRowLabel}>{r.l}</span>
                            <span style={s.psRowVal}>
                              ₹{r.v.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        <div style={s.psTotalRow}>
                          <span>Gross Salary</span>
                          <span>
                            ₹{sal.grossSalary.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div style={s.psSalaryCard}>
                        <div
                          style={{
                            ...s.psSalaryTitle,
                            background: "#fef2f2",
                            color: "#ef4444",
                          }}
                        >
                          📉 Deductions
                        </div>
                        {[
                          { l: "PF (12%)", v: sal.pf },
                          ...(sal.esi > 0 ? [{ l: "ESI", v: sal.esi }] : []),
                          { l: "Prof Tax", v: sal.professionalTax },
                          ...(sal.tds > 0 ? [{ l: "TDS", v: sal.tds }] : []),
                          ...(sal.lopDeduction > 0
                            ? [{ l: "LOP", v: sal.lopDeduction }]
                            : []),
                          ...(sal.extraDed > 0
                            ? [
                                {
                                  l:
                                    adjustments.extraDeductionReason || "Other",
                                  v: sal.extraDed,
                                },
                              ]
                            : []),
                        ].map((r) => (
                          <div key={r.l} style={s.psRow}>
                            <span style={s.psRowLabel}>{r.l}</span>
                            <span style={{ ...s.psRowVal, color: "#ef4444" }}>
                              ₹{r.v.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        <div style={s.psTotalRow}>
                          <span>Total Deductions</span>
                          <span style={{ color: "#ef4444" }}>
                            ₹{sal.totalDeductions.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={s.psNetSalary}>
                      <div>
                        <div style={s.psNetLabel}>NET SALARY PAYABLE</div>
                        <div style={s.psNetAmount}>
                          ₹{sal.netSalary.toLocaleString("en-IN")}
                        </div>
                        <div style={s.psNetWords}>
                          {numberToWords(sal.netSalary)} Rupees Only
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={s.psNetLabel}>Payment Mode</div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            marginTop: "4px",
                          }}
                        >
                          Bank Transfer
                        </div>
                      </div>
                    </div>
                    <div style={s.psSignatures}>
                      {["Employee Signature", "HR Manager", "Company Seal"].map(
                        (sig) => (
                          <div key={sig} style={s.psSig}>
                            <div style={s.psSigSpace} />
                            <div style={s.psSigLine}>{sig}</div>
                          </div>
                        ),
                      )}
                    </div>
                    <div style={s.psFooter}>
                      Computer-generated payslip. Generated on{" "}
                      {new Date().toLocaleDateString("en-IN")} via TechNext CRM
                      Portal.
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  style={s.periodSelect}
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  style={s.periodSelect}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
                <button style={s.excelBtn} onClick={fetchAllHistory}>
                  🔍 Load
                </button>
              </div>
              <button
                style={s.autoBtn}
                onClick={handleAutoGenerate}
                disabled={saving}
              >
                ⚡ Auto-Generate All
              </button>
              {savedMsg && (
                <span
                  style={{
                    fontSize: "13px",
                    color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                    fontWeight: "600",
                  }}
                >
                  {savedMsg}
                </span>
              )}
            </div>
            {historyLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#9ca3af",
                }}
              >
                Loading...
              </div>
            ) : payslipHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💾</div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f1117",
                    marginBottom: "8px",
                  }}
                >
                  No saved payslips for {MONTHS[month - 1]} {year}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginBottom: "16px",
                  }}
                >
                  Click Auto-Generate All to create payslips for all employees
                </div>
                <button style={s.autoBtn} onClick={handleAutoGenerate}>
                  ⚡ Auto-Generate All
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7f0",
                  overflow: "hidden",
                }}
              >
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>Employee</th>
                      <th style={s.th}>Period</th>
                      <th style={s.th}>Gross</th>
                      <th style={s.th}>Deductions</th>
                      <th style={s.th}>Net Salary</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Generated By</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslipHistory.map((ps) => {
                      const hSal = calcFromHistory(ps);
                      const empInfo = getEmpInfo(ps.employeeId);
                      return (
                        <tr key={ps.id} style={s.trow}>
                          <td style={s.td}>
                            <div
                              style={{ fontWeight: "600", color: "#0f1117" }}
                            >
                              {ps.employeeName}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                              ID: {ps.employeeId}
                            </div>
                          </td>
                          <td style={s.td}>
                            {MONTHS[(ps.month || 1) - 1]} {ps.year}
                          </td>
                          <td style={s.td}>
                            ₹
                            {Number(ps.grossSalary || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td style={{ ...s.td, color: "#ef4444" }}>
                            ₹
                            {Number(ps.totalDeductions || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              fontWeight: "800",
                              color: "#10b981",
                              fontSize: "14px",
                            }}
                          >
                            ₹{Number(ps.netSalary || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={s.td}>
                            <select
                              style={{
                                ...s.periodSelect,
                                fontSize: "12px",
                                padding: "4px 8px",
                              }}
                              value={ps.status}
                              onChange={(e) =>
                                handleUpdateStatus(ps.id, e.target.value)
                              }
                            >
                              <option>Generated</option>
                              <option>Paid</option>
                              <option>Pending</option>
                            </select>
                          </td>
                          <td style={s.td}>
                            <div
                              style={{ fontSize: "11.5px", color: "#6b7280" }}
                            >
                              {ps.generatedBy || "System"}
                            </div>
                          </td>
                          <td style={s.td}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={s.generateBtn}
                                onClick={() => setEditModal({ ...ps })}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                style={s.downloadBtn}
                                onClick={() =>
                                  printPayslip(
                                    ps,
                                    hSal,
                                    empInfo,
                                    ps.month,
                                    ps.year,
                                  )
                                }
                              >
                                🖨️ Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Employees Tab */}
        {activeTab === "all" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Employee</th>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Dept</th>
                  <th style={s.th}>Basic</th>
                  <th style={s.th}>Gross</th>
                  <th style={s.th}>Deductions</th>
                  <th style={s.th}>Net Salary</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const es = calcSalary(emp);
                  return (
                    <tr key={emp.id} style={s.trow}>
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
                              ...s.empAvatar,
                              background: avatarColors[emp.role] || "#6366f1",
                              width: "32px",
                              height: "32px",
                              fontSize: "12px",
                            }}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#0f1117",
                                fontSize: "13px",
                              }}
                            >
                              {emp.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                              {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        {emp.employeeId || emp.employee_id || "TN00" + emp.id}
                      </td>
                      <td style={s.td}>{emp.department || "—"}</td>
                      <td style={s.td}>₹{es.basic.toLocaleString("en-IN")}</td>
                      <td style={s.td}>
                        ₹{es.grossSalary.toLocaleString("en-IN")}
                      </td>
                      <td style={{ ...s.td, color: "#ef4444" }}>
                        ₹{es.totalDeductions.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          ...s.td,
                          fontWeight: "800",
                          color: "#10b981",
                          fontSize: "14px",
                        }}
                      >
                        ₹{es.netSalary.toLocaleString("en-IN")}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={s.generateBtn}
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveTab("generate");
                            }}
                          >
                            Generate
                          </button>
                          <button
                            style={s.downloadBtn}
                            onClick={() =>
                              printPayslip(emp, es, emp, month, year)
                            }
                          >
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div style={s.summaryWrap}>
            <div style={s.summaryGrid}>
              <div style={{ ...s.summaryCard, borderTop: "3px solid #6366f1" }}>
                <div style={s.summaryIcon}>👥</div>
                <div style={s.summaryVal}>{employees.length}</div>
                <div style={s.summaryLabel}>Total Employees</div>
              </div>
              <div style={{ ...s.summaryCard, borderTop: "3px solid #10b981" }}>
                <div style={s.summaryIcon}>💰</div>
                <div style={s.summaryVal}>
                  ₹{(totalPayroll / 100000).toFixed(1)}L
                </div>
                <div style={s.summaryLabel}>Total Net Payroll</div>
              </div>
              <div style={{ ...s.summaryCard, borderTop: "3px solid #f59e0b" }}>
                <div style={s.summaryIcon}>📊</div>
                <div style={s.summaryVal}>
                  ₹
                  {employees.length > 0
                    ? Math.round(
                        totalPayroll / employees.length,
                      ).toLocaleString("en-IN")
                    : "0"}
                </div>
                <div style={s.summaryLabel}>Average Salary</div>
              </div>
              <div style={{ ...s.summaryCard, borderTop: "3px solid #ef4444" }}>
                <div style={s.summaryIcon}>📉</div>
                <div style={s.summaryVal}>
                  ₹
                  {(
                    employees.reduce(
                      (sum, emp) => sum + calcSalary(emp).totalDeductions,
                      0,
                    ) / 100000
                  ).toFixed(1)}
                  L
                </div>
                <div style={s.summaryLabel}>Total Deductions</div>
              </div>
            </div>
            <div style={s.deptCard}>
              <div style={s.cardTitle}>
                Department-wise — {MONTHS[month - 1]} {year}
              </div>
              {["Management", "Recruitment", "Sales", "HR", "Operations"].map(
                (dept) => {
                  const de = employees.filter((e) => e.department === dept);
                  if (!de.length) return null;
                  const dt = de.reduce(
                    (sum, emp) => sum + calcSalary(emp).netSalary,
                    0,
                  );
                  return (
                    <div key={dept} style={s.deptRow}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#0f1117",
                          }}
                        >
                          {dept}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {de.length} employees
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "800",
                          color: "#6366f1",
                        }}
                      >
                        ₹{dt.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                },
              )}
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
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  periodWrap: { display: "flex", gap: "8px" },
  periodSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  autoBtn: {
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  excelBtn: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#10b981",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveDbBtn: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#6366f1",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  printBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  printBtnSm: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    color: "#6b7280",
    borderRadius: "9px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
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
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  body: { flex: 1, overflowY: "auto" },
  generateLayout: { display: "flex", height: "100%" },
  formPanel: {
    width: "340px",
    minWidth: "340px",
    overflowY: "auto",
    padding: "16px",
    borderRight: "1px solid #e5e7f0",
    background: "#fff",
  },
  formCard: {
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    marginBottom: "14px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "14px",
  },
  empList: { display: "flex", flexDirection: "column", gap: "6px" },
  empItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    border: "1.5px solid #e5e7f0",
    background: "#fff",
  },
  empItemActive: { border: "1.5px solid #6366f1", background: "#eef2ff" },
  empAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  empInfo: { flex: 1 },
  empName: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  empRole: { fontSize: "11px", color: "#9ca3af", marginTop: "1px" },
  empSalary: { fontSize: "13px", fontWeight: "800", color: "#10b981" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#0f1117",
  },
  previewPanel: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    background: "#f8f9fc",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "8px",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af", textAlign: "center" },
  payslipCard: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7f0",
    padding: "28px",
    maxWidth: "720px",
    margin: "0 auto",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  psHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  psCompany: { fontSize: "20px", fontWeight: "800", color: "#6366f1" },
  psCompanySub: { fontSize: "11.5px", color: "#6b7280", marginTop: "3px" },
  psTitle: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#0f1117",
    textAlign: "right",
  },
  psPeriod: {
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "right",
    marginTop: "3px",
  },
  psConfidential: {
    fontSize: "10px",
    color: "#ef4444",
    fontWeight: "700",
    textAlign: "right",
    marginTop: "3px",
  },
  psDivider: {
    height: "3px",
    background: "linear-gradient(90deg,#6366f1,#4f46e5)",
    borderRadius: "2px",
    marginBottom: "18px",
  },
  psEmpGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    background: "#f8f9fc",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "18px",
    border: "1px solid #e5e7f0",
  },
  psEmpRow: { display: "flex", gap: "10px", marginBottom: "8px" },
  psEmpLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "600",
    minWidth: "110px",
  },
  psEmpVal: { fontSize: "12.5px", fontWeight: "700", color: "#0f1117" },
  psSalaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "16px",
  },
  psSalaryCard: {
    border: "1px solid #e5e7f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  psSalaryTitle: {
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  psRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 14px",
    borderBottom: "1px solid #f8fafc",
  },
  psRowLabel: { fontSize: "12px", color: "#6b7280" },
  psRowVal: { fontSize: "12px", fontWeight: "600", color: "#0f1117" },
  psTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#f8f9fc",
    borderTop: "2px solid #e5e7f0",
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f1117",
  },
  psNetSalary: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    borderRadius: "12px",
    padding: "18px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  psNetLabel: {
    fontSize: "11px",
    fontWeight: "600",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  psNetAmount: {
    fontSize: "28px",
    fontWeight: "900",
    letterSpacing: "-1px",
    marginTop: "4px",
  },
  psNetWords: { fontSize: "11px", opacity: 0.7, marginTop: "3px" },
  psSignatures: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    borderTop: "1px solid #e5e7f0",
    paddingTop: "18px",
    marginBottom: "14px",
  },
  psSig: { textAlign: "center" },
  psSigSpace: { height: "40px" },
  psSigLine: {
    borderTop: "1px solid #374151",
    paddingTop: "6px",
    fontSize: "11px",
    color: "#6b7280",
  },
  psFooter: {
    textAlign: "center",
    fontSize: "10.5px",
    color: "#9ca3af",
    borderTop: "1px solid #f1f3f9",
    paddingTop: "12px",
  },
  tableWrap: {
    background: "#fff",
    margin: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
  th: {
    padding: "11px 16px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#374151" },
  generateBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  downloadBtn: {
    background: "#f0fdf4",
    color: "#10b981",
    border: "none",
    borderRadius: "7px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  summaryWrap: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  summaryIcon: { fontSize: "28px", marginBottom: "10px" },
  summaryVal: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
    fontWeight: "500",
  },
  deptCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
  },
  deptRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f1f3f9",
  },
  // Employee self view
  empViewBody: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  empInfoCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  empAvatarLg: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    flexShrink: 0,
  },
  empNameLg: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  empRoleLg: { fontSize: "13px", color: "#6b7280", marginTop: "3px" },
  empIdLg: { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  empPeriodBadge: {
    marginLeft: "auto",
    background: "#eef2ff",
    color: "#6366f1",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },
  netBanner: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    borderRadius: "14px",
    padding: "24px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
  },
  netBannerLabel: {
    fontSize: "11px",
    fontWeight: "600",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  netBannerAmount: {
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "-2px",
    marginTop: "4px",
  },
  netBannerWords: { fontSize: "12px", opacity: 0.7, marginTop: "4px" },
  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  breakCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  breakTitle: {
    fontSize: "13px",
    fontWeight: "700",
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7f0",
  },
  breakRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "1px solid #f8fafc",
  },
  breakLabel: { fontSize: "13px", color: "#6b7280" },
  breakVal: { fontSize: "13px", fontWeight: "600", color: "#0f1117" },
  breakTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#f8f9fc",
    borderTop: "2px solid #e5e7f0",
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f1117",
  },
  historyCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  historyTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "14px",
  },
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
    gap: "10px",
  },
  historyItem: {
    background: "#f8f9fc",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "center",
    cursor: "pointer",
    border: "1px solid #e5e7f0",
  },
  historyMonth: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: "6px",
  },
  historyAmt: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f1117",
    marginBottom: "6px",
  },
  historyStatus: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
    display: "inline-block",
  },
  // Edit Modal
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
    width: "560px",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
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
};
