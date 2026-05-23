package com.husrt.control.controller;

import com.husrt.control.service.PresenciaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presencia")
public class PresenciaController {

    private final PresenciaService service;

    public PresenciaController(PresenciaService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> obtenerPresencia() {
        List<Map<String, Object>> estudiantes = service.obtenerPresencia();
        return Map.of(
                "estudiantes", estudiantes,
                "total", service.totalDentro(),
                "alertas", service.obtenerAlertas());
    }

    /**
     * Retorna TODOS los registros de acceso aprobados de HOY (con entrada y salida
     * si existe).
     * El frontend lo usa al iniciar para rehidratar checkInTime / checkOutTime /
     * attendanceHistory
     * sin perder datos al recargar la página.
     */
    @GetMapping("/hoy")
    public List<Map<String, Object>> registrosHoy() {
        return service.registrosHoy();
    }

}