package com.husrt.control.service;

import com.husrt.control.model.Docente;
import com.husrt.control.repository.DocenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocenteService {

    private final DocenteRepository repo;

    public DocenteService(DocenteRepository repo) {
        this.repo = repo;
    }

    public List<Docente> obtenerTodos() {
        return repo.listarTodos();
    }

    public Optional<Docente> buscarPorCedula(String cedula) {
        return repo.buscarPorCedula(cedula);
    }

    public String registrar(Docente d) {
        if (d.getCedula() == null || d.getCedula().isBlank())
            return "ERROR: La cédula es obligatoria";
        if (d.getNombre() == null || d.getNombre().isBlank())
            return "ERROR: El nombre es obligatorio";
        if (repo.existeCedula(d.getCedula()))
            return "ERROR: Ya existe un usuario con cédula " + d.getCedula();
        repo.insertar(d);
        return "OK";
    }

    public void eliminar(String cedula) {
        repo.eliminar(cedula);
    }

    public void cambiarEstado(String cedula, boolean activo) {
        repo.cambiarEstado(cedula, activo);
    }

    public void cambiarPassword(String cedula, String nuevaPassword) {
        repo.cambiarPassword(cedula, nuevaPassword);
    }
}