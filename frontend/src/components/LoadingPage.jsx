/**
 * LoadingPage
 * Fallback que se muestra mientras React carga un chunk lazy.
 * Es intencionalmente minimalista: solo un spinner centrado.
 */
const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#00796B] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500">Cargando...</span>
    </div>
  </div>
);

export default LoadingPage;
