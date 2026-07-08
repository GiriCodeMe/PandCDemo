import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ...existing code...
import { Button } from '../components/common/Button';

// Removed styled-components. Use Tailwind classes in JSX below.

interface Submission {
  id: string;
  title: string;
  applicant: string;
  status: 'completed' | 'pending' | 'in-progress';
  lastUpdated: string;
}

const TeamSubmissionsAI: React.FC = () => {
  const navigate = useNavigate();
  const [submissions] = useState<Submission[]>([
    {
      id: '1',
      title: 'Research Project Submission',
      applicant: 'John Doe',
      status: 'completed',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Grant Proposal',
      applicant: 'Jane Smith',
      status: 'in-progress',
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      title: 'Conference Paper',
      applicant: 'Alex Johnson',
      status: 'pending',
      lastUpdated: '2024-01-13'
    }
  ]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="m-0 text-2xl font-semibold text-gray-900">Team Submissions - with AI</h1>
        <Button size="small" variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>
      <div className="grid gap-4">
        {submissions.map((submission: Submission) => (
          <div
            key={submission.id}
            className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="m-0 mb-2 text-lg text-gray-900">{submission.title}</h3>
              <p className="m-0 text-gray-500">
                Submitted by {submission.applicant} • Last updated {submission.lastUpdated}
              </p>
            </div>
            <div className="bg-red-500">
  ...existing code...
</div>
            <div
              className={
                'ml-4 px-4 py-2 rounded font-bold ' +
                (submission.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : submission.status === 'in-progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600')
              }
            >
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSubmissionsAI;
