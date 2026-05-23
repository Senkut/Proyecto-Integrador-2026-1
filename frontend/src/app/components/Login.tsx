import React from 'react';
import { useState } from 'react';
import { Lock, User, Eye, EyeOff, Stethoscope, Briefcase, GraduationCap, BookOpen, ShieldCheck, AlertTriangle, KeyRound, Sun, Moon } from 'lucide-react';
import logoHospital from '../assets/logo-hospital.png';

interface LoginProps {
  onLogin: (documento: string, password: string, role: string) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export function Login({ onLogin, darkMode, onToggleDark }: LoginProps) {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'director', label: 'Director', icon: <ShieldCheck className="w-4 h-4" />, color: 'from-blue-700 to-teal-600' },
    { value: 'administrador', label: 'Administrador', icon: <Briefcase className="w-4 h-4" />, color: 'from-blue-500 to-blue-600' },
    { value: 'medico', label: 'Médico', icon: <Stethoscope className="w-4 h-4" />, color: 'from-teal-500 to-teal-600' },
    { value: 'docente', label: 'Docente', icon: <BookOpen className="w-4 h-4" />, color: 'from-blue-600 to-teal-500' },
    { value: 'estudiante', label: 'Estudiante', icon: <GraduationCap className="w-4 h-4" />, color: 'from-blue-600 to-teal-600' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Por favor selecciona un tipo de usuario'); return; }
    if (!documento) { setError('Por favor ingresa tu número de documento'); return; }
    if (!password) { setError('Por favor ingresa tu contraseña'); return; }
    onLogin(documento, password, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-600 dark:from-gray-950 dark:via-blue-950 dark:to-teal-950">

      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Dark/Light toggle — top right */}
      {onToggleDark && (
        <button
          onClick={onToggleDark}
          className="absolute top-5 right-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 text-white hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200 text-sm font-medium shadow-lg"
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? (
            <><Sun className="w-4 h-4 text-yellow-300" /><span className="text-white/90 hidden sm:inline">Modo claro</span></>
          ) : (
            <><Moon className="w-4 h-4 text-white" /><span className="text-white/90 hidden sm:inline">Modo oscuro</span></>
          )}
        </button>
      )}

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] p-8 border border-white/60 dark:border-white/10 transition-colors duration-300">

          {/* Logo Area */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-36 h-36 mb-3 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
              <img src={logoHospital} alt="Logo Hospital Universitario San Rafael de Tunja" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent mb-1 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hospital Universitario<br />San Rafael de Tunja
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Sistema de Gestión Hospitalaria</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" />

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 ${
                      role === r.value
                        ? `bg-gradient-to-r ${r.color} text-white border-transparent shadow-lg scale-[1.03]`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-sm'
                    }`}
                  >
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Número de Identificación
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-blue-500 dark:text-teal-400" />
                </div>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ingresa tu cédula"
                  maxLength={12}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-400 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all outline-none font-medium bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-blue-500 dark:text-teal-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-400 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all outline-none font-medium bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 dark:hover:text-teal-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-teal-600 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base tracking-wide"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Iniciar Sesión
            </button>

            {/* Forgot password */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 text-center">
              <p className="text-amber-800 dark:text-amber-400 text-xs flex items-center justify-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <strong>¿Olvidaste tu contraseña?</strong>
              </p>
              <p className="text-amber-700 dark:text-amber-500 text-xs mt-1">
                Comunícate con el <strong>Administrador</strong> o el <strong>Director</strong> del sistema.
              </p>
            </div>
          </form>
        </div>

        {/* Version Info */}
        <div className="text-center mt-5">
          <p className="text-white/70 text-xs font-medium tracking-wide">
            Sistema v1.3 · Hospital Universitario San Rafael de Tunja © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
