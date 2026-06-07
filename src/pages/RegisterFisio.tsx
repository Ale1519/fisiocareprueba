import { useState } from 'react';
import { Activity } from 'lucide-react';
import Step1Datos from '../components/registro-fisio/Step1Datos';
import Step2Profesional from '../components/registro-fisio/Step2Profesional';
import Step3Atencion from '../components/registro-fisio/Step3Atencion';
import Step4Documentos from '../components/registro-fisio/Step4Documentos';

export default function RegistroFisio() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  // Pasos para la barra de progreso
  const steps = ['Datos', 'Profesional', 'Atención', 'Documentos'];

  return (
    <div className="min-h-[calc(100dvh-5rem)] sm:min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        {/* Parte superior con Logo y Título */}
        <div className="text-center mb-8 sm:mb-10">
          <Activity className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#0A1E3D] mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1E3D]">Únete como profesional</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Completa tu perfil para empezar a recibir pacientes</p>
        </div>

        {/* Barra de Pasos Responsive */}
        <div className="flex items-start sm:items-center justify-between mb-8 sm:mb-10 px-2 sm:px-12 relative">
          {/* Línea conectora de fondo dinámica */}
          <div className="absolute top-4 sm:top-5 left-[10%] right-[10%] sm:left-16 sm:right-16 h-[2px] bg-slate-200 -z-0" />
          
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step > stepNumber;
            
            return (
              <div key={label} className="relative z-10 flex flex-col items-center flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-[#1A5C3A] border-[#1A5C3A] text-white shadow-sm' : 
                    isActive ? 'bg-[#1A5C3A] border-[#1A5C3A] text-white shadow-sm' : 'bg-white border-slate-300 text-slate-400'}`}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span className={`text-[10px] sm:text-sm mt-1.5 sm:mt-2 font-semibold text-center transition-colors duration-300 ${isActive || isCompleted ? 'text-[#0A1E3D]' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] shadow-sm border border-slate-100">
          {step === 1 && <Step1Datos onNext={handleNext} />}
          {step === 2 && <Step2Profesional onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <Step3Atencion onNext={handleNext} onBack={handleBack} />}
          {step === 4 && <Step4Documentos formData={formData} onBack={handleBack} />}
        </div>
        
      </div>
    </div>
  );
}
