import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";

// ── Password strength helper ──────────────────────────────────────────────────
function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Très faible", color: "bg-destructive" };
  if (score === 2) return { score, label: "Faible", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Moyen", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Fort", color: "bg-green-400" };
  return { score, label: "Très fort", color: "bg-green-600" };
}

// ── Branding panel ────────────────────────────────────────────────────────────
function ImagePanel() {
  return (
    <div className="hidden lg:flex relative flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden rounded-r-2xl">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center">
        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
          <img src="/m-tec.png" alt="M-tec" className="w-16 h-16 object-contain" />
        </div>

        <div className="text-white space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">M-tec Fleet Master</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Choisissez un nouveau mot de passe sécurisé pour protéger l'accès à votre flotte.
          </p>
        </div>

        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-medium">Conseils</p>
          <p className="text-white font-semibold text-sm mb-2">🛡️ Mot de passe fort</p>
          <ul className="space-y-1 text-white/60 text-xs">
            <li>• Au moins 8 caractères</li>
            <li>• Une lettre majuscule</li>
            <li>• Un chiffre</li>
            <li>• Un caractère spécial (!@#$…)</li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["Suivi GPS", "Maintenance", "Rapports", "Alertes"].map((feat) => (
            <span key={feat} className="px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs border border-white/20">
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState() {
  return (
    <div className="flex flex-col items-center text-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">Mot de passe mis à jour !</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
          Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
        </p>
      </div>

      <div className="w-full rounded-lg bg-green-500/5 border border-green-500/20 px-4 py-3 text-xs text-muted-foreground text-left space-y-1">
        <p>✅ Mot de passe mis à jour</p>
        <p>🔐 Votre compte est sécurisé</p>
        <p>🚀 Vous pouvez vous connecter</p>
      </div>

      <Link to="/login" className="w-full">
        <Button className="w-full gradient-primary">
          Se connecter →
        </Button>
      </Link>
    </div>
  );
}

// ── Invalid token state ───────────────────────────────────────────────────────
function InvalidTokenState() {
  return (
    <div className="flex flex-col items-center text-center gap-5 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">Lien invalide ou expiré</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
          Ce lien de réinitialisation a expiré ou a déjà été utilisé. Faites une nouvelle demande.
        </p>
      </div>

      <Link to="/forgot-password" className="w-full">
        <Button className="w-full gradient-primary">
          Nouvelle demande
        </Button>
      </Link>
      <Link to="/login" className="text-sm text-primary hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL: /reset-password?token=xxxx
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(password);

  const validate = () => {
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      // TODO: appel API — ex: await authService.resetPassword({ token, password })
      await new Promise((r) => setTimeout(r, 1500));
      setDone(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle eye icon ─────────────────────────────────────────────────────────
  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {visible ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-card border border-border">

        {/* ── LEFT: Form ── */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <img src="/m-tec.png" alt="M-tec" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none">M-tec</p>
              <p className="text-sm font-bold leading-tight">Fleet Master</p>
            </div>
          </div>

          {/* States */}
          {!token ? (
            <InvalidTokenState />
          ) : done ? (
            <SuccessState />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      required
                      className={`pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-destructive focus-visible:ring-destructive"
                          : confirmPassword && confirmPassword === password
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Les mots de passe correspondent
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                  {loading ? <Loader size="sm" /> : "Réinitialiser le mot de passe"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>

        {/* ── RIGHT: Branding panel ── */}
        <ImagePanel />
      </div>
    </div>
  );
}