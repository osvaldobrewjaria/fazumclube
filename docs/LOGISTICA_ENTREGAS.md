# Logística de Entregas - Documentação Oficial

> **Atualizado**: 22/12/2025  
> **Status**: Implementado e funcional

---

## 1. Visão Geral

O sistema de logística do Brewjaria gerencia entregas mensais para assinantes. Cada assinatura ativa gera uma entrega por mês.

### Fluxo Resumido

```
Assinatura ACTIVE → Entrega PENDING → PREPARING → SHIPPED → DELIVERED
```

---

## 2. O que Está Implementado

### 2.1 Model Delivery (Banco de Dados)

**Arquivo**: `apps/api/prisma/schema.prisma` (linhas 235-262)

```prisma
model Delivery {
  id             String @id @default(cuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  // Período de referência (mês/ano da entrega)
  referenceMonth Int
  referenceYear  Int

  // Status e tracking
  status         DeliveryStatus @default(PENDING)
  trackingCode   String?
  trackingUrl    String?
  
  // Datas
  shippedAt      DateTime?
  deliveredAt    DateTime?
  
  // Notas internas
  notes          String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([subscriptionId, referenceMonth, referenceYear])
  @@index([subscriptionId])
  @@index([status])
}
```

### 2.2 Status de Entrega

**Arquivo**: `apps/api/prisma/schema.prisma` (enum DeliveryStatus)

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando preparação |
| `PREPARING` | Em preparação |
| `SHIPPED` | Enviado (com tracking) |
| `DELIVERED` | Entregue |
| `RETURNED` | Devolvido |

### 2.3 Endpoints da API

**Arquivo**: `apps/api/src/admin/admin.controller.ts`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/admin/deliveries?month=X&year=Y` | Lista entregas do mês |
| `PATCH` | `/admin/deliveries/:id/status` | Atualiza status |
| `GET` | `/admin/deliveries/export` | Exporta CSV |

#### Exemplo: Listar Entregas

```bash
curl -X GET "http://localhost:3001/admin/deliveries?month=12&year=2025" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant: brewjaria"
```

**Resposta**:
```json
[
  {
    "id": "sub_xxx",
    "subscriptionId": "sub_xxx",
    "deliveryId": "del_xxx",
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "customerPhone": "11999999999",
    "planName": "Clube Brewjaria",
    "billingInterval": "MONTHLY",
    "subscriptionStatus": "ACTIVE",
    "deliveryStatus": "PENDING",
    "trackingCode": null,
    "trackingUrl": null,
    "shippedAt": null,
    "deliveredAt": null,
    "notes": null,
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "complement": "Apto 45",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "referenceMonth": 12,
    "referenceYear": 2025
  }
]
```

### 2.4 Service de Entregas

**Arquivo**: `apps/api/src/admin/admin.service.ts` (linhas 365-523)

```typescript
async getDeliveries(month?: number, year?: number, tenant?: TenantContext) {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();
  const tenantFilter = tenant ? { tenantId: tenant.id } : {};

  // Buscar assinaturas ativas com endereço
  const subscriptions = await this.prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      ...tenantFilter,
    },
    include: {
      user: {
        include: {
          profile: {
            include: {
              address: true,
            },
          },
        },
      },
      plan: true,
      deliveries: {
        where: {
          referenceMonth: targetMonth,
          referenceYear: targetYear,
        },
      },
    },
  });
  // ...
}
```

### 2.5 UI Admin de Entregas

**Arquivo**: `apps/web/src/app/admin/entregas/page.tsx` (331 linhas)

**Funcionalidades**:
- Lista entregas do mês selecionado
- Filtro por status (Pendente, Preparando, Enviado, Entregue, Devolvido)
- Navegação entre meses
- Atualização de status individual
- Atualização em lote (seleção múltipla)
- Exportação CSV
- Visualização de endereço completo
- Link para tracking externo

**URL**: `/admin/entregas`

---

## 3. O que NÃO Está Implementado

| Funcionalidade | Status |
|----------------|--------|
| Integração com Correios API | ❌ Não existe |
| Integração com transportadoras (Jadlog, etc) | ❌ Não existe |
| Geração automática de etiquetas | ❌ Não existe |
| Cálculo automático de frete | ❌ Não existe |
| Notificação por email ao enviar | ❌ Não existe |
| Webhook de tracking | ❌ Não existe |
| Roteirização de entregas | ❌ Não existe |

---

## 4. Guia Operacional Mensal

### 4.1 Início do Mês (Dia 1-5)

1. **Acessar painel admin**:
   ```
   https://brewjaria.vercel.app/admin/entregas
   ```

2. **Selecionar mês atual**

3. **Verificar entregas pendentes**:
   - Todas as assinaturas ACTIVE aparecem automaticamente
   - Status inicial: PENDING

### 4.2 Preparação (Dia 5-10)

1. **Selecionar entregas para preparar**:
   - Marcar checkbox das entregas
   - Clicar "Atualizar Status" → "Preparando"

2. **Separar produtos**:
   - Usar lista exportada (CSV) para picking

### 4.3 Envio (Dia 10-15)

1. **Após despachar**:
   - Atualizar status para "Enviado"
   - Adicionar código de rastreio (se disponível)

2. **Exportar lista para transportadora**:
   - Clicar "Exportar CSV"
   - Enviar para transportadora

### 4.4 Acompanhamento (Dia 15-30)

1. **Monitorar entregas**:
   - Verificar tracking manualmente
   - Atualizar para "Entregue" quando confirmado

2. **Tratar devoluções**:
   - Marcar como "Devolvido" se necessário
   - Adicionar nota explicativa

---

## 5. Queries SQL Úteis

### Entregas pendentes do mês

```sql
SELECT 
  d.id,
  d.status,
  u.name as customer,
  u.email,
  p.name as plan
FROM "Delivery" d
JOIN "Subscription" s ON s.id = d."subscriptionId"
JOIN "User" u ON u.id = s."userId"
JOIN "Plan" p ON p.id = s."planId"
WHERE d."referenceMonth" = 12
  AND d."referenceYear" = 2025
  AND d.status = 'PENDING';
```

### Assinaturas ativas sem entrega do mês

```sql
SELECT s.id, u.name, u.email
FROM "Subscription" s
JOIN "User" u ON u.id = s."userId"
WHERE s.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM "Delivery" d
    WHERE d."subscriptionId" = s.id
      AND d."referenceMonth" = 12
      AND d."referenceYear" = 2025
  );
```

### Criar entregas faltantes

```sql
INSERT INTO "Delivery" (id, "subscriptionId", "referenceMonth", "referenceYear", status, "createdAt", "updatedAt")
SELECT 
  'del_' || substr(md5(random()::text), 1, 12),
  s.id,
  12,
  2025,
  'PENDING',
  NOW(),
  NOW()
FROM "Subscription" s
WHERE s.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM "Delivery" d
    WHERE d."subscriptionId" = s.id
      AND d."referenceMonth" = 12
      AND d."referenceYear" = 2025
  );
```

---

## 6. Troubleshooting

### Entrega não aparece na lista

**Causa**: Assinatura não está ACTIVE ou não tem endereço.

**Verificar**:
```sql
SELECT s.status, a.*
FROM "Subscription" s
JOIN "User" u ON u.id = s."userId"
LEFT JOIN "CustomerProfile" cp ON cp."userId" = u.id
LEFT JOIN "Address" a ON a.id = cp."addressId"
WHERE s.id = 'SUB_ID_AQUI';
```

### Erro ao atualizar status

**Causa**: Token expirado ou sem permissão admin.

**Solução**: Fazer logout e login novamente no admin.

### CSV não exporta

**Causa**: Nenhuma entrega no mês selecionado.

**Verificar**: Mudar para mês com entregas.

---

## 7. Arquivos Relevantes

| Arquivo | Propósito |
|---------|-----------|
| `apps/api/prisma/schema.prisma` | Model Delivery (linhas 235-262) |
| `apps/api/src/admin/admin.service.ts` | getDeliveries, updateDeliveryStatus, exportCSV |
| `apps/api/src/admin/admin.controller.ts` | Endpoints /admin/deliveries |
| `apps/web/src/app/admin/entregas/page.tsx` | UI de entregas |

---

## 8. Próximos Passos (Sugestões)

1. **Integração Correios**: Consultar status via API dos Correios
2. **Email automático**: Notificar cliente quando status mudar para SHIPPED
3. **Etiquetas**: Gerar PDF com etiquetas de envio
4. **Dashboard**: Métricas de entregas (taxa de sucesso, tempo médio)
