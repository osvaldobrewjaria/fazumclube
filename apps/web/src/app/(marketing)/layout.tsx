import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAZUMCLUBE | Crie seu Clube de Assinatura",
  description: "Plataforma SaaS para criação e gestão de clubes de assinatura. Venda recorrente com previsibilidade.",
  keywords: ["clube de assinatura", "SaaS", "recorrência", "assinatura", "subscription box"],
  openGraph: {
    title: "FAZUMCLUBE | Crie seu Clube de Assinatura",
    description: "Plataforma SaaS para criação e gestão de clubes de assinatura.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O layout raiz já fornece <html> e <body>
  // Este layout apenas sobrescreve metadata e pode adicionar wrappers específicos
  return (
    <div className="bg-bgMain text-txtMain overflow-x-hidden min-h-screen">
      {children}
    </div>
  );
}
