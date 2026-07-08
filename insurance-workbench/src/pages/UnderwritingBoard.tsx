import React, { useState } from 'react';
import { ApplicationData } from './SubmissionDetail/types';
import CaseSidePanel from './CaseSidePanel';
import submissions from '../data/submissions.json';

// Buckets for Kanban board
const BUCKETS = [
  { key: 'intake', label: 'Intake' },
  { key: 'ehr', label: 'EHR Review' },
  { key: 'mibmvr', label: 'MIB/MVR' },
  { key: 'lab', label: 'Lab/APS/Paramed' },
  { key: 'decision', label: 'Decision' }
];

// Masked summary for HIPAA compliance
function getSummary(app: ApplicationData) {
  return {
    initials: app.applicantName ? app.applicantName.split(' ').map(n => n[0]).join('') : '',
    age: app.dateOfBirth ? new Date().getFullYear() - parseInt(app.dateOfBirth.split('-')[0]) : '',
    coverageAmount: app.coverageAmount,
    product: app.policyType,
    status: app.status,
    priority: app.priority,
    aiScore: app.aiRiskAnalysis?.propensityScore ?? Math.floor(Math.random() * 100),
  };
}

const bucketForApp = (app: ApplicationData) => {
  // Simple logic: status maps to bucket
  if (app.status === 'New' || app.status === 'Pending Review') return 'intake';
  if (app.status === 'EHR Review') return 'ehr';
  if (app.status === 'MIB/MVR') return 'mibmvr';
  if (app.status === 'Lab' || app.status === 'APS' || app.status === 'Paramed') return 'lab';
  if (app.status === 'Ready for Decision' || app.status === 'Completed') return 'decision';
  return 'intake';
};

const UnderwritingBoard: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  return (
    <div className="flex h-screen">
      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
        {BUCKETS.map(bucket => (
          <div key={bucket.key} className="bg-gray-50 rounded-lg shadow w-64 min-h-[60vh] flex flex-col">
            <div className="p-3 font-bold text-xs text-gray-700 border-b">{bucket.label}</div>
            <div className="flex-1 p-2 space-y-2">
              {submissions.filter(app => bucketForApp(app) === bucket.key).map(app => {
                const summary = getSummary(app);
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded shadow p-3 cursor-pointer border hover:border-blue-500"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-blue-700">{summary.initials}</span>
                      <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">{summary.aiScore}</span>
                    </div>
                    <div className="text-xs text-gray-600">Age: {summary.age}</div>
                    <div className="text-xs text-gray-600">Coverage: {summary.coverageAmount}</div>
                    <div className="text-xs text-gray-600">Product: {summary.product}</div>
                    <div className="text-xs text-gray-600">Priority: {summary.priority}</div>
                    <div className="text-xs text-gray-600">Status: {summary.status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Side Panel */}
      {selectedApp && (
        <CaseSidePanel applicationData={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
};

export default UnderwritingBoard;
