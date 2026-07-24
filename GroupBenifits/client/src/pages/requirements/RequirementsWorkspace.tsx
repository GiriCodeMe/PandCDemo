import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Cpu, Download, Filter, BookOpen, Scale, ChevronDown, ChevronUp, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { requirementsApi } from '../../api/documents';
import { Requirement, UserStory, BusinessRule } from '../../types';

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-red-100 text-red-700',
  P1: 'bg-orange-100 text-orange-700',
  P2: 'bg-yellow-100 text-yellow-700',
  P3: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-emerald-100 text-emerald-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  Review: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const ENFORCEMENT_COLORS: Record<string, string> = {
  MANDATORY: 'bg-red-100 text-red-700',
  RECOMMENDED: 'bg-amber-100 text-amber-700',
  OPTIONAL: 'bg-gray-100 text-gray-600',
};

const CATEGORIES = ['All', 'Document Upload', 'AI Extraction', 'Conflict Detection', 'AI Chat', 'Traceability', 'Security'];
const TABS = ['Requirements', 'User Stories', 'Business Rules', 'Conflicts'] as const;
type Tab = (typeof TABS)[number];

function RequirementRow({ req }: { req: Requirement }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400">{req.requirementId}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[req.priority] ?? 'bg-gray-100 text-gray-600'}`}>{req.priority}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{req.category}</span>
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">{req.title}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>Type: {req.type}</span>
            {req.sourceDocumentId && <span>Source: {req.sourceDocumentId}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-2 mb-1">
        <span className="text-[10px] font-mono font-bold text-gray-400">{story.storyId}</span>
        {story.priority && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[story.priority] ?? 'bg-gray-100 text-gray-600'}`}>{story.priority}</span>
        )}
      </div>
      <div className="text-sm font-semibold text-gray-900">{story.title}</div>
      <div className="text-xs text-brand-600 font-medium mt-1">As {story.userRole}</div>
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{story.narrative}</p>
      {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Acceptance Criteria</div>
          <ul className="space-y-0.5">
            {story.acceptanceCriteria.map((ac, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                {ac}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function BusinessRuleRow({ rule }: { rule: BusinessRule }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-2 mb-1">
        <span className="text-[10px] font-mono font-bold text-gray-400">{rule.ruleId}</span>
        {rule.enforcementLevel && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ENFORCEMENT_COLORS[rule.enforcementLevel] ?? 'bg-gray-100 text-gray-600'}`}>{rule.enforcementLevel}</span>
        )}
        {rule.category && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{rule.category}</span>}
      </div>
      <div className="text-sm font-semibold text-gray-900">{rule.title}</div>
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{rule.rule}</p>
      {rule.rationale && <p className="text-xs text-gray-400 mt-1 italic">{rule.rationale}</p>}
    </Card>
  );
}

interface ConflictItem {
  conflictId: string;
  description: string;
  severity: string;
  resolution: string;
}

function ConflictCard({ conflict }: { conflict: ConflictItem }) {
  return (
    <Card className={`p-4 border-l-4 ${conflict.severity === 'HIGH' ? 'border-l-red-400' : conflict.severity === 'MEDIUM' ? 'border-l-amber-400' : 'border-l-yellow-300'}`}>
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className={`w-4 h-4 ${conflict.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
        <span className="text-[10px] font-mono font-bold text-gray-400">{conflict.conflictId}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${conflict.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{conflict.severity}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{conflict.description}</p>
      <p className="text-xs text-gray-500 mt-1"><span className="font-semibold text-gray-700">Resolution:</span> {conflict.resolution}</p>
    </Card>
  );
}

export default function RequirementsWorkspace() {
  const [tab, setTab] = useState<Tab>('Requirements');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [generated, setGenerated] = useState(false);

  const { data: reqs = [], isLoading: reqLoading } = useQuery({
    queryKey: ['requirements', categoryFilter],
    queryFn: () => requirementsApi.list(categoryFilter === 'All' ? undefined : categoryFilter),
    staleTime: 30_000,
  });

  const generateMutation = useMutation({
    mutationFn: () => requirementsApi.generate('DOC-2027-0001'),
    onSuccess: () => setGenerated(true),
  });

  const genData = generateMutation.data;

  const userStories: UserStory[] = genData?.userStories ?? [];
  const businessRules: BusinessRule[] = genData?.businessRules ?? [];
  const conflicts: ConflictItem[] = genData?.conflicts ?? [];

  const exportJSON = () => {
    const data = { requirements: reqs, userStories, businessRules, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{reqs.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Requirements</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{userStories.length || '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">User stories</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{businessRules.length || '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Business rules</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{conflicts.length || '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Conflicts</div>
        </Card>
      </div>

      {/* AI Generate banner */}
      {!generated && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">AI Requirements Studio</div>
            <div className="text-xs text-gray-500 mt-0.5">Generate structured requirements, user stories, and business rules from your uploaded documents using AI.</div>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Zap className="w-4 h-4" />
            {generateMutation.isPending ? 'Generating...' : 'Generate from Documents'}
          </button>
        </div>
      )}

      {generated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex-1 text-sm text-emerald-800">
            <span className="font-semibold">AI generation complete.</span> {genData?.requirementsCount} requirements · {genData?.userStoriesCount} user stories · {genData?.businessRulesCount} business rules · {genData?.conflicts.length} conflicts detected
            <span className="ml-2 text-xs text-emerald-500">({genData?.processingTimeMs}ms · {genData?.model})</span>
          </div>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 text-xs font-medium border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t}
              {t === 'Conflicts' && conflicts.length > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{conflicts.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Requirements tab */}
      {tab === 'Requirements' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${categoryFilter === c ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {reqLoading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading requirements...</div>
          ) : reqs.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center">No requirements found for this filter.</div>
          ) : (
            <div className="space-y-2">
              {reqs.map((r) => <RequirementRow key={r.requirementId} req={r} />)}
            </div>
          )}
        </div>
      )}

      {/* User Stories tab */}
      {tab === 'User Stories' && (
        <div>
          {userStories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">Run AI generation to load user stories from your documents.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {userStories.map((s) => <UserStoryCard key={s.storyId} story={s} />)}
            </div>
          )}
        </div>
      )}

      {/* Business Rules tab */}
      {tab === 'Business Rules' && (
        <div>
          {businessRules.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Scale className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">Run AI generation to extract business rules from your documents.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businessRules.map((r) => <BusinessRuleRow key={r.ruleId} rule={r} />)}
            </div>
          )}
        </div>
      )}

      {/* Conflicts tab */}
      {tab === 'Conflicts' && (
        <div>
          {conflicts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">{generated ? 'No conflicts detected across documents.' : 'Run AI generation to detect conflicts between documents.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((c) => <ConflictCard key={c.conflictId} conflict={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
