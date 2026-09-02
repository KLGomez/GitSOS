import React, { useState, useRef, useEffect } from 'react';
import { Brain, Repeat, GitMerge, LifeBuoy, Send, MessageCircle, GitBranch, User, Home, Menu, X, Copy, Check } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GitSOSInterfaceProps {
  children?: React.ReactNode;
}

const quickActions = [
  "Subí un archivo .env",
  "Commit en la rama equivocada",
  "Error en el mensaje del commit",
  "Tengo un Merge Conflict",
];

const ChatCodeBlock: React.FC<React.HTMLAttributes<HTMLPreElement>> = ({ children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText || '';
    try {
      await navigator.clipboard.writeText(text.trim());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="relative group my-2.5">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm flex items-center justify-center cursor-pointer"
        title="Copiar código"
        aria-label="Copiar código al portapapeles"
      >
        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      </button>
      <pre
        ref={preRef}
        className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 pt-3 overflow-x-auto text-xs font-mono text-emerald-400 shadow-inner"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
};

const GitSOSInterface: React.FC<GitSOSInterfaceProps> = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const chatState = useChat({ api: '/api/chat' });
  const rawSendMessage = chatState?.sendMessage;
  const sendMessage = (msg: any) => {
    if (!rawSendMessage) return;
    if (typeof msg === 'string') {
      return rawSendMessage({ text: msg });
    }
    return rawSendMessage(msg);
  };

  const messages = chatState?.messages || [];
  const isLoading = chatState?.status === 'submitted' || chatState?.status === 'streaming' || Boolean(chatState?.isLoading);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-20 flex-shrink-0">
        <a href="/" className="flex items-center gap-2">
          <GitBranch className="text-indigo-500" size={24} />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GitSOS
          </span>
        </a>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Alternar menú"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Overlay para móviles */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity" 
        />
      )}

      {/* Sidebar (Navegación Izquierda) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <GitBranch className="text-indigo-500 group-hover:rotate-12 transition-transform" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              GitSOS
            </h1>
          </a>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <NavItem href="/" icon={<Home size={20} />} text="Inicio" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/docs/modelo-mental" icon={<Brain size={20} />} text="El Modelo Mental" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/docs/flujo-diario" icon={<Repeat size={20} />} text="El Flujo Diario" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/docs/multiverso-despliegues" icon={<GitMerge size={20} />} text="Multiverso y Despliegues" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/docs/sala-emergencias" icon={<LifeBuoy size={20} />} text="La Sala de Emergencias" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>
        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800/50">
          v1.0.0-beta
        </div>
      </aside>

      {/* Área de Contenido (Centro/Derecha) */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-indigo max-w-none prose-headings:text-slate-100 prose-a:text-indigo-400 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
            {children}
          </div>
        </div>
      </main>

      {/* Chatbot Flotante (Esquina inferior derecha) */}
      <div className="fixed bottom-6 right-6 z-[60] pointer-events-auto flex flex-col items-end">
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
            
            {/* Chat Body con Scroll Vertical */}
            <div className="p-4 pr-2 flex-1 h-80 sm:h-96 max-h-[420px] overflow-y-auto scrollbar-chat bg-slate-900/50 flex flex-col gap-4 scroll-smooth">
              {messages.map((m: any) => {
                const messageText = typeof m.content === 'string' 
                  ? m.content 
                  : (typeof m.text === 'string' 
                      ? m.text 
                      : (Array.isArray(m.parts) ? m.parts.map((p: any) => p.text || '').join('') : ''));

                return (
                  <div 
                    key={m.id || Math.random()} 
                    className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'user' && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md mt-0.5">
                        <LifeBuoy size={15} />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none whitespace-pre-wrap' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-sm'
                      }`}
                    >
                      {m.role === 'user' ? (
                        messageText
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            pre: ChatCodeBlock,
                            code: ({ className, children, ...props }) => {
                              const isInline = !className && typeof children === 'string' && !children.includes('\n');
                              return isInline ? (
                                <code className="bg-slate-950/70 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/60" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1.5">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-200">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-indigo-300 font-medium">{children}</em>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                                {children}
                              </a>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 text-slate-300 italic">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {messageText}
                        </ReactMarkdown>
                      )}
                    </div>

                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 shadow-md mt-0.5">
                        <User size={15} />
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md mt-0.5">
                    <LifeBuoy size={15} />
                  </div>
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none border border-slate-700 text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              {/* Ancla para Auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick Actions & Chat Input */}
            <div className="bg-slate-800 border-t border-slate-700">
              {/* Quick Actions Chips Container */}
              <div className="px-3 pt-2.5 pb-1 overflow-x-auto flex gap-1.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput('');
                      sendMessage(action);
                    }}
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <div className="p-3 pt-1.5">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    sendMessage(chatInput);
                    setChatInput('');
                  }}
                  className="flex items-center gap-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe tu emergencia aquí..." 
                    className="flex-1 bg-slate-900 text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700 placeholder-slate-500 text-sm transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!chatInput?.trim() || isLoading}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
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

const NavItem = ({ href, icon, text, onClick }: { href: string; icon: React.ReactNode; text: string; onClick?: () => void }) => {
  return (
    <a 
      href={href} 
      onClick={onClick}
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
