package com.husrt.control.controller;

import com.husrt.control.model.Docente;
import com.husrt.control.service.DocenteService;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class DocenteApiController {

    private final DocenteService service;
    private final JdbcTemplate jdbc;

    public DocenteApiController(DocenteService service, JdbcTemplate jdbc) {
        this.service = service;
        this.jdbc = jdbc;
    }

    private List<String> permisosParaRol(String rol) {
        if (rol == null)
            return List.of("ver_dashboard", "ver_registro_estudiantes", "ver_horarios");
        return switch (rol.toLowerCase()) {
            case "administrador", "admin" -> List.of(
                    "ver_dashboard", "ver_presencia", "registrar_presencia",
                    "ver_registro_estudiantes", "crear_estudiantes", "editar_estudiantes",
                    "ver_usuarios", "crear_usuarios", "editar_usuarios", "eliminar_usuarios",
                    "ver_areas", "crear_areas", "editar_areas", "eliminar_areas",
                    "ver_horarios", "crear_horarios", "editar_horarios", "eliminar_horarios",
                    "ver_cronograma", "editar_cronograma",
                    "ver_reportes", "exportar_reportes");
            case "director" -> List.of(
                    "ver_dashboard", "ver_presencia", "registrar_presencia",
                    "ver_registro_estudiantes", "crear_estudiantes", "editar_estudiantes",
                    "ver_usuarios", "crear_usuarios", "editar_usuarios", "eliminar_usuarios",
                    "ver_areas", "crear_areas", "editar_areas", "eliminar_areas",
                    "ver_horarios", "crear_horarios", "editar_horarios", "eliminar_horarios",
                    "ver_cronograma", "editar_cronograma",
                    "ver_reportes", "exportar_reportes");
            case "medico" -> List.of(
                    "ver_dashboard", "ver_presencia",
                    "ver_registro_estudiantes",
                    "ver_horarios", "ver_cronograma",
                    "ver_reportes");
            case "docente" -> List.of(
                    "ver_dashboard", "ver_presencia", "registrar_presencia",
                    "ver_registro_estudiantes", "crear_estudiantes", "editar_estudiantes",
                    "ver_horarios", "crear_horarios", "editar_horarios",
                    "ver_cronograma", "editar_cronograma",
                    "ver_reportes");
            case "estudiante" -> List.of("ver_dashboard");
            default -> List.of("ver_dashboard", "ver_registro_estudiantes", "ver_horarios");
        };
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerTodos().stream().map(d -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", d.getIdDocente().toString());
            m.put("name", d.getNombre() + " " + d.getApellido());
            m.put("cedula", d.getCedula());
            m.put("role", d.getRol() != null ? d.getRol() : "docente");
            m.put("programa", d.getProgramaQueSupervisa());
            m.put("genero", "masculino");
            m.put("tipoDocumento", "C.C.");
            m.put("permissions", permisosParaRol(d.getRol()));
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> registrar(@RequestBody Map<String, Object> datos) {
        Docente d = new Docente();
        String nombre = (String) datos.get("name");
        String[] partes = nombre != null ? nombre.split(" ", 2) : new String[] { "", "" };
        d.setNombre(partes[0]);
        d.setApellido(partes.length > 1 ? partes[1] : "");
        d.setCedula((String) datos.get("cedula"));
        d.setRol((String) datos.get("role"));
        d.setProgramaQueSupervisa((String) datos.get("programa"));
        d.setPassword((String) datos.getOrDefault("password", d.getCedula()));

        String resultado = service.registrar(d);
        return Map.of("ok", resultado.equals("OK"), "mensaje", resultado);
    }

    @DeleteMapping("/{cedula}")
    public Map<String, Object> eliminar(@PathVariable String cedula) {
        service.eliminar(cedula);
        return Map.of("ok", true);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> datos) {
        String cedula = datos.get("cedula");
        String password = datos.get("password");

        if (cedula == null || password == null) {
            return Map.of("ok", false, "mensaje", "Credenciales incompletas");
        }

        // 1. Buscar primero en docentes/usuarios del sistema
        Optional<Docente> optDocente = service.buscarPorCedula(cedula);
        if (optDocente.isPresent()) {
            Docente d = optDocente.get();

            if (!Boolean.TRUE.equals(d.getActivo())) {
                return Map.of("ok", false, "mensaje", "Usuario inactivo — contacte al administrador");
            }

            String pwdBD = d.getPassword() != null ? d.getPassword() : d.getCedula();
            if (!pwdBD.equals(password)) {
                return Map.of("ok", false, "mensaje", "Contraseña incorrecta");
            }

            return Map.of(
                    "ok", true,
                    "cedula", d.getCedula(),
                    "name", d.getNombre() + " " + d.getApellido(),
                    "role", d.getRol() != null ? d.getRol() : "docente",
                    "permissions", permisosParaRol(d.getRol()),
                    "mensaje", "Bienvenido");
        }

        // 2. Si no está en docentes, buscar en estudiantes
        try {
            List<Map<String, Object>> estudiantes = jdbc.queryForList(
                    "SELECT * FROM estudiante WHERE cedula = ?", cedula);

            if (!estudiantes.isEmpty()) {
                Map<String, Object> est = estudiantes.get(0);

                // La contraseña del estudiante es su cédula por defecto
                String pwdEst = est.get("password") != null
                        ? est.get("password").toString()
                        : cedula; // contraseña por defecto = cédula

                if (!pwdEst.equals(password)) {
                    return Map.of("ok", false, "mensaje", "Contraseña incorrecta");
                }

                // La tabla estudiante usa nombres_completos y apellidos_completos
                String nombre = est.get("nombres_completos") != null
                        ? est.get("nombres_completos").toString()
                        : "";
                String apellido = est.get("apellidos_completos") != null
                        ? est.get("apellidos_completos").toString()
                        : "";

                return Map.of(
                        "ok", true,
                        "cedula", cedula,
                        "name", (nombre + " " + apellido).trim(),
                        "role", "estudiante",
                        "permissions", permisosParaRol("estudiante"),
                        "mensaje", "Bienvenido");
            }
        } catch (Exception ex) {
            System.err.println("Error buscando estudiante: " + ex.getMessage());
        }

        return Map.of("ok", false, "mensaje", "Usuario no encontrado en el sistema");
    }

    /**
     * Restablece la contraseña de un usuario/estudiante sin verificar la contraseña actual.
     * Solo debe ser invocado por administradores o directores.
     */
    @PutMapping("/{cedula}/reset-password")
    public Map<String, Object> restablecerPassword(
            @PathVariable String cedula,
            @RequestBody Map<String, String> datos) {
        try {
            String nuevaPassword = datos.get("password");
            if (nuevaPassword == null || nuevaPassword.length() < 4) {
                return Map.of("ok", false, "mensaje", "La contraseña debe tener al menos 4 caracteres");
            }
            // Intentar en tabla docente primero
            Optional<Docente> optDocente = service.buscarPorCedula(cedula);
            if (optDocente.isPresent()) {
                service.cambiarPassword(cedula, nuevaPassword);
            } else {
                // Es un estudiante
                int rows = jdbc.update("UPDATE estudiante SET password = ? WHERE cedula = ?", nuevaPassword, cedula);
                if (rows == 0) {
                    return Map.of("ok", false, "mensaje", "Usuario no encontrado con cédula: " + cedula);
                }
            }
            return Map.of("ok", true, "mensaje", "Contraseña restablecida correctamente");
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    @PutMapping("/{cedula}/estado")
    public Map<String, Object> cambiarEstado(
            @PathVariable String cedula,
            @RequestBody Map<String, Object> datos) {
        try {
            boolean activo = Boolean.TRUE.equals(datos.get("activo"));
            service.cambiarEstado(cedula, activo);
            return Map.of("ok", true,
                    "mensaje", activo ? "Usuario activado" : "Usuario desactivado");
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    @PutMapping("/{cedula}/password")
    public Map<String, Object> cambiarPassword(
            @PathVariable String cedula,
            @RequestBody Map<String, String> datos) {
        try {
            String nuevaPassword = datos.get("password");
            String passwordActual = datos.get("passwordActual");

            if (nuevaPassword == null || nuevaPassword.length() < 6) {
                return Map.of("ok", false,
                        "mensaje", "La contraseña debe tener al menos 6 caracteres");
            }

            // Si viene passwordActual, verificar que sea correcta antes de cambiar
            if (passwordActual != null && !passwordActual.isBlank()) {
                // Buscar en docente
                Optional<Docente> optDocente = service.buscarPorCedula(cedula);
                if (optDocente.isPresent()) {
                    Docente d = optDocente.get();
                    String pwdBD = d.getPassword() != null ? d.getPassword() : d.getCedula();
                    if (!pwdBD.equals(passwordActual)) {
                        return Map.of("ok", false, "mensaje", "La contraseña actual es incorrecta");
                    }
                } else {
                    // Buscar en estudiantes
                    try {
                        List<Map<String, Object>> ests = jdbc.queryForList(
                                "SELECT password FROM estudiante WHERE cedula = ?", cedula);
                        if (!ests.isEmpty()) {
                            String pwdEst = ests.get(0).get("password") != null
                                    ? ests.get(0).get("password").toString() : cedula;
                            if (!pwdEst.equals(passwordActual)) {
                                return Map.of("ok", false, "mensaje", "La contraseña actual es incorrecta");
                            }
                        }
                    } catch (Exception ex) {
                        System.err.println("Error verificando password estudiante: " + ex.getMessage());
                    }
                }
            }

            // Intentar cambiar en docente primero
            Optional<Docente> optDocente = service.buscarPorCedula(cedula);
            if (optDocente.isPresent()) {
                service.cambiarPassword(cedula, nuevaPassword);
            } else {
                // Es un estudiante — actualizar en tabla estudiante
                jdbc.update("UPDATE estudiante SET password = ? WHERE cedula = ?", nuevaPassword, cedula);
            }

            return Map.of("ok", true, "mensaje", "Contraseña actualizada");
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }
}