package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class ReporteRepository {

    private final JdbcTemplate jdbc;

    public ReporteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> historialPorEstudiante(String cedula) {
        return jdbc.queryForList("""
                SELECT e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    e.cedula,
                    ra.timestamp_entrada,
                    ra.timestamp_salida,
                    ra.horas_cumplidas,
                    ra.resultado_validacion,
                    ra.motivo_rechazo,
                    sh.nombre AS servicio,
                    ap.hora_inicio,
                    ap.hora_fin
                FROM registro_acceso ra
                JOIN estudiante e ON e.id_estudiante = ra.id_estudiante
                LEFT JOIN asignacion_practica ap ON ap.id_asignacion = ra.id_asignacion
                LEFT JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE e.cedula = ?
                ORDER BY ra.timestamp_entrada DESC
                """, cedula);
    }

    public List<Map<String, Object>> arlProximaAVencer() {
        return jdbc.queryForList("""
                SELECT e.cedula,
                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    e.programa_academico,
                    e.arl_vigencia_fin,
                    (e.arl_vigencia_fin - CURRENT_DATE) AS dias_restantes
                FROM estudiante e
                WHERE e.arl_vigencia_fin IS NOT NULL
                AND e.arl_vigencia_fin <= CURRENT_DATE + INTERVAL '15 days'
                AND UPPER(e.estado) = 'ACTIVO'
                ORDER BY e.arl_vigencia_fin ASC
                """);
    }

    public List<Map<String, Object>> rechazadosHoy() {
        return jdbc.queryForList("""
                SELECT e.cedula,
                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    ra.timestamp_entrada AS momento,
                    ra.motivo_rechazo
                FROM registro_acceso ra
                JOIN estudiante e ON e.id_estudiante = ra.id_estudiante
                WHERE ra.resultado_validacion = 'RECHAZADO'
                AND ra.timestamp_entrada::date = CURRENT_DATE
                ORDER BY ra.timestamp_entrada DESC
                """);
    }

    public List<Map<String, Object>> horasAcumuladas() {
        return jdbc.queryForList("""
                SELECT e.cedula,
                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    e.programa_academico,
                    COALESCE(SUM(ra.horas_cumplidas), 0) AS horas_cumplidas
                FROM estudiante e
                LEFT JOIN registro_acceso ra ON ra.id_estudiante = e.id_estudiante
                    AND ra.resultado_validacion = 'APROBADO'
                WHERE e.estado = 'activo'
                GROUP BY e.id_estudiante, e.cedula, e.nombres_completos, e.apellidos_completos, e.programa_academico
                ORDER BY horas_cumplidas DESC
                """);
    }
}