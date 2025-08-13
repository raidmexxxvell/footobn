import { useEffect, useState } from 'react';
import { api } from '../api';

interface Achievement {
  tier: 'bronze' | 'silver' | 'gold';
  title: string;
  description: string;
  unlocked_at: string;
  superseded: boolean;
}

export function AchievementsPage({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAchievements() {
    setLoading(true);
    try {
      const res = await api.get<Achievement[]>(`/achievements?user_id=${userId}`);
      setAchievements(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAchievements();
  }, []);

  if (loading) {
    return <div>Загрузка достижений…</div>;
  }

  const tierIcon = (tier: string) => {
    // Положи PNG в /public/icons или замени на эмодзи
    switch (tier) {
      case 'bronze': return '/icons/bronze.png';
      case 'silver': return '/icons/silver.png';
      case 'gold': return '/icons/gold.png';
      default: return '/icons/lock.png';
    }
  };

  return (
    <div className="achievements-section">
      <div className="section-title">Достижения</div>
      <div className="achievements-container">
        {['bronze', 'silver', 'gold'].map(tier => {
          const ach = achievements.find(a => a.tier === tier);
          const locked = !ach;
          const superseded = ach?.superseded;
          return (
            <div
              key={tier}
              className="achievement-card"
              style={{
                opacity: locked ? 0.4 : superseded ? 0.6 : 1,
                filter: locked ? 'grayscale(100%)' : undefined
              }}
            >
              <img src={tierIcon(tier)} alt={tier} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <h4>{ach ? ach.title : tierTitle(tier)}</h4>
              <p style={{ fontSize: '12px', minHeight: '28px' }}>
                {ach ? ach.description : tierDescription(tier)}
              </p>
              {ach && (
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {superseded
                    ? 'Заменено более высоким'
                    : `Открыто: ${new Date(ach.unlocked_at).toLocaleDateString()}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function tierTitle(tier: string) {
  switch (tier) {
    case 'bronze': return 'Бронза';
    case 'silver': return 'Серебро';
    case 'gold': return 'Золото';
    default: return '';
  }
}

function tierDescription(tier: string) {
  switch (tier) {
    case 'bronze': return '7 дней подряд';
    case 'silver': return '30 дней подряд';
    case 'gold': return '120 дней подряд';
    default: return '';
  }
}