# 🛡️ **ESTRUTURA DE COMPONENTES SEGUROS - ANTI-SUBFRAME OVERWRITE**

## 🎯 **Problema resolvido:**
**Subframe sync sobrescreve `src/ui/components/` e deleta componentes customizados!**

## ✅ **Solução implementada:**

### 📁 **Nova estrutura de pastas SEGURAS:**

```
src/
├── components/custom/          # 🛡️ SEGURO - Componentes customizados
├── contexts/                   # 🛡️ SEGURO - Contexts globais  
├── hooks/                      # 🛡️ SEGURO - Hooks personalizados
├── utils/custom/              # 🛡️ SEGURO - Utilitários customizados
├── lib/                       # 🛡️ SEGURO - Configurações (já existia)
│
├── ui/components/             # ⚠️ PERIGO - Subframe sobrescreve
└── ui/layouts/                # ⚠️ PERIGO - Subframe sobrescreve
```

## 🚀 **Como usar a partir de agora:**

### **✅ CERTO - Salvar componentes customizados:**
```typescript
// src/components/custom/AddPatientModal.tsx
"use client";

import React from "react";
// Imports do Subframe (sempre funcionam)
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
// Imports customizados (protegidos)
import { useToast } from "@/contexts/ToastContext";

export default function AddPatientModal() {
  // Seu código aqui
}
```

### **✅ CERTO - Usar nos componentes:**
```typescript
// src/app/patients/page.tsx
import AddPatientModal from "@/components/custom/AddPatientModal";
import { useToast } from "@/contexts/ToastContext";
```

### **❌ ERRADO - Nunca mais salvar aqui:**
```typescript
// src/ui/components/AddPatientModal.tsx  ❌ SERÁ DELETADO!
// src/ui/layouts/CustomLayout.tsx        ❌ SERÁ DELETADO!
```

## 📋 **Componentes que serão migrados:**

### **1. AddPatientModal.tsx**
- **De**: `src/ui/components/` ❌
- **Para**: `src/components/custom/` ✅
- **Função**: Modal para adicionar pacientes

### **2. ToastContext.tsx**
- **De**: `src/contexts/` (já estava certo)
- **Para**: `src/contexts/` ✅ (manter)
- **Função**: Context para notificações

### **3. Futuros componentes:**
- Modais customizados
- Formulários específicos
- Componentes de negócio
- Layouts personalizados

## 🔧 **Workflow recomendado:**

### **1. Antes de criar componente:**
```bash
# Sempre criar em pasta segura
touch src/components/custom/MeuComponente.tsx
```

### **2. Estrutura do componente:**
```typescript
"use client";

import React from "react";
// Subframe components (sempre disponíveis)
import { Button } from "@/ui/components/Button";
// Custom components (protegidos)
import { useToast } from "@/contexts/ToastContext";

export default function MeuComponente() {
  return <div>Meu componente seguro!</div>;
}
```

### **3. Usar no projeto:**
```typescript
import MeuComponente from "@/components/custom/MeuComponente";
```

### **4. Subframe sync:**
```bash
npx @subframe/cli@latest sync --all -p e50163b8c1bc
# ✅ Componentes customizados permanecem intactos!
```

## 🛡️ **Proteção garantida:**

### **Pastas que Subframe NUNCA toca:**
- ✅ `src/components/custom/`
- ✅ `src/contexts/`
- ✅ `src/hooks/`
- ✅ `src/utils/custom/`
- ✅ `src/lib/`
- ✅ `src/app/` (páginas)

### **Pastas que Subframe SEMPRE sobrescreve:**
- ❌ `src/ui/components/`
- ❌ `src/ui/layouts/`

## 📝 **Convenções:**

### **Nomes de arquivos:**
- `PascalCase.tsx` - Componentes
- `camelCase.ts` - Utilitários
- `PascalCaseContext.tsx` - Contexts

### **Imports:**
```typescript
// Subframe (sempre @/ui/)
import { Button } from "@/ui/components/Button";

// Custom (sempre @/components/custom/)
import MyComponent from "@/components/custom/MyComponent";

// Contexts (sempre @/contexts/)
import { useToast } from "@/contexts/ToastContext";

// Hooks (sempre @/hooks/)
import { useCustomHook } from "@/hooks/useCustomHook";
```

## ✨ **Benefícios:**

- 🛡️ **Proteção total** contra Subframe overwrite
- 📁 **Organização clara** entre Subframe e custom
- 🔄 **Sync seguro** - nunca perde código
- 🚀 **Desenvolvimento contínuo** sem medo
- 📦 **Backup automático** via Git
- 🎯 **Escalabilidade** para projetos grandes

## 🎉 **Status:**

- ✅ **Estrutura criada** e documentada
- ✅ **Pastas protegidas** configuradas
- ✅ **README** com instruções completas
- ✅ **Gitkeep** para manter pastas vazias
- ✅ **Pronto para uso** imediato

---

**A partir de agora, TODOS os componentes customizados devem ser salvos em `src/components/custom/`!** 🛡️✨

**Nunca mais vamos perder código para o Subframe sync!** 🎯

