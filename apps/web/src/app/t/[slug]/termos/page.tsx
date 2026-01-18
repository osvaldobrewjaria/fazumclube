'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import HeaderShared from '@/components/shared/HeaderShared'
import FooterShared from '@/components/shared/FooterShared'

export default function TermosPage() {
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
            Termos de Serviço
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-foreground/80">
              Bem-vindo ao {tenant.name}. Ao utilizar nossos serviços, você concorda com os termos e condições
              descritos abaixo. Leia atentamente antes de prosseguir.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. DEFINIÇÕES</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li><strong>Plataforma:</strong> Site e aplicativos do {tenant.name}</li>
                <li><strong>Usuário:</strong> Pessoa física que utiliza os serviços</li>
                <li><strong>Assinatura:</strong> Contrato de fornecimento recorrente de produtos</li>
                <li><strong>Produtos:</strong> Itens incluídos nos planos de assinatura</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. OBJETO</h2>
              <p className="text-foreground/80">
                O {tenant.name} oferece serviço de assinatura para entrega periódica de produtos selecionados,
                conforme o plano escolhido pelo usuário.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. CADASTRO</h2>
              <p className="text-foreground/80">
                Para utilizar os serviços, o usuário deve:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Ter idade mínima de 18 anos</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. PLANOS E PAGAMENTO</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Os valores são cobrados mensalmente de forma recorrente</li>
                <li>O pagamento é processado por gateway seguro</li>
                <li>Em caso de falha no pagamento, a assinatura pode ser suspensa</li>
                <li>Alterações de plano podem ser solicitadas a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. ENTREGAS</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>As entregas são realizadas no endereço cadastrado</li>
                <li>O prazo de entrega varia conforme a região</li>
                <li>O usuário deve garantir que haja alguém para receber o pedido</li>
                <li>Problemas na entrega devem ser reportados em até 48 horas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. CANCELAMENTO</h2>
              <p className="text-foreground/80">
                O usuário pode cancelar sua assinatura a qualquer momento:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>O cancelamento deve ser solicitado antes do próximo ciclo de cobrança</li>
                <li>Não há multa por cancelamento</li>
                <li>Pedidos já processados serão entregues normalmente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. RESPONSABILIDADES</h2>
              <p className="text-foreground/80">
                O {tenant.name} se compromete a:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mt-4">
                <li>Entregar produtos de qualidade</li>
                <li>Manter a segurança dos dados do usuário</li>
                <li>Prestar suporte em caso de problemas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. DISPOSIÇÕES GERAIS</h2>
              <p className="text-foreground/80">
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro
                da comarca de São Paulo/SP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. CONTATO</h2>
              <p className="text-foreground/80">
                Para dúvidas sobre estes termos:
              </p>
              <div className="bg-card border border-border rounded-lg p-6 mt-4">
                <p className="font-bold text-foreground">{tenant.name}</p>
                <p className="text-muted-foreground">{tenant.legal.companyName}</p>
                <p className="text-primary">{tenant.contact.email}</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <FooterShared />
    </div>
  )
}
