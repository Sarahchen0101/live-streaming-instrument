'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/schedules?password=${encodeURIComponent(password)}`);
      const result = await res.json();

      if (res.ok) {
        setAuthenticated(true);
        setSchedules(result.data);
      } else {
        setError(result.error || '密码错误');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/export?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `直播排期_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const result = await res.json();
        setError(result.error || '导出失败');
      }
    } catch {
      setError('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/schedules?password=${encodeURIComponent(password)}`);
      const result = await res.json();
      if (res.ok) {
        setSchedules(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError('刷新失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤数据
  const filteredSchedules = schedules.filter(s =>
    s.shop_name.toLowerCase().includes(filter.toLowerCase()) ||
    s.phone.includes(filter)
  );

  // 统计
  const totalSubmissions = schedules.length;
  const totalGMV = schedules.reduce((sum, s) => sum + parseFloat(s.estimated_gmv || 0), 0);
  const bigShopCount = schedules.filter(s => s.is_big_shop).length;

  // 按日期分组
  const groupedByDate = filteredSchedules.reduce((acc, s) => {
    const date = s.live_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-emoji">🔐</div>
          <h1 className="login-title">管理员后台</h1>
          <p className="login-subtitle">请输入管理员密码</p>

          {error && (
            <div className="error-msg" style={{ textAlign: 'left' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              className="login-input"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? '验证中...' : '进入后台'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* 顶部导航 */}
      <div className="admin-nav">
        <div className="admin-nav-inner">
          <h1 className="admin-nav-title"> 排期管理后台</h1>
          <div className="admin-nav-actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary"
            >
              刷新
            </button>
            <button
              onClick={handleExport}
              disabled={loading || schedules.length === 0}
              className="btn-primary"
            >
              导出 Excel
            </button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        {/* 统计卡片 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value red">{totalSubmissions}</div>
            <div className="stat-label">总提报场次</div>
          </div>
          <div className="stat-card">
            <div className="stat-value orange">{totalGMV.toFixed(1)}万</div>
            <div className="stat-label">计划成交总额</div>
          </div>
          <div className="stat-card">
            <div className="stat-value amber">{bigShopCount}</div>
            <div className="stat-label">大场数量</div>
          </div>
        </div>

        {/* 搜索过滤 */}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索店铺名称或手机号..."
          className="search-input"
        />

        {error && (
          <div className="error-msg">{error}</div>
        )}

        {/* 数据列表 */}
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📭</div>
            <p>暂无数据</p>
          </div>
        ) : (
          Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => (
              <div key={date} className="date-group">
                <div className="date-group-header">
                  <h3 className="date-group-title">
                    <span className="schedule-dot" />
                    {date}
                    <span className="date-group-count">({items.length}场)</span>
                  </h3>
                  <span className="date-group-total">
                    合计 {items.reduce((s, i) => s + parseFloat(i.estimated_gmv || 0), 0).toFixed(1)} 万
                  </span>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>店铺名称</th>
                        <th>联系方式</th>
                        <th>时间</th>
                        <th style={{ textAlign: 'right' }}>预估GMV</th>
                        <th style={{ textAlign: 'center' }}>类型</th>
                        <th>提交时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="shop-name">{item.shop_name}</td>
                          <td>{item.phone}</td>
                          <td className="time-cell">
                            {item.start_time}→{item.end_time}
                          </td>
                          <td className="gmv">{item.estimated_gmv}万</td>
                          <td className="type-badge">
                            <span className={`type-badge-inner ${item.is_big_shop ? 'big' : 'normal'}`}>
                              {item.is_big_shop ? ' 大场' : '普通'}
                            </span>
                          </td>
                          <td className="submit-time">
                            {item.created_at ? new Date(item.created_at).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
