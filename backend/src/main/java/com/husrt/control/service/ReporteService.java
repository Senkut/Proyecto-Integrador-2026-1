package com.husrt.control.service;

import com.husrt.control.repository.ReporteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReporteService {

    private final ReporteRepository repo;

    public ReporteService(ReporteRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> historialEstudiante(String cedula) {
        return repo.historialPorEstudiante(cedula);
    }

    public List<Map<String, Object>> arlProximaAVencer() {
        return repo.arlProximaAVencer();
    }

    public List<Map<String, Object>> rechazadosHoy() {
        return repo.rechazadosHoy();
    }

    public List<Map<String, Object>> horasAcumuladas() {
        return repo.horasAcumuladas();
    }
}