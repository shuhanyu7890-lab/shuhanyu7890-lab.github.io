import { useState, useEffect, useRef, useCallback } from 'react'
import { useMindfulnessStore } from '../hooks/useStore'
import { guides, moodMap } from '../data/mockData'
import type { MoodType } from '../types'
import './MindfulnessPage.css'

const currentDay = new Date().getDate()
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const moodOptions: { mood: MoodType; emoji: string; label: string }[] = [
  { mood: 'happy', emoji: '😊', label: '很开心' },
  { mood: 'hopeful', emoji: '🌟', label: '有希望' },
  { mood: 'calm', emoji: '😌', label: '平静' },
  { mood: 'tired', emoji: '😔', label: '疲惫' },
  { mood: 'sad', emoji: '😢', label: '难过' },
  { mood: 'angry', emoji: '😤', label: '烦躁' }
]

export function MindfulnessPage() {
  const store = useMindfulnessStore()
  const [moodNote, setMoodNote] = useState('')
  const [guidePhase, setGuidePhase] = useState<'in' | 'out'>('in')
  const [guideIdx, setGuideIdx] = useState(0)
  const guideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 计时器显示
  const mins = Math.floor(store.remainingSec / 60)
  const secs = store.remainingSec % 60
  const timerDisplay = `${mins}:${String(secs).padStart(2, '0')}`
  const progressPercent = ((180 - store.remainingSec) / 180) * 100

  // 正念引导语轮换
  useEffect(() => {
    if (!store.isMeditating) return

    const g = guides[guideIdx % guides.length]
    const runGuide = () => {
      if (!store.isMeditating) return
      setGuidePhase((prev) => {
        if (prev === 'in') {
          return 'out'
        } else {
          setGuideIdx((i) => i + 1)
          return 'in'
        }
      })
    }

    guideTimerRef.current = setTimeout(runGuide, 4000)
    return () => {
      if (guideTimerRef.current) clearTimeout(guideTimerRef.current)
    }
  }, [store.isMeditating, guidePhase, guideIdx])

  const currentGuide = guides[guideIdx % guides.length]
  const guideMain = guidePhase === 'in' ? currentGuide.in : currentGuide.out
  const guideSub = guidePhase === 'in' ? '吸气 4 秒' : '呼气 4 秒'

  // 心情快照
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const saveMood = () => {
    if (!store.selectedMood) return
    store.recordMood(currentDay, store.selectedMood)
    setMoodNote('')
  }

  // 日历渲染
  const renderCalendarDays = useCallback(() => {
    const year = store.calYear
    const month = store.calMonth
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const isCurrentMonth = currentYear === year && currentMonth === month
    const cells: React.ReactNode[] = []

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-day" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = isCurrentMonth ? store.monthData[day] : null
      const isToday = isCurrentMonth && currentDay === day
      let cls = 'cal-day'
      let content: React.ReactNode = <span className="day-num">{day}</span>

      if (dayData?.mood) {
        cls += ' ' + moodMap[dayData.mood].cls
        content = <span className="day-mood">{moodMap[dayData.mood].emoji}</span>
      } else if (dayData?.meditated) {
        cls += ' checked'
      }
      if (isToday) cls += ' today'

      cells.push(
        <div
          key={day}
          className={cls}
          onClick={() => {
            store.recordMood(day, store.selectedMood || 'calm')
            store.toggleCalendar()
          }}
        >
          {content}
        </div>
      )
    }
    return cells
  }, [store.calYear, store.calMonth, store.monthData, store.selectedMood, store.recordMood, store.toggleCalendar])

  // 统计
  let medCount = 0, moodCount = 0
  if (currentYear === store.calYear && currentMonth === store.calMonth) {
    Object.values(store.monthData).forEach((d) => {
      if (d.meditated) medCount++
      if (d.mood) moodCount++
    })
  }

  return (
    <div className="checkin-bg page-flex">
      {/* Header */}
      <div className="mindful-header">
        <div className="star-count-badge">
          <span style={{ fontSize: 13 }}>✦</span> <span>{store.starCount}</span> 次
        </div>
        <div className="cal-icon-btn" onClick={store.toggleCalendar}>📅</div>
      </div>

      {/* Center */}
      <div className="center-area page-scroll">
        <div className="state-badge">
          <span>✦</span> 今日已练习 <span>{store.todayMeds}</span> 次
        </div>

        {/* Breath Ball */}
        <div className={`breath-container ${store.isMeditating ? 'meditating' : ''}`}>
          <div className={`breath-glow-2 ${store.isMeditating ? 'fast' : ''}`} />
          <div className={`breath-glow-1 ${store.isMeditating ? 'fast' : ''}`} />
          <div className={`breath-ball ${store.isMeditating ? 'fast' : ''}`}>
            <div className="moon-star">
              <div className="moon" />
              <div className="star-icon">✦</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className={`timer-display ${store.isMeditating ? 'show' : ''}`}>
          {timerDisplay}
        </div>

        {/* Guide */}
        <div className="guide-area">
          {!store.isMeditating ? (
            <div className="idle-hint">跟随呼吸的节奏<br/>把注意力带回此刻</div>
          ) : (
            <>
              <div className="guide-main">{guideMain}</div>
              <div className="guide-sub">{guideSub}</div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="action-area">
          {!store.isMeditating ? (
            <button className="start-btn" onClick={store.startMeditation}>
              ✦ 开始今日正念
            </button>
          ) : null}
          <div className={`progress-ring ${store.isMeditating ? 'show' : ''}`}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          {store.isMeditating && (
            <button className="end-btn show" onClick={store.endMeditation}>
              结束本次练习
            </button>
          )}
        </div>
      </div>

      {/* Mood Section */}
      <div className="mood-section">
        <div className="mood-header">
          <span className="label">本周心情</span>
          <div className="mood-write-btn" onClick={store.openMoodPicker}>
            <span>✎</span> 记录此刻心情
          </div>
        </div>
        <div className="mood-snapshot">
          {Array.from({ length: 7 }, (_, i) => {
            const day = currentDay - 6 + i
            if (day < 1) return null
            const dayData = day === currentDay ? store.monthData[currentDay] : store.monthData[day]
            const isToday = day === currentDay
            const d = new Date(currentYear, currentMonth - 1, day)
            const wd = weekDays[d.getDay()]

            if (dayData?.mood) {
              return (
                <div key={day} className={`mood-dot ${isToday ? 'today' : ''} ${moodMap[dayData.mood].cls}`}>
                  <span>{moodMap[dayData.mood].emoji}</span>
                  <span className="day-label">{isToday ? '今天' : `周${wd}`}</span>
                </div>
              )
            }
            return (
              <div key={day} className={`mood-dot empty ${isToday ? 'today' : ''}`}>
                <span />
                <span className="day-label">{isToday ? '今天' : `周${wd}`}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood Picker Overlay */}
      {store.moodOverlayOpen && (
        <div className="med-overlay active" onClick={store.closeMoodPicker}>
          <div className="mood-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-handle" />
            <div className="picker-title">此刻的感受</div>
            <div className="picker-subtitle">选择符合当下的心情</div>

            <div className="mindful-mood-grid">
              {moodOptions.map((opt) => (
                <div
                  key={opt.mood}
                  className={`mindful-mood-item ${store.selectedMood === opt.mood ? 'selected' : ''}`}
                  onClick={() => store.setSelectedMood(opt.mood)}
                >
                  <div className="mindful-emoji">{opt.emoji}</div>
                  <span className="mindful-label">{opt.label}</span>
                </div>
              ))}
            </div>

            <div className="mood-input-area">
              <input
                type="text"
                placeholder="想对自己说的话（选填）"
                maxLength={50}
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
            </div>

            <div className="picker-actions">
              <button className="btn-skip" onClick={store.closeMoodPicker}>取消</button>
              <button
                className={`btn-save ${store.selectedMood ? 'active' : ''}`}
                onClick={saveMood}
              >
                记下心情
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Overlay */}
      {store.calOverlayOpen && (
        <div className="med-overlay active" onClick={store.toggleCalendar}>
          <div className="cal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cal-header">
              <span className="cal-month">{store.calYear}年{store.calMonth}月</span>
              <div className="cal-nav">
                <span onClick={() => store.changeMonth(-1)}>〈</span>
                <span onClick={() => store.changeMonth(1)}>〉</span>
              </div>
            </div>

            <div className="cal-stats">
              <div className="cal-stat-item">
                <span className="num">{medCount}</span>
                <span className="label">正念练习</span>
              </div>
              <div className="cal-stat-item">
                <span className="num">{moodCount}</span>
                <span className="label">心情记录</span>
              </div>
              <div className="cal-stat-item">
                <span className="num" style={{ color: 'var(--primary-dark)' }}>✦ {store.checkinStreak}</span>
                <span className="label">连续天数</span>
              </div>
            </div>

            <div className="cal-weekdays">
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
            <div className="cal-scroll">
              <div className="cal-grid">{renderCalendarDays()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
