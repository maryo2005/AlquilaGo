import type { FC, FormEvent } from 'react';
import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { uploadMultipleImages } from '../services/storageService';
import type { PropertyType, ContractType, ProximityInfo } from '../types/property';
import { trujilloDistricts, trujilloTargets } from '../data/seedData';
import {
  Building,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  MessageSquare,
  PlusCircle,
  Check,
  CheckCircle,
  MapPin,
  TrendingUp,
  X,
  Upload,
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const OwnerView: FC = () => {
  const { properties, addProperty, deleteProperty } = useApp();
  const { user } = useAuth();

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // States for new property form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [type, setType] = useState<PropertyType>('room');
  const [contractType, setContractType] = useState<ContractType>('monthly');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState(trujilloDistricts[0]);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [area, setArea] = useState<number | ''>('');

  // Proximity setup
  const [selectedTarget, setSelectedTarget] = useState(trujilloTargets[0].name);
  const [targetMin, setTargetMin] = useState(5);
  const [proximities, setProximities] = useState<ProximityInfo[]>([]);

  // Services setup
  const [selectedServices, setSelectedServices] = useState<string[]>(['Wifi', 'Agua Caliente']);

  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');

  // Image upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter listings belonging to this owner
  const myProperties = user
    ? properties.filter((p) => p.ownerId === user.id)
    : [];

  // Calculate Dashboard Statistics
  const activeCount = myProperties.length;
  const totalViews = myProperties.reduce((sum, p) => sum + p.views, 0);
  const estimatedRevenue = myProperties.reduce((sum, p) => sum + p.price, 0);
  const messagesReceived = Math.round(totalViews * 0.18);

  const availableServices = [
    'Wifi', 'Amoblado', 'Agua Caliente', 'Lavandería', 'Cochera', 'Seguridad 24/7', 'Ascensor'
  ];

  // If not authenticated, show auth prompt
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-gray-100 bg-white p-12 shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <Building className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Panel del Arrendador</h2>
          <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
            Para publicar propiedades y gestionar tus anuncios, necesitas iniciar sesión o crear una cuenta.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:shadow-blue-300 hover:-translate-y-0.5"
          >
            Iniciar Sesión / Registrarse
          </button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const handleAddProximity = () => {
    const targetObj = trujilloTargets.find(t => t.name === selectedTarget);
    if (!targetObj) return;
    if (proximities.some(p => p.name === selectedTarget)) return;

    setProximities(prev => [
      ...prev,
      { type: targetObj.type, name: selectedTarget, distanceMin: targetMin }
    ]);
  };

  const handleRemoveProximity = (name: string) => {
    setProximities(prev => prev.filter(p => p.name !== name));
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const newFiles = [...selectedFiles, ...files].slice(0, 4);
    setSelectedFiles(newFiles);

    // Generate preview URLs
    const urls = newFiles.map(f => URL.createObjectURL(f));
    // Cleanup old preview URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(urls);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteProperty(id);
    } catch {
      setFormError('No se pudo eliminar la propiedad.');
      setTimeout(() => setFormError(null), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !address || !area) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (!contactName || !phone) {
      setFormError('Por favor ingrese su nombre y teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // 1. Upload images to Supabase Storage
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadMultipleImages(selectedFiles, user.id);
      } else {
        // Fallback: usar una imagen por defecto
        imageUrls = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'];
      }

      // 2. Random coordinates around Trujillo
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;
      const lat = -8.115 + latOffset;
      const lng = -79.032 + lngOffset;

      // 3. Create property in Supabase
      await addProperty({
        title,
        description,
        price: Number(price),
        type,
        contractType,
        address,
        district,
        proximity: proximities.length > 0 ? proximities : [
          { type: 'university', name: 'UNT (Univ. Nacional de Trujillo)', distanceMin: 8 }
        ],
        lat,
        lng,
        images: imageUrls,
        bedrooms,
        bathrooms,
        area: Number(area),
        services: selectedServices,
        phone,
        contactName,
        isFeatured: false,
      });

      setSuccessMsg(true);

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setAddress('');
      setArea('');
      setProximities([]);
      setSelectedFiles([]);
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);

      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error publishing property:', err);
      setFormError('Error al publicar la propiedad. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left text-gray-800">

      {/* Header Banner */}
      <div className="mb-8 flex flex-col justify-between items-start gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Panel del Arrendador</h1>
          <p className="text-sm text-gray-500">Publica y administra tus habitaciones o departamentos de alquiler en Trujillo.</p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="max-w-[200px] truncate">{user.email}</span>
        </div>
      </div>

      {/* Dashboard Statistics Row */}
      <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Metric 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Anuncios Activos</span>
            <p className="mt-1 text-2xl font-black text-gray-800">{activeCount}</p>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              <span>Visible en la app</span>
            </span>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Building className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Vistas Totales</span>
            <p className="mt-1 text-2xl font-black text-gray-800">{totalViews}</p>
            <span className="text-[9px] text-gray-500 font-bold block mt-1">Acumulado mensual</span>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Ingresos Potenciales</span>
            <p className="mt-1 text-2xl font-black text-gray-800">S/. {estimatedRevenue}</p>
            <span className="text-[9px] text-gray-500 font-bold block mt-1">Por cobrar al mes</span>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Contactos WhatsApp</span>
            <p className="mt-1 text-2xl font-black text-gray-800">{messagesReceived}</p>
            <span className="text-[9px] text-indigo-600 font-bold block mt-1">Estimado en clics</span>
          </div>
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

      </section>

      {/* Grid for Form and Active listings */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* PUBLISH PROPERTY FORM COLUMN */}
        <div id="publicar" className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center space-x-2 border-b border-gray-50 pb-3">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-extrabold text-gray-800">Publicar Nuevo Inmueble</h2>
            </div>

            {/* Success message */}
            {successMsg && (
              <div className="mb-6 rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-emerald-800 flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-600 stroke-[3px]" />
                <span className="text-xs font-bold">¡Anuncio publicado correctamente! Ya está visible en el buscador e integrado en el mapa de Trujillo.</span>
              </div>
            )}

            {/* Error message */}
            {formError && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-xs font-bold">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Form Row 1: Title */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Título del Anuncio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Habitación amoblada de estreno con baño propio frente a la UPAO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border border-gray-200 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Form Row 2: Type, Contract Type, Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Tipo de Inmueble *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="room">Habitación</option>
                    <option value="apartment">Departamento</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Tipo de Contrato *</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="monthly">Alquiler por Meses</option>
                    <option value="yearly">Contrato Anual</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Precio Mensual (S/.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Monto en soles"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* Form Row 3: Description */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Descripción Detallada *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalla las características del inmueble, qué incluye el precio, si cuenta con ingreso independiente, etc. (Ej. Ideal para estudiantes UNT, luz y agua incluidos, cama cómoda...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border border-gray-200 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Form Row 4: Address, District */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Dirección Exacta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jr. San Martín 885, Las Quintanas"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Urbanización / Zona *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    {trujilloDistricts.map((d, idx) => (
                      <option key={idx} value={d}>Urb. {d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Row 5: Specs (Beds, Baths, Area) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Dormitorios</label>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Baños</label>
                  <input
                    type="number"
                    min={1}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Área construida (m²) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 15"
                    value={area}
                    onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className="rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Setup Proximity Segment */}
              <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                <span className="text-xs font-bold text-gray-700 block">Cercanías Universitarias u Hospitalarias</span>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white p-2.5 text-xs outline-none"
                  >
                    {trujilloTargets.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      value={targetMin}
                      onChange={(e) => setTargetMin(Number(e.target.value))}
                      className="w-16 rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-center"
                    />
                    <span className="text-xs text-gray-500">min</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProximity}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2.5 text-xs font-bold text-white transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                {/* Display added proximities */}
                {proximities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200/50">
                    {proximities.map((p, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 rounded-lg bg-white border border-gray-200 px-2 py-1 text-[10px] font-medium"
                      >
                        <span>{p.name.split(' (')[0]}: {p.distanceMin} min</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProximity(p.name)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Checkboxes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Servicios Incluidos</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availableServices.map((service, idx) => {
                    const isChecked = selectedServices.includes(service);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`flex items-center space-x-2 rounded-xl border p-2.5 text-xs transition text-left ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                          isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>
                        <span>{service}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real Image Upload */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Fotos del Inmueble (hasta 4)</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imagePreviewUrls.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-200">
                        <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviewUrls.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-[9px] mt-0.5">Agregar</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-xs mt-2 font-medium">Haz clic para subir fotos</span>
                    <span className="text-[10px] mt-0.5">JPG, PNG, WebP — máx. 4 imágenes</span>
                  </button>
                )}

                {selectedFiles.length === 0 && (
                  <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                    <ImageIcon className="h-3 w-3" />
                    <span>Si no subes imágenes, se usará una imagen por defecto.</span>
                  </div>
                )}
              </div>

              {/* Owner Info & Submit */}
              <div className="mt-8 border-t border-gray-100 pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nombre del Arrendador *</span>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="rounded-xl border border-gray-200 p-2 text-xs bg-gray-50 font-semibold"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">WhatsApp de contacto *</span>
                  <input
                    type="text"
                    required
                    placeholder="+51 999 999 999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border border-gray-200 p-2 text-xs bg-gray-50 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-100 hover:shadow-blue-200 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publicando anuncio...</span>
                  </>
                ) : (
                  <span>Publicar Anuncio en Trujillo</span>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* MY PUBLICATIONS LIST COLUMN */}
        <div id="anuncios" className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
              <h2 className="text-base font-extrabold text-gray-800">Mis Anuncios Activos</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{activeCount}</span>
            </div>

            {myProperties.length > 0 ? (
              <div className="space-y-4">
                {myProperties.map((prop) => (
                  <div key={prop.id} className="group relative flex flex-col rounded-xl border border-gray-100 p-3 hover:border-blue-100 transition shadow-inner bg-slate-50/50">

                    {/* Header: Title and Type */}
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <span className="rounded-md bg-white border border-gray-150 px-2 py-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                          {prop.type === 'room' ? 'Habitación' : 'Departamento'}
                        </span>
                        <h4 className="mt-1.5 text-xs font-bold text-gray-800 group-hover:text-blue-700 transition">
                          {prop.title}
                        </h4>
                        <div className="mt-1 flex items-center space-x-0.5 text-[10px] text-gray-400">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{prop.address}</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(prop.id)}
                        disabled={deletingId === prop.id}
                        title="Eliminar Publicación"
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
                      >
                        {deletingId === prop.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Stats footer */}
                    <div className="mt-3.5 border-t border-gray-100/60 pt-2 flex items-center justify-between text-[10px] text-gray-500 font-bold">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        <span>{prop.views} vistas</span>
                      </div>
                      <span className="text-xs text-blue-700 font-black">S/. {prop.price}/mes</span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Building className="mx-auto h-10 w-10 text-gray-300" />
                <p className="text-xs">Aún no tienes propiedades publicadas.</p>
                <p className="text-[10px]">Usa el formulario de la izquierda para crear tu primer anuncio.</p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
