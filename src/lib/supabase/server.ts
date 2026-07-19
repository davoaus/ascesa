import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente com a sessão do usuário (via cookies do GoTrue). A RLS no Postgres
// garante que cada pessoa só enxerga os próprios dados (auth.uid() = user_id).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado durante render de Server Component — o middleware é quem
            // renova o cookie de sessão, então pode ignorar.
          }
        },
      },
    },
  );
}
