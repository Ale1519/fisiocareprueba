import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, HelpCircle, ShieldCheck, 
  CreditCard, CalendarCheck, Video, Star, 
  Activity, Mail, Phone 
} from 'lucide-react';

const categorias = [
  {
    id: 'verificacion', icon: ShieldCheck, label: 'Verificación', bg: 'bg-[#EBF4FF]', fg: 'text-[#1E3A5F]',
    preguntas: [
      { q: '¿Cómo se verifican los fisioterapeutas?', a: 'Cada fisioterapeuta pasa por un proceso de validación ante el CTM. Revisamos su documentación, experiencia y referencias antes de activar su perfil.' },
      { q: '¿Las reseñas de pacientes son verificadas?', a: 'Sí. Solo los pacientes con sesiones pagadas pueden dejar reseñas, garantizando experiencias reales.' },
      { q: '¿Cómo sé que el fisio es bueno para mi caso?', a: 'Cada perfil muestra especialidades, experiencia, tarifas y reseñas reales. Puedes enviar mensajes directos antes de agendar.' },
    ],
  },
  {
    id: 'pagos', icon: CreditCard, label: 'Pagos y reembolsos', bg: 'bg-[#E6F4EA]', fg: 'text-[#38A169]',
    preguntas: [
      { q: '¿Cuál es la política de cancelación?', a: 'Más de 12h: reembolso 100%. Entre 12h y 2h: 50%. Menos de 2h o no asistencia: 100% de cobro.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos Yape y tarjetas Visa/Mastercard mediante nuestro flujo de pago seguro.' },
    ],
  },
  {
    id: 'citas', icon: CalendarCheck, label: 'Citas y reservas', bg: 'bg-[#FFF5F5]', fg: 'text-[#E53E3E]',
    preguntas: [
      { q: '¿Cómo reagendo una cita?', a: 'Desde "Mis citas" → selecciona la sesión → "Reprogramar". Sin costo hasta 12h antes.' },
      { q: '¿Recibiré recordatorios?', a: 'Sí, enviamos recordatorios 24h antes.' },
    ],
  },
  {
    id: 'videollamada', icon: Video, label: 'Videollamadas', bg: 'bg-[#FAF5FF]', fg: 'text-[#805AD5]',
    preguntas: [
      { q: '¿Las sesiones se graban?', a: 'No, son sesiones totalmente privadas y no se almacenan.' },
    ],
  },
  {
    id: 'plataforma', icon: Star, label: 'Plataforma', bg: 'bg-[#FFFBEB]', fg: 'text-[#D69E2E]',
    preguntas: [
      { q: '¿Cómo reporto una mala experiencia?', a: 'Desde "Historial de citas" → "Reportar problema". Respondemos en menos de 24h.' },
    ],
  },
];

export default function ComoFuncionaPage() {
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [categoriaActiva, setCategoriaActiva] = useState('todas');

  function toggle(key: string) {
    setAbiertos((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const vistas = categoriaActiva === 'todas' ? categorias : categorias.filter((c) => c.id === categoriaActiva);

  return (
    // Se ha asegurado el uso del mismo fondo #F8FAFC para todo el contenedor
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow">
        {/* Header y Filtros */}
        <section className="bg-white py-16 border-b border-slate-100">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF4FF]">
              <HelpCircle className="h-7 w-7 text-[#1E3A5F]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1A202C]">Preguntas frecuentes</h1>
            <p className="mt-3 mb-10 text-lg text-slate-500">Resolvemos las dudas más comunes sobre FisioCare.</p>

            <div className="flex flex-wrap gap-2 justify-center">
              {[{ id: 'todas', label: 'Todas', icon: HelpCircle, bg: 'bg-[#EBF4FF]', fg: 'text-[#1E3A5F]' }, ...categorias].map((cat) => {
                const Icon = cat.icon;
                const activo = categoriaActiva === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition border ${activo ? `${cat.bg} ${cat.fg} border-transparent` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Icon className="h-4 w-4" /> {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cuerpo de Acordeones */}
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="space-y-8">
            {vistas.map((cat) => (
              <div key={cat.id}>
                <div className="mb-4 flex items-center gap-3 pl-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cat.bg}`}>
                    <cat.icon className={`h-5 w-5 ${cat.fg}`} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{cat.label}</h2>
                </div>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {cat.preguntas.map((item, idx) => {
                    const key = `${cat.id}-${idx}`;
                    const abierto = !!abiertos[key];
                    return (
                      <div key={key}>
                        <button onClick={() => toggle(key)} className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors">
                          <span className="font-semibold text-slate-800">{item.q}</span>
                          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
                        </button>
                        {abierto && (
                          <div className="border-t border-slate-50 bg-[#FAFAFA] px-6 py-5 text-sm leading-relaxed text-slate-600">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer corporativo */}
      <footer className="bg-[#0A1E3D] text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg"><Activity /> FisioCare</div>
            <p className="text-sm">Conectamos pacientes con fisioterapeutas verificados en Lima.</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Pacientes</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/especialistas" className="hover:text-white">Buscar fisioterapeuta</Link></li>
              <li><Link to="/como-funciona" className="hover:text-white">Preguntas frecuentes</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Profesionales</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Únete como fisio</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Contacto</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@fisiocare.pe</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +51 999 888 777</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-6 text-sm flex justify-between">
          <p>© 2026 FisioCare. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Lima</p>
        </div>
      </footer>
    </div>
  );
}
