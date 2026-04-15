import { Eye, MonitorPlay, Save, Upload } from 'lucide-react';
import { ThemeId } from '../../types/presentation';
import { THEMES } from '../../data/themes';
import { Button } from '../ui/Button';

interface Props {
  title: string;
  themeId: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onPreview: () => void;
  onPresent: () => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onBack: () => void;
}

export const TopBar = ({ title, themeId, onThemeChange, onPreview, onPresent, onExportJson, onExportHtml, onBack }: Props) => (
  <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={onBack}>
        Dashboard
      </Button>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <select
        value={themeId}
        onChange={(e) => onThemeChange(e.target.value as ThemeId)}
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
      >
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onExportJson}>
        <Save size={14} /> JSON
      </Button>
      <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onExportHtml}>
        <Upload size={14} /> HTML
      </Button>
      <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onPreview}>
        <Eye size={14} /> Preview
      </Button>
      <Button className="inline-flex items-center gap-1" onClick={onPresent}>
        <MonitorPlay size={14} /> Presentar
      </Button>
    </div>
  </header>
);
