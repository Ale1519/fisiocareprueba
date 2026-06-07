import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Step3Resumen({ fisio, data, onNext, onBack }: any) {
  // Función simple para formatear la fecha (ej. "2026-06-07" -> "domingo, 7 de junio")
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    // Ajuste de zona horaria para evitar que se reste un día
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0A1E3D]">Resumen</h2>
        <p className="text-slate-500 text-sm mt-1">Revisa los detalles antes de pagar</p>
      </div>

      {/* Tabla de Resumen */}
      <div className="bg-[#F8FAFC] rounded-2xl p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">Profesional</span>
            <span className="text-sm font-bold text-[#0A1E3D]">{fisio?.nombres} {fisio?.apellidos}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">Modalidad</span>
            <span className="text-sm font-bold text-[#0A1E3D]">
              {data.modalidad === 'domicilio' ? 'A domicilio' : 'Videollamada'}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">Fecha</span>
            <span className="text-sm font-bold text-[#0A1E3D] capitalize">{formatearFecha(data.fecha)}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">Hora</span>
            <span className="text-sm font-bold text-[#0A1E3D]">{data.hora}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span className="text-sm text-slate-500 font-medium">Duración</span>
            <span className="text-sm font-bold text-[#0A1E3D]">50 minutos</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-[#0A1E3D]">Total</span>
            <span className="text-2xl font-extrabold text-[#0A1E3D]">S/ {fisio?.precio_sesion}</span>
          </div>
        </div>
      </div>

      {/* Alerta de Cancelación */}
      <div className="bg-[#E8F5EE] border border-[#B8E0CA] rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-[#1A5C3A] shrink-0" />
        <p className="text-xs text-[#1A6645] font-medium">
          Cancelación gratuita hasta 12 horas antes. Reembolso completo si tu fisio no se presenta.
        </p>
      </div>

      {/* Botones */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={onBack} className="font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button 
          onClick={() => onNext({})} 
          className="bg-[#2B4B6F] hover:bg-[#1E3A5F] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
