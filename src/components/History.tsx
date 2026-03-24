import { Trash2, Download } from 'lucide-react';
import { useI18n } from '../i18n';

export interface LogEntry {
  id: string;
  type: 'food' | 'glucose';
  value: string | number;
  calories?: number;
  category?: string;
  foodName?: string;
  timestamp: number;
}

const History = ({ logs, onDelete }: { logs: LogEntry[], onDelete: (id: string) => void }) => {
  const { t } = useI18n();

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Date,Time,Type,Category,Value\n"
      + logs.map(l => {
          const date = new Date(l.timestamp).toLocaleDateString();
          const time = new Date(l.timestamp).toLocaleTimeString();
          const type = l.type === 'glucose' ? t('glucoseLog') : t('foodLog');
          const cat = l.category ? t(l.category as any) : '';
          return `${date},${time},${type},${cat},${l.value}`;
        }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "antigravity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{t('history')}</h2>
        {logs.length > 0 && (
          <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-3)' }}>
            <Download size={18} />
            <span style={{ fontSize: 'var(--text-sm)' }}>{t('exportData') || 'Export'}</span>
          </button>
        )}
      </div>

      {sortedDates.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('noLogs')}
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
            {date}
          </h3>
          {grouped[date].sort((a,b) => b.timestamp - a.timestamp).map(log => (
            <div key={log.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: log.type === 'glucose' ? 'var(--color-primary)' : 'var(--color-warning)' }}>
                  {log.type === 'glucose' ? t('glucoseLog') : (log.category && log.foodName ? `${log.category} - ${log.foodName}` : log.foodName || t('foodLog'))}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  {log.type === 'glucose' && log.category && ` • ${t(log.category as any)}`}
                </span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: '2px' }}>
                  {log.value} <span style={{fontSize: 'var(--text-sm)'}}>{log.type === 'glucose' ? 'mg/dL' : 'g carbs'}</span>
                  {log.type === 'food' && log.calories && (
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)', marginLeft: '8px' }}>
                      • {log.calories} kcal
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(log.id)} style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-muted)', transition: 'color 0.2s', alignSelf: 'center' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default History;
