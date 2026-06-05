import React, { useState, useEffect } from "react";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../services/api";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const ALL_USERS = [
  { id: 1, name: "Admin User", role: "Admin" },
  { id: 2, name: "Ria Kapoor", role: "Recruiter" },
  { id: 3, name: "Sam Pillai", role: "Sales" },
  { id: 4, name: "Dev Malhotra", role: "Recruiter" },
  { id: 5, name: "Priya Nair", role: "HR Manager" },
  { id: 6, name: "Ravi Kumar", role: "Staff" },
  { id: 7, name: "Meena Raj", role: "Staff" },
];

function PeoplePicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = ALL_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (user) => {
    const exists = selected.find((s) => s.id === user.id);
    if (exists) onChange(selected.filter((s) => s.id !== user.id));
    else onChange([...selected, user]);
  };

  const getRoleColor = (role) => {
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

  return (
    <div style={{ position: "relative" }}>
      {/* Selected chips */}
      <div style={pp.chipBox} onClick={() => setOpen(!open)}>
        {selected.length === 0 && (
          <span style={pp.placeholder}>Click to add participants...</span>
        )}
        {selected.map((u) => (
          <div key={u.id} style={pp.chip}>
            <div style={pp.chipAvatar}>{u.name.charAt(0)}</div>
            <span style={pp.chipName}>{u.name}</span>
            <span
              style={pp.chipRemove}
              onClick={(e) => {
                e.stopPropagation();
                toggle(u);
              }}
            >
              ✕
            </span>
          </div>
        ))}
        <span style={pp.addIcon}>+</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={pp.dropdown}>
          <div style={pp.searchWrap}>
            <span style={{ fontSize: "13px" }}>🔍</span>
            <input
              style={pp.searchInput}
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={pp.list}>
            {filtered.map((u) => {
              const isSelected = selected.find((s) => s.id === u.id);
              const rc = getRoleColor(u.role);
              return (
                <div
                  key={u.id}
                  style={{
                    ...pp.userRow,
                    ...(isSelected ? pp.userRowSelected : {}),
                  }}
                  onClick={() => toggle(u)}
                >
                  <div style={pp.userAvatar}>{u.name.charAt(0)}</div>
                  <div style={pp.userInfo}>
                    <div style={pp.userName}>{u.name}</div>
                    <span
                      style={{
                        ...pp.userRole,
                        background: rc.bg,
                        color: rc.color,
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                  {isSelected && <span style={pp.check}>✓</span>}
                </div>
              );
            })}
          </div>
          <div style={pp.footer}>
            <button style={pp.doneBtn} onClick={() => setOpen(false)}>
              Done ({selected.length} selected)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const pp = {
  chipBox: {
    minHeight: "42px",
    border: "1.5px solid #e5e7f0",
    borderRadius: "9px",
    padding: "6px 10px",
    background: "#f8f9fc",
    cursor: "pointer",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
  },
  placeholder: { fontSize: "13px", color: "#9ca3af" },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "20px",
    padding: "3px 8px 3px 4px",
  },
  chipAvatar: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700",
    color: "#fff",
  },
  chipName: { fontSize: "12px", fontWeight: "600", color: "#1d4ed8" },
  chipRemove: {
    fontSize: "10px",
    color: "#93c5fd",
    cursor: "pointer",
    marginLeft: "2px",
  },
  addIcon: { fontSize: "16px", color: "#9ca3af", marginLeft: "auto" },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7f0",
    zIndex: 9999,
    overflow: "hidden",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f3f9",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f1117",
    width: "100%",
    fontFamily: "inherit",
  },
  list: { maxHeight: "220px", overflowY: "auto" },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  userRowSelected: { background: "#fafbff" },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: "13px", fontWeight: "600", color: "#0f1117" },
  userRole: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "20px",
    display: "inline-block",
    marginTop: "2px",
  },
  check: { color: "#6366f1", fontWeight: "700", fontSize: "14px" },
  footer: { padding: "10px 14px", borderTop: "1px solid #f1f3f9" },
  doneBtn: {
    width: "100%",
    padding: "8px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({
    title: "",
    meetingDate: "",
    meetingTime: "",
    duration: "1 hour",
    location: "",
    agenda: "",
    status: "Upcoming",
  });

  useEffect(() => {
    fetchMeetings();
  }, []);
  const fetchMeetings = () =>
    getMeetings()
      .then((res) => setMeetings(res.data))
      .catch(() => {});

  const filtered =
    filterStatus === "All"
      ? meetings
      : meetings.filter((m) => m.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      participants: participants.map((p) => p.name).join(", "),
    };
    if (editItem) await updateMeeting(editItem.id, payload);
    else await createMeeting(payload);
    setShowModal(false);
    setEditItem(null);
    setForm({
      title: "",
      meetingDate: "",
      meetingTime: "",
      duration: "1 hour",
      location: "",
      agenda: "",
      status: "Upcoming",
    });
    setParticipants([]);
    fetchMeetings();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    // Parse participants back from string
    if (item.participants) {
      const names = item.participants.split(",").map((n) => n.trim());
      const matched = ALL_USERS.filter((u) => names.includes(u.name));
      setParticipants(matched);
    } else {
      setParticipants([]);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this meeting?")) {
      await deleteMeeting(id);
      fetchMeetings();
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
        : paginated.map((m) => m.id),
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

  const getStatusBadge = (st) => {
    switch (st) {
      case "Upcoming":
        return { background: "#f0fdf4", color: "#10b981" };
      case "Completed":
        return { background: "#f9fafb", color: "#6b7280" };
      case "Cancelled":
        return { background: "#fef2f2", color: "#ef4444" };
      default:
        return { background: "#eff6ff", color: "#3b82f6" };
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

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>All Meetings</span>
          <span style={s.abDots}>⋯</span>
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
                {["title", "meetingDate", "status"].map((f) => (
                  <div
                    key={f}
                    style={s.sortMenuItem}
                    onClick={() => handleSort(f)}
                  >
                    {f === "meetingDate"
                      ? "Date"
                      : f.charAt(0).toUpperCase() + f.slice(1)}
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
              ...(viewMode === "card" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("card")}
          >
            ⊞
          </button>
          <div style={s.abDivider} />
          <button
            style={s.createBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                title: "",
                meetingDate: "",
                meetingTime: "",
                duration: "1 hour",
                location: "",
                agenda: "",
                status: "Upcoming",
              });
              setParticipants([]);
              setShowModal(true);
            }}
          >
            Schedule Meeting
          </button>
          <button style={s.createArrow}>▾</button>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpTitle}>Filter Meetings by</div>
            <div style={s.fpSearch}>
              <input style={s.fpSearchInput} placeholder="Search" />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>▾ By Status</div>
              <div style={s.fpSectionItems}>
                {["All", "Upcoming", "Completed", "Cancelled"].map((st) => (
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
                          ? { color: "#6366f1", fontWeight: 600 }
                          : {}),
                      }}
                    >
                      {st === "All" ? "All Meetings" : st}
                    </span>
                    <span style={s.fpCount}>
                      {st === "All"
                        ? meetings.length
                        : meetings.filter((m) => m.status === st).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>Total Records {filtered.length}</span>
            <div style={s.pgRight}>
              <button
                style={{ ...s.pgBtn, ...(page === 1 ? s.pgBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ◀
              </button>
              <span style={s.pgInfo}>
                {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to{" "}
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
                  <th style={s.th}></th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("title")}
                  >
                    Title <SortArrow field="title" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("meetingDate")}
                  >
                    Date <SortArrow field="meetingDate" />
                  </th>
                  <th style={s.th}>Time</th>
                  <th style={s.th}>Participants</th>
                  <th style={s.th}>Location</th>
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
                      No meetings found. Click "Schedule Meeting" to add one!
                    </td>
                  </tr>
                ) : (
                  paginated.map((m) => (
                    <tr
                      key={m.id}
                      style={{
                        ...s.trow,
                        ...(selected.includes(m.id) ? s.trowSelected : {}),
                      }}
                    >
                      <td style={s.tdCheck}>
                        <input
                          type="checkbox"
                          checked={selected.includes(m.id)}
                          onChange={() => toggleSelect(m.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={s.td}>
                        <span style={s.rowAction} onClick={() => handleEdit(m)}>
                          ✏️
                        </span>
                      </td>
                      <td style={s.tdLink} onClick={() => handleEdit(m)}>
                        {m.title}
                      </td>
                      <td style={s.td}>{m.meetingDate || "—"}</td>
                      <td style={s.td}>{m.meetingTime || "—"}</td>
                      <td style={s.td}>
                        {m.participants ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            {m.participants.split(",").map((p, i) => (
                              <span key={i} style={s.participantChip}>
                                {p.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={s.td}>{m.location || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{ ...s.badge, ...getStatusBadge(m.status) }}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={() => handleEdit(m)}>
                          Edit
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(m.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {viewMode === "card" && (
            <div style={s.cardGrid}>
              {filtered.length === 0 ? (
                <div style={s.emptyCell}>No meetings found</div>
              ) : (
                filtered.map((m) => (
                  <div
                    key={m.id}
                    style={s.meetCard}
                    onClick={() => handleEdit(m)}
                  >
                    <div style={s.meetCardTop}>
                      <div style={s.meetDateBox}>
                        <div style={s.meetMonth}>
                          {m.meetingDate
                            ? new Date(m.meetingDate).toLocaleString(
                                "default",
                                { month: "short" },
                              )
                            : "--"}
                        </div>
                        <div style={s.meetDay}>
                          {m.meetingDate
                            ? new Date(m.meetingDate).getDate()
                            : "--"}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={s.meetTitle}>{m.title}</div>
                        <div style={s.meetMeta}>
                          🕐 {m.meetingTime || "--"} · {m.duration}
                        </div>
                        <div style={s.meetMeta}>📍 {m.location || "TBD"}</div>
                      </div>
                      <span style={{ ...s.badge, ...getStatusBadge(m.status) }}>
                        {m.status}
                      </span>
                    </div>
                    {m.participants && (
                      <div style={s.meetParticipants}>
                        <span style={s.meetParticipantsLabel}>
                          👥 Participants:
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                            marginTop: "4px",
                          }}
                        >
                          {m.participants.split(",").map((p, i) => (
                            <span key={i} style={s.participantChip}>
                              {p.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.agenda && <div style={s.meetAgenda}>{m.agenda}</div>}
                    <div style={s.meetCardActions}>
                      <button
                        style={s.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(m);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={s.delBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={s.modalTitle}>
                {editItem ? "Edit Meeting" : "Schedule Meeting"}
              </span>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Meeting Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Q2 Review Meeting"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.meetingDate}
                    onChange={(e) =>
                      setForm({ ...form, meetingDate: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Time</label>
                  <input
                    style={s.input}
                    type="time"
                    value={form.meetingTime}
                    onChange={(e) =>
                      setForm({ ...form, meetingTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Duration</label>
                  <select
                    style={s.input}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  >
                    <option>30 min</option>
                    <option>1 hour</option>
                    <option>1.5 hours</option>
                    <option>2 hours</option>
                    <option>3 hours</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Upcoming</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Location / Link</label>
                <input
                  style={s.input}
                  value={form.location}
                  placeholder="Google Meet / Office / Zoom Link"
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>
                  👥 Participants — Add Team Members
                </label>
                <PeoplePicker
                  selected={participants}
                  onChange={setParticipants}
                />
                {participants.length > 0 && (
                  <div style={s.participantsCount}>
                    {participants.length} participant
                    {participants.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Agenda</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder="What will be discussed?"
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
                  {editItem ? "Update Meeting" : "Schedule Meeting"}
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
  },
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "8px",
  },
  abLeft: { display: "flex", alignItems: "center", gap: "8px" },
  abTitle: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  abDots: { color: "#9ca3af", cursor: "pointer" },
  abRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexWrap: "wrap",
  },
  abBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
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
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
  },
  abViewActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
  },
  abDivider: {
    width: "1px",
    height: "20px",
    background: "#e5e7f0",
    margin: "0 4px",
  },
  createBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "7px 0 0 7px",
    padding: "7px 14px",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  createArrow: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderLeft: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "0 7px 7px 0",
    padding: "7px 8px",
    fontSize: "11px",
    cursor: "pointer",
  },
  sortMenu: {
    position: "absolute",
    top: "32px",
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
  body: { display: "flex", flex: 1, overflow: "hidden" },
  filterPanel: {
    width: "220px",
    minWidth: "220px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "14px 0",
  },
  fpTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#0f1117",
    padding: "0 14px 10px",
  },
  fpSearch: { padding: "0 10px 10px" },
  fpSearchInput: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "7px",
    border: "1px solid #e5e7f0",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },
  fpSection: { marginBottom: "8px" },
  fpSectionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    padding: "6px 14px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  fpSectionItems: { padding: "0 10px" },
  fpItem: {
    display: "flex",
    alignItems: "center",
    padding: "7px 8px",
    cursor: "pointer",
    borderRadius: "7px",
    userSelect: "none",
  },
  fpItemActive: { background: "#eef2ff" },
  fpLabel: { flex: 1, fontSize: "12.5px", color: "#374151" },
  fpCount: {
    fontSize: "11px",
    color: "#9ca3af",
    background: "#f1f3f9",
    padding: "1px 7px",
    borderRadius: "10px",
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
    padding: "8px 16px",
    background: "#fff",
    borderBottom: "1px solid #f1f3f9",
  },
  pgTotal: { fontSize: "12px", color: "#6b7280", fontWeight: "500" },
  pgRight: { display: "flex", alignItems: "center", gap: "6px" },
  pgBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "5px",
    padding: "3px 8px",
    fontSize: "11px",
    cursor: "pointer",
    color: "#6b7280",
  },
  pgBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pgInfo: { fontSize: "12px", color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#f8f9fc" },
  thCheck: { padding: "10px 8px 10px 16px", borderBottom: "1px solid #e5e7f0" },
  th: {
    padding: "10px 12px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    whiteSpace: "nowrap",
  },
  thIcon: {
    padding: "10px 12px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    borderBottom: "1px solid #e5e7f0",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f8fafc", transition: "background 0.1s" },
  trowSelected: { background: "#eef2ff" },
  tdCheck: { padding: "10px 8px 10px 16px" },
  td: { padding: "10px 12px", fontSize: "12.5px", color: "#374151" },
  tdLink: {
    padding: "10px 12px",
    fontSize: "12.5px",
    color: "#6366f1",
    fontWeight: "600",
    cursor: "pointer",
  },
  rowAction: { cursor: "pointer", fontSize: "13px", opacity: 0.6 },
  badge: {
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  participantChip: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "6px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: "4px",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "6px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyCell: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
    gap: "14px",
    padding: "16px",
  },
  meetCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  meetCardTop: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  meetDateBox: {
    minWidth: "46px",
    textAlign: "center",
    background: "#f1f3f9",
    borderRadius: "10px",
    padding: "8px 6px",
  },
  meetMonth: {
    fontSize: "9px",
    textTransform: "uppercase",
    color: "#6b7280",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  meetDay: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f1117",
    lineHeight: 1,
  },
  meetTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "4px",
  },
  meetMeta: { fontSize: "11.5px", color: "#6b7280", marginBottom: "2px" },
  meetParticipants: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #f1f3f9",
  },
  meetParticipantsLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "600",
  },
  meetAgenda: {
    fontSize: "12px",
    color: "#9ca3af",
    borderTop: "1px solid #f1f3f9",
    paddingTop: "8px",
    marginTop: "8px",
  },
  meetCardActions: { display: "flex", gap: "6px", marginTop: "10px" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 998,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "560px",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "18px 22px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  modalTitle: { fontSize: "16px", fontWeight: "700", color: "#0f1117" },
  closeBtn: {
    background: "#f1f3f9",
    border: "none",
    borderRadius: "8px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
  },
  modalBody: { padding: "22px" },
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
    padding: "9px 12px",
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
  participantsCount: {
    fontSize: "11px",
    color: "#6366f1",
    fontWeight: "600",
    marginTop: "5px",
  },
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #e5e7f0",
    marginTop: "6px",
  },
  cancelBtn: {
    background: "#fff",
    color: "#6b7280",
    border: "1px solid #e5e7f0",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
};

export default Meetings;
