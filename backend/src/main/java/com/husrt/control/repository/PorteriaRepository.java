package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Repository
public class PorteriaRepository {

    private final JdbcTemplate jdbc;

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    public PorteriaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private LocalDate hoyEnColombia() {
        return LocalDate.now(ZONA_COLOMBIA);
    }

    private String diaSemanaEnColombia() {
        return hoyEnColombia().getDayOfWeek().toString();
    }

    public boolean docenteIngresoHoy(Integer idPlan) {
        String sql = """
                SELECT COUNT(*) FROM registro_acceso_docente rad
                JOIN plan_practicas pp ON pp.id_docente = rad.id_docente
                WHERE pp.id_plan = ?
                AND CAST(rad.timestamp_entrada AS DATE) = ?
                AND rad.timestamp_salida IS NULL
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, idPlan, hoyEnColombia());
        return count != null && count > 0;
    }

    public List<Map<String, Object>> buscarAsignacionVigente(Integer idEstudiante) {
        LocalDate hoy = hoyEnColombia();
        String diaSemana = diaSemanaEnColombia(); // p.ej. "SUNDAY"

        String sql = """
                SELECT ap.id_asignacion, ap.id_plan, ap.hora_inicio, ap.hora_fin,
                        sh.nombre AS nombre_servicio, sh.piso
                FROM asignacion_practica ap
                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE ap.id_estudiante = ?
                AND (
                    ap.fecha_especifica = ?
                    OR UPPER(TRIM(ap.dia_semana)) = ?
                )
                ORDER BY ap.hora_inicio
                LIMIT 1
                """;
        return jdbc.queryForList(sql, idEstudiante, hoy, diaSemana);
    }

    public void registrarIngreso(Integer idEstudiante, Integer idAsignacion,
            String resultado, String motivo) {
        jdbc.update("""
                INSERT INTO registro_acceso
                (id_estudiante, id_asignacion, timestamp_entrada,
                resultado_validacion, motivo_rechazo)
                VALUES (?, ?, ?, ?, ?)
                """,
                idEstudiante, idAsignacion,
                LocalDateTime.now(ZONA_COLOMBIA), resultado, motivo);
    }

    public boolean estudianteYaDentro(Integer idEstudiante) {
        String sql = """
                SELECT COUNT(*) FROM registro_acceso
                WHERE id_estudiante = ?
                AND timestamp_salida IS NULL
                AND resultado_validacion = 'APROBADO'
                AND CAST(timestamp_entrada AS DATE) = ?
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, idEstudiante, hoyEnColombia());
        return count != null && count > 0;
    }

    public int registrarSalida(Integer idEstudiante) {
        LocalDateTime ahora = LocalDateTime.now(ZONA_COLOMBIA);
        return jdbc.update("""
                UPDATE registro_acceso
                SET timestamp_salida = ?,
                    horas_cumplidas = EXTRACT(EPOCH FROM (? - timestamp_entrada)) / 3600
                WHERE id_estudiante = ?
                AND timestamp_salida IS NULL
                AND CAST(timestamp_entrada AS DATE) = ?
                """,
                ahora, ahora, idEstudiante, hoyEnColombia());
    }
}