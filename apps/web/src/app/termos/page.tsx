'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TermosPage() {
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
      router.replace(`/t/${tenant.slug}/termos`)
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
          Termos de Serviço
        </h1>
        <p className="text-white/60 mb-12">Última atualização: Dezembro de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-white/80">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              CONTRATO DE ADESÃO – ASSINATURA MENSAL BREWJARIA
            </h2>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">1. PARTES DO CONTRATO</h3>
            <p className="mb-3">
              <strong>1.1.</strong> BREWJARIA, marca operada por [RAZÃO SOCIAL DA EMPRESA], inscrita no CNPJ sob o nº [CNPJ], com sede em [ENDEREÇO COMPLETO], doravante denominada "BREWJARIA".
            </p>
            <p>
              <strong>1.2.</strong> Pessoa física que, por meio do site da BREWJARIA, aderir a um plano de assinatura mensal, doravante denominada "ASSINANTE".
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">2. OBJETO</h3>
            <p className="mb-3">
              <strong>2.1.</strong> O presente instrumento tem por objeto a contratação de um plano de assinatura de cervejas artesanais da BREWJARIA, mediante acesso e aceite eletrônico no site oficial da plataforma.
            </p>
            <p className="mb-3">
              <strong>2.2.</strong> A assinatura prevê a entrega mensal de cervejas artesanais, em quantidade, volume e estilos definidos conforme o plano contratado, no endereço informado pelo ASSINANTE no momento da adesão.
            </p>
            <p className="mb-3">
              <strong>2.3.</strong> Para efetivação da assinatura, o ASSINANTE declara ter lido integralmente este contrato e concordado com seus termos ao marcar a opção "Li e aceito os termos e condições".
            </p>
            <p>
              <strong>2.4.</strong> Os planos de assinatura da BREWJARIA são ofertados exclusivamente para pessoas físicas.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">3. VIGÊNCIA</h3>
            <p>
              <strong>3.1.</strong> O presente contrato terá vigência inicial de 30 (trinta) dias, sendo renovado automaticamente por iguais períodos, enquanto não houver solicitação de cancelamento pelo ASSINANTE.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">4. ENTREGAS</h3>
            <p className="mb-3">
              <strong>4.1.</strong> Será realizada uma entrega por mês, em data previamente definida pela BREWJARIA.
            </p>
            <p className="mb-3">
              <strong>4.2.</strong> Os ASSINANTES que realizarem a adesão até a data limite divulgada mensalmente receberão como primeira entrega o kit correspondente ao mês vigente.
            </p>
            <p>
              <strong>4.3.</strong> Para todos os efeitos legais, considera-se como data de adesão a data de confirmação do pagamento.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">5. CANCELAMENTO</h3>
            <p className="mb-3">
              <strong>5.1.</strong> O ASSINANTE poderá solicitar o cancelamento da recorrência da assinatura a qualquer momento, mediante solicitação enviada para o e-mail: <a href="mailto:contato@brewjaria.com.br" className="text-brew-gold hover:underline">contato@brewjaria.com.br</a>.
            </p>
            <p className="mb-3">
              <strong>5.2.</strong> O pedido de cancelamento deverá ser realizado pelo próprio ASSINANTE, contendo nome completo e CPF.
            </p>
            <p className="mb-3">
              <strong>5.3.</strong> A BREWJARIA efetuará o cancelamento da assinatura em até 10 (dez) dias corridos após o recebimento da solicitação.
            </p>
            <p className="mb-3">
              <strong>5.4.</strong> Após o processamento do cancelamento, não haverá novas cobranças referentes à assinatura.
            </p>
            <p className="mb-3">
              <strong>5.5.</strong> Caso o CEP do ASSINANTE deixe de ser atendido pela BREWJARIA, esta poderá cancelar a assinatura, realizando reembolso proporcional, quando aplicável.
            </p>
            <p>
              <strong>5.6.</strong> Caso o pagamento da assinatura não seja aprovado ou identificado, a contratação será automaticamente cancelada.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">6. PREÇO E REAJUSTES</h3>
            <p className="mb-3">
              <strong>6.1.</strong> Os valores dos planos de assinatura e a política de frete poderão ser reajustados, mediante comunicação prévia ao ASSINANTE com antecedência mínima de 30 (trinta) dias.
            </p>
            <p>
              <strong>6.2.</strong> Após esse prazo, a renovação automática da assinatura ocorrerá com base no valor atualizado vigente.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">7. DISPOSIÇÕES GERAIS</h3>
            <p className="mb-3">
              <strong>7.1.</strong> A venda de bebidas alcoólicas é permitida exclusivamente para maiores de 18 (dezoito) anos, sendo vedada a adesão por menores.
            </p>
            <p className="mb-3">
              <strong>7.2.</strong> O ASSINANTE compromete-se a manter seus dados cadastrais sempre atualizados, podendo a assinatura ser suspensa ou cancelada em caso de inconsistências.
            </p>
            <p className="mb-3">
              <strong>7.3.</strong> O ASSINANTE declara ciência de que seus dados serão armazenados no banco de dados da BREWJARIA, respeitada a legislação vigente de proteção de dados.
            </p>
            <p className="mb-3">
              <strong>7.4.</strong> O ASSINANTE autoriza a BREWJARIA a contatá-lo por meios eletrônicos, telefônicos ou digitais, para comunicações relacionadas à assinatura.
            </p>
            <p className="mb-3">
              <strong>7.5.</strong> A assinatura é pessoal e intransferível.
            </p>
            <p>
              <strong>7.6.</strong> Caso qualquer cláusula deste contrato seja considerada inválida ou inexequível, as demais permanecerão em pleno vigor.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">8. DÚVIDAS E CONTATO</h3>
            <p className="mb-3">
              <strong>8.1.</strong> O ASSINANTE poderá entrar em contato com a BREWJARIA pelos seguintes canais:
            </p>
            <ul className="list-none space-y-2 ml-4">
              <li>E-mail: <a href="mailto:contato@brewjaria.com.br" className="text-brew-gold hover:underline">contato@brewjaria.com.br</a></li>
              <li>Telefone/WhatsApp: [telefone]</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brew-gold mb-3">9. DO FORO</h3>
            <p>
              <strong>9.1.</strong> Fica eleito o Foro da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato.
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
