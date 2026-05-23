import React from 'react';
import { useState } from 'react';
import { UserPlus, X, Phone, User, BookOpen, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface QuickStudentFormData {
  nombresCompletos: string;
  apellidos: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  programa: string;
  institucionEducativa: string;
  genero: 'masculino' | 'femenino';
  email: string;
  celular: string;
  password: string;
}

interface QuickStudentRegisterProps {
  onAddStudent: (student: any) => void;
}

export function QuickStudentRegister({ onAddStudent }: QuickStudentRegisterProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QuickStudentFormData>({
    nombresCompletos: '',
    apellidos: '',
    cedula: '',
    tipoDocumento: 'C.C.',
    programa: '',
    institucionEducativa: '',
    genero: 'masculino',
    email: '',
    celular: '',
    password: 'est2026'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear estudiante con datos mínimos y estado PENDIENTE
    const quickStudent = {
      // Información mínima proporcionada
      programa: formData.programa,
      institucionEducativa: formData.institucionEducativa,
      tipoVinculacion: 'Estudiante en práctica',
      nombresCompletos: formData.nombresCompletos,
      apellidosCompletos: formData.apellidos,  // FIX: usar apellidosCompletos (clave que espera mapEstudianteToBackend y el PATCH)
      cedula: formData.cedula,
      tipoDocumento: formData.tipoDocumento,
      email: formData.email,
      celular: formData.celular,
      genero: formData.genero,

      // Campos requeridos con valores predeterminados (estudiante los completará)
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '',
      lugarNacimiento: '',
      direccionTunja: '',
      lugarResidenciaPermanente: '',
      // FIX: usar los nombres que mapEstudianteToBackend mapea al backend
      nombreRepresentanteLegal: '',
      celularRepresentanteLegal: '',
      direccionRepresentanteLegal: '',
      ciudadRepresentanteLegal: '',
      parentesco: '',
      tieneHijos: false,

      // Campos compatibilidad
      name: `${formData.nombresCompletos} ${formData.apellidos}`,
      universidad: formData.institucionEducativa,
      induccionHospitalaria: false,
      arl: false,

      // Contraseña de acceso
      password: formData.password,

      // Estado PENDIENTE - el estudiante debe completar datos
      estado: 'PENDIENTE' as const
    };

    onAddStudent(quickStudent);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      nombresCompletos: '',
      apellidos: '',
      cedula: '',
      tipoDocumento: 'C.C.',
      programa: '',
      institucionEducativa: '',
      genero: 'masculino',
      email: '',
      celular: '',
      password: 'est2026'
    });
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-md font-semibold"
      >
        <UserPlus className="w-5 h-5" />
        Registro Rápido
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-teal-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold"> Registro Rápido de Estudiante</h3>
                  <p className="text-sm text-teal-100 mt-1">
                    El estudiante completará el resto de información al ingresar al portal
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información Personal Básica */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4"> Información Personal Básica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres Completos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombresCompletos}
                      onChange={(e) => setFormData({ ...formData, nombresCompletos: e.target.value })}
                      placeholder="Ej: Juan Carlos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      placeholder="Ej: Pérez García"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="C.C.">Cédula de Ciudadanía</option>
                      <option value="C.E.">Cédula de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="NIT">NIT</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Identificación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Sin puntos ni comas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'masculino' | 'femenino' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4"> Información de Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="3201234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4"> Información Académica</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programa Académico <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.programa}
                      onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="">Seleccione un programa</option>
                      <option value="Medicina">Medicina</option>
                      <option value="Enfermería">Enfermería</option>
                      <option value="Fisioterapia">Fisioterapia</option>
                      <option value="Nutrición y Dietética">Nutrición y Dietética</option>
                      <option value="Terapia Respiratoria">Terapia Respiratoria</option>
                      <option value="Bacteriología">Bacteriología</option>
                      <option value="Instrumentación Quirúrgica">Instrumentación Quirúrgica</option>
                      <option value="Psicología">Psicología</option>
                      <option value="Trabajo Social">Trabajo Social</option>
                      <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                      <option value="Fonoaudiología">Fonoaudiología</option>
                      <option value="Odontología">Odontología</option>
                      <option value="Optometría">Optometría</option>
                      <option value="Radiología e Imágenes Diagnósticas">Radiología e Imágenes Diagnósticas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institución Educativa <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.institucionEducativa}
                      onChange={(e) => setFormData({ ...formData, institucionEducativa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="">Seleccione una universidad</option>
                      <option value="Universidad Santo Tomás">Universidad Santo Tomás</option>
                      <option value="Universidad Pedagógica y Tecnológica de Colombia">Universidad Pedagógica y Tecnológica de Colombia</option>
                      <option value="Universidad de Boyacá">Universidad de Boyacá</option>
                      <option value="Fundación Universitaria Juan de Castellanos">Fundación Universitaria Juan de Castellanos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4"> Credenciales de Acceso</h4>
                <div className="relative rounded-xl overflow-hidden">
                  {/* Gradient background that works in both light and dark mode */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-teal-500/10 to-cyan-400/10 dark:from-blue-500/20 dark:via-teal-400/20 dark:to-cyan-300/15 pointer-events-none rounded-xl" />
                  <div className="relative border border-teal-200 dark:border-teal-700/60 rounded-xl p-4 backdrop-blur-sm">
                    {/* Lock icon header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <label className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                        Contraseña Temporal <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña para el estudiante"
                      className="w-full px-3 py-2 border border-teal-300 dark:border-teal-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono bg-white/70 dark:bg-blue-950/40 text-gray-800 dark:text-teal-100 placeholder-gray-400 dark:placeholder-teal-600"
                    />
                    <p className="text-xs text-teal-700 dark:text-teal-400 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Comunica esta contraseña al estudiante. La usará para completar su registro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div>
                    <h5 className="font-bold text-teal-900 mb-1">¿Cómo funciona el registro rápido?</h5>
                    <ul className="text-sm text-teal-800 space-y-1">
                      <li>• El estudiante será creado con estado <strong>PENDIENTE</strong></li>
                      <li>• Recibirá su cédula como usuario y la contraseña que definas</li>
                      <li>• Al ingresar por primera vez, deberá completar toda su información personal</li>
                      <li>• Una vez completada, su estado cambiará a <strong>ACTIVO</strong> automáticamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-700 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-md font-semibold"
                >
                  ✓ Crear Estudiante (Estado: PENDIENTE)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  ✕ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}