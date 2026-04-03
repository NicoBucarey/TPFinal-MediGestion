import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const emptyForm = { numero: '', nombre: '', direccion: '', localidad: '', provincia: '', telefono: '', email: '', activa: true, imagen_url: '' };

const GestionSucursalesPage = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = (API_URL || '').replace(/\/api$/, '');

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

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imagen_url') formData.append(k, v);
      });
      if (imagenFile) formData.append('imagen', imagenFile);

      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
      if (editingId) {
        const res = await axios.put(`${API_URL}/sucursales/${editingId}`, formData, { headers });
        toast.success('Sucursal actualizada');
        setSucursales(sucursales.map(s => s.id_sucursal === editingId ? res.data : s));
      } else {
        const res = await axios.post(`${API_URL}/sucursales`, formData, { headers });
        toast.success('Sucursal creada');
        setSucursales([res.data, ...sucursales]);
      }
      setForm(emptyForm);
      setEditingId(null);
      setImagenFile(null);
      setPreview('');
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
      activa: s.activa,
      imagen_url: s.imagen_url || ''
    });
    setPreview(s.imagen_url ? baseUrl + s.imagen_url : '');
    setImagenFile(null);
  };

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar sucursal?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/sucursales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Sucursal desactivada');
      setSucursales(sucursales.map(s => s.id_sucursal === id ? { ...s, activa: false } : s));
    } catch (e) {
      void e;
      toast.error('Error desactivando sucursal');
    }
  };

  const onSelectImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagenFile(null);
      setPreview('');
      return;
    }
    if (!/image\/.+/.test(file.type)) {
      toast.error('Archivo no es una imagen válida');
      return;
    }
    setImagenFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sucursales</h1>
        <p className="text-gray-600 text-sm">Gestión de sucursales del consultorio.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow">
        <input className="input" placeholder="Número" value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} required />
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <input className="input" placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
        <input className="input" placeholder="Localidad" value={form.localidad} onChange={e => setForm({ ...form, localidad: e.target.value })} required />
        <input className="input" placeholder="Provincia" value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })} required />
        <input className="input" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.activa} onChange={e => setForm({ ...form, activa: e.target.checked })} />
          <span>Activa</span>
        </label>
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-sm font-medium">Imagen (opcional)</label>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow hover:bg-teal-700 transition">
              <input type="file" accept="image/*" onChange={onSelectImagen} className="hidden" />
              Seleccionar archivo
            </label>
            {(preview || form.imagen_url) && (
              <div className="relative">
                <img src={preview || (baseUrl + form.imagen_url)} alt="Imagen sucursal" className="h-32 w-32 object-cover rounded border" />
                {preview && (
                  <button type="button" onClick={() => { setPreview(''); setImagenFile(null); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs shadow">×</button>
                )}
              </div>
            )}
            {imagenFile && <span className="text-xs text-gray-500 max-w-[200px] truncate">{imagenFile.name}</span>}
          </div>
          <p className="text-xs text-gray-500">Formatos: JPG, PNG, WEBP. Máx 2MB.</p>
        </div>
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
            {s.imagen_url && (
              <img src={baseUrl + s.imagen_url} alt={s.nombre} className="mt-2 h-32 w-32 object-cover rounded border" />
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => editar(s)} className="text-blue-600 text-sm hover:underline">Editar</button>
              {s.activa && <button onClick={() => desactivar(s.id_sucursal)} className="text-red-600 text-sm hover:underline">Desactivar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionSucursalesPage;
