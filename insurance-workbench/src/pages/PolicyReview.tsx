import React from 'react';

interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  reviewDate: string;
  status: string;
  type: string;
  coverageAmount: number;
  premium: number;
  riskScore: number;
}

const PolicyReview: React.FC = () => {
  const policies: Policy[] = [
    {
      id: '1',
      policyNumber: 'POL-2023-001',
      clientName: 'John Smith',
      reviewDate: '2023-12-01',
      status: 'Pending Review',
      type: 'Term Life',
      coverageAmount: 500000,
      premium: 1200,
      riskScore: 72
    },
    {
      id: '2',
      policyNumber: 'POL-2023-002',
      clientName: 'Emma Johnson',
      reviewDate: '2023-12-02',
      status: 'Under Review',
      type: 'Whole Life',
      coverageAmount: 750000,
      premium: 2100,
      riskScore: 85
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Policy Review Queue</h1>
        <span className="text-sm text-gray-500">
        <p className="text-gray-500 mt-1">Review and process in-force life insurance applications</p>
        </span>
        <div className="flex gap-4">
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Term Life</option>
            <option>Whole Life</option>
            <option>Universal Life</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Pending Review</option>
            <option>Under Review</option>
            <option>Reviewed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{policy.policyNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{policy.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{policy.reviewDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    policy.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                    policy.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {policy.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{policy.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">${policy.coverageAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">${policy.premium.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      policy.riskScore >= 80 ? 'bg-green-500' :
                      policy.riskScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    {policy.riskScore}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyReview;
