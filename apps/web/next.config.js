/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Redirects das rotas legadas para rotas tenant-aware
  // Redireciona para o tenant padrão (brewjaria) para manter compatibilidade
  async redirects() {
    const defaultTenant = 'brewjaria'
    
    return [
      // Rotas de autenticação
      {
        source: '/login',
        destination: `/t/${defaultTenant}/login`,
        permanent: false,
      },
      {
        source: '/esqueci-senha',
        destination: `/t/${defaultTenant}/esqueci-senha`,
        permanent: false,
      },
      {
        source: '/redefinir-senha',
        destination: `/t/${defaultTenant}/redefinir-senha`,
        permanent: false,
      },
      // Rotas de usuário
      {
        source: '/minha-assinatura',
        destination: `/t/${defaultTenant}/minha-assinatura`,
        permanent: false,
      },
      {
        source: '/minha-conta',
        destination: `/t/${defaultTenant}/minha-conta`,
        permanent: false,
      },
      // Rotas de assinatura/pagamento
      {
        source: '/assinatura/sucesso',
        destination: `/t/${defaultTenant}/assinatura/sucesso`,
        permanent: false,
      },
      {
        source: '/assinatura/cancelada',
        destination: `/t/${defaultTenant}/assinatura/cancelada`,
        permanent: false,
      },
      // Rotas admin - REMOVIDO: agora usa middleware inteligente
      // Ver: apps/web/src/middleware.ts e docs/FAZUMCLUBE-ARCHITECTURE.md
    ]
  },
}

module.exports = nextConfig
