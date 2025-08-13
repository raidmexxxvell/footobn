import { useEffect, useState } from 'react';
import { api } from '../api';

interface CheckinState {
  today: string;
  alreadyCheckedIn: boolean;
  consecutiveDays: number;
  cycleDay: number;
  badgeTier: 'none' | 'bronze' | 'silver' | 'gold';
  nextEligibleAt: string;
  totals: { xp: number; credits: number; level: number };
}

export function CheckinPage({ userId }: { userId: string }) {
  const [state, setState] = useState<CheckinState | null>(null);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{ xp: number; credits: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadState() {
    setLoading(true);
    try {
      const res = await api.get<CheckinState>(`/checkin/state?user_id=${userId}`);
      setState(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function doCheckin() {
    setBusy(true);
    try {
      const res = await api.post(`/checkin`, { user_id: userId });
      setReward(res.data.rewards);
      await loadState();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  if (loading || !state) {
    return <div>Загрузка…</div>;
  }

  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div className="checkin-section">
      <div className="checkin-title">Ежедневный чекин</div>
      <div className="checkin-days">
        {days.map(day => {
          const isCompleted = day < state.cycleDay || (state.cycleDay === 7 && state.alreadyCheckedIn);
          const isActive = day === state.cycleDay;
          return (
            <div
              key={day}
              className={`checkin-day ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <button
        className="checkin-button"
        disabled={busy || state.alreadyCheckedIn}
        onClick={doCheckin}
      >
        {state.alreadyCheckedIn ? 'Награда получена' : busy ? 'Загрузка…' : 'Получить награду'}
      </button>

      {reward && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          +{reward.credits} 💰 / +{reward.xp} ✨
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <strong>Серия дней подряд:</strong> {state.consecutiveDays}
      </div>
      <div>
        <strong>Текущая медаль:</strong> {state.badgeTier}
      </div>
    </div>
  );
}