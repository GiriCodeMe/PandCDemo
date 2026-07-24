import React, { useState } from 'react';
import { FileText, LayoutGrid, ArrowLeft } from 'lucide-react';
import DocumentLibrary from './DocumentLibrary';
import RequirementsWorkspace from './RequirementsWorkspace';
import { BenefitsDocument } from '../../types';

const VIEWS = [
  { id: 'documents', label: 'Document Library', icon: FileText },
  { id: 'workspace', label: 'Requirements Workspace', icon: LayoutGrid },
] as const;

type View = (typeof VIEWS)[number]['id'];

export default function RequirementsStudio() {
  const [view, setView] = useState<View>('documents');
  const [selectedDoc, setSelectedDoc] = useState<BenefitsDocument | null>(null);

  const handleSelectDoc = (doc: BenefitsDocument) => {
    setSelectedDoc(doc);
    setView('workspace');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">AI Requirements Studio</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload benefits documents, auto-extract rules, and generate structured requirements using AI.
        </p>
      </div>

      {/* View switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {selectedDoc && view === 'workspace' && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => { setView('documents'); setSelectedDoc(null); }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to library
          </button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-700 font-medium">{selectedDoc.originalFilename}</span>
        </div>
      )}

      {view === 'documents' && <DocumentLibrary onSelectDoc={handleSelectDoc} />}
      {view === 'workspace' && <RequirementsWorkspace />}
    </div>
  );
}
