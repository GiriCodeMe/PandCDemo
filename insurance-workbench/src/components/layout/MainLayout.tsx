import React, { useState, useRef } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import {
  BellIcon,
  PaperClipIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  BookOpenIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Outlet, NavLink } from "react-router-dom";


const navigation = [
  { name: "My Queue", href: "/dashboard", icon: HomeIcon },
  { name: "New Submissions", href: "/dashboard/submissions", icon: InboxIcon },
  { name: "Renewals", href: "/dashboard/renewals", icon: FolderIcon },
  { name: "Policy Review", href: "/dashboard/review", icon: BookOpenIcon },
  { name: "Team Performance", href: "/dashboard/team", icon: UsersIcon },
  { name: "Guidelines", href: "/dashboard/guidelines", icon: BookOpenIcon },
];

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const teamMembers = [
  {
    name: "Sarah Mitchell",
    role: "Senior Underwriter",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    status: "online",
    specialty: "High Risk Cases"
  },
  {
    name: "Michael Chen",
    role: "Senior Underwriter",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    status: "away",
    specialty: "Medical Underwriting"
  },
  {
    name: "Jessica Patel",
    role: "Junior Underwriter",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    status: "online",
    specialty: "Standard Cases"
  },
  {
    name: "David Kim",
    role: "Junior Underwriter",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    status: "offline",
    specialty: "Simplified Issue"
  }
];

const commonQuestions = [
  "How do I evaluate medical exam results for diabetes?",
  "What are the requirements for simplified issue life insurance?",
  "What is the impact of family history on life coverage?",
  "How to assess cardiovascular risk factors?",
  "What are the guidelines for tobacco vs non-tobacco rates?",
  "When should I request an APS?"
];

const quickLinks = [
  { name: "Medical Guidelines", href: "/medical" },
  { name: "Rate Tables", href: "/rates" },
  { name: "MIB Check", href: "/mib" },
  { name: "Rx History", href: "/rx" }
];


const agents = [
  { name: "Submissions", value: "submissions" },
  { name: "Review", value: "review" },
  { name: "Compliance", value: "compliance" },
  { name: "Risk Assessment", value: "risk" },
  { name: "Policy Admin", value: "policy" },
  { name: "Talk to Data", value: "data" },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPaneOpen, setRightPaneOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatPaneOpen, setChatPaneOpen] = useState(false);
  const [bottomPaneOpen, setBottomPaneOpen] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(agents[0].value);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedAction, setSelectedAction] = useState('ask'); // 'ask' is default
  // Mock chat conversation
  const [chatMessages, setChatMessages] = useState([
    { sender: "AI", text: "Hello! How can I help you today?" },
  ]);

  // Mock data for notifications
  const openAlerts = [
    { type: 'Missing Document', message: 'Missing Application Form', caseId: 'SUB-2025-002', date: '2025-09-08' },
    { type: 'Missing Data', message: 'Missing Applicant Date of Birth', caseId: 'SUB-2025-003', date: '2025-09-07' },
    { type: 'Missing Document', message: 'Missing Medical Exam', caseId: 'SUB-2025-004', date: '2025-09-06' },
  ];
  const openTasks = [
    { task: 'Review Medical Records', caseId: 'SUB-2025-002', due: '2025-09-10' },
    { task: 'Broker Follow Up', caseId: 'SUB-2025-003', due: '2025-09-12' },
    { task: 'Review Documents', caseId: 'SUB-2025-004', due: '2025-09-15' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700 z-10">
        <div className="flex items-center gap-4">
          <img src="/epamlogo.png" alt="EPAM Logo" className="h-6" />
          <NavLink to="/" className="focus:outline-none flex items-center">
            <img src="/workbenchlogo.png" alt="Workbench Logo" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
          </NavLink>
        </div>
        {/* Search Input */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full border border-gray-700 bg-gray-800 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-none"
              style={{ minWidth: 160, maxWidth: 240, fontWeight: 400, backgroundColor: '#23272f', borderColor: '#23272f' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="rounded-full p-2 hover:bg-gray-700" 
            onClick={() => { setChatPaneOpen(true); setRightPaneOpen(false); setNotificationsOpen(false); }}
            title="Open Chat"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-200" />
          </button>
          <button 
            className="rounded-full p-2 hover:bg-gray-700" 
            onClick={() => { setRightPaneOpen(true); setNotificationsOpen(false); setChatPaneOpen(false); }}
            title="Open Team Chat"
          >
            <UsersIcon className="h-5 w-5 text-gray-200" />
          </button>
          <button 
            className="rounded-full p-2 hover:bg-gray-700 relative"
            onClick={() => { setNotificationsOpen(true); setRightPaneOpen(false); }}
            title="Open Notifications"
          >
            <BellIcon className="h-5 w-5 text-gray-200" />
            {openAlerts.length > 0 && (
              <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 hover:bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
                className="h-8 w-8 rounded-full border-2 border-white"
              />
              <span className="font-medium text-sm text-gray-700">John Doe</span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
              </div>
              {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                  <a
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                  >
                    {item.name}
                  </a>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside 
          className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 
            ${sidebarOpen ? '' : 'hidden md:flex'}
            ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            {!sidebarCollapsed && <span className="font-semibold text-lg text-gray-700">Menu</span>}
            <button
              className="rounded-full p-2 hover:bg-gray-100"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-xs
                  ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>

          {/* Bottom Pane - AI Assistant */}
          <div className="bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 px-0 py-2 shadow-inner">
            <form
              className="flex flex-col gap-1 w-full px-6"
              onSubmit={e => {
                e.preventDefault();
                if (aiInput.trim()) {
                  // Prefix input with selected action if not already present
                  let message = aiInput;
                  if (!message.toLowerCase().startsWith(selectedAction + ':')) {
                    message = `${selectedAction}: ${message}`;
                  }
                  setChatMessages([...chatMessages, { sender: "You", text: message }]);
                  setAiInput("");
                  setAttachedFile(null);
                }
              }}
            >
              <div className="flex items-end gap-2 w-full">
                {/* Agent, Action, and Message top-aligned */}
                <div className="flex items-end gap-2 w-full">
                  {/* Agent Selection with label */}
                  <div className="flex flex-col items-start justify-start">
                    <label htmlFor="agent-select" className="text-xs text-gray-500 font-xs mb-1 ml-1">Agent</label>
                    <select
                      id="agent-select"
                      value={selectedAgent}
                      onChange={e => setSelectedAgent(e.target.value)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors bg-white border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm min-w-[8rem] appearance-none outline-none hover:bg-gray-100"
                      style={{ height: '38px' }}
                      title="Select AI Agent"
                    >
                      {agents.map(agent => (
                        <option key={agent.value} value={agent.value}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Action Type */}
                  <div className="flex flex-col items-start justify-start">
                    <label className="text-xs text-gray-500 font-small mb-1 ml-1">Action</label>
                    <div className="flex gap-1 bg-gray-100 rounded-lg px-1 py-1 border border-gray-200">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedAction === 'act' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-white'}`}
                        onClick={() => setSelectedAction('act')}
                        title="Perform an action with the agent"
                        aria-pressed={selectedAction === 'act'}
                      >
                        Act
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedAction === 'ask' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-white'}`}
                        onClick={() => setSelectedAction('ask')}
                        title="Ask a question to the agent"
                        aria-pressed={selectedAction === 'ask'}
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                  {/* Text Input */}
                  <div className="flex-1 flex flex-col justify-start">
                    <label htmlFor="ai-input" className="text-xs text-gray-500 font-small mb-1 ml-1">Message</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-0 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                      <input
                        id="ai-input"
                        type="text"
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        placeholder={`Type your message...`}
                        className="flex-1 px-2 py-2 bg-transparent outline-none text-xs  border-none focus:ring-0"
                      />
                      {/* File Attachment */}
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-gray-100 ml-1"
                        title="Attach file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <PaperClipIcon className="h-5 w-5 text-gray-500" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachedFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Submit */}
                  <button
                    type="submit"
                    className="ml-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-sm align-bottom"
                    style={{ minWidth: 80 }}
                  >
                    Send
                  </button>
                </div>
              </div>
              {attachedFile && (
                <div className="flex items-center gap-2 text-xs text-gray-600 pl-2 mt-1">
                  <PaperClipIcon className="h-4 w-4 text-gray-400" />
                  <span>{attachedFile?.name}</span>
                  <button type="button" className="text-red-500 hover:underline" onClick={() => setAttachedFile(null)}>Remove</button>
                </div>
              )}
              <div className="flex gap-4 mt-2 text-xs text-gray-400 px-1">
                <span>Tip: Choose an agent and select <b>Ask</b> to query or <b>Act</b> to perform an action.</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right Pane - Team Chat */}
        <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden w-80 ${rightPaneOpen ? '' : 'hidden'}`} style={{ minWidth: rightPaneOpen ? '20rem' : 0 }}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <h2 className="text-lg font-medium">Team Chat</h2>
            <button onClick={() => setRightPaneOpen(false)}>
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Team Members</h3>
              <ul className="space-y-2">
                {teamMembers.map((member) => (
                  <li key={member.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <img src={member.image} alt={member.name} className="h-7 w-7 rounded-full border-2 border-white object-cover" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-700">{member.name}</span>
                      <span className="text-xs text-gray-400">{member.role} &middot; {member.specialty}</span>
                    </div>
                    <span className={`ml-auto h-2 w-2 rounded-full ${member.status === 'online' ? 'bg-green-400' : member.status === 'away' ? 'bg-yellow-400' : 'bg-gray-300'}`}></span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Common Questions */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">Common Questions</h3>
              <ul className="space-y-1">
                {commonQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-gray-700 bg-blue-50 rounded px-2 py-1">{q}</li>
                ))}
              </ul>
            </div>
            {/* Quick Links */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-700">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Pane - Chat Conversation */}
        <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden w-96 ${chatPaneOpen ? '' : 'hidden'}`} style={{ minWidth: chatPaneOpen ? '24rem' : 0 }}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <h2 className="text-lg font-medium">AI Chat</h2>
            <button onClick={() => setChatPaneOpen(false)}>
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <span className="block text-xs font-semibold mb-1">{msg.sender}</span>
                  <span className="block text-sm">{msg.text}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

  {/* Right Pane - Notifications */}
  <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden w-80 ${notificationsOpen ? '' : 'hidden'}`} style={{ minWidth: notificationsOpen ? '20rem' : 0 }}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <h2 className="text-lg font-medium">Notifications</h2>
            <button onClick={() => setNotificationsOpen(false)}>
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" /> Open Alerts
              </h3>
              <ul className="space-y-2">
                {openAlerts.length === 0 && <li className="text-xs text-gray-400">No open alerts</li>}
                {openAlerts.map((alert, idx) => (
                  <li key={idx} className="flex flex-col gap-1 p-2 bg-yellow-50 rounded">
                    <div className="flex items-center gap-2">
                      <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 font-medium">{alert.message}</span>
                      <span className="text-xs text-gray-400 ml-2">{alert.date}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-xs text-gray-500">Case: {alert.caseId}</span>
                      <a href={`/submissions/${alert.caseId}`} className="text-xs text-blue-600 hover:underline ml-2">Review</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4 text-blue-500" /> Open Tasks
              </h3>
              <ul className="space-y-2">
                {openTasks.length === 0 && <li className="text-xs text-gray-400">No open tasks</li>}
                {openTasks.map((task, idx) => (
                  <li key={idx} className="flex flex-col gap-1 p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 font-medium">{task.task}</span>
                      <span className="text-xs text-gray-400 ml-2">Due: {task.due}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-xs text-gray-500">Case: {task.caseId}</span>
                      <a href={`/submissions/${task.caseId}`} className="text-xs text-blue-600 hover:underline ml-2">Review</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sidebar open button */}
      <button
        className="fixed bottom-6 left-6 z-50 md:hidden rounded-full bg-blue-600 text-white p-3 shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setSidebarOpen(true)}
        style={{ display: sidebarOpen ? 'none' : 'block' }}
        aria-label="Open menu"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

