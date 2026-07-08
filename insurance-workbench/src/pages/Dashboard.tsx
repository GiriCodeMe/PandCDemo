import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  name: string;
  type: string;
  amount: string;
  status: string;
  time: string;
}

interface RiskAssessment {
  category: string;
  count: number;
  status: string;
  details: string;
}

interface Metric {
  id: number;
  name: string;
  value: string;
  change: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}

const dashboardMetrics: Metric[] = [
  { 
    id: 1, 
    name: 'Pending Applications', 
    value: '8', 
    change: '+2',
    type: 'warning',
    icon: ClockIcon 
  },
  { 
    id: 2, 
    name: 'Approved Policies', 
    value: '15', 
    change: '+3',
    type: 'success',
    icon: CheckCircleIcon 
  },
  { 
    id: 3, 
    name: 'Medical Reviews', 
    value: '4', 
    change: '-1',
    type: 'info',
    icon: ExclamationCircleIcon 
  },
  { 
    id: 4, 
    name: 'Face Amount', 
    value: '$2.5M', 
    change: '+8%',
    type: 'success',
    icon: CurrencyDollarIcon 
  }
];

const recentApplications: Application[] = [
  {
    id: "APP001",
    name: "John Smith",
    type: "Term Life - 20 Year",
    amount: "$500,000",
    status: "Medical Review",
    time: "2 hours ago"
  },
  {
    id: "APP002",
    name: "Emma Davis",
    type: "Whole Life",
    amount: "$1,000,000",
    status: "Pending APS",
    time: "4 hours ago"
  },
  {
    id: "APP003",
    name: "Robert Wilson",
    type: "Universal Life",
    amount: "$750,000",
    status: "Simplified Issue",
    time: "Yesterday"
  }
];

const riskAssessments: RiskAssessment[] = [
  {
    category: "Medical History",
    count: 3,
    status: "Attention Required",
    details: "Cardiovascular findings"
  },
  {
    category: "Lifestyle Factors",
    count: 5,
    status: "Standard",
    details: "Non-tobacco, active lifestyle"
  },
  {
    category: "Family History",
    count: 2,
    status: "Review Required",
    details: "Early onset conditions"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  // --- Consolidated Task List for Underwriter ---
  interface UWTask {
    id: string;
    name: string;
    assignedTo: string;
    submissionId: string;
    status: string;
    dueDate: string;
    notes: string;
  }
  const uwTasks: UWTask[] = [
    {
      id: 't1',
      name: 'Review Medical Records',
      assignedTo: 'Dr. Sarah Johnson',
      submissionId: 'SUB-2025-010',
      status: 'In Progress',
      dueDate: '2025-09-20',
      notes: 'Check for hypertension and diabetes history.'
    },
    {
      id: 't2',
      name: 'Financial Assessment',
      assignedTo: 'Mike Chen',
      submissionId: 'SUB-2025-011',
      status: 'Pending',
      dueDate: '2025-09-22',
      notes: 'Verify income and bank statements.'
    },
    {
      id: 't3',
      name: 'Contact Applicant',
      assignedTo: 'Jane Doe',
      submissionId: 'SUB-2025-012',
      status: 'Completed',
      dueDate: '2025-09-18',
      notes: 'Confirm travel history.'
    }
  ];
  const [selectedTask, setSelectedTask] = React.useState<UWTask | null>(null);

  function getAIGuidance(task: UWTask | null): string {
    if (!task) return "";
    if (task.name.toLowerCase().includes("medical")) return "Review applicant's medical history for chronic conditions and recent lab results.";
    if (task.name.toLowerCase().includes("financial")) return "Verify income stability and check for any financial red flags.";
    if (task.name.toLowerCase().includes("contact")) return "Confirm applicant's contact details and clarify any missing information.";
    return "No specific AI guidance available for this task.";
  }

  const DashboardCard = ({ metric }: { metric: Metric }) => {
    const typeColors = {
      success: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      danger: 'text-red-600 bg-red-50',
      info: 'text-blue-600 bg-blue-50'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-2 ${typeColors[metric.type]}`}>
            <metric.icon className="h-5 w-5" />
          </div>
          <span className={`text-xs font-semibold ${
            metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {metric.change}
          </span>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-bold text-gray-900">{metric.value}</h3>
          <p className="text-xs text-gray-500">{metric.name}</p>
        </div>
      </div>
    );
  };

  // Task list state for pagination, sorting, filtering
  const [taskPage, setTaskPage] = useState(1);
  const [taskSort, setTaskSort] = useState<{ key: keyof UWTask; direction: 'asc' | 'desc' }>({ key: 'dueDate', direction: 'asc' });
  const [taskFilter, setTaskFilter] = useState('');
  const pageSize = 10;

  // Sorting logic
  const sortedTasks = [...uwTasks]
    .filter(task =>
      task.name.toLowerCase().includes(taskFilter.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(taskFilter.toLowerCase()) ||
      task.status.toLowerCase().includes(taskFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (a[taskSort.key] < b[taskSort.key]) return taskSort.direction === 'asc' ? -1 : 1;
      if (a[taskSort.key] > b[taskSort.key]) return taskSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  const paginatedTasks = sortedTasks.slice((taskPage - 1) * pageSize, taskPage * pageSize);
  const totalPages = Math.ceil(sortedTasks.length / pageSize);

  return (
    <div className="max-w-[95%] mx-auto">
            {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Your task summary to process insurance applications</p>
          </div>

      </div>
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {dashboardMetrics.map(metric => (
          <DashboardCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* --- Underwriter Task List --- */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">My Task List</h2>
        <div className="mb-2 flex justify-between items-center">
          <input
            type="text"
            className="border rounded px-2 py-1 text-xs w-48"
            placeholder="Filter tasks..."
            value={taskFilter}
            onChange={e => { setTaskFilter(e.target.value); setTaskPage(1); }}
          />
          <div>
            <button
              className="px-2 py-1 text-xs bg-gray-100 rounded mr-1"
              disabled={taskPage === 1}
              onClick={() => setTaskPage(taskPage - 1)}
            >Prev</button>
            <span className="text-xs mx-1">Page {taskPage} of {totalPages}</span>
            <button
              className="px-2 py-1 text-xs bg-gray-100 rounded"
              disabled={taskPage === totalPages}
              onClick={() => setTaskPage(taskPage + 1)}
            >Next</button>
          </div>
        </div>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {/* Add Submission ID column header */}
              {['name','assignedTo','submissionId','dueDate','status','notes'].map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 text-left font-medium text-gray-500 cursor-pointer select-none"
                  onClick={() => {
                    setTaskSort(prev => ({
                      key: col as keyof UWTask,
                      direction: prev.key === col ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
                    }));
                  }}
                >
                  {col === 'name' ? 'Task' :
                   col === 'assignedTo' ? 'Assigned' :
                   col === 'submissionId' ? 'Submission ID' :
                   col === 'dueDate' ? 'Due' :
                   col === 'status' ? 'Status' :
                   col === 'notes' ? 'Summary' : col}
                  {taskSort.key === col && (taskSort.direction === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map(task => (
              <tr
                key={task.id}
                className="border-b hover:bg-blue-50 cursor-pointer"
                onClick={() => navigate(`/dashboard/submissions/${task.submissionId}?task=${task.id}`)}
              >
                <td className="px-2 py-1 font-medium text-gray-900">{task.name}</td>
                <td className="px-2 py-1 text-gray-500">{task.assignedTo}</td>
                {/* Submission ID column with link */}
                <td className="px-2 py-1">
                  <a
                    href={`/dashboard/submissions/${task.submissionId}`}
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={e => e.stopPropagation()}
                  >
                    {task.submissionId}
                  </a>
                </td>
                <td className="px-2 py-1 text-gray-500">{task.dueDate}</td>
                <td className="px-2 py-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-2 py-1 text-gray-700">{task.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Recent Applications</h2>
          <div className="space-y-2">
            {recentApplications.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <h3 className="text-xs font-medium text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.type} - {item.amount}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Risk Assessment Summary</h2>
          <div className="space-y-2">
            {riskAssessments.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <h3 className="text-xs font-medium text-gray-900">{item.category}</h3>
                  <p className="text-xs text-gray-500">{item.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">{item.count} Cases</p>
                  <p className="text-xs text-blue-600">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
