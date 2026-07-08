import React, { useState } from 'react';
import submissionsData from '../data/submissions.json';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon
} from '@heroicons/react/24/outline';

interface Submission {
  id: string;
  applicantName: string;
  policyType: string;
  coverageAmount: string;
  submittedDate: string;
  submissionChannel: string;
  priority: string;
  status: string;
  documents: {
    type: string;
    received: boolean;
    required: boolean;
  }[];
  assignedTo?: string;
  assignedDate?: string;
  team?: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  ageInDays: number;
  completeness: number;
  agentName: string;
  agentCode: string;
}
// Use imported submissionsData as the source of truth
const sampleSubmissions: Submission[] = submissionsData;

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Pending Review': 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Missing Documents': 'bg-red-100 text-red-800',
  'Ready for Decision': 'bg-green-100 text-green-800',
};


const currentUser = {
  id: 'UW001',
  name: 'John Smith',
  team: 'Team A'
};

export default function NewSubmissions() {
  const navigate = useNavigate();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Submission>('ageInDays');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // newest first
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignment, setFilterAssignment] = useState<'all' | 'mine' | 'team' | 'unassigned'>('all');
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 10;

  const handleAssignSelected = () => {
    const newAssignments = Array.from(selectedSubmissions).map((id: string) => {
      const submission = sampleSubmissions.find((s: Submission) => s.id === id);
      if (submission) {
        return {
          ...submission,
          assignedTo: currentUser.name,
          team: currentUser.team,
          lastUpdatedBy: currentUser.name,
          lastUpdatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return null;
    }).filter(Boolean);

    // In a real app, you would make an API call here
    // For now, we'll just log the assignments
    console.log('Assigning submissions:', newAssignments);
    setSelectedSubmissions(new Set());
  };

  const filteredSubmissions = sampleSubmissions
    .filter((submission: Submission) => {
      const matchesSearch = 
        submission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || submission.priority === filterPriority;
      // Assignment filter
      const matchesAssignment = 
        filterAssignment === 'all' ? true :
        filterAssignment === 'mine' ? submission.assignedTo === currentUser.name :
        filterAssignment === 'team' ? submission.team === currentUser.team :
        filterAssignment === 'unassigned' ? !submission.assignedTo :
        true;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
    })
    .sort((a: Submission, b: Submission) => {
      const field = sortField;
      const aValue = a[field];
      const bValue = b[field];
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction * aValue.localeCompare(bValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction * (aValue - bValue);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * submissionsPerPage,
    currentPage * submissionsPerPage
  );
// Generator function for dynamic sample submissions
function generateSampleSubmission(index: number): Submission {
  const priorities = ['High', 'Medium', 'Low'] as const;
  const statuses = ['New', 'Pending Review', 'In Progress', 'Missing Documents', 'Ready for Decision'] as const;
  const channels = ['Agent Portal', 'Mobile App', 'Web Form', 'Paper'] as const;
  const policyTypes = ['Term Life - 30 Year', 'Whole Life', 'Universal Life', 'Indexed UL'] as const;
  const applicantNames = [
    'Alex Johnson', 'Maria Garcia', 'John Smith', 'Emily Davis', 'Michael Brown',
    'Jessica Miller', 'David Lee', 'Sarah Wilson', 'Chris Martinez', 'Ashley Kim',
    'Daniel Clark', 'Sophia Lewis', 'Matthew Young', 'Olivia Hall', 'James Allen',
    'Emma King', 'Benjamin Wright', 'Ava Scott', 'Elijah Green', 'Mia Adams',
    'William Baker', 'Charlotte Nelson', 'Henry Carter', 'Amelia Mitchell', 'Jack Perez'
  ];
  const agentNames = [
    'David Thompson', 'Jennifer Lee', 'Michael Brown', 'Sarah Mitchell', 'John Smith',
    'Emily Davis', 'Chris Martinez', 'Ashley Kim', 'Daniel Clark', 'Sophia Lewis'
  ];
  const agentCodes = ['AG001', 'AG002', 'AG003', 'AG004', 'AG005', 'AG006', 'AG007', 'AG008', 'AG009', 'AG010'];

  const applicantIndex = index % applicantNames.length;
  const agentIndex = index % agentNames.length;
  const priority = priorities[index % priorities.length];
  const status = statuses[index % statuses.length];
  const channel = channels[index % channels.length];
  const policyType = policyTypes[index % policyTypes.length];
  const coverageAmount = `$${(250000 + (index * 10000)).toLocaleString()}`;
  const submittedDate = `2025-09-${(8 - (index % 7)).toString().padStart(2, '0')}`;
  const assigned = index % 3 === 0;
  const completeness = 40 + (index * 3) % 61;
  const ageInDays = index % 10;

  return {
    id: `SUB-2025-${(index + 1).toString().padStart(3, '0')}`,
    applicantName: applicantNames[applicantIndex],
    policyType,
    coverageAmount,
    submittedDate,
    submissionChannel: channel,
    priority,
    status,
    documents: [
      { type: 'Application Form', received: true, required: true },
      { type: 'Medical Exam', received: index % 2 === 0, required: true },
      { type: 'Medical Records', received: index % 4 !== 0, required: true },
      { type: 'Income Proof', received: index % 3 !== 0, required: true },
    ],
    assignedTo: assigned ? agentNames[agentIndex] : undefined,
    assignedDate: assigned ? submittedDate : undefined,
    team: assigned ? `Team ${String.fromCharCode(65 + (index % 3))}` : undefined,
    ageInDays,
    completeness,
    agentName: agentNames[agentIndex],
    agentCode: agentCodes[agentIndex],
    lastUpdatedBy: agentNames[agentIndex],
    lastUpdatedDate: submittedDate,
  };
}
  return (
    <div className="max-w-[95%] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Submissions</h1>
            <p className="text-gray-500 mt-1">Review and process new life insurance applications</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{filteredSubmissions.length}</span> submissions found
            </p>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                selectedSubmissions.size > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedSubmissions.size === 0}
              onClick={handleAssignSelected}
            >
              Assign Selected ({selectedSubmissions.size})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Search by ID, Applicant, or Agent..."
              className="w-full rounded-lg border-gray-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border-gray-300 text-sm"
              value={filterAssignment}
              onChange={(e) => setFilterAssignment(e.target.value as 'all' | 'mine' | 'team' | 'unassigned')}
            >
              <option value="all">All Assignments</option>
              <option value="mine">Assigned to Me</option>
              <option value="team">My Team</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-lg border-gray-300 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Missing Documents">Missing Documents</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready for Decision">Ready for Decision</option>
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-lg border-gray-300 text-sm"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-lg border-gray-300 text-sm"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as keyof Submission);
                setSortDirection(direction as 'asc' | 'desc');
              }}
            >
              <option value="ageInDays-desc">Age (Newest First)</option>
              <option value="ageInDays-asc">Age (Oldest First)</option>
              <option value="completeness-desc">Completeness (High to Low)</option>
              <option value="completeness-asc">Completeness (Low to High)</option>
              <option value="applicantName-asc">Applicant Name (A-Z)</option>
              <option value="applicantName-desc">Applicant Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-8 px-3 sm:w-12 sm:px-4">
                      <input
                        type="checkbox"
                        className="absolute left-3 top-1/2 -mt-2 h-3 w-3 rounded border-gray-300"
                        checked={
                          paginatedSubmissions.length > 0 &&
                          paginatedSubmissions.every((submission: Submission) => 
                            submission.assignedTo || 
                            selectedSubmissions.has(submission.id)
                          )
                        }
                        onChange={(e) => {
                          const newSelected = new Set(selectedSubmissions);
                          if (e.target.checked) {
                            paginatedSubmissions
                              .filter((s: Submission) => !s.assignedTo)
                              .forEach((s: Submission) => newSelected.add(s.id));
                          } else {
                            paginatedSubmissions
                              .forEach((s: Submission) => newSelected.delete(s.id));
                          }
                          setSelectedSubmissions(newSelected);
                        }}
                      />
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Policy Type</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Coverage</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell">Submitted</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Channel</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Complete</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Agent</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSubmissions.map((submission: Submission) => (
                    <tr 
                      key={submission.id}
                      className={`hover:bg-gray-50 ${submission.assignedTo ? 'bg-gray-50' : ''}`}
                    >
                      <td className="relative w-8 px-3 sm:w-12 sm:px-4">
                        <input
                          type="checkbox"
                          className="absolute left-3 top-1/2 -mt-1.5 h-3 w-3 rounded border-gray-300"
                          disabled={!!submission.assignedTo}
                          checked={selectedSubmissions.has(submission.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedSubmissions);
                            if (e.target.checked) {
                              newSelected.add(submission.id);
                            } else {
                              newSelected.delete(submission.id);
                            }
                            setSelectedSubmissions(newSelected);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="font-medium text-gray-900">{submission.id}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.applicantName}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden xl:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.policyType}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden lg:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.coverageAmount}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap md:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.submittedDate}</div>
                        <div className="text-gray-500">{submission.ageInDays}d ago</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden lg:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.submissionChannel}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full ${statusColors[submission.status as keyof typeof statusColors]}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden md:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full ${priorityColors[submission.priority as keyof typeof priorityColors]}`}>
                          {submission.priority}
                        </span>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden xl:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-blue-600 rounded-full h-1.5" 
                              style={{ width: `${submission.completeness}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-900">{submission.completeness}%</span>
                        </div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.assignedTo || 'Unassigned'}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden lg:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.agentName}</div>
                        <div className="text-gray-500">{submission.agentCode}</div>
                      </td>
                      <td 
                        className="px-3 py-2 whitespace-nowrap hidden md:table-cell cursor-pointer"
                        onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                      >
                        <div className="text-gray-900">{submission.lastUpdatedDate}</div>
                        <div className="text-gray-500">by {submission.lastUpdatedBy}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * submissionsPerPage) + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * submissionsPerPage, filteredSubmissions.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredSubmissions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">First</span>
                        «
                      </button>
                      <button
                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        ‹
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === currentPage;
                        const shouldShow = 
                          pageNumber === 1 || 
                          pageNumber === totalPages || 
                          Math.abs(pageNumber - currentPage) <= 1;

                        if (!shouldShow) {
                          if (pageNumber === 2 || pageNumber === totalPages - 1) {
                            return (
                              <span
                                key={`ellipsis-${pageNumber}`}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        ›
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Last</span>
                        »
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

