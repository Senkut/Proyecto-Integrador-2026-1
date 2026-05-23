package com.husrt.control.controller;

import com.husrt.control.model.Estudiante;
import com.husrt.control.service.EstudianteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // ← RestController, no Controller
@RequestMapping("/api/estudiantes") // ← ruta correcta
public class EstudianteApiController {

    private final EstudianteService service;

    public EstudianteApiController(EstudianteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerTodos().stream().map(e -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", e.getIdEstudiante());
            String nombres = e.getNombresCompletos() != null && !e.getNombresCompletos().isBlank()
                    ? e.getNombresCompletos()
                    : (e.getNombresCompletos() != null ? e.getNombresCompletos() : "");
            String apellidos = e.getApellidosCompletos() != null && !e.getApellidosCompletos().isBlank()
                    ? e.getApellidosCompletos()
                    : (e.getApellidosCompletos() != null ? e.getApellidosCompletos() : "");
            m.put("name", (nombres + " " + apellidos).trim());
            m.put("nombresCompletos", nombres);
            m.put("apellidos", apellidos);
            m.put("apellidosCompletos", apellidos); // FIX: enviar también con la clave que espera el frontend al editar
            m.put("cedula", e.getCedula());
            m.put("universidad", e.getInstitucionEducativa()); // nombre de la institución, no el ID
            m.put("programa", e.getProgramaAcademico());
            m.put("semestre", e.getSemestreAcademico());
            m.put("estado", e.getEstado() != null ? e.getEstado().toUpperCase() : "ACTIVO");
            m.put("induccionHospitalaria", Boolean.TRUE.equals(e.getInduccionCompletada()));
            m.put("fechaInduccion", e.getFechaInduccion());
            m.put("arl", e.getArlVigenciaFin() != null &&
                    e.getArlVigenciaFin().isAfter(java.time.LocalDate.now()));
            m.put("fechaARLInicio", e.getArlVigenciaInicio());
            m.put("fechaARL", e.getArlVigenciaFin());
            m.put("genero", e.getGenero());
            m.put("celular", e.getCelular());
            m.put("email", e.getEmail());
            m.put("direccionTunja", e.getDireccionTunja());
            m.put("lugarResidenciaPermanente", e.getLugarResidenciaPermanente());
            m.put("tipoDocumento", e.getTipoDocumento());
            m.put("tipoVinculacion", e.getTipoVinculacion());
            m.put("estadoCivil", e.getEstadoCivil());
            m.put("fechaNacimiento", e.getFechaNacimiento());
            m.put("lugarNacimiento", e.getLugarNacimiento());
            m.put("nombreRepresentante", e.getNombreRepresentante());
            m.put("parentesco", e.getParentesco());
            m.put("celularRepresentante", e.getCelularRepresentante());
            m.put("direccionRepresentante", e.getDireccionRepresentante());
            m.put("ciudadRepresentante", e.getCiudadRepresentante());
            m.put("grupoSanguineo", e.getGrupoSanguineo());
            m.put("tieneHijos", Boolean.TRUE.equals(e.getTieneHijos()));
            m.put("nombreHijos", e.getNombreHijos());
            m.put("edadesHijos", e.getEdadesHijos());
            m.put("nombreEsposo", e.getNombreEsposo());
            m.put("edadEsposo", e.getEdadEsposo());
            m.put("nombrePadre", e.getNombrePadre());
            m.put("edadPadre", e.getEdadPadre());
            m.put("nombreMadre", e.getNombreMadre());
            m.put("edadMadre", e.getEdadMadre());
            m.put("enfermedadesGenerales", e.getEnfermedadesGenerales());
            m.put("enfermedadesMentales", e.getEnfermedadesMentales());
            m.put("medicamentos", e.getMedicamentos());
            m.put("alergias", e.getAlergias());
            m.put("peso", e.getPeso());
            m.put("talla", e.getTalla());
            m.put("imc", e.getImc());
            m.put("companerosTunja", e.getCompanerosTunja());
            m.put("nucleoFamiliarTunja", e.getNucleoFamiliarTunja());
            m.put("idiomaAdicional", e.getIdiomaAdicional());
            m.put("actividadesComplementarias", e.getActividadesComplementarias());
            m.put("fotoUrl", e.getFotoUrl());
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> registrar(@RequestBody Map<String, Object> datos) {
        System.out.println(">>> DATOS RECIBIDOS: " + datos);
        Estudiante e = new Estudiante();

        // Nombres — el frontend manda nombresCompletos y apellidos por separado
        String nombresCompletos = (String) datos.get("nombresCompletos");
        Object _apellidosRaw = datos.getOrDefault("apellidosCompletos", datos.get("apellidos"));
        String apellidosCompletos = _apellidosRaw != null ? _apellidosRaw.toString() : "";

        // Compatibilidad con formato antiguo que manda "name" completo
        if (nombresCompletos == null || nombresCompletos.isBlank()) {
            String nameCompleto = (String) datos.get("name");
            if (nameCompleto != null) {
                String[] partes = nameCompleto.split(" ", 2);
                nombresCompletos = partes[0];
                apellidosCompletos = partes.length > 1 ? partes[1] : "";
            }
        }

        e.setNombresCompletos(nombresCompletos);
        e.setApellidosCompletos(apellidosCompletos);
        e.setCedula((String) datos.get("cedula"));
        e.setProgramaAcademico((String) datos.get("programa"));
        e.setInstitucionEducativa((String) datos.get("institucionEducativa"));
        e.setTipoVinculacion((String) datos.get("tipoVinculacion"));
        e.setTipoDocumento((String) datos.get("tipoDocumento"));
        e.setEstadoCivil((String) datos.get("estadoCivil"));
        e.setGenero((String) datos.get("genero"));
        e.setCelular((String) datos.get("celular"));
        e.setEmail((String) datos.get("email"));
        e.setDireccionTunja((String) datos.get("direccionTunja"));
        e.setLugarNacimiento((String) datos.get("lugarNacimiento"));
        e.setNombreRepresentante((String) datos.get("nombreRepresentante"));
        e.setParentesco((String) datos.get("parentesco"));
        e.setGrupoSanguineo((String) datos.get("grupoSanguineo"));
        // Representante (campos adicionales)
        e.setDireccionRepresentante((String) datos.get("direccionRepresentante"));
        e.setCiudadRepresentante((String) datos.get("ciudadRepresentante"));
        e.setCelularRepresentante((String) datos.get("celularRepresentante"));

        // Complementarios
        e.setIdiomaAdicional((String) datos.get("idiomaAdicional"));
        e.setActividadesComplementarias((String) datos.get("actividadesComplementarias"));

        // Familia
        e.setNombrePadre((String) datos.get("nombrePadre"));
        e.setNombreMadre((String) datos.get("nombreMadre"));
        e.setNombreHijos((String) datos.get("nombreHijos"));
        e.setEdadesHijos((String) datos.get("edadesHijos"));
        e.setNombreEsposo((String) datos.get("nombreEsposo"));

        Object edadPadreObj = datos.get("edadPadre");
        if (edadPadreObj != null && !edadPadreObj.toString().isBlank()) {
            try {
                e.setEdadPadre(Integer.parseInt(edadPadreObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }
        Object edadMadreObj = datos.get("edadMadre");
        if (edadMadreObj != null && !edadMadreObj.toString().isBlank()) {
            try {
                e.setEdadMadre(Integer.parseInt(edadMadreObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }
        Object edadEsosoObj = datos.get("edadEsposo");
        if (edadEsosoObj != null && !edadEsosoObj.toString().isBlank()) {
            try {
                e.setEdadEsposo(Integer.parseInt(edadEsosoObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }

        // Salud
        e.setEnfermedadesGenerales((String) datos.get("enfermedadesGenerales"));
        e.setEnfermedadesMentales((String) datos.get("enfermedadesMentales"));
        e.setMedicamentos((String) datos.get("medicamentos"));
        e.setAlergias((String) datos.get("alergias"));

        Object pesoObj = datos.get("peso");
        if (pesoObj != null && !pesoObj.toString().isBlank()) {
            try {
                e.setPeso(new java.math.BigDecimal(pesoObj.toString()));
            } catch (Exception ex) {
            }
        }
        Object tallaObj = datos.get("talla");
        if (tallaObj != null && !tallaObj.toString().isBlank()) {
            try {
                e.setTalla(new java.math.BigDecimal(tallaObj.toString()));
            } catch (Exception ex) {
            }
        }
        Object imcObj = datos.get("imc");
        if (imcObj != null && !imcObj.toString().isBlank()) {
            try {
                e.setImc(new java.math.BigDecimal(imcObj.toString()));
            } catch (Exception ex) {
            }
        }

        // Convivencia
        e.setCompanerosTunja((String) datos.get("companerosTunja"));
        e.setNucleoFamiliarTunja((String) datos.get("nucleoFamiliarTunja"));

        // Residencia
        e.setLugarResidenciaPermanente((String) datos.get("lugarResidenciaPermanente"));

        // Booleanos
        e.setInduccionCompletada(Boolean.TRUE.equals(datos.get("induccionHospitalaria")));
        e.setTieneHijos(Boolean.TRUE.equals(datos.get("tieneHijos")));

        // Semestre
        Object sem = datos.get("semestre");
        if (sem != null && !sem.toString().isBlank()) {
            try {
                e.setSemestreAcademico(Integer.parseInt(sem.toString()));
            } catch (NumberFormatException ex) {
                e.setSemestreAcademico(null);
            }
        }

        // Estado
        Object estadoObj = datos.get("estado");
        e.setEstado(estadoObj != null ? estadoObj.toString().toLowerCase() : "activo");

        // Fechas
        try {
            String fechaARLInicio = (String) datos.get("fechaARLInicio");
            if (fechaARLInicio != null && !fechaARLInicio.isBlank())
                e.setArlVigenciaInicio(java.time.LocalDate.parse(fechaARLInicio));
            String fechaARL = (String) datos.get("fechaARL");
            if (fechaARL != null && !fechaARL.isBlank())
                e.setArlVigenciaFin(java.time.LocalDate.parse(fechaARL));

            String fechaInd = (String) datos.get("fechaInduccion");
            if (fechaInd != null && !fechaInd.isBlank())
                e.setFechaInduccion(java.time.LocalDate.parse(fechaInd));

            String fechaNac = (String) datos.get("fechaNacimiento");
            if (fechaNac != null && !fechaNac.isBlank())
                e.setFechaNacimiento(java.time.LocalDate.parse(fechaNac));
        } catch (Exception ex) {
            System.err.println("Error parseando fecha: " + ex.getMessage());
        }

        // Foto de perfil (base64 o URL)
        String fotoUrlPost = (String) datos.get("fotoUrl");
        if (fotoUrlPost != null && !fotoUrlPost.isBlank())
            e.setFotoUrl(fotoUrlPost);

        // Contraseña: usar la enviada, o la cédula como default
        String pwd = (String) datos.get("password");
        e.setPassword((pwd != null && !pwd.isBlank()) ? pwd : e.getCedula());

        String resultado = service.registrar(e);
        return Map.of("ok", resultado.equals("OK"), "mensaje", resultado);
    }

    @PatchMapping("/{cedula}")
    public ResponseEntity<?> actualizar(
            @PathVariable String cedula,
            @RequestBody Map<String, Object> datos) {
        try {
            Estudiante e = new Estudiante();
            e.setNombresCompletos((String) datos.get("nombresCompletos"));
            String _ap = datos.getOrDefault("apellidosCompletos", datos.get("apellidos")) != null
                    ? datos.getOrDefault("apellidosCompletos", datos.get("apellidos")).toString()
                    : "";
            e.setApellidosCompletos(_ap);

            String nombresCompletos = (String) datos.get("nombresCompletos");
            String apellidosCompletos = _ap;

            // Compatibilidad con formato que manda "name" completo
            if (nombresCompletos == null || nombresCompletos.isBlank()) {
                String nameCompleto = (String) datos.get("name");
                if (nameCompleto != null) {
                    String[] partes = nameCompleto.split(" ", 2);
                    nombresCompletos = partes[0];
                    apellidosCompletos = partes.length > 1 ? partes[1] : "";
                }
            }

            e.setNombresCompletos(nombresCompletos);
            e.setApellidosCompletos(apellidosCompletos);
            e.setProgramaAcademico((String) datos.get("programa"));
            e.setInstitucionEducativa((String) datos.get("institucionEducativa"));
            e.setTipoVinculacion((String) datos.get("tipoVinculacion"));
            e.setTipoDocumento((String) datos.get("tipoDocumento"));
            e.setEstadoCivil((String) datos.get("estadoCivil"));
            e.setGenero((String) datos.get("genero"));
            e.setCelular((String) datos.get("celular"));
            e.setEmail((String) datos.get("email"));
            e.setDireccionTunja((String) datos.get("direccionTunja"));
            e.setLugarNacimiento((String) datos.get("lugarNacimiento"));
            e.setNombreRepresentante((String) datos.get("nombreRepresentante"));
            e.setParentesco((String) datos.get("parentesco"));
            e.setGrupoSanguineo((String) datos.get("grupoSanguineo"));
            e.setTieneHijos(Boolean.TRUE.equals(datos.get("tieneHijos")));
            // FIX: campos del representante que faltaban en el PATCH
            e.setDireccionRepresentante((String) datos.get("direccionRepresentante"));
            e.setCiudadRepresentante((String) datos.get("ciudadRepresentante"));
            e.setCelularRepresentante((String) datos.get("celularRepresentante"));
            // FIX: campos de familia
            e.setNombrePadre((String) datos.get("nombrePadre"));
            e.setNombreMadre((String) datos.get("nombreMadre"));
            e.setNombreHijos((String) datos.get("nombreHijos"));
            e.setEdadesHijos((String) datos.get("edadesHijos"));
            e.setNombreEsposo((String) datos.get("nombreEsposo"));
            Object edadPadreObjP = datos.get("edadPadre");
            if (edadPadreObjP != null && !edadPadreObjP.toString().isBlank()) {
                try {
                    e.setEdadPadre(Integer.parseInt(edadPadreObjP.toString()));
                } catch (NumberFormatException ignored) {
                }
            }
            Object edadMadreObjP = datos.get("edadMadre");
            if (edadMadreObjP != null && !edadMadreObjP.toString().isBlank()) {
                try {
                    e.setEdadMadre(Integer.parseInt(edadMadreObjP.toString()));
                } catch (NumberFormatException ignored) {
                }
            }
            Object edadEsposoObjP = datos.get("edadEsposo");
            if (edadEsposoObjP != null && !edadEsposoObjP.toString().isBlank()) {
                try {
                    e.setEdadEsposo(Integer.parseInt(edadEsposoObjP.toString()));
                } catch (NumberFormatException ignored) {
                }
            }
            // FIX: campos de salud
            e.setEnfermedadesGenerales((String) datos.get("enfermedadesGenerales"));
            e.setEnfermedadesMentales((String) datos.get("enfermedadesMentales"));
            e.setMedicamentos((String) datos.get("medicamentos"));
            e.setAlergias((String) datos.get("alergias"));
            Object pesoP = datos.get("peso");
            if (pesoP != null && !pesoP.toString().isBlank()) {
                try {
                    e.setPeso(new java.math.BigDecimal(pesoP.toString()));
                } catch (Exception ignored) {
                }
            }
            Object tallaP = datos.get("talla");
            if (tallaP != null && !tallaP.toString().isBlank()) {
                try {
                    e.setTalla(new java.math.BigDecimal(tallaP.toString()));
                } catch (Exception ignored) {
                }
            }
            Object imcP = datos.get("imc");
            if (imcP != null && !imcP.toString().isBlank()) {
                try {
                    e.setImc(new java.math.BigDecimal(imcP.toString()));
                } catch (Exception ignored) {
                }
            }
            // FIX: campos de convivencia e información adicional
            e.setCompanerosTunja((String) datos.get("companerosTunja"));
            e.setNucleoFamiliarTunja((String) datos.get("nucleoFamiliarTunja"));
            e.setLugarResidenciaPermanente((String) datos.get("lugarResidenciaPermanente"));
            e.setIdiomaAdicional((String) datos.get("idiomaAdicional"));
            e.setActividadesComplementarias((String) datos.get("actividadesComplementarias"));

            Object sem = datos.get("semestre");
            if (sem != null && !sem.toString().isBlank()) {
                try {
                    e.setSemestreAcademico(Integer.parseInt(sem.toString()));
                } catch (NumberFormatException ex) {
                    e.setSemestreAcademico(null);
                }
            }

            // Estado e inducción
            Object estadoObj = datos.get("estado");
            e.setEstado(estadoObj != null ? estadoObj.toString().toLowerCase() : "activo");
            e.setInduccionCompletada(Boolean.TRUE.equals(datos.get("induccionHospitalaria")));

            // Fechas opcionales
            try {
                String fechaARLInicioP = (String) datos.get("fechaARLInicio");
                if (fechaARLInicioP != null && !fechaARLInicioP.isBlank())
                    e.setArlVigenciaInicio(java.time.LocalDate.parse(fechaARLInicioP));
                String fechaARL = (String) datos.get("fechaARL");
                if (fechaARL != null && !fechaARL.isBlank())
                    e.setArlVigenciaFin(java.time.LocalDate.parse(fechaARL));

                String fechaInd = (String) datos.get("fechaInduccion");
                if (fechaInd != null && !fechaInd.isBlank())
                    e.setFechaInduccion(java.time.LocalDate.parse(fechaInd));

                String fechaNac = (String) datos.get("fechaNacimiento");
                if (fechaNac != null && !fechaNac.isBlank())
                    e.setFechaNacimiento(java.time.LocalDate.parse(fechaNac));
            } catch (Exception ex) {
                System.err.println("Error parseando fecha en PATCH: " + ex.getMessage());
            }

            // Actualizar password si viene en el PATCH
            Object pwdPatch = datos.get("password");
            if (pwdPatch != null && !pwdPatch.toString().isBlank()) {
                e.setPassword(pwdPatch.toString());
            }

            // Foto de perfil (base64 o URL) — solo actualizar si viene en el body
            String fotoUrlPatch = (String) datos.get("fotoUrl");
            if (fotoUrlPatch != null && !fotoUrlPatch.isBlank()) {
                e.setFotoUrl(fotoUrlPatch);
            }

            service.actualizar(cedula, e);
            return ResponseEntity.ok(Map.of("ok", true, "mensaje", "Estudiante actualizado"));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("ok", false, "error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{cedula}")
    public Map<String, Object> eliminar(@PathVariable String cedula) {
        service.eliminarPorCedula(cedula);
        return Map.of("ok", true);
    }
}