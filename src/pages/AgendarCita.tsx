
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User } from 'lucide-react';

import Step1Modalidad from '../components/agendar/Step1Modalidad';
import Step2Fecha from '../components/agendar/Step2Fecha';
import Step3Resumen from '../components/agendar/Step3Resumen';
import Step4Pago from '../components/agendar/Step4Pago';
import Step5Confirmacion from '../components/agendar/Step5Confirmacion';

export default function AgendarCita() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fisio, setFisio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados del flujo de reserva
  const [pasoActual, setPasoActual] = useState(1);
  const [reserva, setReserva] = useState({
    modalidad: '',
    fecha: '',
    hora: '',
    distrito_id: '',
    direccion_exacta: ''
  });

  useEffect(() => {
    const fetchFisio = async () => {
      const { data } = await supabase
        .from('fisioterapeutas')
        .select(`
          id, 
          nombres, 
          apellidos, 
          precio_sesion, 
          ofrece_domicilio, 
          ofrece_videollamada,
          fisioterapeuta_distritos ( distritos ( id, nombre ) )
        `)
        .eq('id', id)
        .single();
      
      if (data) setFisio(data);
      setLoading(false);
    };
    if (id) fetchFisio();
  }, [id]);

  const handleNext = (dataToMerge: any) => {
    setReserva(prev => ({ ...prev, ...dataToMerge }));
    setPasoActual(prev => prev + 1);
  };
  
  const handleBack = () => setPasoActual(prev => prev - 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A5C3A]"></div>
      </div>
    );
  }

  const steps = ['Modalidad', 'Fecha y hora', 'Resumen', 'Confirmación'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-body py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0A1E3D] transition font-medium text-sm mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver al perfil
        </button>

        {/* Barra de Progreso (Stepper) */}
        <div className="flex items-center justify-between relative mb-12 px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
          {steps.map((label, index) => {
            const stepNum = index + 1;
            const isActive = pasoActual === stepNum;
            const isPast = pasoActual > stepNum;
            return (
              <div key={label} className="flex flex-col items-center bg-[#F8FAFC] px-2 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isActive || isPast ? 'bg-[#1A5C3A] border-[#1A5C3A] text-white' : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {stepNum}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive || isPast ? 'text-[#0A1E3D]' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Contenedor Principal Blanca */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-200/60">
          
          {/* Cabecera del Fisio */}
          {fisio && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1E3D] text-lg">
                    {fisio.nombres} {fisio.apellidos}
                  </h3>
                  <p className="text-xs text-slate-500">Fisioterapeuta Verificado</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-[#0A1E3D]">S/ {fisio.precio_sesion}</p>
                <p className="text-[10px] text-slate-400 font-medium">/ sesión</p>
              </div>
            </div>
          )}

          {/* Renderizado Dinámico de Pasos */}
         {/* Renderizado Dinámico de Pasos */}
          {pasoActual === 1 && <Step1Modalidad fisio={fisio} data={reserva} onNext={handleNext} />}
          {pasoActual === 2 && <Step2Fecha fisioId={id!} data={reserva} onNext={handleNext} onBack={handleBack} />}
          {pasoActual === 3 && <Step3Resumen fisio={fisio} data={reserva} onNext={handleNext} onBack={handleBack} />}
          {pasoActual === 4 && <Step4Pago fisio={fisio} data={reserva} onNext={handleNext} onBack={handleBack} />}
          {pasoActual === 5 && <Step5Confirmacion fisio={fisio} data={reserva} />}

        </div>
      </div>
    </div>
  );
}
