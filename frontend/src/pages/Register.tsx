import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dark, setDark] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        setError(firstMsg || 'Registration failed.');
      } else {
        setError('Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const d = dark;

  const inputClass = `w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
    d
      ? 'border border-white/10 text-white bg-white/5 placeholder-slate-600 focus:ring-blue-500/40 focus:border-blue-500/50'
      : 'border border-slate-200 text-slate-800 bg-slate-50 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-400'
  }`;

  const labelClass = `block text-xs font-medium uppercase tracking-wide mb-2 ${d ? 'text-slate-400' : 'text-slate-500'}`;

  const iconClass = `absolute left-3 top-1/2 -translate-y-1/2 ${d ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${d ? 'bg-[#0a0f1a]' : 'bg-slate-100'}`}>

      {/* Theme toggle */}
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle theme"
        className={`fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-300 ${d ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
      >
        {d ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        )}
      </button>

      <div className={`w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-300 ${d ? 'border-white/10' : 'border-slate-200'}`}>

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-[#0C2340] flex-col justify-between p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(#5BA4E6 1px, transparent 1px), linear-gradient(90deg, #5BA4E6 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 opacity-[0.13]">
            <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="18" width="320" height="5" fill="#5BA4E6"/>
              <rect x="0" y="78" width="320" height="5" fill="#5BA4E6"/>
              <rect x="0" y="138" width="320" height="5" fill="#5BA4E6"/>
              {[10,44,70,108,138,162,198,226,260,284].map((x, i) => (
                <rect key={i} x={x} y={22 + (i % 3) * 4} width={i % 2 === 0 ? 28 : 20} height={50 - (i % 3) * 3} rx="2" fill={['#85B7EB','#378ADD','#B5D4F4'][i % 3]}/>
              ))}
              {[10,52,80,114,140,180,212,236,272].map((x, i) => (
                <rect key={i} x={x} y={82 + (i % 3) * 3} width={i % 2 === 0 ? 34 : 22} height={50 - (i % 3) * 2} rx="2" fill={['#378ADD','#85B7EB','#B5D4F4'][i % 3]}/>
              ))}
            </svg>
          </div>

          <div className="relative z-10">
            <div className="w-11 h-11 bg-[#185FA5] rounded-xl flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="2" y="12" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="2" y="17" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="4" y="9" width="4" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="10" y="9" width="5" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="17" y="9" width="3" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="5" y="14" width="3" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="11" y="14" width="6" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="19" y="14" width="3" height="3" rx="0.5" fill="#85B7EB"/>
              </svg>
            </div>
            <h1 className="text-[#E6F1FB] text-2xl font-semibold leading-snug mb-3">
              Warehouse<br/>Management System
            </h1>
            <p className="text-[#85B7EB] text-sm leading-relaxed">
              Join your team's operations portal and manage inventory with precision.
            </p>
          </div>

          {/* Steps */}
          <div className="relative z-10 space-y-3">
            <p className="text-[#85B7EB] text-[11px] uppercase tracking-widest mb-4">How it works</p>
            {[
              { step: '01', text: 'Create your account' },
              { step: '02', text: 'Admin assigns your role' },
              { step: '03', text: 'Access your dashboard' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[11px] font-semibold text-[#85B7EB] flex-shrink-0">{step}</span>
                <span className="text-sm text-[#E6F1FB]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — form */}
        <div className={`w-full lg:w-7/12 px-6 py-10 sm:px-10 flex flex-col justify-center transition-colors duration-300 ${d ? 'bg-[#111827]' : 'bg-white'}`}>

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#0C2340] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="2" y="12" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="2" y="17" width="20" height="2" rx="1" fill="#E6F1FB"/>
                <rect x="4" y="9" width="4" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="10" y="9" width="5" height="3" rx="0.5" fill="#85B7EB"/>
                <rect x="17" y="9" width="3" height="3" rx="0.5" fill="#85B7EB"/>
              </svg>
            </div>
            <span className={`font-semibold text-sm leading-tight ${d ? 'text-white' : 'text-[#0C2340]'}`}>
              Warehouse<br/>Management System
            </span>
          </div>

          <div className="mb-7">
            <p className={`text-xs uppercase tracking-widest mb-1 ${d ? 'text-slate-500' : 'text-slate-400'}`}>Operations portal</p>
            <h2 className={`text-2xl font-semibold ${d ? 'text-white' : 'text-slate-800'}`}>Create your account</h2>
          </div>

          {error && (
            <div className={`mb-5 flex items-start gap-2 rounded-lg text-sm px-4 py-3 ${d ? 'bg-red-900/40 border border-red-700/50 text-red-400' : 'bg-red-50 border border-red-100 text-red-700'}`}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className={labelClass}>Username</label>
              <div className="relative">
                <span className={iconClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <input name="username" type="text" value={form.username} onChange={handleChange} required autoComplete="username" placeholder="Choose a username" className={inputClass}/>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <span className={iconClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="your@email.com" className={inputClass}/>
              </div>
            </div>

            {/* Phone + Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <span className={iconClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </span>
                  <input name="phone" type="text" value={form.phone} onChange={handleChange} placeholder="Optional" className={inputClass}/>
                </div>
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <div className="relative">
                  <span className={iconClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </span>
                  <input name="department" type="text" value={form.department} onChange={handleChange} placeholder="Optional" className={inputClass}/>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <span className={iconClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required autoComplete="new-password" placeholder="••••••••" className={`${inputClass} pr-10`}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${d ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <span className={iconClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </span>
                <input name="password2" type={showPassword2 ? 'text' : 'password'} value={form.password2} onChange={handleChange} required autoComplete="new-password" placeholder="••••••••" className={`${inputClass} pr-10`}/>
                <button type="button" onClick={() => setShowPassword2(!showPassword2)} className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${d ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} aria-label={showPassword2 ? 'Hide password' : 'Show password'}>
                  {showPassword2 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className={`mt-0.5 w-4 h-4 rounded focus:ring-blue-500 ${d ? 'border-slate-600 bg-white/5 text-blue-500' : 'border-slate-300 text-blue-600'}`}
              />
              <span className={`text-sm leading-snug ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className={`font-medium hover:underline transition ${d ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className={`font-medium hover:underline transition ${d ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  Create account
                </>
              )}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${d ? 'text-slate-500' : 'text-slate-400'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-medium hover:underline transition ${d ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}