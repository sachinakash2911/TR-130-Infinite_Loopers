import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, registerUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) return;
    
    if (isRegistering && role === 'user') {
      const res = registerUser({ email, password });
      if (res.success) {
        navigate('/user-dashboard');
      }
    } else {
      const res = login({ email, password, role });
      if (res.success) {
        navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
      }
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    if (newRole === 'admin') setIsRegistering(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft backdrop-blur-xl">
        <div className="flex justify-end border-b border-white/5 pb-4">
          <select 
            value={i18n.language} 
            onChange={handleLanguageSelect}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 outline-none focus:border-brand-400"
          >
            <option value="en">English (US)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>
        
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t("SafeSan Login")}</p>
          <h1 className="text-3xl font-extrabold text-white">
            {isRegistering ? t("Create your account") : t("Access your workspace")}
          </h1>
          <p className="text-sm text-slate-400">
            {role === 'admin' 
              ? t("Enter admin credentials")
              : isRegistering 
                ? t("Sign up to report sanitation issues") 
                : t("Sign in to your user account")}
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            {t("Email")}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            {t("Password")}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </label>
          {!isRegistering && (
            <label className="block text-sm font-medium text-slate-200">
              {t("Role")}
              <select
                value={role}
                onChange={handleRoleChange}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="user">{t("User")}</option>
                <option value="admin">{t("Admin")}</option>
              </select>
            </label>
          )}
          
          <button type="submit" className="action-button w-full rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400">
            {isRegistering ? t("Sign up") : t("Sign in")}
          </button>
          
          {role === 'user' && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-brand-400 hover:text-brand-300 transition"
              >
                {isRegistering ? t("Already have an account? Sign in") : t("Don't have an account? Sign up")}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
