import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

export async function POST(req: NextRequest) {
  try {
    // Authorization ヘッダーからアクセストークン取得
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 400 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Supabase のログアウト実行（REST API）
    const { json, status } = await SupabaseAuthService.logout(accessToken);

    // ★ ここが重要：204 の場合は JSON を返せない
    if (status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(json, { status });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
