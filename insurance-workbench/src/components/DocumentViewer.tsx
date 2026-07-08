import React, { useState } from 'react';

interface ExtractedField {
  field: string;
  value: string;
  confidence: number; // 0-1
}

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isEdited: boolean;
  lastEditedAt?: string;
  page?: number;
}

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    type: string;
    date: string;
    status: string;
    content?: string;
    extractedFields?: ExtractedField[];
  };
  onClose: () => void;
  onAddNote?: (note: Omit<Note, 'id'>) => void;
  documentNotes?: Note[];
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  onClose, 
  onAddNote,
  documentNotes = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [newNote, setNewNote] = useState('');
  const [showNotes, setShowNotes] = useState(true);
  const totalPages = 5; // This would come from the actual document

  // Demo: add sample extracted fields if not present
  const sampleExtractedFields = [
    { field: 'Name', value: 'John Smith', confidence: 0.98 },
    { field: 'Date of Birth', value: '1985-06-15', confidence: 0.95 },
    { field: 'Gender', value: 'Male', confidence: 0.99 },
    { field: 'Examination Date', value: '2025-09-03', confidence: 0.93 },
    { field: 'Blood Pressure', value: '128/82 mmHg', confidence: 0.88 },
    { field: 'Heart Rate', value: '72 bpm', confidence: 0.91 },
    { field: 'Height', value: "5'10\" (178 cm)", confidence: 0.85 },
    { field: 'Weight', value: '165 lbs (75 kg)', confidence: 0.87 },
    { field: 'Total Cholesterol', value: '185 mg/dL', confidence: 0.92 },
    { field: 'HDL Cholesterol', value: '55 mg/dL', confidence: 0.89 },
    { field: 'LDL Cholesterol', value: '110 mg/dL', confidence: 0.86 },
  ];
  const extractedFields = document.extractedFields && document.extractedFields.length > 0
    ? document.extractedFields
    : sampleExtractedFields;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-h-[90vh] rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div>
            <h2 className="text-sm font-medium">{document.name}</h2>
            <p className="text-xs text-gray-500">Uploaded on {document.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm">{zoom}%</span>
              <button 
                onClick={() => setZoom(z => Math.min(200, z + 10))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Content and Extracted Fields */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Notes Panel */}
            {showNotes && (
              <div className="bg-white shadow-lg rounded p-6 md:w-1/4 w-full h-fit order-first md:order-last">
                <div className="mb-4">
                  <h2 className="text-base font-semibold mb-2">Document Notes</h2>
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this document..."
                      className="w-full border rounded-md p-2 text-xs"
                      rows={4}
                    />
                    <button
                      onClick={() => {
                        if (newNote.trim() && onAddNote) {
                          onAddNote({
                            author: 'Current User', // In real app, get from auth context
                            content: newNote,
                            timestamp: new Date().toISOString(),
                            isEdited: false,
                            page: currentPage
                          });
                          setNewNote('');
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {documentNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">{note.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {note.page && (
                        <div className="mb-1">
                          <span className="text-xs text-gray-500">Page {note.page}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      {note.isEdited && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500 italic">
                            (Edited {new Date(note.lastEditedAt!).toLocaleString()})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Document Preview */}
            <div 
              className="bg-white mx-auto shadow-lg rounded relative md:w-2/3 w-full"
              style={{ 
                width: `${8.5 * zoom}px`,
                minHeight: `${11 * zoom}px`,
                maxWidth: '95%',
                margin: '0 auto'
              }}
            >
              {/* Sample PDF content */}
              <div className="p-8">
                <h1 className="text-base font-bold mb-4">Medical Examination Report</h1>
                <div className="space-y-4">
                  <section>
                    <h2 className="text-sm font-medium mb-2">Patient Information</h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600">Name:</p>
                        <p className="font-medium">John Smith</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date of Birth:</p>
                        <p className="font-medium">1985-06-15</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender:</p>
                        <p className="font-medium">Male</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Examination Date:</p>
                        <p className="font-medium">2025-09-03</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-sm font-medium mb-2">Vital Signs</h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600">Blood Pressure:</p>
                        <p className="font-medium">128/82 mmHg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Heart Rate:</p>
                        <p className="font-medium">72 bpm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Height:</p>
                        <p className="font-medium">5'10" (178 cm)</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Weight:</p>
                        <p className="font-medium">165 lbs (75 kg)</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-lg font-medium mb-3">Laboratory Results</h2>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Test</th>
                          <th className="px-4 py-2 text-left">Result</th>
                          <th className="px-4 py-2 text-left">Reference Range</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2">Total Cholesterol</td>
                          <td className="px-4 py-2">185 mg/dL</td>
                          <td className="px-4 py-2">&lt; 200 mg/dL</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Normal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">HDL Cholesterol</td>
                          <td className="px-4 py-2">55 mg/dL</td>
                          <td className="px-4 py-2">&gt; 40 mg/dL</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Normal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">LDL Cholesterol</td>
                          <td className="px-4 py-2">110 mg/dL</td>
                          <td className="px-4 py-2">&lt; 130 mg/dL</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Normal</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>
              </div>
            </div>
            {/* Extracted Fields Table */}
            <div className="bg-white shadow-lg rounded p-6 md:w-1/3 w-full h-fit">
              <h2 className="text-base font-semibold mb-4">Extracted Fields</h2>
              {extractedFields && extractedFields.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left">Field</th>
                      <th className="px-2 py-1 text-left">Value</th>
                      <th className="px-2 py-1 text-left">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedFields.map((f, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 font-medium text-gray-700">{f.field}</td>
                        <td className="px-2 py-1 text-gray-600">{f.value}</td>
                        <td className="px-2 py-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${f.confidence >= 0.9 ? 'bg-green-100 text-green-800' : f.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>{(f.confidence * 100).toFixed(0)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-xs text-gray-400">No extracted fields available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Underwriter Actions */}
        <div className="border-t bg-gray-50">
          {/* Status Bar */}
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                document.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {document.status}
              </span>
              <span className="text-xs text-gray-500">Last modified: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 ${
                  showNotes
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
                  />
                </svg>
                {showNotes ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="p-3 flex items-center justify-between">
            {/* Primary Actions */}
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Reviewed
              </button>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <button className="inline-flex items-center px-3 py-1.5 text-gray-700 hover:text-gray-900 text-xs font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center">
              <div className="relative">
                <button className="inline-flex items-center px-3 py-1.5 text-gray-700 hover:text-gray-900 text-xs font-medium">
                  More Actions
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 inline-flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Detach from Case
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 inline-flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Send to Another UW
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 inline-flex items-center">
                      <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Reject & Request New Copy
                    </button>
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

export default DocumentViewer;
