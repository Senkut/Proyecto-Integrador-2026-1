package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PresenciaRepository {

    private final JdbcTemplate jdbc;

    public PresenciaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Estudiantes actualmente dentro (ingresaron hoy, sin salida)
    public List<Map<String, Object>> estudiantesDentro() {
        return jdbc.queryForList("""
                SELECT e.cedula,
                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    e.programa_academico,
                    sh.nombre AS servicio,
                    sh.piso,
                    ra.timestamp_entrada
                FROM registro_acceso ra
                JOIN estudiante e ON e.id_estudiante = ra.id_estudiante
                LEFT JOIN asignacion_practica ap ON ap.id_asignacion = ra.id_asignacion
                LEFT JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE ra.resultado_validacion = 'APROBADO'
                AND ra.timestamp_salida IS NULL
                AND ra.timestamp_entrada::date = CURRENT_DATE
                ORDER BY ra.timestamp_entrada DESC
                """);
    }

    public int totalDentro() {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM registro_acceso
                WHERE resultado_validacion = 'APROBADO'
                AND timestamp_salida IS NULL
                AND timestamp_entrada::date = CURRENT_DATE
                """, Integer.class);
        return count != null ? count : 0;
    }

    public List<Map<String, Object>> alertasFranjaVencida() {
        return jdbc.queryForList("""
                SELECT e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    e.cedula,
                    ap.hora_fin,
                    sh.nombre AS servicio
                FROM registro_acceso ra
                JOIN estudiante e ON e.id_estudiante = ra.id_estudiante
                LEFT JOIN asignacion_practica ap ON ap.id_asignacion = ra.id_asignacion
                LEFT JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE ra.resultado_validacion = 'APROBADO'
                AND ra.timestamp_salida IS NULL
                AND ra.timestamp_entrada::date = CURRENT_DATE
                AND ap.hora_fin < CURRENT_TIME
                """);
    }

    /**
     * Todos los registros de acceso APROBADOS de HOY (entrada + salida si existe).
     * Incluye la cédula del estudiante para que el frontend pueda rehidratar
     * checkInTime, checkOutTime y attendanceHistory al recargar la página.
     * FIX: Se añaden hora_inicio y hora_fin para que el frontend pueda calcular
     * el cumplimiento real (completo / llegada_tarde / salida_temprano / sin_horario).
     */
    public List<Map<String, Object>> registrosHoy() {
        return jdbc.queryForList("""
                SELECT e.cedula,
                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_completo,
                    ra.timestamp_entrada,
                    ra.timestamp_salida,
                    ra.horas_cumplidas,
                    ra.resultado_validacion,
                    sh.nombre AS servicio,
                    ap.hora_inicio,
                    ap.hora_fin
                FROM registro_acceso ra
                JOIN estudiante e ON e.id_estudiante = ra.id_estudiante
                LEFT JOIN asignacion_practica ap ON ap.id_asignacion = ra.id_asignacion
                LEFT JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE ra.resultado_validacion = 'APROBADO'
                AND ra.timestamp_entrada::date = CURRENT_DATE
                ORDER BY ra.timestamp_entrada DESC
                """);
    }
}