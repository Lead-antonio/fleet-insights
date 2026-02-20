import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from '@/components/ui/sonner';
import { useLanguage } from "@/contexts/LanguageContext";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country: string;
  state: string;
  number: string;
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${isActive ? "bg-primary text-primary-foreground shadow-md scale-110" : ""}
                ${isDone ? "bg-primary/70 text-primary-foreground" : ""}
                ${!isActive && !isDone ? "bg-muted text-muted-foreground" : ""}
              `}
            >
              {isDone ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div
                className={`h-0.5 w-10 rounded transition-all duration-300 ${
                  isDone ? "bg-primary/70" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImagePanel({ step }: { step: number }) {
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

        {/* Step-aware tip card */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left transition-all duration-500">
          {step === 1 ? (
            <>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-medium">Étape 1</p>
              <p className="text-white font-semibold text-sm mb-1">🔐 Sécurisez votre accès</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Choisissez un mot de passe robuste d'au moins 6 caractères pour protéger votre compte.
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-medium">Étape 2</p>
              <p className="text-white font-semibold text-sm mb-1">👤 Votre profil</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Ces informations personnalisent votre expérience et facilitent le support technique.
              </p>
            </>
          )}
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

// ── Main component ─────────────────────────────────────────────────────────────
export default function Register() {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm | "confirmPassword", string>>>({});

  const [userForm, setUserForm] = useState<UserForm>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    country: "",
    state: "",
    number: "",
  });

  const set = (field: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Validation étape 1 ──────────────────────────────────────────────────────
  const validateStep1 = () => {
    const newErrors: typeof errors = {};
    if (!userForm.email) newErrors.email = t.validation.email.required;
    else if (!/\S+@\S+\.\S+/.test(userForm.email)) newErrors.email = t.validation.email.invalid;
    if (!userForm.password) newErrors.password = t.validation.password.required;
    else if (userForm.password.length < 6) newErrors.password = t.validation.password.minLength;
    if (!confirmPassword) newErrors.confirmPassword = t.validation.confirmPassword.required;
    else if (userForm.password !== confirmPassword) newErrors.confirmPassword = t.validation.confirmPassword.mismatch;
    return newErrors;
  };

  const handleNextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  // ── Submit final ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await signUp(userForm);
      toast.success(resp);
      navigate('/login');
    }
    catch (error) {
        setLoading(false); 
        const code = error.code || 'default';
        toast.error(t.register?.[code]);
        setUserForm({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          country: "",
          state: "",
          number: "",
        });
        setConfirmPassword('');
    } 
    finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      {/*
        ┌─────────────────────┬──────────────────────┐
        │   Formulaire (50%)  │  Branding panel (50%) │
        └─────────────────────┴──────────────────────┘
      */}
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Créer un compte" : "Votre profil"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Renseignez vos identifiants de connexion"
                : "Quelques informations supplémentaires"}
            </p>
          </div>

          <StepIndicator current={step} total={2} />

          {/* ── Step 1: Credentials ── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={set("email")}
                  placeholder="admin@fleet.ma"
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="button" className="w-full gradient-primary mt-2" onClick={handleNextStep}>
                Suivant →
              </Button>
            </div>
          )}

          {/* ── Step 2: Profile ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input id="first_name" type="text" value={userForm.first_name} onChange={set("first_name")} placeholder="Jean" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input id="last_name" type="text" value={userForm.last_name} onChange={set("last_name")} placeholder="Dupont" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" type="text" value={userForm.country} onChange={set("country")} placeholder="Maroc" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">Ville</Label>
                  <Input id="state" type="text" value={userForm.state} onChange={set("state")} placeholder="Casablanca" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="number">Télénumber</Label>
                <Input id="number" type="tel" value={userForm.number} onChange={set("number")} placeholder="+212 6 00 00 00 00" required />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>
                  ← Retour
                </Button>
                <Button type="submit" className="flex-1 gradient-primary" disabled={loading}>
                  {loading ? <Loader size="sm" /> : "Créer le compte"}
                </Button>
              </div>
            </form>
          )}

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        {/* ── RIGHT: Branding / image panel ── */}
        <ImagePanel step={step} />
      </div>
    </div>
  );
}