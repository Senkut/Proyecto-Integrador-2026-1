# 🏥 Hospital Universitario San Rafael
### Sistema de Gestión Hospitalaria — v1.0

---

## 📋 Descripción General

Sistema web en **React + TypeScript** para gestión del personal estudiantil del Hospital Universitario San Rafael. Permite administrar estudiantes en práctica, médicos internos y residentes, controlar horarios, registrar asistencia y generar reportes.

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos
- [Node.js LTS](https://nodejs.org)
- Editor recomendado: [VS Code](https://code.visualstudio.com)

```bash
npm install --legacy-peer-deps
npm run dev
# Abrir: http://localhost:5173
```

---

## 🔑 Credenciales de Acceso

| Rol           | Cédula       | Contraseña     |
|---------------|--------------|----------------|
| Administrador | 1234567890   | admin2026      |
| Director      | 52123456     | director2026   |
| Médico        | 79234567     | medico2026     |
| Docente       | 52345678     | docente2026    |
| Estudiante    | 1001234567   | est2026        |

---

## 🗂️ Estructura del Proyecto

```
hospital-san-rafael/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    └── app/
        ├── App.tsx                         # Componente raíz y estado global
        ├── index.css                       # Estilos globales
        ├── utils/
        │   └── permissions.ts             # Permisos por rol
        └── components/
            ├── Login.tsx                  # Autenticación
            ├── UserManagement.tsx         # Gestión de usuarios
            ├── StudentRegistry.tsx        # Registro de estudiantes
            ├── ScheduleManagement.tsx     # Asignación de horarios
            ├── CronogramaView.tsx         # Cronograma semanal
            ├── PresencePanel.tsx          # Control de asistencia
            ├── StudentDashboard.tsx       # Portal del estudiante
            ├── AreaManagement.tsx         # Gestión de áreas
            ├── Reports.tsx                # Reportes y estadísticas
            ├── EditProfileForm.tsx        # Editar perfil
            ├── CompleteProfileForm.tsx    # Perfil completo
            ├── QuickStudentRegister.tsx   # Registro rápido
            ├── ProductivityReport.tsx     # Reporte productividad
            └── ui/                        # Componentes shadcn/ui
```

---

## 🧩 Componentes Principales

### `App.tsx`
Componente raíz con estado global de toda la app:
- Autenticación y roles de usuario
- Datos de estudiantes, usuarios, horarios y áreas
- Navegación entre vistas según permisos
- Sidebar con menú filtrado por rol
- Todos los handlers de operaciones CRUD

### `Login.tsx`
Pantalla de inicio de sesión:
- Selección de rol (Director, Administrador, Médico, Docente, Estudiante)
- Validación de credenciales por tipo de usuario
- Diseño con gradiente cyan/teal

### `StudentRegistry.tsx`
Gestión completa de estudiantes:
- Tabla con búsqueda en tiempo real
- Registro rápido y registro completo (con todos los campos)
- Cambio de estado (Activo, Inactivo, Retirado, Pendiente)
- Exportación de datos
- Edición de información personal, académica, familiar y de salud

### `PresencePanel.tsx`
Control de asistencia en tiempo real:
- Check-in y check-out por número de cédula
- Hora registrada automáticamente desde el sistema (no modificable)
- Historial completo de asistencia
- Cálculo automático de horas trabajadas
- Estado de cumplimiento: completo, llegada tarde, salida temprana, sin horario

### `ScheduleManagement.tsx`
Asignación de horarios:
- Asignar estudiantes a médicos por área y fecha
- Validación para evitar horarios duplicados
- Notificaciones de éxito y error

### `CronogramaView.tsx`
Visualización del cronograma:
- Vista semanal de todos los horarios asignados
- Filtros por área y por médico responsable

### `Reports.tsx`
Reportes y estadísticas:
- Horas trabajadas por estudiante
- Cumplimiento de horarios programados
- Estadísticas por área hospitalaria
- Reportes exportables

### `UserManagement.tsx`
Administración de usuarios del sistema:
- Crear, editar y eliminar médicos, docentes y directores
- Asignación personalizada de permisos
- Solo accesible para Administrador y Director

### `AreaManagement.tsx`
Gestión de áreas hospitalarias:
- Crear y editar áreas (Urgencias, Cirugía, Pediatría, etc.)
- Configurar capacidad máxima y sede

### `StudentDashboard.tsx`
Portal exclusivo para el estudiante:
- Ver sus horarios asignados
- Registrar entrada y salida
- Ver historial personal de asistencia
- Editar su información de perfil

---

## 🔐 Sistema de Permisos

Archivo: `src/app/utils/permissions.ts`

Cada rol tiene acceso solo a los módulos permitidos:

| Módulo                  | Admin | Director | Médico | Docente |
|-------------------------|-------|----------|--------|---------|
| Dashboard               | ✅    | ✅       | ✅     | ✅      |
| Usuarios                | ✅    | ✅       | ❌     | ❌      |
| Áreas                   | ✅    | ✅       | ❌     | ❌      |
| Horarios                | ✅    | ✅       | ✅     | ✅      |
| Cronograma              | ✅    | ✅       | ✅     | ✅      |
| Reportes                | ✅    | ✅       | ✅     | ✅      |
| Panel de Presencia      | ✅    | ✅       | ✅     | ✅      |
| Registro Estudiantes    | ✅    | ✅       | ✅     | ✅      |
| Asignar Estudiantes     | ✅    | ✅       | ❌     | ✅      |

---

## 🛠️ Tecnologías

| Tecnología       | Uso principal                    |
|------------------|----------------------------------|
| React 18         | Framework de interfaz            |
| TypeScript 5     | Tipado estático                  |
| Vite 4           | Servidor de desarrollo           |
| Tailwind CSS 3   | Estilos utilitarios              |
| shadcn/ui        | Componentes de interfaz          |
| Radix UI         | Componentes accesibles           |
| Lucide React     | Íconos                           |
| Sonner           | Notificaciones toast             |
| Recharts         | Gráficas y estadísticas          |
| date-fns         | Manejo de fechas                 |

---

## 📊 Modelos de Datos

### Student
```typescript
{
  id, programa, institucionEducativa, tipoVinculacion,
  nombresCompletos, apellidos, cedula, tipoDocumento,
  estadoCivil, fechaNacimiento, lugarNacimiento,
  direccionTunja, celular, email,
  nombreRepresentanteLegal, parentesco, celularRepresentanteLegal,
  induccionHospitalaria, arl, estado,
  checkInTime, checkOutTime,
  attendanceHistory: AttendanceRecord[]
}
```

### User
```typescript
{ id, name, cedula, role, password, permissions[] }
```

### Schedule
```typescript
{ id, studentId, doctorId, area, fecha, startTime, endTime }
```

### AttendanceRecord
```typescript
{
  fecha, checkInTime, checkOutTime,
  horasTrabajadas, area,
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario'
}
```

---

## ⚠️ Notas Importantes

- **Sin base de datos**: Los datos viven en memoria (useState). Al recargar la página se reinician.
- **Para producción** se recomienda integrar con Supabase, Firebase o una API REST.
- **Autenticación básica**: No usa JWT. Para producción usar autenticación segura.
- Las credenciales del Administrador están hardcodeadas en `App.tsx`.

---

*Sistema de Gestión — Hospital Universitario San Rafael © 2026*
