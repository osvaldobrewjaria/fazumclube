"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AppLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      // Salvar tokens e usuário
      setAuth(data.user, data.access_token, data.refresh_token || "");

      // Redirecionar para o dashboard
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
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
              <LogIn className="w-8 h-8 text-faz-primary" />
            </div>
            <h1 className="font-heading font-semibold text-2xl text-txtMain mb-2">
              Entrar na plataforma
            </h1>
            <p className="text-txtMain/60 text-sm">
              Acesse o painel do seu clube de assinatura
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-txtMain/80 mb-2">Email</label>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-faz-secondary/30 bg-bgMain/50 text-txtMain placeholder-txtMain/40 focus:outline-none focus:border-faz-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-faz-primary hover:bg-faz-primary-hover disabled:bg-faz-primary/50 text-txtMain py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="text-center">
            <Link 
              href="/esqueci-senha" 
              className="text-sm text-txtMain/50 hover:text-faz-primary transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-txtMain/60">
            Não tem uma conta?{" "}
            <Link href="/app/signup" className="text-faz-primary hover:underline font-medium">
              Criar meu clube
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
