import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Loader } from '@/components/ui/loader';
import { set } from 'date-fns';

const Register = () => {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password !== confirmPassword) {
      toast.error(t.register.passwordMismatch);
      return;
    }
    if (userForm.password.length < 6) {
      toast.error(t.register.passwordTooShort);
      return;
    }
    setLoading(true);
    try {
        const resp = await signUp(userForm);
        setLoading(false);
        toast.success(resp);
        navigate('/login');
    } catch (error) {
        setLoading(false); 
        toast.error(error.message);
        setUserForm({ email: "", password: "" });
        setConfirmPassword('');
    }
            
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-25 h-25 rounded-xl  flex items-center justify-center mb-4">
            <img className="mx-auto w-20 h-20" src="/m-tec.png" alt="" />
          </div>
          <CardTitle className="text-2xl">M-tec Fleet Master</CardTitle>
          <CardDescription>{t.register.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">{t.login.email}</Label>
                <Input id="email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="admin@fleet.ma" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t.login.password}</Label>
                <Input id="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            
            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? <Loader size="sm" /> : t.register.createAccount}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t.register.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-primary hover:underline">{t.login.signIn}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
