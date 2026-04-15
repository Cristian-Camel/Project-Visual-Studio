import { useState } from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { Editor } from '../components/editor/Editor';

export const App = () => {
  const [mode, setMode] = useState<'dashboard' | 'editor'>('dashboard');

  if (mode === 'editor') {
    return <Editor onBack={() => setMode('dashboard')} />;
  }

  return <Dashboard onOpenEditor={() => setMode('editor')} />;
};
