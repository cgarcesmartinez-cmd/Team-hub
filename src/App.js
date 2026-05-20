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

function DeadlineBadge({ date }) {
  const days = daysUntil(date);
  if (days === null) return null;
  let color = COLORS.success;
  if (days <= 0) color = COLORS.danger;
  else if (days <= 2) color = COLORS.danger;
  else if (days <= 5) color = COLORS.accent;
  const label = days < 0 ? `Hace ${Math.abs(days)}d` : days === 0 ? "Hoy" : `${days}d`;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1,
      color, border: `1px solid ${color}`, borderRadius: 3,
      padding: "1px 5px", textTransform: "uppercase"
    }}>{label}</span>
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

function MeetingNotes({ notes, onSave, members, onAddTasks }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractError, setExtractError] = useState("");
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  async function extractTasks() {
    const text = notes || draft;
    if (!text.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtracted(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: text,
          members: members.join(", ")
        })
      });
      const data = await response.json();
      setExtracted(data.tasks || []);
    } catch(e) {
      setExtractError("Error al extraer tareas. Inténtalo de nuevo.");
    }
    setExtracting(false);
  }

  function confirmTasks() {
    const valid = extracted.filter(t => t.title && t.person);
    onAddTasks(valid);
    setExtracted(null);
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
          <Btn variant="ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { setEditing(!editing); setDraft(notes); setExtracted(null); }}>
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

      {extracted && extracted.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
            🤖 Tareas extraídas ({extracted.length})
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
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" style={{ fontSize: 11 }} onClick={() => setExtracted(null)}>Descartar</Btn>
            <Btn onClick={confirmTasks}>✅ Añadir al hub</Btn>
          </div>
        </div>
      )}

      {extracted && extracted.length === 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted }}>No se encontraron tareas accionables en las notas.</div>
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

  // Initial data
  const INITIAL_MEMBERS = ["Carlos Garces","Javier Rey","Román Torres","Juanjo Lozano","Alberto Bonilla","Francisco Nin","Albert Mellado","Jaume Guasch","Nacho (Kaizen)","Adriana Murillo"];
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
    saveTasks(tasks.map(t => t.id === editTarget.id ? { ...t, ...form } : t));
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
    if (filterPerson !== "todos" && t.person !== filterPerson) return false;
    if (filterStatus !== "todos" && t.status !== filterStatus) return false;
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
                <div key={t.id} style={{ fontSize: 12, color: COLORS.text, marginBottom: 3 }}>
                  <span style={{ color: COLORS.muted }}>{t.person} →</span> {t.title} <DeadlineBadge date={t.deadline} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
          {["tareas", "meeting", "equipo"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent", border: "none", cursor: "pointer", padding: "10px 18px",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              color: activeTab === tab ? COLORS.accent : COLORS.muted,
              borderBottom: `2px solid ${activeTab === tab ? COLORS.accent : "transparent"}`,
              textTransform: "capitalize", transition: "all .15s", letterSpacing: 0.5
            }}>{tab === "meeting" ? "Meeting notes" : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
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
                {/* Filtros */}
                <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                  <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)}
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "7px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                    <option value="todos">Todos</option>
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, color: COLORS.text, padding: "7px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}>
                    <option value="todos">Todos los estados</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: COLORS.muted, fontSize: 13 }}>
                    No hay tareas. Pulsa "+ Tarea" para añadir.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.sort((a, b) => {
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
                                  <DeadlineBadge date={task.deadline} />
                                </>
                              )}
                            </div>
                            {task.notes && <div style={{ marginTop: 7, fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{task.notes}</div>}
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
              onAddTasks={(newTasks) => {
                const withIds = newTasks.map((t, i) => ({
                  ...t,
                  id: Date.now() + i,
                  createdAt: new Date().toISOString().slice(0, 10),
                  person: t.person || members[0] || "",
                  status: t.status || "pendiente",
                  priority: t.priority || "media",
                  deadline: t.deadline || "",
                  notes: t.notes || "",
                }));
                saveTasks([...tasks, ...withIds]);
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {members.map(m => {
                  const mtasks = tasks.filter(t => t.person === m);
                  const open = mtasks.filter(t => t.status !== "completado").length;
                  const blocked = mtasks.filter(t => t.status === "bloqueado").length;
                  return (
                    <div key={m} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 18 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>{m}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                        <span style={{ color: COLORS.text, fontWeight: 600 }}>{open}</span> tareas abiertas
                      </div>
                      {blocked > 0 && (
                        <div style={{ fontSize: 12, color: COLORS.danger }}>⚠️ {blocked} bloqueada{blocked > 1 ? "s" : ""}</div>
                      )}
                      <button onClick={() => {
                        saveMembers(members.filter(x => x !== m));
                        saveTasks(tasks.filter(t => t.person !== m));
                      }} style={{ marginTop: 14, background: "transparent", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 11, padding: 0, fontFamily: "inherit" }}>
                        Eliminar
                      </button>
                    </div>
                  );
                })}
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
