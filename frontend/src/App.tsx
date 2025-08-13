import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ProfilePage } from './pages/Profile';
import { AchievementsPage } from './pages/Achievements';
import { CheckinPage } from './pages/Checkin';

export function App({ userId }: { userId: string }) {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Link to="/profile">Профиль</Link>
        <Link to="/achievements">Достижения</Link>
        <Link to="/checkin">Чекины</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/profile" element={<ProfilePage userId={userId} />} />
        <Route path="/achievements" element={<AchievementsPage userId={userId} />} />
        <Route path="/checkin" element={<CheckinPage userId={userId} />} />
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </BrowserRouter>
  );
}