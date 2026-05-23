package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PlanPracticasRepository {

        private final JdbcTemplate jdbc;

        public PlanPracticasRepository(JdbcTemplate jdbc) {
                this.jdbc = jdbc;
        }

        // Listar todas las asignaciones con nombres
        public List<Map<String, Object>> listarAsignaciones() {
                return jdbc.queryForList("""
                                SELECT
                                    ap.id_asignacion            AS id,
                                    e.cedula                    AS "studentId",
                                    d.cedula                    AS "doctorId",
                                    sh.nombre                   AS area,
                                    ap.fecha_especifica::text   AS fecha,
                                    ap.hora_inicio::text        AS "startTime",
                                    ap.hora_fin::text           AS "endTime",
                                    e.nombres_completos || ' ' || e.apellidos_completos AS nombre_estudiante,
                                    sh.nombre AS nombre_servicio,
                                    sh.piso,
                                    d.nombre || ' ' || d.apellido AS nombre_docente
                                FROM asignacion_practica ap
                                JOIN estudiante e ON e.id_estudiante = ap.id_estudiante
                                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                                JOIN docente d ON d.id_docente = pp.id_docente
                                ORDER BY ap.fecha_especifica DESC, ap.hora_inicio
                                """);
        }

        // Listar asignaciones — incluye filtro por anio/mes cuando se proveen
        public List<Map<String, Object>> listarPorMes(int anio, int mes) {
                return jdbc.queryForList("""
                                SELECT ap.id_asignacion AS id,
                                        e.cedula AS "studentId",
                                        d.cedula AS "doctorId",
                                        sh.nombre AS area,
                                        ap.fecha_especifica::text AS fecha,
                                        ap.hora_inicio::text AS "startTime",
                                        ap.hora_fin::text AS "endTime"
                                FROM asignacion_practica ap
                                JOIN estudiante e ON e.id_estudiante = ap.id_estudiante
                                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                                JOIN docente d ON d.id_docente = pp.id_docente
                                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                                WHERE EXTRACT(YEAR FROM ap.fecha_especifica) = ?
                                  AND EXTRACT(MONTH FROM ap.fecha_especifica) = ?
                                ORDER BY ap.fecha_especifica
                                """, anio, mes);
        }

        // Crear plan y asignacion
        public void crearAsignacion(int idDocente, int idEstudiante,
                        int idServicio, String fecha,
                        String horaInicio, String horaFin) {

                int anio = Integer.parseInt(fecha.substring(0, 4));
                int mes = Integer.parseInt(fecha.substring(5, 7));

                Integer idPlan = buscarOCrearPlan(idDocente, anio, mes);

                // Convertir String a java.sql.Date para compatibilidad con PostgreSQL
                java.sql.Date fechaSql = java.sql.Date.valueOf(fecha);
                java.sql.Time horaInicioSql = java.sql.Time
                                .valueOf(horaInicio.length() == 5 ? horaInicio + ":00" : horaInicio);
                java.sql.Time horaFinSql = java.sql.Time.valueOf(horaFin.length() == 5 ? horaFin + ":00" : horaFin);

                // Verificar duplicado exacto (mismo estudiante, fecha, servicio)
                Integer dup = jdbc.queryForObject("""
                                SELECT COUNT(*) FROM asignacion_practica
                                WHERE id_estudiante = ? AND fecha_especifica = ?
                                AND id_servicio = ?
                                """, Integer.class, idEstudiante, fechaSql, idServicio);

                if (dup != null && dup > 0) {
                        throw new RuntimeException(
                                        "Este estudiante ya tiene asignacion en ese servicio para esa fecha");
                }

                // Verificar capacidad del servicio en ese horario
                Integer ocupados = jdbc.queryForObject("""
                                SELECT COUNT(*) FROM asignacion_practica ap
                                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                                WHERE ap.id_servicio = ?
                                AND ap.fecha_especifica = ?
                                AND NOT (ap.hora_fin <= ? OR ap.hora_inicio >= ?)
                                """, Integer.class, idServicio, fechaSql, horaInicioSql, horaFinSql);

                Integer capacidad = jdbc.queryForObject(
                                "SELECT capacidad_maxima_estudiantes FROM servicio_hospitalario WHERE id_servicio = ?",
                                Integer.class, idServicio);

                if (ocupados != null && capacidad != null && ocupados >= capacidad) {
                        throw new RuntimeException(
                                        "El servicio esta al maximo de capacidad en ese horario (" + capacidad
                                                        + " estudiantes)");
                }

                jdbc.update("""
                                INSERT INTO asignacion_practica
                                (id_plan, id_estudiante, id_servicio, hora_inicio, hora_fin, fecha_especifica)
                                VALUES (?, ?, ?, ?, ?, ?)
                                """, idPlan, idEstudiante, idServicio, horaInicioSql, horaFinSql, fechaSql);
        }

        private Integer buscarOCrearPlan(int idDocente, int anio, int mes) {
                List<Map<String, Object>> planes = jdbc.queryForList("""
                                SELECT id_plan FROM plan_practicas
                                WHERE id_docente = ? AND mes = ? AND semestre = ?
                                """, idDocente, mes, anio);

                if (!planes.isEmpty()) {
                        return ((Number) planes.get(0).get("id_plan")).intValue();
                }

                // Obtener id_universidad del docente (fallback a 1 si no tiene)
                Integer idUniversidad = jdbc.query(
                                "SELECT id_universidad FROM docente WHERE id_docente = ?",
                                (rs, rn) -> rs.getObject(1) != null ? rs.getInt(1) : 1,
                                idDocente).stream().findFirst().orElse(1);

                jdbc.update("""
                                INSERT INTO plan_practicas (id_docente, id_universidad, semestre, mes, fecha_carga)
                                VALUES (?, ?, ?, ?, CURRENT_DATE)
                                """, idDocente, idUniversidad, anio, mes);

                // Usar RETURNING o SELECT currval para obtener el id recien insertado
                return jdbc.query(
                                "SELECT id_plan FROM plan_practicas WHERE id_docente = ? AND mes = ? AND semestre = ? ORDER BY id_plan DESC LIMIT 1",
                                (rs, rn) -> rs.getInt(1), idDocente, mes, anio)
                                .stream().findFirst()
                                .orElseThrow(() -> new RuntimeException("Error al crear el plan de practicas"));
        }

        public void eliminarAsignacion(int idAsignacion) {
                jdbc.update("DELETE FROM asignacion_practica WHERE id_asignacion = ?", idAsignacion);
        }

        // Actualizar horario de una asignacion existente (hora, servicio, y
        // opcionalmente docente)
        public boolean actualizarAsignacion(int idAsignacion, String horaInicio, String horaFin,
                        String nombreServicio, String cedulaDocente) {
                Integer idServicio = jdbc.query(
                                "SELECT id_servicio FROM servicio_hospitalario WHERE nombre = ?",
                                (rs, rn) -> rs.getInt(1), nombreServicio)
                                .stream().findFirst().orElse(null);
                if (idServicio == null)
                        return false;

                java.sql.Time horaInicioSql = java.sql.Time
                                .valueOf(horaInicio.length() == 5 ? horaInicio + ":00" : horaInicio);
                java.sql.Time horaFinSql = java.sql.Time.valueOf(horaFin.length() == 5 ? horaFin + ":00" : horaFin);

                int rows = jdbc.update("""
                                UPDATE asignacion_practica
                                SET hora_inicio = ?, hora_fin = ?, id_servicio = ?
                                WHERE id_asignacion = ?
                                """, horaInicioSql, horaFinSql, idServicio, idAsignacion);
                if (rows == 0)
                        return false;

                // Si cambia el docente, actualizar el plan_practicas de la asignacion
                if (cedulaDocente != null && !cedulaDocente.isEmpty()) {
                        Integer idDocente = jdbc.query(
                                        "SELECT id_docente FROM docente WHERE cedula = ?",
                                        (rs, rn) -> rs.getInt(1), cedulaDocente)
                                        .stream().findFirst().orElse(null);
                        if (idDocente != null) {
                                // Obtener fecha de la asignacion para buscar/crear plan correcto
                                java.util.List<java.util.Map<String, Object>> res = jdbc.queryForList(
                                                "SELECT fecha_especifica FROM asignacion_practica WHERE id_asignacion = ?",
                                                idAsignacion);
                                if (!res.isEmpty()) {
                                        java.sql.Date fechaSql = (java.sql.Date) res.get(0).get("fecha_especifica");
                                        if (fechaSql != null) {
                                                java.time.LocalDate fecha = fechaSql.toLocalDate();
                                                Integer idPlan = buscarOCrearPlan(idDocente, fecha.getYear(),
                                                                fecha.getMonthValue());
                                                jdbc.update("UPDATE asignacion_practica SET id_plan = ? WHERE id_asignacion = ?",
                                                                idPlan, idAsignacion);
                                        }
                                }
                        }
                }
                return true;
        }

        // Listar servicios hospitalarios para el frontend
        public List<Map<String, Object>> listarServicios() {
                return jdbc.queryForList(
                                "SELECT id_servicio, nombre, piso, capacidad_maxima_estudiantes FROM servicio_hospitalario ORDER BY nombre");
        }
}