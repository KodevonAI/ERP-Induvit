import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, Lock, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800)); // simular latencia
    const ok = login(username.trim(), password);
    if (!ok) {
      setError('Usuario o contraseña incorrectos.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-brand-950 p-12 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-800/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl" />
          {/* Vidrios decorativos */}
          <svg className="absolute bottom-16 right-12 opacity-10" viewBox="0 0 200 200" width="320" fill="white">
            <polygon points="20,180 100,20 180,180" />
            <polygon points="60,180 100,60 140,180" opacity="0.6" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
              <polygon points="4,28 16,4 28,28" fillOpacity="0.3" />
              <polygon points="4,28 16,10 28,28" fillOpacity="0.5" />
              <polygon points="8,28 16,14 24,28" fillOpacity="1" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg tracking-wide">INDUSVIT</p>
            <p className="text-brand-400 text-xs">ERP Manufactura</p>
          </div>
        </div>

        {/* Tagline central */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión integral<br />para tu empresa<br />
            <span className="text-brand-300">de vidrio.</span>
          </h1>
          <p className="text-brand-400 text-base leading-relaxed max-w-sm">
            Cotizaciones, facturación electrónica DIAN y control de producción en una sola plataforma.
          </p>
          {/* Stats */}
          <div className="flex gap-8 mt-8">
            {[['Cotizaciones', '→ Facturas'], ['DIAN', 'Electrónica'], ['Producción', 'Trazable']].map(([a, b]) => (
              <div key={a}>
                <p className="text-white font-semibold">{a}</p>
                <p className="text-brand-400 text-xs mt-0.5">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-brand-600 text-xs">© 2026 Indusvit S.A.S. · Demo v1.0.0</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-950 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                <polygon points="4,28 16,4 28,28" fillOpacity="0.3" />
                <polygon points="4,28 16,10 28,28" fillOpacity="0.5" />
                <polygon points="8,28 16,14 24,28" fillOpacity="1" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-brand-950 text-base">INDUSVIT</p>
              <p className="text-xs text-gray-400">ERP Manufactura</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-800">Iniciar sesión</h2>
              <p className="text-sm text-gray-400 mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Usuario</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="indusvit.admin"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim() || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <LogIn size={15} />
                )}
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>

            {/* Hint demo */}
            <div className="mt-5 p-3 bg-brand-50 rounded-lg border border-brand-100">
              <p className="text-xs text-brand-600 font-medium mb-1">Credenciales demo</p>
              <p className="text-xs text-brand-500">Usuario: <strong>indusvit.admin</strong></p>
              <p className="text-xs text-brand-500">Contraseña: <strong>indusvit123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
