const BASE_URL = 'http://localhost:8080';

async function safeFetch(url: string, options?: RequestInit) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
    } catch (err: any) {
        console.error(`API error [${url}]:`, err.message);
        throw err;
    }
}

export const api = {
    login: (cedula: string, password: string) =>
        safeFetch(`${BASE_URL}/api/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, password }),
        }),

    getEstudiantes: () => safeFetch(`${BASE_URL}/api/estudiantes`),

    createEstudiante: (data: any) =>
        safeFetch(`${BASE_URL}/api/estudiantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    updateEstudiante: (cedula: string, data: any) =>
        safeFetch(`${BASE_URL}/api/estudiantes/${cedula}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteEstudiante: (cedula: string) =>
        safeFetch(`${BASE_URL}/api/estudiantes/${cedula}`, { method: 'DELETE' }),

    getUsuarios: () => safeFetch(`${BASE_URL}/api/usuarios`),

    createUsuario: (data: any) =>
        safeFetch(`${BASE_URL}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteUsuario: (cedula: string) =>
        safeFetch(`${BASE_URL}/api/usuarios/${cedula}`, { method: 'DELETE' }),

    cambiarPassword: (cedula: string, passwordActual: string, password: string) =>
        safeFetch(`${BASE_URL}/api/usuarios/${cedula}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passwordActual, password }),
        }),

    // Restablecer contraseña sin verificar la actual (uso exclusivo de admin/director)
    restablecerPasswordUsuario: (cedula: string, password: string) =>
        safeFetch(`${BASE_URL}/api/usuarios/${cedula}/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        }),

    cambiarPasswordEstudiante: (cedula: string, passwordActual: string, password: string) =>
        safeFetch(`${BASE_URL}/api/usuarios/${cedula}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passwordActual, password }),
        }),

    cambiarEstadoUsuario: (cedula: string, activo: boolean) =>
        safeFetch(`${BASE_URL}/api/usuarios/${cedula}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo }),
        }),

    getAreas: () => safeFetch(`${BASE_URL}/api/areas`),

    createArea: (data: any) =>
        safeFetch(`${BASE_URL}/api/areas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteArea: (id: string | number) =>
        safeFetch(`${BASE_URL}/api/areas/${id}`, { method: 'DELETE' }),

    getHorarios: () => safeFetch(`${BASE_URL}/api/horarios`),

    getHorariosPorMes: (anio: number, mes: number) =>
        safeFetch(`${BASE_URL}/api/horarios/mes?anio=${anio}&mes=${mes}`),

    getServiciosHorarios: () => safeFetch(`${BASE_URL}/api/horarios/servicios`),

    createHorario: (data: any) =>
        safeFetch(`${BASE_URL}/api/horarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    importarHorarios: (filas: any[]) =>
        safeFetch(`${BASE_URL}/api/horarios/importar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filas),
        }),

    deleteHorario: (id: string | number) =>
        safeFetch(`${BASE_URL}/api/horarios/${id}`, { method: 'DELETE' }),

    updateHorario: (id: string | number, data: any) =>
        safeFetch(`${BASE_URL}/api/horarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    checkin: (cedula: string) =>
        safeFetch(`${BASE_URL}/api/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula }),
        }),

    checkout: (cedula: string) =>
        safeFetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula }),
        }),

    getPresencia: () => safeFetch(`${BASE_URL}/api/presencia`),

    getReporteResumen: () => safeFetch(`${BASE_URL}/api/reportes/resumen`),
    getHorasAcumuladas: () => safeFetch(`${BASE_URL}/api/reportes/horas`),
    getArlPorVencer: () => safeFetch(`${BASE_URL}/api/reportes/arl`),
    getRechazadosHoy: () => safeFetch(`${BASE_URL}/api/reportes/rechazados`),
    getHistorialEstudiante: (cedula: string) =>
        safeFetch(`${BASE_URL}/api/reportes/historial/${cedula}`),

    // Retorna todos los registros de acceso de HOY (entrada + salida si existe)
    // usado para rehidratar checkInTime/checkOutTime/attendanceHistory al recargar
    getRegistrosHoy: () => safeFetch(`${BASE_URL}/api/presencia/hoy`),

    getDashboard: () => safeFetch(`${BASE_URL}/api/dashboard`),
    getAlertas: () => safeFetch(`${BASE_URL}/api/alertas`),
};

// ── Mapeadores frontend ↔ backend ──────────────────────────────────────────

export function mapEstudianteFromBackend(e: any) {
    // El backend ahora manda nombresCompletos y apellidos explícitamente
    const nombresCompletos = e.nombresCompletos || '';
    // FIX: el backend manda el campo como 'apellidos' en el GET (ver listar()) pero también
    // puede venir como 'apellidosCompletos' en otros contextos — leer ambos
    const apellidosCompletos = e.apellidosCompletos || e.apellidos || '';
    const fullName: string = e.name || (nombresCompletos + ' ' + apellidosCompletos).trim() || '';
    return {
        id: String(e.id || e.id_estudiante || ''),
        cedula: e.cedula || '',
        name: fullName,
        nombresCompletos,
        apellidosCompletos,
        apellidos: apellidosCompletos,
        programa: e.programa || '',
        institucionEducativa: e.universidad || e.institucionEducativa || '',
        universidad: e.universidad || e.institucionEducativa || '',
        tipoVinculacion: (e.tipoVinculacion || 'Estudiante en práctica') as any,
        semestre: e.semestre != null ? String(e.semestre) : '',
        tipoDocumento: (e.tipoDocumento || 'C.C.') as any,
        estadoCivil: (e.estadoCivil || '') as any,
        fechaNacimiento: e.fechaNacimiento || '',
        lugarNacimiento: e.lugarNacimiento || '',
        genero: (e.genero || 'masculino') as any,
        foto: e.fotoUrl || e.foto_url || e.foto || undefined,
        celular: e.celular || '',
        email: e.email || '',
        direccionTunja: e.direccionTunja || '',
        lugarResidenciaPermanente: e.lugarResidenciaPermanente || '',
        nombreRepresentanteLegal: e.nombreRepresentante || e.nombreRepresentanteLegal || '',
        parentesco: e.parentesco || '',
        celularRepresentanteLegal: e.celularRepresentante || e.celularRepresentanteLegal || '',
        direccionRepresentanteLegal: e.direccionRepresentante || e.direccionRepresentanteLegal || '',
        ciudadRepresentanteLegal: e.ciudadRepresentante || e.ciudadRepresentanteLegal || '',
        induccionHospitalaria: Boolean(e.induccionHospitalaria),
        fechaInduccion: e.fechaInduccion ? String(e.fechaInduccion) : '',
        arl: Boolean(e.arl),
        fechaARLInicio: e.fechaARLInicio ? String(e.fechaARLInicio) : '',
        fechaARL: e.fechaARL ? String(e.fechaARL) : '',
        // Aliases para compatibilidad con CompleteProfileForm y EditProfileForm
        arlVigenciaInicio: e.arlVigenciaInicio ? String(e.arlVigenciaInicio) : (e.fechaARLInicio ? String(e.fechaARLInicio) : ''),
        arlVigenciaFin: e.arlVigenciaFin ? String(e.arlVigenciaFin) : (e.fechaARL ? String(e.fechaARL) : ''),
        estado: ((e.estado || 'ACTIVO').toUpperCase()) as any,
        tieneHijos: Boolean(e.tieneHijos),
        nombreHijos: e.nombreHijos || '',
        edadesHijos: e.edadesHijos || '',
        nombreEsposo: e.nombreEsposo || '',
        edadEsposo: e.edadEsposo ? String(e.edadEsposo) : '',
        nombrePadre: e.nombrePadre || '',
        edadPadre: e.edadPadre ? String(e.edadPadre) : '',
        nombreMadre: e.nombreMadre || '',
        edadMadre: e.edadMadre ? String(e.edadMadre) : '',
        enfermedadesGenerales: e.enfermedadesGenerales || '',
        enfermedadesMentales: e.enfermedadesMentales || '',
        medicamentos: e.medicamentos || '',
        alergias: e.alergias || '',
        peso: e.peso ? String(e.peso) : '',
        talla: e.talla ? String(e.talla) : '',
        imc: e.imc ? String(e.imc) : '',
        grupoSanguineo: e.grupoSanguineo || '',
        companerosTunja: e.companerosTunja || '',
        nucleoFamiliarTunja: e.nucleoFamiliarTunja || '',
        idiomaAdicional: e.idiomaAdicional || '',
        actividadesComplementarias: e.actividadesComplementarias || '',
        password: e.password || '',  // FIX: never default to cedula — empty means "no change"
        attendanceHistory: [],
        checkInTime: undefined as string | undefined,
        checkInDate: undefined as string | undefined,
        checkOutTime: undefined as string | undefined,
        checkOutDate: undefined as string | undefined,
    };
}

export function mapEstudianteToBackend(s: any) {
    return {
        nombresCompletos: s.nombresCompletos || '',
        apellidosCompletos: s.apellidosCompletos || s.apellidos || '',
        apellidos: s.apellidosCompletos || s.apellidos || '',
        cedula: s.cedula,
        tipoDocumento: s.tipoDocumento || 'C.C.',
        programa: s.programa || '',
        institucionEducativa: s.institucionEducativa || s.universidad || '',
        tipoVinculacion: s.tipoVinculacion || 'Estudiante en práctica',
        estadoCivil: s.estadoCivil || '',
        fechaNacimiento: s.fechaNacimiento || '',
        lugarNacimiento: s.lugarNacimiento || '',
        genero: s.genero || 'masculino',
        celular: s.celular || '',
        email: s.email || '',
        direccionTunja: s.direccionTunja || '',
        lugarResidenciaPermanente: s.lugarResidenciaPermanente || '',
        nombreRepresentante: s.nombreRepresentanteLegal || s.nombreRepresentante || '',
        parentesco: s.parentesco || '',
        celularRepresentante: s.celularRepresentanteLegal || s.celularRepresentante || '',
        direccionRepresentante: s.direccionRepresentanteLegal || s.direccionRepresentante || '',
        ciudadRepresentante: s.ciudadRepresentanteLegal || s.ciudadRepresentante || '',
        induccionHospitalaria: Boolean(s.induccionHospitalaria),
        fechaInduccion: s.fechaInduccion || '',
        fechaARLInicio: s.fechaARLInicio || s.arlVigenciaInicio || '',
        fechaARL: s.fechaARL || s.arlVigenciaFin || '',
        semestre: s.semestre ? String(s.semestre) : '',
        estado: (s.estado || 'ACTIVO').toUpperCase(),
        tieneHijos: Boolean(s.tieneHijos),
        nombreHijos: s.nombreHijos || '',
        edadesHijos: s.edadesHijos || '',
        nombreEsposo: s.nombreEsposo || '',
        edadEsposo: s.edadEsposo || '',
        nombrePadre: s.nombrePadre || '',
        edadPadre: s.edadPadre || '',
        nombreMadre: s.nombreMadre || '',
        edadMadre: s.edadMadre || '',
        enfermedadesGenerales: s.enfermedadesGenerales || '',
        enfermedadesMentales: s.enfermedadesMentales || '',
        medicamentos: s.medicamentos || '',
        alergias: s.alergias || '',
        peso: s.peso || '',
        talla: s.talla || '',
        imc: s.imc || '',
        grupoSanguineo: s.grupoSanguineo || '',
        companerosTunja: s.companerosTunja || '',
        nucleoFamiliarTunja: s.nucleoFamiliarTunja || '',
        idiomaAdicional: s.idiomaAdicional || '',
        actividadesComplementarias: s.actividadesComplementarias || '',
        // Foto de perfil: se envía como base64 o URL
        ...(s.foto ? { fotoUrl: s.foto } : {}),
        // Solo enviar password si existe; si no, el backend mantiene la actual (COALESCE)
        ...(s.password ? { password: s.password } : {}),
    };
}

export function mapUsuarioFromBackend(u: any) {
    return {
        id: String(u.id || ''),
        name: u.name || '',
        cedula: u.cedula || '',
        tipoDocumento: (u.tipoDocumento || 'C.C.') as any,
        role: (u.role || 'docente') as any,
        genero: (u.genero || 'masculino') as any,
        password: u.password || u.cedula || '',
        permissions: u.permissions || [],
        programa: u.programa || '',
    };
}

export function mapAreaFromBackend(a: any) {
    return {
        id: String(a.id || a.id_servicio || ''),
        nombre: a.nombre || '',
        capacidadMaxima: a.capacidadMaxima || a.capacidad_maxima_estudiantes || 5,
        ciudad: 'Tunja',
        sede: 'Principal',
    };
}

export function mapHorarioFromBackend(h: any) {
    return {
        id: String(h.id || h.id_asignacion || ''),
        studentId: String(h.studentId || h.cedula_estudiante || ''),
        doctorId: String(h.doctorId || ''),
        area: h.area || h.nombre_servicio || '',
        fecha: h.fecha || h.fecha_especifica || '',
        startTime: (h.startTime || h.hora_inicio || '').substring(0, 5),
        endTime: (h.endTime || h.hora_fin || '').substring(0, 5),
    };
}