import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const emptyForm = { numero: '', nombre: '', direccion: '', localidad: '', provincia: '', telefono: '', email: '', activa: true };

const GestionSucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const cargar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/sucursales`, { headers: { Authorization: `Bearer ${token}` } });
      setSucursales(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando sucursales');
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        const res = await axios.put(`${API_URL}/sucursales/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Sucursal actualizada');
        setSucursales(sucursales.map(s => s.id_sucursal === editingId ? res.data : s));
      } else {
        const res = await axios.post(`${API_URL}/sucursales`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Sucursal creada');
        setSucursales([res.data, ...sucursales]);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.error || 'Error guardando sucursal');
    } finally {
      setLoading(false);
    }
  };

  const editar = (s) => {
    setEditingId(s.id_sucursal);
    setForm({
      numero: s.numero || '',
      nombre: s.nombre || '',
      direccion: s.direccion || '',
      localidad: s.localidad || '',
      provincia: s.provincia || '',
      telefono: s.telefono || '',
      email: s.email || '',
      activa: s.activa
    });
  };

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar sucursal?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/sucursales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Sucursal desactivada');
      setSucursales(sucursales.map(s => s.id_sucursal === id ? { ...s, activa: false } : s));
    } catch (e) {
      toast.error('Error desactivando sucursal');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sucursales</h1>
        <p className="text-gray-600 text-sm">Gestión de sucursales del consultorio.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow">
        <input className="input" placeholder="Número" value={form.numero} onChange={e=>setForm({...form, numero:e.target.value})} required />
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
        <input className="input" placeholder="Dirección" value={form.direccion} onChange={e=>setForm({...form, direccion:e.target.value})} required />
        <input className="input" placeholder="Localidad" value={form.localidad} onChange={e=>setForm({...form, localidad:e.target.value})} required />
        <input className="input" placeholder="Provincia" value={form.provincia} onChange={e=>setForm({...form, provincia:e.target.value})} required />
        <input className="input" placeholder="Teléfono" value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})} />
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.activa} onChange={e=>setForm({...form, activa:e.target.checked})} />
          <span>Activa</span>
        </label>
        <button disabled={loading} className="btn-primary md:col-span-3">
          {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {sucursales.map(s => (
          <div key={s.id_sucursal} className="bg-white shadow rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">#{s.numero} {s.nombre}</h2>
              <span className={`text-xs px-2 py-1 rounded ${s.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.activa ? 'Activa' : 'Inactiva'}</span>
            </div>
            <p className="text-sm text-gray-600">{s.direccion}, {s.localidad}, {s.provincia}</p>
            {s.telefono && <p className="text-xs text-gray-500">Tel: {s.telefono}</p>}
            {s.email && <p className="text-xs text-gray-500">Email: {s.email}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={()=>editar(s)} className="text-blue-600 text-sm hover:underline">Editar</button>
              {s.activa && <button onClick={()=>desactivar(s.id_sucursal)} className="text-red-600 text-sm hover:underline">Desactivar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionSucursales;