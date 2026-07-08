import React from 'react';
import { ApplicationData, Note } from './types';

const NotesTab: React.FC<{ applicationData: ApplicationData; notes: Note[]; setNotes: any }> = ({ applicationData, notes, setNotes }) => (
  <div className="space-y-4">
    {/* ...existing notes tab JSX... */}
  </div>
);

export default NotesTab;
