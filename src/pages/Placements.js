import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = "http://localhost:8080/api";

const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Placements");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

function Placements() {
  const [placements, setPlacements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("candidateName");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({
    candidateName: "",
    jobTitle: "",
    clientCompany: "",
    startDate: "",
    salary: "",
    commission: "",
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    fetchPlacements();
  }, []);
  const fetchPlacements = () =>
    axios
      .get(`${BASE_URL}/placements`)
      .then((res) => setPlacements(res.data))
      .catch(() => {});

  const filtered =
    filterStatus === "All"
      ? placements
      : placements.filter((p) => p.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem)
      await axios.put(`${BASE_URL}/placements/${editItem.id}`, form);
    else await axios.post(`${BASE_URL}/placements`, form);
    setShowModal(false);
    setEditItem(null);
    setForm({
      candidateName: "",
      jobTitle: "",
      clientCompany: "",
      startDate: "",
      salary: "",
      commission: "",
      status: "Active",
      notes: "",
    });
    fetchPlacements();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this placement?")) {
      await axios.delete(`${BASE_URL}/placements/${id}`);
      fetchPlacements();
    }
  };
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === paginated.length && paginated.length > 0
        ? []
        : paginated.map((p) => p.id),
    );
  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };
  const handleFilter = (status) => {
    setFilterStatus(status);
    setPage(1);
    setSelected([]);
  };

  const handleExport = () => {
    const data = filtered.map((p) => ({
      "Candidate Name": p.candidateName || "",
      "Job Title": p.jobTitle || "",
      "Client Company": p.clientCompany || "",
      "Start Date": p.startDate || "",
      "Salary (₹)": p.salary || "",
      "Commission (₹)": p.commission || "",
      Status: p.status || "",
      Notes: p.notes || "",
    }));
    exportToExcel(data, "TechNext_Placements");
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "Active":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Completed":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Terminated":
        return { bg: "#fef2f2", color: "#ef4444" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const SortArrow = ({ field }) => (
    <span
      style={{
        marginLeft: 3,
        color: sortField === field ? "#6366f1" : "#d1d5db",
        fontSize: 10,
      }}
    >
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const totalSalary = filtered.reduce(
    (sum, p) => sum + (parseFloat(p.salary) || 0),
    0,
  );
  const totalCommission = filtered.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const activePlacements = placements.filter(
    (p) => p.status === "Active",
  ).length;
  const avatarColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#0ea5e9",
  ];
  const getColor = (name) =>
    avatarColors[name ? name.charCodeAt(0) % avatarColors.length : 0];

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Placements</span>
          <span style={s.abCount}>{filtered.length}</span>
        </div>
        <div style={s.abRight}>
          <button
            style={{ ...s.abBtn, ...(filterOpen ? s.abBtnActive : {}) }}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            ⧩ Filter
          </button>
          <div style={{ position: "relative" }}>
            <button
              style={s.abBtn}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              ↕ Sort
            </button>
            {showSortMenu && (
              <div style={s.sortMenu}>
                {[
                  "candidateName",
                  "jobTitle",
                  "clientCompany",
                  "startDate",
                  "status",
                ].map((f) => (
                  <div
                    key={f}
                    style={s.sortMenuItem}
                    onClick={() => handleSort(f)}
                  >
                    {f === "candidateName"
                      ? "Candidate"
                      : f === "jobTitle"
                        ? "Job Title"
                        : f === "clientCompany"
                          ? "Company"
                          : f === "startDate"
                            ? "Start Date"
                            : "Status"}
                    {sortField === f && (
                      <span style={{ marginLeft: 6, color: "#6366f1" }}>
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button style={s.exportBtn} onClick={handleExport}>
            ⬇ Export
          </button>
          <div style={s.abDivider} />
          <button
            style={s.createBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                candidateName: "",
                jobTitle: "",
                clientCompany: "",
                startDate: "",
                salary: "",
                commission: "",
                status: "Active",
                notes: "",
              });
              setShowModal(true);
            }}
          >
            + Add Placement
          </button>
        </div>
      </div>

      <div style={s.kpiRow}>
        <div style={{ ...s.kpiCard, borderTop: "3px solid #6366f1" }}>
          <div style={s.kpiTop}>
            <span style={{ ...s.kpiIcon, background: "#eef2ff" }}>🏆</span>
          </div>
          <div style={s.kpiVal}>{placements.length}</div>
          <div style={s.kpiLabel}>Total Placements</div>
          <div style={{ ...s.kpiSub, color: "#10b981" }}>
            ↑ {activePlacements} Active
          </div>
        </div>
        <div style={{ ...s.kpiCard, borderTop: "3px solid #10b981" }}>
          <div style={s.kpiTop}>
            <span style={{ ...s.kpiIcon, background: "#f0fdf4" }}>✅</span>
          </div>
          <div style={{ ...s.kpiVal, color: "#10b981" }}>
            {activePlacements}
          </div>
          <div style={s.kpiLabel}>Active Placements</div>
          <div style={s.kpiSub}>Currently working</div>
        </div>
        <div style={{ ...s.kpiCard, borderTop: "3px solid #f59e0b" }}>
          <div style={s.kpiTop}>
            <span style={{ ...s.kpiIcon, background: "#fffbeb" }}>💰</span>
          </div>
          <div style={s.kpiVal}>₹{(totalSalary / 100000).toFixed(1)}L</div>
          <div style={s.kpiLabel}>Total Salary Value</div>
          <div style={s.kpiSub}>All placements</div>
        </div>
        <div style={{ ...s.kpiCard, borderTop: "3px solid #8b5cf6" }}>
          <div style={s.kpiTop}>
            <span style={{ ...s.kpiIcon, background: "#f5f3ff" }}>🎯</span>
          </div>
          <div style={{ ...s.kpiVal, color: "#8b5cf6" }}>
            ₹{(totalCommission / 100000).toFixed(1)}L
          </div>
          <div style={s.kpiLabel}>Total Commission</div>
          <div style={s.kpiSub}>Revenue earned</div>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSearch}>
              <input
                style={s.fpSearchInput}
                placeholder="🔍 Search placements..."
              />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STATUS</div>
              {["All", "Active", "Completed", "Terminated"].map((st) => (
                <div
                  key={st}
                  style={{
                    ...s.fpItem,
                    ...(filterStatus === st ? s.fpItemActive : {}),
                  }}
                  onClick={() => handleFilter(st)}
                >
                  <input
                    type="checkbox"
                    checked={filterStatus === st}
                    onChange={() => handleFilter(st)}
                    style={{ marginRight: 8, cursor: "pointer" }}
                  />
                  <span
                    style={{
                      ...s.fpLabel,
                      ...(filterStatus === st
                        ? { color: "#6366f1", fontWeight: 700 }
                        : {}),
                    }}
                  >
                    {st === "All" ? "All Placements" : st}
                  </span>
                  <span style={s.fpCount}>
                    {st === "All"
                      ? placements.length
                      : placements.filter((p) => p.status === st).length}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>SUMMARY</div>
              <div style={s.fpStat}>
                <span>Active</span>
                <strong style={{ color: "#10b981" }}>{activePlacements}</strong>
              </div>
              <div style={s.fpStat}>
                <span>Completed</span>
                <strong style={{ color: "#3b82f6" }}>
                  {placements.filter((p) => p.status === "Completed").length}
                </strong>
              </div>
              <div style={s.fpStat}>
                <span>Commission</span>
                <strong style={{ color: "#8b5cf6" }}>
                  ₹{(totalCommission / 100000).toFixed(1)}L
                </strong>
              </div>
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>
              {filtered.length} placements · ₹
              {(totalCommission / 100000).toFixed(1)}L commission
            </span>
            <div style={s.pgRight}>
              <button
                style={{ ...s.pgBtn, ...(page === 1 ? s.pgBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ◀
              </button>
              <span style={s.pgInfo}>
                {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)}
              </span>
              <button
                style={{
                  ...s.pgBtn,
                  ...(page === totalPages || totalPages === 0
                    ? s.pgBtnDisabled
                    : {}),
                }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                ▶
              </button>
            </div>
          </div>

          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.thCheck}>
                  <input
                    type="checkbox"
                    checked={
                      selected.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("candidateName")}
                >
                  Candidate <SortArrow field="candidateName" />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("jobTitle")}
                >
                  Job Title <SortArrow field="jobTitle" />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("clientCompany")}
                >
                  Client Company <SortArrow field="clientCompany" />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("startDate")}
                >
                  Start Date <SortArrow field="startDate" />
                </th>
                <th style={s.th}>Salary</th>
                <th style={s.th}>Commission</th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("status")}
                >
                  Status <SortArrow field="status" />
                </th>
                <th style={s.thIcon}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={s.emptyCell}>
                    <div style={s.emptyWrap}>
                      <div style={{ fontSize: "40px" }}>🏆</div>
                      <div style={s.emptyTitle}>No placements yet</div>
                      <div style={s.emptySub}>Add your first placement</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const b = getStatusBadge(p.status);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        ...s.trow,
                        ...(selected.includes(p.id) ? s.trowSelected : {}),
                      }}
                    >
                      <td style={s.tdCheck}>
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={s.td}>
                        <div style={s.nameCell}>
                          <div
                            style={{
                              ...s.nameAvatar,
                              background: getColor(p.candidateName),
                            }}
                          >
                            {p.candidateName
                              ? p.candidateName.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span
                            style={s.nameText}
                            onClick={() => handleEdit(p)}
                          >
                            {p.candidateName}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>{p.jobTitle || "—"}</td>
                      <td style={s.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>🏢</span>
                          {p.clientCompany || "—"}
                        </div>
                      </td>
                      <td style={s.td}>{p.startDate || "—"}</td>
                      <td
                        style={{ ...s.td, fontWeight: "700", color: "#0f1117" }}
                      >
                        {p.salary
                          ? `₹${parseFloat(p.salary).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: "700", color: "#8b5cf6" }}
                      >
                        {p.commission
                          ? `₹${parseFloat(p.commission).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: b.bg,
                            color: b.color,
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button
                            style={s.editBtn}
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Placement" : "Add Placement"}
                </div>
                <div style={s.modalSub}>Placement details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Candidate Name *</label>
                  <input
                    style={s.input}
                    value={form.candidateName}
                    onChange={(e) =>
                      setForm({ ...form, candidateName: e.target.value })
                    }
                    required
                    placeholder="Candidate name"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Job Title</label>
                  <input
                    style={s.input}
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm({ ...form, jobTitle: e.target.value })
                    }
                    placeholder="e.g. React Developer"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Client Company</label>
                  <input
                    style={s.input}
                    value={form.clientCompany}
                    onChange={(e) =>
                      setForm({ ...form, clientCompany: e.target.value })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Start Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Salary (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                    placeholder="e.g. 850000"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Commission (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.commission}
                    onChange={(e) =>
                      setForm({ ...form, commission: e.target.value })
                    }
                    placeholder="e.g. 85000"
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Terminated</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  {editItem ? "Update" : "Save Placement"}
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
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    gap: "8px",
  },
  abLeft: { display: "flex", alignItems: "center", gap: "10px" },
  abTitle: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  abCount: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  abRight: { display: "flex", alignItems: "center", gap: "6px" },
  abBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
  },
  abBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
  },
  exportBtn: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    color: "#10b981",
    cursor: "pointer",
    fontWeight: "600",
  },
  abDivider: {
    width: "1px",
    height: "24px",
    background: "#e5e7f0",
    margin: "0 6px",
  },
  createBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
    padding: "16px 20px",
    background: "#f8f9fc",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  kpiTop: { marginBottom: "12px" },
  kpiIcon: {
    fontSize: "20px",
    padding: "8px",
    borderRadius: "10px",
    display: "inline-block",
  },
  kpiVal: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  kpiLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "600",
    marginTop: "4px",
  },
  kpiSub: { fontSize: "11px", color: "#9ca3af", marginTop: "3px" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  filterPanel: {
    width: "230px",
    minWidth: "230px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "16px 0",
  },
  fpHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "0 16px 12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpSearch: { padding: "0 12px 12px" },
  fpSearchInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8f9fc",
  },
  fpSection: { marginBottom: "8px", padding: "0 8px" },
  fpSectionTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "6px 8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpItem: {
    display: "flex",
    alignItems: "center",
    padding: "7px 8px",
    cursor: "pointer",
    borderRadius: "8px",
    userSelect: "none",
    gap: "6px",
  },
  fpItemActive: { background: "#eef2ff" },
  fpLabel: { flex: 1, fontSize: "13px", color: "#374151", fontWeight: "500" },
  fpCount: {
    fontSize: "11px",
    color: "#9ca3af",
    background: "#f1f3f9",
    padding: "1px 8px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  fpDivider: { height: "1px", background: "#f1f3f9", margin: "12px 0" },
  fpStat: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 8px",
    fontSize: "12.5px",
    color: "#6b7280",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #f1f3f9",
  },
  pgTotal: { fontSize: "12.5px", color: "#6b7280", fontWeight: "500" },
  pgRight: { display: "flex", alignItems: "center", gap: "8px" },
  pgBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "11px",
    cursor: "pointer",
    color: "#6b7280",
  },
  pgBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pgInfo: { fontSize: "12px", color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#f8f9fc" },
  thCheck: {
    padding: "12px 10px 12px 20px",
    borderBottom: "1px solid #e5e7f0",
  },
  th: {
    padding: "11px 14px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  thIcon: {
    padding: "11px 14px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    borderBottom: "1px solid #e5e7f0",
  },
  trow: { borderBottom: "1px solid #f1f3f9", transition: "background 0.1s" },
  trowSelected: { background: "#fafbff" },
  tdCheck: { padding: "12px 10px 12px 20px" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  nameAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  nameText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    cursor: "pointer",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
  actions: { display: "flex", gap: "6px" },
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
  emptyCell: { padding: "60px", textAlign: "center" },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyTitle: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af" },
  sortMenu: {
    position: "absolute",
    top: "36px",
    left: 0,
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 100,
    minWidth: "160px",
  },
  sortMenuItem: {
    padding: "9px 14px",
    fontSize: "12.5px",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
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
    flexShrink: 0,
  },
  modalBody: { padding: "24px" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
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

export default Placements;
