import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    title: "",
    agenda: "",
    meetingDate: "",
    duration: "",
    location: "",
    status: "Upcoming",
    attendees: "",
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/meetings`)
      .then((r) => {
        setMeetings(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = meetings.filter((m) => {
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    const matchSearch =
      !searchVal ||
      m.title?.toLowerCase().includes(searchVal.toLowerCase()) ||
      m.attendees?.toLowerCase().includes(searchVal.toLowerCase()) ||
      m.location?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem)
      await axios.put(`${BASE_URL}/meetings/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/meetings`, payload);
    setShowModal(false);
    setEditItem(null);
    setForm({
      title: "",
      agenda: "",
      meetingDate: "",
      duration: "",
      location: "",
      status: "Upcoming",
      attendees: "",
      notes: "",
    });
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete meeting?")) {
      await axios.delete(`${BASE_URL}/meetings/${id}`);
      fetchAll();
    }
  };

  const getStatusStyle = (s) =>
    ({
      Upcoming: { bg: "#f0fdf4", color: "#10b981" },
      Completed: { bg: "#eff6ff", color: "#3b82f6" },
      Cancelled: { bg: "#fef2f2", color: "#ef4444" },
    })[s] || { bg: "#f9fafb", color: "#6b7280" };

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

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Meetings</span>
          <span style={s.count}>{filtered.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search meetings..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {searchVal && (
              <span
                style={{
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "11px",
                }}
                onClick={() => setSearchVal("")}
              >
                ✕
              </span>
            )}
          </div>
          <select
            style={s.filterSel}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                title: "",
                agenda: "",
                meetingDate: "",
                duration: "",
                location: "",
                status: "Upcoming",
                attendees: "",
                notes: "",
              });
              setShowModal(true);
            }}
          >
            + Schedule Meeting
          </button>
        </div>
      </div>
      <div
        style={{
          background: "#fff",
          margin: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7f0",
          overflow: "hidden",
        }}
      >
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {[
                "Title",
                "Date",
                "Duration",
                "Location",
                "Attendees",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    📅
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No meetings found
                  </div>
                  <button style={s.addBtn} onClick={() => setShowModal(true)}>
                    + Schedule Meeting
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((m) => {
                const ss = getStatusStyle(m.status);
                return (
                  <tr key={m.id} style={s.trow}>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#6366f1",
                          cursor: "pointer",
                        }}
                        onClick={() => handleEdit(m)}
                      >
                        {m.title}
                      </div>
                      {m.agenda && (
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {m.agenda.slice(0, 40)}...
                        </div>
                      )}
                    </td>
                    <td style={s.td}>{m.meetingDate || "—"}</td>
                    <td style={s.td}>{m.duration || "—"}</td>
                    <td style={s.td}>{m.location || "—"}</td>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.attendees || "—"}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ss.bg,
                          color: ss.color,
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={s.editBtn} onClick={() => handleEdit(m)}>
                          ✏️
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(m.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination
          total={filtered.length}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Meeting" : "Schedule Meeting"}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.fg}>
                <label style={s.label}>Meeting Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
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
                <div style={s.fg}>
                  <label style={s.label}>Duration</label>
                  <input
                    style={s.input}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    placeholder="e.g. 1 hour"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Location</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>
                <div style={s.fg}>
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
              <div style={s.fg}>
                <label style={s.label}>Attendees</label>
                <input
                  style={s.input}
                  value={form.attendees}
                  onChange={(e) =>
                    setForm({ ...form, attendees: e.target.value })
                  }
                  placeholder="Names separated by commas"
                />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Agenda / Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                />
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
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  {editItem ? "Update" : "Schedule"}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "10px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  count: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 10px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "12.5px",
    color: "#374151",
    fontFamily: "inherit",
    width: "140px",
  },
  filterSel: {
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "#374151",
  },
  addBtn: {
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
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
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
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  badge: {
    fontSize: "11.5px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
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
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  fg: {
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
