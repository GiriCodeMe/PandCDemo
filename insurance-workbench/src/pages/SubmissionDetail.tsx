import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AIPrompt } from '../types';
import submissions from '../data/submissions.json';
import DocumentViewer from '../components/DocumentViewer';

// Helper to generate next best action if not present in JSON
function getNextBestAction(applicationData: any): string {
  const pendingReqs = (applicationData.details && applicationData.details.requirements)
    ? applicationData.details.requirements.filter((r: any) => r.status === 'Pending')
    : [];
  if (pendingReqs.length > 0) {
    return `Request documentation or follow up for: ${pendingReqs.map((r: any) => r.name).join(', ')}.`;
  }
  const highRisk = (applicationData.aiRiskAnalysis && applicationData.aiRiskAnalysis.riskFactors)
    ? applicationData.aiRiskAnalysis.riskFactors.find((rf: any) => rf.impact === 'High')
    : null;
  if (highRisk) {
    return `Evaluate risk: ${highRisk.category} - ${highRisk.description}`;
  }
  const allReceived = (applicationData.details && applicationData.details.requirements && applicationData.details.requirements.length > 0)
    ? applicationData.details.requirements.every((r: any) => r.status === 'Received')
    : false;
  if (allReceived && (applicationData.aiRiskAnalysis?.score ?? 0) > 80) {
    return 'All requirements received and risk is low. Submit a decision.';
  }
  return 'Review case details and determine next steps.';
}


interface Note {
  id: number;
  category: string;
  document: { id: string; name: string } | null;
  text: string;
  isEdited: boolean;
  lastEditedAt: string;
}
interface SubmissionDocument {
  type: string;
  received: boolean;
  required: boolean;
  date?: string;
  summary?: string;
  status?: string;
  name?: string;
  documentNumber?: string;
  [key: string]: any;
}
interface ApplicationData {
  id: string;
  applicantName: string;
  policyType: string;
  coverageAmount: string;
  status?: string;
  priority?: string;
  submittedDate?: string;
  occupation?: string;
  annualIncome?: string;
  dateOfBirth?: string;
  coverageTerm?: string;
  additionalInfo?: string;
  details?: {
    notes?: Note[];
    medicalConditions?: any[];
    labResults?: any[];
    financialOverview?: any;
    lifestyle?: string;
    familyHistory?: any[];
  };
  documents?: SubmissionDocument[];
  tasks?: any[];
}


function SubmissionDetail() {
  // Get submission ID from route params
  const { id } = useParams<{ id: string }>();
  // Find the correct record by ID from JSON
  const applicationData = submissions.find((record: any) => record.id === id);

  // State for notes and related handlers
  const [notes, setNotes] = useState<Note[]>(
    applicationData && applicationData.details?.notes
      ? applicationData.details.notes.map((n: any) => ({
          id: typeof n.id === 'number' ? n.id : Date.now(),
          category: n.category || '',
          document: n.document || null,
          text: n.text || '',
          isEdited: n.isEdited || false,
          lastEditedAt: n.lastEditedAt || new Date().toISOString(),
        }))
      : []
  );
  const [showAIPrompts, setShowAIPrompts] = useState(false);
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<'Case' | 'Document'>('Case');
  const [selectedDocumentForNote, setSelectedDocumentForNote] = useState<{ id: string; name: string } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showCommunication, setShowCommunication] = useState(false);
  const [communicationType, setCommunicationType] = useState<'internal' | 'broker'>('internal');
  const [messageText, setMessageText] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const aiPrompts: AIPrompt[] = [
    {
      id: '1',
      category: 'Medical',
      prompt: 'Summarize the medical condition and its impact on risk assessment',
      description: 'Creates a concise summary of medical conditions and their underwriting implications'
    },
    {
      id: '2',
      category: 'Financial',
      prompt: 'Analyze financial justification for coverage amount',
      description: 'Evaluates financial information to justify the requested coverage'
    },
    {
      id: '3',
      category: 'Requirements',
      prompt: 'List missing requirements and their impact',
      description: 'Identifies missing requirements and explains their importance'
    }
  ];

  // Map notes to correct type for category
  const initialNotes: Note[] = (applicationData?.details?.notes || []).map((n: any) => ({
    id: n.id || Date.now(),
    category: n.category || '',
    document: n.document || null,
    text: n.text || '',
    isEdited: n.isEdited || false,
    lastEditedAt: n.lastEditedAt || new Date().toISOString(),
  }));

  const handleAddNote = () => {
    setNotes([...notes, {
      id: Date.now(),
      category: selectedNoteCategory,
      document: selectedDocumentForNote,
      text: newNote,
      isEdited: false,
      lastEditedAt: new Date().toISOString(),
    }]);
    setNewNote('');
    setEditingNoteId(null);
    setSelectedDocumentForNote(null);
  };

  const handleUpdateNote = () => {
    setNotes(notes =>
      notes.map(note =>
        note.id === editingNoteId
          ? {
              ...note,
              text: newNote,
              isEdited: true,
              lastEditedAt: new Date().toISOString()
            }
          : note
      )
    );
    setNewNote('');
    setEditingNoteId(null);
    setSelectedDocumentForNote(null);
  };

  const handleApplyAIPrompt = (prompt: AIPrompt) => {
    setNewNote(prev => {
      const promptPrefix = `[${prompt.category}] ${prompt.prompt}:\n`;
      return prev ? `${prev}\n\n${promptPrefix}` : promptPrefix;
  });
  };

  const communications = {
    internal: [
      { from: 'Sarah Johnson', message: 'Please review financial documents carefully', date: '2025-09-07', type: 'internal' },
      { from: 'Mike Chen', message: 'Medical records show elevated BP', date: '2025-09-06', type: 'internal' }
    ],
    broker: [
      { from: 'John Smith', message: 'Additional bank statements attached', date: '2025-09-07', type: 'broker' },
      { from: 'UW Team', message: 'Please provide updated medical records', date: '2025-09-05', type: 'broker' }
    ]
  };

  const navigate = useNavigate();

  const tasks = [
    { name: 'Review Medical Records', assignedTo: 'Dr. Sarah Johnson', type: 'Internal', priority: 'High', dueDate: '2025-09-10', status: 'In Progress' },
    { name: 'Financial Assessment', assignedTo: 'Mike Chen', type: 'Internal', priority: 'Medium', dueDate: '2025-09-12', status: 'Not Started' },
    { name: 'Request Additional Lab Tests', assignedTo: 'Quest Diagnostics', type: 'External', priority: 'Medium', dueDate: '2025-09-15', status: 'Pending' }
  ];

  if (!applicationData) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Submission Not Found</h1>
        <p className="text-gray-500 mt-1">No data found for submission ID: {id}</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto">
      {/* Page Title and Back Navigation */}
      <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
      <p className="text-gray-500 mt-1">Review application details</p>
      <div className="flex items-center mb-4">
        <button
          className="mr-3 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-3 mb-4">
        <div className="flex justify-between items-start">
          <div className="grid grid-cols-3 gap-4 flex-grow mr-4">
            <div>
              <p className="text-xs text-gray-500">Applicant</p>
              <p className="text-sm font-medium">{applicationData.applicantName}</p>
              {/* Age not available in mock data */}
            </div>
            <div>
              <p className="text-xs text-gray-500">Product</p>
              <p className="text-sm font-medium">{applicationData.policyType}</p>
              {/* Term not available in mock data */}
            </div>
            <div>
              <p className="text-xs text-gray-500">Coverage Amount</p>
              <p className="text-sm font-medium">{applicationData.coverageAmount}</p>
              <p className="text-xs text-gray-500">ID: {applicationData.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select className="border rounded px-2 py-1.5 text-xs font-medium">
              <option value="standard">Standard</option>
              <option value="preferred">Preferred</option>
              <option value="substandard">Substandard</option>
              <option value="decline">Decline</option>
            </select>
            <button
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
              onClick={() => setShowDecisionModal(true)}
            >
              Submit Decision
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-2/3 space-y-4">
          {/* Tabs Section */}
          <div className="bg-white shadow-md rounded-lg mb-4">
            <div className="border-b">
              <nav className="flex">
                {['summary', 'medical', 'financial', 'lifestyle', 'documents', 'requirements', 'notes', 'history'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-xs font-normal ${
                      activeTab === tab
                        ? 'border-b-2 border-indigo-500 text-indigo-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4">
              {/* Tab content blocks, each wrapped in a parent <div> and closed with parentheses */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Applicant Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.applicantName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.dateOfBirth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Occupation</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.occupation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Annual Income</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.annualIncome || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Policy Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Product</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.policyType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Face Amount</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.coverageAmount || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Term</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.coverageTerm || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Additional Information</h3>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <p className="text-xs text-gray-500">General Info</p>
                          <p className="text-sm font-medium text-gray-900">{applicationData.additionalInfo || 'No additional information.'}</p>
                        </div>
                        <div className="w-1/2">
                          <p className="text-xs text-gray-500">Applicant Notes</p>
                          <p className="text-sm font-medium text-gray-900">{applicationData.applicantNotes || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Broker Notes</p>
                        <p className="text-sm font-medium text-gray-900">{applicationData.brokerNotes || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'medical' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Medical Conditions</h3>
                  <div className="bg-white border rounded-lg p-4 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Condition</th>
                          <th className="px-2 py-1 text-left">Diagnosed</th>
                          <th className="px-2 py-1 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(applicationData.details?.medicalConditions || []).map((row: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="px-2 py-1 text-sm text-gray-900">{row.condition}</td>
                            <td className="px-2 py-1 text-sm text-gray-900">{row.diagnosed}</td>
                            <td className="px-2 py-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Controlled' ? 'bg-green-100 text-green-700' : row.status === 'Uncontrolled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{row.status || 'N/A'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 mt-4">Lab Results</h3>
                  <div className="bg-white border rounded-lg p-4 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Test</th>
                          <th className="px-2 py-1 text-left">Result</th>
                          <th className="px-2 py-1 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(applicationData.details?.labResults || []).map((row: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="px-2 py-1 text-sm text-gray-900">{row.test}</td>
                            <td className="px-2 py-1 text-sm text-gray-900">{row.result}</td>
                            <td className="px-2 py-1 text-sm text-gray-900">{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="bg-white border rounded-xl shadow-lg p-6">
                    <h3 className="text-xs font-bold uppercase text-blue-600 mb-4 tracking-wide">Financial Overview</h3>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-700 mb-2">Assets</h4>
                        <ul className="space-y-1">
                          {(applicationData.details?.financialOverview?.assets || []).map((asset: any, idx: number) => (
                            <li key={idx} className="bg-white rounded px-3 py-1 text-sm text-blue-900 border border-blue-100 flex justify-between items-center">
                              <span>{asset.type}</span>
                              <span className="font-semibold">{asset.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <h4 className="text-xs font-bold text-red-700 mb-2">Liabilities</h4>
                        <ul className="space-y-1">
                          {(applicationData.details?.financialOverview?.liabilities || []).map((liab: any, idx: number) => (
                            <li key={idx} className="bg-white rounded px-3 py-1 text-sm text-red-900 border border-red-100 flex justify-between items-center">
                              <span>{liab.type}</span>
                              <span className="font-semibold">{liab.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="text-xs font-bold text-green-700 mb-2">Existing Coverage</h4>
                        <div className="text-sm text-green-900 font-bold">{applicationData.details?.financialOverview?.existingCoverage || 'N/A'}</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <h4 className="text-xs font-bold text-yellow-700 mb-2">Debt-to-Income Ratio</h4>
                        <div className="text-sm text-yellow-900 font-bold">{applicationData.details?.financialOverview?.debtToIncomeRatio || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-700 mb-2">Income Breakdown</h4>
                      <table className="min-w-full text-xs">
                        <tbody>
                          <tr>
                            <td className="py-1 pr-4 text-gray-500">Salary</td>
                            <td className="py-1 text-sm text-indigo-900 font-semibold">{applicationData.details?.financialOverview?.incomeBreakdown?.salary || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-500">Bonus</td>
                            <td className="py-1 text-sm text-indigo-900 font-semibold">{applicationData.details?.financialOverview?.incomeBreakdown?.bonus || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'lifestyle' && (
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Lifestyle Factors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">General</span>
                        <p className="text-sm text-gray-900">{applicationData.details?.lifestyle || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Hobbies</span>
                        <ul className="list-disc ml-4">
                          {(applicationData.details?.hobbies || []).map((hobby: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-900">{hobby}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Travel Frequency</span>
                        <p className="text-sm text-gray-900">{applicationData.details?.travelFrequency || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Alcohol Use</span>
                        <p className="text-sm text-gray-900">{applicationData.details?.alcoholUse || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Tobacco Use</span>
                        <p className="text-sm text-gray-900">{applicationData.details?.tobaccoUse || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4 overflow-x-auto">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Family History</h3>
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Relation</th>
                          <th className="px-2 py-1 text-left">Condition</th>
                          <th className="px-2 py-1 text-left">Age at Diagnosis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(applicationData.details?.familyHistory || []).map((row: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="px-2 py-1 text-sm text-gray-900">{row.relation}</td>
                            <td className="px-2 py-1 text-sm text-gray-900">{row.condition}</td>
                            <td className="px-2 py-1 text-sm text-gray-900">{row.ageAtDiagnosis ?? 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold uppercase text-gray-500">Available Documents</h3>
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
                      onClick={() => document.getElementById('doc-upload-input')?.click()}
                    >
                      Upload Document
                    </button>
                    <input
                      id="doc-upload-input"
                      type="file"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setUploadedDocs([...uploadedDocs, { id: `up_${Date.now()}`, name: file.name, type: file.type, date: new Date().toISOString().split('T')[0], status: 'Uploaded', summary: 'No summary available yet.' }]);
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                      {(applicationData.documents || []).map((docRaw, idx) => {
                        const doc = docRaw as SubmissionDocument;
                        return (
                          <div key={idx} className="border rounded p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-medium">{doc.type}</h4>
                                <p className="text-xs text-gray-500">{doc.received ? 'Received' : 'Pending'}</p>
                                <p className="text-xs text-gray-500">Date: <span className="text-sm text-gray-900">{'date' in doc ? doc.date : 'N/A'}</span></p>
                                <p className="text-xs text-gray-500">Summary: <span className="text-sm text-gray-900">{'summary' in doc ? doc.summary : 'N/A'}</span></p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${doc.received ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{doc.received ? 'Received' : 'Pending'}</span>
                                {doc.documentNumber ? (
                                  <a
                                    href={`https://business.deps.epam.com/view/${doc.documentNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium underline"
                                  >
                                    View Document
                                  </a>
                                ) : (
                                  <button onClick={() => setSelectedDocument(doc)} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">View Document</button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {uploadedDocs.map((doc, index) => (
                        <div key={index} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-medium">{doc.name}</h4>
                              <p className="text-xs text-gray-500">Uploaded on <span className="text-sm text-gray-900">{doc.date}</span></p>
                              <p className="text-xs text-gray-500">Summary: <span className="text-sm text-gray-900">{doc.summary || 'N/A'}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'Reviewed' ? 'bg-green-100 text-green-800' : doc.status === 'Uploaded' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{doc.status}</span>
                              <button onClick={() => setSelectedDocument(doc)} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">View Document</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                  </div>
              )}
              {activeTab === 'requirements' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Document Requirements</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(applicationData.details?.requirements || []).map((req: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border rounded-lg p-3">
                        <div>
                          <p className="text-xs font-medium">{req.name}</p>
                          <p className="text-xs text-gray-500">Due: <span className="text-sm text-gray-900">{req.dueDate || 'N/A'}</span></p>
                          <p className="text-xs text-gray-500">Source: <span className="text-sm text-gray-900">{req.source || 'N/A'}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${req.status === 'Received' ? 'bg-green-100 text-green-800' : req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{req.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-medium uppercase text-gray-500 mb-4">Case History</h3>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200"></div>
                    {/* Timeline Events */}
                    <div className="space-y-3">
                      {(applicationData.timelineEvents || []).map((event: any, idx: number) => (
                        <div key={event.id} className="relative flex">
                          {/* Timeline Dot */}
                          <div className="absolute left-0 w-5 h-full flex items-center justify-center">
                            <div className={`w-2.5 h-2.5 rounded-full border ${
                              event.type === 'document' ? 'bg-blue-100 border-blue-500' :
                              event.type === 'note' ? 'bg-green-100 border-green-500' :
                              event.type === 'status' ? 'bg-purple-100 border-purple-500' :
                              event.type === 'requirement' ? 'bg-yellow-100 border-yellow-500' :
                              'bg-indigo-100 border-indigo-500'
                            }`}></div>
                          </div>
                          <div className="ml-8 flex-1">
                            <div className="bg-white rounded border p-2.5 hover:shadow-sm transition-shadow">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-medium text-gray-900 truncate">{event.title || event.type}</h4>
                                    <div className="flex items-center gap-2 ml-2">
                                      {event.type === 'document' && event.documentName && (
                                        <button 
                                          className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                                        >
                                          View Document
                                        </button>
                                      )}
                                      {event.type === 'requirement' && event.status && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                          event.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                          event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {event.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {event.author || event.source || 'System'} • {event.date || event.timestamp?.split('T')[0] || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                  {event.category && (
                                    <span className="mt-1.5 inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      {event.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium uppercase text-gray-500">Case Notes</h3>
                    <button
                      onClick={() => setShowAIPrompts(!showAIPrompts)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
                    >
                      {showAIPrompts ? 'Hide AI Prompts' : 'Show AI Prompts'}
                    </button>
                  </div>

                  {showAIPrompts && (
                    <div className="mb-4 bg-indigo-50 p-4 rounded-lg">
                      <h4 className="text-xs font-medium text-indigo-900 mb-2">AI Writing Prompts</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {aiPrompts.map((prompt) => (
                          <button
                            key={prompt.id}
                            onClick={() => handleApplyAIPrompt(prompt)}
                            className="text-left p-2 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            <p className="text-xs font-medium text-indigo-700">{prompt.prompt}</p>
                            <p className="text-xs text-indigo-600">{prompt.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="mb-2">
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setSelectedNoteCategory('Case')}
                          className={`px-3 py-1.5 rounded text-xs font-medium ${
                            selectedNoteCategory === 'Case'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Case Note
                        </button>
                        <button
                          onClick={() => setSelectedNoteCategory('Document')}
                          className={`px-3 py-1.5 rounded text-xs font-medium ${
                            selectedNoteCategory === 'Document'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Document Note
                        </button>
                        {selectedNoteCategory === 'Document' && (
                          <select
                            className="border rounded px-2 py-1.5 text-xs font-medium"
                            value={selectedDocumentForNote?.id || ''}
                            onChange={e => {
                              const docId = e.target.value;
                              const doc = (applicationData.documents || []).map((d, idx) => ({ id: `doc${idx+1}`, name: d.type })).find(d => d.id === docId);
                              setSelectedDocumentForNote(doc || null);
                            }}
                          >
                            <option value="">Select Document...</option>
                            {(applicationData.documents || []).map((doc, idx) => (
                              <option key={doc.type} value={`doc${idx+1}`}>{doc.type}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        className="w-full border rounded-md p-2 text-xs"
                        rows={4}
                      />
                      <button
                        onClick={editingNoteId ? handleUpdateNote : handleAddNote}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium h-fit"
                      >
                        {editingNoteId ? 'Update Note' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(applicationData.details?.notes || []).map((note, idx) => (
                      <div key={note.id || idx} className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium">{note.category}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Tasks Section */}
          <div className="bg-white shadow-md rounded-lg mb-4">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                <button
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  Create Task
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Active Tasks</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Example static tasks, replace with dynamic data if available */}
                    {tasks.filter((task: any) => task.status !== 'Completed').map((task: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border rounded p-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{task.name}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${task.type === 'Internal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{task.type}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{task.priority}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-500">Assigned to: {task.assignedTo}</p>
                            <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Not Started' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* AI Risk Analysis Panel */}
        <div className="w-1/3">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xs font-medium uppercase text-gray-500 mb-3">AI Risk Analysis</h2>
            {/* Risk Score Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-500">Risk Score</h3>
                <span className="text-lg font-bold text-green-600">{applicationData.aiRiskAnalysis?.score ? `${applicationData.aiRiskAnalysis.score}/100` : 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${applicationData.aiRiskAnalysis?.score || 0}%` }}></div>
              </div>
            </div>
            {/* Risk Factors Section */}
            <div className="mb-4">
              <h3 className="text-xs font-medium uppercase text-gray-500 mb-2">Risk Factors</h3>
              {(applicationData.aiRiskAnalysis?.riskFactors || []).map((factor: any, idx: number) => (
                <div key={idx} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{factor.category}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${factor.impact === 'Low' ? 'bg-green-100 text-green-800' : factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{factor.impact} Impact</span>
                  </div>
                  <p className="text-xs text-gray-600">{factor.description}</p>
                </div>
              ))}
            </div>
            {/* Recommendation Section */}
            <div>
              <h3 className="text-xs font-medium uppercase text-gray-500 mb-2">AI Recommendation</h3>
              <div className="p-3 bg-indigo-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-700">{applicationData.aiRiskAnalysis?.recommendation || 'N/A'}</span>
                  <span className="text-xs text-indigo-600">
                    {applicationData.aiRiskAnalysis?.confidence ? `${applicationData.aiRiskAnalysis.confidence}% confidence` : ''}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-indigo-700">Risk Class: {applicationData.aiRiskAnalysis?.riskClass || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-indigo-700 mb-1">Key Factors:</p>
                  <ul className="list-disc list-inside text-xs text-indigo-600 space-y-0.5">
                    {(applicationData.aiRiskAnalysis?.keyFactors || []).map((reason: string, idx: number) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-indigo-700 mb-1">Additional Requirements:</p>
                  <ul className="list-disc list-inside text-xs text-indigo-600 space-y-0.5">
                    {(applicationData.aiRiskAnalysis?.additionalRequirements || []).map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                {/* Next Best Action Section */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-indigo-700 mb-1">Next Best Action</h4>
                  <div className="text-xs text-indigo-900 bg-indigo-100 rounded px-2 py-1">
                    {applicationData.aiRiskAnalysis?.nextBestAction
                      ? applicationData.aiRiskAnalysis.nextBestAction
                      : getNextBestAction(applicationData)}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
              onClick={() => setShowDecisionModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Submit Decision</h2>
            <form>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Decision</label>
                <select className="w-full border rounded px-2 py-1.5 text-xs font-medium">
                  <option value="approve">Approve</option>
                  <option value="decline">Decline</option>
                  <option value="request-info">Request More Info</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded px-2 py-1.5 text-xs font-medium" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded text-xs font-medium" onClick={() => setShowDecisionModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-medium">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
              onClick={() => setShowCreateTaskModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Create Task</h2>
            <form>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Task</label>
                <select className="w-full border rounded px-2 py-1.5 text-xs font-medium">
                  <option value="medical">Review Medical Records</option>
                  <option value="financial">Financial Assessment</option>
                  <option value="lab">Request Additional Lab Tests</option>
                  <option value="custom">Custom Task</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Assigned To</label>
                <input className="w-full border rounded px-2 py-1.5 text-xs font-medium" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded px-2 py-1.5 text-xs font-medium" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded text-xs font-medium" onClick={() => setShowCreateTaskModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// --- AI Guidance Helper ---
interface UWTask {
  id: string;
  name: string;
  assignedTo: string;
  submissionId: string;
  status: string;
  dueDate: string;
  notes: string;
}
function getAIGuidance(task: UWTask | null): string {
  if (!task) return "";
  if (task.status === "In Progress") {
    return "Continue gathering required documents and information. Consider following up with the applicant regarding pending items.";
  } else if (task.status === "Pending") {
    return "This task is pending review. Ensure all documents are complete and meet the underwriting guidelines.";
  } else if (task.status === "Completed") {
    return "The task has been completed. Review the notes and documents attached for any further action.";
  }
  return "";
}

export default SubmissionDetail;
