'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiAuthFetch, errorHandling } from '@/lib/apiFetch';

type Memo = {
  id: number;
  user_id: string;
  title: string;
  content?: string;
  createdAt: string;
};

export default function MemosPage() {
  const router = useRouter();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [email, setEmail] = useState('');

  // 認証付きAPI呼び出しとエラー処理の定義
  async function loadUser() {
    await errorHandling(async () => {
      const json = await apiAuthFetch('/api/auth/user');
      setEmail(json.email);
    }, setError);
  }

  async function loadMemos() {
    await errorHandling(async () => {
      const json = await apiAuthFetch('/api/memos');
      setMemos(json);
    }, setError);
  }

  useEffect(() => {
    loadUser();
    loadMemos();
  }, []);

  async function createMemo() {
    await errorHandling(async () => {
      await apiAuthFetch('/api/memos', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      // 作成後、入力フィールドをクリア
      setTitle('');
      setContent('');
      await loadMemos();
    }, setError);
  }

  async function deleteMemo(id: number) {
    await errorHandling(async () => {
      await apiAuthFetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });
      await loadMemos();
    }, setError);
  }

  function startEdit(memo: Memo) {
    setEditingId(memo.id);
    setEditTitle(memo.title);
    setEditContent(memo.content || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  }

  async function updateMemo(id: number) {
    await errorHandling(
      async () => {
        await apiAuthFetch(`/api/memos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
          }),
        });

        cancelEdit();
        await loadMemos();
      },
      setError
    );
  }

  async function logout() {
    setError('');
    try {
      await apiAuthFetch(`/api/auth/logout`, {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('user_session');
      router.push('/');
    }
  }

  return (
    // ★ 変更点1: ビビッドなグラデーション背景
    <div className="min-h-screen max-w-3xl w-full mx-auto px-4 py-10 space-y-8 bg-gradient-to-br from-fuchsia-500 to-pink-500">

      {/* --- ヘッダー --- */}
      {/* ★ 変更点2: カードデザインをビビッドに */}
      <Card className="shadow-2xl bg-white/90 backdrop-blur-sm rounded-xl">
        <CardContent className="flex justify-between items-center">
          <div>
            {/* ★ 変更点3: タイトルをネオンカラーに */}
            <Typography variant="h5" className="font-extrabold tracking-tight"
              sx={{ color: 'transparent', background: 'linear-gradient(to right, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Cloud Notes
            </Typography>
            <Typography variant="body2" color="text.secondary" className="font-medium text-gray-600">
              {email}
            </Typography>
          </div>

          <Button 
            variant="contained" 
            // ★ 変更点4: ログアウトボタンを強調色に
            sx={{ 
              background: '#f43f5e', // Pink-500
              '&:hover': { background: '#e11d48' } // Pink-600
            }} 
            onClick={logout}
          >
            ログアウト
          </Button>
        </CardContent>
      </Card>

      {/* --- エラー表示 --- */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* --- メモ追加 --- */}
      {/* ★ 変更点2: カードデザインをビビッドに */}
      <Card className="shadow-2xl bg-white/90 backdrop-blur-sm rounded-xl">
        <CardContent>
          <Typography variant="h6" className="font-extrabold mb-4 text-violet-700">
            新しいメモを追加
          </Typography>

          {/* ★ 変更点5: テキストフィールドをビビッドなフォーカスに */}
          <TextField
            label="タイトル"
            fullWidth
            sx={{ mb: 2, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' } }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="内容"
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' } }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* ★ 変更点6: 追加ボタンをグラデーションで強調 */}
          <Button 
            variant="contained" 
            fullWidth 
            onClick={createMemo}
            sx={{ 
              background: 'linear-gradient(45deg, #a855f7 30%, #ec4899 90%)', // Violet to Pink
              boxShadow: '0 3px 5px 2px rgba(168, 85, 247, .3)',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': { opacity: 0.9 }
            }}
          >
            追加する
          </Button>
        </CardContent>
      </Card>

      {/* ★ 変更点7: 区切り線を鮮やかな色に */}
      <Divider sx={{ borderBottomWidth: 3, borderColor: '#d946ef' }} />

      {/* --- メモ一覧 --- */}
      <div className="space-y-4">
        {memos.map((memo) => (
          // ★ 変更点8: 各メモカードもデザインを統一
          <Card key={memo.id} className="shadow-lg bg-white/95 rounded-xl">
            <CardContent>

              {/* 編集モード */}
              {editingId === memo.id ? (
                <>
                  <TextField
                    label="タイトル"
                    fullWidth
                    sx={{ mb: 2, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' } }}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <TextField
                    label="内容"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' } }}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    {/* ★ 変更点9: 編集操作アイコンの色を強調 */}
                    <IconButton 
                      color="primary" 
                      onClick={() => updateMemo(memo.id)}
                      sx={{ color: '#0ea5e9' }} // Sky-500
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="default" onClick={cancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </div>
                </>
              ) : (
                <>
                  {/* ヘッダー（日時 + ボタン） */}
                  <div className="flex justify-between items-start mb-2">
                    <Typography className="text-xs font-semibold text-pink-600">
                      {new Date(memo.createdAt).toLocaleString()}
                    </Typography>

                    <div className="flex gap-1">
                      {/* ★ 変更点9: 編集操作アイコンの色を強調 */}
                      <IconButton 
                        color="info" 
                        size="small" 
                        onClick={() => startEdit(memo)}
                        sx={{ color: '#0ea5e9' }} // Sky-500
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => deleteMemo(memo.id)}
                        sx={{ color: '#ef4444' }} // Red-500
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>

                  {/* 内容 */}
                  <Typography variant="h6" className="mb-1 font-bold text-gray-800">
                    {memo.title}
                  </Typography>

                  <Typography className="text-gray-700 whitespace-pre-line text-sm">
                    {memo.content}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}