import React from 'react';
import { FolderGit2, Layers, Database, ArrowRight, ArrowDown, GitCommit, FilePlus, RotateCcw } from 'lucide-react';

const GitZonesDiagram: React.FC = () => {
  return (
    <div className="my-8 p-6 bg-slate-900/90 border border-indigo-500/20 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 m-0">
            Arquitectura Local de Git (Las 3 Zonas)
          </h4>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
          Tu Computadora
        </span>
      </div>

      {/* Grid de Zonas y Conectores */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Zona 1: Working Directory */}
        <div className="flex-1 bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/40 rounded-xl p-5 transition-all shadow-md group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-slate-900 rounded-lg text-amber-400 border border-slate-700 group-hover:scale-105 transition-transform">
              <FolderGit2 size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-amber-400 font-mono">Zona 1</div>
              <h5 className="text-base font-bold text-white m-0">Working Directory</h5>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3 m-0">
            Archivos físicos en tu disco donde programas en tiempo real.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[11px] font-mono border border-amber-500/20">
            Estado: Modified / Untracked
          </div>
        </div>

        {/* Conector 1: git add */}
        <div className="flex md:flex-col items-center justify-center gap-1 py-1 md:py-0 text-indigo-400">
          <div className="hidden md:flex flex-col items-center gap-1">
            <span className="text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30 whitespace-nowrap shadow-sm">
              git add
            </span>
            <ArrowRight size={18} className="animate-pulse" />
          </div>
          <div className="flex md:hidden items-center justify-center gap-2 w-full my-1">
            <ArrowDown size={18} />
            <span className="text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
              git add
            </span>
            <ArrowDown size={18} />
          </div>
        </div>

        {/* Zona 2: Staging Area */}
        <div className="flex-1 bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl p-5 transition-all shadow-md group ring-1 ring-indigo-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-slate-900 rounded-lg text-indigo-400 border border-slate-700 group-hover:scale-105 transition-transform">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-indigo-400 font-mono">Zona 2</div>
              <h5 className="text-base font-bold text-white m-0">Staging Area</h5>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3 m-0">
            Mesa de preparación previa para organizar tu próximo commit.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] font-mono border border-indigo-500/30">
            Estado: Staged
          </div>
        </div>

        {/* Conector 2: git commit */}
        <div className="flex md:flex-col items-center justify-center gap-1 py-1 md:py-0 text-emerald-400">
          <div className="hidden md:flex flex-col items-center gap-1">
            <span className="text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 whitespace-nowrap shadow-sm">
              git commit
            </span>
            <ArrowRight size={18} className="animate-pulse" />
          </div>
          <div className="flex md:hidden items-center justify-center gap-2 w-full my-1">
            <ArrowDown size={18} />
            <span className="text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              git commit
            </span>
            <ArrowDown size={18} />
          </div>
        </div>

        {/* Zona 3: Local Repository */}
        <div className="flex-1 bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/40 rounded-xl p-5 transition-all shadow-md group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-400 border border-slate-700 group-hover:scale-105 transition-transform">
              <Database size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-emerald-400 font-mono">Zona 3</div>
              <h5 className="text-base font-bold text-white m-0">Local Repository</h5>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3 m-0">
            Base de datos inmutable (.git) con el historial completo.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-mono border border-emerald-500/20">
            Estado: Committed
          </div>
        </div>

      </div>

      {/* Nota inferior sobre reversión */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <RotateCcw size={14} className="text-slate-500" />
          <span>Para desempacar cambios de Staging a Working Directory:</span>
        </div>
        <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300 font-mono text-[11px] border border-slate-800">
          git restore --staged &lt;archivo&gt;
        </code>
      </div>
    </div>
  );
};

export default GitZonesDiagram;
