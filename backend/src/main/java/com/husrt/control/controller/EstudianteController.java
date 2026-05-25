package com.husrt.control.controller;

import com.husrt.control.model.Estudiante;
import com.husrt.control.service.EstudianteService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/registro")
public class EstudianteController {

    private final EstudianteService service;

    public EstudianteController(EstudianteService service) {
        this.service = service;
    }

    @GetMapping
    public String mostrarRegistro(Model model) {
        model.addAttribute("estudiante", new Estudiante());
        model.addAttribute("estudiantes", service.obtenerTodos());
        return "registro";
    }

    @PostMapping
    public String guardarEstudiante(@ModelAttribute Estudiante estudiante,
            RedirectAttributes attrs) {
        String resultado = service.registrar(estudiante);

        if (resultado.startsWith("ERROR")) {
            attrs.addFlashAttribute("error", resultado.replace("ERROR: ", ""));
        } else {
            attrs.addFlashAttribute("exito", "Estudiante registrado correctamente");
        }

        return "redirect:/registro";
    }

    @PutMapping("/{cedula}")
    public ResponseEntity<?> actualizar(
            @PathVariable String cedula,
            @RequestBody Estudiante e) {

        try {

            service.actualizar(cedula, e);

            return ResponseEntity.ok().body(
                    Map.of("mensaje", "Estudiante actualizado"));

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity.status(500).body(
                    Map.of("error", ex.getMessage()));
        }
    }
}