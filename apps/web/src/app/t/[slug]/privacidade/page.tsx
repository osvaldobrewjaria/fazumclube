'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import HeaderShared from '@/components/shared/HeaderShared'
import FooterShared from '@/components/shared/FooterShared'

export default function PrivacidadePage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderShared />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link 
            href={`/t/${slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-8"
          >
            <ArrowLeft size={20} />
            Voltar
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Política de Privacidade
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-foreground/80">
              A {tenant.name}, comprometida com a proteção dos dados pessoais de seus usuários, estabelece esta
              Política de Privacidade em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº
              13.709/2018).
            </p>
            <p className="text-foreground/80">
              Ao utilizar o site e os serviços da {tenant.name}, o usuário declara estar ciente e de acordo com os termos aqui
              descritos.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. CONTROLADOR DOS DADOS</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="font-bold text-foreground">{tenant.name}</p>
                <p className="text-muted-foreground">Razão Social: {tenant.legal.companyName}</p>
                <p className="text-muted-foreground">CNPJ: {tenant.legal.cnpj}</p>
                <p className="text-muted-foreground">Endereço: {tenant.legal.address}</p>
                <p className="text-muted-foreground">E-mail: {tenant.contact.email}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. DADOS COLETADOS</h2>
              <p className="text-foreground/80">
                A {tenant.name} poderá coletar e tratar os seguintes dados pessoais:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Nome completo</li>
                <li>CPF</li>
                <li>Endereço de e-mail</li>
                <li>Telefone</li>
                <li>Endereço de entrega</li>
                <li>Dados de pagamento (processados por gateway seguro)</li>
                <li>Preferências de consumo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. FINALIDADE DO TRATAMENTO</h2>
              <p className="text-foreground/80">Os dados são coletados para:</p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Processamento e entrega de pedidos</li>
                <li>Comunicação sobre status de assinatura</li>
                <li>Envio de ofertas e novidades (com consentimento)</li>
                <li>Melhoria dos serviços oferecidos</li>
                <li>Cumprimento de obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. COMPARTILHAMENTO DE DADOS</h2>
              <p className="text-foreground/80">
                Os dados poderão ser compartilhados com:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Transportadoras para entrega dos produtos</li>
                <li>Gateways de pagamento para processamento financeiro</li>
                <li>Autoridades competentes, quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. SEUS DIREITOS</h2>
              <p className="text-foreground/80">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização ou exclusão de dados</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. CONTATO</h2>
              <p className="text-foreground/80">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <p className="text-primary font-medium mt-2">
                {tenant.contact.email}
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterShared />
    </div>
  )
}
