# Sandbox Framework — Documentação

Site de documentação técnica do **Sandbox Framework**, um framework modular de gameplay multiplayer em C++/Unreal Engine 5.8.

- **Site publicado (Manus):** [sandboxdocs-c9yezybu.manus.space](https://sandboxdocs-c9yezybu.manus.space)
- **Stack:** React 19 + Vite 7 + Tailwind 4 + Framer Motion + Wouter (SPA)

## Deploy na Vercel

1. Importe este repositório em [vercel.com/new](https://vercel.com/new): GitHub → New Project → *Sandbox-Framework-Documenta-o* → **Import**.
2. Confirme o Framework Preset como **Vite** (detecção automática). As configurações do `vercel.json` sobrescrevem automaticamente:
   - **Build Command:** `pnpm run build:vercel`
   - **Output Directory:** `dist/public`
   - **Rewrites:** `/(.*)` → `/index.html` (necessário para as rotas SPA como `/fase-19`, `/manual`, `/decisoes`)
3. Clique em **Deploy**. Nenhum segredo é necessário — o site é 100% estático.

> Nota: alguns recursos do desenvolvimento no Manus (coletor de logs `__manus__`, imagens servidas por proxy de storage e analytics do Manus) são específicos do ambiente Manus. Na Vercel, o logo do favicon e as imagens do hero/widgets referenciam o storage do Manus — para um deploy totalmente independente, substitua os caminhos em `client/index.html` e `client/src/lib/siteData.ts` pelos arquivos locais ou por outro CDN.

## Desenvolvimento local

```bash
pnpm install
pnpm run dev        # dev server
pnpm run build      # build completo (vite + server)
pnpm run check      # typecheck (tsc --noEmit)
pnpm run preview    # preview do build de produção
```

## Licença

MIT
