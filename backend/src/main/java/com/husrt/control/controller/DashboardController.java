package com.husrt.control.controller;

import com.husrt.control.repository.PresenciaRepository;
import com.husrt.control.service.PresenciaService;
import com.husrt.control.service.ReporteService;
import com.husrt.control.repository.EstudianteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class DashboardController {

    private final PresenciaRepository presenciaRepo;
    private final EstudianteRepository estudianteRepo;

    private final ReporteService reporteService;
    private final PresenciaService presenciaService;

    public DashboardController(PresenciaRepository presenciaRepo,
            EstudianteRepository estudianteRepo,
            PresenciaService presenciaService,
            ReporteService reporteService) {
        this.presenciaRepo = presenciaRepo;
        this.estudianteRepo = estudianteRepo;
        this.presenciaService = presenciaService;
        this.reporteService = reporteService;
    }

    @GetMapping("/api/dashboard")
    public Map<String, Object> dashboard() {
        return Map.of(
                "estudiantesDentro", presenciaRepo.totalDentro(),
                "totalEstudiantes", estudianteRepo.listarTodos().size(),
                "alertas", presenciaRepo.alertasFranjaVencida().size());
    }

    @GetMapping("/api/alertas")
    public List<Map<String, Object>> alertas() {
        List<Map<String, Object>> resultado = new java.util.ArrayList<>();

        // ARL próxima a vencer (del ReporteRepository que ya existe)
        resultado.addAll(reporteService.arlProximaAVencer().stream().map(a -> {
            Map<String, Object> alerta = new java.util.LinkedHashMap<>();
            alerta.put("tipo", "ARL_VENCER");
            alerta.put("descripcion", a.get("nombre_completo") + " — ARL vence " + a.get("arl_vigencia_fin"));
            alerta.put("cedula", a.get("cedula"));
            alerta.put("diasRestantes", a.get("dias_restantes"));
            alerta.put("resuelta", false);
            return alerta;
        }).collect(java.util.stream.Collectors.toList()));

        // Estudiantes con franja vencida dentro del hospital
        resultado.addAll(presenciaService.obtenerAlertas().stream().map(a -> {
            Map<String, Object> alerta = new java.util.LinkedHashMap<>();
            alerta.put("tipo", "FRANJA_VENCIDA");
            alerta.put("descripcion",
                    a.get("nombre_completo") + " sigue dentro — franja venció a las " + a.get("hora_fin"));
            alerta.put("cedula", a.get("cedula"));
            alerta.put("resuelta", false);
            return alerta;
        }).collect(java.util.stream.Collectors.toList()));

        return resultado;
    }
}