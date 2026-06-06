import React, { useState, useEffect } from "react";
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidates");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [filterStage, setFilterStage] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({
    name: "",
    currentRole: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    location: "",
    stage: "Available",
  });

  useEffect(() => {
    fetchCandidates();
  }, []);
  const fetchCandidates = () =>
    getCandidates()
      .then((res) => setCandidates(res.data))
      .catch(() => {});

  const stages = [
    "All",
    "Available",
    "Screened",
    "Interview",
    "Shortlisted",
    "Offered",
    "Placed",
  ];
  const filtered =
    filterStage === "All"
      ? candidates
      : candidates.filter((c) => c.stage === filterStage);
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) await updateCandidate(editItem.id, form);
    else await createCandidate(form);
    setShowModal(false);
    setEditItem(null);
    setForm({
      name: "",
      currentRole: "",
      email: "",
      phone: "",
      skills: "",
      experience: "",
      location: "",
      stage: "Available",
    });
    fetchCandidates();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this candidate?")) {
      await deleteCandidate(id);
      fetchCandidates();
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
        : paginated.map((c) => c.id),
    );
  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };
  const handleFilter = (stage) => {
    setFilterStage(stage);
    setPage(1);
    setSelected([]);
  };

  const handleExport = () => {
    const data = filtered.map((c) => ({
      Name: c.name || "",
      "Current Role": c.currentRole || "",
      Email: c.email || "",
      Phone: c.phone || "",
      Skills: c.skills || "",
      Experience: c.experience || "",
      Location: c.location || "",
      Stage: c.stage || "",
    }));
    exportToExcel(data, "TechNext_Candidates");
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "Placed":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Interview":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "Offered":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "Shortlisted":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Screened":
        return { bg: "#f0f9ff", color: "#0ea5e9" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Placed":
        return "#10b981";
      case "Interview":
        return "#8b5cf6";
      case "Offered":
        return "#f59e0b";
      case "Shortlisted":
        return "#3b82f6";
      case "Screened":
        return "#0ea5e9";
      default:
        return "#6b7280";
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
          <span style={s.abTitle}>Candidates</span>
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
                {["name", "currentRole", "location", "stage", "experience"].map(
                  (f) => (
                    <div
                      key={f}
                      style={s.sortMenuItem}
                      onClick={() => handleSort(f)}
                    >
                      {f === "currentRole"
                        ? "Role"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                      {sortField === f && (
                        <span style={{ marginLeft: 6, color: "#6366f1" }}>
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
          <button
            style={{
              ...s.abViewBtn,
              ...(viewMode === "list" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("list")}
          >
            ☰
          </button>
          <button
            style={{
              ...s.abViewBtn,
              ...(viewMode === "kanban" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("kanban")}
          >
            ⊞
          </button>
          <button style={s.exportBtn} onClick={handleExport}>
            ⬇ Export
          </button>
          <div style={s.abDivider} />
          <button
            style={s.createBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                name: "",
                currentRole: "",
                email: "",
                phone: "",
                skills: "",
                experience: "",
                location: "",
                stage: "Available",
              });
              setShowModal(true);
            }}
          >
            + Add Candidate
          </button>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSearch}>
              <input
                style={s.fpSearchInput}
                placeholder="🔍 Search candidates..."
              />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STAGE</div>
              {stages.map((st) => (
                <div
                  key={st}
                  style={{
                    ...s.fpItem,
                    ...(filterStage === st ? s.fpItemActive : {}),
                  }}
                  onClick={() => handleFilter(st)}
                >
                  <input
                    type="checkbox"
                    checked={filterStage === st}
                    onChange={() => handleFilter(st)}
                    style={{ marginRight: 8, cursor: "pointer" }}
                  />
                  {st !== "All" && (
                    <div
                      style={{ ...s.fpDot, background: getStageColor(st) }}
                    />
                  )}
                  <span
                    style={{
                      ...s.fpLabel,
                      ...(filterStage === st
                        ? { color: "#6366f1", fontWeight: 700 }
                        : {}),
                    }}
                  >
                    {st === "All" ? "All Candidates" : st}
                  </span>
                  <span style={s.fpCount}>
                    {st === "All"
                      ? candidates.length
                      : candidates.filter((c) => c.stage === st).length}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>QUICK STATS</div>
              <div style={s.fpStat}>
                <span>Total</span>
                <strong>{candidates.length}</strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#10b981" }}>✅ Placed</span>
                <strong>
                  {candidates.filter((c) => c.stage === "Placed").length}
                </strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#8b5cf6" }}>🎯 Interview</span>
                <strong>
                  {candidates.filter((c) => c.stage === "Interview").length}
                </strong>
              </div>
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>{filtered.length} candidates</span>
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

          {viewMode === "list" && (
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
                    onClick={() => handleSort("name")}
                  >
                    Name <SortArrow field="name" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("currentRole")}
                  >
                    Current Role <SortArrow field="currentRole" />
                  </th>
                  <th style={s.th}>Skills</th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("experience")}
                  >
                    Experience <SortArrow field="experience" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("location")}
                  >
                    Location <SortArrow field="location" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("stage")}
                  >
                    Stage <SortArrow field="stage" />
                  </th>
                  <th style={s.thIcon}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={s.emptyCell}>
                      <div style={s.emptyWrap}>
                        <div style={{ fontSize: "40px" }}>🪪</div>
                        <div style={s.emptyTitle}>No candidates yet</div>
                        <div style={s.emptySub}>Add your first candidate</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    const b = getStageBadge(c.stage);
                    return (
                      <tr
                        key={c.id}
                        style={{
                          ...s.trow,
                          ...(selected.includes(c.id) ? s.trowSelected : {}),
                        }}
                      >
                        <td style={s.tdCheck}>
                          <input
                            type="checkbox"
                            checked={selected.includes(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={s.td}>
                          <div style={s.nameCell}>
                            <div
                              style={{
                                ...s.nameAvatar,
                                background: getColor(c.name),
                              }}
                            >
                              {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <div
                                style={s.nameText}
                                onClick={() => handleEdit(c)}
                              >
                                {c.name}
                              </div>
                              <div style={s.nameEmail}>{c.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>{c.currentRole || "—"}</td>
                        <td style={s.td}>
                          {c.skills
                            ? c.skills
                                .split(",")
                                .slice(0, 2)
                                .map((sk, i) => (
                                  <span key={i} style={s.skillChip}>
                                    {sk.trim()}
                                  </span>
                                ))
                            : "—"}
                        </td>
                        <td style={s.td}>{c.experience || "—"}</td>
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
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button
                              style={s.editBtn}
                              onClick={() => handleEdit(c)}
                            >
                              Edit
                            </button>
                            <button
                              style={s.delBtn}
                              onClick={() => handleDelete(c.id)}
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
          )}

          {viewMode === "kanban" && (
            <div style={s.kanban}>
              {stages
                .filter((st) => st !== "All")
                .map((stage) => {
                  const stageC = candidates.filter((c) => c.stage === stage);
                  const b = getStageBadge(stage);
                  return (
                    <div key={stage} style={s.kCol}>
                      <div
                        style={{
                          ...s.kHead,
                          borderTop: `3px solid ${getStageColor(stage)}`,
                        }}
                      >
                        <span
                          style={{ ...s.kTitle, color: getStageColor(stage) }}
                        >
                          {stage}
                        </span>
                        <span style={s.kCount}>{stageC.length}</span>
                      </div>
                      {stageC.map((c) => (
                        <div
                          key={c.id}
                          style={s.kCard}
                          onClick={() => handleEdit(c)}
                        >
                          <div style={s.kCardTop}>
                            <div
                              style={{
                                ...s.kAvatar,
                                background: getColor(c.name),
                              }}
                            >
                              {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span
                              style={{
                                ...s.badge,
                                background: b.bg,
                                color: b.color,
                                fontSize: "10px",
                              }}
                            >
                              {c.stage}
                            </span>
                          </div>
                          <div style={s.kName}>{c.name}</div>
                          <div style={s.kRole}>{c.currentRole || "—"}</div>
                          <div style={s.kMeta}>📍 {c.location || "—"}</div>
                          <div style={s.kMeta}>⏱ {c.experience || "—"}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Candidate" : "Add Candidate"}
                </div>
                <div style={s.modalSub}>Candidate profile</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name *</label>
                  <input
                    style={s.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Full name"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Current Role</label>
                  <input
                    style={s.input}
                    value={form.currentRole}
                    onChange={(e) =>
                      setForm({ ...form, currentRole: e.target.value })
                    }
                    placeholder="e.g. React Developer"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input
                    style={s.input}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Phone</label>
                  <input
                    style={s.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Skills</label>
                  <input
                    style={s.input}
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    placeholder="React, Node.js, Python"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Experience</label>
                  <input
                    style={s.input}
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    placeholder="e.g. 3 years"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Location</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Stage</label>
                  <select
                    style={s.input}
                    value={form.stage}
                    onChange={(e) =>
                      setForm({ ...form, stage: e.target.value })
                    }
                  >
                    {stages
                      .filter((st) => st !== "All")
                      .map((st) => (
                        <option key={st}>{st}</option>
                      ))}
                  </select>
                </div>
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
                  {editItem ? "Update" : "Save Candidate"}
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
  abViewBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "14px",
    color: "#6b7280",
    cursor: "pointer",
  },
  abViewActive: {
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
  fpDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
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
  nameText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    cursor: "pointer",
  },
  nameEmail: { fontSize: "11px", color: "#9ca3af", marginTop: "1px" },
  skillChip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "2px 7px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    marginRight: "4px",
    display: "inline-block",
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
  kanban: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    overflowX: "auto",
    alignItems: "flex-start",
  },
  kCol: {
    minWidth: "200px",
    flex: 1,
    background: "#f8f9fc",
    borderRadius: "12px",
    overflow: "hidden",
  },
  kHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 12px 10px",
    background: "#fff",
    marginBottom: "8px",
  },
  kTitle: { fontSize: "12px", fontWeight: "700" },
  kCount: {
    background: "#f1f3f9",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
  },
  kCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "8px",
    cursor: "pointer",
    border: "1px solid #e5e7f0",
    margin: "0 8px 8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  kCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  kAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#fff",
  },
  kName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "2px",
  },
  kRole: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
  kMeta: { fontSize: "11px", color: "#9ca3af", marginBottom: "2px" },
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

export default Candidates;
