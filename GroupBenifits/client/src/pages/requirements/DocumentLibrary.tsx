import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Cpu, ChevronRight, BarChart2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { documentsApi } from '../../api/documents';
import { BenefitsDocument } from '../../types';

const LIFECYCLE_STEPS = ['UPLOADED', 'VALIDATED', 'EXTRACTED', 'ANALYZED', 'REQUIREMENTS_GENERATED', 'COMPLETED'];

const LC_LABELS: Record<string, string> = {
  UPLOADED: 'Uploaded',
  VALIDATED: 'Validated',
  EXTRACTED: 'Extracted',
  ANALYZED: 'Analyzed',
  REQUIREMENTS_GENERATED: 'AI Generated',
  COMPLETED: 'Complete',
};

const LC_COLORS: Record<string, string> = {
  UPLOADED: 'bg-blue-100 text-blue-700',
  VALIDATED: 'bg-indigo-100 text-indigo-700',
  EXTRACTED: 'bg-amber-100 text-amber-700',
  ANALYZED: 'bg-purple-100 text-purple-700',
  REQUIREMENTS_GENERATED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'Benefits Guide': <FileText className="w-5 h-5 text-brand-500" />,
  'Eligibility Policy': <CheckCircle className="w-5 h-5 text-emerald-500" />,
  'Carrier Integration Specification': <BarChart2 className="w-5 h-5 text-purple-500" />,
  'Payroll Interface Specification': <Clock className="w-5 h-5 text-amber-500" />,
  'Enrollment Process Guide': <Cpu className="w-5 h-5 text-indigo-500" />,
};

function LifecycleBar({ state }: { state: string }) {
  const idx = LIFECYCLE_STEPS.indexOf(state);
  return (
    <div className="flex items-center gap-0.5 mt-3">
      {LIFECYCLE_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div
            title={LC_LABELS[step]}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-brand-500' : 'bg-gray-200'}`}
          />
          {i < LIFECYCLE_STEPS.length - 1 && <div className="w-px h-1.5" />}
        </React.Fragment>
      ))}
    </div>
  );
}

interface UploadMockForm {
  filename: string;
  documentType: string;
}

export default function DocumentLibrary({ onSelectDoc }: { onSelectDoc?: (doc: BenefitsDocument) => void }) {
  const qc = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState<UploadMockForm>({ filename: '', documentType: 'Benefits Guide' });
  const [uploadMsg, setUploadMsg] = useState('');

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list('ACM-001'),
    staleTime: 30_000,
  });

  const uploadMutation = useMutation({
    mutationFn: () =>
      fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}`,
        },
        body: JSON.stringify({ ...form, planYear: 2027, employerId: 'ACM-001' }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      setUploadMsg(data?.data?.message ?? 'Queued for processing');
      setForm({ filename: '', documentType: 'Benefits Guide' });
      setTimeout(() => {
        setShowUpload(false);
        setUploadMsg('');
        qc.invalidateQueries({ queryKey: ['documents'] });
      }, 2000);
    },
  });

  const totalConflicts = docs.reduce((s, d) => s + (d.conflictCount ?? 0), 0);
  const totalRules = docs.reduce((s, d) => s + (d.extractedRuleCount ?? 0), 0);
  const generated = docs.filter((d) => d.lifecycleState === 'REQUIREMENTS_GENERATED' || d.lifecycleState === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{docs.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Documents uploaded</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{totalRules}</div>
          <div className="text-xs text-gray-500 mt-0.5">Rules extracted</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${totalConflicts > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{totalConflicts}</div>
          <div className="text-xs text-gray-500 mt-0.5">Conflicts detected</div>
        </Card>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Document Library</h2>
          <p className="text-xs text-gray-500 mt-0.5">{generated} of {docs.length} docs have AI-generated requirements</p>
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* Mock upload panel */}
      {showUpload && (
        <Card className="p-4 border-brand-200 bg-brand-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Benefits Document (Demo)</h3>
          {uploadMsg ? (
            <div className="flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              {uploadMsg}
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={form.filename}
                onChange={(e) => setForm((f) => ({ ...f, filename: e.target.value }))}
                placeholder="e.g. Acme_2027_SPD.pdf"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-400"
              />
              <select
                value={form.documentType}
                onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-400"
              >
                <option>Benefits Guide</option>
                <option>Eligibility Policy</option>
                <option>Carrier Integration Specification</option>
                <option>Payroll Interface Specification</option>
                <option>Enrollment Process Guide</option>
                <option>Summary Plan Description</option>
              </select>
              <button
                disabled={!form.filename || uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Doc list */}
      {isLoading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading documents...</div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.documentId} role="button" tabIndex={0} onClick={() => onSelectDoc?.(doc)} onKeyDown={(e) => e.key === 'Enter' && onSelectDoc?.(doc)} className="cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm hover:border-brand-200 hover:shadow-md transition-all">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {TYPE_ICONS[doc.documentType] ?? <FileText className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{doc.originalFilename}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${LC_COLORS[doc.lifecycleState] ?? 'bg-gray-100 text-gray-600'}`}>
                      {LC_LABELS[doc.lifecycleState] ?? doc.lifecycleState}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {doc.documentType} · Plan Year {doc.planYear} · {doc.pageCount ?? '–'} pages
                  </div>
                  <div className="flex gap-4 mt-1">
                    {doc.extractedRuleCount != null && (
                      <span className="text-xs text-gray-500">{doc.extractedRuleCount} rules extracted</span>
                    )}
                    {(doc.conflictCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        {doc.conflictCount} conflict{doc.conflictCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {(doc.ambiguityCount ?? 0) > 0 && (
                      <span className="text-xs text-purple-600">{doc.ambiguityCount} ambiguit{doc.ambiguityCount !== 1 ? 'ies' : 'y'}</span>
                    )}
                  </div>
                  <LifecycleBar state={doc.lifecycleState} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
