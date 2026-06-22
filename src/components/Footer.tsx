import type { FC } from 'react';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: FC = () => {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-slate-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Pitch */}
          <div className="flex flex-col space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-200">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  ALQUILAGO
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-widest text-blue-400">
                  Trujillo · Rent
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              La primera plataforma de alquileres de departamentos y habitaciones pensada exclusivamente para la comunidad estudiantil y médica en Trujillo, La Libertad.
            </p>
          </div>

          {/* Quick links for universities */}
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">Zona Universidades</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <a href="#buscar" className="hover:text-white transition">Alquileres cerca a la UNT</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Alquileres cerca a la UPAO</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Alquileres cerca a la UPN (San Isidro)</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Alquileres cerca a la UCV</a>
              </li>
            </ul>
          </div>

          {/* Quick links for hospitals */}
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">Zona Hospitalaria</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <a href="#buscar" className="hover:text-white transition">Habitaciones cerca a Hospital Regional</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Mini-departamentos cerca a Hospital Belén</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Estudios cerca a Alta Complejidad</a>
              </li>
              <li>
                <a href="#buscar" className="hover:text-white transition">Coliving para Médicos Residentes</a>
              </li>
            </ul>
          </div>

          {/* Contact and address */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">Contacto</h4>
            <ul className="mt-4 space-y-3.5 text-xs">
              <li className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>Pizarro 420, Centro Histórico, Trujillo</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>+51 044 283940</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>soporte@alquilago.pe</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 ALQUILAGO. Todos los derechos reservados. Diseñado para estudiantes y doctores en Trujillo, Perú.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white">Políticas de Privacidad</a>
            <a href="#" className="hover:text-white">Términos del Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
