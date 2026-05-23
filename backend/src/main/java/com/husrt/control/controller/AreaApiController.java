package com.husrt.control.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/areas")
public class AreaApiController {

    private final JdbcTemplate jdbc;

    public AreaApiController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return jdbc.queryForList("""
                SELECT id_servicio AS id, nombre,
                        piso, capacidad_maxima_estudiantes AS capacidadMaxima
                FROM servicio_hospitalario ORDER BY nombre
                """);
    }

    @PostMapping
    public Map<String, Object> crear(@RequestBody Map<String, Object> datos) {
        try {
            jdbc.update("""
                    INSERT INTO servicio_hospitalario
                    (nombre, piso, capacidad_maxima_estudiantes)
                    VALUES (?, ?, ?)
                    """,
                    datos.get("nombre"),
                    datos.get("piso") != null ? Integer.parseInt(datos.get("piso").toString()) : 1,
                    datos.get("capacidadMaxima") != null ? Integer.parseInt(datos.get("capacidadMaxima").toString())
                            : 5);
            return Map.of("ok", true);
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable int id) {
        jdbc.update("DELETE FROM servicio_hospitalario WHERE id_servicio = ?", id);
        return Map.of("ok", true);
    }
}