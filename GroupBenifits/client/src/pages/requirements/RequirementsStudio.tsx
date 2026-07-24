import React, { useState } from 'react';
import { FileText, LayoutGrid, MessageSquare, ShieldAlert, GitBranch } from 'lucide-react';
import DocumentLibrary from './DocumentLibrary';
import RequirementsWorkspace from './RequirementsWorkspace';
import DocumentReview from './DocumentReview';
import AIInterview from './AIInterview';
import ConflictDetection from './ConflictDetection';
import TraceabilityGraph from './TraceabilityGraph';
import type { BenefitsDocument } from '../../types';

const VIEWS = [
  { id: 'documents', label: 'Document Library', icon: FileText },
  { id: 'workspace', label: 'Requirements Workspace', icon: LayoutGrid },
  { id: 'interview', label: 'AI Interview', icon: MessageSquare },
  { id: 'conflicts', label: 'Conflict Detection', icon: ShieldAlert },
  { id: 'traceability', label: 'Traceability', icon: GitBranch },
] as const;

type View = (typeof VIEWS)[number]['id'] | 'review';

const SUBTITLES: Record<string, string> = {
  documents: 'Upload and manage benefits plan documents. Click any document to open the 3-panel review workspace.',
  workspace: 'Browse all structured requirements, user stories, and business rules extracted from documents.',
  interview: 'Guided AI conversation to elicit and generate requirements from scratch.',
  conflicts: 'Detected conflicts and ambiguities across documents and requirements, with suggested resolutions.',
  traceability: 'Full chain traceability: Document → Requirement → Rule → Plan → Enrollment → Carrier → Payroll.',
};

export default function RequirementsStudio() {
  const [view, setView] = useState<View>('documents');
  const [selectedDoc, setSelectedDoc] = useState<BenefitsDocument | null>(null);

  const handleSelectDoc = (doc: BenefitsDocument) => {
    setSelectedDoc(doc);
    setView('review');
  };

  const isReview = view === 'review';

  return (
    <div className={isReview ? 'flex flex-col h-[calc(100vh-64px)]' : 'p-6 max-w-6xl mx-auto'}>
      {!isReview && (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">AI Requirements Studio</h1>
            <p className="text-sm text-gray-500 mt-0.5">{SUBTITLES[view] ?? ''}</p>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                data-testid={`req-studio-tab-${id}`}
                onClick={() => setView(id as View)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {view === 'documents' && <DocumentLibrary onSelectDoc={handleSelectDoc} />}
          {view === 'workspace' && <RequirementsWorkspace />}
          {view === 'interview' && <AIInterview />}
          {view === 'conflicts' && <ConflictDetection />}
          {view === 'traceability' && <TraceabilityGraph />}
        </>
      )}

      {isReview && selectedDoc && (
        <DocumentReview
          doc={selectedDoc}
          onClose={() => { setView('documents'); setSelectedDoc(null); }}
        />
      )}
    </div>
  );
}
