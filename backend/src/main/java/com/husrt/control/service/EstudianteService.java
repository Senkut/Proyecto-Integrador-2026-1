package com.husrt.control.service;

import com.husrt.control.model.Estudiante;
import com.husrt.control.repository.EstudianteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EstudianteService {

    private final EstudianteRepository repo;

    public EstudianteService(EstudianteRepository repo) {
        this.repo = repo;
    }

    public List<Estudiante> obtenerTodos() {
        return repo.listarTodos();
    }

    public Optional<Estudiante> buscarPorCedula(String cedula) {
        return repo.buscarPorCedula(cedula);
    }

    public void eliminarPorCedula(String cedula) {
        repo.eliminarPorCedula(cedula);
    }

    public String registrar(Estudiante e) {
        if (e.getCedula() == null || e.getCedula().isBlank())
            return "ERROR: La cédula es obligatoria";
        if (e.getNombresCompletos() == null || e.getNombresCompletos().isBlank())
            return "ERROR: Los nombres son obligatorios";
        if (e.getApellidosCompletos() == null || e.getApellidosCompletos().isBlank())
            return "ERROR: Los apellidos son obligatorios";
        if (repo.existeCedula(e.getCedula()))
            return "ERROR: Ya existe un estudiante con cédula " + e.getCedula();

        repo.insertar(e);
        return "OK";
    }

    public void actualizar(String cedula, Estudiante e) {
        repo.actualizar(cedula, e);
    }
}