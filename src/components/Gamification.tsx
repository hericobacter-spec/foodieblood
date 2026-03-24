import { useState } from 'react';
import { Trophy, Star, Target, CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import type { LogEntry } from './History';

const Gamification = ({ logs }: { logs: LogEntry[] }) => {
  const { t } = useI18n();
  const [checkupDate, setCheckupDate] = useState<string>('2026-06-15');

  // Derived Points
  const points = 1000 + (logs.length * 50);
  const currentLevel = Math.floor((points - 1000) / 200) + 1;
  const pointsToNext = (currentLevel * 200) + 1000 - points;
  
  const getLevelName = (lvl: number) => {
    if (lvl < 2) return '초보자';
    if (lvl < 4) return '탐험가';
    if (lvl < 7) return '마스터';
    return '무중력 인간';
  };

  // Daily Meal Goal
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayFood = logs.filter(l => l.type === 'food' && l.timestamp > todayStart.getTime());
  const mealsLogged = todayFood.length;
  const maxMeals = 3;
  const loggedRatio = Math.min((mealsLogged / maxMeals) * 100, 100);

  // Gamification Badges Logic
  const hasFirstStep = logs.length > 0;
  
  const todayGlucose = logs.filter(l => l.type === 'glucose' && l.timestamp > todayStart.getTime());
  const inRange = todayGlucose.filter(l => Number(l.value) >= 70 && Number(l.value) <= 180).length;
  const tirToday = todayGlucose.length > 0 ? (inRange / todayGlucose.length) * 100 : 0;
  const hasSugarControlBadge = todayGlucose.length >= 3 && tirToday >= 75;

  const hasNightOwl = logs.some(l => {
    const hours = new Date(l.timestamp).getHours();
    return hours >= 22 || hours <= 3;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      {/* Header Profile */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', background: 'var(--color-primary)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ padding: 'var(--spacing-3)', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)' }}>
            <Trophy size={40} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>레벨 {currentLevel} {getLevelName(currentLevel)}</h2>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9, marginTop: '2px' }}>{points} pts • 다음 레벨까지 {pointsToNext} pts</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 'var(--spacing-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>다음 정기 검진일</span>
          <input 
            type="date" 
            value={checkupDate} 
            onChange={e => setCheckupDate(e.target.value)} 
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: 'var(--text-sm)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Progress & Goals */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>오늘의 목표</h3>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t('tirToday')} (&gt;75%)</span>
            <span style={{ fontSize: 'var(--text-sm)', color: hasSugarControlBadge ? 'var(--color-secondary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
               {hasSugarControlBadge ? '달성 완료 🎉' : '진행 중'}
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(tirToday, 5)}%`, background: hasSugarControlBadge ? 'var(--color-secondary)' : 'var(--color-primary)' }} />
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>당일 {t('logAllMeals')}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: mealsLogged >= maxMeals ? 'var(--color-secondary)' : 'var(--color-warning)', fontWeight: 600 }}>{mealsLogged}/{maxMeals}</span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(loggedRatio, 5)}%`, background: mealsLogged >= maxMeals ? 'var(--color-secondary)' : 'var(--color-warning)' }} />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--spacing-3)' }}>{t('yourBadges')} (달성 현황)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-3)' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3)', opacity: hasFirstStep ? 1 : 0.5, border: hasFirstStep ? '2px solid var(--color-primary)' : '2px solid transparent' }}>
            <CheckCircle size={32} color={hasFirstStep ? "var(--color-primary)" : "var(--color-text-muted)"} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textAlign: 'center' }}>첫 발걸음</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3)', opacity: hasSugarControlBadge ? 1 : 0.5, border: hasSugarControlBadge ? '2px solid var(--color-secondary)' : '2px solid transparent' }}>
            <Target size={32} color={hasSugarControlBadge ? "var(--color-secondary)" : "var(--color-text-muted)"} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textAlign: 'center' }}>혈당 마스터</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3)', opacity: hasNightOwl ? 1 : 0.5, border: hasNightOwl ? '2px solid #8b5cf6' : '2px solid transparent' }}>
            <Star size={32} color={hasNightOwl ? "#8b5cf6" : "var(--color-text-muted)"} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textAlign: 'center' }}>{t('nightOwl')}</span>
          </div>
        </div>
      </div>
      
      {/* Coach Message */}
      <div className="card" style={{ background: 'var(--color-secondary-light)', border: '1px solid var(--color-secondary)', display: 'flex', gap: 'var(--spacing-3)' }}>
        <div style={{ fontSize: '2rem' }}>🦉</div>
        <div>
          <h4 style={{ fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '2px' }}>{t('coachName')}</h4>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>
            {mealsLogged >= maxMeals && hasSugarControlBadge 
              ? "완벽한 하루네요! 건강 관리를 스스로 해내고 계십니다. 배지도 획득하셨어요!"
              : "조금만 더 기록하시면 새로운 배지를 얻을 수 있어요. 오늘도 화이팅입니다!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
