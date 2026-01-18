'use client'

import { useTenant } from '@/contexts/TenantContext'

export default function FooterShared() {
  const { tenant } = useTenant()
  const basePath = `/t/${tenant.slug}`
  
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <div className="mb-8">
            <h3 className="text-2xl font-black text-primary leading-none tracking-tight">
              {tenant.brandText.line1}
              <br />
              <span className="ml-2">{tenant.brandText.line2}</span>
            </h3>
          </div>

          {/* Links */}
          <div className="flex gap-8 mb-8">
            <a 
              href={`mailto:${tenant.contact.email}`} 
              className="text-muted-foreground hover:text-primary transition text-sm"
            >
              Contato
            </a>
            <a 
              href={`${basePath}/privacidade`} 
              className="text-muted-foreground hover:text-primary transition text-sm"
            >
              Privacidade
            </a>
            <a 
              href={`${basePath}/termos`} 
              className="text-muted-foreground hover:text-primary transition text-sm"
            >
              Termos de Serviço
            </a>
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground/60 text-xs">
            &copy; {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
