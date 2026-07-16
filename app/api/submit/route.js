import { NextResponse } from 'next/server';
import { supabaseAdmin, isConfigured } from '@/lib/supabase';

export async function POST(request) {
  try {
    if (!isConfigured) {
      return NextResponse.json(
        { error: '系统未配置数据库，请联系管理员' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { shop_name, phone, live_date, start_time, end_time, estimated_gmv } = body;

    // 验证必填字段
    if (!shop_name || !phone || !live_date || !start_time || !estimated_gmv) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 判断是否为大场（预估成交额 >= 15万）
    const is_big_shop = parseFloat(estimated_gmv) >= 15;

    // 插入数据库
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert({
        shop_name: shop_name.trim(),
        phone: phone.trim(),
        live_date,
        start_time,
        end_time: end_time || start_time,
        estimated_gmv: parseFloat(estimated_gmv),
        is_big_shop,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: '提交失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: '排期提交成功！',
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
