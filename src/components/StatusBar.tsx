import { useEffect, useState } from 'react'

/** iPhone 信号条 */
function SignalBars() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" style={{ display: 'block' }}>
      <rect x="0.5" y="8" width="2.8" height="4" rx="0.6" />
      <rect x="4.8" y="5.5" width="2.8" height="6.5" rx="0.6" />
      <rect x="9.1" y="3" width="2.8" height="9" rx="0.6" />
      <rect x="13.4" y="0" width="2.8" height="12" rx="0.6" />
    </svg>
  )
}

/** iPhone Wi-Fi 图标 — 每条弧线都内缩避免 stroke 被裁切 */
function WifiIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 24 18" fill="none" style={{ display: 'block' }}>
      <circle cx="12" cy="15" r="1.8" fill="currentColor" />
      <path d="M8 11a5.5 5.5 0 0 1 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 7.5a10 10 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 4a14 14 0 0 1 20 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** iPhone 电池图标 */
function BatteryIcon() {
  return (
    <svg width="28" height="13" viewBox="0 0 28 13" fill="none" style={{ display: 'block' }}>
      <rect x="0" y="0.5" width="24" height="12" rx="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <rect x="2" y="2.5" width="20" height="8" rx="1.5" fill="currentColor" />
      <rect x="24.5" y="4" width="2.5" height="5" rx="1.2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function StatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons">
        <SignalBars />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}
