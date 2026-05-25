package com.husrt.control.controller;

import com.husrt.control.model.ResultadoAcceso;
import com.husrt.control.service.PorteriaService;

import java.util.Map;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class PorteriaController {

    private final PorteriaService service;

    public PorteriaController(PorteriaService service) {
        this.service = service;
    }

    @GetMapping
    public String mostrarPorteria() {
        return "porteria";
    }

    @PostMapping("/validar")
    public String validarIngreso(@RequestParam String cedula, Model model) {
        ResultadoAcceso resultado = service.validarIngreso(cedula);
        model.addAttribute("resultado", resultado);
        model.addAttribute("cedula", cedula);
        return "porteria";
    }

    @PostMapping("/salida")
    public String registrarSalida(@RequestParam String cedula, Model model) {
        ResultadoAcceso resultado = service.registrarSalida(cedula);
        model.addAttribute("mensajeSalida", resultado.getMensaje());
        return "porteria";
    }

    @PostMapping("/checkin")
    @ResponseBody
    public Map<String, Object> checkInApi(@RequestBody Map<String, String> body) {
        String cedula = body.get("cedula");
        ResultadoAcceso resultado = service.validarIngreso(cedula);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("ok", resultado.isAprobado());
        resp.put("mensaje", resultado.isAprobado() ? resultado.getMensaje() : resultado.getMotivoRechazo());
        resp.put("nombre", resultado.getNombreEstudiante());
        resp.put("servicio", resultado.getServicio());
        resp.put("franja", resultado.getFranjaHoraria());
        return resp;
    }

    @PostMapping("/checkout")
    @ResponseBody
    public Map<String, Object> checkOutApi(@RequestBody Map<String, String> body) {
        String cedula = body.get("cedula");
        ResultadoAcceso resultado = service.registrarSalida(cedula);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("ok", resultado.isAprobado());
        resp.put("mensaje", resultado.isAprobado() ? resultado.getMensaje() : resultado.getMotivoRechazo());
        resp.put("nombre", resultado.getNombreEstudiante());
        return resp;
    }
}