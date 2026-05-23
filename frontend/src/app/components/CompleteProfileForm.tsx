import React from 'react';
import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import logoHospital from '../assets/logo-hospital.png';

interface Student {
  id: string;
  programa: string;
  institucionEducativa?: string;
  tipoVinculacion?: string;
  foto?: string;
  nombresCompletos: string;
  apellidosCompletos?: string;
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
  arlVigenciaInicio?: string;
  arlVigenciaFin?: string;
  fechaARLInicio?: string;
  fechaARL?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  checkInTime?: string;
  checkOutTime?: string;
  password?: string;
}

interface CompleteProfileFormProps {
  student: Student;
  onUpdateStudent: (id: string, data: Partial<Student>) => void;
}

export function CompleteProfileForm({ student, onUpdateStudent }: CompleteProfileFormProps) {
  const [formData, setFormData] = useState({
    // Datos ya existentes
    programa: student.programa || '',
    institucionEducativa: student.institucionEducativa || '',
    tipoVinculacion: (student.tipoVinculacion || 'Estudiante en práctica') as 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización',
    nombresCompletos: student.nombresCompletos,
    apellidosCompletos: student.apellidosCompletos || '',
    cedula: student.cedula,
    tipoDocumento: student.tipoDocumento || 'C.C.',
    email: student.email,
    celular: student.celular,
    genero: student.genero || 'masculino' as 'masculino' | 'femenino',

    // Datos a completar
    foto: student.foto || '',
    estadoCivil: (student.estadoCivil || 'Soltero(a)') as 'Soltero(a)' | 'Casado(a)' | 'Union Libre' | 'Divorciado(a)' | 'Viudo(a)',
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
    // Familia
    nombrePadre: student.nombrePadre || '',
    edadPadre: student.edadPadre || '',
    nombreMadre: student.nombreMadre || '',
    edadMadre: student.edadMadre || '',
    tieneHijos: student.tieneHijos || false,
    nombreHijos: student.nombreHijos || '',
    edadesHijos: student.edadesHijos || '',
    // Esposo: checkbox independiente, se activa si ya habia nombre guardado
    tieneEsposo: !!(student.nombreEsposo),
    nombreEsposo: student.nombreEsposo || '',
    edadEsposo: student.edadEsposo || '',
    // Salud
    enfermedadesGenerales: student.enfermedadesGenerales || '',
    enfermedadesMentales: student.enfermedadesMentales || '',
    medicamentos: student.medicamentos || '',
    alergias: student.alergias || '',
    peso: student.peso || '',
    talla: student.talla || '',
    imc: student.imc || '',
    grupoSanguineo: student.grupoSanguineo || '',
    // Convivencia
    companerosTunja: student.companerosTunja || '',
    nucleoFamiliarTunja: student.nucleoFamiliarTunja || '',
    // Academico
    semestre: student.semestre || '',
    // ARL e Induccion
    induccionHospitalaria: student.induccionHospitalaria || false,
    fechaInduccion: student.fechaInduccion || '',
    arl: student.arl || false,
    arlVigenciaInicio: student.arlVigenciaInicio || '',
    arlVigenciaFin: student.arlVigenciaFin || '',
  });

  // Calcula IMC automaticamente al cambiar peso o talla
  const handlePesoTalla = (field: 'peso' | 'talla', value: string) => {
    const updated = { ...formData, [field]: value };
    const peso = parseFloat(field === 'peso' ? value : formData.peso);
    const talla = parseFloat(field === 'talla' ? value : formData.talla);
    if (peso > 0 && talla > 0) {
      const tallaMt = talla > 10 ? talla / 100 : talla; // acepta cm o metros
      updated.imc = (peso / (tallaMt * tallaMt)).toFixed(1);
    } else {
      updated.imc = '';
    }
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // tieneEsposo es solo para la UI, no se manda a la BD
    const { tieneEsposo, ...rest } = formData;

    const esCasado = formData.estadoCivil === 'Casado(a)' || formData.estadoCivil === 'Union Libre';

    const updatedData: Partial<Student> = {
      ...rest,
      estado: 'ACTIVO' as const,
      name: `${formData.nombresCompletos} ${formData.apellidosCompletos}`,
      universidad: formData.institucionEducativa,
      apellidosCompletos: formData.apellidosCompletos,
      // Solo guardar esposo si estado civil aplica
      nombreEsposo: esCasado ? formData.nombreEsposo : '',
      edadEsposo: esCasado ? formData.edadEsposo : '',
      // Si no tiene hijos marcado, limpiar campos
      nombreHijos: formData.tieneHijos ? formData.nombreHijos : '',
      edadesHijos: formData.tieneHijos ? formData.edadesHijos : '',
      // Aliases para que mapEstudianteToBackend persista las fechas ARL en la BD
      fechaARLInicio: formData.arlVigenciaInicio || '',
      fechaARL: formData.arlVigenciaFin || '',
      // Solo enviar password si el estudiante lo escribio
    };

    onUpdateStudent(student.id, updatedData);
    toast.success('Perfil completado exitosamente! Tu estado ahora es ACTIVO.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950 dark:to-teal-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-4 border-teal-200 dark:border-teal-800 p-8 mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logoHospital} alt="Logo Hospital" className="w-24 h-24 object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-2">
              Bienvenido/a {student.nombresCompletos}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Para activar tu cuenta, por favor completa la siguiente informacion
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 px-6 py-3 rounded-full">
              <span className="text-2xl">⏳</span>
              <span className="font-bold text-yellow-800">Estado Actual: PENDIENTE POR COMPLETAR</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-teal-100 dark:border-teal-900 p-8 space-y-8">

          {/* ── Informacion Personal ── */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">👤 Informacion Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 flex justify-center mb-2">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-400">📷</span>
                    )}
                  </div>
                  <label className="cursor-pointer text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Subir Foto
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({ ...formData, foto: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Programa Académico <span className="text-red-500">*</span>
                </label>
                <select required value={formData.programa}
                  onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institución Educativa en Convenio <span className="text-red-500">*</span>
                </label>
                <select required value={formData.institucionEducativa}
                  onChange={(e) => setFormData({ ...formData, institucionEducativa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                  <option value="">Seleccione una universidad</option>
                  <option value="Universidad Santo Tomás">Universidad Santo Tomás</option>
                  <option value="Universidad Pedagógica y Tecnológica de Colombia">Universidad Pedagógica y Tecnológica de Colombia</option>
                  <option value="Universidad de Boyacá">Universidad de Boyacá</option>
                  <option value="Fundación Universitaria Juan de Castellanos">Fundación Universitaria Juan de Castellanos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombres Completos <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.nombresCompletos}
                  onChange={(e) => setFormData({ ...formData, nombresCompletos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                  placeholder="Nombres completos" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.apellidosCompletos}
                  onChange={(e) => setFormData({ ...formData, apellidosCompletos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="Apellidos completos" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select required value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                  <option value="C.C.">Cédula de Ciudadanía</option>
                  <option value="C.E.">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Identificación
                </label>
                <input type="text" readOnly value={formData.cedula}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Género <span className="text-red-500">*</span>
                </label>
                <select required value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'masculino' | 'femenino' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado Civil <span className="text-red-500">*</span>
                </label>
                <select required value={formData.estadoCivil}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value as any;
                    setFormData({ ...formData, estadoCivil: nuevoEstado });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Union Libre">Unión Libre</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input type="date" required value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.lugarNacimiento}
                  onChange={(e) => setFormData({ ...formData, lugarNacimiento: e.target.value })}
                  placeholder="Ciudad, Departamento"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semestre</label>
                <input type="text" value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  placeholder="Ej: 7, 8, 9"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Celular <span className="text-red-500">*</span>
                </label>
                <input type="tel" required value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="3201234567"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* ── Residencia ── */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🏠 Informacion de Residencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direccion de Residencia en Tunja <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.direccionTunja}
                  onChange={(e) => setFormData({ ...formData, direccionTunja: e.target.value })}
                  placeholder="Calle/Carrera/Diagonal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar de Residencia Permanente <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.lugarResidenciaPermanente}
                  onChange={(e) => setFormData({ ...formData, lugarResidenciaPermanente: e.target.value })}
                  placeholder="Ciudad de origen"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* ── Representante Legal ── */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">📋 Representante Legal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Representante Legal <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.nombreRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, nombreRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parentesco <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  placeholder="Ej: Padre, Madre, Hermano"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direccion del Representante <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.direccionRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, direccionRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad del Representante <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.ciudadRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, ciudadRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Celular del Representante <span className="text-red-500">*</span>
                </label>
                <input type="tel" required value={formData.celularRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, celularRepresentanteLegal: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* ── Otros Datos ── */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🌐 Otros Datos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Idioma Adicional</label>
                <input type="text" value={formData.idiomaAdicional}
                  onChange={(e) => setFormData({ ...formData, idiomaAdicional: e.target.value })}
                  placeholder="Ingles, Frances, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actividades Complementarias</label>
                <input type="text" value={formData.actividadesComplementarias}
                  onChange={(e) => setFormData({ ...formData, actividadesComplementarias: e.target.value })}
                  placeholder="Deportes, musica, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* ── Aspectos Familiares ── */}
          <div className="border-l-4 border-pink-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">👨‍👩‍👧‍👦 Aspectos Familiares (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Padre</label>
                <input type="text" value={formData.nombrePadre}
                  onChange={(e) => setFormData({ ...formData, nombrePadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad del Padre</label>
                <input type="text" value={formData.edadPadre}
                  onChange={(e) => setFormData({ ...formData, edadPadre: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Madre</label>
                <input type="text" value={formData.nombreMadre}
                  onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad de la Madre</label>
                <input type="text" value={formData.edadMadre}
                  onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              {/* Checkbox Hijos */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-pink-300 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.tieneHijos ? 'bg-pink-500 border-pink-500' : 'border-pink-400 dark:border-pink-600 bg-white dark:bg-slate-800'}`}>
                    {formData.tieneHijos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" checked={formData.tieneHijos}
                    onChange={(e) => setFormData({ ...formData, tieneHijos: e.target.checked })}
                    className="sr-only" />
                  <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">¿Tiene Hijos?</span>
                </label>
              </div>

              {formData.tieneHijos && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de los Hijos</label>
                    <input type="text" value={formData.nombreHijos}
                      onChange={(e) => setFormData({ ...formData, nombreHijos: e.target.value })}
                      placeholder="Ej: Juan, Maria"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edades de los Hijos</label>
                    <input type="text" value={formData.edadesHijos}
                      onChange={(e) => setFormData({ ...formData, edadesHijos: e.target.value })}
                      placeholder="Ej: 3, 7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                  </div>
                </>
              )}

              {/* Esposo — casilla independiente */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-pink-300 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.tieneEsposo ? 'bg-pink-500 border-pink-500' : 'border-pink-400 dark:border-pink-600 bg-white dark:bg-slate-800'}`}>
                    {formData.tieneEsposo && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" checked={formData.tieneEsposo}
                    onChange={(e) => setFormData({ ...formData, tieneEsposo: e.target.checked })}
                    className="sr-only" />
                  <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">¿Tiene Esposo(a) / Cónyuge?</span>
                </label>
              </div>

              {formData.tieneEsposo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Esposo(a)</label>
                    <input type="text" value={formData.nombreEsposo}
                      onChange={(e) => setFormData({ ...formData, nombreEsposo: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad del Esposo(a)</label>
                    <input type="text" value={formData.edadEsposo}
                      onChange={(e) => setFormData({ ...formData, edadEsposo: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Ej: 28"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Salud ── */}
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🩺 Aspectos de Salud (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enfermedades Generales</label>
                <textarea value={formData.enfermedadesGenerales}
                  onChange={(e) => setFormData({ ...formData, enfermedadesGenerales: e.target.value })}
                  rows={2} placeholder="Describa cualquier enfermedad o condicion general..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enfermedades Mentales</label>
                <textarea value={formData.enfermedadesMentales}
                  onChange={(e) => setFormData({ ...formData, enfermedadesMentales: e.target.value })}
                  rows={2} placeholder="Describa cualquier condicion de salud mental..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medicamentos</label>
                <textarea value={formData.medicamentos}
                  onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                  rows={2} placeholder="Medicamentos que toma actualmente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alergias</label>
                <textarea value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  rows={2} placeholder="Alergias conocidas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grupo Sanguineo</label>
                <select value={formData.grupoSanguineo}
                  onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                <input type="number" step="0.1" min="0" value={formData.peso}
                  onChange={(e) => handlePesoTalla('peso', e.target.value)}
                  placeholder="Ej: 65.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Talla (cm)</label>
                <input type="number" step="0.1" min="0" value={formData.talla}
                  onChange={(e) => handlePesoTalla('talla', e.target.value)}
                  placeholder="Ej: 170"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IMC
                  <span className="ml-1 text-xs text-gray-400">(se calcula automaticamente)</span>
                </label>
                <input type="text" readOnly value={formData.imc ? `${formData.imc} kg/m²` : ''}
                  placeholder="Se calcula al ingresar peso y talla"
                  className={`w-full px-3 py-2 border rounded-lg cursor-not-allowed font-semibold ${formData.imc
                    ? 'border-green-300 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`} />
              </div>
            </div>
          </div>

          {/* ── Convivencia en Tunja ── */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🏘️ Convivencia en Tunja</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Con quien vives en Tunja</label>
                <input type="text" value={formData.companerosTunja}
                  onChange={(e) => setFormData({ ...formData, companerosTunja: e.target.value })}
                  placeholder="Solo, companeros, familia, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nucleo Familiar en Tunja</label>
                <input type="text" value={formData.nucleoFamiliarTunja}
                  onChange={(e) => setFormData({ ...formData, nucleoFamiliarTunja: e.target.value })}
                  placeholder="Ej: Esposa e hijos, padres, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </div>

          {/* ── ARL e Induccion ── */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🛡️ ARL e Induccion Hospitalaria</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha Inicio Vigencia ARL <span className="text-red-500">*</span>
                </label>
                <input type="date" required value={formData.arlVigenciaInicio}
                  onChange={(e) => setFormData({ ...formData, arlVigenciaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha Fin Vigencia ARL <span className="text-red-500">*</span>
                </label>
                <input type="date" required value={formData.arlVigenciaFin}
                  onChange={(e) => setFormData({ ...formData, arlVigenciaFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.induccionHospitalaria ? 'bg-teal-500 border-teal-500' : 'border-green-400 dark:border-green-600 bg-white dark:bg-slate-800'}`}>
                    {formData.induccionHospitalaria && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" checked={formData.induccionHospitalaria}
                    onChange={(e) => setFormData({ ...formData, induccionHospitalaria: e.target.checked })}
                    className="sr-only" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Induccion Hospitalaria Completada?</span>
                </label>
              </div>

              {formData.induccionHospitalaria && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Induccion</label>
                  <input type="date" value={formData.fechaInduccion}
                    onChange={(e) => setFormData({ ...formData, fechaInduccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                </div>
              )}
            </div>
          </div>

          {/* ── Boton Guardar ── */}
          <div className="flex justify-center pt-6">
            <button type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all shadow-lg font-bold text-lg flex items-center gap-3">
              <Save className="w-6 h-6" />
              Completar Perfil y Activar Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}