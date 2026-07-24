import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Brain, Sparkles, AlertTriangle } from 'lucide-react';
import { WizardState, UploadedDocument } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

const DOC_CLASSIFICATIONS: Record<string, { classification: string; extractedData: { key: string; value: string }[] }> = {
  prior_coverage: {
    classification: 'Prior Group Coverage Verification',
    extractedData: [
      { key: 'Prior Carrier', value: 'Blue Cross Blue Shield' },
      { key: 'Policy Number', value: 'GRP-2024-88821' },
      { key: 'Coverage Start', value: '01/01/2024' },
      { key: 'Coverage End', value: '12/31/2024' },
      { key: 'Group Members Covered', value: '8' },
    ],
  },
  employment_class: {
    classification: 'Employment Classification Verification',
    extractedData: [
      { key: 'Document Type', value: 'HR Classification Letter' },
      { key: 'Effective Date', value: '01/01/2025' },
      { key: 'Employees Reclassified', value: '2' },
      { key: 'Issuing Authority', value: 'Human Resources' },
    ],
  },
  soh: {
    classification: 'Statement of Health (SOH)',
    extractedData: [
      { key: 'Employee', value: 'James Brown (EMP-010)' },
      { key: 'Declaration Date', value: '01/10/2025' },
      { key: 'Health Status', value: 'Declared Healthy' },
      { key: 'Physician', value: 'Dr. Sarah Nguyen, MD' },
    ],
  },
};

function guessClassification(fileName: string): string {
  const l = fileName.toLowerCase();
  if (l.includes('prior') || l.includes('coverage') || l.includes('bcbs') || l.includes('insurance')) return 'prior_coverage';
  if (l.includes('class') || l.includes('employ') || l.includes('hr') || l.includes('letter')) return 'employment_class';
  if (l.includes('soh') || l.includes('health') || l.includes('statement')) return 'soh';
  return 'prior_coverage';
}

export default function StepDocuments({ state, update }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const result = state.underwritingResult;
  const requiredDocs = result?.requiredDocuments ?? [];
  const isConditional = result?.decision === 'CONDITIONAL_APPROVAL';
  const acceptedCount = state.documents.filter((d) => d.status === 'accepted').length;
  const allRequired = requiredDocs.length > 0 && acceptedCount >= requiredDocs.length;

  function uploadFile(fileName: string) {
    const id = `doc-${Date.now()}`;
    const newDoc: UploadedDocument = { id, fileName, classification: '', status: 'uploading', extractedData: [] };

    update({ documents: [...stateRef.current.documents, newDoc] });

    setTimeout(() => {
      update({ documents: stateRef.current.documents.map((d) => d.id === id ? { ...d, status: 'analyzing' } : d) });
      const classKey = guessClassification(fileName);
      const classData = DOC_CLASSIFICATIONS[classKey] ?? DOC_CLASSIFICATIONS.prior_coverage;
      setTimeout(() => {
        update({
          documents: stateRef.current.documents.map((d) =>
            d.id === id
              ? { ...d, status: 'accepted', classification: classData.classification, extractedData: classData.extractedData }
              : d
          ),
        });
      }, 1800);
    }, 900);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach((f) => uploadFile(f.name));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach((f) => uploadFile(f.name));
    e.target.value = '';
  }

  return (
    <div data-testid="step-documents" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Supporting Documents</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isConditional
            ? 'AI underwriting flagged documents required for conditional approval. Upload them below.'
            : 'No supporting documents required — your application is cleared to proceed.'}
        </p>
      </div>

      {!isConditional && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">No Documents Required</p>
            <p className="text-xs text-emerald-600 mt-0.5">Application approved without additional documentation. Continue to Billing.</p>
          </div>
        </div>
      )}

      {isConditional && (
        <>
          <SmartTip>
            Documents are automatically classified and key data extracted by our AI Document Intelligence engine. Just upload — no labeling needed.
          </SmartTip>

          {/* Required checklist */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold text-gray-800">Required Documents ({acceptedCount}/{requiredDocs.length} uploaded)</span>
            </div>
            <div className="divide-y divide-gray-100">
              {requiredDocs.map((doc, idx) => {
                const done = idx < acceptedCount;
                return (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3">
                    {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />}
                    <span className={`text-sm flex-1 ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{doc}</span>
                    {!done && (
                      <button onClick={() => uploadFile(`${doc.toLowerCase().replace(/\s+/g, '_')}.pdf`)} className="text-xs text-brand-600 hover:text-brand-800 font-medium">
                        Upload →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop files here</p>
            <p className="text-xs text-gray-500 mb-3">PDF, DOC, DOCX, JPG, PNG — up to 25 MB each</p>
            <label className="cursor-pointer px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
              Browse Files
              <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
          </div>

          {/* Demo quick upload */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick upload demo documents:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Prior Coverage Letter', file: 'prior_coverage_bcbs_2024.pdf' },
                { label: 'Employment Classification', file: 'hr_classification_letter.pdf' },
                { label: 'Statement of Health', file: 'soh_james_brown_emp010.pdf' },
              ].map((btn) => (
                <button
                  key={btn.file}
                  onClick={() => uploadFile(btn.file)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                >
                  <FileText className="w-3 h-3" /> {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded list */}
          {state.documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Uploaded Documents</h3>
              {state.documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className={`flex items-center gap-3 px-4 py-3 ${doc.status === 'accepted' ? 'bg-emerald-50' : doc.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</div>
                      {doc.classification && (
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Brain className="w-3 h-3 text-violet-500" />
                          AI: {doc.classification}
                        </div>
                      )}
                    </div>
                    {doc.status === 'uploading' && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        Uploading…
                      </span>
                    )}
                    {doc.status === 'analyzing' && (
                      <span className="flex items-center gap-1.5 text-xs text-violet-600 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" /> AI Analyzing…
                      </span>
                    )}
                    {doc.status === 'accepted' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    {doc.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  </div>
                  {doc.status === 'accepted' && doc.extractedData.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-white">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">AI-Extracted Data</span>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {doc.extractedData.map(({ key, value }) => (
                          <React.Fragment key={key}>
                            <dt className="text-[10px] text-gray-400">{key}</dt>
                            <dd className="text-[10px] font-medium text-gray-800">{value}</dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {allRequired && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">All required documents uploaded</p>
                <p className="text-xs text-emerald-600 mt-0.5">Your application is ready for CFO review and submission.</p>
              </div>
            </div>
          )}

          {state.documents.length === 0 && (
            <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Upload required documents to proceed. You can continue without them, but the application will be flagged as incomplete.
            </div>
          )}
        </>
      )}
    </div>
  );
}
