"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Rocket, Check, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Gerar slug a partir do nome
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);
}

export default function AppSignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Dados do usuário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Dados do clube
  const [clubName, setClubName] = useState("");
  const [clubSlug, setClubSlug] = useState("");

  const handleClubNameChange = (value: string) => {
    setClubName(value);
    setClubSlug(generateSlug(value));
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Provisionar tenant + owner em uma única operação
      const provisionRes = await fetch(`${API_URL}/tenants/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: name,
          ownerEmail: email,
          ownerPassword: password,
          tenantName: clubName,
          tenantSlug: clubSlug,
          businessType: "OTHER", // Default, pode ser expandido no futuro
        }),
      });

      const provisionData = await provisionRes.json();

      if (!provisionRes.ok) {
        throw new Error(provisionData.message || "Erro ao criar clube");
      }

      // 2. Fazer login para obter token
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        setAuth(loginData.user, loginData.access_token, loginData.refresh_token || "");
      }

      // 3. Redirecionar para o admin do tenant
      router.push(`/t/${clubSlug}/admin`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar clube");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex flex-col gap-0.5">
            <div className="w-3 h-3 rounded-full bg-faz-primary" />
            <div className="w-3 h-3 rounded-full bg-faz-secondary" />
          </div>
          <span className="font-heading font-semibold text-xl tracking-tight text-txtMain uppercase">
            Fazumclube
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-faz-secondary/20 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-faz-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-faz-primary" />
            </div>
            <h1 className="font-heading font-semibold text-2xl text-txtMain mb-2">
              {step === 1 ? "Criar sua conta" : "Configurar seu clube"}
            </h1>
            <p className="text-txtMain/60 text-sm">
              {step === 1
                ? "Primeiro, crie sua conta na plataforma"
                : "Agora, defina o nome do seu clube"}
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-faz-primary" : "bg-faz-secondary/20"}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-faz-primary" : "bg-faz-secondary/20"}`} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: User Data */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-txtMain/80 mb-2">Seu nome</label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txtMain/80 mb-2">Seu email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txtMain/80 mb-2">Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-faz-primary hover:bg-faz-primary-hover text-txtMain py-3 rounded-xl font-semibold transition-colors"
              >
                Continuar
              </button>
            </form>
          )}

          {/* Step 2: Club Data */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-txtMain/80 mb-2">Nome do clube</label>
                <input
                  type="text"
                  placeholder="Ex: Clube do Vinho"
                  value={clubName}
                  onChange={(e) => handleClubNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txtMain/80 mb-2">URL do clube</label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-faz-secondary/10 border border-r-0 border-faz-secondary/30 rounded-l-xl text-txtMain/50 text-sm">
                    fazumclube.com/t/
                  </span>
                  <input
                    type="text"
                    placeholder="meu-clube"
                    value={clubSlug}
                    onChange={(e) => setClubSlug(generateSlug(e.target.value))}
                    required
                    pattern="[a-z0-9-]+"
                    className="flex-1 px-4 py-3 rounded-r-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-txtMain/50 mt-1">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              {/* Benefits reminder */}
              <div className="bg-bgMain/50 rounded-xl p-4 mt-4">
                <p className="text-xs font-medium text-txtMain/60 mb-2">Você terá acesso a:</p>
                <ul className="space-y-1">
                  {[
                    "Página personalizada",
                    "Checkout recorrente",
                    "Gestão de assinantes",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-txtMain/50">
                      <Check className="w-3 h-3 text-faz-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-faz-secondary/30 hover:border-faz-secondary rounded-xl text-txtMain/70 font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-faz-primary hover:bg-faz-primary-hover disabled:bg-faz-primary/50 text-txtMain py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar meu clube"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-txtMain/60">
            Já tem uma conta?{" "}
            <Link href="/app/login" className="text-faz-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-txtMain/50 hover:text-txtMain transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
