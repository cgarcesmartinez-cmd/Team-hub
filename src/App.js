import React from "react";
import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0f0f0f",
  surface: "#1a1a1a",
  border: "#2a2a2a",
  accent: "#e8c547",
  accentDim: "#c9a832",
  text: "#f0ede6",
  muted: "#777",
  danger: "#e05252",
  success: "#52c085",
  info: "#5299e0",
};

const STATUS_CONFIG = {
  "en-curso": { label: "En curso", color: COLORS.info },
  "pendiente": { label: "Pendiente", color: COLORS.muted },
  "bloqueado": { label: "Bloqueado", color: COLORS.danger },
  "completado": { label: "Completado", color: COLORS.success },
};

const PRIORITY_CONFIG = {
  alta: { label: "Alta", color: COLORS.danger },
  media: { label: "Media", color: COLORS.accent },
  baja: { label: "Baja", color: COLORS.muted },
};

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function daysUntil(d) {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d + "T00:00:00");
  return Math.ceil((target - today) / 86400000);
}

function DeadlineBadge({ date, extended, showDate }) {
  const days = daysUntil(date);
  if (days === null) return null;
  const dateStr = formatDate(date);
  if (extended && days <= 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {showDate && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 600 }}>{dateStr}</span>}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          color: "#f97316", border: "1px solid #f97316", borderRadius: 3,
          padding: "1px 5px", textTransform: "uppercase"
        }}>↗ Alargada</span>
      </span>
    );
  }
  let color = COLORS.success;
  if (days <= 0) color = COLORS.danger;
  else if (days <= 2) color = COLORS.danger;
  else if (days <= 5) color = COLORS.accent;
  const label = days < 0 ? `Hace ${Math.abs(days)}d` : days === 0 ? "Hoy" : `${days}d`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {showDate && <span style={{ fontSize: 10, color, fontWeight: 600 }}>{dateStr}</span>}
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1,
        color, border: `1px solid ${color}`, borderRadius: 3,
        padding: "1px 5px", textTransform: "uppercase"
      }}>{label}</span>
    </span>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
      color, background: color + "18", borderRadius: 3,
      padding: "2px 7px", textTransform: "uppercase"
    }}>{label}</span>
  );
}

function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: 28, width: 480, maxWidth: "95vw",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>}
      <input {...props} style={{
        width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 5, color: COLORS.text, padding: "8px 10px", fontSize: 13,
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        ...props.style
      }} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>}
      <select {...props} style={{
        width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 5, color: COLORS.text, padding: "8px 10px", fontSize: 13,
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        ...props.style
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", ...props }) {
  const base = {
    border: "none", borderRadius: 5, padding: "9px 18px",
    fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer",
    textTransform: "uppercase", fontFamily: "inherit", transition: "opacity .15s"
  };
  const styles = {
    primary: { background: COLORS.accent, color: "#000" },
    ghost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.danger + "22", color: COLORS.danger, border: `1px solid ${COLORS.danger}44` },
  };
  return <button {...props} style={{ ...base, ...styles[variant], ...props.style }}>{children}</button>;
}

// ─── Task Form ─────────────────────────────────────────────────────────────

function TaskForm({ members, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: "", person: members[0] || "", status: "pendiente",
    priority: "media", deadline: "", notes: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.accent, letterSpacing: 2, marginBottom: 18, textTransform: "uppercase" }}>
        {initial ? "Editar tarea" : "Nueva tarea"}
      </div>
      <Input label="Tarea" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Descripción de la tarea..." />
      <Select label="Persona" value={form.person} onChange={e => set("person", e.target.value)}>
        {members.map(m => <option key={m} value={m}>{m}</option>)}
      </Select>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Estado" value={form.status} onChange={e => set("status", e.target.value)}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Select label="Prioridad" value={form.priority} onChange={e => set("priority", e.target.value)}>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
      </div>
      <Input label="Deadline" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>Notas</div>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
          rows={3} placeholder="Contexto adicional..."
          style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={() => form.title && form.person && onSave(form)}>Guardar</Btn>
      </div>
    </div>
  );
}

// ─── Meeting Notes ──────────────────────────────────────────────────────────

function MeetingNotes({ notes, onSave, members, tasks, onAddTasks }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractedUpdates, setExtractedUpdates] = useState([]);
  const [extractError, setExtractError] = useState("");
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  async function extractTasks() {
    const text = notes || draft;
    if (!text.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtracted(null);
    try {
      const existingTasks = tasks.filter(t => t.status !== "completado").map(t => ({ id: t.id, title: t.title, person: t.person }));
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: text,
          members: members.join(", "),
          existingTasks: JSON.stringify(existingTasks)
        })
      });
      const data = await response.json();
      setExtracted(data.tasks || []);
      setExtractedUpdates(data.updates || []);
    } catch(e) {
      setExtractError("Error al extraer tareas. Inténtalo de nuevo.");
    }
    setExtracting(false);
  }

  function confirmTasks() {
    const valid = extracted.filter(t => t.title && t.person);
    onAddTasks(valid, extractedUpdates);
    setExtracted(null);
    setExtractedUpdates([]);
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Morning meeting</div>
          <div style={{ fontSize: 13, color: COLORS.muted, textTransform: "capitalize" }}>{today}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {notes && !editing && (
            <Btn variant="ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={extractTasks} disabled={extracting}>
              {extracting ? "⏳ Analizando..." : "🤖 Extraer tareas"}
            </Btn>
          )}
          <Btn variant="ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { setEditing(!editing); setDraft(notes); setExtracted(null); setExtractedUpdates([]); }}>
            {editing ? "Cancelar" : "✏️ Editar"}
          </Btn>
        </div>
      </div>

      {editing ? (
        <>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={6}
            placeholder="Apuntes del meeting de hoy..."
            style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, gap: 8 }}>
            <Btn variant="ghost" style={{ fontSize: 11 }} onClick={() => { onSave(draft); setEditing(false); }}>Guardar notas</Btn>
            <Btn onClick={() => { onSave(draft); setEditing(false); setTimeout(extractTasks, 300); }}>Guardar y extraer tareas</Btn>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: notes ? COLORS.text : COLORS.muted, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 48 }}>
          {notes || "Sin notas de hoy. Pulsa editar para añadir..."}
        </div>
      )}

      {extractError && (
        <div style={{ marginTop: 12, fontSize: 12, color: COLORS.danger }}>{extractError}</div>
      )}

      {((extracted && extracted.length > 0) || (extractedUpdates && extractedUpdates.length > 0)) && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          {extractedUpdates && extractedUpdates.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: COLORS.info, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
                💬 Actualizaciones detectadas ({extractedUpdates.length})
              </div>
              {extractedUpdates.map((u, i) => (
                <div key={i} style={{ background: COLORS.bg, border: `1px solid ${COLORS.info}33`, borderRadius: 6, padding: "10px 14px", marginBottom: 8, borderLeft: `3px solid ${COLORS.info}` }}>
                  <div style={{ fontSize: 11, color: COLORS.info, marginBottom: 4, fontWeight: 600 }}>→ {u.taskTitle}</div>
                  <div style={{ fontSize: 13, color: COLORS.text }}>{u.comment}</div>
                </div>
              ))}
            </div>
          )}
          {extracted && extracted.length > 0 && (
            <div>
            <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
              🤖 Tareas nuevas ({extracted.length})
            </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {extracted.map((t, i) => (
              <div key={i} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {t.person && <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>{t.person}</span>}
                  {t.priority && <Tag label={PRIORITY_CONFIG[t.priority]?.label || t.priority} color={PRIORITY_CONFIG[t.priority]?.color || COLORS.muted} />}
                  {t.status && <Tag label={STATUS_CONFIG[t.status]?.label || t.status} color={STATUS_CONFIG[t.status]?.color || COLORS.muted} />}
                  {t.deadline && <span style={{ fontSize: 11, color: COLORS.muted }}>{formatDate(t.deadline)}</span>}
                </div>
                {t.notes && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{t.notes}</div>}
              </div>
            ))}
          </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <Btn variant="ghost" style={{ fontSize: 11 }} onClick={() => { setExtracted(null); setExtractedUpdates([]); }}>Descartar</Btn>
            <Btn onClick={confirmTasks}>✅ Aplicar al hub</Btn>
          </div>
        </div>
      )}

      {extracted && extracted.length === 0 && extractedUpdates && extractedUpdates.length === 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted }}>No se encontraron tareas ni actualizaciones en las notas.</div>
      )}
    </div>
  );
}

// ─── Member Form ────────────────────────────────────────────────────────────

function MemberForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  return (
    <div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.accent, letterSpacing: 2, marginBottom: 18, textTransform: "uppercase" }}>Añadir persona al equipo</div>
      <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del miembro..." />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={() => name.trim() && onSave(name.trim())}>Añadir</Btn>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function TeamHub() {
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetingNotes, setMeetingNotes] = useState({});
  const [modal, setModal] = useState(null); // "addTask" | "editTask" | "addMember"
  const [editTarget, setEditTarget] = useState(null);
  const [filterPerson, setFilterPerson] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [activeTab, setActiveTab] = useState("tareas");

  const todayKey = new Date().toISOString().slice(0, 10);
  const [search, setSearch] = useState("");
  const [activeGanttMonth, setActiveGanttMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedMember, setExpandedMember] = useState(null);
  const [duplicatesFound, setDuplicatesFound] = useState([]);
  const [pendingDuplicates, setPendingDuplicates] = useState([]);
  const [ganttViewMode, setGanttViewMode] = useState("timeline"); // "timeline" | "week"
  const [ganttFilterStart, setGanttFilterStart] = useState("");
  const [ganttFilterEnd, setGanttFilterEnd] = useState("");
  const [ganttSelectedWeek, setGanttSelectedWeek] = useState("");

  function exportGantt() {
    const today = new Date();
    const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const todayExport = new Date().toISOString().slice(0, 10);
    const withDeadline = tasks
      .filter(t => {
        if (!t.deadline) return false;
        if (t.status === "completado") return t.deadline < todayExport;
        return true;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const byPerson = {};
    withDeadline.forEach(t => {
      if (!byPerson[t.person]) byPerson[t.person] = [];
      byPerson[t.person].push(t);
    });

    const getStatusColor = (status) => ({
      "en-curso": "#3b82f6", "pendiente": "#64748b",
      "bloqueado": "#ef4444", "completado": "#22c55e"
    }[status] || "#64748b");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Gantt MHE — ${dateStr}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #1a1a2e; }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 32px 48px; }
  .header h1 { font-size: 24px; font-weight: 700; }
  .header .subtitle { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .content { padding: 24px 48px; }
  .person-section { margin-bottom: 28px; }
  .person-name { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e8c547; }
  .task-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .task-label { width: 280px; flex-shrink: 0; font-size: 11px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-container { flex: 1; height: 20px; background: #f1f5f9; border-radius: 4px; position: relative; overflow: hidden; }
  .bar { height: 100%; border-radius: 4px; position: absolute; display: flex; align-items: center; padding: 0 6px; }
  .bar-label { font-size: 9px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; }
  .date-label { width: 60px; flex-shrink: 0; font-size: 10px; color: #64748b; text-align: right; }
  .extended-badge { font-size: 9px; color: #f97316; font-weight: 700; }
  .footer { background: #1a1a2e; color: #64748b; padding: 16px 48px; font-size: 11px; display: flex; justify-content: space-between; margin-top: 24px; }
  @media print { body { background: white; } }
</style>
</head>
<body>
<div class="header">
  <h1>Gantt — Material Handling Engineering</h1>
  <div class="subtitle">${dateStr} · Ebro Factory · ${withDeadline.length} tareas activas con deadline</div>
</div>
<div class="content">
${Object.entries(byPerson).map(([person, pTasks]) => {
  const minD = new Date(Math.min(...pTasks.map(t => new Date(t.deadline))));
  const maxD = new Date(Math.max(...pTasks.map(t => new Date(t.deadline))));
  const range = Math.max(1, (maxD - minD) / 86400000);
  return `<div class="person-section">
    <div class="person-name">${person}</div>
    ${pTasks.map(t => {
      const start = t.createdAt ? new Date(t.createdAt) : new Date(minD);
      const end = new Date(t.deadline);
      const totalRange = Math.max(1, (maxD - new Date(Math.min(...pTasks.map(t2 => new Date(t2.createdAt || t2.deadline))))) / 86400000);
      const startOffset = Math.max(0, (start - new Date(Math.min(...pTasks.map(t2 => new Date(t2.createdAt || t2.deadline))))) / 86400000);
      const width = Math.max(2, (end - start) / 86400000);
      const leftPct = (startOffset / totalRange) * 100;
      const widthPct = Math.min(100 - leftPct, (width / totalRange) * 100);
      const color = getStatusColor(t.status);
      const days = Math.ceil((end - new Date()) / 86400000);
      const daysLabel = days < 0 ? `Hace ${Math.abs(days)}d` : days === 0 ? "Hoy" : `${days}d`;
      const dateLabel = end.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      return `<div class="task-row">
        <div class="task-label" title="${t.title}">${t.title}</div>
        <div class="bar-container">
          <div class="bar" style="left:${leftPct}%;width:${widthPct}%;background:${color}88;border:1px solid ${color}">
            <div class="bar-label">${t.title.slice(0,30)}</div>
          </div>
        </div>
        <div class="date-label">
          ${dateLabel}<br>
          <span style="color:${days <= 0 ? '#ef4444' : days <= 5 ? '#eab308' : '#22c55e'};font-weight:700;font-size:9px">${daysLabel}</span>
          ${t.extended ? '<br><span class="extended-badge">↗ Alargada</span>' : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}).join('')}
</div>
<div class="footer">
  <span>Team Hub · MHE · Ebro Factory</span>
  <span>Generado el ${new Date().toLocaleString("es-ES")}</span>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Gantt-MHE-${todayKey}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportKPIReport() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const memberStats = members.map(m => {
      const mtasks = tasks.filter(t => t.person === m);
      const active = mtasks.filter(t => t.status !== "completado");
      const completed = mtasks.filter(t => t.status === "completado");
      const blocked = mtasks.filter(t => t.status === "bloqueado");
      const overdue = active.filter(t => t.deadline && new Date(t.deadline + "T00:00:00") < today);
      const total = mtasks.length;
      const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
      const completedWithDates = completed.filter(t => t.createdAt && t.history && t.history.length > 0);
      const avgDays = completedWithDates.length > 0
        ? Math.round(completedWithDates.reduce((acc, t) => {
            const created = new Date(t.createdAt + "T00:00:00");
            const lastHistory = new Date(t.history[t.history.length-1].date + "T00:00:00");
            return acc + Math.max(0, (lastHistory - created) / 86400000);
          }, 0) / completedWithDates.length)
        : null;
      const workload = active.reduce((acc, t) => acc + ({ alta: 3, media: 2, baja: 1 }[t.priority] || 1), 0);
      const urgentTasks = active.filter(t => { const d = daysUntil(t.deadline); return d !== null && d <= 3; });
      return { m, active: active.length, completed: completed.length, blocked: blocked.length, overdue: overdue.length, total, completionRate, avgDays, workload, urgentTasks, activeTasks: active };
    }).filter(s => s.total > 0).sort((a, b) => b.workload - a.workload);

    const totalActive = tasks.filter(t => t.status !== "completado").length;
    const totalCompleted = tasks.filter(t => t.status === "completado").length;
    const totalBlocked = tasks.filter(t => t.status === "bloqueado").length;
    const totalOverdue = tasks.filter(t => t.deadline && t.status !== "completado" && new Date(t.deadline + "T00:00:00") < today).length;
    const globalRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
    const maxWorkload = Math.max(...memberStats.map(s => s.workload), 1);

    const getColor = (rate) => rate >= 70 ? "#22c55e" : rate >= 40 ? "#eab308" : "#ef4444";
    const getWorkloadColor = (w, max) => {
      const pct = w / max;
      return pct > 0.7 ? "#ef4444" : pct > 0.4 ? "#eab308" : "#22c55e";
    };

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reporte KPI Equipo MHE — ${dateStr}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #1a1a2e; }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 40px 48px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .header h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
  .header .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
  .header .date { font-size: 12px; color: #e8c547; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; background: white; border-bottom: 3px solid #e8c547; }
  .summary-card { padding: 24px 20px; text-align: center; border-right: 1px solid #f1f5f9; }
  .summary-card:last-child { border-right: none; }
  .summary-card .value { font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .content { padding: 32px 48px; }
  .section-title { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; }
  .person-card { background: white; border-radius: 12px; padding: 24px 28px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid #e8c547; page-break-inside: avoid; }
  .person-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .person-name { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  .person-total { font-size: 12px; color: #64748b; margin-top: 3px; }
  .completion-rate { text-align: right; }
  .completion-rate .rate { font-size: 32px; font-weight: 800; line-height: 1; }
  .completion-rate .rate-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
  .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
  .stat-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px; }
  .stat-value { font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .workload-row { display: flex; align-items: center; gap: 12px; }
  .workload-label { font-size: 11px; color: #64748b; width: 80px; flex-shrink: 0; }
  .workload-bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .workload-fill { height: 100%; border-radius: 3px; }
  .workload-value { font-size: 11px; color: #64748b; width: 24px; text-align: right; }
  .urgent-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
  .urgent-title { font-size: 10px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px; }
  .urgent-task { font-size: 12px; color: #475569; padding: 4px 0; border-bottom: 1px solid #f8f9fa; display: flex; justify-content: space-between; }
  .urgent-deadline { font-size: 11px; color: #ef4444; font-weight: 600; }
  .footer { background: #1a1a2e; color: #64748b; padding: 20px 48px; font-size: 11px; display: flex; justify-content: space-between; margin-top: 32px; }
  @media print { body { background: white; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-top">
    <div>
      <h1>Material Handling Engineering</h1>
      <div class="subtitle">Reporte de KPIs del Equipo · ${dateStr}</div>
    </div>
    <div class="date">Ebro Factory</div>
  </div>
</div>

<div class="summary">
  <div class="summary-card"><div class="value" style="color:#1a1a2e">${tasks.length}</div><div class="label">Total Tareas</div></div>
  <div class="summary-card"><div class="value" style="color:#3b82f6">${totalActive}</div><div class="label">Activas</div></div>
  <div class="summary-card"><div class="value" style="color:#22c55e">${totalCompleted}</div><div class="label">Completadas</div></div>
  <div class="summary-card"><div class="value" style="color:#ef4444">${totalBlocked}</div><div class="label">Bloqueadas</div></div>
  <div class="summary-card"><div class="value" style="color:${getColor(globalRate)}">${globalRate}%</div><div class="label">Tasa Global</div></div>
</div>

<div class="content">
  <div class="section-title">Rendimiento por persona</div>
  ${memberStats.map(s => `
  <div class="person-card">
    <div class="person-header">
      <div>
        <div class="person-name">${s.m}</div>
        <div class="person-total">${s.total} tareas totales</div>
      </div>
      <div class="completion-rate">
        <div class="rate" style="color:${getColor(s.completionRate)}">${s.completionRate}%</div>
        <div class="rate-label">Completado</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${s.completionRate}%;background:${getColor(s.completionRate)}"></div>
    </div>
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value" style="color:#3b82f6">${s.active}</div><div class="stat-label">Activas</div></div>
      <div class="stat-item"><div class="stat-value" style="color:#22c55e">${s.completed}</div><div class="stat-label">Completadas</div></div>
      <div class="stat-item"><div class="stat-value" style="color:${s.blocked > 0 ? '#ef4444' : '#94a3b8'}">${s.blocked}</div><div class="stat-label">Bloqueadas</div></div>
      <div class="stat-item"><div class="stat-value" style="color:${s.overdue > 0 ? '#ef4444' : '#94a3b8'}">${s.overdue}</div><div class="stat-label">Vencidas</div></div>
      <div class="stat-item"><div class="stat-value" style="color:#e8c547">${s.avgDays !== null ? s.avgDays + 'd' : '—'}</div><div class="stat-label">Media cierre</div></div>
    </div>
    <div class="workload-row">
      <div class="workload-label">Carga trabajo</div>
      <div class="workload-bar"><div class="workload-fill" style="width:${(s.workload/maxWorkload)*100}%;background:${getWorkloadColor(s.workload, maxWorkload)}"></div></div>
      <div class="workload-value">${s.workload}</div>
    </div>
    ${s.urgentTasks.length > 0 ? `
    <div class="urgent-section">
      <div class="urgent-title">⚠️ Tareas urgentes (≤3 días)</div>
      ${s.urgentTasks.map(t => `<div class="urgent-task"><span>${t.title.length > 60 ? t.title.slice(0,60)+'…' : t.title}</span><span class="urgent-deadline">${formatDate(t.deadline)}</span></div>`).join('')}
    </div>` : ''}
  </div>`).join('')}
</div>

<div class="footer">
  <span>Team Hub · Material Handling Engineering · Ebro Factory</span>
  <span>Generado el ${new Date().toLocaleString("es-ES")}</span>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KPI-MHE-${todayKey}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToExcel() {
    const today = new Date().toLocaleDateString("es-ES");
    const headers = ["PERSONA","TAREA","ESTADO","PRIORIDAD","DEADLINE","DÍAS RESTANTES","FECHA CREACIÓN","NOTAS","HISTORIAL"];
    const rows = tasks
      .sort((a,b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : 99999999999;
        const db = b.deadline ? new Date(b.deadline).getTime() : 99999999999;
        return da - db;
      })
      .map(t => {
        const days = t.deadline ? daysUntil(t.deadline) : "";
        const history = (t.history||[]).map(h => `${h.date}: ${h.comment}`).join(" | ");
        return [
          t.person,
          t.title,
          STATUS_CONFIG[t.status]?.label || t.status,
          PRIORITY_CONFIG[t.priority]?.label || t.priority,
          t.deadline ? new Date(t.deadline + "T00:00:00").toLocaleDateString("es-ES") : "Sin fecha",
          days !== "" ? (days < 0 ? `Vencida hace ${Math.abs(days)}d` : days === 0 ? "HOY" : `${days} días`) : "",
          t.createdAt ? new Date(t.createdAt + "T00:00:00").toLocaleDateString("es-ES") : "",
          t.notes || "",
          history
        ];
      });
    const csvContent = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-hub-${todayKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Initial data
  const INITIAL_MEMBERS = ["Carlos Garces","Javier Rey","Christian Chavez","Román Torres","Juanjo Lozano","Alberto Bonilla","Francisco Nin","Albert Mellado","Jaume Guasch","Nacho (Kaizen)","Adriana Murillo"];
  const INITIAL_TASKS = [
    {id:1,person:"Carlos Garces",title:"Pedir oferta a Mecalux para proyecto estanterías/GBracks",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:2,person:"Carlos Garces",title:"Identificar piezas críticas de Miguel (correo GAE) - evaluar impacto headcount y proceso",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:3,person:"Carlos Garces",title:"Revisar con Kaizen los pedidos abiertos",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:4,person:"Carlos Garces",title:"Mirar con María Dolores el está y pasa del S400 e intentar alargar la introducción",priority:"media",status:"pendiente",deadline:"",notes:"María Dolores es del equipo GAE",createdAt:"2026-05-20"},
    {id:5,person:"Carlos Garces",title:"Oferta ingeniería centrales carros Bitec - en espera de OK de Sabián",priority:"baja",status:"bloqueado",deadline:"",notes:"Sabián (manager) indicó que esperase para sacar la oferta",createdAt:"2026-05-20"},
    {id:6,person:"Javier Rey",title:"Perseguir a Tintore para fecha introducción instrumental panel / cockpit module",priority:"alta",status:"en-curso",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:7,person:"Javier Rey",title:"Coordinar entrega manipulador de asientos - semana 22",priority:"alta",status:"en-curso",deadline:"2026-05-25",notes:"Román Torres tiene tarea paralela de Real Decreto 1215 vinculada a esta entrega",createdAt:"2026-05-20"},
    {id:8,person:"Javier Rey",title:"Analizar contramedida contenedores ejes delantero y trasero para retirar soportes",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:9,person:"Javier Rey",title:"Estudio S700 - seguimiento hitos del Gantt",priority:"alta",status:"en-curso",deadline:"",notes:"Hitos incluidos en el Gantt",createdAt:"2026-05-20"},
    {id:10,person:"Javier Rey",title:"Enviar a Román Torres detalle de kittens para alcance oferta Pikto Light",priority:"alta",status:"pendiente",deadline:"",notes:"Román Torres está esperando este detalle para cerrar oferta con Alexis de Pictulite",createdAt:"2026-05-20"},
    {id:11,person:"Javier Rey",title:"Revisar link T-System para generar recetas faltantes de kittens y ajustar picture lights",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:12,person:"Javier Rey",title:"Ajustar en LES errores de información generados en el template",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:13,person:"Javier Rey",title:"Ver denuncia contenedores de paliers y dar contramedida",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:14,person:"Román Torres",title:"Real Decreto 1215 - pescante asientos e instrumental panel",priority:"alta",status:"en-curso",deadline:"2026-05-25",notes:"En paralelo con entrega manipulador de asientos semana 22 (Javier Rey)",createdAt:"2026-05-20"},
    {id:15,person:"Román Torres",title:"Recibir y pedir ofertas retornables de batería",priority:"alta",status:"en-curso",deadline:"",notes:"Pendiente desde 20/04",createdAt:"2026-05-20"},
    {id:16,person:"Román Torres",title:"Proyecto ADO barrera entrada calle E",priority:"media",status:"en-curso",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:17,person:"Román Torres",title:"Indicar en proyecto ADO que camiones a marquesina K y E no necesitan dar vuelta por planta",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:18,person:"Román Torres",title:"Pikto Light - sacar PR y detallar oferta final con Alexis de Pictulite",priority:"media",status:"en-curso",deadline:"",notes:"Esperando detalle kittens de Javier Rey para cerrar alcance real",createdAt:"2026-05-20"},
    {id:19,person:"Román Torres",title:"Plan para pintar marquesina K junto con Kaizen",priority:"baja",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:20,person:"Román Torres",title:"Pasar documentación a I9S para Real Decreto 1215 y coordinar 1215 del devaling",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:21,person:"Román Torres",title:"Perseguir proyecto medios para Kaizen y proveedores externos",priority:"media",status:"en-curso",deadline:"",notes:"Incluido en el Gantt",createdAt:"2026-05-20"},
    {id:22,person:"Román Torres",title:"Proyecto carro ejes traseros S900 - perseguir pedido",priority:"alta",status:"en-curso",deadline:"",notes:"Oferta tramitada, pedido pendiente de sacar",createdAt:"2026-05-20"},
    {id:23,person:"Juanjo Lozano",title:"Recibir de Carlos rutas de suministro M1 y M0 + callejero de planta",priority:"alta",status:"pendiente",deadline:"",notes:"Carlos debe pasárselo para que lo despliegue con su equipo",createdAt:"2026-05-20"},
    {id:24,person:"Juanjo Lozano",title:"Instalación punto de tensión rampa descarga marquesina - pendiente fecha intervención",priority:"media",status:"pendiente",deadline:"",notes:"Pendiente confirmar cuándo vienen a hacerlo",createdAt:"2026-05-20"},
    {id:25,person:"Juanjo Lozano",title:"Layout máquinas, carretillas y trukis M-Serve y M1",priority:"alta",status:"en-curso",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:26,person:"Juanjo Lozano",title:"Cruzar listados máquinas M1 con listado real de Raquel Gras (senior M1)",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:27,person:"Juanjo Lozano",title:"Gestionar que Miguel de mantenimiento mande mapa armarios eléctricos de planta",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:28,person:"Juanjo Lozano",title:"Oferta cargadores marquesina K para máquinas",priority:"media",status:"pendiente",deadline:"",notes:"En paralelo con mapa de máquinas",createdAt:"2026-05-20"},
    {id:29,person:"Juanjo Lozano",title:"Pedir detalle oferta Tintore para traslado activos San Andrés a Moncada",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:30,person:"Juanjo Lozano",title:"Perseguir proyecto máquinas carrozadas para aire acondicionado carretillas M1 y M0",priority:"media",status:"en-curso",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:31,person:"Juanjo Lozano",title:"⚠️ Llevar carro de rodaduras a línea M0 a las 9:30 para que Laura tome medidas",priority:"alta",status:"pendiente",deadline:"2026-05-21",notes:"MAÑANA jueves 21/05 a las 9:30 - NO OLVIDAR",createdAt:"2026-05-20"},
    {id:32,person:"Juanjo Lozano",title:"Confirmar fecha intervención Systemdoc para marquesina A y marquesina K",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:33,person:"Juanjo Lozano",title:"Hablar con Jaume Guasch y Albert Mellado para tiempos trasvase eje trasero y delantero marquesina A",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:34,person:"Juanjo Lozano",title:"Pedir oferta puntos de tensión pescantes eje trasero y delantero marquesina A",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:35,person:"Juanjo Lozano",title:"Confirmar layout trabajo marquesina A con César",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:36,person:"Juanjo Lozano",title:"Récord de máquinas llevadas a reparar",priority:"baja",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:37,person:"Juanjo Lozano",title:"Retirar sala de mantenimiento de M-Serve",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:38,person:"Juanjo Lozano",title:"Colgar carteles ISO en marquesinas",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:39,person:"Juanjo Lozano",title:"Pedir oferta luminaria marquesina K",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:40,person:"Juanjo Lozano",title:"Instalar puntos de tensión + pedir largos para pingüinos en marquesina K",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:41,person:"Albert Mellado",title:"Ver sinergias procesos tapas y alfombrillas banco y watertest entre M1 y M0 + integrar STOMS en M1",priority:"alta",status:"en-curso",deadline:"",notes:"En coordinación con Jaume Guasch",createdAt:"2026-05-20"},
    {id:42,person:"Jaume Guasch",title:"Ver sinergias procesos tapas y alfombrillas banco y watertest entre M1 y M0 + integrar STOMS en M1",priority:"alta",status:"en-curso",deadline:"",notes:"En coordinación con Albert Mellado",createdAt:"2026-05-20"},
    {id:43,person:"Jaume Guasch",title:"Pasar tiempos del devaning",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:44,person:"Jaume Guasch",title:"Pendiente de Tintore: sacar todo el material de Sperpars y llevarlo a Moncada",priority:"media",status:"en-curso",deadline:"",notes:"Tintore es proveedor externo",createdAt:"2026-05-20"},
    {id:45,person:"Nacho (Kaizen)",title:"Realizar contenedor/base de cristales de la línea",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:46,person:"Nacho (Kaizen)",title:"Pedido máquina serigrafiada chapa marcado láser",priority:"alta",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:47,person:"Nacho (Kaizen)",title:"Llevar panel zona descanso M0 hasta marquesina A",priority:"media",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    {id:48,person:"Nacho (Kaizen)",title:"Pintar marquesina K junto con Román Torres",priority:"baja",status:"pendiente",deadline:"",notes:"",createdAt:"2026-05-20"},
    // GANTT TASKS - BOM / Esta y Pasa
    {id:49,person:"Javier Rey",title:"[GANTT] Análisis Esta/Pasa S700 PHEV - confrontación PL vs Esta y Pasa",priority:"alta",status:"en-curso",deadline:"2026-05-26",notes:"Bloque BOM Gantt 1.5 - confrontar PL 2860-LT1E20260301 vs Esta y Pasa S700 PHEV",createdAt:"2026-05-20"},
    {id:50,person:"Javier Rey",title:"[GANTT] Análisis Esta/Pasa S400 HEV Premium vs Excellence (30 PNs nuevos)",priority:"alta",status:"completado",deadline:"",notes:"Bloque BOM Gantt 1.1 - completado",createdAt:"2026-05-20"},
    // GANTT - MASTER DATA (Adriana Murillo)
    {id:51,person:"Adriana Murillo",title:"[GANTT] Actualización todos Masters S400 Premium",priority:"alta",status:"en-curso",deadline:"2026-05-25",notes:"Bloque Master Data 2.1 - CRÍTICA",createdAt:"2026-05-20"},
    {id:52,person:"Adriana Murillo",title:"[GANTT] Actualización todos Masters S700 PHEV",priority:"alta",status:"pendiente",deadline:"2026-05-26",notes:"Bloque Master Data 2.7 - CRÍTICA. Deadline: 26/05",createdAt:"2026-05-20"},
    {id:53,person:"Adriana Murillo",title:"[GANTT] Actualizar Masters en LES S400 Premium",priority:"alta",status:"pendiente",deadline:"2026-05-25",notes:"Bloque Master Data 2.8",createdAt:"2026-05-20"},
    {id:54,person:"Adriana Murillo",title:"[GANTT] Actualizar Masters en LES S700 PHEV",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Bloque Master Data 2.9",createdAt:"2026-05-20"},
    // GANTT - ALMACENES (Javier Rey)
    {id:55,person:"Javier Rey",title:"[GANTT] ALM S400 - Small parts: layout + ubicaciones físicas",priority:"alta",status:"en-curso",deadline:"2026-05-22",notes:"Bloque ALM S400 5.1 - CRÍTICA",createdAt:"2026-05-20"},
    {id:56,person:"Javier Rey",title:"[GANTT] ALM S400 - Big parts: layout + ubicaciones físicas",priority:"alta",status:"en-curso",deadline:"2026-05-22",notes:"Bloque ALM S400 5.3",createdAt:"2026-05-20"},
    {id:57,person:"Javier Rey",title:"[GANTT] ALM S700 - Big parts: layout + ubicaciones físicas",priority:"alta",status:"pendiente",deadline:"2026-05-28",notes:"Bloque ALM S700 6.1 - CRÍTICA",createdAt:"2026-05-20"},
    {id:58,person:"Javier Rey",title:"[GANTT] ALM S700 - Small parts: layout + ubicaciones físicas",priority:"alta",status:"pendiente",deadline:"2026-05-28",notes:"Bloque ALM S700 6.2 - CRÍTICA",createdAt:"2026-05-20"},
    {id:59,person:"Javier Rey",title:"[GANTT] ALM S700 - Proyecto High Bay Racks (GBracks/Mecalux)",priority:"media",status:"pendiente",deadline:"",notes:"Bloque ALM S700 6.5 - Proyecto a largo plazo",createdAt:"2026-05-20"},
    // GANTT - STOM (Román Torres)
    {id:60,person:"Román Torres",title:"[GANTT] STOM S400+S700 - RFQ Serie prov. externo 7 familias",priority:"alta",status:"pendiente",deadline:"2026-05-28",notes:"Bloque STOM 7.3 - CRÍTICA",createdAt:"2026-05-20"},
    {id:61,person:"Román Torres",title:"[GANTT] STOM - PR Validation RFQ Serie prov. externo 7 familias",priority:"alta",status:"pendiente",deadline:"2026-06-12",notes:"Bloque STOM 7.4 - CRÍTICA",createdAt:"2026-05-20"},
    {id:62,person:"Román Torres",title:"[GANTT] STOM - Proto in-house Kaizen 2 familias",priority:"alta",status:"en-curso",deadline:"2026-06-12",notes:"Bloque STOM 7.1 - CRÍTICA. Coordinado con Kaizen",createdAt:"2026-05-20"},
    // GANTT - WEBPICKING (Javier Rey)
    {id:63,person:"Javier Rey",title:"[GANTT] STOM WebPicking - Validación Webpicking STOM",priority:"alta",status:"pendiente",deadline:"2026-05-26",notes:"Bloque STOM 7.7 - Pendiente de IT para link key user y config supervisión",createdAt:"2026-05-20"},
    // GANTT - P2L / KITTING (Javier Rey lidera, Kaizen implanta)
    {id:64,person:"Javier Rey",title:"[GANTT] P2L - Liderar implantación física layout V2LH + reprogramar P2L",priority:"alta",status:"pendiente",deadline:"2026-05-23",notes:"Bloque Kitting 8.5 - CRÍTICA. Kaizen ejecuta la implantación física",createdAt:"2026-05-20"},
    {id:65,person:"Javier Rey",title:"[GANTT] P2L - Liderar implantación física layout V1LH + reprogramar P2L",priority:"alta",status:"pendiente",deadline:"2026-05-23",notes:"Bloque Kitting 8.6 - CRÍTICA. Kaizen ejecuta la implantación física",createdAt:"2026-05-20"},
    {id:66,person:"Javier Rey",title:"[GANTT] Kitting - Layouts kittings integración S400 y S700",priority:"alta",status:"en-curso",deadline:"2026-05-22",notes:"Bloque Kitting 8.3",createdAt:"2026-05-20"},
    {id:67,person:"Nacho (Kaizen)",title:"[GANTT] P2L - Implantación física layout V2LH",priority:"alta",status:"pendiente",deadline:"2026-05-23",notes:"Bloque Kitting 8.5 - CRÍTICA. Javier Rey lidera",createdAt:"2026-05-20"},
    {id:68,person:"Nacho (Kaizen)",title:"[GANTT] P2L - Implantación física layout V1LH",priority:"alta",status:"pendiente",deadline:"2026-05-23",notes:"Bloque Kitting 8.6 - CRÍTICA. Javier Rey lidera",createdAt:"2026-05-20"},
    {id:69,person:"Nacho (Kaizen)",title:"[GANTT] STOM Proto in-house - 2 familias",priority:"alta",status:"en-curso",deadline:"2026-06-12",notes:"Bloque STOM 7.1 - CRÍTICA. Coordinado con Román Torres",createdAt:"2026-05-20"},
    // GANTT - DECANTING (Keymans)
    {id:70,person:"Alberto Bonilla",title:"[GANTT] Preparar listado decanting S400 y etiquetas",priority:"alta",status:"pendiente",deadline:"2026-05-20",notes:"Bloque Decanting 3.1 - CRÍTICA. HOY 20/05",createdAt:"2026-05-20"},
    {id:71,person:"Francisco Nin",title:"[GANTT] Preparar listado decanting S400 y etiquetas",priority:"alta",status:"pendiente",deadline:"2026-05-20",notes:"Bloque Decanting 3.1 - CRÍTICA. HOY 20/05",createdAt:"2026-05-20"},
    {id:72,person:"Alberto Bonilla",title:"[GANTT] Preparar listado decanting S700 y etiquetas",priority:"alta",status:"pendiente",deadline:"2026-05-29",notes:"Bloque Decanting 3.5 - CRÍTICA",createdAt:"2026-05-20"},
    {id:73,person:"Francisco Nin",title:"[GANTT] Preparar listado decanting S700 y etiquetas",priority:"alta",status:"pendiente",deadline:"2026-05-29",notes:"Bloque Decanting 3.5 - CRÍTICA",createdAt:"2026-05-20"},
    // GANTT - STOCS (Carlos Garces coordina)
    {id:74,person:"Carlos Garces",title:"[GANTT] STOCS - Reunión alcance STOCS en Ebro con T-Systems",priority:"alta",status:"pendiente",deadline:"2026-05-21",notes:"Bloque IT/STOCS 9.2 - MAÑANA 21/05",createdAt:"2026-05-20"},
    {id:75,person:"Carlos Garces",title:"[GANTT] STOCS - Validación final layouts con GAE y Producción",priority:"alta",status:"pendiente",deadline:"2026-05-22",notes:"Bloque Layout 10.3 - con GAE y Producción",createdAt:"2026-05-20"},
    {id:76,person:"Carlos Garces",title:"[GANTT] Go/No-Go S400 HEV SOP",priority:"alta",status:"pendiente",deadline:"2026-05-26",notes:"Bloque Coordinación 0.4 - CRÍTICA. Manager Ingeniería",createdAt:"2026-05-20"},
    {id:77,person:"Carlos Garces",title:"[GANTT] Go/No-Go S700 PHEV PVS",priority:"alta",status:"pendiente",deadline:"2026-06-02",notes:"Bloque Coordinación 0.5 - CRÍTICA",createdAt:"2026-05-20"},
    // PLAN PERSONAL MONCADA - Descarga S700
    {id:78,person:"Carlos Garces",title:"[MONCADA] Organizar plan personal dedicado descarga S700 en Moncada (27/05)",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Petición de Xavi. Equipo: 2 keymans (Bonilla+Nin), Javier Rey, Adriana Murillo + alguien de Raquel Gras. Objetivos: medidas cajas, packaging, preparar 15 coches del lote de 60",createdAt:"2026-05-20"},
    {id:79,person:"Alberto Bonilla",title:"[MONCADA] Presencia descarga S700 en Moncada - toma de datos",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Toma de medidas cajas, condiciones packaging. Preparar 15 coches del lote de 60",createdAt:"2026-05-20"},
    {id:80,person:"Francisco Nin",title:"[MONCADA] Presencia descarga S700 en Moncada - toma de datos",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Toma de medidas cajas, condiciones packaging. Preparar 15 coches del lote de 60",createdAt:"2026-05-20"},
    {id:81,person:"Javier Rey",title:"[MONCADA] Presencia descarga S700 en Moncada - toma de datos",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Toma de medidas cajas, condiciones packaging. Preparar 15 coches del lote de 60",createdAt:"2026-05-20"},
    {id:82,person:"Adriana Murillo",title:"[MONCADA] Presencia descarga S700 en Moncada - toma de datos",priority:"alta",status:"pendiente",deadline:"2026-05-27",notes:"Toma de medidas cajas, condiciones packaging. Preparar 15 coches del lote de 60",createdAt:"2026-05-20"},
  ];

  // Load from storage
  useEffect(() => {
    try {
      const m = localStorage.getItem("hub-members");
      setMembers(m ? JSON.parse(m) : INITIAL_MEMBERS);
      if (!m) localStorage.setItem("hub-members", JSON.stringify(INITIAL_MEMBERS));
    } catch(e) { setMembers(INITIAL_MEMBERS); }
    try {
      const t = localStorage.getItem("hub-tasks");
      setTasks(t ? JSON.parse(t) : INITIAL_TASKS);
      if (!t) localStorage.setItem("hub-tasks", JSON.stringify(INITIAL_TASKS));
    } catch(e) { setTasks(INITIAL_TASKS); }
    try {
      const n = localStorage.getItem("hub-meeting-notes");
      if (n) setMeetingNotes(JSON.parse(n));
    } catch(e) {}
    setLoaded(true);
  }, []);

  function saveMembers(m) {
    setMembers(m);
    localStorage.setItem("hub-members", JSON.stringify(m));
  }
  function saveTasks(t) {
    setTasks(t);
    localStorage.setItem("hub-tasks", JSON.stringify(t));
  }
  function saveMeetingNotes(n) {
    setMeetingNotes(n);
    localStorage.setItem("hub-meeting-notes", JSON.stringify(n));
  }

  function addMember(name) {
    if (!members.includes(name)) saveMembers([...members, name]);
    setModal(null);
  }

  function addTask(form) {
    saveTasks([...tasks, { ...form, id: Date.now(), createdAt: todayKey }]);
    setModal(null);
  }

  function updateTask(form) {
    saveTasks(tasks.map(t => {
      if (t.id !== editTarget.id) return t;
      const updated = { ...t, ...form };
      if (form.deadline && t.deadline && form.deadline !== t.deadline) {
        updated.originalDeadline = t.originalDeadline || t.deadline;
        updated.extended = true;
        const today = new Date().toISOString().slice(0, 10);
        const entry = { date: today, comment: `Fecha alargada de ${formatDate(t.deadline)} a ${formatDate(form.deadline)}` };
        updated.history = [...(t.history || []), entry];
      }
      return updated;
    }));
    setModal(null);
    setEditTarget(null);
  }

  function deleteTask(id) {
    saveTasks(tasks.filter(t => t.id !== id));
  }

  function saveNote(text) {
    const updated = { ...meetingNotes, [todayKey]: text };
    saveMeetingNotes(updated);
  }

  const filtered = tasks.filter(t => {
    if (t.status === "completado" && filterStatus !== "completado") return false;
    if (filterPerson !== "todos" && t.person !== filterPerson) return false;
    if (filterStatus !== "todos" && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) &&
          !t.person.toLowerCase().includes(q) &&
          !(t.notes||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const urgentTasks = tasks.filter(t => {
    const d = daysUntil(t.deadline);
    return d !== null && d <= 3 && t.status !== "completado";
  });

  if (!loaded) return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.muted, fontFamily: "monospace", letterSpacing: 2 }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        select option { background: #1a1a1a; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 }}>Team Hub</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Panel del equipo</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" style={{ fontSize: 11 }} onClick={exportToExcel}>⬇️ Excel</Btn>
          <Btn variant="ghost" style={{ fontSize: 11 }} onClick={() => setModal("addMember")}>+ Persona</Btn>
          {members.length > 0 && <Btn style={{ fontSize: 11 }} onClick={() => setModal("addTask")}>+ Tarea</Btn>}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {/* Alert urgentes */}
        {urgentTasks.length > 0 && (
          <div style={{ background: COLORS.danger + "12", border: `1px solid ${COLORS.danger}44`, borderRadius: 8, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.danger, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
                {urgentTasks.length} tarea{urgentTasks.length > 1 ? "s" : ""} urgente{urgentTasks.length > 1 ? "s" : ""}
              </div>
              {urgentTasks.map(t => (
                <div key={t.id} onClick={() => { setEditTarget(t); setModal("editTask"); }}
                  style={{ fontSize: 12, color: COLORS.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "3px 6px", borderRadius: 4, transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.border + "44"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ color: COLORS.muted, flexShrink: 0 }}>{t.person} →</span>
                  <span style={{ flex: 1 }}>{t.title}</span>
                  <DeadlineBadge date={t.deadline} extended={t.extended} showDate={true} />
                  <span style={{ color: COLORS.muted, fontSize: 10, flexShrink: 0 }}>✏️</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {duplicatesFound.length > 0 && (
          <div style={{ background: COLORS.accent + "12", border: `1px solid ${COLORS.accent}44`, borderRadius: 8, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 16 }}>🔁</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                  {duplicatesFound.length} tarea{duplicatesFound.length > 1 ? "s" : ""} duplicada{duplicatesFound.length > 1 ? "s" : ""} detectada{duplicatesFound.length > 1 ? "s" : ""}
                </div>
                {duplicatesFound.map((d, i) => (
                  <div key={i} style={{ fontSize: 12, color: COLORS.text, marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>
                    {d.type === "update" ? (
                      <>
                        <div><span style={{ color: COLORS.muted }}>Comentario ya registrado: </span>{d.new}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>↳ En tarea: <span style={{ color: COLORS.accent }}>{d.existing}</span></div>
                      </>
                    ) : (
                      <>
                        <div><span style={{ color: COLORS.muted }}>Tarea duplicada: </span>{d.new}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>↳ Ya existe como: <span style={{ color: COLORS.accent }}>{d.existing}</span></div>
                      </>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {pendingDuplicates.length > 0 && <Btn onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const withIds = pendingDuplicates.map((t, i) => ({
                      ...t,
                      id: Date.now() + i,
                      createdAt: today,
                      person: t.person || members[0] || "",
                      status: t.status || "pendiente",
                      priority: t.priority || "media",
                      deadline: t.deadline || "",
                      notes: t.notes || "",
                      history: []
                    }));
                    saveTasks([...tasks, ...withIds]);
                    setDuplicatesFound([]);
                    setPendingDuplicates([]);
                  }} style={{ fontSize: 11 }}>✅ Añadir tarea igualmente</Btn>}
                  <Btn variant="ghost" onClick={() => { setDuplicatesFound([]); setPendingDuplicates([]); }} style={{ fontSize: 11 }}>✕ Cerrar</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
          {["tareas", "gantt", "meeting", "kpis", "equipo"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent", border: "none", cursor: "pointer", padding: "10px 18px",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              color: activeTab === tab ? COLORS.accent : COLORS.muted,
              borderBottom: `2px solid ${activeTab === tab ? COLORS.accent : "transparent"}`,
              textTransform: "capitalize", transition: "all .15s", letterSpacing: 0.5
            }}>{tab === "meeting" ? "Meeting notes" : tab === "gantt" ? "Gantt" : tab === "kpis" ? "KPIs" : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>

        {/* Tab: Tareas */}
        {activeTab === "tareas" && (
          <div>
            {members.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 14, marginBottom: 18 }}>Añade personas a tu equipo para empezar</div>
                <Btn onClick={() => setModal("addMember")}>+ Añadir persona</Btn>
              </div>
            ) : (
              <>
                {/* Buscador */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Buscar tarea, persona o nota..."
                    style={{ width: "100%", background: COLORS.surface, border: `1px solid ${search ? COLORS.accent : COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "9px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
                {/* Filtros */}
                <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                  <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)}
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "7px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                    <option value="todos">Todos</option>
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "7px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                    <option value="todos">Activas ({tasks.filter(t => t.status !== "completado").length})</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label} ({tasks.filter(t => t.status === k).length})</option>)}
                  </select>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: COLORS.muted, fontSize: 13 }}>
                    No hay tareas. Pulsa "+ Tarea" para añadir.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.sort((a, b) => {
                      // Sort by deadline first (soonest first, no deadline last)
                      const da = a.deadline ? new Date(a.deadline + "T00:00:00").getTime() : 99999999999999;
                      const db = b.deadline ? new Date(b.deadline + "T00:00:00").getTime() : 99999999999999;
                      if (da !== db) return da - db;
                      // Then by priority
                      const pa = { alta: 0, media: 1, baja: 2 }[a.priority];
                      const pb = { alta: 0, media: 1, baja: 2 }[b.priority];
                      return pa - pb;
                    }).map(task => (
                      <div key={task.id} style={{
                        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                        borderRadius: 8, padding: "14px 18px",
                        borderLeft: `3px solid ${STATUS_CONFIG[task.status]?.color || COLORS.border}`,
                        opacity: task.status === "completado" ? 0.55 : 1
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, textDecoration: task.status === "completado" ? "line-through" : "none" }}>
                              {task.title}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>{task.person}</span>
                              <span style={{ color: COLORS.border }}>·</span>
                              <Tag label={STATUS_CONFIG[task.status]?.label} color={STATUS_CONFIG[task.status]?.color} />
                              <Tag label={PRIORITY_CONFIG[task.priority]?.label} color={PRIORITY_CONFIG[task.priority]?.color} />
                               {task.deadline && (
                                 <>
                                   <span style={{ color: COLORS.border }}>·</span>
                                   <span style={{ fontSize: 11, color: COLORS.muted }}>{formatDate(task.deadline)}</span>
                                   {task.extended && task.originalDeadline && (
                                     <span style={{ fontSize: 10, color: COLORS.muted }}>({formatDate(task.originalDeadline)})</span>
                                   )}
                                   <DeadlineBadge date={task.deadline} extended={task.extended} />
                                 </>
                               )}
                            </div>
                            {task.notes && <div style={{ marginTop: 7, fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{task.notes}</div>}
                            {task.createdAt && <div style={{ marginTop: 5, fontSize: 10, color: COLORS.border, letterSpacing: 0.5 }}>Creada el {new Date(task.createdAt + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</div>}
                            {task.history && task.history.length > 0 && (
                              <div style={{ marginTop: 8, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
                                <div style={{ fontSize: 10, color: COLORS.info, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Historial</div>
                                {task.history.map((h, i) => (
                                  <div key={i} style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, display: "flex", gap: 8, alignItems: "flex-start" }}>
                                    <span style={{ color: COLORS.accent, flexShrink: 0 }}>{h.date}</span>
                                    <span style={{ flex: 1 }}>{h.comment}</span>
                                    <button onClick={() => {
                                      const updated = tasks.map(t => t.id === task.id
                                        ? { ...t, history: t.history.filter((_, hi) => hi !== i) }
                                        : t);
                                      saveTasks(updated);
                                    }} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.danger + "88", fontSize: 11, padding: "0 4px", flexShrink: 0 }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button onClick={() => { setEditTarget(task); setModal("editTask"); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 13, padding: "2px 6px" }}>✏️</button>
                            <button onClick={() => deleteTask(task.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.danger + "88", fontSize: 13, padding: "2px 6px" }}>✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Meeting */}
        {activeTab === "meeting" && (
          <div>
            <MeetingNotes
              notes={meetingNotes[todayKey] || ""}
              onSave={saveNote}
              members={members}
              tasks={tasks}
              onAddTasks={(newTasks, updates) => {
                const today = new Date().toISOString().slice(0, 10);
                // Detect duplicate tasks
                const duplicates = [];
                const stopWords = new Set(["debe","hacer","para","tarea","que","con","los","las","del","una","por","sus","nos","hay","son","mis","nos","han","más"]);
                
                const validNewTasks = newTasks.filter(nt => {
                  const ntTitle = (nt.title || "").toLowerCase();
                  const ntPerson = (nt.person || "").toLowerCase();
                  // Use all words > 3 chars except stopwords
                  const ntWords = ntTitle.split(" ").filter(w => w.length > 3 && !stopWords.has(w));
                  if (ntWords.length < 2) return true;

                  const findDup = tasks.find(existing => {
                    // Person must match
                    const exPerson = existing.person.toLowerCase();
                    const personMatch = ntPerson && exPerson &&
                      ntPerson.split(" ").some(p => p.length > 3 && exPerson.includes(p));
                    if (!personMatch) return false;

                    const exTitle = existing.title.toLowerCase();
                    const exWords = exTitle.split(" ").filter(w => w.length > 3 && !stopWords.has(w));
                    if (exWords.length < 2) return false;

                    // Count bidirectional matches
                    const fwd = ntWords.filter(w => exTitle.includes(w)).length;
                    const bwd = exWords.filter(w => ntTitle.includes(w)).length;
                    const fwdPct = fwd / ntWords.length;
                    const bwdPct = bwd / exWords.length;

                    // Both directions must have at least 60% match
                    return fwdPct >= 0.6 && bwdPct >= 0.6;
                  });

                  if (findDup) {
                    duplicates.push({ new: nt.title, existing: findDup.title });
                    return false;
                  }
                  return true;
                });
                if (duplicates.length > 0) {
                  setDuplicatesFound(duplicates);
                  // Store the duplicate tasks in case user wants to force add them
                  const dupTasks = newTasks.filter(nt => {
                    const ntTitle = (nt.title || "").toLowerCase();
                    const ntWords = ntTitle.split(" ").filter(w => w.length > 3);
                    if (ntWords.length === 0) return false;
                    return tasks.some(existing => {
                      const exTitle = existing.title.toLowerCase();
                      const forwardMatches = ntWords.filter(w => exTitle.includes(w));
                      return forwardMatches.length >= Math.ceil(ntWords.length * 0.5);
                    });
                  });
                  setPendingDuplicates(dupTasks);
                }
                const withIds = validNewTasks.map((t, i) => ({
                  ...t,
                  id: Date.now() + i,
                  createdAt: today,
                  person: t.person || members[0] || "",
                  status: t.status || "pendiente",
                  priority: t.priority || "media",
                  deadline: t.deadline || "",
                  notes: t.notes || "",
                  history: []
                }));
                let updated = [...tasks, ...withIds];
                const skippedUpdates = [];
                if (updates && updates.length > 0) {
                  updated = updated.map(task => {
                    const taskTitleLow = task.title.toLowerCase();
                    const taskPerson = task.person.toLowerCase();
                    const upd = updates.find(u => {
                      // 1. Match by exact ID (most reliable)
                      if (String(u.taskId) === String(task.id)) return true;
                      // 2. Match by taskTitle - high threshold to avoid false positives
                      const updTitle = (u.taskTitle || "").toLowerCase();
                      const updWords = updTitle.split(" ").filter(w => w.length > 4);
                      if (updWords.length >= 2) {
                        const titleMatches = updWords.filter(w => taskTitleLow.includes(w));
                        if (titleMatches.length >= Math.ceil(updWords.length * 0.7)) return true;
                      }
                      // 3. Match by comment - very high threshold + person must match
                      const uPerson = (u.comment || "").toLowerCase();
                      const personMatch = uPerson.includes(taskPerson.split(" ")[0]) || 
                                         taskPerson.split(" ").some(p => p.length > 3 && uPerson.includes(p));
                      if (!personMatch) return false;
                      const comment = (u.comment || "").toLowerCase();
                      const commentWords = comment.split(" ").filter(w => w.length > 5);
                      const commentMatches = commentWords.filter(w => taskTitleLow.includes(w));
                      return commentWords.length >= 3 && commentMatches.length >= Math.ceil(commentWords.length * 0.5);
                    });
                    if (upd) {
                      // Check if comment is basically the same as the task title (not a real update)
                      const commentLow = upd.comment.toLowerCase();
                      const titleLow = task.title.toLowerCase();
                      const commentWords = commentLow.split(" ").filter(w => w.length > 3);
                      const titleWords = titleLow.split(" ").filter(w => w.length > 3);
                      const titleInComment = titleWords.filter(w => commentLow.includes(w));
                      const isSameAsTitleDup = titleWords.length > 0 && titleInComment.length >= Math.ceil(titleWords.length * 0.7);
                      
                      // Check if comment already exists in history
                      const alreadyInHistory = (task.history || []).some(h => {
                        const hWords = h.comment.toLowerCase().split(" ").filter(w => w.length > 3);
                        const uWords = commentWords;
                        const matches = hWords.filter(w => uWords.includes(w));
                        return hWords.length > 0 && matches.length >= Math.ceil(hWords.length * 0.6);
                      });

                      if (isSameAsTitleDup || alreadyInHistory) {
                        skippedUpdates.push({ task: task.title, comment: upd.comment });
                        return task;
                      }
                      const entry = { date: today, comment: upd.comment };
                      const newStatus = upd.newStatus || task.status;
                      return { ...task, status: newStatus, history: [...(task.history || []), entry] };
                    }
                    return task;
                  });
                }
                saveTasks(updated);
                if (skippedUpdates.length > 0) {
                  setDuplicatesFound(prev => [
                    ...prev,
                    ...skippedUpdates.map(s => ({ type: "update", new: s.comment, existing: s.task }))
                  ]);
                }
              }}
            />
            {/* Historial */}
            {Object.keys(meetingNotes).filter(k => k !== todayKey).sort((a, b) => b.localeCompare(a)).slice(0, 7).length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Historial</div>
                {Object.keys(meetingNotes).filter(k => k !== todayKey).sort((a, b) => b.localeCompare(a)).slice(0, 7).map(k => (
                  <div key={k} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px", marginBottom: 10, opacity: 0.7 }}>
                    <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(k + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{meetingNotes[k]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Gantt */}
        {activeTab === "gantt" && (
          <div>
            {/* Controls */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4, background: COLORS.surface, borderRadius: 6, padding: 3, border: `1px solid ${COLORS.border}` }}>
                {["timeline", "week"].map(mode => (
                  <button key={mode} onClick={() => setGanttViewMode(mode)} style={{
                    background: ganttViewMode === mode ? COLORS.accent : "transparent",
                    color: ganttViewMode === mode ? "#000" : COLORS.muted,
                    border: "none", borderRadius: 4, padding: "5px 14px",
                    fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    textTransform: "uppercase", letterSpacing: 1
                  }}>{mode === "timeline" ? "Timeline" : "Por semana"}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="date" value={ganttFilterStart} onChange={e => setGanttFilterStart(e.target.value)}
                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "6px 10px", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                <span style={{ color: COLORS.muted, fontSize: 11 }}>→</span>
                <input type="date" value={ganttFilterEnd} onChange={e => setGanttFilterEnd(e.target.value)}
                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "6px 10px", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                {(ganttFilterStart || ganttFilterEnd) && (
                  <button onClick={() => { setGanttFilterStart(""); setGanttFilterEnd(""); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 12, fontFamily: "inherit" }}>✕ Limpiar</button>
                )}
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Btn variant="ghost" style={{ fontSize: 11 }} onClick={exportGantt}>📊 Exportar Gantt</Btn>
              </div>
            </div>

            {(() => {
              const today = new Date();
              today.setHours(0,0,0,0);

              const todayStr = today.toISOString().slice(0, 10);
              let withDeadline = tasks
                .filter(t => {
                  if (!t.deadline) return false;
                  // Show active tasks always, show completed only if deadline is in the past
                  if (t.status === "completado") return t.deadline < todayStr;
                  return true;
                })
                .sort((a, b) => a.deadline.localeCompare(b.deadline));

              // Apply date filter
              if (ganttFilterStart) withDeadline = withDeadline.filter(t => t.deadline >= ganttFilterStart);
              if (ganttFilterEnd) withDeadline = withDeadline.filter(t => t.deadline <= ganttFilterEnd);

              if (withDeadline.length === 0) return (
                <div style={{ textAlign: "center", padding: 40, color: COLORS.muted, fontSize: 13 }}>
                  No hay tareas con deadline en el rango seleccionado.
                </div>
              );

              // ── WEEK VIEW ──────────────────────────────────────────────
              if (ganttViewMode === "week") {
                // Group tasks by ISO week
                const getWeekKey = (dateStr) => {
                  const d = new Date(dateStr + "T00:00:00");
                  const day = d.getDay() || 7;
                  d.setDate(d.getDate() + 4 - day);
                  const yearStart = new Date(d.getFullYear(), 0, 1);
                  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
                };
                const getWeekLabel = (dateStr) => {
                  const d = new Date(dateStr + "T00:00:00");
                  const day = d.getDay() || 7;
                  const monday = new Date(d);
                  monday.setDate(d.getDate() - day + 1);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  return `${monday.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} – ${sunday.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`;
                };

                const byWeek = {};
                withDeadline.forEach(t => {
                  const wk = getWeekKey(t.deadline);
                  if (!byWeek[wk]) byWeek[wk] = [];
                  byWeek[wk].push(t);
                });

                return (
                  <div>
                    {Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b)).map(([wk, wTasks]) => {
                      const isCurrentWeek = getWeekKey(today.toISOString().slice(0, 10)) === wk;
                      return (
                        <div key={wk} style={{ marginBottom: 24 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: isCurrentWeek ? COLORS.accent : COLORS.muted, letterSpacing: 2, textTransform: "uppercase", fontWeight: isCurrentWeek ? 700 : 400 }}>
                              {isCurrentWeek ? "📍 " : ""}{wk} · {getWeekLabel(wTasks[0].deadline)}
                            </div>
                            <div style={{ fontSize: 10, color: COLORS.muted }}>({wTasks.length} tarea{wTasks.length > 1 ? "s" : ""})</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16, borderLeft: `2px solid ${isCurrentWeek ? COLORS.accent : COLORS.border}` }}>
                            {wTasks.map(t => {
                              const days = daysUntil(t.deadline);
                              const barColor = t.status === "completado" ? COLORS.success : t.extended ? "#f97316" : days !== null && days < 0 ? COLORS.danger : days !== null && days <= 5 ? COLORS.accent : COLORS.success;
                              return (
                                <div key={t.id} onClick={() => { setEditTarget(t); setModal("editTask"); }}
                                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", borderLeft: `3px solid ${barColor}` }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = barColor}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <div>
                                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t.title}</div>
                                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>{t.person}</span>
                                        <Tag label={STATUS_CONFIG[t.status]?.label} color={STATUS_CONFIG[t.status]?.color} />
                                        <Tag label={PRIORITY_CONFIG[t.priority]?.label} color={PRIORITY_CONFIG[t.priority]?.color} />
                                      </div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                      <div style={{ fontSize: 12, color: barColor, fontWeight: 700 }}>{formatDate(t.deadline)}</div>
                                      <DeadlineBadge date={t.deadline} extended={t.extended} showDate={false} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // ── TIMELINE VIEW ──────────────────────────────────────────
              const minDate = new Date(withDeadline[0].deadline + "T00:00:00");
              const maxDate = new Date(withDeadline[withDeadline.length-1].deadline + "T00:00:00");
              const startDate = new Date(Math.min(today.getTime(), minDate.getTime()));
              startDate.setDate(1);
              const endDate = new Date(maxDate);
              endDate.setMonth(endDate.getMonth() + 1);
              endDate.setDate(0);
              const totalDays = Math.ceil((endDate - startDate) / 86400000) + 1;

              const months = [];
              let cur = new Date(startDate);
              while (cur <= endDate) {
                const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
                const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
                const clampStart = Math.max(monthStart, startDate);
                const clampEnd = Math.min(monthEnd, endDate);
                const days = Math.ceil((clampEnd - clampStart) / 86400000) + 1;
                months.push({
                  label: monthStart.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
                  days,
                  isCurrentMonth: monthStart.getMonth() === today.getMonth() && monthStart.getFullYear() === today.getFullYear()
                });
                cur.setMonth(cur.getMonth() + 1);
              }

              const todayOffset = Math.ceil((today - startDate) / 86400000);
              const todayPct = (todayOffset / totalDays) * 100;

              function getPct(dateStr) {
                const d = new Date(dateStr + "T00:00:00");
                const offset = Math.ceil((d - startDate) / 86400000);
                return Math.min(100, Math.max(0, (offset / totalDays) * 100));
              }

              const byPerson = {};
              withDeadline.forEach(t => {
                if (!byPerson[t.person]) byPerson[t.person] = [];
                byPerson[t.person].push(t);
              });

              return (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: 600 }}>
                    <div style={{ display: "flex", marginBottom: 2, marginLeft: 160 }}>
                      {months.map((m, i) => (
                        <div key={i} style={{
                          flex: m.days, textAlign: "center", fontSize: 10,
                          color: m.isCurrentMonth ? COLORS.accent : COLORS.muted,
                          fontFamily: "'DM Mono', monospace", letterSpacing: 1,
                          textTransform: "uppercase", fontWeight: m.isCurrentMonth ? 700 : 400,
                          borderLeft: i > 0 ? `1px solid ${COLORS.border}` : "none",
                          paddingBottom: 6
                        }}>{m.label}</div>
                      ))}
                    </div>
                    {Object.entries(byPerson).map(([person, pTasks]) => (
                      <div key={person} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, marginBottom: 6 }}>{person}</div>
                        {pTasks.map(task => {
                          const pct = getPct(task.deadline);
                          const days = daysUntil(task.deadline);
                          const barColor = task.status === "completado" ? COLORS.success : task.extended ? "#f97316" : days !== null && days < 0 ? COLORS.danger : days !== null && days <= 7 ? COLORS.accent : COLORS.success;
                          const taskStart = task.createdAt || today.toISOString().slice(0, 10);
                          const startPct = getPct(taskStart);
                          const barWidth = Math.max(1, pct - startPct);
                          return (
                            <div key={task.id} style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 8 }}>
                              <div onClick={() => { setEditTarget(task); setModal("editTask"); }}
                                style={{ width: 152, flexShrink: 0, fontSize: 11, color: COLORS.text, textAlign: "right", paddingRight: 8, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                                title={task.title}>
                                {task.title.length > 22 ? task.title.slice(0,22) + "…" : task.title}
                              </div>
                              <div style={{ flex: 1, position: "relative", height: 24, background: COLORS.surface, borderRadius: 4, border: `1px solid ${COLORS.border}` }}>
                                <div style={{ position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, width: 2, background: COLORS.accent, zIndex: 2, opacity: 0.8 }} />
                                <div onClick={() => { setEditTarget(task); setModal("editTask"); }} style={{
                                  position: "absolute", left: `${startPct}%`, width: `${barWidth}%`,
                                  top: 4, bottom: 4, background: barColor + "55", border: `1px solid ${barColor}`,
                                  borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "flex-end",
                                  paddingRight: 4, overflow: "hidden", cursor: "pointer"
                                }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: barColor, flexShrink: 0 }} />
                                </div>
                              </div>
                              <div style={{ width: 48, flexShrink: 0, fontSize: 10, color: barColor, fontWeight: 700 }}>
                                {formatDate(task.deadline)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted }}>
                        <div style={{ width: 16, height: 2, background: COLORS.accent }} /> Hoy
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS.success + "55", border: `1px solid ${COLORS.success}` }} /> +7 días
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS.accent + "55", border: `1px solid ${COLORS.accent}` }} /> ≤7 días
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS.danger + "55", border: `1px solid ${COLORS.danger}` }} /> Vencida
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: "#f9731655", border: "1px solid #f97316" }} /> Alargada
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {/* Tab: KPIs */}
        {activeTab === "kpis" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase" }}>Rendimiento del equipo</div>
              <Btn variant="ghost" style={{ fontSize: 11 }} onClick={exportKPIReport}>📊 Exportar reporte</Btn>
            </div>
            {(() => {
              const today = new Date();
              today.setHours(0,0,0,0);

              const memberStats = members.map(m => {
                const mtasks = tasks.filter(t => t.person === m);
                const active = mtasks.filter(t => t.status !== "completado");
                const completed = mtasks.filter(t => t.status === "completado");
                const blocked = mtasks.filter(t => t.status === "bloqueado");
                const overdue = active.filter(t => t.deadline && new Date(t.deadline + "T00:00:00") < today);
                const total = mtasks.length;
                const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

                // Average completion time
                const completedWithDates = completed.filter(t => t.createdAt && t.history && t.history.length > 0);
                const avgDays = completedWithDates.length > 0
                  ? Math.round(completedWithDates.reduce((acc, t) => {
                      const created = new Date(t.createdAt + "T00:00:00");
                      const lastHistory = new Date(t.history[t.history.length-1].date + "T00:00:00");
                      return acc + Math.max(0, (lastHistory - created) / 86400000);
                    }, 0) / completedWithDates.length)
                  : null;

                // Workload score (active tasks weighted by priority)
                const workload = active.reduce((acc, t) => {
                  const w = { alta: 3, media: 2, baja: 1 }[t.priority] || 1;
                  return acc + w;
                }, 0);

                return { m, active: active.length, completed: completed.length, blocked: blocked.length, overdue: overdue.length, total, completionRate, avgDays, workload };
              }).filter(s => s.total > 0).sort((a, b) => b.workload - a.workload);

              const maxWorkload = Math.max(...memberStats.map(s => s.workload), 1);

              return (
                <div>
                  {/* Summary cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
                    {[
                      { label: "Total tareas", value: tasks.length, color: COLORS.text },
                      { label: "Activas", value: tasks.filter(t => t.status !== "completado").length, color: COLORS.info },
                      { label: "Completadas", value: tasks.filter(t => t.status === "completado").length, color: COLORS.success },
                      { label: "Bloqueadas", value: tasks.filter(t => t.status === "bloqueado").length, color: COLORS.danger },
                      { label: "Vencidas", value: tasks.filter(t => t.deadline && t.status !== "completado" && new Date(t.deadline + "T00:00:00") < today).length, color: COLORS.danger },
                    ].map((card, i) => (
                      <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 0.5 }}>{card.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Per person KPIs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {memberStats.map(s => (
                      <div key={s.m} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.m}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{s.total} tareas totales</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.completionRate >= 70 ? COLORS.success : s.completionRate >= 40 ? COLORS.accent : COLORS.muted }}>
                              {s.completionRate}%
                            </div>
                            <div style={{ fontSize: 10, color: COLORS.muted }}>completado</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                          <div style={{ height: "100%", width: `${s.completionRate}%`, background: s.completionRate >= 70 ? COLORS.success : s.completionRate >= 40 ? COLORS.accent : COLORS.muted, borderRadius: 3, transition: "width .3s" }} />
                        </div>

                        {/* Stats row */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                          <div style={{ fontSize: 12 }}><span style={{ color: COLORS.info, fontWeight: 600 }}>{s.active}</span> <span style={{ color: COLORS.muted }}>activas</span></div>
                          <div style={{ fontSize: 12 }}><span style={{ color: COLORS.success, fontWeight: 600 }}>{s.completed}</span> <span style={{ color: COLORS.muted }}>completadas</span></div>
                          {s.blocked > 0 && <div style={{ fontSize: 12 }}><span style={{ color: COLORS.danger, fontWeight: 600 }}>{s.blocked}</span> <span style={{ color: COLORS.muted }}>bloqueadas</span></div>}
                          {s.overdue > 0 && <div style={{ fontSize: 12 }}><span style={{ color: COLORS.danger, fontWeight: 600 }}>⚠️ {s.overdue}</span> <span style={{ color: COLORS.muted }}>vencidas</span></div>}
                          {s.avgDays !== null && <div style={{ fontSize: 12 }}><span style={{ color: COLORS.accent, fontWeight: 600 }}>{s.avgDays}d</span> <span style={{ color: COLORS.muted }}>media completado</span></div>}
                        </div>

                        {/* Workload bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 10, color: COLORS.muted, width: 60, flexShrink: 0 }}>Carga</div>
                          <div style={{ flex: 1, height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(s.workload / maxWorkload) * 100}%`, background: s.workload / maxWorkload > 0.7 ? COLORS.danger : s.workload / maxWorkload > 0.4 ? COLORS.accent : COLORS.success, borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: COLORS.muted, width: 30, textAlign: "right" }}>{s.workload}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab: Equipo */}
        {activeTab === "equipo" && (
          <div>
            {members.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
                <div style={{ fontSize: 14, marginBottom: 18 }}>Aún no hay nadie en el equipo</div>
                <Btn onClick={() => setModal("addMember")}>+ Añadir persona</Btn>
              </div>
            ) : (
              <div>
                {/* Org Chart */}
                {(() => {
                  const ORG = [
                    {
                      group: "Dirección",
                      color: COLORS.accent,
                      members: [
                        { name: "Carlos Garces", role: "Jefe MHE", area: "Material Handling Engineering", scope: "Coordinación interdepartamental · Gestión de proyectos · Door-to-Door" }
                      ]
                    },
                    {
                      group: "Línea M0 — 6 JPH",
                      color: COLORS.info,
                      members: [
                        { name: "Juanjo Lozano", role: "Ingeniero MHE", area: "M0 completa", scope: "Procesos · Facilities · Layouts · Medios" }
                      ]
                    },
                    {
                      group: "Línea M1 — 20 JPH",
                      color: "#a78bfa",
                      members: [
                        { name: "Javier Rey", role: "Ingeniero MHE", area: "Trim & Chassis M1", scope: "Procesos · Layouts · WebPicking · P2L · Kitting · S700" },
                        { name: "Christian Chavez", role: "Ingeniero MHE", area: "Trim & Chassis M1", scope: "Procesos · Layouts · Soporte S400/S700" },
                        { name: "Román Torres", role: "Ingeniero MHE", area: "Soldadura & Pintura M1", scope: "STOM · RD1215 · Medios · Retornables · S400 Premium" }
                      ]
                    },
                    {
                      group: "Métodos & Tiempos",
                      color: COLORS.success,
                      members: [
                        { name: "Albert Mellado", role: "MTM", area: "Ambas líneas", scope: "Rutas de suministro · Tiempos operativas · Equilibrados · Sinergias" },
                        { name: "Jaume Guasch", role: "MTM", area: "Ambas líneas", scope: "Rutas de suministro · Tiempos operativas · Equilibrados · Devaning" }
                      ]
                    },
                    {
                      group: "Keymans — Soporte Ambas Líneas",
                      color: "#f97316",
                      members: [
                        { name: "Alberto Bonilla", role: "Keyman", area: "M0 + M1", scope: "Nuevos modelos · Decanting · Etiquetas · Cambios de diseño · Descargas" },
                        { name: "Francisco Nin", role: "Keyman", area: "M0 + M1", scope: "Nuevos modelos · Decanting · Etiquetas · Cambios de diseño · Descargas" }
                      ]
                    },
                    {
                      group: "Sistemas & Data",
                      color: "#ec4899",
                      members: [
                        { name: "Adriana Murillo", role: "Data Engineer", area: "Compartida", scope: "SGA · Master Data · Implantación sistemas · LES · Data maestros" }
                      ]
                    },
                    {
                      group: "Kaizen",
                      color: COLORS.accentDim,
                      members: [
                        { name: "Nacho (Kaizen)", role: "Líder Kaizen", area: "Ambas líneas", scope: "Mejora continua · Implantación física layouts · Medios · Serigrafiado" }
                      ]
                    }
                  ];

                  return (
                    <div>
                      {ORG.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 24 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 3, height: 20, background: group.color, borderRadius: 2 }} />
                            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: group.color, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>{group.group}</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                            {group.members.map(m => {
                              const mtasks = tasks.filter(t => t.person === m.name);
                              const open = mtasks.filter(t => t.status !== "completado").length;
                              const blocked = mtasks.filter(t => t.status === "bloqueado").length;
                              const completed = mtasks.filter(t => t.status === "completado").length;
                              const isExpanded = expandedMember === m.name;
                              const isMember = members.includes(m.name);
                              return (
                                <div key={m.name} style={{
                                  background: COLORS.surface,
                                  border: `1px solid ${isExpanded ? group.color : COLORS.border}`,
                                  borderRadius: 8, padding: 16,
                                  borderLeft: `3px solid ${group.color}`,
                                  opacity: isMember ? 1 : 0.5
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.name}</div>
                                      <div style={{ fontSize: 11, color: group.color, fontWeight: 600, marginBottom: 2 }}>{m.role}</div>
                                      <div style={{ fontSize: 11, color: COLORS.muted }}>{m.area}</div>
                                    </div>
                                    <button onClick={() => setExpandedMember(isExpanded ? null : m.name)}
                                      style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 14, padding: 0 }}>
                                      {isExpanded ? "▲" : "▼"}
                                    </button>
                                  </div>

                                  {isExpanded && (
                                    <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
                                      <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7, marginBottom: 10 }}>{m.scope}</div>
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                                        <span style={{ fontSize: 11, color: COLORS.text }}><strong>{open}</strong> activas</span>
                                        {blocked > 0 && <span style={{ fontSize: 11, color: COLORS.danger }}>⚠️ {blocked} bloqueada{blocked > 1 ? "s" : ""}</span>}
                                        {completed > 0 && <span style={{ fontSize: 11, color: COLORS.success }}>✅ {completed} completada{completed > 1 ? "s" : ""}</span>}
                                      </div>
                                      {mtasks.filter(t => t.status !== "completado").slice(0, 5).map(t => (
                                        <div key={t.id} style={{ fontSize: 11, color: COLORS.muted, padding: "3px 0", borderTop: `1px solid ${COLORS.border}33`, display: "flex", gap: 6 }}>
                                          <span style={{ color: STATUS_CONFIG[t.status]?.color, flexShrink: 0 }}>●</span>
                                          <span>{t.title.length > 50 ? t.title.slice(0,50) + "…" : t.title}</span>
                                        </div>
                                      ))}
                                      {open > 5 && <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>+{open-5} más...</div>}
                                      {completed > 0 && (
                                        <div style={{ marginTop: 8 }}>
                                          <div style={{ fontSize: 10, color: COLORS.success, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Completadas</div>
                                          {mtasks.filter(t => t.status === "completado").map(t => (
                                            <div key={t.id} style={{ fontSize: 11, color: COLORS.muted, padding: "2px 0", textDecoration: "line-through" }}>{t.title.length > 50 ? t.title.slice(0,50) + "…" : t.title}</div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
                        <Btn variant="ghost" style={{ fontSize: 11 }} onClick={() => setModal("addMember")}>+ Añadir persona</Btn>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "addMember" && (
        <Modal onClose={() => setModal(null)}>
          <MemberForm onSave={addMember} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === "addTask" && (
        <Modal onClose={() => setModal(null)}>
          <TaskForm members={members} onSave={addTask} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === "editTask" && editTarget && (
        <Modal onClose={() => { setModal(null); setEditTarget(null); }}>
          <TaskForm members={members} initial={editTarget} onSave={updateTask} onCancel={() => { setModal(null); setEditTarget(null); }} />
        </Modal>
      )}
    </div>
  );
}
