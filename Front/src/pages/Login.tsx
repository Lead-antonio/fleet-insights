import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Loader } from '@/components/ui/loader';

function ImagePanel() {
  return (
    <div className="hidden lg:flex relative flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden rounded-r-2xl">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center">
        {/* Logo badge */}
        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
          <img src="/m-tec.png" alt="M-tec" className="w-16 h-16 object-contain" />
        </div>

        {/* Brand copy */}
        <div className="text-white space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Fleet Manager</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Gérez votre flotte de véhicules avec efficacité. Suivi en temps réel, maintenance, et rapports avancés.
          </p>
        </div>

        {/* Welcome back card */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-medium">Connexion</p>
          <p className="text-white font-semibold text-sm mb-1">👋 Bon retour parmi nous</p>
          <p className="text-white/60 text-xs leading-relaxed">
            Accédez à votre tableau de bord et suivez l'état de votre flotte en temps réel.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Suivi GPS", "Maintenance", "Rapports", "Alertes"].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs border border-white/20"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const access = res.data.response.access_token;
      const refresh = res.data.response.refresh_token;
      login(access, refresh);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }     
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-card border border-border">

        {/* ── LEFT: Form ── */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* Logo + app name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <img src="/m-tec.png" alt="M-tec" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none">M-tec</p>
              <p className="text-sm font-bold leading-tight">Fleet Manager</p>
            </div>
          </div>

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.login.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.login.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fleet.ma"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.login.password}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gradient-primary mt-2" disabled={loading}>
              {loading ? <Loader size="sm" /> : t.login.signIn}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.login.noAccount}{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t.register.createAccount}
            </Link>
          </p>
        </div>

        {/* ── RIGHT: Branding panel ── */}
        <ImagePanel />
      </div>
    </div>
  );
};

export default Login;
