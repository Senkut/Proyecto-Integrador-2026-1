package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class PorteriaRepository {

    private final JdbcTemplate jdbc;

    public PorteriaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Verifica si el docente del plan ya ingresó hoy
    public boolean docenteIngresoHoy(Integer idPlan) {
        String sql = """
                SELECT COUNT(*) FROM registro_acceso_docente rad
                JOIN plan_practicas pp ON pp.id_docente = rad.id_docente
                WHERE pp.id_plan = ?
                AND CAST(rad.timestamp_entrada AS DATE) = CURRENT_DATE
                AND rad.timestamp_salida IS NULL
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, idPlan);
        return count != null && count > 0;
    }

    /**
     * Busca la asignación vigente del estudiante para HOY.
     *
     * FIX: Se eliminó la condición estricta CURRENT_TIME BETWEEN hora_inicio AND
     * hora_fin
     * y se reemplazó por una ventana de tolerancia de ±30 minutos.
     * Esto evita que el portero no pueda registrar entrada si el estudiante llega
     * unos minutos antes o después del horario exacto.
     *
     * La ventana aplica así:
     * - Puede hacer check-in desde 30 min ANTES de hora_inicio
     * - Puede hacer check-in hasta 30 min DESPUÉS de hora_fin
     *
     * Si quieres cambiar la tolerancia, ajusta el valor '30' en los dos INTERVAL.
     */
    public List<Map<String, Object>> buscarAsignacionVigente(Integer idEstudiante) {
        String sql = """
                SELECT ap.id_asignacion, ap.id_plan, ap.hora_inicio, ap.hora_fin,
                        sh.nombre AS nombre_servicio, sh.piso
                FROM asignacion_practica ap
                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                WHERE ap.id_estudiante = ?
                AND (
                    ap.fecha_especifica = CURRENT_DATE
                    OR UPPER(TRIM(ap.dia_semana)) = UPPER(TRIM(TO_CHAR(CURRENT_DATE, 'Day')))
                )
                AND CURRENT_TIME BETWEEN (ap.hora_inicio - INTERVAL '30 minutes')
                                     AND (ap.hora_fin   + INTERVAL '30 minutes')
                ORDER BY ap.hora_inicio
                LIMIT 1
                """;
        return jdbc.queryForList(sql, idEstudiante);
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
                LocalDateTime.now(), resultado, motivo);
    }

    // Verifica si el estudiante ya está dentro (sin salida registrada hoy)
    public boolean estudianteYaDentro(Integer idEstudiante) {
        String sql = """
                SELECT COUNT(*) FROM registro_acceso
                WHERE id_estudiante = ?
                AND timestamp_salida IS NULL
                AND resultado_validacion = 'APROBADO'
                AND CAST(timestamp_entrada AS DATE) = CURRENT_DATE
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, idEstudiante);
        return count != null && count > 0;
    }

    /**
     * Registra la salida y retorna cuántas filas actualizó.
     *
     * FIX: Ahora retorna int en lugar de void, para que el servicio pueda detectar
     * si no había un ingreso abierto (rows == 0) y devolver un error real al
     * frontend.
     */
    public int registrarSalida(Integer idEstudiante) {
        return jdbc.update("""
                UPDATE registro_acceso
                SET timestamp_salida = ?,
                    horas_cumplidas = EXTRACT(EPOCH FROM (? - timestamp_entrada)) / 3600
                WHERE id_estudiante = ?
                AND timestamp_salida IS NULL
                AND CAST(timestamp_entrada AS DATE) = CURRENT_DATE
                """,
                LocalDateTime.now(), LocalDateTime.now(), idEstudiante);
    }
}