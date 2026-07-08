import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ClaimDocument {
	name: string;
	received: boolean;
	required?: boolean;
	date?: string;
	summary?: string;
	status?: string;
	documentNumber?: string;
}

interface Claim {
	id: string;
	claimant: string;
	policyNumber: string;
	type: string;
	status: string;
	priority: string;
	receivedDate: string;
	incidentDate?: string;
	assignedTo?: string;
	team?: string;
	amount: number;
	channel?: string;
	summary?: string;
	alerts?: string[];
	nextAction?: string;
	notes?: string[];
	documents?: ClaimDocument[];
	lastUpdatedBy?: string;
	lastUpdatedDate?: string;
	aiAnalysis?: {
		score: number;
		riskClass: string;
		recommendation: string;
		confidence: number;
		riskFactors: { impact: string; description: string; }[];
		nextBestAction: string;
	};
}

const tabList = [
	'summary',
	'incident',
	'medical',
	'documents',
	'requirements',
	'notes',
	'history',
	'tasks',
];

const ClaimsDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [claim, setClaim] = useState<Claim | null>(null);
	const [activeTab, setActiveTab] = useState('summary');
	const [newNote, setNewNote] = useState('');
	const [notes, setNotes] = useState<string[]>([]);
	const [showDecisionModal, setShowDecisionModal] = useState(false);
	const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
	const [tasks, setTasks] = useState<any[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		import('../data/claimsQueue.json').then((mod) => {
			const foundRaw = mod.default.find((c: any) => c.id === id);
			if (!foundRaw) {
				setClaim(null);
				setNotes([]);
				return;
			}
			const raw: any = foundRaw;
			const found: Claim = {
				id: raw.id,
				claimant: raw.claimant,
				policyNumber: raw.policyNumber,
				type: raw.type,
				status: raw.status,
				priority: raw.priority || 'Medium',
				receivedDate: raw.receivedDate,
				incidentDate: raw.incidentDate || raw.receivedDate,
				assignedTo: raw.assignedTo || '',
				team: raw.team || 'Claims Team A',
				amount: raw.amount,
				channel: raw.channel || 'Agent',
				summary: raw.summary || '',
				alerts: raw.alerts || [],
				nextAction: raw.nextAction || 'Review claim and documents',
				notes: Array.isArray(raw.notes) ? raw.notes : [],
				documents: Array.isArray(raw.documents) ? raw.documents : [
					{ name: 'Claim Form', received: true, required: true },
					{ name: 'Proof of Loss', received: false, required: true },
					{ name: 'Medical Records', received: false, required: raw.type === 'Life' },
				],
				lastUpdatedBy: raw.lastUpdatedBy || 'System',
				lastUpdatedDate: raw.lastUpdatedDate || raw.receivedDate,
				aiAnalysis: raw.aiAnalysis || {
					score: 75,
					riskClass: 'Standard',
					recommendation: 'Proceed with standard review.',
					confidence: 90,
					riskFactors: [
						{ impact: 'Low', description: 'No prior claims' },
						{ impact: 'Medium', description: 'Recent policy issuance' }
					],
					nextBestAction: 'Request missing documents and schedule interview.'
				}
			};
			setClaim(found);
			setNotes(Array.isArray(found.notes) ? found.notes : []);
			setTasks([
				{ name: 'Review Documents', assignedTo: found.assignedTo || 'Unassigned', priority: found.priority, dueDate: found.receivedDate, status: 'In Progress' },
				{ name: 'Contact Claimant', assignedTo: found.assignedTo || 'Unassigned', priority: found.priority, dueDate: found.receivedDate, status: 'Not Started' },
			]);
		});
	}, [id]);

	if (!claim) {
		return (
			<div className="container mx-auto">
				<h1 className="text-2xl font-bold text-gray-900">Claim Not Found</h1>
				<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>Back to Work Queue</button>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			{/* Page Title and Back Navigation */}
			<h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
			<p className="text-gray-500 mt-1">Review claim details and take action</p>
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
							<p className="text-xs text-gray-500">Claimant</p>
							<p className="text-sm font-medium">{claim.claimant}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500">Product</p>
							<p className="text-sm font-medium">{claim.type}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500">Claim Amount</p>
							<p className="text-sm font-medium">${claim.amount.toLocaleString()}</p>
							<p className="text-xs text-gray-500">ID: {claim.id}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<select className="border rounded px-2 py-1.5 text-xs font-medium">
							<option value="standard">Standard</option>
							<option value="preferred">Preferred</option>
							<option value="escalated">Escalated</option>
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
								{tabList.map((tab) => (
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
										{tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
									</button>
								))}
							</nav>
						</div>
						<div className="p-4">
							{/* Tab content blocks */}
							{activeTab === 'summary' && (
								<div className="space-y-6">
									<div className="bg-gray-50 rounded-lg p-4 shadow-sm">
										<h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Claim Information</h3>
										<div className="grid grid-cols-2 gap-4">
											<div><span className="font-semibold">Status:</span> {claim.status}</div>
											<div><span className="font-semibold">Priority:</span> {claim.priority}</div>
											<div><span className="font-semibold">Received:</span> {claim.receivedDate}</div>
											<div><span className="font-semibold">Incident Date:</span> {claim.incidentDate}</div>
											<div><span className="font-semibold">Assigned To:</span> {claim.assignedTo || 'Unassigned'}</div>
											<div><span className="font-semibold">Team:</span> {claim.team}</div>
											<div><span className="font-semibold">Channel:</span> {claim.channel}</div>
											<div><span className="font-semibold">Policy #:</span> {claim.policyNumber}</div>
											<div><span className="font-semibold">Alerts:</span> {claim.alerts && claim.alerts.length > 0 ? claim.alerts.join(', ') : 'None'}</div>
											<div><span className="font-semibold">Next Action:</span> {claim.nextAction}</div>
										</div>
									</div>
									<div className="bg-gray-50 rounded-lg p-4 shadow-sm">
										<h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Summary</h3>
										<div>{claim.summary}</div>
									</div>
								</div>
							)}
							{activeTab === 'documents' && (
								<div>
									<div className="flex justify-between items-center mb-2">
										<h3 className="text-xs font-bold uppercase text-gray-500">Documents</h3>
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
												// ...handle upload...
											}}
										/>
									</div>
									<ul className="list-disc ml-6">
										{(claim.documents || []).map((doc, idx) => (
											<li key={idx} className={doc.received ? 'text-green-700' : 'text-red-700'}>
												{doc.name} {doc.received ? '(Received)' : '(Missing)'}
											</li>
										))}
									</ul>
								</div>
							)}
							   {/* financial tab removed */}
							{activeTab === 'medical' && (
								<div className="space-y-4">
									<h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Medical Information</h3>
									<div className="bg-white border rounded-lg p-4 overflow-x-auto">
										<span className="text-xs text-gray-700">(Medical details, conditions, and history go here.)</span>
									</div>
								</div>
							)}
							{activeTab === 'requirements' && (
								<div className="space-y-4">
									<h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Requirements</h3>
									<div className="grid grid-cols-1 gap-2">
										{(claim.documents || []).filter(doc => doc.required).map((req, idx) => (
											<div key={idx} className="flex items-center gap-2">
												<span className={req.received ? 'text-green-700' : 'text-red-700'}>
													{req.name} {req.received ? '(Received)' : '(Missing)'}
												</span>
											</div>
										))}
									</div>
								</div>
							)}
							{activeTab === 'notes' && (
								<div className="space-y-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-xs font-medium uppercase text-gray-500">Case Notes</h3>
									</div>
									<div className="mb-4">
										<div className="mb-2"></div>
										<div className="flex gap-2">
											<textarea
												value={newNote}
												onChange={(e) => setNewNote(e.target.value)}
												placeholder="Add a new note..."
												className="w-full border rounded-md p-2 text-xs"
												rows={4}
											/>
											<button
												className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
												onClick={() => {
													if (newNote.trim()) {
														setNotes(prev => [...prev, newNote]);
														setNewNote('');
													}
												}}
											>Add Note</button>
										</div>
									</div>
									<div className="space-y-3">
										{notes.map((note, idx) => (
											<div key={idx} className="mb-1 text-gray-700 bg-gray-50 rounded p-2 text-xs">{note}</div>
										))}
									</div>
								</div>
							)}
							{activeTab === 'history' && (
								<div className="space-y-4">
									<h3 className="text-xs font-medium uppercase text-gray-500 mb-4">Claim History</h3>
									<div className="relative">
										<div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200"></div>
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<span className="text-xs text-gray-700">{claim.receivedDate}: Claim received</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs text-gray-700">{claim.lastUpdatedDate}: Last updated by {claim.lastUpdatedBy}</span>
											</div>
										</div>
									</div>
								</div>
							)}
							{activeTab === 'tasks' && (
								<div className="space-y-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-xs font-medium uppercase text-gray-500">Tasks</h3>
										<button
											className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
											onClick={() => setShowCreateTaskModal(true)}
										>Create Task</button>
									</div>
									<div className="grid grid-cols-1 gap-2">
										{tasks.map((task, idx) => (
											<div key={idx} className="flex items-center gap-2 bg-gray-50 rounded p-2 text-xs">
												<span className="font-semibold">{task.name}</span>
												<span className="text-gray-500">Assigned to: {task.assignedTo}</span>
												<span className="text-gray-500">Due: {task.dueDate}</span>
												<span className="text-gray-500">Status: {task.status}</span>
											</div>
										))}
									</div>
								</div>
							)}
							   {/* ai-analysis tab removed */}
						</div>
					</div>
				</div>
				{/* AI Analysis Panel */}
				<div className="w-1/3">
					<div className="bg-white shadow-md rounded-lg p-4">
						<h2 className="text-xs font-medium uppercase text-gray-500 mb-3">AI Claim Analysis</h2>
						<div className="mb-4">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-xs font-medium text-gray-500">Risk Score</h3>
								<span className="text-lg font-bold text-green-600">{claim.aiAnalysis?.score ? `${claim.aiAnalysis.score}/100` : 'N/A'}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-1.5">
								<div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${claim.aiAnalysis?.score || 0}%` }}></div>
							</div>
						</div>
						<div className="mb-4">
							<h3 className="text-xs font-medium uppercase text-gray-500 mb-2">Risk Factors</h3>
							{(claim.aiAnalysis?.riskFactors || []).map((factor, idx) => (
								<div key={idx} className="mb-2 p-2 bg-gray-50 rounded">
									<div className="flex justify-between items-center mb-1">
										<span className="text-sm font-medium">{factor.description}</span>
										<span className={`px-1.5 py-0.5 rounded-full text-xs ${factor.impact === 'Low' ? 'bg-green-100 text-green-800' : factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}> {factor.impact} Impact</span>
									</div>
								</div>
							))}
						</div>
						<div>
							<h3 className="text-xs font-medium uppercase text-gray-500 mb-2">AI Recommendation</h3>
							<div className="p-3 bg-indigo-50 rounded">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-medium text-indigo-700">{claim.aiAnalysis?.recommendation || 'N/A'}</span>
									<span className="text-xs text-indigo-600">
										{claim.aiAnalysis?.confidence ? `${claim.aiAnalysis.confidence}% confidence` : ''}
									</span>
								</div>
								<div className="mb-2">
									<p className="text-xs font-medium text-indigo-700">Risk Class: {claim.aiAnalysis?.riskClass || 'N/A'}</p>
								</div>
								<div className="mb-2">
									<p className="text-xs font-medium text-indigo-700 mb-1">Key Factors:</p>
									<ul className="list-disc list-inside text-xs text-indigo-600 space-y-0.5">
										{(claim.aiAnalysis?.riskFactors || []).map((factor, idx) => (
											<li key={idx}>{factor.description}</li>
										))}
									</ul>
								</div>
								<div className="mb-2">
									<p className="text-xs font-medium text-indigo-700 mb-1">Additional Requirements:</p>
									<ul className="list-disc list-inside text-xs text-indigo-600 space-y-0.5">
										{/* Add requirements if any */}
									</ul>
								</div>
								{/* Next Best Action Section */}
								<div className="mt-4">
									<h4 className="text-xs font-bold text-indigo-700 mb-1">Next Best Action</h4>
									<div className="text-xs text-indigo-900 bg-indigo-100 rounded px-2 py-1">
										{claim.aiAnalysis?.nextBestAction}
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
									<option value="review-docs">Review Documents</option>
									<option value="contact-claimant">Contact Claimant</option>
									<option value="order-inspection">Order Inspection</option>
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
};

export default ClaimsDetail;
