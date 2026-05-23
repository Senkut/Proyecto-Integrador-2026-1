import React from 'react';
import { Calendar, Clock, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  [key: string]: any;
}

interface Schedule {
  id: string;
  studentId: string;
  fecha: string;
  startTime: string;
  endTime: string;
  area: string;
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

interface ProductivityReportProps {
  student: Student;
  schedules: Schedule[];
  attendanceHistory: AttendanceRecord[];
}

export function ProductivityReport({ student, schedules, attendanceHistory }: ProductivityReportProps) {
  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalHoras = attendanceHistory.reduce((acc, record) => acc + record.horasTrabajadas, 0);
    const diasTrabajados = attendanceHistory.filter(r => r.checkInTime && r.checkOutTime).length;
    const promedioHorasDia = diasTrabajados > 0 ? totalHoras / diasTrabajados : 0;

    const cumplimientoCompleto = attendanceHistory.filter(r => r.cumplimiento === 'completo').length;
    const porcentajeCumplimiento = attendanceHistory.length > 0
      ? (cumplimientoCompleto / attendanceHistory.length) * 100
      : 0;

    return {
      totalHoras: totalHoras.toFixed(1),
      diasTrabajados,
      promedioHorasDia: promedioHorasDia.toFixed(1),
      porcentajeCumplimiento: porcentajeCumplimiento.toFixed(0)
    };
  };

  const stats = calcularEstadisticas();

  // Últimos 7 días
  const ultimos7Dias = attendanceHistory.slice(-7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7" />
          Reporte de Productividad
        </h2>
        <p className="text-teal-100">Resumen de tus horas trabajadas y cumplimiento</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{stats.totalHoras}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Total Horas</h3>
          <p className="text-xs text-gray-500 mt-1">Acumuladas</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-teal-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-teal-600" />
            <span className="text-3xl font-bold text-teal-600">{stats.diasTrabajados}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Días Trabajados</h3>
          <p className="text-xs text-gray-500 mt-1">Con registro completo</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-orange-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">{stats.promedioHorasDia}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Promedio Diario</h3>
          <p className="text-xs text-gray-500 mt-1">Horas por día</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-teal-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-teal-600" />
            <span className="text-3xl font-bold text-teal-600">{stats.porcentajeCumplimiento}%</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Cumplimiento</h3>
          <p className="text-xs text-gray-500 mt-1">De horarios</p>
        </div>
      </div>

      {/* Gráfico de Últimos 7 Días */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          Últimos 7 Días
        </h3>
        <div className="space-y-3">
          {ultimos7Dias.length > 0 ? (
            ultimos7Dias.map((record, idx) => {
              const maxHoras = 12;
              const porcentaje = (record.horasTrabajadas / maxHoras) * 100;

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {new Date(record.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{record.horasTrabajadas.toFixed(1)}h</span>
                      {record.cumplimiento === 'completo' && <span className="text-teal-600 text-xs">✓</span>}
                      {record.cumplimiento === 'llegada_tarde' && <span className="text-orange-600 text-xs"></span>}
                      {record.cumplimiento === 'salida_temprano' && <span className="text-red-600 text-xs"></span>}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        record.cumplimiento === 'completo' ? 'bg-teal-500' :
                        record.cumplimiento === 'llegada_tarde' ? 'bg-orange-500' :
                        record.cumplimiento === 'salida_temprano' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay registros de asistencia aún
            </div>
          )}
        </div>
      </div>

      {/* Historial Detallado */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial Detallado</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-teal-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">FECHA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">PROGRAMADO</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ENTRADA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SALIDA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">HORAS</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.slice().reverse().map((record, idx) => (
                  <tr key={idx} className="border-t border-gray-100 hover:bg-teal-50/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {new Date(record.fecha).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                        {record.area || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {record.horarioProgramado
                        ? `${record.horarioProgramado.startTime} - ${record.horarioProgramado.endTime}`
                        : 'Sin horario'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-teal-700">
                      {record.checkInTime || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-orange-700">
                      {record.checkOutTime || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-700">
                      {record.horasTrabajadas.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3">
                      {record.cumplimiento === 'completo' && (
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                          ✓ Completo
                        </span>
                      )}
                      {record.cumplimiento === 'llegada_tarde' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                           Tarde
                        </span>
                      )}
                      {record.cumplimiento === 'salida_temprano' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                           Temprano
                        </span>
                      )}
                      {record.cumplimiento === 'sin_horario' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                           Sin horario
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay registros de asistencia
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
