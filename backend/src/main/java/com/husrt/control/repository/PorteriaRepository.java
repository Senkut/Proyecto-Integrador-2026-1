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

    // Zona horaria de Colombia — UTC-5 (no cambia por horario de verano)
    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    public PorteriaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Retorna la fecha de HOY en zona horaria de Colombia.
     * Evita que CURRENT_DATE de PostgreSQL (que corre en AWS us-west-2 / UTC)
     * devuelva una fecha diferente a la del estudiante en Colombia.
     */
    private LocalDate hoyEnColombia() {
        return LocalDate.now(ZONA_COLOMBIA);
    }

    /**
     * Retorna el nombre del día en inglés (SUNDAY, MONDAY, ...) para comparar
     * con la columna dia_semana de asignacion_practica.
     */
    private String diaSemanaEnColombia() {
        return hoyEnColombia().getDayOfWeek().toString(); // "SUNDAY", "MONDAY", etc.
    }

    // Verifica si el docente del plan ya ingresó hoy
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

    /**
     * Busca la asignación del estudiante para HOY (hora Colombia).
     *
     * FIX 1: Se eliminó la condición CURRENT_TIME BETWEEN hora_inicio AND hora_fin
     * que bloqueaba checkins fuera de la ventana exacta del turno.
     *
     * FIX 2: Se reemplazó CURRENT_DATE por un parámetro Java con la fecha local
     * de Colombia. El servidor de BD está en AWS us-west-2 (UTC-7/UTC-8),
     * lo que hacía que CURRENT_DATE devolviera la fecha incorrecta para
     * Colombia después de las 17:00-19:00 hora local.
     *
     * FIX 3: Se reemplazó TO_CHAR(CURRENT_DATE, 'Day') por el nombre del día
     * calculado en Java (también en zona horaria Colombia), en mayúsculas
     * para comparación case-insensitive con la columna dia_semana.
     */
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

    // Registra el ingreso aprobado
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

    // Verifica si el estudiante ya está dentro (sin salida registrada hoy)
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

    /**
     * Registra la salida y retorna cuántas filas actualizó.
     * Usa hora Colombia para timestamp y comparación de fecha.
     */
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