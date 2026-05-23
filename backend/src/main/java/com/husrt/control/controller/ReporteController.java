package com.husrt.control.controller;

import com.husrt.control.service.ReporteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @GetMapping("/horas")
    public List<Map<String, Object>> horasAcumuladas() {
        return service.horasAcumuladas();
    }

    @GetMapping("/arl")
    public List<Map<String, Object>> arlProximaAVencer() {
        return service.arlProximaAVencer();
    }

    @GetMapping("/rechazados")
    public List<Map<String, Object>> rechazadosHoy() {
        return service.rechazadosHoy();
    }

    @GetMapping("/historial/{cedula}")
    public List<Map<String, Object>> historialEstudiante(@PathVariable String cedula) {
        return service.historialEstudiante(cedula);
    }

    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        return Map.of(
                "horasAcumuladas", service.horasAcumuladas(),
                "arlPorVencer", service.arlProximaAVencer(),
                "rechazadosHoy", service.rechazadosHoy());
    }
}
