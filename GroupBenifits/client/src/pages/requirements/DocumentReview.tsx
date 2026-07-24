import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, Cpu, AlertTriangle, CheckCircle2, Clock, ChevronLeft, ChevronRight, Eye, EyeOff, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import type { BenefitsDocument, Requirement } from '../../types';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function fetchDocReqs(documentId: string): Promise<Requirement[]> {
  const res = await fetch(`/api/documents/${documentId}/requirements`, { headers: authHeader() });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

// Simulated page excerpts per document type — in production these would come from the PDF extraction service
const DOC_PAGE_CONTENT: Record<string, { page: number; heading: string; text: string; highlights: string[] }[]> = {
  'Benefits Guide': [
    {
      page: 1,
      heading: 'Section 1 — Eligibility',
      text: 'Full-time employees working a minimum of 30 hours per week become eligible for medical, dental, and vision coverage after completing a 30-day waiting period. Coverage becomes effective on the first day of the month following completion of the waiting period.',
      highlights: ['30 hours per week', '30-day waiting period', 'first day of the month following'],
    },
    {
      page: 2,
      heading: 'Section 2 — Dependent Coverage',
      text: 'Eligible dependents include a legal spouse or domestic partner and dependent children up to age 26. Dependent children reaching age 26 will have their coverage terminated at the end of the calendar month in which they turn 26.',
      highlights: ['age 26', 'end of the calendar month', 'domestic partner'],
    },
    {
      page: 3,
      heading: 'Section 3 — Premium Contributions',
      text: 'The Company contributes 80% of the employee-only premium for medical coverage. Employees are responsible for 20% of the premium and 100% of the additional cost for dependent coverage.',
      highlights: ['80% of the employee-only premium', '20% of the premium', '100% of the additional cost'],
    },
  ],
  'Eligibility Policy': [
    {
      page: 1,
      heading: 'Eligibility Standards',
      text: 'Employees classified as Full-Time (FT), working 30 or more hours per week on a regular basis, are eligible for group benefits. Part-time and seasonal employees are not eligible.',
      highlights: ['Full-Time (FT)', '30 or more hours per week', 'Part-time and seasonal employees are not eligible'],
    },
    {
      page: 2,
      heading: 'Waiting Period — Conflict Note',
      text: 'Benefits become effective immediately upon hire for management-level employees. For all other eligible employees, coverage begins on the first of the month following 30 days of employment.',
      highlights: ['immediately upon hire', 'first of the month following 30 days'],
    },
  ],
  default: [
    {
      page: 1,
      heading: 'Document Overview',
      text: 'This document contains benefits plan specifications, eligibility criteria, rates, and integration requirements for the 2027 plan year. All provisions are subject to review and approval.',
      highlights: ['2027 plan year', 'eligibility criteria'],
    },
    {
      page: 2,
      heading: 'Key Terms',
      text: 'Covered Employee: Any employee who meets the eligibility requirements set forth in Section 1. Plan Year: January 1, 2027 through December 31, 2027.',
      highlights: ['eligibility requirements', 'January 1, 2027'],
    },
  ],
};

function getPages(doc: BenefitsDocument) {
  return DOC_PAGE_CONTENT[doc.documentType] ?? DOC_PAGE_CONTENT['default'];
}

const CONF_VARIANTS: Record<string, 'success' | 'warning' | 'error'> = {
  high: 'success',
  medium: 'warning',
  low: 'error',
};

function confidence(req: Requirement): { level: 'high' | 'medium' | 'low'; score: number } {
  // Deterministic mock based on req ID hash
  const n = req.requirementId.charCodeAt(req.requirementId.length - 1);
  if (n % 3 === 0) return { level: 'low', score: 60 + (n % 15) };
  if (n % 3 === 1) return { level: 'medium', score: 72 + (n % 18) };
  return { level: 'high', score: 91 + (n % 9) };
}

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-emerald-100 text-emerald-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  Review: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-blue-100 text-blue-700',
};

export default function DocumentReview({ doc, onClose }: { doc: BenefitsDocument; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const [showHighlights, setShowHighlights] = useState(true);
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [committed, setCommitted] = useState<Set<string>>(new Set());

  const pages = getPages(doc);
  const currentPage = pages[page]!;

  const { data: reqs = [], isLoading } = useQuery({
    queryKey: ['doc-reqs', doc.documentId],
    queryFn: () => fetchDocReqs(doc.documentId),
    staleTime: 60_000,
  });

  function commitReq(reqId: string) {
    setCommitted((prev) => new Set([...prev, reqId]));
  }

  const highConf = reqs.filter((r) => confidence(r).level === 'high');
  const medConf = reqs.filter((r) => confidence(r).level === 'medium');
  const lowConf = reqs.filter((r) => confidence(r).level === 'low');

  return (
    <div className="flex flex-col h-full" data-testid="document-review-workspace">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <FileText className="w-4 h-4 text-brand-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{doc.originalFilename}</p>
          <p className="text-xs text-gray-500">{doc.documentType} · {doc.pageCount ?? pages.length} pages</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.lifecycleState === 'COMPLETED' || doc.lifecycleState === 'REQUIREMENTS_GENERATED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {doc.lifecycleState}
        </span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* 3-panel workspace */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Panel 1: PDF Preview */}
        <div className="w-[34%] border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">PDF Preview</span>
            <button
              onClick={() => setShowHighlights((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showHighlights ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {showHighlights ? 'Highlights on' : 'Highlights off'}
            </button>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-5 min-h-48">
              <p className="text-[10px] text-gray-400 mb-3 font-mono">Page {page + 1} of {pages.length}</p>
              <h4 className="text-sm font-bold text-gray-800 mb-3">{currentPage.heading}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {showHighlights
                  ? highlightText(currentPage.text, currentPage.highlights)
                  : currentPage.text}
              </p>
            </div>
          </div>

          {/* Page nav */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">Page {page + 1} / {pages.length}</span>
            <button
              disabled={page === pages.length - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel 2: Extracted Content */}
        <div className="w-[33%] border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-white">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Extracted Content</span>
            <div className="flex gap-3 mt-1">
              <span className="text-[10px] text-gray-500">{doc.extractedRuleCount ?? 0} rules extracted</span>
              {(doc.conflictCount ?? 0) > 0 && (
                <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />{doc.conflictCount} conflicts
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {currentPage.highlights.map((h, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Extracted Clause</span>
                </div>
                <p className="text-xs text-amber-900 font-medium">"{h}"</p>
                <p className="text-[10px] text-amber-600 mt-1">Page {page + 1} · Auto-extracted by AI</p>
              </div>
            ))}
            {(doc.conflictCount ?? 0) > 0 && page === 1 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Conflict Detected</span>
                </div>
                <p className="text-xs text-red-800">
                  "Immediately upon hire" (this page) conflicts with "first of the month following 30 days" (Section 1).
                  These rules apply to different employee classes — AI flagged for human review.
                </p>
              </div>
            )}
            {(doc.ambiguityCount ?? 0) > 0 && page === 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Ambiguity Flagged</span>
                </div>
                <p className="text-xs text-purple-800">
                  Term "promptly" used in Section 1.3 without a defined time window. AI cannot extract a precise rule without clarification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: AI Findings */}
        <div className="w-[33%] flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-white flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Findings</span>
            <span className="ml-auto text-[10px] text-gray-400">{reqs.length} requirements</span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Confidence bands */}
              {[
                { label: 'High confidence (≥90%)', reqs: highConf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Needs review (70–89%)', reqs: medConf, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Manual required (<70%)', reqs: lowConf, color: 'text-red-600', bg: 'bg-red-50' },
              ].map(({ label, reqs: band, color, bg }) => band.length > 0 && (
                <div key={label}>
                  <div className={`px-3 py-1.5 ${bg} border-b border-gray-100`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {band.slice(0, 4).map((req) => {
                      const conf = confidence(req);
                      const isSelected = selectedReq === req.requirementId;
                      const isCommitted = committed.has(req.requirementId);
                      return (
                        <div
                          key={req.requirementId}
                          onClick={() => setSelectedReq(isSelected ? null : req.requirementId)}
                          className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-[10px] font-mono text-gray-400">{req.requirementId}</span>
                                <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
                                <span className={`text-[10px] font-bold ml-auto ${color}`}>{conf.score}%</span>
                              </div>
                              <p className="text-xs text-gray-800 leading-snug">{req.title}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{req.description}</p>
                              {isCommitted ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Committed to requirements
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); commitReq(req.requirementId); }}
                                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                                >
                                  Commit to Requirements →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Commit summary footer */}
          {committed.size > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-emerald-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">{committed.size} requirement{committed.size > 1 ? 's' : ''} committed</span>
                <button
                  onClick={() => setCommitted(new Set())}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function highlightText(text: string, highlights: string[]): React.ReactNode {
  if (!highlights.length) return text;
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase())
          ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}
