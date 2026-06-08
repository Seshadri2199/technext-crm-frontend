import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo from "../logo.jpg";

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
  const [editModal, setEditModal] = useState(null);
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
    const basic = parseFloat(emp.basicSalary || emp.basic_salary || 0);
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
    const a = [
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
    const b = [
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
    if (num < 20) return a[num];
    if (num < 100)
      return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
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

  // Get last day of month as pay date
  const getPayDate = (m, y) => {
    const lastDay = new Date(y, m, 0).getDate();
    return `${String(lastDay).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  };

  const printPayslip = (emp, sal, pMonth, pYear, adj) => {
    const empData =
      employees.find((e) => e.id === (emp.employeeId || emp.id)) || emp;
    const name = emp.employeeName || emp.name || empData.name || "—";
    const empId =
      emp.employeeId || empData.employeeId || empData.employee_id || "—";
    const designation = emp.role || empData.role || "—";
    const department = emp.department || empData.department || "—";
    const joiningDate =
      empData.joiningDate || empData.joining_date || emp.joiningDate || "—";
    const pan = empData.panNumber || empData.pan_number || emp.panNumber || "—";
    const bankAcc =
      empData.bankAccount || empData.bank_account || emp.bankAccount || "—";
    const workLoc =
      empData.workLocation ||
      empData.work_location ||
      emp.workLocation ||
      "Bangalore";
    const workDays = adj?.workingDays || emp.workingDays || 26;
    const lopDays = adj?.lopDays || emp.lopDays || 0;
    const paidDays = workDays - lopDays;
    const payDate = getPayDate(pMonth, pYear);

    // YTD = same as current month for now (can be enhanced)
    const ytdBasic = sal.basic;
    const ytdHRA = sal.hra;
    const ytdSpecial = sal.special;
    const ytdGross = sal.grossSalary;
    const ytdPF = sal.pf;
    const ytdTotal = sal.totalDeductions;

    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${name} - ${MONTHS[pMonth - 1]} ${pYear}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',Arial,sans-serif; background:#fff; color:#1a1a1a; font-size:12px; padding:0; }
    .page { width:794px; min-height:1123px; margin:0 auto; padding:32px 36px; }
    
    /* Header */
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:1px solid #e0e0e0; margin-bottom:20px; }
    .company-logo { display:flex; align-items:center; gap:12px; }
    .logo-img { width:56px; height:56px; object-fit:contain; }
    .company-info .company-name { font-size:16px; font-weight:700; color:#1a1a1a; }
    .company-info .company-addr { font-size:11px; color:#666; margin-top:3px; line-height:1.5; }
    
    /* Payslip title */
    .payslip-title { font-size:13px; font-weight:600; color:#333; margin-bottom:4px; }
    
    /* Pay Summary Section */
    .pay-summary-title { font-size:13px; font-weight:700; color:#1a1a1a; margin-bottom:12px; }
    .summary-layout { display:flex; gap:20px; margin-bottom:24px; }
    .summary-left { flex:1; }
    .summary-right { width:220px; }
    
    .info-row { display:flex; margin-bottom:8px; }
    .info-label { width:130px; font-size:11px; color:#888; font-weight:400; flex-shrink:0; }
    .info-value { font-size:11px; color:#1a1a1a; font-weight:600; }
    
    /* Net Pay Box */
    .net-pay-box { border:1px solid #e0e0e0; border-radius:6px; padding:16px; text-align:center; }
    .net-pay-label { font-size:11px; color:#888; margin-bottom:8px; }
    .net-pay-amount { font-size:26px; font-weight:800; color:#2563eb; margin-bottom:8px; }
    .net-pay-days { font-size:11px; color:#666; }
    
    /* Earnings/Deductions Table */
    .salary-table { width:100%; border-collapse:collapse; margin-bottom:16px; border:1px solid #e0e0e0; border-radius:6px; overflow:hidden; }
    .salary-table th { background:#f5f5f5; padding:9px 12px; text-align:left; font-size:11px; font-weight:700; color:#333; border-bottom:1px solid #e0e0e0; }
    .salary-table th:last-child, .salary-table td:last-child { text-align:right; }
    .salary-table td { padding:8px 12px; font-size:11.5px; color:#333; border-bottom:1px solid #f0f0f0; }
    .salary-table tr:last-child td { border-bottom:none; }
    .salary-table .total-row td { font-weight:700; background:#f9f9f9; border-top:1px solid #e0e0e0; padding:10px 12px; }
    .ytd { color:#888; }
    
    /* Two column layout for earnings/deductions */
    .salary-layout { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    
    /* Net Payable */
    .net-payable-bar { background:#f0fdf4; border-left:4px solid #22c55e; padding:14px 16px; border-radius:0 6px 6px 0; margin-bottom:20px; }
    .net-payable-text { font-size:13px; font-weight:700; color:#1a1a1a; }
    .net-payable-text span { color:#16a34a; }
    .net-payable-words { font-size:11px; color:#666; margin-top:3px; }
    
    /* Footer */
    .footer-note { font-size:10.5px; color:#888; margin-bottom:6px; }
    .system-note { text-align:center; font-size:11px; color:#aaa; margin-top:40px; padding-top:16px; border-top:1px solid #f0f0f0; }
    
    @media print {
      body { margin:0; }
      .page { padding:20px 24px; }
      @page { size:A4; margin:0; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="company-logo">
      <div class="company-info">
        <div class="company-name">TechNext Staffing Pvt. Ltd.</div>
        <div class="company-addr">MSR Novel Office, Koramangala<br>Bengaluru, Karnataka 560034, India</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="payslip-title">Payslip for the month of ${MONTHS[pMonth - 1]} ${pYear}</div>
    </div>
  </div>

  <!-- Pay Summary -->
  <div class="pay-summary-title">Pay Summary</div>
  <div class="summary-layout">
    <div class="summary-left">
      <div class="info-row"><span class="info-label">Employee Name</span><span class="info-value">${name}, ${empId}</span></div>
      <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${designation}</span></div>
      <div class="info-row"><span class="info-label">Department</span><span class="info-value">${department}</span></div>
      <div class="info-row"><span class="info-label">Date of Joining</span><span class="info-value">${joiningDate}</span></div>
      <div class="info-row"><span class="info-label">Pay Period</span><span class="info-value">${MONTHS[pMonth - 1]} ${pYear}</span></div>
      <div class="info-row"><span class="info-label">Pay Date</span><span class="info-value">${payDate}</span></div>
      <div class="info-row"><span class="info-label">PAN</span><span class="info-value">${pan}</span></div>
      <div class="info-row"><span class="info-label">Bank Account No</span><span class="info-value">${bankAcc}</span></div>
      <div class="info-row"><span class="info-label">Work Location</span><span class="info-value">${workLoc}</span></div>
    </div>
    <div class="summary-right">
      <div class="net-pay-box">
        <div class="net-pay-label">Total Net Pay</div>
        <div class="net-pay-amount">₹${Number(sal.netSalary || 0).toLocaleString("en-IN")}.00</div>
        <div class="net-pay-days">Paid Days : ${paidDays} | LOP Days : ${lopDays}</div>
      </div>
    </div>
  </div>

  <!-- Earnings & Deductions -->
  <div class="salary-layout">
    <!-- Earnings -->
    <div>
      <table class="salary-table">
        <thead>
          <tr>
            <th>Earnings</th>
            <th>Amount</th>
            <th>YTD</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Basic</td><td>₹${Number(sal.basic || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(ytdBasic || 0).toLocaleString("en-IN")}.00</td></tr>
          <tr><td>House Rent Allowance</td><td>₹${Number(sal.hra || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(ytdHRA || 0).toLocaleString("en-IN")}.00</td></tr>
          <tr><td>Transport Allowance</td><td>₹${Number(sal.transport || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.transport || 0).toLocaleString("en-IN")}.00</td></tr>
          <tr><td>Medical Allowance</td><td>₹${Number(sal.medical || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.medical || 0).toLocaleString("en-IN")}.00</td></tr>
          <tr><td>Special Allowance</td><td>₹${Number(sal.special || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(ytdSpecial || 0).toLocaleString("en-IN")}.00</td></tr>
          ${Number(sal.bonus || 0) > 0 ? `<tr><td>${adj?.bonusReason || emp.bonusReason || "Bonus"}</td><td>₹${Number(sal.bonus).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.bonus).toLocaleString("en-IN")}.00</td></tr>` : ""}
          ${Number(sal.lopDeduction || 0) > 0 ? `<tr><td>LOP Deduction (${lopDays} days)</td><td style="color:#ef4444">-₹${Number(sal.lopDeduction).toLocaleString("en-IN")}.00</td><td class="ytd">-₹${Number(sal.lopDeduction).toLocaleString("en-IN")}.00</td></tr>` : ""}
          <tr class="total-row"><td>Gross Earnings</td><td>₹${Number(sal.grossSalary || 0).toLocaleString("en-IN")}.00</td><td class="ytd"></td></tr>
        </tbody>
      </table>
    </div>
    <!-- Deductions -->
    <div>
      <table class="salary-table">
        <thead>
          <tr>
            <th>Deductions</th>
            <th>Amount</th>
            <th>YTD</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>EPF Contribution</td><td>₹${Number(sal.pf || 0).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(ytdPF || 0).toLocaleString("en-IN")}.00</td></tr>
          ${Number(sal.esi || 0) > 0 ? `<tr><td>ESI Contribution</td><td>₹${Number(sal.esi).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.esi).toLocaleString("en-IN")}.00</td></tr>` : ""}
          ${Number(sal.professionalTax || 0) > 0 ? `<tr><td>Professional Tax</td><td>₹${Number(sal.professionalTax).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.professionalTax).toLocaleString("en-IN")}.00</td></tr>` : ""}
          ${Number(sal.tds || 0) > 0 ? `<tr><td>TDS</td><td>₹${Number(sal.tds).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.tds).toLocaleString("en-IN")}.00</td></tr>` : ""}
          ${Number(sal.extraDed || sal.extraDeduction || 0) > 0 ? `<tr><td>${adj?.extraDeductionReason || emp.extraDeductionReason || "Other Deduction"}</td><td>₹${Number(sal.extraDed || sal.extraDeduction).toLocaleString("en-IN")}.00</td><td class="ytd">₹${Number(sal.extraDed || sal.extraDeduction).toLocaleString("en-IN")}.00</td></tr>` : ""}
          <tr class="total-row"><td>Total Deductions</td><td>₹${Number(sal.totalDeductions || 0).toLocaleString("en-IN")}.00</td><td class="ytd"></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Net Payable Bar -->
  <div class="net-payable-bar">
    <div class="net-payable-text">| Total Net Payable <span>₹${Number(sal.netSalary || 0).toLocaleString("en-IN")}.00</span> (${numberToWords(Math.round(Number(sal.netSalary || 0)))} Only)</div>
    <div class="net-payable-words">**Total Net Payable = Gross Earnings - Total Deductions</div>
  </div>

  <!-- System Note -->
  <div class="system-note">-- This is a system-generated document. --</div>
</div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
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
      setSavedMsg("✅ Updated!");
      setEditModal(null);
      fetchAllHistory();
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setSavedMsg("⚠️ Failed.");
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

  // ===== EMPLOYEE SELF VIEW =====
  if (!isAdmin) {
    const own = employees.find((e) => e.email === currentUser.email);
    if (!own)
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          Profile not found.
        </div>
      );
    const sal = calcSalary(own, {
      workingDays: 26,
      presentDays: 26,
      lopDays: 0,
      bonusAmount: 0,
      extraDeduction: 0,
    });
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
              onClick={() =>
                printPayslip(own, sal, month, year, {
                  workingDays: 26,
                  presentDays: 26,
                  lopDays: 0,
                })
              }
            >
              🖨️ Download / Print PDF
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
            <div style={{ flex: 1 }}>
              <div style={s.empNameLg}>{own.name}</div>
              <div style={s.empRoleLg}>
                {own.role} · {own.department || "—"}
              </div>
              <div style={s.empIdLg}>
                ID: {own.employeeId || own.employee_id || "TN00" + own.id} |
                PAN: {own.panNumber || own.pan_number || "—"}
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
                ₹{sal.netSalary.toLocaleString("en-IN")}.00
              </div>
              <div style={s.netBannerWords}>
                {numberToWords(sal.netSalary)} Only
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={s.netBannerLabel}>Paid Days: 26 | LOP: 0</div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  marginTop: "4px",
                }}
              >
                Bank Transfer
              </div>
              <div style={s.netBannerWords}>
                Pay Date: {getPayDate(month, year)}
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
                { l: "House Rent Allowance (HRA)", v: sal.hra },
                { l: "Transport Allowance", v: sal.transport },
                { l: "Medical Allowance", v: sal.medical },
                { l: "Special Allowance", v: sal.special },
              ].map((r) => (
                <div key={r.l} style={s.breakRow}>
                  <span style={s.breakLabel}>{r.l}</span>
                  <span style={s.breakVal}>
                    ₹{r.v.toLocaleString("en-IN")}.00
                  </span>
                </div>
              ))}
              <div style={s.breakTotal}>
                <span>Gross Earnings</span>
                <span style={{ color: "#10b981" }}>
                  ₹{sal.grossSalary.toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
            <div style={s.breakCard}>
              <div style={{ ...s.breakTitle, color: "#ef4444" }}>
                📉 Deductions
              </div>
              {[
                { l: "EPF Contribution", v: sal.pf },
                ...(sal.esi > 0 ? [{ l: "ESI Contribution", v: sal.esi }] : []),
                ...(sal.professionalTax > 0
                  ? [{ l: "Professional Tax", v: sal.professionalTax }]
                  : []),
                ...(sal.tds > 0 ? [{ l: "TDS", v: sal.tds }] : []),
              ].map((r) => (
                <div key={r.l} style={s.breakRow}>
                  <span style={s.breakLabel}>{r.l}</span>
                  <span style={{ ...s.breakVal, color: "#ef4444" }}>
                    ₹{r.v.toLocaleString("en-IN")}.00
                  </span>
                </div>
              ))}
              <div style={s.breakTotal}>
                <span>Total Deductions</span>
                <span style={{ color: "#ef4444" }}>
                  ₹{sal.totalDeductions.toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
          </div>
          <div style={s.historyCard}>
            <div style={s.historyTitle}>📅 Payslip History</div>
            {payslipHistory.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                No saved payslips yet.
              </div>
            ) : (
              <div style={s.historyGrid}>
                {payslipHistory.map((ps) => {
                  const hSal = calcFromHistory(ps);
                  return (
                    <div
                      key={ps.id}
                      style={s.historyItem}
                      onClick={() =>
                        printPayslip(ps, hSal, ps.month, ps.year, ps)
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
                        🖨️ Print
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

  // ===== ADMIN / HR VIEW =====
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
                <div style={s.fg}>
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
                <div style={s.fg}>
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
              <div style={s.formRow}>
                <div style={s.fg}>
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
                <div style={s.fg}>
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
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
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
                <div style={s.fg}>
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
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7f0",
                }}
              >
                <button style={s.cancelBtn} onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "9px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <div>
          <div style={s.title}>Payslip Generator 💵</div>
          <div style={s.sub}>Professional payslips matching company format</div>
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
                  printPayslip(selectedEmp, sal, month, year, adjustments)
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
                  <div style={s.fg}>
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
                  <div style={s.fg}>
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
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
                        <div style={{ flex: 1 }}>
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
                    <div style={s.fg}>
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
                    <div style={s.fg}>
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
                  <div style={s.fg}>
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
                    <div style={s.fg}>
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
                    <div style={s.fg}>
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
                  <button
                    style={{ ...s.saveDbBtn, width: "100%", marginTop: "4px" }}
                    onClick={handleSavePayslip}
                    disabled={saving}
                  >
                    {saving ? "⏳ Saving..." : "💾 Save to Database"}
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

            {/* Preview Panel - matches exact format */}
            <div style={s.previewPanel}>
              {!selectedEmp ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: "60px", marginBottom: "16px" }}>
                    📄
                  </div>
                  <div style={s.emptyTitle}>Select an Employee</div>
                  <div style={s.emptySub}>
                    Preview payslip in the exact company format
                  </div>
                </div>
              ) : (
                sal && (
                  <div style={s.payslipPreview}>
                    {/* Payslip Preview matching exact format */}
                    <div style={s.psCompanyRow}>
                      <div>
                        <div style={s.psCompanyName}>
                          TechNext Staffing Pvt. Ltd.
                        </div>
                        <div style={s.psCompanyAddr}>
                          MSR Novel Office, Koramangala, Bengaluru 560034
                        </div>
                      </div>
                    </div>
                    <div style={s.psMonthTitle}>
                      Payslip for the month of {MONTHS[month - 1]} {year}
                    </div>
                    <div style={s.psSumTitle}>Pay Summary</div>

                    <div style={s.psSummaryLayout}>
                      <div style={{ flex: 1 }}>
                        {[
                          {
                            l: "Employee Name",
                            v: `${selectedEmp.name}, ${selectedEmp.employeeId || selectedEmp.employee_id || "TN00" + selectedEmp.id}`,
                          },
                          { l: "Designation", v: selectedEmp.role || "—" },
                          { l: "Department", v: selectedEmp.department || "—" },
                          {
                            l: "Date of Joining",
                            v:
                              selectedEmp.joiningDate ||
                              selectedEmp.joining_date ||
                              "—",
                          },
                          {
                            l: "Pay Period",
                            v: `${MONTHS[month - 1]} ${year}`,
                          },
                          { l: "Pay Date", v: getPayDate(month, year) },
                          {
                            l: "PAN",
                            v:
                              selectedEmp.panNumber ||
                              selectedEmp.pan_number ||
                              "—",
                          },
                          {
                            l: "Bank Account No",
                            v:
                              selectedEmp.bankAccount ||
                              selectedEmp.bank_account ||
                              "—",
                          },
                          {
                            l: "Work Location",
                            v:
                              selectedEmp.workLocation ||
                              selectedEmp.work_location ||
                              "Bangalore",
                          },
                        ].map((row) => (
                          <div key={row.l} style={s.psInfoRow}>
                            <span style={s.psInfoLabel}>{row.l}</span>
                            <span style={s.psInfoVal}>{row.v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={s.psNetBox}>
                        <div style={s.psNetBoxLabel}>Total Net Pay</div>
                        <div style={s.psNetBoxAmt}>
                          ₹{sal.netSalary.toLocaleString("en-IN")}.00
                        </div>
                        <div style={s.psNetBoxDays}>
                          Paid Days :{" "}
                          {adjustments.workingDays - adjustments.lopDays} | LOP
                          Days : {adjustments.lopDays}
                        </div>
                      </div>
                    </div>

                    {/* Earnings & Deductions */}
                    <div style={s.psTwoCol}>
                      <div>
                        <table style={s.psTable}>
                          <thead>
                            <tr>
                              <th style={s.psTh}>Earnings</th>
                              <th style={s.psTh}>Amount</th>
                              <th style={{ ...s.psTh, color: "#aaa" }}>YTD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { l: "Basic", v: sal.basic },
                              { l: "House Rent Allowance", v: sal.hra },
                              { l: "Transport Allowance", v: sal.transport },
                              { l: "Medical Allowance", v: sal.medical },
                              { l: "Special Allowance", v: sal.special },
                              ...(sal.bonus > 0
                                ? [
                                    {
                                      l: adjustments.bonusReason || "Bonus",
                                      v: sal.bonus,
                                    },
                                  ]
                                : []),
                            ].map((r) => (
                              <tr key={r.l}>
                                <td style={s.psTd}>{r.l}</td>
                                <td style={{ ...s.psTd, textAlign: "right" }}>
                                  ₹{r.v.toLocaleString("en-IN")}.00
                                </td>
                                <td
                                  style={{
                                    ...s.psTd,
                                    textAlign: "right",
                                    color: "#aaa",
                                  }}
                                >
                                  ₹{r.v.toLocaleString("en-IN")}.00
                                </td>
                              </tr>
                            ))}
                            <tr
                              style={{
                                background: "#f9f9f9",
                                fontWeight: "700",
                              }}
                            >
                              <td
                                style={{
                                  ...s.psTd,
                                  borderTop: "1px solid #e0e0e0",
                                }}
                              >
                                Gross Earnings
                              </td>
                              <td
                                style={{
                                  ...s.psTd,
                                  textAlign: "right",
                                  borderTop: "1px solid #e0e0e0",
                                }}
                              >
                                ₹{sal.grossSalary.toLocaleString("en-IN")}.00
                              </td>
                              <td
                                style={{
                                  ...s.psTd,
                                  borderTop: "1px solid #e0e0e0",
                                }}
                              ></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <table style={s.psTable}>
                          <thead>
                            <tr>
                              <th style={s.psTh}>Deductions</th>
                              <th style={s.psTh}>Amount</th>
                              <th style={{ ...s.psTh, color: "#aaa" }}>YTD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { l: "EPF Contribution", v: sal.pf },
                              ...(sal.esi > 0
                                ? [{ l: "ESI Contribution", v: sal.esi }]
                                : []),
                              ...(sal.professionalTax > 0
                                ? [
                                    {
                                      l: "Professional Tax",
                                      v: sal.professionalTax,
                                    },
                                  ]
                                : []),
                              ...(sal.tds > 0
                                ? [{ l: "TDS", v: sal.tds }]
                                : []),
                            ].map((r) => (
                              <tr key={r.l}>
                                <td style={s.psTd}>{r.l}</td>
                                <td
                                  style={{
                                    ...s.psTd,
                                    textAlign: "right",
                                    color: "#ef4444",
                                  }}
                                >
                                  ₹{r.v.toLocaleString("en-IN")}.00
                                </td>
                                <td
                                  style={{
                                    ...s.psTd,
                                    textAlign: "right",
                                    color: "#aaa",
                                  }}
                                >
                                  ₹{r.v.toLocaleString("en-IN")}.00
                                </td>
                              </tr>
                            ))}
                            <tr
                              style={{
                                background: "#f9f9f9",
                                fontWeight: "700",
                              }}
                            >
                              <td
                                style={{
                                  ...s.psTd,
                                  borderTop: "1px solid #e0e0e0",
                                }}
                              >
                                Total Deductions
                              </td>
                              <td
                                style={{
                                  ...s.psTd,
                                  textAlign: "right",
                                  borderTop: "1px solid #e0e0e0",
                                  color: "#ef4444",
                                }}
                              >
                                ₹{sal.totalDeductions.toLocaleString("en-IN")}
                                .00
                              </td>
                              <td
                                style={{
                                  ...s.psTd,
                                  borderTop: "1px solid #e0e0e0",
                                }}
                              ></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Net Payable Bar */}
                    <div style={s.psNetBar}>
                      <span style={{ fontWeight: "700" }}>
                        | Total Net Payable{" "}
                        <span style={{ color: "#16a34a" }}>
                          ₹{sal.netSalary.toLocaleString("en-IN")}.00
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          marginLeft: "8px",
                        }}
                      >
                        ({numberToWords(sal.netSalary)} Only)
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginBottom: "10px",
                      }}
                    >
                      **Total Net Payable = Gross Earnings - Total Deductions
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#aaa",
                        paddingTop: "10px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      -- This is a system-generated document. --
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
                gap: "10px",
                marginBottom: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
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
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fc" }}>
                      {[
                        "Employee",
                        "Period",
                        "Gross",
                        "Deductions",
                        "Net Salary",
                        "Status",
                        "Generated By",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 14px",
                            fontSize: "10.5px",
                            color: "#9ca3af",
                            fontWeight: "700",
                            textAlign: "left",
                            borderBottom: "1px solid #e5e7f0",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payslipHistory.map((ps) => {
                      const hSal = calcFromHistory(ps);
                      const empInfo =
                        employees.find((e) => e.id === ps.employeeId) || {};
                      return (
                        <tr
                          key={ps.id}
                          style={{ borderBottom: "1px solid #f1f3f9" }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div
                              style={{ fontWeight: "600", color: "#0f1117" }}
                            >
                              {ps.employeeName}
                            </div>
                          </td>
                          <td
                            style={{ padding: "12px 14px", fontSize: "13px" }}
                          >
                            {MONTHS[(ps.month || 1) - 1]} {ps.year}
                          </td>
                          <td
                            style={{ padding: "12px 14px", fontSize: "13px" }}
                          >
                            ₹
                            {Number(ps.grossSalary || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              color: "#ef4444",
                            }}
                          >
                            ₹
                            {Number(ps.totalDeductions || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontWeight: "800",
                              color: "#10b981",
                              fontSize: "14px",
                            }}
                          >
                            ₹{Number(ps.netSalary || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <select
                              style={{
                                background: getStatusStyle(ps.status).bg,
                                color: getStatusStyle(ps.status).color,
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                outline: "none",
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
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "11.5px",
                              color: "#6b7280",
                            }}
                          >
                            {ps.generatedBy || "System"}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={{
                                  background: "#eef2ff",
                                  color: "#6366f1",
                                  border: "none",
                                  borderRadius: "7px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                }}
                                onClick={() => setEditModal({ ...ps })}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                style={{
                                  background: "#f0fdf4",
                                  color: "#10b981",
                                  border: "none",
                                  borderRadius: "7px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  printPayslip(
                                    { ...ps, ...empInfo },
                                    hSal,
                                    ps.month,
                                    ps.year,
                                    ps,
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

        {/* All Employees */}
        {activeTab === "all" && (
          <div
            style={{
              background: "#fff",
              margin: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7f0",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fc" }}>
                  {[
                    "Employee",
                    "ID",
                    "Dept",
                    "Basic",
                    "Gross",
                    "Deductions",
                    "Net Salary",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 14px",
                        fontSize: "10.5px",
                        color: "#9ca3af",
                        fontWeight: "700",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7f0",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const es = calcSalary(emp);
                  return (
                    <tr
                      key={emp.id}
                      style={{ borderBottom: "1px solid #f1f3f9" }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "9px",
                              background: avatarColors[emp.role] || "#6366f1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#fff",
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
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        {emp.employeeId || emp.employee_id || "TN00" + emp.id}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        {emp.department || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        ₹{es.basic.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        ₹{es.grossSalary.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#ef4444",
                        }}
                      >
                        ₹{es.totalDeductions.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: "800",
                          color: "#10b981",
                          fontSize: "14px",
                        }}
                      >
                        ₹{es.netSalary.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              border: "none",
                              borderRadius: "7px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveTab("generate");
                            }}
                          >
                            Generate
                          </button>
                          <button
                            style={{
                              background: "#f0fdf4",
                              color: "#10b981",
                              border: "none",
                              borderRadius: "7px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              printPayslip(emp, calcSalary(emp), month, year, {
                                workingDays: 26,
                                presentDays: 26,
                                lopDays: 0,
                              })
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

        {/* Summary */}
        {activeTab === "summary" && (
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "14px",
              }}
            >
              {[
                {
                  icon: "👥",
                  label: "Total Employees",
                  val: employees.length,
                  color: "#6366f1",
                },
                {
                  icon: "💰",
                  label: "Total Net Payroll",
                  val: `₹${(totalPayroll / 100000).toFixed(1)}L`,
                  color: "#10b981",
                },
                {
                  icon: "📊",
                  label: "Average Salary",
                  val: `₹${employees.length > 0 ? Math.round(totalPayroll / employees.length).toLocaleString("en-IN") : "0"}`,
                  color: "#f59e0b",
                },
                {
                  icon: "📉",
                  label: "Total Deductions",
                  val: `₹${(employees.reduce((s, e) => s + calcSalary(e).totalDeductions, 0) / 100000).toFixed(1)}L`,
                  color: "#ef4444",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7f0",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                    {c.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: c.color,
                      letterSpacing: "-1px",
                    }}
                  >
                    {c.val}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7f0",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f1117",
                  marginBottom: "14px",
                }}
              >
                Department-wise — {MONTHS[month - 1]} {year}
              </div>
              {["Management", "Recruitment", "Sales", "HR", "Operations"].map(
                (dept) => {
                  const de = employees.filter((e) => e.department === dept);
                  if (!de.length) return null;
                  const dt = de.reduce(
                    (s, e) => s + calcSalary(e).netSalary,
                    0,
                  );
                  return (
                    <div
                      key={dept}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: "1px solid #f1f3f9",
                      }}
                    >
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
    width: "320px",
    minWidth: "320px",
    overflowY: "auto",
    padding: "14px",
    borderRight: "1px solid #e5e7f0",
    background: "#fff",
  },
  formCard: {
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "12px",
  },
  empItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: "9px",
    cursor: "pointer",
    border: "1.5px solid #e5e7f0",
    background: "#fff",
    marginBottom: "4px",
  },
  empItemActive: { border: "1.5px solid #6366f1", background: "#eef2ff" },
  empAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  empName: { fontSize: "12.5px", fontWeight: "700", color: "#0f1117" },
  empRole: { fontSize: "10.5px", color: "#9ca3af", marginTop: "1px" },
  empSalary: { fontSize: "12px", fontWeight: "800", color: "#10b981" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  fg: {
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
    background: "#f0f0f0",
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
  // Exact payslip preview styles
  payslipPreview: {
    background: "#fff",
    maxWidth: "720px",
    margin: "0 auto",
    padding: "28px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    fontFamily: "'Inter',Arial,sans-serif",
  },
  psCompanyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: "14px",
    borderBottom: "1px solid #e0e0e0",
    marginBottom: "16px",
  },
  psCompanyName: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  psCompanyAddr: {
    fontSize: "11px",
    color: "#888",
    marginTop: "3px",
    lineHeight: "1.5",
  },
  psMonthTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
  },
  psSumTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "10px",
  },
  psSummaryLayout: { display: "flex", gap: "16px", marginBottom: "20px" },
  psInfoRow: { display: "flex", marginBottom: "6px" },
  psInfoLabel: {
    width: "130px",
    fontSize: "11px",
    color: "#888",
    flexShrink: 0,
  },
  psInfoVal: { fontSize: "11px", color: "#1a1a1a", fontWeight: "600" },
  psNetBox: {
    width: "200px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "14px",
    textAlign: "center",
    flexShrink: 0,
  },
  psNetBoxLabel: { fontSize: "11px", color: "#888", marginBottom: "6px" },
  psNetBoxAmt: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: "6px",
  },
  psNetBoxDays: { fontSize: "10.5px", color: "#666" },
  psTwoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  psTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
  },
  psTh: {
    background: "#f5f5f5",
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "#333",
    borderBottom: "1px solid #e0e0e0",
  },
  psTd: {
    padding: "7px 10px",
    fontSize: "11.5px",
    color: "#333",
    borderBottom: "1px solid #f0f0f0",
  },
  psNetBar: {
    background: "#f0fdf4",
    borderLeft: "4px solid #22c55e",
    padding: "12px 14px",
    borderRadius: "0 6px 6px 0",
    marginBottom: "8px",
    fontSize: "13px",
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
    fontSize: "32px",
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
  // Modal
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
    width: "520px",
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
