# Deploy na Vercel

O código já está no GitHub: **github.com/davoaus/ascesa** (privado).
O deploy em si precisa da sua conta Vercel (login seu), então são 4 passos rápidos:

## 1. Importar o projeto
1. Acesse **vercel.com/new** (logado com o GitHub `davoaus`).
2. Em "Import Git Repository", escolha **davoaus/ascesa** → **Import**.
3. Framework: **Next.js** (a Vercel detecta sozinho). Não mude nada.

## 2. Variáveis de ambiente
Antes de clicar em Deploy, adicione estas duas (são chaves públicas, sem risco):

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yrsbpfpnyhixgloqglzh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_cy8C0U34sMTdPOGE8zPUUw_6aIk5ifk` |

Clique em **Deploy**. Em ~1 min você terá uma URL tipo `https://ascesa.vercel.app`.

## 3. Apontar o Supabase para a URL de produção (para cadastro por e-mail funcionar)
No painel do Supabase (projeto `ascesa`) → **Authentication → URL Configuration**:
- **Site URL:** a URL da Vercel (ex.: `https://ascesa.vercel.app`)
- **Redirect URLs:** adicione `https://ascesa.vercel.app/**`

Sem isso, novos cadastros recebem link de confirmação apontando para `localhost`.
(Para só testar agora, dá pra entrar com a conta de teste já confirmada.)

## 4. Instalar no celular (PWA)
Abra a URL no Safari/Chrome do celular → menu → **Adicionar à Tela de Início**.
O app abre em tela cheia, como um app nativo.

---

### Alternativa por CLI (se preferir terminal)
```bash
npm i -g vercel
cd ~/Documents/ascesa
vercel            # faz login no navegador e segue o passo a passo
vercel --prod     # deploy de produção
```
Ainda assim, defina as duas variáveis de ambiente (passo 2) no painel ou via `vercel env add`.
