import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext.jsx';

const linkClasses = ({ isActive }) =>
  `rounded-3xl px-4 py-3 text-sm font-semibold transition ${
    isActive ? 'bg-brand-500 text-white shadow-glow' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-900'
  }`;

export default function Navbar() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-slate-400">SafeSan</p>
          <p className="mt-1 text-xl font-semibold text-white">{user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          {user?.role === 'user' && (
            <>
              <NavLink to="/user-dashboard" className={linkClasses}>{t('Dashboard')}</NavLink>
              <NavLink to="/report" className={linkClasses}>{t('Report')}</NavLink>
              <NavLink to="/finder" className={linkClasses}>🚻 {t('Finder')}</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin-dashboard" className={linkClasses}>Overview</NavLink>
              <NavLink to="/map" className={linkClasses}>Map</NavLink>
            </>
          )}
          {user?.role === 'user' && (
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded-3xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 outline-none focus:border-brand-400"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            {t('Logout')}
          </button>
        </nav>
      </div>
    </header>
  );
}
