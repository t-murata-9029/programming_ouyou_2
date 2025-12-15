'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, errorHandling, getApiUrl } from '@/lib/apiFetch';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OAuth Login (2回定義されていたため、1つに統合して警告回避を適用)
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
    window.location.href = getApiUrl('/api/auth/oauth2/github');
  };

  return (
    // ★ 変更点1: ビビッドなグラデーション背景
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-fuchsia-500 to-pink-500 px-4">
      {/* ★ 変更点2: カードデザインをシャープで明るく変更 */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 border-4 border-white/50 ring-4 ring-pink-300/50">

        {/* HEADER */}
        {/* ★ 変更点3: タイトルをネオンカラーに */}
        <h1 className="text-5xl font-extrabold text-center tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-400">
          Sign In
        </h1>
        <p className="text-center text-gray-700 font-semibold mb-8 text-lg">
          Welcome to the Future
        </p>

        {/* FORM */}
        <div className="space-y-4">

          {/* ★ 変更点4: 入力フィールドのフォーカスと背景を変更 */}
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full px-5 py-3 rounded-lg border-2 border-gray-300
              focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none
              text-base bg-gray-50 transition duration-200
            "
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full px-5 py-3 rounded-lg border-2 border-gray-300
              focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none
              text-base bg-gray-50 transition duration-200
            "
          />

          {/* ★ 変更点5: ログインボタンをグラデーション＋シャドウで強調 */}
          <button
            onClick={login}
            className="
              w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg
              text-lg font-bold shadow-lg shadow-pink-500/50
              hover:shadow-xl hover:shadow-pink-600/60 transition duration-200
            "
          >
            ログイン
          </button>

          {/* ★ 変更点6: 新規登録ボタンをネオン風の枠線で強調 */}
          <button
            onClick={register}
            className="
              w-full border-2 border-violet-500 py-3 rounded-lg
              text-lg font-bold text-violet-700
              hover:bg-violet-50 transition duration-200
            "
          >
            新規登録
          </button>

          <div className="text-center text-gray-600 text-sm py-2">
            — または —
          </div>

          {/* ★ 変更点7: GitHubボタンを黒とシャドウで強調 */}
          <button
            onClick={loginGithub}
            className="
              w-full flex items-center justify-center gap-2
              bg-black/80 text-white py-3 rounded-lg
              text-lg font-bold shadow-lg shadow-gray-700/50
              hover:bg-black transition duration-200
            "
          >
            <GitHubIcon />
            GitHub でログイン
          </button>
        </div>

        {/* ERROR / SUCCESS メッセージ */}
        {error && (
          <div className="mt-6 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-3 bg-green-100 text-green-700 border border-green-400 rounded-lg text-sm text-center font-medium">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}