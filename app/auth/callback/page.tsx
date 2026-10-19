'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let handled = false;

    async function handleAuth() {
      if (handled) return;
      handled = true;

      try {
        // Check if there is an OAuth code in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('insforge_code');

        if (code) {
          try {
            await insforge.auth.exchangeOAuthCode(code);
          } catch (exchangeErr) {
            console.warn('OAuth exchange warning (may already be handled):', exchangeErr);
          }
        }

        // Wait brief tick for session cookie / storage to settle
        await new Promise((r) => setTimeout(r, 400));

        // Get current authenticated user
        const { data, error: userError } = await insforge.auth.getCurrentUser();

        if (userError || !data?.user) {
          throw new Error(userError?.message || 'Không thể xác thực thông tin tài khoản.');
        }

        const user = data.user;

        // Sync user to database (users table in PostgreSQL)
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authId: user.id,
            email: user.email,
            name: user.name || user.profile?.name || user.email?.split('@')[0],
            avatarUrl: user.profile?.avatar_url || null,
          }),
        });

        // Refresh auth state in React context
        await refreshUser();

        // Navigate to /dashboard
        router.replace('/dashboard');
      } catch (err: any) {
        console.error('Auth callback failed:', err);
        setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }

    void handleAuth();
  }, [router, refreshUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {error ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <span className="text-xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Xác thực không thành công
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={() => router.push('/sign-in')}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Quay lại trang Đăng nhập
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Đang hoàn tất đăng nhập...
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hệ thống đang đồng bộ tài khoản và chuyển hướng bạn đến bảng điều khiển.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
