const rolePermissions: Record<string, string[]> = {
  administrador: [
    'ver_dashboard','ver_presencia','registrar_presencia',
    'ver_registro_estudiantes','crear_estudiantes','editar_estudiantes',
    'ver_usuarios','crear_usuarios','editar_usuarios','eliminar_usuarios',
    'ver_areas','crear_areas','editar_areas','eliminar_areas',
    'ver_horarios','crear_horarios','editar_horarios','eliminar_horarios',
    'ver_cronograma','editar_cronograma',
    'ver_reportes','exportar_reportes'
  ],
  director: [
    'ver_dashboard','ver_presencia','registrar_presencia',
    'ver_registro_estudiantes','crear_estudiantes','editar_estudiantes',
    'ver_usuarios','crear_usuarios','editar_usuarios','eliminar_usuarios',
    'ver_areas','crear_areas','editar_areas','eliminar_areas',
    'ver_horarios','crear_horarios','editar_horarios','eliminar_horarios',
    'ver_cronograma','editar_cronograma',
    'ver_reportes','exportar_reportes'
  ],
  medico: [
    'ver_dashboard','ver_presencia',
    'ver_registro_estudiantes',
    'ver_horarios','ver_cronograma',
    'ver_reportes'
  ],
  docente: [
    'ver_dashboard','ver_presencia','registrar_presencia',
    'ver_registro_estudiantes','crear_estudiantes','editar_estudiantes',
    'ver_horarios','crear_horarios','editar_horarios',
    'ver_cronograma','editar_cronograma',
    'ver_reportes'
  ],
  estudiante: ['ver_dashboard'],
};

export function hasPermission(role: string, permission: string): boolean {
  return (rolePermissions[role] || []).includes(permission);
}

export function getRolePermissions(role: string): string[] {
  return rolePermissions[role] || [];
}
