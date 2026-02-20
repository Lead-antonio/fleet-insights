import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Branding panel ────────────────────────────────────────────────────────────
function ImagePanel() {
  return (
    <div className="hidden lg:flex relative flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden rounded-r-2xl">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-12 text-center">
        {/* Lock icon instead of logo for context */}
        <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="text-white space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Fleet Manager</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Pas d'inquiétude — nous vous enverrons un lien sécurisé pour réinitialiser votre accès.
          </p>
        </div>

        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left space-y-2">
          <p className="text-white font-semibold text-sm">🔒 Votre compte est protégé</p>
          <ul className="space-y-1 text-white/60 text-xs">
            <li>• Le lien expire après 30 minutes</li>
            <li>• Usage unique uniquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">E-mail envoyé !</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
          Un lien de réinitialisation a été envoyé à{" "}
          <span className="font-medium text-foreground">{email}</span>.
          Vérifiez aussi vos spams.
        </p>
      </div>

      <div className="w-full rounded-lg bg-muted/60 border border-border px-4 py-3 text-xs text-muted-foreground text-left space-y-1">
        <p>✅ Vérifiez votre boîte de réception</p>
        <p>⏱ Le lien expire dans 30 minutes</p>
        <p>📧 Expéditeur : noreply@m-tec.ma</p>
      </div>

      <Link to="/login" className="w-full">
        <Button variant="outline" className="w-full">
          ← Retour à la connexion
        </Button>
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await forgotPassword(email);
      if (error) {
        setError(t.forgotPassword.errors[error.code]);
      } else {
        setSent(true);
      }
    } catch {
      setError(t.forgotPassword.errors.default);
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-sm font-bold leading-tight">Fleet Manager</p>
            </div>
          </div>

          {sent ? (
            <SuccessState email={email} />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié ?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Entrez votre e-mail pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="admin@fleet.ma"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                  {loading ? <Loader size="sm" /> : "Envoyer le lien"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Se connecter
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