import { useNavStore } from '../hooks/useStore'

const tabs = [
  {
    icon: (active: boolean) => (
      <svg className="tab-icon-svg" viewBox="0 0 24 24" fill={active ? 'var(--coral)' : 'none'} stroke={active ? 'var(--coral)' : 'var(--text-muted)'} strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'AI咨询'
  },
  {
    icon: (active: boolean) => (
      <svg className="tab-icon-svg" viewBox="0 0 24 24" fill={active ? 'var(--coral)' : 'none'} stroke={active ? 'var(--coral)' : 'var(--text-muted)'} strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    label: '心灵驿站'
  },
  {
    icon: (active: boolean) => (
      <svg className="tab-icon-svg" viewBox="0 0 24 24" fill={active ? 'var(--coral)' : 'none'} stroke={active ? 'var(--coral)' : 'var(--text-muted)'} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    label: '星语社区'
  },
  {
    icon: (active: boolean) => (
      <svg className="tab-icon-svg" viewBox="0 0 24 24" fill={active ? 'var(--coral)' : 'none'} stroke={active ? 'var(--coral)' : 'var(--text-muted)'} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    label: '我的'
  }
]

export function TabBar() {
  const { currentTab, switchTab } = useNavStore()

  return (
    <div className="tab-bar">
      {tabs.map((tab, i) => (
        <div
          key={i}
          className={`tab-item ${currentTab === i ? 'active' : ''}`}
          onClick={() => switchTab(i)}
        >
          {tab.icon(currentTab === i)}
          <span className="tab-label">{tab.label}</span>
        </div>
      ))}
    </div>
  )
}
