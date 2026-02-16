import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

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
      console.log("Réponse du serveur :", res.data);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* <div className="mx-auto w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-4"> */}
            <img className="mx-auto w-20 h-20" src="/fleet.png" alt="" />
          {/* </div> */}
          {/* <CardTitle className="text-2xl">M-tec Fleet Master</CardTitle> */}
          <CardDescription>{t.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">{t.login.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full gradient-primary">
              {loading ? "Connexion en cours..." : t.login.signIn}
            </Button>
            {error && (
              <div className="mb-3 text-red-500 text-sm">{error}</div>
            )}
            {/* <Button type="button" variant="outline" className="w-full" onClick={handleDemo}>
              {t.login.demoAccess}
            </Button> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
