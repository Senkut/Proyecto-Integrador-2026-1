import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Bell, ChevronDown, X, Users, Edit2, Save, Calendar, Filter, Upload, ChevronLeft, ChevronRight, FileSpreadsheet, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../service/api';

interface Schedule {
  id: string;
  studentId: string;
  doctorId: string;
  area: string;
  fecha: string;
  startTime: string;
  endTime: string;
}

interface Student {
  id: string;
  name: string;
  genero: 'masculino' | 'femenino';
  estado: string;
  foto?: string;
  cedula?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  genero: 'masculino' | 'femenino';
  cedula?: string;
  documento?: string;
}

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface ScheduleManagementProps {
  schedules: Schedule[];
  users: User[];
  students: Student[];
  areas: Area[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  onImportBatch?: (rows: Array<{ studentId: string; doctorId: string; area: string; fecha: string; startTime: string; endTime: string }>) => Promise<void>;
  onDeleteSchedule: (id: string) => void;
  onUpdateSchedule: (id: string, data: Partial<Schedule>) => void | Promise<void>;
}

type DateMode = 'single' | 'week' | 'month' | 'range';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DAY_GETDAY = [1, 2, 3, 4, 5, 6, 0]; // getDay() values for Lun..Sáb..Dom
const ITEMS_PER_PAGE = 8;

// Returns array of weeks in a month. Each week = { weekNum, start: Date, end: Date }
function getWeeksInMonth(yearMonth: string): { weekNum: number; start: Date; end: Date; label: string }[] {
  if (!yearMonth) return [];
  const [yr, mo] = yearMonth.split('-').map(Number);
  const firstDay = new Date(yr, mo - 1, 1);
  const lastDay = new Date(yr, mo, 0);
  const weeks: { weekNum: number; start: Date; end: Date; label: string }[] = [];
  let current = new Date(firstDay);
  let weekNum = 1;
  while (current <= lastDay) {
    const start = new Date(current);
    // end of this week (Sunday) but capped at month end
    const dayOfWeek = current.getDay(); // 0=Sun..6=Sat
    const daysUntilSat = dayOfWeek === 0 ? 6 : 7 - dayOfWeek; // days until next Sunday (end of week ISO = Saturday? Let's go Mon-Sun)
    // Week: Monday to Sunday
    const dayOfWeekMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon..6=Sun
    const monday = new Date(current);
    monday.setDate(current.getDate() - dayOfWeekMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekStart = monday < firstDay ? firstDay : monday;
    const weekEnd = sunday > lastDay ? lastDay : sunday;
    const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
    weeks.push({ weekNum, start: weekStart, end: weekEnd, label: `Semana ${weekNum} · ${fmt(weekStart)} – ${fmt(weekEnd)}` });
    weekNum++;
    // Move to next Monday
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    current = nextMonday;
    if (current > lastDay) break;
  }
  return weeks;
}

// weekSelectedDays: array of getDay() numbers selected (1=Mon..6=Sat)
function getDatesForMode(
  mode: DateMode,
  fecha: string,
  fechaFin: string,
  weekSelectedDays?: number[],
  monthYear?: string,
  monthDays?: number[],
  weekMonthYear?: string,
  weekNumber?: number
): string[] {
  if (mode === 'single') return fecha ? [fecha] : [];

  if (mode === 'week') {
    const wmy = weekMonthYear || '';
    const wn = weekNumber || 1;
    if (!wmy) return [];
    const weeks = getWeeksInMonth(wmy);
    const week = weeks[wn - 1];
    if (!week) return [];
    const allowedDays = weekSelectedDays && weekSelectedDays.length > 0 ? weekSelectedDays : [0, 1, 2, 3, 4, 5, 6];
    const dates: string[] = [];
    const cur = new Date(week.start);
    while (cur <= week.end) {
      if (allowedDays.includes(cur.getDay())) dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  if (mode === 'month') {
    const ref = monthYear || (fecha ? fecha.slice(0, 7) : '');
    if (!ref) return [];
    const [yr, mo] = ref.split('-').map(Number);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const dates: string[] = [];
    if (monthDays && monthDays.length > 0) {
      for (const d of monthDays) {
        if (d >= 1 && d <= daysInMonth) {
          const date = new Date(yr, mo - 1, d);
          dates.push(date.toISOString().split('T')[0]);
        }
      }
    } else {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yr, mo - 1, d);
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates.sort();
  }

  if (mode === 'range' && fecha && fechaFin) {
    const start = new Date(fecha + 'T00:00:00');
    const end = new Date(fechaFin + 'T00:00:00');
    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      if (cur.getDay() !== 0) dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  return fecha ? [fecha] : [];
}

function getModeLabel(mode: DateMode, fecha: string, fechaFin: string, monthYear?: string, weekMonthYear?: string, weekNumber?: number): string {
  if (mode === 'month') {
    const ref = monthYear || (fecha ? fecha.slice(0, 7) : '');
    if (!ref) return '';
    const [yr, mo] = ref.split('-').map(Number);
    return `${MONTHS[mo - 1]} ${yr}`;
  }
  if (mode === 'week') {
    const wmy = weekMonthYear || '';
    const wn = weekNumber || 1;
    if (!wmy) return '';
    const weeks = getWeeksInMonth(wmy);
    const week = weeks[wn - 1];
    if (!week) return '';
    return week.label;
  }
  if (!fecha) return '';
  if (mode === 'range' && fechaFin) return `${fecha} al ${fechaFin}`;
  return fecha;
}

export function ScheduleManagement({ schedules, users, students, areas, onAddSchedule, onImportBatch, onDeleteSchedule, onUpdateSchedule }: ScheduleManagementProps) {
  // --- Form state ---
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [formData, setFormData] = useState({ doctorId: '', area: '', fecha: '', fechaFin: '', startTime: '', endTime: '' });
  // Week mode: selected days (getDay values: 0=Dom,1=Mon..6=Sat), default all days
  const [weekSelectedDays, setWeekSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  // Week mode: month+year selector and week-of-month index (1-based)
  const [weekMonthYear, setWeekMonthYear] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [weekNumber, setWeekNumber] = useState<number>(1);
  // Month mode: 'YYYY-MM' and selected day-of-month numbers
  const [monthYear, setMonthYear] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [monthDays, setMonthDays] = useState<number[]>([]);

  // --- Doctor search state ---
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const [editDoctorSearch, setEditDoctorSearch] = useState('');
  const [editDoctorDropdownOpen, setEditDoctorDropdownOpen] = useState(false);
  const editDoctorDropdownRef = useRef<HTMLDivElement>(null);

  // --- Edit state ---
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [originalScheduleKey, setOriginalScheduleKey] = useState<{ doctorId: string; area: string; fecha: string; startTime: string; endTime: string } | null>(null);
  const [editStudentIds, setEditStudentIds] = useState<string[]>([]);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const editDropdownRef = useRef<HTMLDivElement>(null);

  // --- Filter & pagination state ---
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Excel import state ---
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doctores = users.filter(u => ['doctor', 'maestro', 'administrador', 'director', 'medico', 'docente'].includes(u.role));
  const estudiantesActivos = students.filter(s => s.estado === 'ACTIVO');

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (editDropdownRef.current && !editDropdownRef.current.contains(e.target as Node)) setEditDropdownOpen(false);
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target as Node)) setDoctorDropdownOpen(false);
      if (editDoctorDropdownRef.current && !editDoctorDropdownRef.current.contains(e.target as Node)) setEditDoctorDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [filterDate, filterArea, filterDoctor]);

  // --- Schedule groups (grouped by date+area+doctor+time) ---
  const allGroups = (() => {
    const groups: Record<string, Schedule[]> = {};
    schedules.forEach(s => {
      const key = `${s.fecha}|${s.area}|${s.doctorId}|${s.startTime}|${s.endTime}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.values(groups).sort((a, b) => a[0].fecha.localeCompare(b[0].fecha));
  })();

  const filteredGroups = allGroups.filter(group => {
    const rep = group[0];
    if (filterDate && rep.fecha !== filterDate) return false;
    if (filterArea && rep.area !== filterArea) return false;
    if (filterDoctor && rep.doctorId !== filterDoctor) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE));
  const pagedGroups = filteredGroups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Handlers ---
  const toggleStudent = (id: string) => setSelectedStudentIds(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const toggleEditStudent = (id: string) => setEditStudentIds(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) { toast.error('Selecciona al menos un estudiante'); return; }
    if (formData.startTime >= formData.endTime) { toast.error('La hora de inicio debe ser anterior a la hora de fin'); return; }
    const dates = getDatesForMode(dateMode, formData.fecha, formData.fechaFin, weekSelectedDays, monthYear, monthDays, weekMonthYear, weekNumber);
    if (dateMode === 'week' && !weekMonthYear) { toast.error('Selecciona un mes para la semana'); return; }
    if (dateMode === 'month' && !monthYear) { toast.error('Selecciona un mes'); return; }
    if (dates.length === 0) { toast.error('Selecciona una fecha válida'); return; }
    let added = 0;
    selectedStudentIds.forEach(studentId => {
      dates.forEach(fecha => { onAddSchedule({ studentId, doctorId: formData.doctorId, area: formData.area, fecha, startTime: formData.startTime, endTime: formData.endTime }); added++; });
    });
    const label = getModeLabel(dateMode, formData.fecha, formData.fechaFin, monthYear, weekMonthYear, weekNumber);
    toast.success(` ${selectedStudentIds.length} estudiante(s) × ${dates.length} día(s) = ${added} horarios — ${label}`);
    setSelectedStudentIds([]);
    setFormData({ doctorId: '', area: '', fecha: '', fechaFin: '', startTime: '', endTime: '' });
    setMonthDays([]);
    setSearchQuery('');
  };

  const openEdit = (schedule: Schedule) => {
    const group = schedules.filter(s => s.doctorId === schedule.doctorId && s.area === schedule.area && s.fecha === schedule.fecha && s.startTime === schedule.startTime && s.endTime === schedule.endTime);
    setEditingSchedule({ ...schedule });
    setOriginalScheduleKey({ doctorId: schedule.doctorId, area: schedule.area, fecha: schedule.fecha, startTime: schedule.startTime, endTime: schedule.endTime });
    setEditStudentIds(group.map(s => s.studentId));
  };

  const handleSaveEdit = () => {
    if (!editingSchedule || !originalScheduleKey) return;
    // Use the ORIGINAL key to find the group, not the (possibly modified) editingSchedule values
    const group = schedules.filter(s =>
      s.doctorId === originalScheduleKey.doctorId &&
      s.area === originalScheduleKey.area &&
      s.fecha === originalScheduleKey.fecha &&
      s.startTime === originalScheduleKey.startTime &&
      s.endTime === originalScheduleKey.endTime
    );
    const oldStudentIds = group.map(s => s.studentId);
    // Delete students removed from the group
    oldStudentIds.filter(id => !editStudentIds.includes(id)).forEach(studentId => {
      const s = group.find(g => g.studentId === studentId);
      if (s) onDeleteSchedule(s.id);
    });
    // Update existing students with new schedule data
    editStudentIds.filter(id => oldStudentIds.includes(id)).forEach(studentId => {
      const s = group.find(g => g.studentId === studentId);
      if (s) onUpdateSchedule(s.id, {
        doctorId: editingSchedule.doctorId,
        area: editingSchedule.area,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime
      });
    });
    // Add new students to the group
    editStudentIds.filter(id => !oldStudentIds.includes(id)).forEach(studentId => {
      onAddSchedule({
        studentId,
        doctorId: editingSchedule.doctorId,
        area: editingSchedule.area,
        fecha: editingSchedule.fecha,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime
      });
    });
    toast.success('Horario actualizado correctamente');
    setEditingSchedule(null);
    setOriginalScheduleKey(null);
    setEditStudentIds([]);
  };

  // --- Excel Import ---
  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      // Excel serial date
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }
    if (typeof val === 'string') {
      // Try DD/MM/YYYY or YYYY-MM-DD
      if (val.includes('/')) {
        const [d, m, y] = val.split('/');
        return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      return val.slice(0, 10);
    }
    return '';
  };

  const parseExcelTime = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      const totalMins = Math.round(val * 24 * 60);
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    if (typeof val === 'string') {
      const clean = val.trim().replace(/\s*(a\.?m\.?|p\.?m\.?)/i, '');
      return clean.slice(0, 5).padEnd(5, '0');
    }
    return '';
  };

  // Carga SheetJS (xlsx) desde CDN de forma lazy
  const loadXLSX = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) { resolve((window as any).XLSX); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => resolve((window as any).XLSX);
      script.onerror = () => reject(new Error('No se pudo cargar la librería xlsx'));
      document.head.appendChild(script);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCSV = file.name.endsWith('.csv');
    if (!isXLSX && !isCSV) { toast.error('Formato no soportado. Usa .xlsx, .xls o .csv'); return; }

    try {
      let rows: any[][];

      if (isXLSX) {
        const XLSX = await loadXLSX();
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
      } else {
        const text = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = ev => res(ev.target?.result as string);
          r.onerror = () => rej(new Error('Error leyendo CSV'));
          r.readAsText(file, 'UTF-8');
        });
        rows = text.split(/\r?\n/).filter(l => l.trim()).map(line =>
          line.split(/,|;/).map(cell => cell.trim().replace(/^"|"$/g, ''))
        );
      }

      if (rows.length < 2) { toast.error('El archivo no tiene datos'); return; }

      // Buscar la fila de encabezados en las primeras 6 filas.
      // Prioridad 1: fila con nombres de columna exactos del sistema (cedula_docente, cedula_estudiante, etc.)
      // Prioridad 2: primera fila con >= 2 palabras clave conocidas
      const EXACT_HEADERS = ['fecha', 'servicio', 'cedula_docente', 'cedula_estudiante', 'hora_inicio', 'hora_fin'];
      const KEY_WORDS = ['fecha', 'servicio', 'area', 'área', 'cedula', 'cédula', 'docente', 'doctor',
        'hora', 'inicio', 'fin', 'estudiante', 'alumno', 'date', 'start', 'end'];
      let headerRowIndex = 0;
      let bestExactHits = 0;
      for (let i = 0; i < Math.min(rows.length, 6); i++) {
        const normalized = rows[i].map((c: any) => String(c ?? '').toLowerCase().trim());
        const exactHits = normalized.filter((v: string) => EXACT_HEADERS.includes(v)).length;
        if (exactHits > bestExactHits) { bestExactHits = exactHits; headerRowIndex = i; }
      }
      // fallback por keywords
      if (bestExactHits === 0) {
        for (let i = 0; i < Math.min(rows.length, 6); i++) {
          const hits = rows[i].filter((c: any) => {
            const v = String(c ?? '').toLowerCase().trim();
            return KEY_WORDS.some(k => v.includes(k));
          }).length;
          if (hits >= 2) { headerRowIndex = i; break; }
        }
      }
      const dataStartIndex = headerRowIndex + 1;
      const headerRow = rows[headerRowIndex].map((h: any) => String(h ?? '').toLowerCase().trim());
      // Resolver columnas por prioridad: exacto > especifico > generico.
      // Evita que 'cedula' (generico) capture 'cedula_docente' antes que 'cedula_estudiante'.
      const findCol = (tests: Array<(h: string) => boolean>): number => {
        for (const test of tests) {
          const idx = headerRow.findIndex(test);
          if (idx >= 0) return idx;
        }
        return -1;
      };
      const colMap = {
        fecha: findCol([
          h => h === 'fecha',
          h => h.includes('fecha') || h.includes('date'),
        ]),
        area: findCol([
          h => h === 'servicio' || h === 'area' || h === 'área',
          h => h.includes('servicio') || h.includes('area') || h.includes('área') || h.includes('departamento'),
        ]),
        doctor: findCol([
          h => h === 'cedula_docente' || h === 'cedula docente',
          h => h.includes('cedula_doc') || h.includes('cedula doc'),
          h => h.includes('doctor') || h.includes('docente') || h.includes('profesor') || h.includes('supervisor'),
        ]),
        inicio: findCol([
          h => h === 'hora_inicio' || h === 'hora inicio',
          h => h.includes('hora_inicio') || h.includes('hora inicio'),
          h => h.includes('inicio') || h.includes('entrada') || h.includes('start') || h.includes('desde'),
        ]),
        fin: findCol([
          h => h === 'hora_fin' || h === 'hora fin',
          h => h.includes('hora_fin') || h.includes('hora fin'),
          h => h.includes('salida') || h.includes('end') || h.includes('hasta'),
        ]),
        estudiante: findCol([
          h => h === 'cedula_estudiante' || h === 'cedula estudiante',
          h => h.includes('cedula_est') || h.includes('cedula est'),
          h => h.includes('estudiante') || h.includes('alumno'),
          h => (h.includes('cedula') || h.includes('cédula')) && !h.includes('doc'),
        ]),
      };

      const preview: any[] = [];
      const errors: string[] = [];

      rows.slice(dataStartIndex).forEach((row: any[], idx: number) => {
        if (row.every(c => c === '' || c == null)) return;
        const rowNum = idx + dataStartIndex + 1;
        const fecha = parseExcelDate(colMap.fecha >= 0 ? row[colMap.fecha] : '');
        const area = colMap.area >= 0 ? String(row[colMap.area] ?? '').trim() : '';
        const doctorRaw = colMap.doctor >= 0 ? String(row[colMap.doctor] ?? '').trim() : '';
        const startTime = parseExcelTime(colMap.inicio >= 0 ? row[colMap.inicio] : '');
        const endTime = parseExcelTime(colMap.fin >= 0 ? row[colMap.fin] : '');
        const estudianteRaw = colMap.estudiante >= 0 ? String(row[colMap.estudiante] ?? '').trim() : '';

        // busca por cédula o nombreomo fallback
        const doctor = users.find(u => u.cedula === doctorRaw)
          || users.find(u => u.name.toLowerCase().includes(doctorRaw.toLowerCase()) || doctorRaw.toLowerCase().includes(u.name.toLowerCase().split(' ')[0]));
        const student = students.find(s => s.cedula === estudianteRaw)
          || students.find(s => s.name.toLowerCase().includes(estudianteRaw.toLowerCase()) || estudianteRaw.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]));

        // backend usa cédula como ID)
        const doctorCedula = doctor?.cedula || (users.find(u => u.cedula === doctorRaw) ? doctorRaw : '');
        const studentCedula = student?.cedula || (students.find(s => s.cedula === estudianteRaw) ? estudianteRaw : '');

        const rowErrors: string[] = [];
        if (!fecha) rowErrors.push('fecha inválida');
        if (!area) rowErrors.push('área vacía');
        if (!startTime) rowErrors.push('hora inicio inválida');
        if (!endTime) rowErrors.push('hora fin inválida');
        if (!doctor && doctorRaw) rowErrors.push(`docente "${doctorRaw}" no encontrado`);
        if (!student && estudianteRaw) rowErrors.push(`estudiante "${estudianteRaw}" no encontrado`);

        if (rowErrors.length > 0) errors.push(`Fila ${rowNum}: ${rowErrors.join(', ')}`);

        preview.push({
          rowNum,
          fecha,
          area: area || '—',
          doctorName: doctor?.name || doctorRaw || '—',
          doctorId: doctorCedula,
          studentName: student?.name || estudianteRaw || '—',
          studentId: studentCedula,
          startTime,
          endTime,
          valid: rowErrors.length === 0 && !!doctor && !!student,
        });
      });

      setImportPreview(preview);
      setImportErrors(errors);
      if (preview.length === 0) toast.error('No se encontraron filas con datos');
      else toast.info(`${preview.length} fila(s) leídas · ${preview.filter(p => p.valid).length} listas para importar`);

    } catch (err: any) {
      toast.error(`Error leyendo el archivo: ${err?.message || err}`);
    }
  };

  const handleImportConfirm = async () => {
    const validRows = importPreview.filter(p => p.valid);
    if (validRows.length === 0) { toast.error('No hay filas válidas para importar'); return; }
    setImporting(true);

    const payload = validRows.map(row => ({
      studentId: row.studentId,
      doctorId: row.doctorId,
      area: row.area,
      fecha: row.fecha,
      startTime: row.startTime,
      endTime: row.endTime,
    }));


    if (onImportBatch) {
      await onImportBatch(payload);
    } else {
      // fallback
      for (const row of payload) {
        onAddSchedule(row);
      }
      toast.success(`${payload.length} horario(s) enviado(s)`);
    }

    setImportPreview([]);
    setImportErrors([]);
    setShowImport(false);
    setImporting(false);
  };

  // --- Avatar ---
  const StudentAvatar = ({ student, size = 'sm' }: { student: Student | undefined; size?: 'sm' | 'md' }) => {
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    if (!student) return null;
    return student.foto ? (
      <img src={student.foto} alt={student.name} className={`${sz} rounded-full object-cover border-2 border-white shadow flex-shrink-0`} />
    ) : (
      <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow ${student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-teal-400 to-teal-500'}`}>
        <User className="w-4 h-4" />
      </div>
    );
  };

  // --- Multi-select dropdown ---
  const MultiStudentDropdown = ({ selected, all, open, setOpen, search, setSearch, dropRef, onToggle, onToggleAll, onRemove }: any) => {
    const filtered = all.filter((s: Student) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search) || (s.cedula && s.cedula.includes(search)));
    return (
      <div ref={dropRef} className="relative">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {all.filter((s: Student) => selected.includes(s.cedula || s.id)).map((s: Student) => (
              <span key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-teal-200">
                <StudentAvatar student={s} />
                {s.name.split(' ')[0]}
                <button type="button" onClick={() => onRemove(s.cedula || s.id)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white hover:border-teal-400 focus:outline-none transition-colors">
          <span className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-blue-600" />
            {selected.length === 0 ? 'Seleccionar estudiantes...' : `${selected.length} estudiante${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b bg-gray-50">
              <input type="text" placeholder="Buscar por nombre o número de documento..." value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div className="px-3 py-2 border-b bg-blue-50">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 rounded-lg px-2 py-1">
                <input type="checkbox" checked={filtered.length > 0 && filtered.every((s: Student) => selected.includes(s.cedula || s.id))} onChange={onToggleAll} className="w-4 h-4 accent-cyan-500" />
                <span className="text-sm font-semibold text-blue-700">Seleccionar todos ({filtered.length})</span>
              </label>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              {filtered.length === 0 ? <p className="text-center text-gray-400 py-6 text-sm">Sin resultados</p> :
                filtered.map((student: Student) => (
                  <label key={student.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${selected.includes(student.id) ? 'bg-blue-50' : 'bg-white'}`}>
                    <input type="checkbox" checked={selected.includes(student.cedula || student.id)} onChange={() => onToggle(student.cedula || student.id)} className="w-4 h-4 accent-cyan-500" />
                    <StudentAvatar student={student} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">ID: {student.id}</p>
                    </div>
                    {selected.includes(student.cedula || student.id) && <span className="ml-auto text-blue-600 text-xs font-semibold"></span>}
                  </label>
                ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <span className="text-xs text-gray-500">{selected.length} seleccionado(s)</span>
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">Confirmar</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const dateModeLabels: Record<DateMode, string> = { single: ' Día específico', week: ' Semana', month: ' Mes completo', range: ' Rango' };
  const hasFilters = filterDate || filterArea || filterDoctor;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
        </div>
        <button onClick={() => { setShowImport(!showImport); setImportPreview([]); setImportErrors([]); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border-2 transition-all ${showImport ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-teal-700 border-green-300 hover:bg-teal-50'}`}>
          <FileSpreadsheet className="w-5 h-5" />
          Importar desde Excel
        </button>
      </div>      {showImport && (
        <div className="bg-white rounded-2xl shadow-md border-2 border-teal-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-800">Importar Horarios desde Excel</h3>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800 space-y-1">
            <p className="font-semibold"> Columnas que reconoce el sistema (el orden no importa):</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[['Fecha', 'fecha, date'], ['Área', 'area, servicio, departamento'], ['Doctor/Docente', 'doctor, docente, profesor, supervisor'], ['Hora Inicio', 'inicio, entrada, start, desde'], ['Hora Fin', 'fin, salida, end, hasta'], ['Estudiante', 'estudiante, alumno, cedula, id']].map(([label, aliases]) => (
                <div key={label} className="bg-white rounded-lg p-2 border border-teal-100">
                  <p className="font-semibold text-teal-700">{label}</p>
                  <p className="text-xs text-gray-500">{aliases}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">• Los nombres de estudiantes y doctores deben coincidir con los registrados en el sistema.<br />• Formatos de archivo: <strong>.xlsx</strong>, .xls o .csv.<br />• Formatos de fecha: DD/MM/AAAA o AAAA-MM-DD o número serial de Excel.<br />• Formatos de hora: HH:MM o número decimal de Excel.</p>
          </div>

          <div className="flex items-center gap-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all shadow-md">
              <Upload className="w-5 h-5" /> Seleccionar archivo (.xlsx / .csv)
            </button>
            {importPreview.length > 0 && (
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-teal-600">{importPreview.filter(p => p.valid).length} filas válidas</span>
                {importPreview.filter(p => !p.valid).length > 0 && <span className="text-red-500 ml-2">{importPreview.filter(p => !p.valid).length} con errores</span>}
              </span>
            )}
          </div>

          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-32 overflow-y-auto">
              <p className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Advertencias (estas filas no se importarán):</p>
              {importErrors.map((err, i) => <p key={i} className="text-xs text-red-600">{err}</p>)}
            </div>
          )}

          {importPreview.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Fila</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Área</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Doctor</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Estudiante</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Hora</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importPreview.map((row, i) => (
                    <tr key={i} className={row.valid ? 'bg-white' : 'bg-red-50'}>
                      <td className="px-3 py-2 text-gray-400 text-xs">{row.rowNum}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.fecha}</td>
                      <td className="px-3 py-2 text-xs">{row.area}</td>
                      <td className="px-3 py-2 text-xs">{row.doctorName}</td>
                      <td className="px-3 py-2 text-xs">{row.studentName}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.startTime}–{row.endTime}</td>
                      <td className="px-3 py-2">
                        {row.valid
                          ? <span className="flex items-center gap-1 text-teal-600 text-xs font-semibold"><CheckCircle2 className="w-3 h-3" />Listo</span>
                          : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><AlertCircle className="w-3 h-3" />Error</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {importPreview.filter(p => p.valid).length > 0 && (
            <div className="flex gap-3">
              <button onClick={handleImportConfirm} disabled={importing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-emerald-700 disabled:opacity-60 transition-all shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
                {importing ? 'Importando...' : `Importar ${importPreview.filter(p => p.valid).length} horarios`}
              </button>
              <button onClick={() => { setImportPreview([]); setImportErrors([]); }}
                className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50">
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-5">Asignar Horario a Estudiante(s)</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiantes <span className="text-xs text-blue-700 font-semibold ml-1">— puedes seleccionar varios</span>
            </label>
            <MultiStudentDropdown
              selected={selectedStudentIds} all={estudiantesActivos}
              open={dropdownOpen} setOpen={setDropdownOpen} search={searchQuery} setSearch={setSearchQuery} dropRef={dropdownRef}
              onToggle={toggleStudent}
              onToggleAll={() => setSelectedStudentIds(estudiantesActivos.every(s => selectedStudentIds.includes(s.cedula || s.id)) ? [] : estudiantesActivos.map(s => s.cedula || s.id))}
              onRemove={(id: string) => setSelectedStudentIds(p => p.filter(s => s !== id))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor/Profesor Asignado</label>
              <div ref={doctorDropdownRef} className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={doctorSearch || (formData.doctorId ? (doctores.find(d => (d.cedula || d.id) === formData.doctorId)?.name || '') : '')}
                  onChange={e => { setDoctorSearch(e.target.value); setDoctorDropdownOpen(true); if (!e.target.value) setFormData({ ...formData, doctorId: '' }); }}
                  onFocus={() => setDoctorDropdownOpen(true)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                />
                {doctorDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {doctores
                      .filter(d => {
                        const q = doctorSearch.toLowerCase();
                        return !q || d.name.toLowerCase().includes(q) || (d.cedula && d.cedula.includes(q)) || (d.documento && d.documento.includes(q));
                      })
                      .map(d => (
                        <div key={d.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => { setFormData({ ...formData, doctorId: d.cedula || d.id }); setDoctorSearch(''); setDoctorDropdownOpen(false); }}>
                          <span className="font-medium">{d.name}</span>
                          <span className="text-gray-400 text-xs ml-2">({d.role})</span>
                          {(d.cedula || d.documento) && <span className="text-gray-400 text-xs ml-1">· {d.cedula || d.documento}</span>}
                        </div>
                      ))}
                    {doctores.filter(d => { const q = doctorSearch.toLowerCase(); return !q || d.name.toLowerCase().includes(q) || (d.cedula && d.cedula.includes(q)) || (d.documento && d.documento.includes(q)); }).length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-400 text-sm">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select required value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none">
                <option value="">Seleccionar área</option>
                {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Modo de asignación de fechas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(dateModeLabels) as DateMode[]).map(mode => (
                <button key={mode} type="button" onClick={() => setDateMode(mode)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${dateMode === mode ? 'bg-blue-600 text-white border-teal-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                  {dateModeLabels[mode]}
                </button>
              ))}
            </div>
          </div>          {dateMode === 'single' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" required value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
              </div>
            </div>
          )}          {dateMode === 'week' && (() => {
            const weeks = getWeeksInMonth(weekMonthYear);
            const selectedWeek = weeks[weekNumber - 1];
            const dayCount = getDatesForMode('week', '', '', weekSelectedDays, undefined, undefined, weekMonthYear, weekNumber).length;
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes y año</label>
                    <input type="month" value={weekMonthYear}
                      onChange={e => { setWeekMonthYear(e.target.value); setWeekNumber(1); }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                      <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                      <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semana del mes</label>
                  <div className="flex gap-2 flex-wrap">
                    {weeks.map((w, idx) => (
                      <button key={w.weekNum} type="button"
                        onClick={() => setWeekNumber(w.weekNum)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all text-left ${weekNumber === w.weekNum ? 'bg-blue-600 text-white border-teal-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                        <span className="block font-bold">Semana {w.weekNum}</span>
                        <span className="block text-xs opacity-80">{w.label.split(' · ')[1]}</span>
                      </button>
                    ))}
                  </div>
                  {selectedWeek && (
                    <p className="text-xs text-blue-700 mt-2 font-medium">
                      {selectedWeek.label} — {dayCount} día(s) seleccionado(s)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana a incluir</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_NAMES.map((name, i) => {
                      const gd = DAY_GETDAY[i];
                      const active = weekSelectedDays.includes(gd);
                      return (
                        <button key={name} type="button"
                          onClick={() => setWeekSelectedDays(prev => active ? prev.filter(d => d !== gd) : [...prev, gd].sort())}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${active ? 'bg-blue-600 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                          {name}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => setWeekSelectedDays([1, 2, 3, 4, 5])}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-300 hover:text-blue-700 transition-all">
                      Lun–Vie
                    </button>
                    <button type="button" onClick={() => setWeekSelectedDays([0, 1, 2, 3, 4, 5, 6])}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-300 hover:text-blue-700 transition-all">
                      Todos
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}          {dateMode === 'month' && (() => {
            const ref = monthYear || new Date().toISOString().slice(0, 7);
            const [yr, mo] = ref.split('-').map(Number);
            const daysInMonth = new Date(yr, mo, 0).getDate();
            const firstDayOfWeek = new Date(yr, mo - 1, 1).getDay(); // 0=Sun
            const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // shift to Mon=0
            const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const today = new Date();
            const todayDay = today.getFullYear() === yr && today.getMonth() + 1 === mo ? today.getDate() : -1;
            const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
            const selectedCount = monthDays.length > 0 ? monthDays.length : getDatesForMode('month', '', '', [], ref, []).length;
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes y año</label>
                    <input type="month" value={monthYear || new Date().toISOString().slice(0, 7)}
                      onChange={e => { setMonthYear(e.target.value); setMonthDays([]); }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                    <p className="text-xs text-blue-700 mt-1 font-medium">
                      {MONTHS[mo - 1]} {yr} — <strong>{selectedCount}</strong> días {monthDays.length === 0 ? '(todos)' : 'seleccionados'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                      <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                      <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Calendario visual */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  {/* Controles */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-white">
                    <span className="text-xs font-semibold text-gray-600">Selecciona los días del mes</span>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setMonthDays([])}
                        className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                        Limpiar
                      </button>
                      <button type="button"
                        onClick={() => setMonthDays(allDays)}
                        className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium">
                        Lun–Dom
                      </button>
                      <button type="button"
                        onClick={() => setMonthDays(allDays.filter(d => new Date(yr, mo - 1, d).getDay() !== 0))}
                        className="text-xs px-2 py-0.5 rounded bg-sky-500 text-white hover:bg-sky-600 transition-all font-medium">
                        Lun–Sáb
                      </button>
                      <button type="button"
                        onClick={() => setMonthDays(allDays.filter(d => { const wd = new Date(yr, mo - 1, d).getDay(); return wd >= 1 && wd <= 5; }))}
                        className="text-xs px-2 py-0.5 rounded bg-teal-500 text-white hover:bg-teal-600 transition-all font-medium">
                        Lun–Vie
                      </button>
                    </div>
                  </div>
                  {/* Header días semana */}
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {dayNames.map((d, i) => (
                      <div key={d} className={`text-center text-xs font-bold py-1 ${i === 6 ? 'text-red-400' : 'text-gray-400'}`}>{d}</div>
                    ))}
                  </div>
                  {/* Días */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {Array.from({ length: totalCells }, (_, i) => {
                      const day = i - startOffset + 1;
                      const valid = day >= 1 && day <= daysInMonth;
                      const isActive = valid && monthDays.includes(day);
                      const isSunday = valid && new Date(yr, mo - 1, day).getDay() === 0;
                      const isSaturday = valid && new Date(yr, mo - 1, day).getDay() === 6;
                      const isToday = day === todayDay;
                      return (
                        <button key={i} type="button"
                          disabled={!valid}
                          onClick={() => {
                            if (!valid) return;
                            setMonthDays(prev => prev.includes(day) ? prev.filter(x => x !== day) : [...prev, day].sort((a, b) => a - b));
                          }}
                          className={`flex items-center justify-center text-xs font-semibold transition-all py-1.5
                            ${!valid ? 'bg-gray-50 cursor-default' :
                              isActive ? 'bg-blue-600 text-white shadow-inner' :
                                isToday ? 'bg-amber-100 text-amber-700 hover:bg-blue-100' :
                                  isSunday ? 'bg-white text-red-400 hover:bg-red-50' :
                                    isSaturday ? 'bg-white text-blue-400 hover:bg-blue-50' :
                                      'bg-white text-gray-700 hover:bg-blue-50'
                            }`}>
                          {valid ? (
                            <span className="relative">
                              {day}
                              {isToday && !isActive && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"></span>}
                            </span>
                          ) : ''}
                        </button>
                      );
                    })}
                  </div>
                  {/* Leyenda */}
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-white border-t border-gray-100 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span> Seleccionado</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 inline-block"></span> Hoy</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-white border border-red-300 inline-block"></span> Dom</span>
                    <span className="ml-auto font-semibold text-blue-700">{monthDays.length > 0 ? `${monthDays.length} días marcados` : 'Sin selección = todos los días'}</span>
                  </div>
                </div>
              </div>
            );
          })()}          {dateMode === 'range' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input type="date" required value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input type="date" required value={formData.fechaFin} min={formData.fecha}
                    onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
              </div>
              {formData.fecha && formData.fechaFin && (
                <p className="text-xs text-blue-700 font-medium">
                  {getModeLabel('range', formData.fecha, formData.fechaFin)} — {getDatesForMode('range', formData.fecha, formData.fechaFin).length} días hábiles
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          <button type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 font-semibold shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Agregar Horario{selectedStudentIds.length > 1 ? ` (${selectedStudentIds.length} estudiantes)` : ''}
            {dateMode === 'week' && weekMonthYear && ` — ${getModeLabel('week', formData.fecha, formData.fechaFin, undefined, weekMonthYear, weekNumber)}`}
            {dateMode === 'month' && monthYear && ` — ${getModeLabel('month', '', '', monthYear)}`}
            {dateMode === 'range' && formData.fecha && formData.fechaFin && ` — ${getModeLabel('range', formData.fecha, formData.fechaFin)}`}
          </button>
        </form>
      </div>      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" /> Horarios Programados
            <span className="text-sm text-gray-500 font-normal">{filteredGroups.length} grupo(s) · {schedules.length} turno(s)</span>
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Filter className="w-4 h-4 text-gray-400 mt-auto mb-2" />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha específica</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Área</label>
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:outline-none min-w-[150px]">
              <option value="">Todas las áreas</option>
              {[...new Set(schedules.map(s => s.area))].sort().map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Doctor/Docente</label>
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:outline-none min-w-[180px]">
              <option value="">Todos los docentes</option>
              {[...new Set(schedules.map(s => s.doctorId))].map(id => {
                const doc = users.find(u => (u.cedula || u.id) === id || u.id === id);
                return doc ? <option key={id} value={id}>{doc.name}</option> : null;
              })}
            </select>
          </div>
          {hasFilters && (
            <button onClick={() => { setFilterDate(''); setFilterArea(''); setFilterDoctor(''); }}
              className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl border-2 border-red-200 font-medium transition-colors mt-auto">
              Limpiar
            </button>
          )}
          {hasFilters && filteredGroups.length === 0 && (
            <span className="text-sm text-gray-500 italic mt-auto">Sin resultados para este filtro</span>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {pagedGroups.map(group => {
            const rep = group[0];
            const doctor = users.find(u => (u.cedula || u.id) === rep.doctorId || u.id === rep.doctorId);
            const groupStudents = group.map(s => students.find(st => (st.cedula || st.id) === s.studentId || st.id === s.studentId)).filter(Boolean) as Student[];
            const d = new Date(rep.fecha + 'T00:00:00');
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const dayName = dayNames[d.getDay()];
            const nowLocal = new Date(); const todayLocal = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`; const isToday = rep.fecha === todayLocal;
            const isPast = rep.fecha < todayLocal;
            return (
              <div key={`${rep.fecha}|${rep.area}|${rep.doctorId}|${rep.startTime}`}
                className={`p-4 rounded-xl border-2 transition-shadow hover:shadow-md ${isToday ? 'border-teal-300 bg-blue-50' : isPast ? 'border-gray-100 bg-gray-50 opacity-80' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {isToday && <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">HOY</span>}
                      {isPast && !isToday && <span className="px-2 py-0.5 bg-gray-300 text-gray-600 rounded-full text-xs font-medium">Pasado</span>}
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-lg text-sm font-bold">{dayName} {rep.fecha}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">{rep.area}</span>
                      <span className="text-sm font-medium text-gray-700"> {rep.startTime}–{rep.endTime}</span>
                      <span className="text-sm text-gray-500"> {doctor?.name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groupStudents.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 text-xs shadow-sm">
                          <StudentAvatar student={s} />
                          <span className="font-medium text-gray-700">{s.name.split(' ').slice(0, 2).join(' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(rep)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { group.forEach(s => onDeleteSchedule(s.id)); toast.success('Grupo eliminado'); }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {schedules.length === 0 && <p className="text-center text-gray-400 py-8">No hay horarios programados aún</p>}
          {schedules.length > 0 && filteredGroups.length === 0 && <p className="text-center text-gray-400 py-8">Ningún horario coincide con los filtros</p>}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Página {currentPage} de {totalPages} · {filteredGroups.length} grupo(s)
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">&laquo;</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - currentPage) <= 2)
                .map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${p === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">&raquo;</button>
            </div>
          </div>
        )}
      </div>      {editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" /> Editar Horario
              <span className="ml-2 text-sm text-gray-500 font-normal">{editingSchedule.fecha}</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor/Profesor</label>
                  <div ref={editDoctorDropdownRef} className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o documento..."
                      value={editDoctorSearch || (editingSchedule.doctorId ? (doctores.find(d => (d.cedula || d.id) === editingSchedule.doctorId)?.name || '') : '')}
                      onChange={e => { setEditDoctorSearch(e.target.value); setEditDoctorDropdownOpen(true); }}
                      onFocus={() => setEditDoctorDropdownOpen(true)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                    />
                    {editDoctorDropdownOpen && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {doctores
                          .filter(d => {
                            const q = editDoctorSearch.toLowerCase();
                            return !q || d.name.toLowerCase().includes(q) || (d.cedula && d.cedula.includes(q)) || (d.documento && d.documento.includes(q));
                          })
                          .map(d => (
                            <div key={d.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => { setEditingSchedule({ ...editingSchedule, doctorId: d.cedula || d.id }); setEditDoctorSearch(''); setEditDoctorDropdownOpen(false); }}>
                              <span className="font-medium">{d.name}</span>
                              {(d.cedula || d.documento) && <span className="text-gray-400 text-xs ml-1">· {d.cedula || d.documento}</span>}
                            </div>
                          ))}
                        {doctores.filter(d => { const q = editDoctorSearch.toLowerCase(); return !q || d.name.toLowerCase().includes(q) || (d.cedula && d.cedula.includes(q)) || (d.documento && d.documento.includes(q)); }).length === 0 && (
                          <div className="px-3 py-4 text-center text-gray-400 text-sm">Sin resultados</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <select value={editingSchedule.area}
                    onChange={e => setEditingSchedule({ ...editingSchedule, area: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none">
                    {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input type="time" value={editingSchedule.startTime}
                    onChange={e => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input type="time" value={editingSchedule.endTime}
                    onChange={e => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none" />
                </div>
              </div>
              <div ref={editDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estudiantes asignados</label>
                <MultiStudentDropdown
                  selected={editStudentIds} all={estudiantesActivos}
                  open={editDropdownOpen} setOpen={setEditDropdownOpen} search={editSearchQuery} setSearch={setEditSearchQuery} dropRef={editDropdownRef}
                  onToggle={toggleEditStudent}
                  onToggleAll={() => setEditStudentIds(estudiantesActivos.every(s => editStudentIds.includes(s.cedula || s.id)) ? [] : estudiantesActivos.map(s => s.cedula || s.id))}
                  onRemove={(id: string) => setEditStudentIds(p => p.filter(s => s !== id))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-teal-600 transition-all">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
                <button onClick={() => { setEditingSchedule(null); setOriginalScheduleKey(null); setEditStudentIds([]); }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}