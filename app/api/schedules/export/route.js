import { NextResponse } from 'next/server';
import { supabaseAdmin, isConfigured } from '@/lib/supabase';
import * as XLSX from 'xlsx';

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

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '暂无数据' },
        { status: 404 }
      );
    }

    // 生成 Excel 文件
    const excelData = data.map((item, index) => ({
      '序号': index + 1,
      '店铺名称': item.shop_name,
      '联系方式': item.phone,
      '直播日期': item.live_date,
      '开播时间': item.start_time,
      '结束时间': item.end_time,
      '预估成交额(万元)': item.estimated_gmv,
      '是否大场': item.is_big_shop ? '是' : '否',
      '提交时间': item.created_at,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 25 },  // 店铺名称
      { wch: 15 },  // 联系方式
      { wch: 12 },  // 直播日期
      { wch: 10 },  // 开播时间
      { wch: 10 },  // 结束时间
      { wch: 15 },  // 预估成交额
      { wch: 10 },  // 是否大场
      { wch: 20 },  // 提交时间
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, '直播排期');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=直播排期_${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: '导出失败' },
      { status: 500 }
    );
  }
}
