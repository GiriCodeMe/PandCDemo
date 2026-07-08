

import React, { useState, useRef } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Outlet, NavLink } from "react-router-dom";
import {
  BellIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperClipIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";


const navigation = [
  { name: "Dashboard", href: "dashboard", icon: HomeIcon },
  { name: "Work Queue", href: "workqueue", icon: ClipboardDocumentListIcon },
  { name: "Incidents", href: "incidents", icon: ExclamationCircleIcon },
  { name: "Payments", href: "payments", icon: CurrencyDollarIcon },
  { name: "Team Performance", href: "team", icon: UsersIcon },
  { name: "Guidelines", href: "guidelines", icon: BookOpenIcon },
];

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const teamMembers = [
  {
    name: "Sarah Mitchell",
    role: "Senior Claims Adjuster",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    status: "online",
    specialty: "Auto Claims"
  },
  {
    name: "Michael Chen",
    role: "Senior Claims Adjuster",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    status: "away",
    specialty: "Medical Claims"
  },
  {
    name: "Jessica Patel",
    role: "Junior Claims Adjuster",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    status: "online",
    specialty: "Property Claims"
  },
  {
    name: "David Kim",
    role: "Junior Claims Adjuster",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    status: "offline",
    specialty: "Travel Claims"
  }
];

const agents = [
  { name: "Claims", value: "claims" },
  { name: "Payments", value: "payments" },
  { name: "Compliance", value: "compliance" },
  { name: "Risk Assessment", value: "risk" },
  { name: "Policy Admin", value: "policy" },
  { name: "Talk to Data", value: "data" },
];


export default function ClaimsMainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPaneOpen, setRightPaneOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatPaneOpen, setChatPaneOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(agents[0].value);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAction, setSelectedAction] = useState<'ask' | 'act'>('ask');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "AI", text: "Hello! How can I help you today?" },
  ]);
  const [webAccess, setWebAccess] = useState(false);
  const openAlerts = [
    { type: 'Missing Document', message: 'Missing Claim Form', caseId: 'CLM-2025-002', date: '2025-09-08' },
    { type: 'Missing Data', message: 'Missing Claimant DOB', caseId: 'CLM-2025-003', date: '2025-09-07' },
    { type: 'Missing Document', message: 'Missing Police Report', caseId: 'CLM-2025-004', date: '2025-09-06' },
  ];
  const openTasks = [
    { task: 'Review Claim Documents', caseId: 'CLM-2025-002', due: '2025-09-10' },
    { task: 'Contact Claimant', caseId: 'CLM-2025-003', due: '2025-09-12' },
    { task: 'Review Police Report', caseId: 'CLM-2025-004', due: '2025-09-15' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700 z-10">
        <div className="flex items-center gap-4">
          <img src="/epamlogo.png" alt="EPAM Logo" className="h-6" />
          <NavLink to="/" className="focus:outline-none flex items-center">
            <img src="/workbenchlogo2.png" alt="Workbench Logo" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            <span className="text-white font-bold ml-4">Claims Workbench</span>
          </NavLink>
        </div>
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
              <span className="font-medium text-sm text-gray-700">Jane Smith</span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                <p className="text-xs text-gray-500">jane.smith@example.com</p>
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
        <div className="flex-1 flex min-w-0">
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
                  {/* Agent Selection with label */}
                  <div className="flex flex-col items-start">
                    <label htmlFor="agent-select" className="text-xs text-gray-500 font-xs mb-1 ml-1">Agent</label>
                    <select
                      id="agent-select"
                      value={selectedAgent}
                      onChange={e => setSelectedAgent(e.target.value)}
                      className="px-1 py-1 border border-gray-300 rounded-sm text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[8rem] shadow-sm"
                      title="Select AI Agent"
                    >
                      {agents.map(agent => (
                        <option key={agent.value} value={agent.value}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Action Type */}
                  <div className="flex flex-col items-start">
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
                  <div className="flex-1 flex flex-col">
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
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
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
                          } else {
                            setAttachedFile(null);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Submit */}
                  <button
                    type="submit"
                    className="ml-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-sm"
                    style={{ minWidth: 80 }}
                  >
                    Send
                  </button>
                </div>
                {attachedFile && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 pl-2 mt-1">
                    <PaperClipIcon className="h-4 w-4 text-gray-400" />
                    <span>{attachedFile.name}</span>
                    <button type="button" className="text-red-500 hover:underline" onClick={() => setAttachedFile(null)}>Remove</button>
                  </div>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-400 px-1">
                  <span>Tip: Choose an agent and select <b>Ask</b> to query or <b>Act</b> to perform an action.</span>
                </div>
              </form>
            </div>
          </div>
          {/* Right Side Panes */}
          {/* Quick Links Pane */}
          <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden w-80 ${rightPaneOpen ? '' : 'hidden'}`} style={{ minWidth: rightPaneOpen ? '20rem' : 0 }}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <h2 className="text-lg font-medium">Quick Links</h2>
              <button onClick={() => setRightPaneOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
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
            </div>
          </aside>
          {/* AI Chat Pane */}
          <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden w-80 ${chatPaneOpen ? '' : 'hidden'}`} style={{ minWidth: chatPaneOpen ? '20rem' : 0 }}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <h2 className="text-lg font-medium">AI Chat</h2>
              <div className="flex items-center gap-2">
                <button
                  className={`rounded-full px-3 py-1 text-xs font-semibold border ${webAccess ? 'bg-blue-100 text-blue-700 border-blue-400' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                  onClick={() => setWebAccess(!webAccess)}
                  title={webAccess ? 'Web Access Enabled' : 'Enable Web Access'}
                >
                  {webAccess ? 'Web Access: On' : 'Web Access: Off'}
                </button>
                <button onClick={() => setChatPaneOpen(false)}>
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
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
          {/* Notifications Pane */}
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
                        <a href={`/claims/${alert.caseId}`} className="text-xs text-blue-600 hover:underline ml-2">Review</a>
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
                        <a href={`/claims/${task.caseId}`} className="text-xs text-blue-600 hover:underline ml-2">Review</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
