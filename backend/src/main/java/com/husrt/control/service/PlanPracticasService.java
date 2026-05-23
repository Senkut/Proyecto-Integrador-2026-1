package com.husrt.control.service;

import com.husrt.control.repository.PlanPracticasRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PlanPracticasService {

    private final PlanPracticasRepository repo;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public PlanPracticasService(PlanPracticasRepository repo,
            org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> obtenerAsignaciones() {
        return repo.listarAsignaciones();
    }

    public List<Map<String, Object>> obtenerPorMes(int anio, int mes) {
        return repo.listarPorMes(anio, mes);
    }

    public Map<String, Object> crearAsignacion(Map<String, Object> datos) {
        try {
            if (datos.get("doctorId") == null) {
                return Map.of("ok", false, "mensaje", "Debe seleccionar un docente.");
            }
            String cedulaDocente = datos.get("doctorId").toString();
            Integer idDocente = jdbc.query(
                    "SELECT id_docente FROM docente WHERE cedula = ?",
                    (rs, rn) -> rs.getInt(1), cedulaDocente)
                    .stream().findFirst().orElse(null);

            if (idDocente == null) {
                return Map.of("ok", false, "mensaje",
                        "Docente no encontrado con cedula: " + cedulaDocente +
                                ". Verifique que el usuario este registrado en el sistema.");
            }

            if (datos.get("studentId") == null) {
                return Map.of("ok", false, "mensaje", "Debe seleccionar un estudiante.");
            }
            String cedulaEstudiante = datos.get("studentId").toString();
            Integer idEstudiante = jdbc.query(
                    "SELECT id_estudiante FROM estudiante WHERE cedula = ?",
                    (rs, rn) -> rs.getInt(1), cedulaEstudiante)
                    .stream().findFirst().orElse(null);

            if (idEstudiante == null) {
                return Map.of("ok", false, "mensaje",
                        "Estudiante no encontrado con cedula: " + cedulaEstudiante);
            }

            if (datos.get("area") == null) {
                return Map.of("ok", false, "mensaje", "Debe seleccionar un area/servicio.");
            }
            String nombreArea = datos.get("area").toString();

            // Búsqueda tolerante: unaccent+lower → solo lower → exacta
            Integer idServicio = null;
            try {
                idServicio = jdbc.query(
                        "SELECT id_servicio FROM servicio_hospitalario WHERE unaccent(lower(nombre)) = unaccent(lower(?))",
                        (rs, rn) -> rs.getInt(1), nombreArea)
                        .stream().findFirst().orElse(null);
            } catch (Exception ex) {
                // unaccent no disponible, intentar solo con lower()
                try {
                    idServicio = jdbc.query(
                            "SELECT id_servicio FROM servicio_hospitalario WHERE lower(nombre) = lower(?)",
                            (rs, rn) -> rs.getInt(1), nombreArea)
                            .stream().findFirst().orElse(null);
                } catch (Exception ex2) {
                    idServicio = jdbc.query(
                            "SELECT id_servicio FROM servicio_hospitalario WHERE nombre = ?",
                            (rs, rn) -> rs.getInt(1), nombreArea)
                            .stream().findFirst().orElse(null);
                }
            }

            if (idServicio == null) {
                // Listar áreas disponibles para mensaje de error útil
                List<String> disponibles = jdbc.query(
                        "SELECT nombre FROM servicio_hospitalario ORDER BY nombre",
                        (rs, rn) -> rs.getString(1));
                return Map.of("ok", false, "mensaje",
                        "Area no encontrada: \"" + nombreArea + "\". " +
                                "Areas registradas: " + String.join(", ", disponibles));
            }

            repo.crearAsignacion(idDocente, idEstudiante, idServicio,
                    datos.get("fecha").toString(),
                    datos.get("startTime").toString(),
                    datos.get("endTime").toString());

            return Map.of("ok", true, "mensaje", "Asignacion creada correctamente");
        } catch (RuntimeException e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    /**
     * Importación masiva desde Excel.
     * Recibe una lista de filas y devuelve un resumen con contadores y errores por
     * fila.
     */
    public Map<String, Object> importarLote(List<Map<String, Object>> filas) {
        int exitosos = 0;
        int fallidos = 0;
        java.util.List<Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < filas.size(); i++) {
            Map<String, Object> fila = filas.get(i);
            Map<String, Object> resultado = crearAsignacion(fila);
            boolean ok = Boolean.TRUE.equals(resultado.get("ok"));
            if (ok) {
                exitosos++;
            } else {
                fallidos++;
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("fila", i + 1);
                err.put("mensaje", resultado.getOrDefault("mensaje", "Error desconocido"));
                errores.add(err);
            }
        }

        java.util.Map<String, Object> resumen = new java.util.HashMap<>();
        resumen.put("ok", fallidos == 0);
        resumen.put("exitosos", exitosos);
        resumen.put("fallidos", fallidos);
        resumen.put("total", filas.size());
        resumen.put("errores", errores);
        resumen.put("mensaje", exitosos + " horario(s) importado(s) correctamente" +
                (fallidos > 0 ? ", " + fallidos + " con error" : ""));
        return resumen;
    }

    public void eliminar(int idAsignacion) {
        repo.eliminarAsignacion(idAsignacion);
    }

    public Map<String, Object> actualizar(int idAsignacion, Map<String, Object> datos) {
        try {
            String horaInicio = datos.getOrDefault("startTime", "").toString();
            String horaFin = datos.getOrDefault("endTime", "").toString();
            String area = datos.getOrDefault("area", "").toString();
            String cedulaDocente = datos.containsKey("doctorId") ? datos.get("doctorId").toString() : "";
            if (horaInicio.isEmpty() || horaFin.isEmpty() || area.isEmpty()) {
                return Map.of("ok", false, "mensaje", "Faltan campos: startTime, endTime, area");
            }
            boolean ok = repo.actualizarAsignacion(idAsignacion, horaInicio, horaFin, area, cedulaDocente);
            if (!ok)
                return Map.of("ok", false, "mensaje", "No se encontro la asignacion o el area indicada");
            return Map.of("ok", true, "mensaje", "Horario actualizado correctamente");
        } catch (RuntimeException e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    public List<Map<String, Object>> obtenerServicios() {
        return repo.listarServicios();
    }
}