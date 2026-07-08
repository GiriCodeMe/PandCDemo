import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  casesAssigned: number;
  casesCompleted: number;
  averageProcessingTime: string;
  accuracyRate: number;
}

interface PerformanceMetric {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

const TeamPerformance: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Underwriter',
      casesAssigned: 45,
      casesCompleted: 42,
      averageProcessingTime: '2.5 days',
      accuracyRate: 98
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Underwriter',
      casesAssigned: 38,
      casesCompleted: 35,
      averageProcessingTime: '3.1 days',
      accuracyRate: 95
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      metric: 'Total Submissions Processed',
      value: '283',
      change: '+12%',
      trend: 'up'
    },
    {
      metric: 'Average Processing Time',
      value: '2.8 days',
      change: '-8%',
      trend: 'down'
    },
    {
      metric: 'Team Accuracy Rate',
      value: '96.5%',
      change: '+2.1%',
      trend: 'up'
    },
    {
      metric: 'Customer Satisfaction',
      value: '4.8/5.0',
      change: '+0.2',
      trend: 'up'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Team Performance Dashboard</h1>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm mb-2">{metric.metric}</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{metric.value}</p>
              <div className={`flex items-center ${
                metric.trend === 'up' ? 'text-green-500' :
                metric.trend === 'down' ? 'text-red-500' :
                'text-gray-500'
              }`}>
                {metric.change}
                {metric.trend === 'up' && (
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {metric.trend === 'down' && (
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Members Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Team Member Performance</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases Completed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Processing Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{member.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.casesAssigned}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.casesCompleted}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.averageProcessingTime}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      member.accuracyRate >= 95 ? 'bg-green-500' :
                      member.accuracyRate >= 90 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    {member.accuracyRate}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPerformance;
