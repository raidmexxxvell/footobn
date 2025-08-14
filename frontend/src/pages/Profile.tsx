import { useEffect, useState } from 'react';
import { api } from '../api';
import { CheckinPage } from './Checkin';
import { AchievementsPage } from './Achievements';

interface UserProfile {
  display_name: string;
  tg_username?: string;
  credits: number;
  xp: number;
  level: number;
}

interface LeaderboardEntry {
  display_name: string;
  xp: number;
  level: number;
}

export function ProfilePage({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/profile?user_id=${userId}`);
      setProfile(res.data.profile);
      setLeaderboard(res.data.leaderboard);
    } catch (e) {
      setError('Ошибка загрузки профиля. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <div>Загрузка профиля…</div>;
  }
  if (error) {
    return <div style={{color: 'red', background: '#222', padding: 16, borderRadius: 8}}>{error}</div>;
  }
  if (!profile) {
    return <div>Нет данных профиля.</div>;
  }

  const xpProgress = ((profile.xp % 100) / 100) * 100;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.tg_username
            ? <img src={`https://t.me/i/userpic/320/${profile.tg_username}.jpg`} alt="avatar" />
            : (profile.display_name || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{profile.display_name || 'Без имени'}</h2>
          <div>@{profile.tg_username || 'нет username'}</div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{profile.credits}</div>
          <div className="stat-label">Кредиты</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.xp}</div>
          <div className="stat-label">Опыт</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.level}</div>
          <div className="stat-label">Уровень</div>
        </div>
      </div>

      <div className="xp-progress-container">
        <div className="xp-progress" style={{ width: `${xpProgress}%` }}></div>
      </div>
      <div className="level-info">
        <span>Текущий уровень: {profile.level}</span>
        <span>{profile.xp % 100} / 100 XP</span>
      </div>

      <CheckinPage userId={userId} />
      <AchievementsPage userId={userId} />

      <div className="leaderboard-section" style={{ marginTop: '20px' }}>
        <div className="section-title">Лидеры</div>
        {leaderboard.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '5px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span>{i + 1}. {entry.display_name}</span>
            <span>{entry.level} lvl</span>
          </div>
        ))}
      </div>
    </div>
  );
}