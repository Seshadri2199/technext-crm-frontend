import React, { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [sortField, setSortField] = useState("dueDate");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  useEffect(() => {
    fetchTasks();
  }, []);
  const fetchTasks = () =>
    getTasks()
      .then((res) => setTasks(res.data))
      .catch(() => {});

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchPriority =
      filterPriority === "All" || t.priority === filterPriority;
    return matchStatus && matchPriority;
  });
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) await updateTask(editItem.id, form);
    else await createTask(form);
    setShowModal(false);
    setEditItem(null);
    setForm({ title: "", dueDate: "", priority: "Medium", status: "Pending" });
    fetchTasks();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
      fetchTasks();
    }
  };
  const handleToggle = async (task) => {
    const updated = {
      ...task,
      status: task.status === "Pending" ? "Done" : "Pending",
    };
    await updateTask(task.id, updated);
    fetchTasks();
  };
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === paginated.length && paginated.length > 0
        ? []
        : paginated.map((t) => t.id),
    );
  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "High":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Medium":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#eff6ff", color: "#3b82f6" };
    }
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

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

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdueCount = tasks.filter(
    (t) => t.status === "Pending" && isOverdue(t.dueDate),
  ).length;

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Tasks</span>
          <span style={s.abCount}>{filtered.length}</span>
          {overdueCount > 0 && (
            <span style={s.overdueCount}>⚠️ {overdueCount} overdue</span>
          )}
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
                {["title", "dueDate", "priority", "status"].map((f) => (
                  <div
                    key={f}
                    style={s.sortMenuItem}
                    onClick={() => handleSort(f)}
                  >
                    {f === "dueDate"
                      ? "Due Date"
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
              ...(viewMode === "board" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("board")}
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
                dueDate: "",
                priority: "Medium",
                status: "Pending",
              });
              setShowModal(true);
            }}
          >
            + Create Task
          </button>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSearch}>
              <input style={s.fpSearchInput} placeholder="🔍 Search tasks..." />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STATUS</div>
              {["All", "Pending", "Done"].map((st) => (
                <div
                  key={st}
                  style={{
                    ...s.fpItem,
                    ...(filterStatus === st ? s.fpItemActive : {}),
                  }}
                  onClick={() => {
                    setFilterStatus(st);
                    setPage(1);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filterStatus === st}
                    onChange={() => {
                      setFilterStatus(st);
                      setPage(1);
                    }}
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
                    {st === "All" ? "All Tasks" : st}
                  </span>
                  <span style={s.fpCount}>
                    {st === "All"
                      ? tasks.length
                      : tasks.filter((t) => t.status === st).length}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>PRIORITY</div>
              {["All", "High", "Medium", "Low"].map((p) => (
                <div
                  key={p}
                  style={{
                    ...s.fpItem,
                    ...(filterPriority === p ? s.fpItemActive : {}),
                  }}
                  onClick={() => {
                    setFilterPriority(p);
                    setPage(1);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filterPriority === p}
                    onChange={() => {
                      setFilterPriority(p);
                      setPage(1);
                    }}
                    style={{ marginRight: 8, cursor: "pointer" }}
                  />
                  <span
                    style={{
                      ...s.fpLabel,
                      ...(filterPriority === p
                        ? { color: "#6366f1", fontWeight: 700 }
                        : {}),
                    }}
                  >
                    {p === "All" ? "All Priorities" : p}
                  </span>
                  <span style={s.fpCount}>
                    {p === "All"
                      ? tasks.length
                      : tasks.filter((t) => t.priority === p).length}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>SUMMARY</div>
              <div style={s.progressWrap}>
                <div style={s.progressTop}>
                  <span>Completion</span>
                  <strong>
                    {tasks.length > 0
                      ? Math.round((doneCount / tasks.length) * 100)
                      : 0}
                    %
                  </strong>
                </div>
                <div style={s.progressTrack}>
                  <div
                    style={{
                      ...s.progressFill,
                      width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#ef4444" }}>⚠️ Overdue</span>
                <strong style={{ color: "#ef4444" }}>{overdueCount}</strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#10b981" }}>✅ Done</span>
                <strong>{doneCount}</strong>
              </div>
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>
              {filtered.length} tasks · {pendingCount} pending
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
                  <th style={s.th}>Done</th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("title")}
                  >
                    Subject <SortArrow field="title" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("dueDate")}
                  >
                    Due Date <SortArrow field="dueDate" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("priority")}
                  >
                    Priority <SortArrow field="priority" />
                  </th>
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
                    <td colSpan={7} style={s.emptyCell}>
                      <div style={s.emptyWrap}>
                        <div style={{ fontSize: "40px" }}>✅</div>
                        <div style={s.emptyTitle}>No tasks found</div>
                        <div style={s.emptySub}>Create your first task</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((task) => {
                    const pb = getPriorityBadge(task.priority);
                    const overdue =
                      isOverdue(task.dueDate) && task.status === "Pending";
                    return (
                      <tr
                        key={task.id}
                        style={{
                          ...s.trow,
                          ...(selected.includes(task.id) ? s.trowSelected : {}),
                          ...(task.status === "Done" ? s.trowDone : {}),
                        }}
                      >
                        <td style={s.tdCheck}>
                          <input
                            type="checkbox"
                            checked={selected.includes(task.id)}
                            onChange={() => toggleSelect(task.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={s.tdCheck}>
                          <div
                            style={{
                              ...s.checkbox,
                              ...(task.status === "Done" ? s.checkboxDone : {}),
                            }}
                            onClick={() => handleToggle(task)}
                          >
                            {task.status === "Done" && (
                              <span
                                style={{
                                  color: "#fff",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.taskTitle,
                              ...(task.status === "Done"
                                ? {
                                    textDecoration: "line-through",
                                    color: "#9ca3af",
                                  }
                                : {}),
                            }}
                            onClick={() => handleEdit(task)}
                          >
                            {task.title}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.dueDate,
                              ...(overdue
                                ? { color: "#ef4444", fontWeight: "600" }
                                : {}),
                            }}
                          >
                            {task.dueDate
                              ? (overdue ? "⚠️ " : "") + task.dueDate
                              : "—"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: pb.bg,
                              color: pb.color,
                            }}
                          >
                            {task.priority || "Normal"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              ...(task.status === "Done"
                                ? { background: "#f0fdf4", color: "#10b981" }
                                : { background: "#fef2f2", color: "#ef4444" }),
                            }}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button
                              style={s.editBtn}
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              style={s.delBtn}
                              onClick={() => handleDelete(task.id)}
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

          {viewMode === "board" && (
            <div style={s.board}>
              {["Pending", "Done"].map((status) => (
                <div key={status} style={s.boardCol}>
                  <div
                    style={{
                      ...s.boardHead,
                      borderTop: `3px solid ${status === "Done" ? "#10b981" : "#6366f1"}`,
                    }}
                  >
                    <span
                      style={{
                        ...s.boardTitle,
                        color: status === "Done" ? "#10b981" : "#6366f1",
                      }}
                    >
                      {status}
                    </span>
                    <span style={s.boardCount}>
                      {tasks.filter((t) => t.status === status).length}
                    </span>
                  </div>
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task) => {
                      const pb = getPriorityBadge(task.priority);
                      const overdue =
                        isOverdue(task.dueDate) && task.status === "Pending";
                      return (
                        <div
                          key={task.id}
                          style={s.boardCard}
                          onClick={() => handleEdit(task)}
                        >
                          <div style={s.boardCardTop}>
                            <span
                              style={{
                                ...s.badge,
                                background: pb.bg,
                                color: pb.color,
                                fontSize: "10px",
                              }}
                            >
                              {task.priority}
                            </span>
                            <div
                              style={{
                                ...s.checkbox,
                                ...(task.status === "Done"
                                  ? s.checkboxDone
                                  : {}),
                                width: "18px",
                                height: "18px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(task);
                              }}
                            >
                              {task.status === "Done" && (
                                <span
                                  style={{
                                    color: "#fff",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              ...s.boardCardTitle,
                              ...(task.status === "Done"
                                ? {
                                    textDecoration: "line-through",
                                    color: "#9ca3af",
                                  }
                                : {}),
                            }}
                          >
                            {task.title}
                          </div>
                          {task.dueDate && (
                            <div
                              style={{
                                ...s.boardCardDue,
                                ...(overdue ? { color: "#ef4444" } : {}),
                              }}
                            >
                              {overdue ? "⚠️ " : "📅 "}
                              {task.dueDate}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  <div
                    style={s.boardAdd}
                    onClick={() => {
                      setEditItem(null);
                      setForm({
                        title: "",
                        dueDate: "",
                        priority: "Medium",
                        status,
                      });
                      setShowModal(true);
                    }}
                  >
                    + Add Task
                  </div>
                </div>
              ))}
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
                  {editItem ? "Edit Task" : "Create Task"}
                </div>
                <div style={s.modalSub}>Task details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Task Subject *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Follow up with Arjun Mehta"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Due Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Priority</label>
                  <select
                    style={s.input}
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Pending</option>
                  <option>Done</option>
                </select>
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
                  {editItem ? "Update" : "Create Task"}
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
  overdueCount: {
    background: "#fef2f2",
    color: "#ef4444",
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
  progressWrap: { padding: "6px 8px 10px" },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "6px",
  },
  progressTrack: {
    height: "6px",
    background: "#f1f3f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#6366f1,#10b981)",
    borderRadius: "3px",
    transition: "width 0.3s",
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
  trowDone: { opacity: 0.7 },
  tdCheck: { padding: "12px 10px 12px 20px" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  checkbox: {
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    border: "2px solid #d1d5db",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  checkboxDone: { background: "#10b981", borderColor: "#10b981" },
  taskTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#0f1117",
    cursor: "pointer",
  },
  dueDate: { fontSize: "12.5px" },
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
  board: { display: "flex", gap: "20px", padding: "20px", overflowX: "auto" },
  boardCol: {
    flex: 1,
    minWidth: "320px",
    background: "#f8f9fc",
    borderRadius: "12px",
    overflow: "hidden",
  },
  boardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 14px 10px",
    background: "#fff",
    marginBottom: "10px",
  },
  boardTitle: { fontSize: "13px", fontWeight: "700" },
  boardCount: {
    background: "#f1f3f9",
    borderRadius: "20px",
    padding: "2px 9px",
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
  },
  boardCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "8px",
    cursor: "pointer",
    border: "1px solid #e5e7f0",
    margin: "0 10px 8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  boardCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  boardCardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f1117",
    marginBottom: "6px",
  },
  boardCardDue: { fontSize: "11.5px", color: "#9ca3af" },
  boardAdd: {
    padding: "10px",
    textAlign: "center",
    fontSize: "12.5px",
    color: "#9ca3af",
    cursor: "pointer",
    margin: "0 10px 10px",
    borderRadius: "8px",
    border: "1.5px dashed #e5e7f0",
  },
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
    width: "480px",
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

export default Tasks;
