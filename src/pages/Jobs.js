import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";
const ENDPOINT = "jobss";

export default function Jobs() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/${ENDPOINT}`)
      .then((r) => {
        setItems(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = items.filter(
    (item) =>
      !searchVal ||
      JSON.stringify(item).toLowerCase().includes(searchVal.toLowerCase()),
  );

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      await axios.delete(`${BASE_URL}/${ENDPOINT}/${id}`);
      fetchAll();
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

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Jobs</span>
          <span style={s.count}>{filtered.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search..."
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
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setShowModal(true);
            }}
          >
            + Add Jobs
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
              {Object.keys(paginated[0] || {})
                .filter(
                  (k) => !["id", "notes", "createdAt", "updatedAt"].includes(k),
                )
                .slice(0, 6)
                .map((h) => (
                  <th key={h} style={s.th}>
                    {h.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              <th style={s.th}>Actions</th>
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
                    📋
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No records found
                  </div>
                  <button style={s.addBtn} onClick={() => setShowModal(true)}>
                    + Add Jobs
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} style={s.trow}>
                  {Object.keys(item)
                    .filter(
                      (k) =>
                        !["id", "notes", "createdAt", "updatedAt"].includes(k),
                    )
                    .slice(0, 6)
                    .map((k) => (
                      <td key={k} style={s.td}>
                        {item[k]?.toString().slice(0, 30) || "—"}
                      </td>
                    ))}
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={s.editBtn}
                        onClick={() => {
                          setEditItem(item);
                          setShowModal(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={s.delBtn}
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
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
    width: "160px",
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
};
