import { useProfileStore, useToastStore } from '../hooks/useStore'
import { UserIcon } from '../components/SvgIcons'
import './ProfilePage.css'

// 徽章图标 SVG
const badgeIcons: Record<string, JSX.Element> = {
  spoon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 2v2a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V2"/><path d="M2 22l14-14"/>
    </svg>
  ),
  toilet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
    </svg>
  ),
  shoe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 22L8 14"/><path d="M8 14c3-3 8-4 13-3v5c-3 0-8 1-9 4"/>
    </svg>
  ),
  brush: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  finger: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 10V6a3 3 0 0 0-6 0v7"/><path d="M18 12v-2a4 4 0 0 0-8 0v5"/><path d="M10 17v-5a3 3 0 0 0-6 0v6a4 4 0 0 0 8 0z"/>
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  smile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  )
}

const badgeList = [
  { icon: 'spoon', name: '干饭王', unlocked: true },
  { icon: 'toilet', name: '如厕达人', unlocked: true },
  { icon: 'shoe', name: '穿鞋能手', unlocked: true },
  { icon: 'brush', name: '刷牙勇士', unlocked: false },
  { icon: 'eye', name: '眼神对视', unlocked: true },
  { icon: 'finger', name: '手指指物', unlocked: false },
  { icon: 'clock', name: '安静等待', unlocked: false },
  { icon: 'smile', name: '情绪平复', unlocked: false }
]

const triggerBars = [
  { name: '环境嘈杂', percent: 45 },
  { name: '打断既定路线', percent: 30 },
  { name: '陌生人接触', percent: 25 }
]

const sootheBars = [
  { name: '深压觉拥抱', percent: 55 },
  { name: '视觉计时器', percent: 35 },
  { name: '音乐安抚', percent: 28 }
]

export function ProfilePage() {
  const { editMode, plugins, availPlugins, toggleEditMode, removePlugin, addPlugin } = useProfileStore()
  const showToast = useToastStore((s) => s.showToast)

  return (
    <div className="profile-bg page-flex">
      <div className="page-scroll">
        {/* Identity Card */}
        <div className="identity-card">
          <div className="id-card-content">
            <div className="avatar-circle">
              <UserIcon size={24} />
            </div>
            <div className="profile-info">
              <span className="profile-name">星宝妈</span>
              <span className="profile-id">ID: XB20240001</span>
              <span className="profile-location">深圳 · 南山</span>
            </div>
          </div>

          <div className="badge-section">
            <span className="badge-title">星能徽章</span>
            <div className="badge-wall">
              {badgeList.map((b, i) => (
                <div
                  key={i}
                  className={`badge-item ${b.unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => {
                    if (!b.unlocked) {
                      showToast(`太棒啦！「${b.name}」徽章已点亮！`, 'success')
                    }
                  }}
                >
                  <div className="badge-icon-wrapper">
                    <div className="badge-icon-svg">{badgeIcons[b.icon]}</div>
                    {b.unlocked && <div className="badge-glow" />}
                  </div>
                  <span className="badge-name">{b.name}</span>
                  <span className="badge-status">{b.unlocked ? '已掌握' : '未掌握'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">行为数据看板</span>
            <span className="section-desc">本月统计（基于已确认的入档卡片）</span>
          </div>

          <div className="glass-card">
            <span className="dashboard-title">雷区预警榜</span>
            <span className="dashboard-subtitle">本月最易引发崩溃的 TOP 3 场景</span>
            <div className="bar-list">
              {triggerBars.map((t, i) => (
                <div key={i} className="bar-item">
                  <div className="bar-label">
                    <span className="bar-name">{t.name}</span>
                    <span className="bar-percent">{t.percent}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${t.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <span className="dashboard-title">有效安抚榜</span>
            <span className="dashboard-subtitle">本月实测最有效的干预方法 TOP 3</span>
            <div className="bar-list">
              {sootheBars.map((t, i) => (
                <div key={i} className="bar-item">
                  <div className="bar-label">
                    <span className="bar-name">{t.name}</span>
                    <span className="bar-percent">{t.percent}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${t.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="export-btn" onClick={() => showToast('正在生成复诊报告...')}>
            生成复诊报告
          </div>
        </div>

        {/* Plugin Matrix */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">功能应用矩阵</span>
            <span className="section-desc">核心功能固定，外围功能可自定义</span>
          </div>

          <div className="matrix-group">
            <span className="matrix-group-title">核心锁屏区</span>
            <div className="matrix-grid">
              <div className="matrix-item" onClick={() => showToast('加载中...')}>
                <div className="matrix-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <span className="matrix-name">星宝临床摘要</span>
                <span className="matrix-desc">过敏史、用药史与行为图谱</span>
              </div>
              <div className="matrix-item" onClick={() => showToast('加载中...')}>
                <div className="matrix-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <span className="matrix-name">专属干预计划库</span>
                <span className="matrix-desc">阶段性训练计划存档</span>
              </div>
            </div>
          </div>

          <div className="matrix-group">
            <div className="matrix-group-header">
              <span className="matrix-group-title">自选外挂区</span>
              <span className="matrix-edit-btn" onClick={toggleEditMode}>
                {editMode ? '完成' : '自定义'}
              </span>
            </div>
            <div className="matrix-grid">
              {plugins.map((p) => (
                <div
                  key={p.id}
                  className={`matrix-item ${editMode ? 'edit-mode' : ''}`}
                  onClick={() => {
                    if (editMode) {
                      removePlugin(p.id)
                      showToast(`已移除「${p.name}」`)
                    } else {
                      showToast('加载中...')
                    }
                  }}
                >
                  <div className="matrix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span className="matrix-name">{p.name}</span>
                  <span className="matrix-desc">{p.desc}</span>
                  {editMode && <div className="remove-btn">−</div>}
                </div>
              ))}
            </div>

            {editMode && (
              <div className="add-pool">
                <span className="add-pool-title">从组件池添加</span>
                <div className="pool-grid">
                  {availPlugins.map((p) => (
                    <div
                      key={p.id}
                      className="pool-item"
                      onClick={() => {
                        addPlugin(p.id)
                        showToast(`已添加「${p.name}」`, 'success')
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="pool-name">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
