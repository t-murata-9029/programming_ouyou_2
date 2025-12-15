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
import { apiAuthFetch, errorHandling  } from '@/lib/apiFetch';

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
        method: 'PUT',     // route.ts に合わせて更新
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      cancelEdit();     // 編集モード解除
      await loadMemos(); // 最新一覧取得
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
   <div className="max-w-3xl w-full mx-auto px-4 py-10 space-y-8">

     {/* --- ヘッダー --- */}
     <Card className="shadow-md">
       <CardContent className="flex justify-between items-center">
         <div>
           <Typography variant="h5" className="font-bold">
             メモアプリ
           </Typography>
           <Typography variant="body2" color="text.secondary">
             {email}
           </Typography>
         </div>

         <Button variant="outlined" color="inherit" onClick={logout}>
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
       <Alert onClose={() => setError('')} severity="error">
         {error}
       </Alert>
     </Snackbar>

     {/* --- メモ追加 --- */}
     <Card className="shadow-md">
       <CardContent>
         <Typography variant="h6" className="font-semibold mb-4">
           新しいメモを追加
         </Typography>

         <TextField
           label="タイトル"
           fullWidth
           sx={{ mb: 2 }}
           value={title}
           onChange={(e) => setTitle(e.target.value)}
         />

         <TextField
           label="内容"
           fullWidth
           multiline
           minRows={3}
           sx={{ mb: 2 }}
           value={content}
           onChange={(e) => setContent(e.target.value)}
         />

         <Button variant="contained" fullWidth onClick={createMemo}>
           追加する
         </Button>
       </CardContent>
     </Card>

     <Divider />

     {/* --- メモ一覧 --- */}
     <div className="space-y-4">
       {memos.map((memo) => (
         <Card key={memo.id} className="shadow-sm">
           <CardContent>

             {/* 編集モード */}
             {editingId === memo.id ? (
               <>
                 <TextField
                   label="タイトル"
                   fullWidth
                   sx={{ mb: 2 }}
                   value={editTitle}
                   onChange={(e) => setEditTitle(e.target.value)}
                 />
                 <TextField
                   label="内容"
                   fullWidth
                   multiline
                   minRows={3}
                   sx={{ mb: 2 }}
                   value={editContent}
                   onChange={(e) => setEditContent(e.target.value)}
                 />
                 <div className="flex gap-2 justify-end">
                   <IconButton color="primary" onClick={() => updateMemo(memo.id)}>
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
                   <Typography className="text-xs text-gray-500">
                     {new Date(memo.createdAt).toLocaleString()}
                   </Typography>

                   <div className="flex gap-1">
                     <IconButton color="info" size="small" onClick={() => startEdit(memo)}>
                       <EditIcon />
                     </IconButton>
                     <IconButton color="error" size="small" onClick={() => deleteMemo(memo.id)}>
                       <DeleteIcon />
                     </IconButton>
                   </div>
                 </div>

                 {/* 内容 */}
                 <Typography variant="h6" className="mb-1">
                   {memo.title}
                 </Typography>

                 <Typography className="text-gray-700 whitespace-pre-line">
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
