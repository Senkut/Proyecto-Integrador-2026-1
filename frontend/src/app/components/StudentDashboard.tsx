import React from 'react';
import { useState } from 'react';

import { Calendar, Clock, FileText, LogIn, LogOut, CheckCircle, XCircle, User, UserCircle2, Activity, BarChart3, Lock, Eye, EyeOff, Building2 as Hospital, Users, Phone, BookOpen, ClipboardList, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { CompleteProfileForm } from './CompleteProfileForm';
import { EditProfileForm } from './EditProfileForm';
import { ProductivityReport } from './ProductivityReport';

interface AttendanceRecord {
  fecha: string;
  checkInTime?: string;
  checkOutTime?: string;
  horasTrabajadas: number;
  area?: string;
  horarioProgramado?: {
    startTime: string;
    endTime: string;
  };
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario';
}

interface Student {
  id: string;
  name: string;
  cedula: string;
  programa: string;
  institucionEducativa?: string;
  universidad: string;
  nombresCompletos?: string;
  apellidosCompletos?: string;
  tipoDocumento?: string;
  tipoVinculacion?: string;
  foto?: string;
  genero: 'masculino' | 'femenino';
  checkInTime?: string;
  checkOutTime?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  estadoCivil?: string;
  celular?: string;
  email?: string;
  direccionTunja?: string;
  lugarResidenciaPermanente?: string;
  nombreRepresentanteLegal?: string;
  parentesco?: string;
  celularRepresentanteLegal?: string;
  ciudadRepresentanteLegal?: string;
  grupoSanguineo?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  idiomaAdicional?: string;
  actividadesComplementarias?: string;
  companerosTunja?: string;
  semestre?: string;
  induccionHospitalaria?: boolean;
  fechaInduccion?: string;
  arl?: boolean;
  fechaARL?: string;
  attendanceHistory?: AttendanceRecord[];
  [key: string]: any;
}

interface Schedule {
  id: string;
  studentId: string;
  doctorId: string;
  area: string;
  fecha: string;
  startTime: string;
  endTime: string;
  day?: string;
  diaSemana?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface StudentDashboardProps {
  student: Student;
  schedules: Schedule[];
  users: User[];
  onCheckIn: (cedula: string) => boolean | Promise<boolean>;
  onCheckOut: (cedula: string) => void;
  onUpdateStudent?: (id: string, data: any) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export function StudentDashboard({ student, schedules, users, onCheckIn, onCheckOut, onUpdateStudent, darkMode, onToggleDark }: StudentDashboardProps) {
  // pendiente: mostrar form
  if (student.estado === 'PENDIENTE') {
    if (!onUpdateStudent) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Error: No se puede completar el perfil en este momento.</p>
        </div>
      );
    }
    return <CompleteProfileForm student={student} onUpdateStudent={onUpdateStudent} />;
  }

  const [cedula, setCedula] = useState('');
  const [activeTab, setActiveTab] = useState<'presencia' | 'cronograma' | 'perfil' | 'productividad'>('presencia');
  const [showEditProfile, setShowEditProfile] = useState(false);
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwActual, setPwActual] = useState('');
  const [pwNueva, setPwNueva] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPwActual, setShowPwActual] = useState(false);
  const [showPwNueva, setShowPwNueva] = useState(false);

  // horarios del estudiantel backend)
  const mySchedules = schedules.filter(s =>
    s.studentId === student.id ||
    s.studentId === student.cedula
  );

  // Horarios de hoy
  const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todaySchedules = mySchedules.filter(s => s.fecha === today);

  // Horarios de la semana
  const getWeekSchedules = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return mySchedules.filter(s => {
      const scheduleDate = new Date(s.fecha);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });
  };

  const weekSchedules = getWeekSchedules();

  const handleCheckIn = () => {
    if (!cedula) {
      toast.error('Por favor ingresa tu número de cédula');
      return;
    }

    if (cedula !== student.cedula) {
      toast.error('La cédula ingresada no coincide con tu registro');
      return;
    }

    const success = onCheckIn(cedula);
    if (success) {
      setCedula('');
    }
  };

  const handleCheckOut = () => {
    if (!cedula) {
      toast.error('Por favor ingresa tu número de cédula');
      return;
    }

    if (cedula !== student.cedula) {
      toast.error('La cédula ingresada no coincide con tu registro');
      return;
    }

    if (!student.checkInTime) {
      toast.error('Debes hacer check-in primero antes de hacer check-out');
      return;
    }

    if (student.checkOutTime) {
      toast.error('Ya has registrado tu salida');
      return;
    }

    onCheckOut(cedula);
    setCedula('');
  };


  const totalHorasEstaSemana = weekSchedules.reduce((acc, s) => {
    const start = new Date(`2000-01-01T${s.startTime}`);
    const end = new Date(`2000-01-01T${s.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header con Info del Estudiante */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-800 dark:to-teal-800 rounded-2xl shadow-lg p-8 text-white relative">
        {/* Dark mode toggle inside header */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 hover:bg-white/30 transition-all duration-200 text-sm font-medium"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <><Sun className="w-4 h-4 text-yellow-300" /><span className="hidden sm:inline text-white/90">Modo claro</span></>
            ) : (
              <><Moon className="w-4 h-4 text-white" /><span className="hidden sm:inline text-white/90">Modo oscuro</span></>
            )}
          </button>
        )}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden flex items-center justify-center">
            {student.foto ? (
              <img src={student.foto} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido/a, {student.nombresCompletos + ' ' + student.apellidosCompletos}!</h1>
            <p className="text-blue-100 text-lg">{student.programa}</p>
            <p className="text-blue-200 text-sm">{student.universidad}</p>
            <p className="text-blue-200 text-sm mt-2">Cédula: {student.cedula}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Estado Actual</div>
            {student.checkInTime && !student.checkOutTime ? (
              <div className="flex items-center gap-2 bg-teal-500/30 px-4 py-2 rounded-lg border border-green-300/50">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">En Hospital</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-500/30 px-4 py-2 rounded-lg border border-gray-300/50">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Fuera</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-teal-100 dark:border-gray-700 p-2 transition-colors">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('presencia')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-semibold transition-all ${activeTab === 'presencia'
              ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <Activity className="w-5 h-5" />
            <span className="hidden md:inline">Presencia</span>
          </button>
          <button
            onClick={() => setActiveTab('cronograma')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-semibold transition-all ${activeTab === 'cronograma'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">Cronograma</span>
          </button>
          <button
            onClick={() => setActiveTab('productividad')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-semibold transition-all ${activeTab === 'productividad'
              ? 'bg-gradient-to-r from-blue-700 to-teal-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden md:inline">Productividad</span>
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-semibold transition-all ${activeTab === 'perfil'
              ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Mi Perfil</span>
          </button>
        </div>
      </div>

      {/* Tab Content - Panel de Presencia */}
      {activeTab === 'presencia' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-700 dark:text-cyan-400" />
                </div>
                <span className="text-3xl font-bold text-blue-700 dark:text-cyan-400">{todaySchedules.length}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">Turnos Hoy</h3>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{totalHorasEstaSemana.toFixed(1)}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">Horas Esta Semana</h3>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-blue-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mySchedules.length}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">Total Turnos</h3>
            </div>
          </div>

          {/* Panel de Registro de Presencia */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <LogIn className="w-6 h-6 text-blue-700 dark:text-teal-400" />
              Registro de Entrada/Salida
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ingresa tu Cédula para Registrar
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Número de cédula"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 text-center text-lg font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    maxLength={12}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={!!(student.checkInTime && !student.checkOutTime)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-5 h-5" />
                    Entrada
                  </button>

                  <button
                    onClick={handleCheckOut}
                    disabled={!!((!student.checkInTime) || student.checkOutTime)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-5 h-5" />
                    Salida
                  </button>
                </div>
              </div>

              <div className="border-2 border-teal-200 dark:border-teal-800 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Registro de Hoy</h3>
                <div className="space-y-3">
                  {todaySchedules.length > 0 ? (
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-700 mb-2">
                      <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1"> Horario Programado</div>
                      <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
                        {todaySchedules[0].startTime} - {todaySchedules[0].endTime}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Área: {todaySchedules[0].area}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 mb-2">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1"> Horario Programado</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No tienes horario asignado para hoy
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Aún puedes registrar tu asistencia
                      </div>
                    </div>
                  )}
                  {student.checkInTime && (
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-800">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Entrada Real:</span>
                        {todaySchedules.length > 0 ? (
                          <>
                            {student.checkInTime > todaySchedules[0].startTime && (
                              <div className="text-xs text-red-600 font-medium mt-1"> Llegaste tarde</div>
                            )}
                            {student.checkInTime <= todaySchedules[0].startTime && (
                              <div className="text-xs text-teal-600 font-medium mt-1">A tiempo</div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 font-medium mt-1">Sin horario programado</div>
                        )}
                      </div>
                      <span className="text-lg font-bold text-teal-600">{student.checkInTime}</span>
                    </div>
                  )}
                  {student.checkOutTime && (
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-900">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Salida Real:</span>
                        {todaySchedules.length > 0 ? (
                          <>
                            {student.checkOutTime < todaySchedules[0].endTime && (
                              <div className="text-xs text-red-600 font-medium mt-1"> Saliste temprano</div>
                            )}
                            {student.checkOutTime >= todaySchedules[0].endTime && (
                              <div className="text-xs text-teal-600 font-medium mt-1">Completaste el turno</div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 font-medium mt-1">Sin horario programado</div>
                        )}
                      </div>
                      <span className="text-lg font-bold text-orange-600">{student.checkOutTime}</span>
                    </div>
                  )}
                  {!student.checkInTime && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-500">
                      <p className="text-sm">Aún no has registrado tu entrada hoy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mi Horario */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-700 dark:text-teal-400" />
              Mi Horario
            </h2>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Horarios de Hoy</h3>
              {todaySchedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todaySchedules.map((schedule) => {
                    const doctor = users.find(u => u.id === schedule.doctorId);
                    return (
                      <div key={schedule.id} className="border-l-4 border-teal-500 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800 dark:text-gray-100">{schedule.area}</span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-semibold">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Supervisor: {doctor?.name}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tienes turnos programados para hoy</p>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mt-6">Próximos Turnos</h3>
              {mySchedules.filter(s => new Date(s.fecha) > new Date()).length > 0 ? (
                <div className="space-y-3">
                  {mySchedules
                    .filter(s => new Date(s.fecha) > new Date())
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .slice(0, 5)
                    .map((schedule) => {
                      const doctor = users.find(u => u.id === schedule.doctorId);
                      return (
                        <div key={schedule.id} className="border border-gray-200 bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-800">{schedule.area}</span>
                              <p className="text-sm text-gray-600">Supervisor: {doctor?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-blue-700">
                                {new Date(schedule.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-gray-500">{schedule.startTime} - {schedule.endTime}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tienes turnos próximos programados</p>
                </div>
              )}
            </div>
          </div>

          {/* Mi Reporte de Productividad */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-teal-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-700" />
              Mi Reporte de Productividad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-700/60">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del Mes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Días asistidos:</span>
                    <span className="font-bold text-blue-600">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Horas completadas:</span>
                    <span className="font-bold text-blue-600">{totalHorasEstaSemana.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Áreas rotadas:</span>
                    <span className="font-bold text-blue-600">{new Set(mySchedules.map(s => s.area)).size}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700/60">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Áreas de Rotación</h3>
                <div className="space-y-2">
                  {Array.from(new Set(mySchedules.map(s => s.area))).map((area, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{area}</span>
                    </div>
                  ))}
                  {mySchedules.length === 0 && (
                    <p className="text-sm text-gray-500">Sin rotaciones asignadas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Cronograma */}
      {activeTab === 'cronograma' && (
        <div className="space-y-6">
          {/* Header info */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-800 dark:to-cyan-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Mi Cronograma de Prácticas</h2>
            </div>
            <p className="text-teal-100 text-sm">Aquí puedes ver todos tus horarios asignados con las horas de entrada y salida según tu rotación.</p>
          </div>

          {/* Turno de hoy destacado */}
          {(() => {
            const hoy_now = new Date(); const hoy = `${hoy_now.getFullYear()}-${String(hoy_now.getMonth() + 1).padStart(2, '0')}-${String(hoy_now.getDate()).padStart(2, '0')}`;
            const turnosHoy = mySchedules.filter(s => s.fecha === hoy);
            if (turnosHoy.length === 0) return null;
            return (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-teal-400 dark:border-teal-700 p-6">
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-teal-500 rounded-full animate-pulse inline-block"></span>
                  Turno de Hoy | {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="space-y-3">
                  {turnosHoy.map(s => {
                    const doc = users.find(u => u.id === s.doctorId || u.cedula === s.doctorId);
                    return (
                      <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                            <Hospital className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{s.area}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Área de rotación</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-2xl text-blue-700 dark:text-blue-300">{s.startTime}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hora de entrada</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-2xl text-orange-600 dark:text-orange-400">{s.endTime}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hora de salida</p>
                          </div>
                        </div>
                        {doc && (
                          <div className="md:col-span-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-t border-teal-200 dark:border-teal-800 pt-2 mt-1">
                            <Users className="w-4 h-4 text-teal-500" />
                            <span>Supervisor: <strong>{doc.name}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Lista completa de horarios */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-teal-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                Todos mis horarios asignados ({mySchedules.length})
              </h3>
            </div>

            {mySchedules.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-lg">Sin horarios asignados</p>
                <p className="text-sm mt-1">Comunícate con tu docente supervisor para que asigne tus rotaciones.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {mySchedules
                  .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                  .map((s) => {
                    const hoy_now = new Date(); const hoy = `${hoy_now.getFullYear()}-${String(hoy_now.getMonth() + 1).padStart(2, '0')}-${String(hoy_now.getDate()).padStart(2, '0')}`;
                    const esHoy = s.fecha === hoy;
                    const esPasado = s.fecha < hoy;
                    const doc = users.find(u => u.id === s.doctorId || u.cedula === s.doctorId);


                    const [hI, mI] = s.startTime.split(':').map(Number);
                    const [hF, mF] = s.endTime.split(':').map(Number);
                    const durMin = (hF * 60 + mF) - (hI * 60 + mI);
                    const durHoras = Math.floor(durMin / 60);
                    const durMins = durMin % 60;


                    const registroAsistencia = student.attendanceHistory?.find(r => r.fecha === s.fecha);

                    return (
                      <div key={s.id} className={`p-4 transition-colors ${esHoy ? 'bg-teal-50 dark:bg-teal-950/20' : esPasado ? 'bg-gray-50 dark:bg-gray-800/50 opacity-80' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Fecha */}
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-md ${esHoy ? 'bg-teal-600' : esPasado ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600'}`}>
                              <span className="text-xs leading-none">{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short' }).toUpperCase()}</span>
                              <span className="text-xl leading-none">{new Date(s.fecha + 'T12:00:00').getDate()}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                                {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long' })}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{s.fecha}</p>
                              {esHoy && <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">HOY</span>}
                            </div>
                          </div>

                          {/* Área */}
                          <div className="flex items-center gap-2 flex-1">
                            <Hospital className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-100">{s.area}</p>
                              {doc && <p className="text-xs text-gray-500 dark:text-gray-400">Dr. {doc.name}</p>}
                            </div>
                          </div>

                          {/* Horas */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                              <LogIn className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Entrada</p>
                                <p className="font-bold text-blue-700 dark:text-blue-300 text-lg">{s.startTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                              <LogOut className="w-4 h-4 text-orange-600" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Salida</p>
                                <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">{s.endTime}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                              <p className="font-bold text-gray-700 dark:text-gray-300">{durHoras}h{durMins > 0 ? ` ${durMins}m` : ''}</p>
                            </div>
                          </div>

                          {/* Estado de asistencia */}
                          <div className="min-w-[100px] text-center">
                            {esPasado ? (
                              registroAsistencia ? (
                                <div>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${registroAsistencia.cumplimiento === 'completo' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                    registroAsistencia.cumplimiento === 'llegada_tarde' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                                      'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                    }`}>
                                    {registroAsistencia.cumplimiento === 'completo' ? 'Completo' :
                                      registroAsistencia.cumplimiento === 'llegada_tarde' ? 'Tarde' : 'Temprano'}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {registroAsistencia.checkInTime} - {registroAsistencia.checkOutTime}
                                  </p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                  Sin registro
                                </span>
                              )
                            ) : esHoy ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 animate-pulse">
                                ● En curso
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                Próximo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content - Productividad */}
      {activeTab === 'productividad' && (
        <ProductivityReport
          student={student}
          schedules={schedules}
          attendanceHistory={student.attendanceHistory || []}
        />
      )}

      {/* Tab Content - Mi Perfil */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          {/* Información del Perfil */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-700 dark:text-teal-400" />
                Mi Información Personal
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md font-semibold flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </button>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-md font-semibold"
                >
                  Editar Perfil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Información Personal</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Nombre Completo:</span> <span className="font-medium">{student.name}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Cédula:</span> <span className="font-medium">{student.cedula}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Fecha de Nacimiento:</span> <span className="font-medium">{student.fechaNacimiento || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Lugar de Nacimiento:</span> <span className="font-medium">{student.lugarNacimiento || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Estado Civil:</span> <span className="font-medium">{student.estadoCivil || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Género:</span> <span className="font-medium capitalize">{student.genero}</span></div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Información Académica</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Programa:</span> <span className="font-medium">{student.programa}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Universidad:</span> <span className="font-medium">{student.universidad}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Semestre:</span> <span className="font-medium">{student.semestre || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Tipo de Vinculación:</span> <span className="font-medium">{student.tipoVinculacion}</span></div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Información de Contacto</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Celular:</span> <span className="font-medium">{student.celular}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Email:</span> <span className="font-medium">{student.email}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Dirección en Tunja:</span> <span className="font-medium">{student.direccionTunja || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Residencia Permanente:</span> <span className="font-medium">{student.lugarResidenciaPermanente || 'No especificado'}</span></div>
                </div>
              </div>

              {/* Representante Legal */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Representante Legal</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Nombre:</span> <span className="font-medium">{student.nombreRepresentanteLegal || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Parentesco:</span> <span className="font-medium">{student.parentesco || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Celular:</span> <span className="font-medium">{student.celularRepresentanteLegal || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Ciudad:</span> <span className="font-medium">{student.ciudadRepresentanteLegal || 'No especificado'}</span></div>
                </div>
              </div>

              {/* Información de Salud */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Información de Salud</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Grupo Sanguíneo:</span> <span className="font-medium">{student.grupoSanguineo || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Alergias:</span> <span className="font-medium">{student.alergias || 'Ninguna registrada'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Peso:</span> <span className="font-medium">{student.peso ? `${student.peso} kg` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Talla:</span> <span className="font-medium">{student.talla ? `${student.talla} cm` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">IMC:</span> <span className="font-medium">{student.imc ? `${student.imc} kg/m²` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Enfermedades Generales:</span> <span className="font-medium">{student.enfermedadesGenerales || 'Ninguna registrada'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Enfermedades Mentales:</span> <span className="font-medium">{student.enfermedadesMentales || 'Ninguna registrada'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Medicamentos:</span> <span className="font-medium">{student.medicamentos || 'Ninguno registrado'}</span></div>
                </div>
              </div>

              {/* Aspectos Familiares */}
              <div className="border-l-4 border-pink-500 pl-4 self-start">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Aspectos Familiares</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Padre:</span> <span className="font-medium">{student.nombrePadre ? `${student.nombrePadre}${student.edadPadre ? ` (${student.edadPadre} años)` : ''}` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Madre:</span> <span className="font-medium">{student.nombreMadre ? `${student.nombreMadre}${student.edadMadre ? ` (${student.edadMadre} años)` : ''}` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Esposo(a):</span> <span className="font-medium">{student.nombreEsposo ? `${student.nombreEsposo}${student.edadEsposo ? ` (${student.edadEsposo} años)` : ''}` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Hijos:</span> <span className="font-medium">{student.tieneHijos ? (student.nombreHijos || 'Sí') : 'No'}</span></div>
                  {student.tieneHijos && student.edadesHijos && (
                    <div><span className="text-gray-600 dark:text-gray-400">Edades de hijos:</span> <span className="font-medium">{student.edadesHijos}</span></div>
                  )}
                </div>
              </div>

              {/* Otros Datos */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"> Otros Datos</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600 dark:text-gray-400">Idioma Adicional:</span> <span className="font-medium">{student.idiomaAdicional || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Actividades Complementarias:</span> <span className="font-medium">{student.actividadesComplementarias || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Convivencia en Tunja:</span> <span className="font-medium">{student.companerosTunja || 'No especificado'}</span></div>
                  <div><span className="text-gray-600 dark:text-gray-400">Núcleo Familiar en Tunja:</span> <span className="font-medium">{student.nucleoFamiliarTunja || 'No especificado'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Requisitos Hospitalarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-teal-100 dark:border-gray-700 p-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                Inducción Hospitalaria
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${student.induccionHospitalaria ? 'bg-teal-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                  <div className="flex items-center gap-2">
                    {student.induccionHospitalaria ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-teal-800">Completada</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pendiente</span>
                      </>
                    )}
                  </div>
                  {student.fechaInduccion && (
                    <div className="text-sm text-gray-700 mt-2">
                      Fecha: {new Date(student.fechaInduccion).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-blue-100 dark:border-gray-700 p-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                ARL Vigente
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${student.arl ? 'bg-teal-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                  <div className="flex items-center gap-2">
                    {student.arl ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-teal-800">Vigente</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pendiente</span>
                      </>
                    )}
                  </div>
                  {student.fechaARL && (
                    <div className="text-sm text-gray-700 mt-2">
                      Vigencia hasta: {new Date(student.fechaARL).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Perfil */}
      {showEditProfile && onUpdateStudent && (
        <EditProfileForm
          student={student}
          onUpdateStudent={onUpdateStudent}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingresa tu contraseña actual para continuar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPwActual ? 'text' : 'password'}
                    value={pwActual}
                    onChange={(e) => setPwActual(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-400 dark:focus:border-teal-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  />
                  <button type="button" onClick={() => setShowPwActual(!showPwActual)} className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500">
                    {showPwActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPwNueva ? 'text' : 'password'}
                    value={pwNueva}
                    onChange={(e) => setPwNueva(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-400 dark:focus:border-teal-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  />
                  <button type="button" onClick={() => setShowPwNueva(!showPwNueva)} className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500">
                    {showPwNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-400 dark:focus:border-teal-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                />
              </div>

              {pwNueva && pwConfirm && pwNueva !== pwConfirm && (
                <p className="text-red-500 text-sm"> Las contraseñas nuevas no coinciden</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const currentPw = student.password || student.cedula;
                    if (pwActual !== currentPw) {
                      toast.error('La contraseña actual es incorrecta');
                      return;
                    }
                    if (pwNueva.length < 6) {
                      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
                      return;
                    }
                    if (pwNueva !== pwConfirm) {
                      toast.error('Las contraseñas nuevas no coinciden');
                      return;
                    }
                    if (onUpdateStudent) {
                      onUpdateStudent(student.id, { password: pwNueva });
                      toast.success(' Contraseña actualizada correctamente');
                      setShowPasswordForm(false);
                      setPwActual(''); setPwNueva(''); setPwConfirm('');
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-teal-600 transition-all"
                >
                  Guardar Nueva Contraseña
                </button>
                <button
                  onClick={() => { setShowPasswordForm(false); setPwActual(''); setPwNueva(''); setPwConfirm(''); }}
                  className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
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