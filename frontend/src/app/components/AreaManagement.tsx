import React from 'react';
import { useState } from 'react';
import { Building2, Edit2, Trash2, Plus, MapPin } from 'lucide-react';

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface AreaManagementProps {
  areas: Area[];
  onAddArea: (area: Omit<Area, 'id'>) => void;
  onUpdateArea: (id: string, area: Partial<Area>) => void;
  onDeleteArea: (id: string) => void;
}

export function AreaManagement({ areas, onAddArea, onUpdateArea, onDeleteArea }: AreaManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidadMaxima: 5,
    ciudad: 'Tunja',
    sede: 'Principal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateArea(editingId, formData);
      setEditingId(null);
    } else {
      onAddArea(formData);
    }
    setFormData({ nombre: '', capacidadMaxima: 5, ciudad: 'Tunja', sede: 'Principal' });
    setIsAdding(false);
  };

  const handleEdit = (area: Area) => {
    setFormData({
      nombre: area.nombre,
      capacidadMaxima: area.capacidadMaxima,
      ciudad: area.ciudad,
      sede: area.sede
    });
    setEditingId(area.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', capacidadMaxima: 5, ciudad: 'Tunja', sede: 'Principal' });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Áreas</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Área
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Área' : 'Crear Nueva Área'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Urgencias, Cirugía"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={formData.capacidadMaxima}
                  onChange={(e) => setFormData({ ...formData, capacidadMaxima: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder="Ej: Tunja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
                <input
                  type="text"
                  required
                  value={formData.sede}
                  onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                  placeholder="Ej: Principal, Norte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
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
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map(area => (
          <div key={area.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h3 className="font-semibold text-lg text-gray-800">{area.nombre}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(area)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteArea(area.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Capacidad Máxima:</span>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold">
                  {area.capacidadMaxima} estudiantes
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{area.ciudad} - Sede {area.sede}</span>
              </div>
            </div>
          </div>
        ))}

        {areas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay áreas registradas. Crea una nueva área para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}
