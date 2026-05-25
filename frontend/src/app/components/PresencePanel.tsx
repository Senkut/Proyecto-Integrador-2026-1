import React from 'react';
import { useState } from 'react';
import { Users, Monitor, AlertTriangle, Bell, CheckCircle, LogIn, LogOut, Clock, User, UserCircle2, Timer } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  cedula: string;
  universidad: string;
  programa: string;
  genero: 'masculino' | 'femenino';
  induccionHospitalaria: boolean;
  estado: string;
  checkInTime?: string;
  checkInDate?: string;
  checkOutTime?: string;
  checkOutDate?: string;
  foto?: string;
}

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface PresencePanelProps {
  users: any[];
  schedules: any[];
  students: Student[];
  areas: Area[];
  onCheckIn: (cedula: string) => boolean | Promise<boolean>;
  onCheckOut: (cedula: string) => void;
}

export function PresencePanel({ users, schedules, students, areas, onCheckIn, onCheckOut }: PresencePanelProps) {
  const [cedula, setCedula] = useState('');
  const currentTime = new Date();
  const currentTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  const _now = new Date(); const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  // presentes activos
  const studentsInHospital = students.filter(s => s.checkInTime && !s.checkOutTime && s.estado === 'ACTIVO');

  // área de cada estudiante
  const getStudentArea = (studentId: string): string | undefined => {
    const todaySchedule = schedules.find(s =>
      s.studentId === studentId &&
      s.fecha === today &&
      currentTimeStr >= s.startTime &&
      currentTimeStr <= s.endTime
    );
    return todaySchedule?.area;
  };

  // Obtener horario programado del estudiante para hoy
  const getStudentSchedule = (studentId: string) => {
    return schedules.find(s =>
      s.studentId === studentId &&
      s.fecha === today
    );
  };

  // ocupación por área
  const areaOccupancy = areas.map(area => {
    const ocupados = studentsInHospital.filter(s => getStudentArea(s.id) === area.nombre).length;
    const porcentaje = (ocupados / area.capacidadMaxima) * 100;
    let color = 'green';
    if (porcentaje >= 100) color = 'red';
    else if (porcentaje >= 80) color = 'yellow';

    return {
      ...area,
      ocupados,
      porcentaje,
      color
    };
  });

  const areasLlenas = areaOccupancy.filter(a => a.porcentaje >= 100).length;
  const areasCasiLlenas = areaOccupancy.filter(a => a.porcentaje >= 80 && a.porcentaje < 100).length;
  const activeAlerts = areasLlenas + areasCasiLlenas;

  const totalStudents = students.length;
  const totalActivos = students.filter(s => s.estado === 'ACTIVO').length;

  const handleCheckIn = async () => {
    const result = await onCheckIn(cedula);
    if (result) {
      setCedula('');
    }
  };

  const handleCheckOut = () => {
    onCheckOut(cedula);
    setCedula('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Presencia</h2>
          <p className="text-sm text-gray-600">Control en tiempo real</p>
        </div>
        {activeAlerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Bell className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">{activeAlerts} estudiante(s) excediendo tiempo</span>
          </div>
        )}
      </div>

      {/* Formulario de Validación por Cédula */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Validación de Ingreso/Salida</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ingrese número de cédula"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCheckIn}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Check Out
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-blue-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">EN EL HOSPITAL</span>
          </div>
          <div className="text-4xl font-bold text-blue-600">{studentsInHospital.length}</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-teal-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">ESTUDIANTES ACTIVOS</span>
          </div>
          <div className="text-4xl font-bold text-blue-700">{totalActivos}</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-orange-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">ESTUDIANTES TOTAL</span>
          </div>
          <div className="text-4xl font-bold text-orange-600">{totalStudents}</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">ALERTAS ACTIVAS</span>
          </div>
          <div className="text-4xl font-bold text-red-600">{activeAlerts}</div>
        </div>
      </div>

      {/* Students in Hospital Now */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Estudiantes en el Hospital Ahora</h3>
            <button className="text-sm text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTUDIANTE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ÁREA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORARIO PROGRAMADO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORARIO REAL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {studentsInHospital.map(student => {
                  const schedule = getStudentSchedule(student.cedula || student.id);
                  const scheduledStart = schedule?.startTime;
                  const scheduledEnd = schedule?.endTime;
                  const actualStart = student.checkInTime;
                  const actualEnd = student.checkOutTime;


                  const isLate = scheduledStart && actualStart ? actualStart > scheduledStart : false;
                  const isEarly = scheduledEnd && actualEnd ? actualEnd < scheduledEnd : false;

                  return (
                    <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">
                          #{student.id}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {student.foto ? (
                            <img src={student.foto} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl ${student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'
                              }`}>
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.cedula}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                          {getStudentArea(student.cedula || student.id) || 'Sin área'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {scheduledStart && scheduledEnd ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-mono">{scheduledStart} - {scheduledEnd}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Horario asignado</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin horario</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {actualStart && (
                            <div className="flex items-center gap-2">
                              <LogIn className="w-4 h-4 text-teal-600" />
                              <span className={`font-mono text-sm font-medium ${isLate ? 'text-red-600' : 'text-teal-600'}`}>
                                {actualStart}
                              </span>
                              {isLate && <span className="text-xs text-red-500 font-medium"><AlertTriangle className="w-3 h-3 inline mr-1" />Tarde</span>}
                            </div>
                          )}
                          {actualEnd && (
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4 text-orange-600" />
                              <span className={`font-mono text-sm font-medium ${isEarly ? 'text-red-600' : 'text-orange-600'}`}>
                                {actualEnd}
                              </span>
                              {isEarly && <span className="text-xs text-red-500 font-medium"><AlertTriangle className="w-3 h-3 inline mr-1" />Salió temprano</span>}
                            </div>
                          )}
                          {!actualEnd && (
                            <div className="text-xs text-blue-600 font-medium">En turno...</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-teal-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Presente</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {studentsInHospital.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No hay estudiantes en el hospital en este momento
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Capacidad por Área */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Capacidad por Área</h3>
          <div className="space-y-3">
            {areaOccupancy.map((area) => {
              return (
                <div key={area.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{area.nombre}</span>
                    <span className={`font-semibold ${area.color === 'red' ? 'text-red-600' :
                      area.color === 'yellow' ? 'text-yellow-600' :
                        'text-teal-600'
                      }`}>
                      {area.ocupados}/{area.capacidadMaxima}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${area.color === 'red' ? 'bg-red-500' :
                        area.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-teal-500'
                        }`}
                      style={{ width: `${Math.min(area.porcentaje, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {area.ciudad} - Sede {area.sede}
                  </div>
                </div>
              );
            })}
            {areas.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay áreas configuradas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Asistencia del Día */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Historial de Asistencia Hoy - {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-teal-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ESTUDIANTE</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">HORARIO PROGRAMADO</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ENTRADA REAL</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SALIDA REAL</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(s => s.checkInDate === today)
                .map(student => {
                  const schedule = getStudentSchedule(student.cedula || student.id);
                  const scheduledStart = schedule?.startTime;
                  const scheduledEnd = schedule?.endTime;
                  const actualStart = student.checkInTime;
                  const actualEnd = student.checkOutTime;

                  const isLate = scheduledStart && actualStart ? actualStart > scheduledStart : false;
                  const isEarly = scheduledEnd && actualEnd ? actualEnd < scheduledEnd : false;

                  return (
                    <tr key={student.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'
                            }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.programa}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                          {schedule?.area || 'Sin área'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {scheduledStart && scheduledEnd ? (
                          <span className="text-sm text-gray-700 font-mono">{scheduledStart} - {scheduledEnd}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Sin horario</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {actualStart ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-sm font-medium ${isLate ? 'text-red-600' : 'text-teal-600'}`}>
                              {actualStart}
                            </span>
                            {isLate && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Tarde</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin registro</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {actualEnd ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-sm font-medium ${isEarly ? 'text-red-600' : 'text-orange-600'}`}>
                              {actualEnd}
                            </span>
                            {isEarly && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Temprano</span>}
                          </div>
                        ) : actualStart ? (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">En turno</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          {scheduledStart && scheduledEnd ? (
                            <>
                              {isLate && <div className="text-red-600"><AlertTriangle className="w-3 h-3 inline mr-1" />Llegó tarde</div>}
                              {isEarly && <div className="text-red-600"><AlertTriangle className="w-3 h-3 inline mr-1" />Salió antes de tiempo</div>}
                              {!isLate && !isEarly && actualStart && actualEnd && <div className="text-teal-600">Cumplió horario</div>}
                              {actualStart && !actualEnd && <div className="text-blue-600"><Timer className="w-3 h-3 inline mr-1" />Aún en turno</div>}
                            </>
                          ) : (
                            <>
                              {actualStart && !actualEnd && <div className="text-blue-600"><Timer className="w-3 h-3 inline mr-1" />En turno (sin horario)</div>}
                              {actualStart && actualEnd && <div className="text-gray-600">Registro completo</div>}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {students.filter(s => s.checkInDate === today || s.checkInTime).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay registros de asistencia para hoy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}