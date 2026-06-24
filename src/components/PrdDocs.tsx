import React, { useState } from 'react';
import { PRDSection } from '../types';
import { BookOpen, Edit3, Save, Copy, Download, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrdDocsProps {
  sections: PRDSection[];
  onSaveSection: (id: string, newContent: string) => void;
}

export default function PrdDocs({ sections, onSaveSection }: PrdDocsProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || 'prd-summary');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const handleStartEdit = () => {
    setEditContent(activeSection.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSaveSection(activeSection.id, editContent);
    setIsEditing(false);
  };

  const handleCopyAll = () => {
    const fullMarkdown = sections
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullMarkdown = sections
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BUDGET_TRACKER_PRD.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="prd-docs-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation for Document Sections */}
      <div id="prd-sidebar" className="lg:col-span-1 bg-[#14161A] p-4 rounded-3xl border border-slate-800 shadow-sm flex flex-col gap-1.5 h-fit">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-3 border-b border-slate-800">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white text-sm tracking-tight">PRD Document Index</span>
        </div>
        {sections.map((sec) => (
          <button
            key={sec.id}
            id={`btn-prd-sec-${sec.id}`}
            onClick={() => {
              setActiveSectionId(sec.id);
              setIsEditing(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeSectionId === sec.id
                ? 'bg-emerald-950/20 text-emerald-400 font-semibold border-l-2 border-emerald-500'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {sec.title}
          </button>
        ))}

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2">
          <button
            id="btn-copy-full-prd"
            onClick={handleCopyAll}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Copied Raw MD!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Markdown</span>
              </>
            )}
          </button>
          
          <button
            id="btn-download-prd"
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl border border-emerald-500 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PRD (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Document Content Pane */}
      <div id="prd-content-pane" className="lg:col-span-3 bg-[#14161A] rounded-3xl border border-slate-800 shadow-sm p-6 lg:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div>
            <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">Active PRD Section</span>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeSection?.title}</h2>
          </div>
          <div>
            {!isEditing ? (
              <button
                id="btn-edit-prd-section"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Section Text</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-cancel-prd-edit"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-prd-edit"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg border border-emerald-500 shadow-sm transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2 h-full">
              <span className="text-xs text-slate-500 font-mono">Supports standard markdown text edits</span>
              <textarea
                id="prd-edit-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={16}
                className="w-full p-4 text-sm font-mono text-slate-200 bg-[#0A0B0D] rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                placeholder="Write your requirement specifications..."
              />
            </div>
          ) : (
            <div id="prd-markdown-viewer" className="prose max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              {activeSection?.content.split('\n\n').map((paragraph, idx) => {
                // Simplistic local markdown parser for headers & lists
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base font-bold text-white pt-3 pb-1 border-b border-slate-800">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-lg font-bold text-white pt-4 pb-1">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2 text-slate-300">
                      {paragraph.split('\n').map((li, liIdx) => {
                        const cleanLi = li.replace('- ', '');
                        // Check for bold parts
                        if (cleanLi.includes('**')) {
                          const parts = cleanLi.split('**');
                          return (
                            <li key={liIdx}>
                              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{p}</strong> : p)}
                            </li>
                          );
                        }
                        return <li key={liIdx}>{cleanLi}</li>;
                      })}
                    </ul>
                  );
                }
                // Check if paragraph contains bold tags **
                if (paragraph.includes('**')) {
                  const parts = paragraph.split('**');
                  return (
                    <p key={idx}>
                      {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{p}</strong> : p)}
                    </p>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          )}
        </div>

        {/* Documentation Guidance Helpbox */}
        <div className="mt-8 p-4 bg-[#0A0B0D] border border-slate-800 rounded-2xl flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-450 leading-relaxed">
            <span className="font-bold text-white block mb-1">Document Integration Notice:</span> This PRD represents the core product specifications of the Budget Tracker. Any modification to this text is stored persistently in your local cache, allowing product owners to shape features dynamically and align requirements immediately with the current codebase.
          </div>
        </div>
      </div>
    </div>
  );
}
