import React, { useState } from 'react';
import { Brain, Repeat, GitMerge, LifeBuoy, Send, MessageCircle, GitBranch } from 'lucide-react';

const GitSOSInterface = () => {
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar (Navegación Izquierda) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <GitBranch className="text-indigo-500" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              GitSOS
            </h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <NavItem icon={<Brain size={20} />} text="El Modelo Mental" />
          <NavItem icon={<Repeat size={20} />} text="El Flujo Diario" />
          <NavItem icon={<GitMerge size={20} />} text="Multiverso y Despliegues" />
          <NavItem icon={<LifeBuoy size={20} />} text="La Sala de Emergencias" />
        </nav>
        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800/50">
          v1.0.0-beta
        </div>
      </aside>

      {/* Área de Contenido (Centro/Derecha) */}
      <main className="flex-1 overflow-y-auto p-10 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Bienvenido a GitSOS
            </h2>
            <p className="text-lg text-slate-400">
              La guía interactiva de Git y GitHub para desarrolladores junior.
            </p>
          </header>
          
          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-sm shadow-sm">
              <h3 className="text-2xl font-semibold text-white mb-4">Empezando con tu repositorio</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Git no tiene por qué ser intimidante. Imagina a Git como una máquina del tiempo para tu código.
                Cada <code>commit</code> es una foto instantánea que te permite volver atrás si las cosas salen mal. 
                En este recorrido, aprenderemos desde lo más básico hasta cómo salir de apuros cuando tu rama parece un desastre.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Selecciona una lección en el menú de la izquierda para comenzar. Si alguna vez te sientes perdido o tienes una emergencia con tu código, ¡abre el chat de rescate en la esquina inferior derecha y nuestro Senior Dev te ayudará a solucionarlo!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot Flotante (Esquina inferior derecha) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen ? (
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-80 sm:w-96 border border-slate-700 overflow-hidden flex flex-col mb-4 transform transition-all duration-300 ease-in-out">
            {/* Chat Header */}
            <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-medium text-slate-200">Asistente GitSOS</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
                aria-label="Cerrar chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Chat Body */}
            <div className="p-4 flex-1 h-72 overflow-y-auto bg-slate-900/50">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                  <LifeBuoy size={16} />
                </div>
                <div className="bg-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm text-sm leading-relaxed">
                  ¡Hola! ¿Rompiste un commit? Dime qué pasó y lo arreglamos.
                </div>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
              <form 
                onSubmit={(e) => { e.preventDefault(); /* Handle submit */ }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu emergencia aquí..." 
                  className="flex-1 bg-slate-900 text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700 placeholder-slate-500 text-sm transition-all"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : null}
        
        {/* Chat Toggle Button */}
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-900/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            aria-label="Abrir asistente"
          >
            <MessageCircle size={26} />
          </button>
        )}
      </div>
    </div>
  );
};

const NavItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => {
  return (
    <a 
      href="#" 
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group"
    >
      <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">
        {icon}
      </span>
      <span className="font-medium text-sm">{text}</span>
    </a>
  );
};

export default GitSOSInterface;
