package com.husrt.control.model;

public class ResultadoAcceso {

    private boolean aprobado;
    private String mensaje;
    private String nombreEstudiante;
    private String programa;
    private String servicio;
    private String franjaHoraria;
    private String motivoRechazo;

    public ResultadoAcceso() {
    }

    // Constructor aprobado
    public static ResultadoAcceso aprobado(Estudiante e, String servicio, String franja) {
        ResultadoAcceso r = new ResultadoAcceso();
        r.aprobado = true;
        r.nombreEstudiante = e.getNombresCompletos() + " " + e.getApellidosCompletos();
        r.programa = e.getProgramaAcademico();
        r.servicio = servicio;
        r.franjaHoraria = franja;
        r.mensaje = "ACCESO APROBADO";
        return r;
    }

    // Constructor rechazado
    public static ResultadoAcceso rechazado(String motivo) {
        ResultadoAcceso r = new ResultadoAcceso();
        r.aprobado = false;
        r.mensaje = "ACCESO RECHAZADO";
        r.motivoRechazo = motivo;
        return r;
    }

    public boolean isAprobado() {
        return aprobado;
    }

    public void setAprobado(boolean aprobado) {
        this.aprobado = aprobado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getNombreEstudiante() {
        return nombreEstudiante;
    }

    public void setNombreEstudiante(String nombreEstudiante) {
        this.nombreEstudiante = nombreEstudiante;
    }

    public String getPrograma() {
        return programa;
    }

    public void setPrograma(String programa) {
        this.programa = programa;
    }

    public String getServicio() {
        return servicio;
    }

    public void setServicio(String servicio) {
        this.servicio = servicio;
    }

    public String getFranjaHoraria() {
        return franjaHoraria;
    }

    public void setFranjaHoraria(String franjaHoraria) {
        this.franjaHoraria = franjaHoraria;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }
}