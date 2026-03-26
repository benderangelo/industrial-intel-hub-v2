import { useState, useEffect } from "react";
import caseLogo from "@/assets/CASE_Construction_logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, AlertCircle } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill fields for easy demo access if wanted, but empty is more realistic
  useEffect(() => {
    // Optionally focus the username input
    document.getElementById("username")?.focus();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    // Simulate network delay for real feel
    setTimeout(() => {
      const isNexusUser = username.toLowerCase() === "nexus" && password === "case2026";
      const isAdminUser = username.toLowerCase() === "admin" && password === "demohub";

      if (isNexusUser || isAdminUser) {
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Decorative top bar */}
      <div className="h-1.5 w-full bg-primary" />
      
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            {/* Header Area */}
            <div className="bg-secondary/30 p-8 text-center">
              <img 
                src={caseLogo} 
                alt="CASE Construction" 
                className="mx-auto h-12 w-auto object-contain" 
              />
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">CASE NEXUS</h1>
              <p className="mt-1 text-sm font-medium tracking-[0.15em] text-muted-foreground uppercase">
                Portfolio Intelligence Hub
              </p>
            </div>

            {/* Form Area */}
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Credenciais inválidas. Tente novamente.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Usuário (nexus)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-11 h-12 border-border/60 bg-secondary/20"
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha (case2026)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 border-border/60 bg-secondary/20"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="h-12 w-full text-base font-semibold"
                  disabled={loading || !username || !password}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Autenticando...</span>
                    </div>
                  ) : (
                    "Acessar Plataforma"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border/60 text-center">
                <p className="text-xs text-muted-foreground">
                  Acesso restrito a engenheiros e gestores de portfólio da CASE Construction Equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
