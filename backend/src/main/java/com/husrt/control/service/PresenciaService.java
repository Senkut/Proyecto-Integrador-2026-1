package com.husrt.control.service;

import com.husrt.control.repository.PresenciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PresenciaService {

    private final PresenciaRepository repo;

    public PresenciaService(PresenciaRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> obtenerPresencia() {
        return repo.estudiantesDentro();
    }

    public int totalDentro() {
        return repo.totalDentro();
    }

    public List<Map<String, Object>> obtenerAlertas() {
        return repo.alertasFranjaVencida();
    }

    public List<Map<String, Object>> registrosHoy() {
        return repo.registrosHoy();
    }
}