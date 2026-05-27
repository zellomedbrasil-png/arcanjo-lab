---
name: Arcanjo.Lab Design System
description: Um sistema de design utilitário de clareza cirúrgica para aplicações clínicas.
colors:
  primary: "#2563eb"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-text: "#0f172a"
  neutral-text-muted: "#64748b"
  accent-slate: "#334155"
  accent-emerald: "#047857"
  accent-amber: "#b45309"
  accent-sky: "#0284c7"
  accent-indigo: "#4f46e5"
typography:
  display:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#1d4ed8"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: Arcanjo.Lab

## 1. Overview

**Creative North Star: "The Clinical Slate"**

O Arcanjo.Lab é um sistema utilitário de clareza cirúrgica, inspirado no prontuário médico clássico reinventado. Ele foi projetado para otimizar fluxos de trabalho rápidos sob iluminação brilhante de consultórios, onde cada segundo poupado e cada redução de esforço cognitivo contam. O visual elimina qualquer tipo de excesso ornamental ou distração visual para focar inteiramente na clareza de leitura e na velocidade de preenchimento dos dados do paciente.

A interface utiliza grades limpas de alta densidade, tipografia profissional com excelente contraste e uma paleta de cores funcional que categoriza diferentes fluxos. Ele rejeita de forma absoluta templates SaaS genéricos, cartões repetitivos, sombras pesadas e elementos decorativos sem utilidade prática direta.

**Key Characteristics:**
- Alta densidade de informação para visualização rápida sem rolagem excessiva.
- Divisão estrita e consistente entre elementos interativos em tela e folhas de impressão limpas.
- Grid cirúrgico focado em alinhamentos verticais e horizontais precisos.

## 2. Colors

A paleta de cores é utilitária e focada na identificação imediata de seções e status clínicos, sem causar fadiga visual.

### Primary
- **Surgical Blue** (#2563eb): A cor de acento primária para indicar interatividade padrão, botões de ação principal e links.

### Neutral
- **Ice-Slate Background** (#f8fafc): Fundo cinza gelo cirúrgico para conforto visual em ambientes iluminados.
- **Pure White** (#ffffff): Cor de fundo para superfícies de conteúdo, prontuários e cartões interativos.
- **Soft Border** (#e2e8f0): Bordas sutis de delimitação para separar campos e seções de formulários.
- **Slate Text** (#0f172a): Texto principal de altíssimo contraste para máxima legibilidade.
- **Muted Slate** (#64748b): Subtítulos, placeholders e metadados de suporte.

### Named Rules
**The Color Function Rule.** Cores secundárias são usadas estritamente para diferenciação de seções (azul para exames, verde para procedimentos, âmbar para receitas). Nunca use cores decorativas fora do seu contexto funcional estabelecido.

## 3. Typography

A tipografia prioriza escala e contraste claros para garantir leitura confortável em telas de diferentes tamanhos e distâncias.

**Display Font:** Outfit, Inter, system-ui, sans-serif
**Body Font:** Inter, system-ui, sans-serif

### Hierarchy
- **Display** (700, 1.5rem (24px), 1.2): Títulos de seções principais da interface e nomes de cabeçalhos de prontuários.
- **Headline** (700, 1.25rem (20px), 1.25): Títulos de seções secundárias e cabeçalhos de cartões.
- **Title** (600, 1rem (16px), 1.5): Rótulos de campos de dados importantes e nomes de exames.
- **Body** (400, 0.875rem (14px), 1.5): Texto principal do prontuário, dosagens de receitas e descrições gerais. Limite de linha de 70ch.
- **Label** (600, 0.75rem (12px), 0.05em, uppercase): Rótulos de formulário, categorias e botões.

### Named Rules
**The Contrast Priority Rule.** A tipografia de dados clínicos nunca deve ser mais clara que o tom Muted Slate (#64748b). Prescreva contraste rigoroso para todas as informações de saúde.

## 4. Elevation

O sistema Arcanjo.Lab é essencialmente plano por padrão, refletindo a metáfora do "Clinical Slate". Ele utiliza bordas finas de 1px e variações suaves de fundo para criar profundidade e estrutura.

### Named Rules
**The Flat Rest Rule.** Todas as superfícies são perfeitamente planas no estado de repouso. Sombras sutis são reservadas exclusivamente para feedback visual de estados interativos (como hover) e elementos flutuantes reais (como menus suspensos).

## 5. Components

### Buttons
- **Shape:** Levemente arredondado com cantos discretos (8px de raio).
- **Primary:** Fundo Surgical Blue (#2563eb) com texto Pure White (#ffffff). Padding de 8px nas laterais e 16px na horizontal.
- **Hover / Focus:** Transição suave para um tom de azul mais profundo (#1d4ed8) no hover. Anel de foco nítido ao navegar pelo teclado.

### Cards / Containers
- **Corner Style:** Cantos arredondados discretos (8px).
- **Background:** Pure White (#ffffff) sobre fundo Ice-Slate (#f8fafc).
- **Border:** Borda fina de 1px em tom Soft Border (#e2e8f0) para delimitar o container.
- **Internal Padding:** Espaçamento equilibrado de 12px a 16px para preservar densidade sem sufocar o conteúdo.

### Inputs / Fields
- **Style:** Campo sem borda de contorno completa no estilo clássico de prontuário, usando linha de base fina (#e2e8f0) e fundo transparente.
- **Focus:** Linha de base ganha destaque em tom de acento (como indigo ou blue) e transiciona suavemente.

### Navigation
- **Style:** Barra lateral esquerda fixa em tom Pure White (#ffffff) com borda direita Soft Border (#e2e8f0). Links de navegação usam ícones minimalistas e fundo levemente colorido em tom pastel correspondente quando ativos.

## 6. Do's and Don'ts

### Do:
- **Do** manter a interface o mais densa possível para evitar rolagem durante o preenchimento de dados do paciente.
- **Do** ocultar todas as barras de navegação, botões e elementos interativos em tela ao gerar a versão de impressão física dos documentos.
- **Do** usar acentos de cores de forma puramente funcional para ajudar o médico a saber instantaneamente em qual guia ele está trabalhando.

### Don't:
- **Don't** usar listras ou faixas laterais coloridas de destaque (maiores que 1px) em bordas de cartões ou alertas.
- **Don't** aplicar gradientes coloridos em textos ou elementos decorativos.
- **Don't** usar cartões aninhados dentro de outros cartões para agrupar dados.
- **Don't** abrir caixas modais sobrepostas para ações que podem ser feitas em linha (inline) na própria tela.
