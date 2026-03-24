import { Activity, ArrowUpRight, ArrowDownRight, Clock, Flame } from 'lucide-react';
import { useI18n } from '../i18n';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { LogEntry } from './History';

const Dashboard = ({ logs }: { logs: LogEntry[] }) => {
  const { t } = useI18n();

  const glucoseLogs = [...logs].filter(l => l.type === 'glucose').sort((a,b) => a.timestamp - b.timestamp);
  const currentGlucose = glucoseLogs.length > 0 ? Number(glucoseLogs[glucoseLogs.length - 1].value) : 100;
  const prevGlucose = glucoseLogs.length > 1 ? Number(glucoseLogs[glucoseLogs.length - 2].value) : currentGlucose;

  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  if (currentGlucose > prevGlucose + 5) trend = 'rising';
  else if (currentGlucose < prevGlucose - 5) trend = 'falling';
  
  const chartData = glucoseLogs.map(l => ({
    time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: Number(l.value)
  }));

  // Ensure the chart has at least two points to draw a line
  if (chartData.length === 1) {
    chartData.unshift({ time: 'Start', value: chartData[0].value });
  } else if (chartData.length === 0) {
    chartData.push({ time: 'Now', value: 100 }, { time: 'Later', value: 100 });
  }

  const getGlucoseColor = (val: number) => {
    if (val > 180) return 'var(--color-danger)';
    if (val < 70) return 'var(--color-warning)';
    return 'var(--color-secondary)';
  };

  const currentColor = getGlucoseColor(currentGlucose);

  // Calculate TIR (mock value for now, or derive from logs)
  const inRangeCount = glucoseLogs.filter(l => Number(l.value) >= 70 && Number(l.value) <= 180).length;
  const tirToday = glucoseLogs.length > 0 ? Math.round((inRangeCount / glucoseLogs.length) * 100) : 100;

  // Calculate calories from food logs today
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayFood = logs.filter(l => l.type === 'food' && l.timestamp > todayStart.getTime());
  const totalCalories = todayFood.reduce((sum, log) => sum + (log.calories || 0), 0);

  // Calculate average glucose & estimated HbA1c
  const avgGlucose = glucoseLogs.length > 0 ? Math.round(glucoseLogs.reduce((acc, log) => acc + Number(log.value), 0) / glucoseLogs.length) : 0;
  const estimatedHbA1c = avgGlucose > 0 ? ((avgGlucose + 46.7) / 28.7).toFixed(1) : '-';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      {/* Current Blood Sugar Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
          {t('currentGlucose')}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: currentColor }}>
            {currentGlucose}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('mgdl')}</span>
            {trend === 'rising' && <ArrowUpRight size={24} color="var(--color-danger)" />}
            {trend === 'falling' && <ArrowDownRight size={24} color="var(--color-secondary)" />}
            {trend === 'stable' && <Activity size={24} color="var(--color-primary)" />}
          </div>
        </div>
        <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {t('updatedJustNow')} {currentGlucose <= 180 && currentGlucose >= 70 ? t('inRange') : t('outOfRange')}
        </p>
      </div>

      {/* Trend Graph */}
      <div className="card" style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t('trendGraph') || "혈당 경향성"}</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={currentColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={[40, 250]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <ReferenceLine y={180} stroke="var(--color-danger)" strokeDasharray="3 3" />
              <ReferenceLine y={70} stroke="var(--color-warning)" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="value" stroke={currentColor} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-primary)' }}>
            <Clock size={20} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t('tirToday')}</span>
          </div>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)' }}>{tirToday}%</span>
          <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${tirToday}%`, background: 'var(--color-secondary)' }} />
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-warning)' }}>
            <Flame size={20} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t('calories')}</span>
          </div>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)' }}>{totalCalories}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t('of2000')}</span>
        </div>
      </div>

      {/* HbA1c Prediction */}
      {logs.length > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ padding: 'var(--spacing-2)', background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-full)' }}>
              <Activity color="var(--color-secondary)" />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)' }}>예상 당화혈색소 (HbA1c)</h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{estimatedHbA1c}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight Widget */}
      {logs.length > 0 && (
        <div className="card" style={{ display: 'flex', gap: 'var(--spacing-3)', padding: 'var(--spacing-4)', alignItems: 'flex-start', backgroundColor: 'var(--color-primary-light)' }}>
          <div style={{ padding: '8px', background: 'var(--color-primary)', borderRadius: '50%', color: 'white' }}>
              <Activity size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-primary)' }}>오늘의 건강 인사이트</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.5 }}>
                {trend === 'stable' ? "혈당이 매우 안정적으로 유지되고 있어요! 훌륭합니다. 이대로 걷기와 균형 잡힌 식사를 유지해주세요." : 
                  trend === 'rising' ? "최근 혈당이 상승 추세입니다. 가벼운 산책이나 물을 한 컵 드시는 것을 추천합니다." :
                  "혈당이 안정세에 진입했습니다. 곧 식사 시간이라면 단백질 중심의 든든한 식사를 고려해보세요."}
              </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
