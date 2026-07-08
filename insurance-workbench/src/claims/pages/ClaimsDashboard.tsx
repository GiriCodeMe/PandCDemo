import React, { useState } from 'react';
import {
	ChartBarIcon,
	DocumentIcon,
	UsersIcon,
	ClockIcon,
	CheckCircleIcon,
	ExclamationCircleIcon,
	CurrencyDollarIcon,
	HeartIcon
} from '@heroicons/react/24/outline';

interface ClaimTask {
	id: string;
	name: string;
	assignedTo: string;
	claimId: string;
	status: string;
	dueDate: string;
	notes: string;
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
		name: 'Pending Claims',
		value: '12',
		change: '+3',
		type: 'warning',
		icon: ClockIcon
	},
	{
		id: 2,
		name: 'Approved Claims',
		value: '22',
		change: '+4',
		type: 'success',
		icon: CheckCircleIcon
	},
	{
		id: 3,
		name: 'Medical Reviews',
		value: '5',
		change: '-1',
		type: 'info',
		icon: ExclamationCircleIcon
	},
	{
		id: 4,
		name: 'Total Paid',
		value: '$1.8M',
		change: '+5%',
		type: 'success',
		icon: CurrencyDollarIcon
	}
];

const claimTasks: ClaimTask[] = [
	{
		id: 'ct1',
		name: 'Review Medical Records',
		assignedTo: 'Dr. Jane Smith',
		claimId: 'CLM-2025-001',
		status: 'In Progress',
		dueDate: '2025-10-03',
		notes: 'Check for pre-existing conditions.'
	},
	{
		id: 'ct2',
		name: 'Contact Claimant',
		assignedTo: 'Mike Chen',
		claimId: 'CLM-2025-002',
		status: 'Pending',
		dueDate: '2025-10-05',
		notes: 'Request additional documentation.'
	},
	{
		id: 'ct3',
		name: 'Financial Assessment',
		assignedTo: 'Sarah Johnson',
		claimId: 'CLM-2025-003',
		status: 'Completed',
		dueDate: '2025-09-29',
		notes: 'Verify income and employment.'
	}
];

const ClaimsDashboard: React.FC = () => {
	const [selectedTask, setSelectedTask] = useState<ClaimTask | null>(null);
	const [taskPage, setTaskPage] = useState(1);
	const [taskSort, setTaskSort] = useState<{ key: keyof ClaimTask; direction: 'asc' | 'desc' }>({ key: 'dueDate', direction: 'asc' });
	const [taskFilter, setTaskFilter] = useState('');
	const pageSize = 10;

	const sortedTasks = [...claimTasks]
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

	function getAIGuidance(task: ClaimTask | null): string {
		if (!task) return "";
		if (task.name.toLowerCase().includes("medical")) return "Review claimant's medical history for chronic conditions and recent lab results.";
		if (task.name.toLowerCase().includes("financial")) return "Verify income stability and check for any financial red flags.";
		if (task.name.toLowerCase().includes("contact")) return "Confirm claimant's contact details and clarify any missing information.";
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

	return (
		<div className="max-w-[95%] mx-auto">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Claims Dashboard</h1>
						<p className="text-gray-500 mt-1">Your task summary to process insurance claims</p>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
				{dashboardMetrics.map(metric => (
					<DashboardCard key={metric.id} metric={metric} />
				))}
			</div>
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
							{['name','assignedTo','dueDate','status','notes'].map((col) => (
								<th
									key={col}
									className="px-2 py-1 text-left font-medium text-gray-500 cursor-pointer select-none"
									onClick={() => {
										setTaskSort(prev => ({
											key: col as keyof ClaimTask,
											direction: prev.key === col ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
										}));
									}}
								>
									{col === 'name' ? 'Task' :
									 col === 'assignedTo' ? 'Assigned' :
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
								onClick={() => window.location.href = `/claims/${task.claimId}?task=${task.id}`}
							>
								<td className="px-2 py-1 font-medium text-gray-900">{task.name}</td>
								<td className="px-2 py-1 text-gray-500">{task.assignedTo}</td>
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
		</div>
	);
};

export default ClaimsDashboard;
