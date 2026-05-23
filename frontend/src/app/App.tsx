import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Building2, Users, Clock, Calendar, LayoutDashboard, FileText, Settings, Menu, X, UserPlus, Activity, ClipboardList, Lock, Eye, EyeOff, AlertTriangle, LogOut, CheckCircle2, Lightbulb, User, UserCircle2, Moon, Sun } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import logoHospital from './assets/logo-hospital.png';
import { UserManagement } from './components/UserManagement';
import { ScheduleManagement } from './components/ScheduleManagement';
import { CronogramaView } from './components/CronogramaView';
import { PresencePanel } from './components/PresencePanel';
import { StudentRegistry } from './components/StudentRegistry';
import { Reports } from './components/Reports';
import { AreaManagement } from './components/AreaManagement';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { CompleteProfileForm } from './components/CompleteProfileForm';
import { hasPermission, getRolePermissions } from './utils/permissions';
import { api, mapEstudianteFromBackend, mapEstudianteToBackend, mapUsuarioFromBackend, mapAreaFromBackend, mapHorarioFromBackend } from './service/api';

interface User {
  id: string;
  name: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  role: 'administrador' | 'medico' | 'docente' | 'director' | 'estudiante';
  permissions: string[];
  assignedTo?: string;
  genero: 'masculino' | 'femenino';
  password: string;
  programa?: string;
}

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface Schedule {
  id: string;
  studentId: string;
  doctorId: string;
  area: string;
  fecha: string;
  startTime: string;
  endTime: string;
}

interface AttendanceRecord {
  fecha: string;
  checkInTime?: string;
  checkOutTime?: string;
  horasTrabajadas: number;
  area?: string;
  horarioProgramado?: {
    inicio: string;
    fin: string;
  };
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario';
}

interface Student {
  id: string;
  // Información Académica
  programa: string;
  institucionEducativa: string;
  tipoVinculacion: 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización';

  // Información Personal
  foto?: string;
  nombresCompletos: string;
  apellidos: string;
  apellidosCompletos?: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  fechaNacimiento: string;
  lugarNacimiento: string;

  // Información de Contacto
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;

  // Representante Legal
  direccionRepresentanteLegal: string;
  ciudadRepresentanteLegal: string;
  nombreRepresentanteLegal: string;
  parentesco: string;
  celularRepresentanteLegal: string;

  // Otros Datos
  idiomaAdicional?: string;
  actividadesComplementarias?: string;

  // Aspectos Familiares
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  tieneEsposo?: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;

  // Aspectos de Salud
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;

  // Convivencia
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;

  // Campos antiguos (mantener compatibilidad)
  name: string; // Se generará desde nombresCompletos + apellidos
  universidad: string; // Alias de institucionEducativa
  semestre?: string;
  genero: 'masculino' | 'femenino';
  induccionHospitalaria: boolean;
  fechaInduccion?: string;
  arl: boolean;
  fechaARLInicio?: string;
  fechaARL?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  checkInTime?: string;
  checkInDate?: string;
  checkOutTime?: string;
  checkOutDate?: string;
  password?: string; // Contraseña para login
  attendanceHistory?: AttendanceRecord[]; // Historial de asistencia
}


export default function App() {
  // Dark mode — persiste en localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    // Activa transición suave
    root.classList.add('transitioning');
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
    const t = setTimeout(() => root.classList.remove('transitioning'), 350);
    return () => clearTimeout(t);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Sistema de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ documento: string; role: string; name: string; studentData?: Student; permissions?: string[] } | null>(null);

  // TODOS los useState deben estar al inicio, antes de cualquier return condicional
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Carga de datos desde el backend ──────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    try {
      // Verificar si el backend está online
      const [estudiantesRes, usuariosRes, areasRes, horariosRes, registrosHoyRes] = await Promise.allSettled([
        api.getEstudiantes(),
        api.getUsuarios(),
        api.getAreas(),
        api.getHorarios(),
        api.getRegistrosHoy(),
      ]);

      setBackendOnline(true);

      if (estudiantesRes.status === 'fulfilled' && Array.isArray(estudiantesRes.value)) {
        // Construir mapa cedula → registro de hoy desde la BD
        // para rehidratar checkInTime / checkOutTime / attendanceHistory
        const registrosHoy: Record<string, any> = {};
        if (registrosHoyRes.status === 'fulfilled' && Array.isArray(registrosHoyRes.value)) {
          for (const r of registrosHoyRes.value) {
            const cedula = String(r.cedula || '');
            if (!cedula) continue;
            // Conservar el registro más reciente si hay varios en el día
            if (!registrosHoy[cedula] || r.timestamp_entrada > registrosHoy[cedula].timestamp_entrada) {
              registrosHoy[cedula] = r;
            }
          }
        }

        const estudiantesHidratados = estudiantesRes.value.map((e: any) => {
          const base = mapEstudianteFromBackend(e);
          const reg = registrosHoy[base.cedula];
          if (!reg) return base;

          // Extraer hora HH:mm de los timestamps ISO que viene del backend
          const toHHmm = (ts: string | null | undefined): string | undefined => {
            if (!ts) return undefined;
            // timestamp puede venir como "2026-05-18T17:43:16.868931" o "2026-05-18 17:43:16.868931"
            const parte = ts.replace('T', ' ');
            return parte.substring(11, 16); // "HH:mm"
          };

          const toFecha = (ts: string | null | undefined): string | undefined => {
            if (!ts) return undefined;
            return ts.substring(0, 10); // "YYYY-MM-DD"
          };

          const checkInTime = toHHmm(reg.timestamp_entrada);
          const checkInDate = toFecha(reg.timestamp_entrada);
          const checkOutTime = toHHmm(reg.timestamp_salida);
          const checkOutDate = toFecha(reg.timestamp_salida);

          // Reconstruir attendanceHistory si el registro del día está completo
          const attendanceHistory = [...(base.attendanceHistory || [])];
          if (checkInTime && checkOutTime && checkInDate) {
            const [inH, inM] = checkInTime.split(':').map(Number);
            const [outH, outM] = checkOutTime.split(':').map(Number);
            const horasTrabajadas = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
            const yaExiste = attendanceHistory.some(
              (h: any) => h.fecha === checkInDate && h.checkInTime === checkInTime
            );
            if (!yaExiste) {
              attendanceHistory.push({
                fecha: checkInDate,
                checkInTime,
                checkOutTime,
                horasTrabajadas,
                area: reg.servicio || undefined,
                cumplimiento: 'sin_horario' as const,
              });
            }
          }

          return {
            ...base,
            checkInTime,
            checkInDate,
            checkOutTime,
            checkOutDate,
            attendanceHistory,
          };
        });

        setStudents(estudiantesHidratados);
      }

      if (usuariosRes.status === 'fulfilled' && Array.isArray(usuariosRes.value)) {
        setUsers(usuariosRes.value.map(mapUsuarioFromBackend));
      }

      if (areasRes.status === 'fulfilled' && Array.isArray(areasRes.value)) {
        setAreas(areasRes.value.map(mapAreaFromBackend));
      }

      if (horariosRes.status === 'fulfilled' && Array.isArray(horariosRes.value)) {
        setSchedules(horariosRes.value.map(mapHorarioFromBackend));
      }
    } catch (err) {
      setBackendOnline(false);
      console.warn('Backend no disponible — modo offline con datos locales');
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Modal cambio de contraseña desde sidebar
  const [showSidebarPwModal, setShowSidebarPwModal] = useState(false);
  const [sidebarPwActual, setSidebarPwActual] = useState('');
  const [sidebarPwNueva, setSidebarPwNueva] = useState('');
  const [sidebarPwConfirm, setSidebarPwConfirm] = useState('');
  const [showSidebarPwA, setShowSidebarPwA] = useState(false);
  const [showSidebarPwN, setShowSidebarPwN] = useState(false);
  const [showSidebarPwC, setShowSidebarPwC] = useState(false);

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      const payload = {
        name: userData.name,
        cedula: userData.cedula,
        role: userData.role,
        programa: userData.programa || '',
        password: userData.password || userData.cedula,
      };
      const res = await api.createUsuario(payload);
      if (res?.ok === false) {
        toast.error(res.mensaje || 'Error al crear usuario');
        return;
      }
      // Recargar lista del backend
      const lista = await api.getUsuarios();
      if (Array.isArray(lista)) setUsers(lista.map(mapUsuarioFromBackend));
      toast.success('Usuario creado correctamente');
    } catch {
      // Fallback local si el backend no está disponible
      const newUser: User = { ...userData, id: Date.now().toString() };
      setUsers(prev => [...prev, newUser]);
      toast.warning('Usuario creado localmente (backend no disponible)');
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    const user = users.find(u => u.id === id);
    if (userData.password && user?.cedula) {
      try { await api.restablecerPasswordUsuario(user.cedula, userData.password); } catch { }
    }
    setUsers(users.map(user => user.id === id ? { ...user, ...userData } : user));
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    try {
      if (user?.cedula) await api.deleteUsuario(user.cedula);
    } catch { /* continuar con eliminación local */ }
    setUsers(users.filter(user => user.id !== id));
    setSchedules(schedules.filter(schedule => schedule.doctorId !== id));
    toast.success('Usuario eliminado');
  };

  const handleAddSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    // Persistir en backend
    try {
      const res = await api.createHorario({
        studentId: scheduleData.studentId,
        doctorId: scheduleData.doctorId,
        area: scheduleData.area,
        fecha: scheduleData.fecha,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
      });
      if (res?.ok === false) {
        toast.error(res.mensaje || 'Error al crear horario');
        return;
      }
      // Recargar horarios del backend
      const lista = await api.getHorarios();
      if (Array.isArray(lista)) setSchedules(lista.map(mapHorarioFromBackend));
    } catch {
      // Fallback local
      setSchedules(prev => {
        const duplicate = prev.find(s =>
          s.studentId === scheduleData.studentId &&
          s.fecha === scheduleData.fecha &&
          s.area === scheduleData.area
        );
        if (duplicate) return prev;
        const newSchedule: Schedule = {
          ...scheduleData,
          id: Date.now().toString() + Math.random().toString(36).slice(2)
        };
        return [...prev, newSchedule];
      });
    }
  };

  const handleAddArea = async (areaData: Omit<Area, 'id'>) => {
    try {
      const res = await api.createArea({
        nombre: areaData.nombre,
        piso: 1,
        capacidadMaxima: areaData.capacidadMaxima,
      });
      if (res?.ok === false) { toast.error(res.mensaje || 'Error al crear área'); return; }
      const lista = await api.getAreas();
      if (Array.isArray(lista)) setAreas(lista.map(mapAreaFromBackend));
      toast.success('Área creada exitosamente');
    } catch {
      const newArea: Area = { ...areaData, id: Date.now().toString() };
      setAreas(prev => [...prev, newArea]);
      toast.warning('Área creada localmente (backend no disponible)');
    }
  };

  const handleUpdateArea = (id: string, areaData: Partial<Area>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...areaData } : a));
    toast.success('Área actualizada correctamente');
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await api.deleteArea(id);
      const lista = await api.getAreas();
      if (Array.isArray(lista)) setAreas(lista.map(mapAreaFromBackend));
    } catch {
      setAreas(areas.filter(a => a.id !== id));
    }
    toast.success('Área eliminada');
  };

  // Importación masiva desde Excel: intenta batch, hace fallback fila a fila,
  // y recarga los horarios UNA sola vez al terminar.
  const handleImportBatch = async (rows: Array<{ studentId: string; doctorId: string; area: string; fecha: string; startTime: string; endTime: string }>) => {
    if (rows.length === 0) return;
    let exitosos = 0;
    let fallidos = 0;
    const erroresMsgs: string[] = [];

    try {
      // Intentar endpoint batch primero
      const res = await (api as any).importarHorarios(rows);
      if (res && res.total !== undefined) {
        exitosos = res.exitosos ?? 0;
        fallidos = res.fallidos ?? 0;
        (res.errores || []).slice(0, 5).forEach((e: any) => erroresMsgs.push(`Fila ${e.fila}: ${e.mensaje}`));
      } else {
        throw new Error('endpoint_not_available');
      }
    } catch {
      // Fallback: enviar una por una, ESPERANDO cada respuesta
      for (const row of rows) {
        try {
          const res = await api.createHorario(row);
          if (res?.ok === false) {
            fallidos++;
            erroresMsgs.push(res.mensaje || 'Error desconocido');
          } else {
            exitosos++;
          }
        } catch {
          fallidos++;
          erroresMsgs.push(`Error de red para ${row.fecha} / ${row.area}`);
        }
      }
    }

    // UNA sola recarga al terminar todo
    try {
      const lista = await api.getHorarios();
      if (Array.isArray(lista)) setSchedules(lista.map(mapHorarioFromBackend));
    } catch { /* mantiene estado local si falla */ }

    if (exitosos > 0) toast.success(`${exitosos} horario(s) importado(s) correctamente`);
    if (fallidos > 0) toast.error(`${fallidos} fila(s) con error: ${erroresMsgs.slice(0, 3).join(' | ')}`, { duration: 8000 });
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.deleteHorario(id);
      const lista = await api.getHorarios();
      if (Array.isArray(lista)) setSchedules(lista.map(mapHorarioFromBackend));
    } catch {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    }
  };

  const handleUpdateSchedule = async (id: string, data: Partial<Schedule>) => {
    // Actualizar estado local inmediatamente (optimistic update)
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    // Persistir en backend si hay campos de horario
    if (data.startTime !== undefined || data.endTime !== undefined || data.area !== undefined) {
      const current = schedules.find(s => s.id === id);
      if (current) {
        try {
          const res = await api.updateHorario(id, {
            startTime: data.startTime ?? current.startTime,
            endTime: data.endTime ?? current.endTime,
            area: data.area ?? current.area,
            doctorId: data.doctorId ?? current.doctorId,
          });
          if (res?.ok === false) {
            toast.error(res.mensaje || 'Error al actualizar horario');
          } else {
            // Recargar lista actualizada
            const lista = await api.getHorarios();
            if (Array.isArray(lista)) setSchedules(lista.map(mapHorarioFromBackend));
          }
        } catch {
          // Mantener cambio local si el backend no esta disponible
        }
      }
    }
  };

  const handleAddStudent = async (studentData: any) => {
    // Verificar si la cédula ya existe
    const cedulaExists = students.some(s => s.cedula === studentData.cedula);
    if (cedulaExists) {
      toast.error('Esta cédula ya está registrada en el sistema');
      return;
    }

    try {
      const payload = mapEstudianteToBackend(studentData);
      const res = await api.createEstudiante(payload);
      if (res?.ok === false) {
        toast.error(res.mensaje || 'Error al registrar estudiante');
        return;
      }
      // Recargar lista desde backend
      const lista = await api.getEstudiantes();
      if (Array.isArray(lista)) setStudents(lista.map(mapEstudianteFromBackend));
      toast.success(`Estudiante ${studentData.name || studentData.nombresCompletos} registrado exitosamente`);
    } catch (err) {
      // Fallback local
      const newId = students.length > 0
        ? String(Math.max(...students.map(s => parseInt(s.id) || 0)) + 1).padStart(3, '0')
        : '001';
      const newStudent: Student = {
        ...studentData,
        id: newId,
        estado: studentData.estado || 'ACTIVO',
        attendanceHistory: []
      };
      setStudents(prev => [...prev, newStudent]);
      toast.warning(`Estudiante registrado localmente (backend no disponible)`);
    }
  };

  const handleUpdateStudent = async (id: string, studentData: Partial<Student>) => {
    const existing = students.find(s => s.id === id);
    const merged = { ...existing, ...studentData } as Student;

    // Actualizar local inmediatamente (optimistic)
    setStudents(students.map(s => s.id === id ? merged : s));

    // Si el usuario actual es el estudiante que se está actualizando, actualizar también currentUser
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.id === id) {
      setCurrentUser({
        ...currentUser,
        studentData: merged
      });
    }

    // FIX: si todos los campos requeridos están completos y venía PENDIENTE, auto-ACTIVO
    const camposCompletos = !!(
      merged.nombresCompletos && (merged.apellidosCompletos || merged.apellidos) && merged.cedula &&
      merged.programa && merged.institucionEducativa &&
      merged.email && merged.celular &&
      merged.estadoCivil && merged.fechaNacimiento && merged.lugarNacimiento &&
      merged.genero && merged.direccionTunja && merged.nombreRepresentanteLegal &&
      merged.parentesco && merged.celularRepresentanteLegal
    );
    if (camposCompletos && existing?.estado === 'PENDIENTE' && merged.estado === 'PENDIENTE') {
      merged.estado = 'ACTIVO';
      setStudents(prev => prev.map(s => s.id === id ? merged : s));
    }

    // Persistir en backend
    try {
      if (existing?.cedula) {
        const payload = mapEstudianteToBackend(merged);
        await api.updateEstudiante(existing.cedula, payload);
      }
    } catch (err) {
      console.warn('No se pudo guardar en backend:', err);
    }

    toast.success('Estudiante actualizado correctamente');
  };

  const handleCheckIn = async (cedula: string) => {
    const student = students.find(s => s.cedula === cedula);
    if (!student) {
      toast.error('Cédula no encontrada en el sistema');
      return false;
    }

    if (student.estado === 'PENDIENTE') {
      toast.error('Debes completar tu información personal antes de poder registrar asistencia');
      return false;
    }

    if (student.checkInTime && !student.checkOutTime) {
      toast.error(`${student.name} ya ha registrado su ingreso a las ${student.checkInTime}.\nDebe registrar primero su salida.`);
      return false;
    }

    // FIX: El backend es la fuente de verdad.
    // Si el backend rechaza (ARL vencida, sin horario, etc.), se muestra el error
    // y NO se hace registro local. El catch solo permite continuar si el backend
    // está completamente caído (sin conexión).
    try {
      const res = await api.checkin(cedula);
      if (!res || res.ok === false) {
        toast.error(res?.mensaje || 'No se pudo registrar el ingreso. Verifique con el sistema.');
        return false;
      }
    } catch (err) {
      // Backend no disponible — registrar solo localmente con advertencia
      toast.error('No se pudo conectar con el servidor. El ingreso se registró solo localmente.');
      console.warn('Backend no disponible para checkin:', err);
    }

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkInDate = now.toISOString().split('T')[0];

    const updatedStudent = {
      ...student,
      checkInTime,
      checkInDate,
      checkOutTime: undefined,
      checkOutDate: undefined
    };

    setStudents(students.map(s =>
      s.cedula === cedula ? updatedStudent : s
    ));

    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({
        ...currentUser,
        studentData: updatedStudent
      });
    }

    toast.success(`Bienvenido/a ${student.name} — Ingreso: ${checkInTime} — ${new Date().toLocaleDateString('es-CO')}`);
    return true;
  };

  const handleCheckOut = async (cedula: string) => {
    const student = students.find(s => s.cedula === cedula);
    if (!student) {
      toast.error('Cédula no encontrada en el sistema');
      return;
    }

    if (!student.checkInTime) {
      toast.error('Debes registrar primero tu ingreso antes de registrar la salida');
      return;
    }

    if (student.checkOutTime) {
      toast.error(`Ya registraste tu salida a las ${student.checkOutTime}`);
      return;
    }

    // FIX: El backend es la fuente de verdad para el checkout también.
    // Si retorna ok=false, mostrar el error y NO actualizar el estado local.
    try {
      const res = await api.checkout(cedula);
      if (!res || res.ok === false) {
        toast.error(res?.mensaje || 'No se pudo registrar la salida. Verifique con el sistema.');
        return;
      }
    } catch (err) {
      // Backend no disponible — continuar con registro local con advertencia
      toast.error('No se pudo conectar con el servidor. La salida se registró solo localmente.');
      console.warn('Backend no disponible para checkout:', err);
    }

    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkOutDate = now.toISOString().split('T')[0];

    const [inHours, inMinutes] = student.checkInTime!.split(':').map(Number);
    const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const horasTrabajadas = totalMinutes / 60;

    const today = student.checkInDate || checkOutDate;
    const horarioProgramado = schedules.find(
      s => s.studentId === student.id && s.fecha === today
    );

    let cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario' = 'sin_horario';
    if (horarioProgramado) {
      const llegoTarde = student.checkInTime! > horarioProgramado.startTime;
      const salioTemprano = checkOutTime < horarioProgramado.endTime;
      if (!llegoTarde && !salioTemprano) cumplimiento = 'completo';
      else if (llegoTarde) cumplimiento = 'llegada_tarde';
      else if (salioTemprano) cumplimiento = 'salida_temprano';
    }

    const nuevoRegistro: AttendanceRecord = {
      fecha: today,
      checkInTime: student.checkInTime!,
      checkOutTime,
      horasTrabajadas,
      area: horarioProgramado?.area,
      horarioProgramado: horarioProgramado ? {
        inicio: horarioProgramado.startTime,
        fin: horarioProgramado.endTime
      } : undefined,
      cumplimiento
    };

    const updatedStudent = {
      ...student,
      checkOutTime,
      checkOutDate,
      attendanceHistory: [...(student.attendanceHistory || []), nuevoRegistro]
    };

    setStudents(students.map(s =>
      s.cedula === cedula ? updatedStudent : s
    ));

    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({
        ...currentUser,
        studentData: updatedStudent
      });
    }

    toast.success(`Hasta luego ${student.name} — Salida: ${checkOutTime} — Total: ${hours}h ${minutes}min`);
  };

  const totalStudents = students.filter(s => s.estado === 'ACTIVO').length;
  const today = new Date().toISOString().split('T')[0];
  const totalSchedulesToday = schedules.filter(s => s.fecha === today).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presencia', label: 'Panel de Presencia', icon: Activity },
    { id: 'registro', label: 'Registro Estudiantes', icon: ClipboardList },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'areas', label: 'Áreas', icon: Building2 },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'cronograma', label: 'Cronograma', icon: Calendar },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  // Credencial única del Administrador (hardcodeada - no se puede modificar desde la interfaz)
  const ADMIN_CREDENTIALS = {
    cedula: '1234567890',
    password: 'admin2026',
    name: 'Administrador del Sistema'
  };

  const handleLogin = async (documento: string, password: string, role: string) => {
    // ── El administrador se valida siempre localmente (no va al backend) ──
    if (role === 'administrador') {
      if (documento === ADMIN_CREDENTIALS.cedula && password === ADMIN_CREDENTIALS.password) {
        setCurrentUser({
          documento: ADMIN_CREDENTIALS.cedula,
          role: 'administrador',
          name: ADMIN_CREDENTIALS.name,
          permissions: [] // permisos vacíos → hasPermission() usa el rol
        });
        setIsAuthenticated(true);
        toast.success(`¡Bienvenido/a ${ADMIN_CREDENTIALS.name}!`);
      } else {
        toast.error('Credenciales de administrador incorrectas.');
      }
      return;
    }

    // Intentar login desde el backend primero
    try {
      const res = await api.login(documento, password);

      if (res?.ok === true) {
        // Normalizar el rol: 'admin' → 'administrador', etc.
        const normalizeRole = (r: string) => {
          if (!r) return role;
          const map: Record<string, string> = { admin: 'administrador' };
          return map[r.toLowerCase()] || r.toLowerCase();
        };
        const backendRole = normalizeRole(res.role || role);

        // Verificar que el rol del backend coincida con el seleccionado en el formulario
        if (backendRole !== role) {
          toast.error('Credenciales incorrectas. Por favor verifica tus datos.');
          return;
        }

        // Si es estudiante, buscar sus datos en la lista local
        if (backendRole === 'estudiante') {
          const student = students.find(s => s.cedula === documento);
          if (student) {
            setCurrentUser({
              documento: student.cedula,
              role: 'estudiante',
              name: res.name || student.name,
              studentData: student
            });
            setIsAuthenticated(true);
            if (student.estado === 'PENDIENTE') {
              toast.warning(`Bienvenido/a ${res.name?.split(' ')[0]}. Debes completar tu perfil.`);
            } else {
              toast.success(`¡Bienvenido/a ${res.name?.split(' ')[0]}!`);
            }
            return;
          }
        }

        // Para otros roles: usar permisos del backend o vacío (fallback a rol)
        setCurrentUser({
          documento,
          role: backendRole,
          name: res.name || '',
          permissions: [] // dejar vacío para que hasPermission() use el rol
        });
        setIsAuthenticated(true);
        toast.success(`¡Bienvenido/a ${res.name?.split(' ')[0] || documento}!`);
        return;
      }

      if (res?.ok === false) {
        toast.error(res.mensaje || 'Credenciales incorrectas');
        return;
      }
    } catch {
      // Backend no disponible — caer en modo local
    }

    if (role === 'estudiante') {
      const student = students.find(s => s.cedula === documento && (s.estado === 'ACTIVO' || s.estado === 'PENDIENTE'));
      if (!student) {
        toast.error('Estudiante no encontrado o inactivo.');
        return;
      }
      const studentPassword = student.password || student.cedula;
      if (password !== studentPassword) {
        toast.error('Contraseña incorrecta.');
        return;
      }
      setCurrentUser({
        documento: student.cedula,
        role: 'estudiante',
        name: student.name,
        studentData: student
      });
      setIsAuthenticated(true);
      toast.success(`¡Bienvenido/a ${student.name.split(' ')[0]}!`);
      return;
    }

    const user = users.find(
      (u) => u.cedula === documento && u.password === password && u.role === role
    );
    if (user) {
      setCurrentUser({ documento: user.cedula, role: user.role, name: user.name, permissions: user.permissions });
      setIsAuthenticated(true);
      toast.success(`¡Bienvenido/a ${user.name}!`);
    } else {
      toast.error('Credenciales incorrectas. Por favor verifica tus datos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} darkMode={darkMode} onToggleDark={toggleDarkMode} />
      </>
    );
  }

  // Si es estudiante PENDIENTE, forzar completar perfil
  // Leer estado en tiempo real del array students, no de la copia en currentUser
  const estudianteEnVivo = currentUser?.role === 'estudiante'
    ? students.find(s => s.cedula === currentUser.documento)
    : null;

  if (currentUser?.role === 'estudiante' && estudianteEnVivo?.estado === 'PENDIENTE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-teal-50">
        <Toaster position="top-right" richColors />
        {/* ── FAB Modo Oscuro/Claro ── */}
        <button id="dm-fab" onClick={toggleDarkMode} title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          <span className="dm-icon">{darkMode ? '☀️' : '🌙'}</span>
          <div className="dm-track"><div className="dm-thumb" /></div>
          <span className="dm-label">{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <header className="bg-white shadow-md border-b-4 border-teal-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden drop-shadow-lg">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Completa tu Perfil</h1>
                <p className="text-sm text-gray-600 font-medium">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-200">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-amber-700">Debes completar tus datos para acceder al sistema</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </header>
        <main className="p-8 max-w-5xl mx-auto">
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
            <ClipboardList className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-bold text-amber-800">Perfil incompleto — acceso restringido</p>
              <p className="text-sm text-amber-700">Por favor completa todos tus datos personales. Una vez guardados, podrás acceder al sistema para registrar tu entrada y salida.</p>
            </div>
          </div>
          <CompleteProfileForm
            student={estudianteEnVivo || currentUser.studentData}
            onUpdateStudent={(id, updatedData) => {
              handleUpdateStudent(id, updatedData as any);
            }}
          />
        </main>
      </div>
    );
  }

  // Si es estudiante, mostrar su dashboard especial
  if (currentUser?.role === 'estudiante' && currentUser.studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-teal-50">
        <Toaster position="top-right" richColors />
        {/* ── FAB Modo Oscuro/Claro ── */}
        <button id="dm-fab" onClick={toggleDarkMode} title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          <span className="dm-icon">{darkMode ? '☀️' : '🌙'}</span>
          <div className="dm-track"><div className="dm-thumb" /></div>
          <span className="dm-label">{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        {/* Header para Estudiantes */}
        <header className="bg-white shadow-md border-b-4 border-teal-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Portal del Estudiante</h1>
                <p className="text-sm text-gray-600 font-medium">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-3 rounded-2xl border-2 border-teal-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 capitalize font-medium">Estudiante</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido del Estudiante */}
        <main className="p-8">
          <StudentDashboard
            student={estudianteEnVivo || currentUser.studentData}
            schedules={schedules}
            users={users}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onUpdateStudent={(id, s) => { handleUpdateStudent(id, s as any); }}
          />
        </main>
      </div>
    );
  }

  // Handler cambiar contraseña desde sidebar
  const handleSidebarChangePassword = async () => {
    if (!sidebarPwActual) { toast.error('Ingresa tu contraseña actual'); return; }
    if (sidebarPwNueva.length < 6) { toast.error('La nueva contraseña debe tener mínimo 6 caracteres'); return; }
    if (sidebarPwNueva !== sidebarPwConfirm) { toast.error('Las contraseñas nuevas no coinciden'); return; }

    try {
      // El backend verifica la contraseña actual — si falla lanza error
      const res = await api.cambiarPassword(currentUser!.documento, sidebarPwActual, sidebarPwNueva);
      if (res?.ok === false) {
        toast.error(res.mensaje || 'La contraseña actual es incorrecta');
        return;
      }
    } catch {
      // Si el backend no está disponible, verificar localmente como fallback
      const userInList = users.find(u => u.cedula === currentUser?.documento);
      const studentInList = students.find(s => s.cedula === currentUser?.documento);
      const actualPw = userInList?.password || studentInList?.password || currentUser?.documento;
      if (sidebarPwActual !== actualPw) { toast.error('La contraseña actual es incorrecta'); return; }
    }

    // Actualizar en estado local también
    const userInList = users.find(u => u.cedula === currentUser?.documento);
    const studentInList = students.find(s => s.cedula === currentUser?.documento);
    if (userInList) handleUpdateUser(userInList.id, { password: sidebarPwNueva });
    else if (studentInList) handleUpdateStudent(studentInList.id, { password: sidebarPwNueva });

    toast.success('✅ Contraseña actualizada correctamente');
    setShowSidebarPwModal(false);
    setSidebarPwActual(''); setSidebarPwNueva(''); setSidebarPwConfirm('');
  };

  // Filtrar menú según permisos del rol
  const filteredMenuItems = menuItems.filter(item => {
    const viewPermissionMap: Record<string, string> = {
      'dashboard': 'ver_dashboard',
      'presencia': 'ver_presencia',
      'registro': 'ver_registro_estudiantes',
      'usuarios': 'ver_usuarios',
      'areas': 'ver_areas',
      'horarios': 'ver_horarios',
      'cronograma': 'ver_cronograma',
      'reportes': 'ver_reportes'
    };

    const requiredPermission = viewPermissionMap[item.id];
    if (!requiredPermission) return true;
    // Siempre usar el rol para determinar permisos (los permisos del backend son informativos)
    return hasPermission(currentUser?.role || '', requiredPermission);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-teal-50 flex">
      <Toaster position="top-right" richColors />

      {/* ── FAB Modo Oscuro/Claro (esquina inferior derecha) ── */}
      <button id="dm-fab" onClick={toggleDarkMode} title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
        <span className="dm-icon">{darkMode ? '☀️' : '🌙'}</span>
        <div className="dm-track"><div className="dm-thumb" /></div>
        <span className="dm-label">{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>


      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-700 to-teal-500 text-white transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-teal-500/30">
          {sidebarOpen ? (
            <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden drop-shadow-lg">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Hospital</span>
                <p className="text-xs text-blue-100">San Rafael de Tunja</p>
              </div>
            </button>
          ) : (
            <button onClick={() => setActiveView('dashboard')} className="w-14 h-14 flex items-center justify-center overflow-hidden mx-auto drop-shadow-lg hover:opacity-80 transition-opacity cursor-pointer">
              <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all rounded-lg mx-2 ${activeView === item.id
                  ? 'bg-white/20 border-l-4 border-white shadow-lg backdrop-blur-sm'
                  : 'hover:bg-white/10 border-l-4 border-transparent'
                  }`}
              >
                <Icon className="w-5 h-5 text-white" />
                {sidebarOpen && <span className="font-semibold text-sm text-white">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-teal-500/30 p-4 space-y-2">
          {sidebarOpen && currentUser && (
            <div className="mb-1 p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-blue-100 mb-1">Sesión activa:</p>
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-blue-200 capitalize">{currentUser.role}</p>
            </div>
          )}
          {/* Cambiar contraseña rápido */}
          <button
            onClick={() => { setShowSidebarPwModal(true); setSidebarPwActual(''); setSidebarPwNueva(''); setSidebarPwConfirm(''); }}
            className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-2.5 bg-teal-600/80 hover:bg-teal-500 text-white rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2`}
            title="Cambiar contraseña"
          >
            <Lock className="w-4 h-4" />
            {sidebarOpen && <span className="font-medium">Cambiar Contraseña</span>}
          </button>
          {/* Toggle Modo Oscuro */}
          <button
            onClick={toggleDarkMode}
            className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2`}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4" />}
            {sidebarOpen && <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 hover:bg-blue-800 transition-colors border-t border-teal-500/30"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-md border-b-4 border-teal-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Hospital Universitario San Rafael de Tunja</h1>
              <p className="text-sm text-gray-600 font-medium">Sistema de Gestión Hospitalaria</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-3 rounded-2xl border-2 border-teal-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 capitalize font-medium">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-6 col-span-1 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-teal-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Total Personal</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>{users.length}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Usuarios registrados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Estudiantes</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalStudents}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">En rotación</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Turnos Hoy</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sky-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalSchedulesToday}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Programados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Áreas Activas</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>{[...new Set(schedules.map(s => s.area))].length}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Departamentos</p>
                </div>
              </div>

              {/* Active Students */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Estudiantes Activos</h2>
                    <span onClick={() => setActiveView('registro')} className="text-sm text-blue-700 cursor-pointer hover:text-blue-700 font-semibold hover:underline">Ver todos →</span>
                  </div>
                  <div className="space-y-3">
                    {students.filter(s => s.estado === 'ACTIVO').slice(0, 5).map(student => {
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl hover:from-blue-100 hover:to-teal-100 transition-all duration-300 border border-teal-100">
                          <div className="flex items-center gap-3">
                            {student.foto ? (
                              <img src={student.foto} alt={student.name} className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-md ${student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'
                                }`}>
                                <User className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-800">{student.name}</div>
                              <div className="text-xs text-gray-500">
                                {student.programa} - {student.universidad}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.induccionHospitalaria ? 'bg-teal-100 text-teal-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {student.induccionHospitalaria ? 'Con inducción' : 'Sin inducción'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {students.filter(s => s.estado === 'ACTIVO').length === 0 && (
                      <div className="text-center py-8 text-gray-500">No hay estudiantes registrados</div>
                    )}
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Horarios de Hoy</h2>
                  <div className="space-y-3">
                    {schedules.filter(s => {
                      const today = new Date().toISOString().split('T')[0];
                      return s.fecha === today;
                    }).slice(0, 6).map(schedule => {
                      const student = students.find(s => (s.cedula || s.id) === schedule.studentId || s.id === schedule.studentId);
                      const doctor = users.find(u => (u.cedula || u.id) === schedule.doctorId || u.id === schedule.doctorId);
                      return (
                        <div key={schedule.id} className="border-l-4 border-blue-600 pl-3 py-2">
                          <div className="flex items-center gap-2">
                            {student?.foto ? (
                              <img src={student.foto} alt={student.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-200" />
                            ) : (
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${student?.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'}`}>{student?.genero === 'masculino' ? <User className="w-4 h-4" /> : <UserCircle2 className="w-4 h-4" />}</span>
                            )}
                            <div className="font-medium text-sm text-gray-800">{student?.name}</div>
                          </div>
                          <div className="text-xs text-gray-600">{schedule.area}</div>
                          <div className="text-xs text-gray-500">Dr. {doctor?.name}</div>
                          <div className="text-xs text-blue-600 mt-1">{schedule.startTime} - {schedule.endTime}</div>
                        </div>
                      );
                    })}
                    {schedules.filter(s => {
                      const today = new Date().toISOString().split('T')[0];
                      return s.fecha === today;
                    }).length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">Sin horarios hoy</div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'usuarios' && (
            <UserManagement
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUserRole={currentUser?.role || ''}
              currentUserDocumento={currentUser?.documento || ''}
            />
          )}

          {activeView === 'areas' && (
            <AreaManagement
              areas={areas}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onDeleteArea={handleDeleteArea}
            />
          )}

          {activeView === 'horarios' && (
            <ScheduleManagement
              schedules={schedules}
              users={users}
              students={students}
              areas={areas}
              onAddSchedule={handleAddSchedule}
              onImportBatch={handleImportBatch}
              onDeleteSchedule={handleDeleteSchedule}
              onUpdateSchedule={handleUpdateSchedule}
            />
          )}

          {activeView === 'cronograma' && (
            <CronogramaView schedules={schedules} users={users} students={students} areas={areas} />
          )}

          {activeView === 'presencia' && (
            <PresencePanel
              users={users}
              schedules={schedules}
              students={students}
              areas={areas}
              onCheckIn={handleCheckIn as any}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeView === 'registro' && (
            <StudentRegistry
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {activeView === 'reportes' && (
            <Reports
              users={users}
              schedules={schedules}
              students={students}
              areas={areas}
              currentUserRole={currentUser?.role}
            />
          )}
        </main>
      </div>

      {/* ── MODAL CAMBIAR CONTRASEÑA (sidebar) ── */}
      {showSidebarPwModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500">{currentUser?.name}</p>
              </div>
              <button onClick={() => setShowSidebarPwModal(false)} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contraseña actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showSidebarPwA ? 'text' : 'password'}
                    value={sidebarPwActual}
                    onChange={e => setSidebarPwActual(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowSidebarPwA(!showSidebarPwA)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showSidebarPwA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showSidebarPwN ? 'text' : 'password'}
                    value={sidebarPwNueva}
                    onChange={e => setSidebarPwNueva(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowSidebarPwN(!showSidebarPwN)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showSidebarPwN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar nueva */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showSidebarPwC ? 'text' : 'password'}
                    value={sidebarPwConfirm}
                    onChange={e => setSidebarPwConfirm(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                    onKeyDown={e => { if (e.key === 'Enter') handleSidebarChangePassword(); }}
                  />
                  <button type="button" onClick={() => setShowSidebarPwC(!showSidebarPwC)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showSidebarPwC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {sidebarPwNueva && sidebarPwConfirm && sidebarPwNueva !== sidebarPwConfirm && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Las contraseñas no coinciden</p>
                )}
                {sidebarPwNueva && sidebarPwConfirm && sidebarPwNueva === sidebarPwConfirm && (
                  <p className="text-teal-600 text-xs mt-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSidebarChangePassword}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-teal-600 transition-all shadow-md"
                >
                  Guardar Nueva Contraseña
                </button>
                <button
                  onClick={() => setShowSidebarPwModal(false)}
                  className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">¿Olvidaste tu contraseña actual? Pídele al <strong>Administrador</strong> o al <strong>Director</strong> que te la restablezcan.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}