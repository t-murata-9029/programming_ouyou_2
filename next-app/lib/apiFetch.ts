'use client';

// 共通APIリクエスト処理
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  accessToken?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetch(url, { ...options, headers });

  // 認証エラー
  if ([401, 403].includes(response.status)) {
    localStorage.removeItem('user_session');
    alert('認証されてません。再度ログインしてください。');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  // ★ ここが重要：204 は JSON が存在しないレスポンスなので parse しない
  if (response.status === 204) {
    return null; 
  }

  // エラー用の JSON 解析
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error('APIリクエストに失敗しました. ' + JSON.stringify(error));
  }

  // 成功レスポンス JSON
  return response.json();
}

// 共通認証後APIリクエスト処理
export async function apiAuthFetch(url: string, options: RequestInit = {}) {
  const sessionData = JSON.parse(localStorage.getItem('user_session') || '{}');
  const accessToken = sessionData?.access_token || '';
  return apiFetch(url, options, accessToken);
}

// 共通エラーハンドリング処理
export async function errorHandling(
  func: () => Promise<void>,
  setError: (msg: string) => void
) {
  setError('');
  try {
    await func();
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : 'エラーが発生しました');
    console.error(e);
  }
}
