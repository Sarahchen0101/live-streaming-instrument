import { NextResponse } from 'next/server';
import { supabaseAdmin, isConfigured } from '@/lib/supabase';

export async function GET(request) {
  try {
    if (!isConfigured) {
      return NextResponse.json(
        { error: '系统未配置数据库' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    // 验证管理员密码
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .order('live_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: '获取数据失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Schedules error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
