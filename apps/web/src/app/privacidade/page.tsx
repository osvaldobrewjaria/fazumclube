'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivacidadePage() {
  const router = useRouter()
  
  // Tenta obter tenant do contexto
  let tenant = null
  try {
    const context = useTenant()
    tenant = context?.tenant
  } catch {
    // Contexto não disponível (página global)
  }
  
  // Se tem tenant e não é brewjaria, redireciona para página do tenant
  useEffect(() => {
    if (tenant && tenant.slug !== 'brewjaria') {
      router.replace(`/t/${tenant.slug}/privacidade`)
    }
  }, [tenant, router])
  
  return (
    <main className="min-h-screen bg-brew-black">
      {/* Header */}
      <header className="border-b border-brew-gold/20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brew-gold hover:text-brew-gold/80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-brew-gold mb-2">
          Política de Privacidade
        </h1>
        <p className="text-white/60 mb-12">Última atualização: Dezembro de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-white/80">
          
          <section>
            <p className="text-lg">
              A BREWJARIA, comprometida com a proteção dos dados pessoais de seus usuários, estabelece esta Política de Privacidade em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
            </p>
            <p>
              Ao utilizar o site e os serviços da BREWJARIA, o usuário declara estar ciente e de acordo com os termos aqui descritos.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">1. CONTROLADOR DOS DADOS</h3>
            <div className="bg-brew-gold/10 border border-brew-gold/30 rounded-lg p-4">
              <p className="font-bold text-white mb-2">BREWJARIA</p>
              <ul className="list-none space-y-1 text-sm">
                <li>Razão Social: [RAZÃO SOCIAL DA EMPRESA]</li>
                <li>CNPJ: [CNPJ]</li>
                <li>Endereço: [ENDEREÇO COMPLETO]</li>
                <li>E-mail: <a href="mailto:contato@brewjaria.com.br" className="text-brew-gold hover:underline">contato@brewjaria.com.br</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">2. DADOS COLETADOS</h3>
            <p className="mb-3">A BREWJARIA poderá coletar e tratar os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Nome completo</li>
              <li>CPF</li>
              <li>Data de nascimento</li>
              <li>Endereço de cobrança e entrega</li>
              <li>E-mail</li>
              <li>Telefone / WhatsApp</li>
              <li>Dados de navegação (IP, localização aproximada, dispositivo, navegador)</li>
              <li>Informações de pagamento necessárias à assinatura</li>
            </ul>
            <p className="mt-4 text-brew-gold font-medium">
              ⚠️ A BREWJARIA não armazena dados completos de cartão de crédito.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">3. PAGAMENTOS E GATEWAYS (STRIPE)</h3>
            
            <h4 className="font-bold text-white mt-4 mb-2">3.1. Processamento de Pagamentos</h4>
            <p className="mb-3">
              Os pagamentos das assinaturas da BREWJARIA são processados por intermediadores de pagamento, como a Stripe, que atuam como controladores independentes dos dados financeiros.
            </p>
            <p className="mb-2">A BREWJARIA não tem acesso nem armazena:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Número completo do cartão</li>
              <li>Código de segurança (CVV)</li>
              <li>Senhas ou dados bancários sensíveis</li>
            </ul>

            <h4 className="font-bold text-white mt-4 mb-2">3.2. Dados Compartilhados com o Gateway</h4>
            <p className="mb-2">Para viabilizar o pagamento recorrente, poderão ser compartilhados com a Stripe:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>CPF</li>
              <li>Endereço de cobrança</li>
              <li>Informações do pedido</li>
              <li>Identificadores de pagamento (tokens)</li>
            </ul>
            <p className="mt-2 text-sm text-white/60">
              Esses dados são tratados conforme a Política de Privacidade da Stripe.
            </p>

            <h4 className="font-bold text-white mt-4 mb-2">3.3. Pagamento Recorrente e Tokenização</h4>
            <p className="mb-2">Ao contratar um plano de assinatura, o ASSINANTE autoriza:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>A cobrança recorrente automática conforme o plano contratado</li>
              <li>A tokenização do meio de pagamento pela Stripe</li>
              <li>Tentativas automáticas de cobrança em caso de falha de pagamento</li>
            </ul>
            <p className="mt-2">
              O cancelamento da recorrência poderá ser solicitado a qualquer momento, conforme os Termos de Assinatura.
            </p>

            <h4 className="font-bold text-white mt-4 mb-2">3.4. Antifraude e Segurança</h4>
            <p className="mb-2">A Stripe e outros gateways utilizam mecanismos automáticos de:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Prevenção à fraude</li>
              <li>Análise de risco</li>
              <li>Autenticação reforçada (ex: 3D Secure)</li>
            </ul>
            <p className="mt-2 text-sm text-white/60">
              Esses processos podem envolver decisões automatizadas, conforme permitido pela LGPD.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">4. FINALIDADE DO TRATAMENTO</h3>
            <p className="mb-2">Os dados pessoais são utilizados para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Processamento de assinaturas e cobranças</li>
              <li>Entrega dos produtos contratados</li>
              <li>Comunicação operacional (pagamentos, entregas, cancelamentos)</li>
              <li>Atendimento ao cliente</li>
              <li>Cumprimento de obrigações legais e fiscais</li>
              <li>Prevenção a fraudes</li>
              <li>Melhoria da experiência do usuário</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">5. COMPARTILHAMENTO DE DADOS</h3>
            <p className="mb-2">A BREWJARIA poderá compartilhar dados pessoais com:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Gateways de pagamento (ex: Stripe)</li>
              <li>Empresas de logística e transporte</li>
              <li>Fornecedores de tecnologia e hospedagem</li>
              <li>Serviços de e-mail, CRM e automação</li>
              <li>Autoridades públicas, quando exigido por lei</li>
            </ul>
            <p className="mt-4 font-medium text-white">
              A BREWJARIA não vende nem comercializa dados pessoais.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">6. ARMAZENAMENTO E SEGURANÇA</h3>
            <p className="mb-2">
              Os dados pessoais são armazenados em ambientes seguros, com medidas técnicas e administrativas compatíveis com padrões de mercado, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Criptografia</li>
              <li>Controle de acesso</li>
              <li>Monitoramento de segurança</li>
            </ul>
            <p className="mt-3">
              Os dados serão mantidos apenas pelo período necessário ao cumprimento das finalidades previstas ou conforme exigido por lei.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">7. DIREITOS DO TITULAR</h3>
            <p className="mb-2">O titular dos dados pode exercer, a qualquer momento:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Confirmação do tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de informações</li>
              <li>Exclusão de dados, quando aplicável</li>
              <li>Revogação de consentimento</li>
              <li>Portabilidade</li>
              <li>Informações sobre compartilhamento</li>
            </ul>
            <p className="mt-3">
              As solicitações devem ser encaminhadas para: <a href="mailto:contato@brewjaria.com.br" className="text-brew-gold hover:underline">contato@brewjaria.com.br</a>.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">8. COOKIES E TECNOLOGIAS</h3>
            <p className="mb-2">Utilizamos cookies e tecnologias similares para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Funcionamento adequado do site</li>
              <li>Estatísticas e métricas de uso</li>
              <li>Personalização de conteúdo</li>
            </ul>
            <p className="mt-3">
              O usuário pode configurar seu navegador para bloquear cookies, ciente de possíveis limitações de funcionalidades.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">9. COMUNICAÇÕES</h3>
            <p>
              O usuário poderá receber comunicações relacionadas à assinatura e, mediante consentimento, comunicações promocionais.
            </p>
            <p className="mt-2">
              O cancelamento do recebimento poderá ser solicitado a qualquer momento.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">10. VENDA DE BEBIDAS ALCOÓLICAS</h3>
            <p>
              A comercialização é restrita a maiores de 18 (dezoito) anos, sendo vedada a compra por menores.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">11. ALTERAÇÕES</h3>
            <p>
              Esta Política poderá ser atualizada a qualquer tempo. A versão vigente estará sempre disponível no site da BREWJARIA.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">12. FORO</h3>
            <p>
              Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes desta Política.
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-brew-gold/20 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">
            &copy; 2025 Brewjaria. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
