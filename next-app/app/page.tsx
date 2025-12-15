'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, errorHandling } from '@/lib/apiFetch';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OAuth エラー
  useEffect(() => {
  if (typeof window === 'undefined') return;

  const handleOAuthLogin = async () => {
    const session = Object.fromEntries(
      new URLSearchParams(window.location.hash.substring(1))
    );

    if (!session.access_token) return;

    try {
      const userData = await apiFetch('/api/auth/user', {}, session.access_token);
      session.user = userData;

      // ローカルストレージの更新は非同期ではないのでOK
      localStorage.setItem('user_session', JSON.stringify(session));

      // setTimeout で次のレンダーに移すことで警告を回避
      setTimeout(() => {
        router.push('/memos');
      }, 0);
    } catch (err) {
      console.error(err);
    }
  };

  handleOAuthLogin();
}, [router]);


  // OAuth Login
  useEffect(() => {
    (async () => {
      const session = Object.fromEntries(
        new URLSearchParams(window.location.hash.substring(1))
      );

      if (!session.access_token) return;

      const userData = await apiFetch('/api/auth/user', {}, session.access_token);
      session.user = userData;

      localStorage.setItem('user_session', JSON.stringify(session));
      router.push('/memos');
    })();
  }, [router]);

  // Email login
  const login = async () => {
    await errorHandling(async () => {
      const json = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('user_session', JSON.stringify(json));
      router.push('/memos');
    }, setError);
  };

  const register = async () => {
    await errorHandling(async () => {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSuccess('確認メールを送信しました。');
    }, setError);
  };

  const loginGithub = () => {
    window.location.href = '/api/auth/oauth2/github';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 border border-[#e5e5e5]">

        {/* HEADER */}
        <h1 className="text-4xl font-semibold text-center tracking-tight mb-3 text-[#1d1d1f]">
          Sign in
        </h1>
        <p className="text-center text-[#6e6e73] mb-8 text-sm">
          ログイン
        </p>

        {/* FORM */}
        <div className="space-y-5">

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border border-[#d2d2d7]
              focus:border-black focus:ring-0 outline-none
              text-[15px] bg-[#fafafa]
            "
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border border-[#d2d2d7]
              focus:border-black focus:ring-0 outline-none
              text-[15px] bg-[#fafafa]
            "
          />

          <button
            onClick={login}
            className="
              w-full bg-black text-white py-3 rounded-xl
              text-[15px] font-medium hover:opacity-90 transition
            "
          >
            ログイン
          </button>

          <button
            onClick={register}
            className="
              w-full border border-[#d2d2d7] py-3 rounded-xl
              text-[15px] font-medium text-[#1d1d1f]
              hover:bg-[#f5f5f7] transition
            "
          >
            新規登録
          </button>

          <div className="text-center text-[#6e6e73] text-sm mt-6">
            または
          </div>

          <button
            onClick={loginGithub}
            className="
              w-full flex items-center justify-center gap-2
              bg-[#24292f] text-white py-3 rounded-xl
              text-[15px] font-medium hover:opacity-90 transition
            "
          >
            <GitHubIcon />
            GitHub でログイン
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mt-6 text-green-600 text-sm text-center">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
