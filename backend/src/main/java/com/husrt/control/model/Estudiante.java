package com.husrt.control.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Estudiante {

    private Integer idEstudiante;

    // Académico
    private String programaAcademico;
    private String institucionEducativa;
    private String tipoVinculacion;
    private String fotoUrl;

    // Personal
    private String cedula;
    private String tipoDocumento;
    private String nombresCompletos;
    private String apellidosCompletos;
    private String estadoCivil;
    private LocalDate fechaNacimiento;
    private String lugarNacimiento;
    private String genero;

    // Contacto
    private String direccionTunja;
    private String lugarResidenciaPermanente;
    private String celular;
    private String email;

    // Representante legal
    private String direccionRepresentante;
    private String ciudadRepresentante;
    private String nombreRepresentante;
    private String parentesco;
    private String celularRepresentante;

    // Complementarios
    private String idiomaAdicional;
    private String actividadesComplementarias;

    // Familia
    private String nombrePadre;
    private Integer edadPadre;
    private String nombreMadre;
    private Integer edadMadre;
    private Boolean tieneHijos;
    private String nombreHijos;
    private String edadesHijos;
    private String nombreEsposo;
    private Integer edadEsposo;

    // Salud
    private String enfermedadesGenerales;
    private String enfermedadesMentales;
    private String medicamentos;
    private String alergias;
    private BigDecimal peso;
    private BigDecimal talla;
    private BigDecimal imc;
    private String grupoSanguineo;

    // Convivencia
    private String companerosTunja;
    private String nucleoFamiliarTunja;

    // Datos académicos
    private Integer semestreAcademico;
    private Integer idUniversidad;
    private BigDecimal promedioAcumulado;
    private String investigacion;
    private LocalDate fechaIngresoProg;
    private String semestre;

    // Habilitantes RF-01
    private Boolean induccionCompletada;
    private LocalDate fechaInduccion;
    private LocalDate arlVigenciaInicio;
    private LocalDate arlVigenciaFin;
    private String estado;

    public Estudiante() {
    }

    public Integer getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(Integer v) {
        this.idEstudiante = v;
    }

    public String getProgramaAcademico() {
        return programaAcademico;
    }

    public void setProgramaAcademico(String v) {
        this.programaAcademico = v;
    }

    public String getInstitucionEducativa() {
        return institucionEducativa;
    }

    public void setInstitucionEducativa(String v) {
        this.institucionEducativa = v;
    }

    public String getTipoVinculacion() {
        return tipoVinculacion;
    }

    public void setTipoVinculacion(String v) {
        this.tipoVinculacion = v;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String v) {
        this.fotoUrl = v;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String v) {
        this.cedula = v;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String v) {
        this.tipoDocumento = v;
    }

    public String getNombresCompletos() {
        return nombresCompletos;
    }

    public void setNombresCompletos(String v) {
        this.nombresCompletos = v;
    }

    public String getApellidosCompletos() {
        return apellidosCompletos;
    }

    public void setApellidosCompletos(String v) {
        this.apellidosCompletos = v;
    }

    public String getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(String v) {
        this.estadoCivil = v;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate v) {
        this.fechaNacimiento = v;
    }

    public String getLugarNacimiento() {
        return lugarNacimiento;
    }

    public void setLugarNacimiento(String v) {
        this.lugarNacimiento = v;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String v) {
        this.genero = v;
    }

    public String getDireccionTunja() {
        return direccionTunja;
    }

    public void setDireccionTunja(String v) {
        this.direccionTunja = v;
    }

    public String getLugarResidenciaPermanente() {
        return lugarResidenciaPermanente;
    }

    public void setLugarResidenciaPermanente(String v) {
        this.lugarResidenciaPermanente = v;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String v) {
        this.celular = v;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String v) {
        this.email = v;
    }

    public String getDireccionRepresentante() {
        return direccionRepresentante;
    }

    public void setDireccionRepresentante(String v) {
        this.direccionRepresentante = v;
    }

    public String getCiudadRepresentante() {
        return ciudadRepresentante;
    }

    public void setCiudadRepresentante(String v) {
        this.ciudadRepresentante = v;
    }

    public String getNombreRepresentante() {
        return nombreRepresentante;
    }

    public void setNombreRepresentante(String v) {
        this.nombreRepresentante = v;
    }

    public String getParentesco() {
        return parentesco;
    }

    public void setParentesco(String v) {
        this.parentesco = v;
    }

    public String getCelularRepresentante() {
        return celularRepresentante;
    }

    public void setCelularRepresentante(String v) {
        this.celularRepresentante = v;
    }

    public String getIdiomaAdicional() {
        return idiomaAdicional;
    }

    public void setIdiomaAdicional(String v) {
        this.idiomaAdicional = v;
    }

    public String getActividadesComplementarias() {
        return actividadesComplementarias;
    }

    public void setActividadesComplementarias(String v) {
        this.actividadesComplementarias = v;
    }

    public String getNombrePadre() {
        return nombrePadre;
    }

    public void setNombrePadre(String v) {
        this.nombrePadre = v;
    }

    public Integer getEdadPadre() {
        return edadPadre;
    }

    public void setEdadPadre(Integer v) {
        this.edadPadre = v;
    }

    public String getNombreMadre() {
        return nombreMadre;
    }

    public void setNombreMadre(String v) {
        this.nombreMadre = v;
    }

    public Integer getEdadMadre() {
        return edadMadre;
    }

    public void setEdadMadre(Integer v) {
        this.edadMadre = v;
    }

    public Boolean getTieneHijos() {
        return tieneHijos;
    }

    public void setTieneHijos(Boolean v) {
        this.tieneHijos = v;
    }

    public String getNombreHijos() {
        return nombreHijos;
    }

    public void setNombreHijos(String v) {
        this.nombreHijos = v;
    }

    public String getEdadesHijos() {
        return edadesHijos;
    }

    public void setEdadesHijos(String v) {
        this.edadesHijos = v;
    }

    public String getNombreEsposo() {
        return nombreEsposo;
    }

    public void setNombreEsposo(String v) {
        this.nombreEsposo = v;
    }

    public Integer getEdadEsposo() {
        return edadEsposo;
    }

    public void setEdadEsposo(Integer v) {
        this.edadEsposo = v;
    }

    public String getEnfermedadesGenerales() {
        return enfermedadesGenerales;
    }

    public void setEnfermedadesGenerales(String v) {
        this.enfermedadesGenerales = v;
    }

    public String getEnfermedadesMentales() {
        return enfermedadesMentales;
    }

    public void setEnfermedadesMentales(String v) {
        this.enfermedadesMentales = v;
    }

    public String getMedicamentos() {
        return medicamentos;
    }

    public void setMedicamentos(String v) {
        this.medicamentos = v;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String v) {
        this.alergias = v;
    }

    public BigDecimal getPeso() {
        return peso;
    }

    public void setPeso(BigDecimal v) {
        this.peso = v;
    }

    public BigDecimal getTalla() {
        return talla;
    }

    public void setTalla(BigDecimal v) {
        this.talla = v;
    }

    public BigDecimal getImc() {
        return imc;
    }

    public void setImc(BigDecimal v) {
        this.imc = v;
    }

    public String getGrupoSanguineo() {
        return grupoSanguineo;
    }

    public void setGrupoSanguineo(String v) {
        this.grupoSanguineo = v;
    }

    public String getCompanerosTunja() {
        return companerosTunja;
    }

    public void setCompanerosTunja(String v) {
        this.companerosTunja = v;
    }

    public String getNucleoFamiliarTunja() {
        return nucleoFamiliarTunja;
    }

    public void setNucleoFamiliarTunja(String v) {
        this.nucleoFamiliarTunja = v;
    }

    public Integer getSemestreAcademico() {
        return semestreAcademico;
    }

    public void setSemestreAcademico(Integer v) {
        this.semestreAcademico = v;
    }

    public Integer getIdUniversidad() {
        return idUniversidad;
    }

    public void setIdUniversidad(Integer v) {
        this.idUniversidad = v;
    }

    public BigDecimal getPromedioAcumulado() {
        return promedioAcumulado;
    }

    public void setPromedioAcumulado(BigDecimal v) {
        this.promedioAcumulado = v;
    }

    public String getInvestigacion() {
        return investigacion;
    }

    public void setInvestigacion(String v) {
        this.investigacion = v;
    }

    public LocalDate getFechaIngresoProg() {
        return fechaIngresoProg;
    }

    public void setFechaIngresoProg(LocalDate v) {
        this.fechaIngresoProg = v;
    }

    public String getSemestre() {
        return semestre;
    }

    public void setSemestre(String v) {
        this.semestre = v;
    }

    public Boolean getInduccionCompletada() {
        return induccionCompletada;
    }

    public void setInduccionCompletada(Boolean v) {
        this.induccionCompletada = v;
    }

    public LocalDate getFechaInduccion() {
        return fechaInduccion;
    }

    public void setFechaInduccion(LocalDate v) {
        this.fechaInduccion = v;
    }

    public LocalDate getArlVigenciaInicio() {
        return arlVigenciaInicio;
    }

    public void setArlVigenciaInicio(LocalDate v) {
        this.arlVigenciaInicio = v;
    }

    public LocalDate getArlVigenciaFin() {
        return arlVigenciaFin;
    }

    public void setArlVigenciaFin(LocalDate v) {
        this.arlVigenciaFin = v;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String v) {
        this.estado = v;
    }

    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}