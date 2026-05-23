import React from 'react';
import { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, Lock, Eye, EyeOff, KeyRound, GraduationCap, Hospital, User, UserCircle2, BarChart3 } from 'lucide-react';
import { getRolePermissions } from '../utils/permissions';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  role: 'administrador' | 'medico' | 'docente' | 'director' | 'estudiante';
  permissions: string[];
  assignedTo?: string;
  genero: 'masculino' | 'femenino';
  password: string;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

interface UserManagementPropsExtended extends UserManagementProps {
  currentUserRole: string;
  currentUserDocumento: string;
}

export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser, currentUserRole, currentUserDocumento }: UserManagementPropsExtended) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Password change state
  const [showPwSection, setShowPwSection] = useState(false);
  const [showFormPw, setShowFormPw] = useState(false);
  const [pwActual, setPwActual] = useState('');
  const [pwNueva, setPwNueva] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPwActual, setShowPwActual] = useState(false);
  const [showPwNueva, setShowPwNueva] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  // Reset password modal (admin/director)
  const [resetModal, setResetModal] = useState<{ userId: string; userName: string } | null>(null);
  const [resetNewPw, setResetNewPw] = useState('');

  const loggedUser = users.find(u => u.cedula === currentUserDocumento);
  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    tipoDocumento: 'C.C.' as 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro',
    password: '',
    role: 'medico' as 'medico' | 'docente' | 'director',
    permissions: [] as string[],
    assignedTo: '',
    genero: 'masculino' as 'masculino' | 'femenino'
  });

  const allPermissions = [
    'ver_dashboard',
    'ver_presencia',
    'registrar_presencia',
    'ver_registro_estudiantes',
    'crear_estudiantes',
    'editar_estudiantes',
    'ver_usuarios',
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_areas',
    'crear_areas',
    'editar_areas',
    'eliminar_areas',
    'ver_horarios',
    'crear_horarios',
    'editar_horarios',
    'eliminar_horarios',
    'ver_cronograma',
    'editar_cronograma',
    'ver_reportes',
    'exportar_reportes'
  ];

  const canEditPermissions = currentUserRole === 'director' || currentUserRole === 'administrador';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Al editar, solo actualizar contraseña si se ingresó una nueva
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password;
      }
      onUpdateUser(editingId, updateData);
      setEditingId(null);
    } else {
      onAddUser(formData);
    }
    setFormData({ name: '', cedula: '', tipoDocumento: 'C.C.', password: '', role: 'medico', permissions: [], assignedTo: '', genero: 'masculino' });
    setIsAdding(false);
  };

  const handleEdit = (user: User) => {
    // Si el usuario no tiene permisos guardados, cargar los del rol como base
    const perms = (user.permissions && user.permissions.length > 0)
      ? user.permissions
      : getRolePermissions(user.role);
    setFormData({
      name: user.name,
      cedula: user.cedula,
      tipoDocumento: user.tipoDocumento,
      password: '',
      role: user.role as any,
      permissions: perms,
      assignedTo: user.assignedTo || '',
      genero: user.genero
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const defaultPasswordForRole: Record<string, string> = {
    medico: 'medico2026',
    docente: 'docente2026',
    director: 'director2026',
    administrador: 'admin2026',
  };

  const handleRoleChange = (role: 'medico' | 'docente' | 'director') => {
    setFormData({
      ...formData,
      role,
      permissions: getRolePermissions(role),
      // Solo poner contraseña predeterminada si es nuevo usuario
      password: editingId ? formData.password : (defaultPasswordForRole[role] || ''),
    });
  };

  const togglePermission = (permission: string) => {
    if (!canEditPermissions) return;

    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permission)
        ? formData.permissions.filter(p => p !== permission)
        : [...formData.permissions, permission]
    });
  };

  const handleChangePassword = () => {
    if (!loggedUser) return;
    const currentPw = loggedUser.password;
    if (pwActual !== currentPw) { toast.error('La contraseña actual es incorrecta'); return; }
    if (pwNueva.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (pwNueva !== pwConfirm) { toast.error('Las contraseñas nuevas no coinciden'); return; }
    onUpdateUser(loggedUser.id, { password: pwNueva });
    toast.success(' Contraseña actualizada correctamente');
    setShowPwSection(false);
    setPwActual(''); setPwNueva(''); setPwConfirm('');
  };

  const maestros = users.filter(u => u.role === 'administrador' || u.role === 'director' || u.role === 'docente');
  const canResetPasswords = currentUserRole === 'administrador' || currentUserRole === 'director';

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <button
          onClick={() => {
            if (!isAdding) {
              // Al abrir formulario nuevo, pre-cargar permisos del rol médico por defecto
              setFormData({ name: '', cedula: '', tipoDocumento: 'C.C.', password: 'medico2026', role: 'medico', permissions: getRolePermissions('medico'), assignedTo: '', genero: 'masculino' });
              setEditingId(null);
              setShowFormPw(false);
            }
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Editar Usuario' : 'Crear Usuario'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Dr. Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="C.C.">Cédula de Ciudadanía</option>
                  <option value="C.E.">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Identificación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/[^0-9]/g, '') })}
                  disabled={!!editingId}
                  placeholder="Número de identificación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {editingId && <p className="text-xs text-gray-500 mt-1">El número de identificación no se puede modificar</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingId ? <span className="text-gray-400 text-xs font-normal">(dejar vacío para no cambiar)</span> : <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showFormPw ? 'text' : 'password'}
                    required={!editingId}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? 'Dejar vacío para mantener actual' : 'Contraseña de acceso'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button type="button" onClick={() => setShowFormPw(!showFormPw)}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                    {showFormPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!editingId && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs text-gray-500">Predeterminadas:</span>
                    {Object.entries(defaultPasswordForRole).filter(([r]) => r !== 'administrador').map(([rol, pw]) => (
                      <button key={rol} type="button"
                        onClick={() => setFormData({ ...formData, password: pw })}
                        className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full border border-gray-200 transition-colors">
                        {rol}: {pw}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'masculino' | 'femenino' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.role === 'administrador' && (
                  <option value="administrador">Administrador</option>
                )}
                <option value="medico">Médico</option>
                <option value="docente">Docente</option>
                <option value="director">Director</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ El rol de Administrador es único y no se puede crear desde aquí
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Permisos del Usuario
                  {!canEditPermissions && <span className="text-amber-600 ml-2 font-normal text-xs">(Solo Director/Administrador pueden modificar)</span>}
                </label>
                {canEditPermissions && (
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setFormData({ ...formData, permissions: allPermissions })}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                      ✓ Todos
                    </button>
                    <button type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-colors">
                      ✗ Ninguno
                    </button>
                    <button type="button"
                      onClick={() => setFormData({ ...formData, permissions: getRolePermissions(formData.role) })}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                      ↺ Defaults del rol
                    </button>
                  </div>
                )}
              </div>

              {/* Permiso agrupados por categoría */}
              {[
                { label: ' Dashboard y Presencia', perms: ['ver_dashboard', 'ver_presencia', 'registrar_presencia'] },
                { label: '‍ Estudiantes', perms: ['ver_registro_estudiantes', 'crear_estudiantes', 'editar_estudiantes'] },
                { label: ' Usuarios', perms: ['ver_usuarios', 'crear_usuarios', 'editar_usuarios', 'eliminar_usuarios'] },
                { label: ' Áreas', perms: ['ver_areas', 'crear_areas', 'editar_areas', 'eliminar_areas'] },
                { label: ' Horarios', perms: ['ver_horarios', 'crear_horarios', 'editar_horarios', 'eliminar_horarios'] },
                { label: ' Cronograma y Reportes', perms: ['ver_cronograma', 'editar_cronograma', 'ver_reportes', 'exportar_reportes'] },
              ].map(group => (
                <div key={group.label} className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.perms.map(permission => {
                      const isChecked = formData.permissions.includes(permission);
                      return (
                        <label key={permission}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                            !canEditPermissions ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'
                          } ${isChecked
                            ? 'bg-blue-50 border-teal-400 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(permission)}
                            disabled={!canEditPermissions}
                            className="w-4 h-4 accent-cyan-500 cursor-pointer flex-shrink-0"
                          />
                          <span className={`text-xs font-medium capitalize leading-tight ${isChecked ? 'text-blue-800' : 'text-gray-600'}`}>
                            {permission.replace(/_/g, ' ')}
                          </span>
                          {isChecked && <span className="ml-auto text-blue-600 text-xs flex-shrink-0">✓</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-blue-100 border-2 border-teal-400 rounded"></span>
                = permiso activo &nbsp;|&nbsp;
                <span className="inline-block w-3 h-3 bg-white border-2 border-gray-200 rounded"></span>
                = sin permiso
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ name: '', cedula: '', tipoDocumento: 'C.C.', password: '', role: 'medico', permissions: [], assignedTo: '', genero: 'masculino' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {users.map(user => {
          const assignedMaestro = user.assignedTo ? users.find(u => u.id === user.assignedTo) : null;
          return (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 ${
                    user.genero === 'masculino' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-rose-400 to-pink-500'
                  }`}>
                    {user.genero === 'masculino' ? <User className="w-5 h-5" /> : <UserCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'director' ? 'bg-teal-100 text-teal-800' :
                        user.role === 'administrador' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'maestro' ? 'bg-teal-100 text-teal-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Cédula: <span className="font-medium">{user.cedula}</span>
                    </p>
                    {assignedMaestro && (
                      <p className="text-sm text-gray-600 mb-2">
                        Asignado a: <span className="font-medium">{assignedMaestro.name}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Shield className="w-4 h-4 text-gray-500" />
                      {user.permissions.map(perm => (
                        <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar usuario"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {canResetPasswords && user.cedula !== currentUserDocumento && (
                    <button
                      onClick={() => { setResetModal({ userId: user.id, userName: user.name }); setResetNewPw(''); }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="Restablecer contraseña"
                    >
                      <KeyRound className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL RESTABLECER CONTRASEÑA ── */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Restablecer Contraseña</h3>
                <p className="text-sm text-gray-500">{resetModal.userName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg"></span>
                <p className="text-xs text-amber-700">
                  Estás a punto de cambiar la contraseña de <strong>{resetModal.userName}</strong>. El usuario deberá usar la nueva contraseña para acceder al sistema.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="text"
                  value={resetNewPw}
                  onChange={e => setResetNewPw(e.target.value)}
                  placeholder="Escribe la nueva contraseña"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setResetNewPw(users.find(u => u.id === resetModal.userId)?.cedula || '')}
                  className="mt-1 text-xs text-blue-700 hover:underline"
                >
                  Usar número de cédula como contraseña
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!resetNewPw || resetNewPw.length < 4) { toast.error('La contraseña debe tener al menos 4 caracteres'); return; }
                    onUpdateUser(resetModal.userId, { password: resetNewPw });
                    toast.success(` Contraseña de ${resetModal.userName.split(' ')[0]} restablecida correctamente`);
                    setResetModal(null);
                    setResetNewPw('');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Restablecer Contraseña
                </button>
                <button
                  onClick={() => { setResetModal(null); setResetNewPw(''); }}
                  className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
