import React from 'react';
import { useState } from 'react';
import { TrendingUp, Clock, CheckCircle, User, UserCircle2, Calendar, AlertCircle } from 'lucide-react';

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
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario';
}

interface Student {
  id: string;
  name: string;
  cedula: string;
  universidad: string;
  programa: string;
  genero: 'masculino' | 'femenino';
  estado: string;
  checkInTime?: string;
  checkOutTime?: string;
  foto?: string;
  attendanceHistory?: AttendanceRecord[];
}

interface ReportsProps {
  users: any[];
  schedules: Schedule[];
  students: Student[];
  areas: any[];
  currentUserRole?: string;
}

export function Reports({ users, schedules, students, areas, currentUserRole }: ReportsProps) {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const studentDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) setStudentDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const canViewAllReports = currentUserRole === 'director' || currentUserRole === 'administrador';

  // Get all attendance records (real hours) from all students
  const allAttendanceRecords = students.flatMap(student =>
    (student.attendanceHistory || []).map(record => ({
      ...record,
      studentId: student.id,
      studentName: student.name,
      studentFoto: student.foto,
      studentGenero: student.genero,
      universidad: student.universidad,
      programa: student.programa,
    }))
  );

  // Filter real attendance records
  const filteredRecords = allAttendanceRecords.filter(record => {
    if (filterStartDate && record.fecha < filterStartDate) return false;
    if (filterEndDate && record.fecha > filterEndDate) return false;
    if (selectedStudent && record.studentId !== selectedStudent) return false;
    // Only count completed records (both check-in and check-out done)
    if (!record.checkInTime || !record.checkOutTime) return false;
    return true;
  });

  const totalRealHours = filteredRecords.reduce((sum, r) => sum + r.horasTrabajadas, 0);

  // Hours per student (real)
  const studentHours = students
    .filter(s => s.estado === 'ACTIVO')
    .map(student => {
      const records = filteredRecords.filter(r => r.studentId === student.id);
      const hours = records.reduce((sum, r) => sum + r.horasTrabajadas, 0);
      return { student, hours: hours.toFixed(1), turnos: records.length };
    })
    .filter(sh => sh.turnos > 0)
    .sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));

  // Hours per area (real)
  const areaHours = [...new Set(filteredRecords.map(r => r.area).filter(Boolean))].map(area => {
    const records = filteredRecords.filter(r => r.area === area);
    const hours = records.reduce((sum, r) => sum + r.horasTrabajadas, 0);
    return { area, hours: hours.toFixed(1), turnos: records.length };
  }).sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));

  const cumplimientoStats = {
    completo: filteredRecords.filter(r => r.cumplimiento === 'completo').length,
    llegada_tarde: filteredRecords.filter(r => r.cumplimiento === 'llegada_tarde').length,
    salida_temprano: filteredRecords.filter(r => r.cumplimiento === 'salida_temprano').length,
    sin_horario: filteredRecords.filter(r => r.cumplimiento === 'sin_horario').length,
  };

  const areaDistribution = areaHours.map(ah => ({
    area: ah.area,
    percentage: totalRealHours > 0 ? ((parseFloat(ah.hours) / totalRealHours) * 100).toFixed(1) : '0',
    hours: ah.hours
  }));

  const colors = ['bg-blue-600', 'bg-teal-600', 'bg-yellow-600', 'bg-red-600', 'bg-teal-600', 'bg-teal-600', 'bg-teal-600', 'bg-blue-700'];

  const activeStudents = students.filter(s => s.estado === 'ACTIVO').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-teal-500" />
            Solo horas realmente cumplidas (check-in + check-out completados)
          </p>
        </div>
      </div>

      {filteredRecords.length === 0 && allAttendanceRecords.filter(r => r.checkInTime && r.checkOutTime).length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Aún no hay horas confirmadas</p>
            <p className="text-sm text-amber-700 mt-1">Los reportes se generan automáticamente cuando los estudiantes registran su entrada <strong>y</strong> salida usando su número de identificación. Las horas programadas no se cuentan hasta que se validen con presencia real.</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
            <div ref={studentDropdownRef} className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={studentSearch || (selectedStudent ? (students.find(s => s.id === selectedStudent)?.name || '') : '')}
                onChange={e => { setStudentSearch(e.target.value); setStudentDropdownOpen(true); if (!e.target.value) setSelectedStudent(''); }}
                onFocus={() => setStudentDropdownOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {studentDropdownOpen && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-500"
                    onClick={() => { setSelectedStudent(''); setStudentSearch(''); setStudentDropdownOpen(false); }}
                  >
                    — Todos los estudiantes —
                  </div>
                  {students
                    .filter(s => {
                      const q = studentSearch.toLowerCase();
                      return !q || s.name.toLowerCase().includes(q) || (s.cedula && s.cedula.includes(q));
                    })
                    .map(student => (
                      <div key={student.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => { setSelectedStudent(student.id); setStudentSearch(''); setStudentDropdownOpen(false); }}>
                        <span className="mr-1">{student.genero === 'masculino' ? <User className="w-5 h-5" /> : <UserCircle2 className="w-5 h-5" />}</span>
                        <span className="font-medium">{student.name}</span>
                        {student.cedula && <span className="text-gray-400 text-xs ml-2">· {student.cedula}</span>}
                      </div>
                    ))}
                  {students.filter(s => { const q = studentSearch.toLowerCase(); return !q || s.name.toLowerCase().includes(q) || (s.cedula && s.cedula.includes(q)); }).length === 0 && (
                    <div className="px-3 py-4 text-center text-gray-400 text-sm">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setSelectedStudent('');
                setStudentSearch('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Horas Totales</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{totalRealHours.toFixed(1)}</div>
          <div className="text-sm mt-2 opacity-90">{filteredRecords.length} registros confirmados</div>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-teal-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Estudiantes Activos</span>
            <User className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{activeStudents}</div>
          <div className="text-sm mt-2 opacity-90">{students.length} total</div>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-teal-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Áreas con Actividad</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{areaHours.length}</div>
          <div className="text-sm mt-2 opacity-90">de {areas.length} áreas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horas por Estudiante */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Horas por Estudiante</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {studentHours.length > 0 ? studentHours.slice(0, 10).map((sh, index) => (
              <div key={sh.student.id}>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    {sh.student.foto ? (
                      <img src={sh.student.foto} alt={sh.student.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        sh.student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'
                      }`}>
                        {sh.student.genero === 'masculino' ? 'M' : 'F'}
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{sh.student.name}</span>
                  </div>
                  <span className="text-gray-600 font-semibold">{sh.hours}h ✓ ({sh.turnos} turnos)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((parseFloat(sh.hours) / parseFloat(studentHours[0].hours)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos para mostrar con los filtros actuales
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Área */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Horas por Área</h3>

          <div className="space-y-3">
            {areaDistribution.length > 0 ? areaDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm text-gray-700">{item.area}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item.hours}h</span>
                </div>
                <div className="text-xs text-gray-500 ml-5">{item.percentage}% del total</div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay datos de áreas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horas por Área - Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle por Área</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORAS TOTALES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTUDIANTES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">TURNOS</th>
              </tr>
            </thead>
            <tbody>
              {areaHours.length > 0 ? areaHours.map((ah, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-800">{ah.area}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                      {ah.hours}h ✓ real
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Set(filteredRecords.filter(r => r.area === ah.area).map(r => r.studentId)).size}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ah.turnos}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial Detallado — solo horas reales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-500" /> Historial de Horas Reales
          </h3>
          <span className="text-sm text-gray-600">{filteredRecords.length} registros confirmados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTUDIANTE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">FECHA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">INGRESO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">SALIDA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORAS REALES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">CUMPLIMIENTO</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.slice(0, 30).map((r, i) => {
                const student = students.find(s => s.id === r.studentId);
                return (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {student?.foto ? (
                          <img src={student.foto} alt={student.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${student?.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'}`}>
                            {student?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800">{r.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.fecha}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">{r.area || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{r.checkInTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{r.checkOutTime}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">{r.horasTrabajadas.toFixed(1)}h ✓</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        r.cumplimiento === 'completo' ? 'bg-teal-100 text-teal-700' :
                        r.cumplimiento === 'llegada_tarde' ? 'bg-yellow-100 text-yellow-700' :
                        r.cumplimiento === 'salida_temprano' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.cumplimiento === 'completo' ? ' Completo' :
                         r.cumplimiento === 'llegada_tarde' ? ' Llegó tarde' :
                         r.cumplimiento === 'salida_temprano' ? ' Salió temprano' : ' Sin horario'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay registros confirmados aún. Los reportes aparecen cuando los estudiantes registran entrada y salida.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRecords.length > 30 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando 30 de {filteredRecords.length} registros
          </div>
        )}
      </div>
    </div>
  );
}
