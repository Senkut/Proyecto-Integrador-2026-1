package com.husrt.control.service;

import com.husrt.control.model.Estudiante;
import com.husrt.control.model.ResultadoAcceso;
import com.husrt.control.repository.EstudianteRepository;
import com.husrt.control.repository.PorteriaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PorteriaService {

        private final EstudianteRepository estudianteRepo;
        private final PorteriaRepository porteriaRepo;

        public PorteriaService(EstudianteRepository estudianteRepo,
                        PorteriaRepository porteriaRepo) {
                this.estudianteRepo = estudianteRepo;
                this.porteriaRepo = porteriaRepo;
        }

        public ResultadoAcceso validarIngreso(String cedula) {

                // VALIDACION 1 — Está registrado en el sistema?
                Optional<Estudiante> opt = estudianteRepo.buscarPorCedula(cedula);
                if (opt.isEmpty()) {
                        return ResultadoAcceso.rechazado(
                                        "Estudiante no registrado en el sistema. Cedula: " + cedula);
                }

                Estudiante e = opt.get();

                // VALIDACION 2 — Completó la inducción hospitalaria?
                if (e.getInduccionCompletada() == null || !e.getInduccionCompletada()) {
                        return ResultadoAcceso.rechazado(
                                        e.getNombresCompletos() + " " + e.getApellidosCompletos() +
                                                        " no ha completado la induccion hospitalaria.");
                }

                // VALIDACION 3 — Tiene ARL vigente hoy?
                if (e.getArlVigenciaFin() == null ||
                                e.getArlVigenciaFin().isBefore(LocalDate.now())) {
                        String vence = e.getArlVigenciaFin() != null
                                        ? e.getArlVigenciaFin().toString()
                                        : "sin fecha";
                        return ResultadoAcceso.rechazado(
                                        "ARL vencida desde " + vence +
                                                        ". Debe renovar antes de ingresar.");
                }

                // VALIDACION 4 — Tiene asignacion para hoy en este horario?
                List<Map<String, Object>> asignaciones = porteriaRepo.buscarAsignacionVigente(e.getIdEstudiante());

                if (asignaciones.isEmpty()) {
                        return ResultadoAcceso.rechazado(
                                        "No tiene practica asignada para hoy en este horario. " +
                                                        "Verifique con su docente que el horario este registrado en el sistema.");
                }

                Map<String, Object> asignacion = asignaciones.get(0);
                Integer idAsignacion = (Integer) asignacion.get("id_asignacion");
                Integer idPlan = (Integer) asignacion.get("id_plan");
                String servicio = asignacion.get("nombre_servicio") + " — Piso " + asignacion.get("piso");
                String franja = asignacion.get("hora_inicio") + " - " + asignacion.get("hora_fin");

                // VALIDACION 5 — El docente ya ingresó?
                // Solo advertencia, no bloquea.
                boolean docentePresente = porteriaRepo.docenteIngresoHoy(idPlan);

                // Si ya está dentro, bloquear doble ingreso
                if (porteriaRepo.estudianteYaDentro(e.getIdEstudiante())) {
                        return ResultadoAcceso.rechazado(
                                        e.getNombresCompletos() + " " + e.getApellidosCompletos() +
                                                        " ya tiene un ingreso activo sin salida registrada.");
                }

                // Todo OK — registrar ingreso
                porteriaRepo.registrarIngreso(e.getIdEstudiante(), idAsignacion,
                                "APROBADO", null);

                return ResultadoAcceso.aprobado(e, servicio, franja);
        }

        /**
         * FIX: Ahora retorna un ResultadoAcceso en lugar de String,
         * para que el controller pueda comunicar errores reales al frontend
         * (p.ej. cédula no encontrada, o no había ingreso abierto para cerrar).
         */
        public ResultadoAcceso registrarSalida(String cedula) {
                Optional<Estudiante> opt = estudianteRepo.buscarPorCedula(cedula);
                if (opt.isEmpty()) {
                        return ResultadoAcceso.rechazado("Cedula no encontrada: " + cedula);
                }

                Estudiante e = opt.get();
                int filas = porteriaRepo.registrarSalida(e.getIdEstudiante());

                if (filas == 0) {
                        return ResultadoAcceso.rechazado(
                                        e.getNombresCompletos() + " " + e.getApellidosCompletos() +
                                                        " no tiene un ingreso activo hoy. " +
                                                        "Verifique que haya registrado su entrada primero.");
                }

                // Reutilizamos ResultadoAcceso.aprobado con un mensaje de salida
                ResultadoAcceso r = new ResultadoAcceso();
                r.setAprobado(true);
                r.setMensaje("Salida registrada para " + e.getNombresCompletos() +
                                " " + e.getApellidosCompletos());
                r.setNombreEstudiante(e.getNombresCompletos() + " " + e.getApellidosCompletos());
                return r;
        }
}