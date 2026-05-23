import React from 'react';
import { useState } from 'react';
import { Save, Upload, X, Phone, User, Users, Camera, BookOpen, Hospital } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  programa: string;
  institucionEducativa?: string;
  tipoVinculacion?: string;
  foto?: string;
  nombresCompletos: string;
  apellidos?: string;
  cedula: string;
  tipoDocumento?: string;
  estadoCivil?: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;
  direccionRepresentanteLegal: string;
  ciudadRepresentanteLegal: string;
  nombreRepresentanteLegal: string;
  parentesco: string;
  celularRepresentanteLegal: string;
  idiomaAdicional?: string;
  actividadesComplementarias?: string;
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;
  name: string;
  universidad: string;
  semestre?: string;
  genero: 'masculino' | 'femenino';
  induccionHospitalaria: boolean;
  fechaInduccion?: string;
  arl: boolean;
  fechaARLInicio?: string;
  fechaARL?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  password?: string;
  [key: string]: any;
}

interface EditProfileFormProps {
  student: Student;
  onUpdateStudent: (id: string, data: Partial<Student>) => void;
  onClose: () => void;
}

export function EditProfileForm({ student, onUpdateStudent, onClose }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    programa: student.programa,
    institucionEducativa: student.institucionEducativa || '',
    tipoVinculacion: student.tipoVinculacion,
    nombresCompletos: student.nombresCompletos,
    apellidos: student.apellidos || '',
    cedula: student.cedula,
    tipoDocumento: student.tipoDocumento || 'C.C.',
    email: student.email,
    celular: student.celular,
    genero: student.genero,
    foto: student.foto || '',
    estadoCivil: student.estadoCivil || 'Soltero(a)' as 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)',
    fechaNacimiento: student.fechaNacimiento || '',
    lugarNacimiento: student.lugarNacimiento || '',
    direccionTunja: student.direccionTunja || '',
    lugarResidenciaPermanente: student.lugarResidenciaPermanente || '',
    direccionRepresentanteLegal: student.direccionRepresentanteLegal || '',
    ciudadRepresentanteLegal: student.ciudadRepresentanteLegal || '',
    nombreRepresentanteLegal: student.nombreRepresentanteLegal || '',
    parentesco: student.parentesco || '',
    celularRepresentanteLegal: student.celularRepresentanteLegal || '',
    idiomaAdicional: student.idiomaAdicional || '',
    actividadesComplementarias: student.actividadesComplementarias || '',
    nombrePadre: student.nombrePadre || '',
    edadPadre: student.edadPadre || '',
    nombreMadre: student.nombreMadre || '',
    edadMadre: student.edadMadre || '',
    tieneHijos: student.tieneHijos || false,
    nombreHijos: student.nombreHijos || '',
    edadesHijos: student.edadesHijos || '',
    tieneEsposo: !!(student.nombreEsposo),
    nombreEsposo: student.nombreEsposo || '',
    edadEsposo: student.edadEsposo || '',
    enfermedadesGenerales: student.enfermedadesGenerales || '',
    enfermedadesMentales: student.enfermedadesMentales || '',
    medicamentos: student.medicamentos || '',
    alergias: student.alergias || '',
    peso: student.peso || '',
    talla: student.talla || '',
    imc: student.imc || '',
    grupoSanguineo: student.grupoSanguineo || '',
    companerosTunja: student.companerosTunja || '',
    nucleoFamiliarTunja: student.nucleoFamiliarTunja || '',
    semestre: student.semestre || '',
    induccionHospitalaria: student.induccionHospitalaria || false,
    fechaInduccion: student.fechaInduccion || '',
    arl: student.arl || false,
    fechaARLInicio: student.fechaARLInicio || '',
    fechaARL: student.fechaARL || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { tieneEsposo, ...rest } = formData;

    const updatedData = {
      ...rest,
      name: `${formData.nombresCompletos} ${formData.apellidos}`,
      universidad: formData.institucionEducativa,
      nombreEsposo: formData.tieneEsposo ? formData.nombreEsposo : '',
      edadEsposo: formData.tieneEsposo ? formData.edadEsposo : '',
    };

    onUpdateStudent(student.id, updatedData);
    toast.success('Perfil actualizado exitosamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold"> Editar Mi Perfil</h3>
            <p className="text-sm text-blue-100 mt-1">
              Actualiza tu información personal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Información Personal */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex justify-center mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-400"></span>
                    )}
                  </div>
                  <label className="cursor-pointer text-sm text-blue-700 hover:text-blue-700 font-medium flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Cambiar Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, foto: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombres Completos</label>
                <input
                  type="text"
                  required
                  value={formData.nombresCompletos}
                  onChange={(e) => setFormData({ ...formData, nombresCompletos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                <select
                  required
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="C.C.">Cédula de Ciudadanía</option>
                  <option value="C.E.">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Identificación</label>
                <input
                  type="text"
                  disabled
                  value={formData.cedula}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">El número de identificación no se puede modificar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select
                  required
                  value={formData.estadoCivil}
                  onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Unión Libre">Unión Libre</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de Nacimiento</label>
                <input
                  type="text"
                  required
                  value={formData.lugarNacimiento}
                  onChange={(e) => setFormData({ ...formData, lugarNacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Información de Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección en Tunja</label>
                <input
                  type="text"
                  required
                  value={formData.direccionTunja}
                  onChange={(e) => setFormData({ ...formData, direccionTunja: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residencia Permanente</label>
                <input
                  type="text"
                  required
                  value={formData.lugarResidenciaPermanente}
                  onChange={(e) => setFormData({ ...formData, lugarResidenciaPermanente: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Información Académica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programa</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <input
                  type="text"
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Representante Legal */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Representante Legal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombreRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, nombreRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                <input
                  type="text"
                  required
                  value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  type="tel"
                  required
                  value={formData.celularRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, celularRepresentanteLegal: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad del Representante</label>
                <input
                  type="text"
                  value={formData.ciudadRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, ciudadRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Aspectos Familiares */}
          <div className="border-l-4 border-pink-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">‍‍‍ Aspectos Familiares</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Padre</label>
                <input
                  type="text"
                  value={formData.nombrePadre}
                  onChange={(e) => setFormData({ ...formData, nombrePadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad del Padre</label>
                <input
                  type="text"
                  value={formData.edadPadre}
                  onChange={(e) => setFormData({ ...formData, edadPadre: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Madre</label>
                <input
                  type="text"
                  value={formData.nombreMadre}
                  onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad de la Madre</label>
                <input
                  type="text"
                  value={formData.edadMadre}
                  onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tieneHijos}
                    onChange={(e) => setFormData({ ...formData, tieneHijos: e.target.checked })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Tiene Hijos?</span>
                </label>
              </div>

              {formData.tieneHijos && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de los Hijos</label>
                    <input
                      type="text"
                      value={formData.nombreHijos}
                      onChange={(e) => setFormData({ ...formData, nombreHijos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edades de los Hijos</label>
                    <input
                      type="text"
                      value={formData.edadesHijos}
                      onChange={(e) => setFormData({ ...formData, edadesHijos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tieneEsposo}
                    onChange={(e) => setFormData({ ...formData, tieneEsposo: e.target.checked })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Tiene Esposo(a) / Cónyuge?</span>
                </label>
              </div>

              {formData.tieneEsposo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Esposo(a)</label>
                    <input
                      type="text"
                      value={formData.nombreEsposo}
                      onChange={(e) => setFormData({ ...formData, nombreEsposo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad del Esposo(a)</label>
                    <input
                      type="text"
                      value={formData.edadEsposo}
                      onChange={(e) => setFormData({ ...formData, edadEsposo: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Aspectos de Salud */}
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Aspectos de Salud</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades Generales</label>
                <textarea
                  value={formData.enfermedadesGenerales}
                  onChange={(e) => setFormData({ ...formData, enfermedadesGenerales: e.target.value })}
                  rows={2}
                  placeholder="Ninguna"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades Mentales</label>
                <textarea
                  value={formData.enfermedadesMentales}
                  onChange={(e) => setFormData({ ...formData, enfermedadesMentales: e.target.value })}
                  rows={2}
                  placeholder="Ninguna"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos</label>
                <textarea
                  value={formData.medicamentos}
                  onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                  rows={2}
                  placeholder="Ninguno"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                <textarea
                  value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => {
                    const peso = e.target.value;
                    const talla = parseFloat(formData.talla as string);
                    const pesoNum = parseFloat(peso);
                    const imcCalc = (talla > 0 && pesoNum > 0) ? (pesoNum / ((talla / 100) ** 2)).toFixed(1) : formData.imc;
                    setFormData({ ...formData, peso, imc: imcCalc as string });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talla (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.talla}
                  onChange={(e) => {
                    const talla = e.target.value;
                    const peso = parseFloat(formData.peso as string);
                    const tallaNum = parseFloat(talla);
                    const imcCalc = (tallaNum > 0 && peso > 0) ? (peso / ((tallaNum / 100) ** 2)).toFixed(1) : formData.imc;
                    setFormData({ ...formData, talla, imc: imcCalc as string });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IMC (calculado automáticamente)</label>
                <input
                  type="text"
                  readOnly
                  value={formData.imc ? `${formData.imc} kg/m²` : ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                  placeholder="Se calcula con peso y talla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
                <select
                  value={formData.grupoSanguineo}
                  onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Otros Datos */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4"> Otros Datos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idioma Adicional</label>
                <input
                  type="text"
                  value={formData.idiomaAdicional}
                  onChange={(e) => setFormData({ ...formData, idiomaAdicional: e.target.value })}
                  placeholder="Inglés, Francés, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actividades Complementarias</label>
                <input
                  type="text"
                  value={formData.actividadesComplementarias}
                  onChange={(e) => setFormData({ ...formData, actividadesComplementarias: e.target.value })}
                  placeholder="Deportes, música, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Convivencia en Tunja</label>
                <input
                  type="text"
                  value={formData.companerosTunja}
                  onChange={(e) => setFormData({ ...formData, companerosTunja: e.target.value })}
                  placeholder="Nombre de compañeros con quienes convive"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Núcleo Familiar en Tunja</label>
                <input
                  type="text"
                  value={formData.nucleoFamiliarTunja}
                  onChange={(e) => setFormData({ ...formData, nucleoFamiliarTunja: e.target.value })}
                  placeholder="Familiares con quienes convive en Tunja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}