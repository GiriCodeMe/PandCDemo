import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Claim {
  id: string;
  claimant: string;
  type: string;
  status: string;
  receivedDate: string;
  amount: number;
  policyNumber: string;
  summary: string;
  assignedTo?: string;
  priority?: string;
  channel?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
}

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'In Review': 'bg-purple-100 text-purple-800',
  'Pending Docs': 'bg-red-100 text-red-800',
  'Approved': 'bg-green-100 text-green-800',
  'Paid': 'bg-green-100 text-green-800',
};

const currentUser = {
  id: 'CLM001',
  name: 'Jane Adjuster',
  team: 'Claims Team A'
};

const ClaimsWorkQueue: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Claim>('receivedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignment, setFilterAssignment] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const claimsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    import('../data/claimsQueue.json').then((mod) => setClaims(mod.default.map((c: any) => ({
      ...c,
      assignedTo: c.assignedTo || '',
      priority: c.priority || 'Medium',
      channel: c.channel || 'Agent',
      lastUpdatedBy: c.lastUpdatedBy || 'System',
      lastUpdatedDate: c.lastUpdatedDate || c.receivedDate,
    }))));
  }, []);

  const filteredClaims = claims
    .filter((claim: Claim) => {
      const matchesSearch =
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.policyNumber && claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || claim.priority === filterPriority;
      const matchesAssignment =
        filterAssignment === 'all' ? true :
        filterAssignment === 'mine' ? claim.assignedTo === currentUser.name :
        filterAssignment === 'unassigned' ? !claim.assignedTo :
        true;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
    })
    .sort((a: Claim, b: Claim) => {
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

  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * claimsPerPage,
    currentPage * claimsPerPage
  );

  const handleAssignSelected = () => {
    const newAssignments = Array.from(selectedClaims).map((id: string) => {
      const claim = claims.find((c: Claim) => c.id === id);
      if (claim) {
        return {
          ...claim,
          assignedTo: currentUser.name,
          lastUpdatedBy: currentUser.name,
          lastUpdatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return null;
    }).filter(Boolean);
    // In a real app, you would make an API call here
    // For now, we'll just log the assignments
    console.log('Assigning claims:', newAssignments);
    setSelectedClaims(new Set());
  };

  return (
    <div className="max-w-[95%] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Claims Work Queue</h1>
            <p className="text-gray-500 mt-1">Review and process new claims</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{filteredClaims.length}</span> claims found
            </p>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                selectedClaims.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedClaims.size === 0}
              onClick={handleAssignSelected}
            >
              Assign Selected ({selectedClaims.size})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Search by ID, Claimant, or Policy..."
              className="w-full rounded-lg border-gray-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border-gray-300 text-sm"
              value={filterAssignment}
              onChange={(e) => setFilterAssignment(e.target.value as 'all' | 'mine' | 'unassigned')}
            >
              <option value="all">All Assignments</option>
              <option value="mine">Assigned to Me</option>
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
              <option value="In Review">In Review</option>
              <option value="Pending Docs">Pending Docs</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
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
                setSortField(field as keyof Claim);
                setSortDirection(direction as 'asc' | 'desc');
              }}
            >
              <option value="receivedDate-desc">Received (Newest First)</option>
              <option value="receivedDate-asc">Received (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="claimant-asc">Claimant (A-Z)</option>
              <option value="claimant-desc">Claimant (Z-A)</option>
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
                          paginatedClaims.length > 0 &&
                          paginatedClaims.every((claim: Claim) =>
                            claim.assignedTo ||
                            selectedClaims.has(claim.id)
                          )
                        }
                        onChange={(e) => {
                          const newSelected = new Set(selectedClaims);
                          if (e.target.checked) {
                            paginatedClaims
                              .filter((c: Claim) => !c.assignedTo)
                              .forEach((c: Claim) => newSelected.add(c.id));
                          } else {
                            paginatedClaims
                              .forEach((c: Claim) => newSelected.delete(c.id));
                          }
                          setSelectedClaims(newSelected);
                        }}
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimant</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClaims.map((claim: Claim) => (
                    <tr
                      key={claim.id}
                      className={`hover:bg-gray-50 ${claim.assignedTo ? 'bg-gray-50' : ''}`}
                      onClick={() => navigate(`/claims/${claim.id}`)}
                    >
                      <td className="relative w-8 px-3 sm:w-12 sm:px-4">
                        <input
                          type="checkbox"
                          className="absolute left-3 top-1/2 -mt-1.5 h-3 w-3 rounded border-gray-300"
                          disabled={!!claim.assignedTo}
                          checked={selectedClaims.has(claim.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedClaims);
                            if (e.target.checked) {
                              newSelected.add(claim.id);
                            } else {
                              newSelected.delete(claim.id);
                            }
                            setSelectedClaims(newSelected);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="font-medium text-gray-900">{claim.id}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.claimant}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.type}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full ${statusColors[claim.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.receivedDate}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">${claim.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.policyNumber}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full ${priorityColors[claim.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-700'}`}>
                          {claim.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.assignedTo || 'Unassigned'}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap cursor-pointer">
                        <div className="text-gray-900">{claim.lastUpdatedDate}</div>
                        <div className="text-gray-500">by {claim.lastUpdatedBy}</div>
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
                      Showing <span className="font-medium">{((currentPage - 1) * claimsPerPage) + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * claimsPerPage, filteredClaims.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredClaims.length}</span> results
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
                              <span key={pageNumber} className="px-2 py-2 text-gray-400">...</span>
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
};

export default ClaimsWorkQueue;
