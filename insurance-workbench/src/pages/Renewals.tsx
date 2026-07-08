import React, { useState } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Renewal {
  id: string;
  policyHolder: string;
  policyNumber: string;
  currentCoverage: string;
  renewalDate: string;
  status: 'Pending Review' | 'Under Review' | 'Changes Requested' | 'Ready for Renewal';
  changeRequested: boolean;
  riskScore: number;
  claimHistory: {
    period: string;
    claims: number;
    amount: string;
  }[];
}

const sampleRenewals: Renewal[] = [
  {
    id: "REN-2025-001",
    policyHolder: "Thomas Anderson",
    policyNumber: "TL-2020-45678",
    currentCoverage: "$500,000",
    renewalDate: "2025-10-15",
    status: "Pending Review",
    changeRequested: true,
    riskScore: 85,
    claimHistory: [
      { period: "2024", claims: 0, amount: "$0" },
      { period: "2023", claims: 1, amount: "$5,000" }
    ]
  },
  {
    id: "REN-2025-002",
    policyHolder: "Maria Garcia",
    policyNumber: "WL-2019-34567",
    currentCoverage: "$750,000",
    renewalDate: "2025-09-30",
    status: "Under Review",
    changeRequested: false,
    riskScore: 92,
    claimHistory: [
      { period: "2024", claims: 0, amount: "$0" },
      { period: "2023", claims: 0, amount: "$0" }
    ]
  }
];

const statusColors = {
  'Pending Review': 'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-blue-100 text-blue-800',
  'Changes Requested': 'bg-red-100 text-red-800',
  'Ready for Renewal': 'bg-green-100 text-green-800'
};

export default function Renewals() {
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - match PolicyReview */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Policy Renewals</h1>
        <div className="flex gap-4">
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Pending Review</option>
            <option>Under Review</option>
            <option>Changes Requested</option>
            <option>Ready for Renewal</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Term Life</option>
            <option>Whole Life</option>
            <option>Universal Life</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Holder</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim History</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sampleRenewals.map((renewal) => (
              <tr key={renewal.id}>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{renewal.policyNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{renewal.policyHolder}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{renewal.renewalDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[renewal.status]}`}>
                    {renewal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">{renewal.currentCoverage}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      renewal.riskScore >= 80 ? 'bg-green-500' :
                      renewal.riskScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    {renewal.riskScore}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <ul>
                    {renewal.claimHistory.map((year) => (
                      <li key={year.period} className="flex justify-between">
                        <span>{year.period}:</span>
                        <span>{year.claims} claims</span>
                        <span>{year.amount}</span>
                      </li>
                    ))}
                  </ul>
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
}
