"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * ROTA LEGADA - TRANSIÇÃO
 * 
 * /admin/* redireciona conforme contexto:
 * - usuário não logado → /app/login
 * - usuário logado com 1 tenant → /t/[slug]/admin
 * - usuário logado com múltiplos tenants → /app/dashboard
 * - usuário sem tenants → /app/dashboard
 * - fallback (erro/sem contexto) → /app/dashboard
 * 
 * IMPORTANTE: Nunca redireciona para um tenant específico como fallback.
 * Brewjaria é apenas um tenant, não um "default".
 * 
 * Esta rota será removida após migração completa.
 * Ver: docs/FAZUMCLUBE-ARCHITECTURE.md
 */
export default function AdminCatchAllRedirect({
  params,
}: {
  params: { path?: string[] };
}) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const subPath = params.path?.join("/") || "";

  useEffect(() => {
    const resolveRedirect = async () => {
      // 1. Usuário não logado → /app/login
      if (!accessToken) {
        router.replace("/app/login");
        return;
      }

      try {
        // 2. Buscar tenants do usuário
        const res = await fetch(`${API_URL}/tenants/my`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          // Token inválido ou expirado → login
          router.replace("/app/login");
          return;
        }

        const tenants = await res.json();

        if (tenants.length === 1) {
          // 1 tenant → admin direto
          const slug = tenants[0].slug;
          router.replace(`/t/${slug}/admin${subPath ? `/${subPath}` : ""}`);
        } else {
          // 0 ou múltiplos tenants → dashboard
          router.replace("/app/dashboard");
        }
      } catch (error) {
        // Fallback neutro: nunca para um tenant específico
        router.replace("/app/dashboard");
      }
    };

    resolveRedirect();
  }, [accessToken, router, subPath]);

  // Loading enquanto resolve
  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-faz-primary mx-auto mb-4" />
        <p className="text-txtMain/60 text-sm">Redirecionando...</p>
      </div>
    </div>
  );
}
