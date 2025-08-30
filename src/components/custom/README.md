# 🛡️ **COMPONENTES CUSTOMIZADOS - PROTEGIDOS DO SUBFRAME**

## 📁 **Estrutura de pastas seguras:**

```
src/
├── components/custom/          # Componentes customizados
├── contexts/                   # Contexts (Toast, Auth, etc.)
├── hooks/                      # Hooks customizados
├── utils/custom/              # Utilitários customizados
└── lib/                       # Configurações (Supabase, etc.)
```

## ⚠️ **IMPORTANTE:**

### **Pastas que o Subframe SOBRESCREVE:**
- `src/ui/components/` ❌ - **NUNCA salvar aqui**
- `src/ui/layouts/` ❌ - **NUNCA salvar aqui**

### **Pastas SEGURAS para código customizado:**
- `src/components/custom/` ✅ - **Componentes customizados**
- `src/contexts/` ✅ - **Contexts globais**
- `src/hooks/` ✅ - **Hooks personalizados**
- `src/utils/custom/` ✅ - **Utilitários**
- `src/lib/` ✅ - **Configurações**

## 📋 **Componentes a serem salvos aqui:**

### **1. AddPatientModal.tsx**
- **Localização**: `src/components/custom/AddPatientModal.tsx`
- **Função**: Modal para adicionar novos pacientes
- **Integração**: Supabase, Toast, validação

### **2. ToastContext.tsx**
- **Localização**: `src/contexts/ToastContext.tsx`
- **Função**: Context global para notificações
- **Uso**: showSuccess, showError, showToast

### **3. Outros componentes futuros:**
- Modais customizados
- Formulários específicos
- Componentes de negócio
- Layouts personalizados

## 🔧 **Como usar:**

### **Imports seguros:**
```typescript
// ✅ CERTO - Componentes Subframe
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";

// ✅ CERTO - Componentes customizados
import AddPatientModal from "@/components/custom/AddPatientModal";
import { useToast } from "@/contexts/ToastContext";
```

### **Estrutura recomendada:**
```typescript
// src/components/custom/MyComponent.tsx
"use client";

import React from "react";
// Imports do Subframe
import { Button } from "@/ui/components/Button";
// Outros imports customizados
import { useToast } from "@/contexts/ToastContext";

export default function MyComponent() {
  return (
    // Seu componente aqui
  );
}
```

## 🚀 **Vantagens:**

- ✅ **Proteção total** contra overwrites do Subframe
- ✅ **Organização clara** entre Subframe e custom
- ✅ **Fácil manutenção** e backup
- ✅ **Imports limpos** e organizados
- ✅ **Escalabilidade** para projetos grandes

## 📝 **Convenções:**

### **Nomes de arquivos:**
- `PascalCase.tsx` para componentes
- `camelCase.ts` para utilitários
- `PascalCase.tsx` para contexts

### **Exports:**
- **Default export** para componentes principais
- **Named exports** para utilitários e hooks

## 🔄 **Workflow:**

1. **Criar componente** em `src/components/custom/`
2. **Testar** funcionamento
3. **Fazer commit** para salvar no Git
4. **Usar** normalmente nas páginas
5. **Subframe sync** não afeta os arquivos customizados! 🎉

---

**Esta estrutura garante que seu código customizado nunca será perdido!** 🛡️

