package com.husrt.control.controller;

import com.husrt.control.service.PlanPracticasService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/horarios")
public class PlanPracticasApiController {

    private final PlanPracticasService service;

    public PlanPracticasApiController(PlanPracticasService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerAsignaciones();
    }

    @GetMapping("/mes")
    public List<Map<String, Object>> listarPorMes(
            @RequestParam int anio,
            @RequestParam int mes) {
        return service.obtenerPorMes(anio, mes);
    }

    @GetMapping("/servicios")
    public List<Map<String, Object>> listarServicios() {
        return service.obtenerServicios();
    }

    @PostMapping
    public Map<String, Object> crear(@RequestBody Map<String, Object> datos) {
        return service.crearAsignacion(datos);
    }

    @PostMapping("/importar")
    public Map<String, Object> importarLote(@RequestBody List<Map<String, Object>> filas) {
        return service.importarLote(filas);
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable int id,
            @RequestBody Map<String, Object> datos) {
        return service.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable int id) {
        service.eliminar(id);
        return Map.of("ok", true);
    }
}