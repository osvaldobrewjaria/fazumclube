"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  CreditCard,
  Box,
  Zap,
  BarChart3,
  Check,
  ChevronDown,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function MarketingHomePage() {
  const year = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main>
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-bgMain/90 backdrop-blur-md border-b border-faz-secondary/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-3 rounded-full bg-faz-primary" />
              <div className="w-3 h-3 rounded-full bg-faz-secondary" />
            </div>
            <span className="font-heading font-semibold text-lg tracking-tight text-txtMain uppercase">
              Fazumclube
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-txtMain/80">
            <a href="#como-funciona" className="hover:text-faz-primary transition-colors">Como Funciona</a>
            <a href="#recursos" className="hover:text-faz-primary transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-faz-primary transition-colors">Preços</a>
            <a href="#faq" className="hover:text-faz-primary transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/app/login" className="text-sm font-medium hover:text-faz-primary transition-colors">
              Entrar
            </Link>
            <Link
              href="/app/signup"
              className="bg-faz-primary hover:bg-faz-primary-hover text-txtMain px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Criar meu clube
            </Link>
          </div>

          <button 
            className="lg:hidden text-txtMain" 
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-bgMain border-t border-faz-secondary/20 px-6 py-4">
            <nav className="flex flex-col gap-4">
              <a href="#como-funciona" className="text-txtMain/80 hover:text-faz-primary" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <a href="#recursos" className="text-txtMain/80 hover:text-faz-primary" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
              <a href="#precos" className="text-txtMain/80 hover:text-faz-primary" onClick={() => setMobileMenuOpen(false)}>Preços</a>
              <a href="#faq" className="text-txtMain/80 hover:text-faz-primary" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <hr className="border-faz-secondary/20" />
              <Link href="/app/login" className="text-txtMain/80 hover:text-faz-primary">Entrar</Link>
              <Link href="/app/signup" className="bg-faz-primary text-txtMain px-4 py-2 rounded-xl text-center font-semibold">
                Criar meu clube
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-faz-secondary/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-faz-primary animate-pulse" />
            <span className="text-xs font-medium text-faz-secondary tracking-wide uppercase">
              Plataforma SaaS Multi-tenant
            </span>
          </div>

          <h1 className="font-heading font-semibold text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.1] text-txtMain max-w-4xl mb-6">
            Crie seu clube de assinatura e venda com{" "}
            <span className="text-faz-secondary italic">previsibilidade</span>.
          </h1>

          <p className="text-lg sm:text-xl text-txtMain/70 max-w-2xl mb-10 leading-relaxed font-light">
            Monte planos, configure cobrança recorrente, área do assinante e gestão de entregas — tudo em um só lugar. Ideal para qualquer nicho.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link
              href="/app/signup"
              className="w-full sm:w-auto bg-faz-primary hover:bg-faz-primary-hover text-txtMain px-8 py-4 rounded-2xl text-base font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Criar meu clube
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/t/demo"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-txtMain border border-faz-secondary/30 px-8 py-4 rounded-2xl text-base font-medium transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-faz-secondary" />
              Ver demonstração
            </Link>
          </div>

          {/* Mockup visual */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="relative bg-surface rounded-3xl border border-faz-secondary/20 shadow-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9]">
              <div className="absolute top-0 w-full h-12 border-b border-gray-100 bg-gray-50/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-200" />
                  <div className="w-3 h-3 rounded-full bg-yellow-200" />
                  <div className="w-3 h-3 rounded-full bg-green-200" />
                </div>
                <div className="ml-4 w-64 h-6 rounded-md bg-white border border-gray-100" />
              </div>

              <div className="flex h-full pt-12">
                <div className="w-16 lg:w-60 border-r border-gray-100 p-4 flex-col gap-4 hidden sm:flex">
                  <div className="w-full h-8 bg-gray-100 rounded-lg" />
                  <div className="w-full h-8 bg-gray-50 rounded-lg" />
                  <div className="w-3/4 h-8 bg-gray-50 rounded-lg" />
                  <div className="w-full h-8 bg-gray-50 rounded-lg" />
                </div>

                <div className="flex-1 p-6 lg:p-8 bg-white">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                      <div className="h-8 w-48 bg-gray-900 rounded" />
                    </div>
                    <div className="h-10 w-32 bg-faz-primary rounded-lg" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="h-32 rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                      <div className="h-8 w-8 rounded-full bg-faz-primary/20 mb-4" />
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-6 w-24 bg-gray-800 rounded" />
                    </div>
                    <div className="h-32 rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                      <div className="h-8 w-8 rounded-full bg-green-100 mb-4" />
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-6 w-24 bg-gray-800 rounded" />
                    </div>
                    <div className="h-32 rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 mb-4" />
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-6 w-24 bg-gray-800 rounded" />
                    </div>
                  </div>

                  <div className="h-48 w-full rounded-xl border border-gray-100 bg-gray-50 relative flex items-end justify-between px-8 pb-4 gap-4">
                    <div className="w-full bg-faz-secondary/20 rounded-t-lg h-[40%]" />
                    <div className="w-full bg-faz-secondary/40 rounded-t-lg h-[60%]" />
                    <div className="w-full bg-faz-primary/80 rounded-t-lg h-[80%]" />
                    <div className="w-full bg-faz-secondary/30 rounded-t-lg h-[50%]" />
                    <div className="w-full bg-faz-secondary/50 rounded-t-lg h-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-faz-secondary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-faz-primary/10 blur-[120px]" />
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-faz-secondary/10 bg-white/30 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-txtMain/60 mb-6 tracking-wide">
            TECNOLOGIA ROBUSTA PARA CLUBES DE TODOS OS NICHOS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-heading font-semibold text-lg">
              <ShieldCheck className="w-6 h-6" /> Segurança
            </div>
            <div className="flex items-center gap-2 font-heading font-semibold text-lg">
              <CreditCard className="w-6 h-6" /> Pagamentos
            </div>
            <div className="flex items-center gap-2 font-heading font-semibold text-lg">
              <Box className="w-6 h-6" /> Entregas
            </div>
            <div className="flex items-center gap-2 font-heading font-semibold text-lg">
              <Zap className="w-6 h-6" /> Performance
            </div>
            <div className="flex items-center gap-2 font-heading font-semibold text-lg">
              <BarChart3 className="w-6 h-6" /> Métricas (em breve)
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-3xl lg:text-4xl tracking-tight mb-4">
              Do zero ao lançamento em minutos
            </h2>
            <p className="text-lg text-txtMain/70 max-w-2xl mx-auto font-light">
              Simplificamos a complexidade técnica para que você foque na curadoria e no crescimento do seu clube.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-faz-secondary/0 via-faz-secondary/30 to-faz-secondary/0 z-0" />

            {[
              { n: "1", title: "Crie seu tenant", desc: "Defina nome, subdomínio e identidade visual do seu clube." },
              { n: "2", title: "Configure os planos", desc: "Crie planos mensais, trimestrais ou anuais e defina benefícios." },
              { n: "3", title: "Venda e gerencie", desc: "Compartilhe sua página e organize assinantes e entregas." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative bg-surface p-8 rounded-3xl border border-faz-secondary/10 shadow-sm hover:shadow-md transition-shadow z-10 group"
              >
                <div className="w-12 h-12 bg-bgMain rounded-xl flex items-center justify-center border border-faz-secondary/20 mb-6 group-hover:scale-110 transition-transform">
                  <span className="font-heading font-bold text-xl text-faz-primary">{s.n}</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3">{s.title}</h3>
                <p className="text-txtMain/70 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS GRID */}
      <section id="recursos" className="py-24 bg-white/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-heading font-semibold text-3xl lg:text-4xl tracking-tight mb-4">
                Tudo o que um clube precisa
              </h2>
              <p className="text-lg text-txtMain/70 font-light">
                Ferramentas para transformar sua ideia em receita recorrente.
              </p>
            </div>
            <Link href="/app/signup" className="text-faz-secondary hover:text-faz-primary font-medium flex items-center gap-2 group">
              Criar meu clube
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Checkout Recorrente", desc: "Cobrança automática no cartão de crédito. Outros métodos em breve.", icon: CreditCard },
              { title: "Área do Assinante", desc: "Portal para gerenciar dados, histórico de pagamentos e envios.", icon: Box },
              { title: "Gestão de Planos", desc: "Crie opções mensais, trimestrais e regras do seu clube.", icon: BarChart3 },
              { title: "Página Personalizável", desc: "Landing page do clube com sua marca, cores e textos.", icon: ShieldCheck },
              { title: "Notificações", desc: "Emails transacionais para boas-vindas e avisos (em liberação).", icon: Zap },
              { title: "Métricas", desc: "MRR, churn e relatórios (em breve).", icon: BarChart3 },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-surface border border-faz-secondary/10 hover:border-faz-secondary/30 transition-colors">
                <f.icon className="w-8 h-8 text-faz-secondary mb-4" />
                <h3 className="font-heading font-medium text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-txtMain/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-3xl lg:text-4xl tracking-tight mb-4">
              Planos transparentes
            </h2>
            <p className="text-lg text-txtMain/70">
              Comece pequeno e cresça. Sem taxas escondidas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {[
              { name: "Starter", price: "R$ 97", desc: "Para validar a ideia.", cta: "Começar agora", featured: false },
              { name: "Pro", price: "R$ 197", desc: "Para crescer com tração.", cta: "Criar meu clube", featured: true },
              { name: "Scale", price: "R$ 397", desc: "Para alto volume.", cta: "Falar com vendas", featured: false },
            ].map((p) => (
              <div
                key={p.name}
                className={[
                  "p-8 bg-white rounded-3xl shadow-sm",
                  p.featured ? "border-2 border-faz-primary shadow-lg md:-translate-y-4 relative" : "border border-faz-secondary/10",
                ].join(" ")}
              >
                {p.featured && (
                  <div className="absolute top-0 right-0 bg-faz-primary text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase tracking-wider">
                    Popular
                  </div>
                )}
                <h3 className="font-heading font-semibold text-xl mb-2">{p.name}</h3>
                <p className="text-sm text-txtMain/60 mb-6">{p.desc}</p>
                <div className="text-3xl font-bold mb-6 font-heading">
                  {p.price}
                  <span className="text-base font-normal text-txtMain/60">/mês</span>
                </div>
                <Link
                  href="/app/signup"
                  className={[
                    "block w-full text-center py-3 rounded-xl font-medium transition-colors mb-8",
                    p.featured ? "bg-faz-primary hover:bg-faz-primary-hover text-txtMain font-semibold shadow-sm" : "border border-faz-secondary/30 hover:border-faz-secondary",
                  ].join(" ")}
                >
                  {p.cta}
                </Link>

                <ul className="space-y-3 text-sm text-txtMain/80">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-faz-secondary" /> Checkout recorrente (Stripe)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-faz-secondary" /> Página do clube personalizável</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-faz-secondary" /> Área do assinante (MVP)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-faz-secondary" /> Stripe Connect (liberação gradual)</li>
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 text-xs text-txtMain/50">
            * Valores e limites são editáveis e podem ser ajustados no lançamento.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white/40">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading font-semibold text-3xl tracking-tight mb-12 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Preciso de CNPJ para começar?",
                a: "Você pode iniciar como PF para validar a ideia. Para operação em escala e questões fiscais, é comum evoluir para PJ.",
              },
              {
                q: "Posso usar meu próprio domínio?",
                a: "Sim. A conexão de domínio pode ser liberada por plano e/ou fase do produto.",
              },
              {
                q: "Como funciona o repasse do dinheiro?",
                a: "No modelo Connect Standard, o pagamento cai na conta Stripe do tenant conectado. A plataforma integra e automatiza o fluxo.",
              },
              {
                q: "Tem período de teste?",
                a: "Você pode criar o clube em modo rascunho. A ativação para vender pode depender do plano e da conexão do Stripe.",
              },
            ].map((item) => (
              <details key={item.q} className="group bg-surface rounded-xl border border-faz-secondary/10 overflow-hidden transition-all duration-300 open:shadow-md">
                <summary className="flex justify-between items-center cursor-pointer p-6 list-none font-medium text-lg">
                  <span>{item.q}</span>
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-faz-secondary" />
                  </span>
                </summary>
                <div className="text-txtMain/70 px-6 pb-6 pt-0 leading-relaxed text-sm">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-faz-secondary/10 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading font-semibold text-4xl lg:text-5xl tracking-tight mb-6">
            Pronto para lançar seu clube?
          </h2>
          <p className="text-xl text-txtMain/70 mb-10 font-light">
            Crie seu tenant em minutos e comece a vender assinaturas com uma estrutura profissional.
          </p>

          <Link
            href="/app/signup"
            className="inline-flex items-center justify-center gap-2 bg-faz-primary hover:bg-faz-primary-hover text-txtMain px-10 py-5 rounded-2xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Criar meu clube agora
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-6 text-sm text-txtMain/50">Sem cartão de crédito para testar o admin.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1814] text-white py-16 border-t border-faz-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-3 rounded-full bg-faz-primary" />
                  <div className="w-3 h-3 rounded-full bg-faz-secondary" />
                </div>
                <span className="font-heading font-semibold text-lg uppercase tracking-tight text-[#F5F1E6]">
                  Fazumclube
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Plataforma para criação e gestão de clubes de assinatura. Foque no produto e na curadoria — nós cuidamos da tecnologia.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#F5F1E6] mb-4">Produto</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#como-funciona" className="hover:text-faz-primary transition-colors">Como Funciona</a></li>
                <li><a href="#recursos" className="hover:text-faz-primary transition-colors">Recursos</a></li>
                <li><a href="#precos" className="hover:text-faz-primary transition-colors">Preços</a></li>
                <li><Link href="/app/login" className="hover:text-faz-primary transition-colors">Entrar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#F5F1E6] mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link href="/contato" className="hover:text-faz-primary transition-colors">Contato</Link></li>
                <li><Link href="/blog" className="hover:text-faz-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#F5F1E6] mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link href="/termos" className="hover:text-faz-primary transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-faz-primary transition-colors">Privacidade</Link></li>
                <li><Link href="/cookies" className="hover:text-faz-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/40">© {year} Fazumclube. Todos os direitos reservados.</div>
            <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-faz-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-faz-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-faz-primary transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
