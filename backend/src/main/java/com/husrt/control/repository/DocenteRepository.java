package com.husrt.control.repository;

import com.husrt.control.model.Docente;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class DocenteRepository {

    private final JdbcTemplate jdbc;

    public DocenteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Docente> mapper = (rs, rowNum) -> {
        Docente d = new Docente();
        d.setIdDocente(rs.getInt("id_docente"));
        d.setCedula(rs.getString("cedula"));
        d.setNombre(rs.getString("nombre"));
        d.setApellido(rs.getString("apellido"));
        d.setIdUniversidad(rs.getInt("id_universidad"));
        d.setProgramaQueSupervisa(rs.getString("programa_que_supervisa"));
        try {
            d.setActivo(rs.getBoolean("activo"));
        } catch (Exception e) {
            d.setActivo(true);
        }
        try {
            d.setRol(rs.getString("rol"));
        } catch (Exception e) {
            d.setRol("docente");
        }
        try {
            d.setPassword(rs.getString("password"));
        } catch (Exception e) {
            d.setPassword("");
        }
        return d;
    };

    public List<Docente> listarTodos() {
        return jdbc.query("SELECT * FROM docente ORDER BY apellido, nombre", mapper);
    }

    public Optional<Docente> buscarPorCedula(String cedula) {
        // Asegúrate que el RowMapper incluya el campo 'activo'
        List<Docente> r = jdbc.query(
                "SELECT * FROM docente WHERE cedula = ?", mapper, cedula);
        return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
    }

    public boolean existeCedula(String cedula) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM docente WHERE cedula = ?", Integer.class, cedula);
        return c != null && c > 0;
    }

    public void insertar(Docente d) {
        jdbc.update("""
                INSERT INTO docente
                (cedula, nombre, apellido, id_universidad, programa_que_supervisa, rol, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                d.getCedula(), d.getNombre(), d.getApellido(),
                d.getIdUniversidad(), d.getProgramaQueSupervisa(),
                d.getRol() != null ? d.getRol() : "docente",
                d.getPassword() != null ? d.getPassword() : d.getCedula());
    }

    public void eliminar(String cedula) {
        jdbc.update("DELETE FROM docente WHERE cedula = ?", cedula);
    }

    public void cambiarEstado(String cedula, boolean activo) {
        jdbc.update("UPDATE docente SET activo = ? WHERE cedula = ?", activo, cedula);
    }

    public void cambiarPassword(String cedula, String nuevaPassword) {
        jdbc.update("UPDATE docente SET password = ? WHERE cedula = ?",
                nuevaPassword, cedula);
    }

}