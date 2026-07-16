'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    shop_name: '',
    phone: '',
    live_date: '',
    start_time: '',
    estimated_gmv: '',
  });
  const [schedules, setSchedules] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 从 localStorage 获取店铺信息，方便重复填写
  useEffect(() => {
    const saved = localStorage.getItem('shop_info');
    if (saved) {
      const info = JSON.parse(saved);
      setFormData(prev => ({
        ...prev,
        shop_name: info.shop_name || '',
        phone: info.phone || '',
      }));
    }
    // 加载该店铺的排期
    const savedSchedules = localStorage.getItem('my_schedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 自动计算结束时间（默认4小时后）
  const getEndTime = (startTime) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + 4;
    let endMinutes = minutes;
    if (endHours >= 24) {
      endHours = endHours - 24;
    }
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.shop_name.trim()) {
      setErrorMsg('请填写店铺名称');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('请填写联系方式');
      return;
    }
    if (!formData.live_date) {
      setErrorMsg('请选择直播日期');
      return;
    }
    if (!formData.start_time) {
      setErrorMsg('请选择开播时间');
      return;
    }
    if (!formData.estimated_gmv || parseFloat(formData.estimated_gmv) <= 0) {
      setErrorMsg('请填写预估成交额');
      return;
    }

    setSubmitting(true);

    const endTime = getEndTime(formData.start_time);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          end_time: endTime,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // 保存店铺信息到 localStorage
        localStorage.setItem('shop_info', JSON.stringify({
          shop_name: formData.shop_name,
          phone: formData.phone,
        }));

        // 添加到本地排期列表
        const newSchedule = {
          id: Date.now(),
          ...formData,
          end_time: endTime,
          is_big_shop: parseFloat(formData.estimated_gmv) >= 15,
        };
        const updatedSchedules = [newSchedule, ...schedules];
        setSchedules(updatedSchedules);
        localStorage.setItem('my_schedules', JSON.stringify(updatedSchedules));

        setShowSuccess(true);

        // 重置表单（保留店铺信息）
        setFormData(prev => ({
          shop_name: prev.shop_name,
          phone: prev.phone,
          live_date: '',
          start_time: '',
          estimated_gmv: '',
        }));
      } else {
        setErrorMsg(result.error || '提交失败，请稍后重试');
      }
    } catch (error) {
      setErrorMsg('网络错误，请检查网络后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('my_schedules', JSON.stringify(updated));
  };

  const totalGMV = schedules.reduce((sum, s) => sum + parseFloat(s.estimated_gmv || 0), 0);
  const isBigShop = totalGMV >= 15;
  const fieldCount = schedules.length;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* 顶部横幅 */}
      <div className="hero-banner">
        <div className="hero-badge">
          <span>⚡</span> 小红书电商 · 文玩玉翠
        </div>
        <h1 className="hero-title">直播扶持排期填写</h1>
        <p className="hero-subtitle">填写直播计划，我们为你安排流量扶持</p>
      </div>

      {/* 扶持信息卡片 */}
      <div className="support-cards">
        <div className="support-card">
          <div className="icon">🚀</div>
          <div className="label">流量扶持</div>
          <div className="value">已开启</div>
        </div>
        <div className="support-card">
          <div className="icon"></div>
          <div className="label">首页推荐</div>
          <div className="value">专属入口</div>
        </div>
        <div className="support-card">
          <div className="icon">🎯</div>
          <div className="label">精准人群</div>
          <div className="value">定向投放</div>
        </div>
      </div>

      {/* 填写表单 */}
      <div className="form-card">
        <div className="form-header">
          <span style={{ fontSize: '20px' }}>📅</span>
          <div>
            <h2>填写直播排期</h2>
            <p>提前填写，系统自动为你安排扶持</p>
          </div>
        </div>

        {errorMsg && (
          <div className="error-msg">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 店铺名称 */}
          <div className="form-group">
            <label className="form-label">
              店铺名称 <span className="required">*</span>
            </label>
            <input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              placeholder="输入店铺名称关键词..."
              className="form-input"
            />
          </div>

          {/* 联系方式 */}
          <div className="form-group">
            <label className="form-label">
              联系方式（手机号）<span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="填写手机号，方便有问题联系你"
              className="form-input"
            />
          </div>

          {/* 直播日期 */}
          <div className="form-group">
            <label className="form-label">
              直播日期 <span className="required">*</span>
            </label>
            <input
              type="date"
              name="live_date"
              value={formData.live_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* 开播时间 */}
          <div className="form-group">
            <label className="form-label">
              开播时间 <span className="required">*</span>
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="form-input"
            />
            {formData.start_time && (
              <p className="form-hint">
                结束时间：{getEndTime(formData.start_time)}（自动计算，默认4小时）
              </p>
            )}
          </div>

          {/* 预估成交额 */}
          <div className="form-group">
            <label className="form-label">
              预估成交额（万元）<span className="required">*</span>
            </label>
            <input
              type="number"
              name="estimated_gmv"
              value={formData.estimated_gmv}
              onChange={handleChange}
              placeholder="如：5"
              min="0"
              step="0.1"
              className="form-input"
            />
            <p className="form-hint">
              大场（预估 ≥15万）将获得额外首页推荐资源
            </p>
            <p className="form-hint warning">
              ️ 必填，不确定可填预估值
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="submit-btn"
          >
            {submitting ? '提交中...' : '提交排期 '}
          </button>
        </form>
      </div>

      {/* 我的直播排期 */}
      {schedules.length > 0 && (
        <div className="schedule-section">
          <div className="schedule-card">
            <div className="schedule-header">
              <h2>
                <span style={{ fontSize: '20px' }}>📋</span>
                我的直播排期
              </h2>
              <span className="schedule-count">{fieldCount} 场</span>
            </div>

            <p className="schedule-stats">
              已提报 {fieldCount} 场 · 计划成交 {totalGMV.toFixed(1)} 万
            </p>

            {/* 进度条 */}
            <div className="progress-section">
              {fieldCount < 5 ? (
                <>
                  <p className="progress-label" style={{ color: '#d97706' }}>
                    🔒 再提报 {5 - fieldCount} 场，解锁官方加热
                  </p>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill locked"
                      style={{ width: `${Math.min((fieldCount / 5) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="progress-hint">
                    不足5场视为无计划开播，不分配流量资源
                  </p>
                </>
              ) : fieldCount < 20 ? (
                <>
                  <p className="progress-label" style={{ color: 'var(--brand-orange)' }}>
                    ⚡ 流量加成 · 再提报{20 - fieldCount}场升级
                  </p>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill active"
                      style={{ width: `${Math.min((fieldCount / 20) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="progress-hint">
                    已解锁流量加成 · 提报20场解锁专属扶持资源
                  </p>
                </>
              ) : (
                <>
                  <p className="progress-label" style={{ color: 'var(--brand-red)', fontWeight: 700 }}>
                    🔥 专属扶持资源
                  </p>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill max" />
                  </div>
                  <p className="progress-hint">
                    已解锁最高等级扶持 · 运营将主动联系你
                  </p>
                </>
              )}
            </div>

            {/* 排期列表 */}
            <div>
              {schedules.map((schedule) => (
                <div key={schedule.id} className="schedule-item">
                  <div className="schedule-item-info">
                    <div className="schedule-item-date">
                      <span className="schedule-dot" />
                      <span>{schedule.live_date}</span>
                    </div>
                    <div className="schedule-item-time">
                      <strong>
                        {schedule.start_time} → {schedule.end_time}
                      </strong>
                      {schedule.is_big_shop && (
                        <span className="schedule-tag big">
                          🔥 大场扶持
                        </span>
                      )}
                      {fieldCount >= 5 && !schedule.is_big_shop && (
                        <span className="schedule-tag heat">
                          ⚡ 官方加热
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="schedule-item-actions">
                    <span className="schedule-item-gmv">
                      预估{schedule.estimated_gmv}万
                    </span>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="delete-btn"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className="footer">
        小红书电商 · 文玩玉翠行业运营团队
      </div>

      {/* 成功弹窗 */}
      {showSuccess && (
        <div
          className="modal-overlay"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-emoji">🎉</div>
            <h3 className="modal-title">排期提交成功！</h3>
            <p className="modal-text">我们已收到你的直播计划</p>
            <p className="modal-text">流量扶持将在开播前自动安排</p>
            <p className="modal-cheer">加油，这场一定爆！</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="modal-btn"
            >
              好的，期待！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
