import { create } from 'zustand'
import type { ChatMessage, CommunityCategory, FeedItem, MoodType, DayData, Plugin } from '../types'
import { presetFeed, extraFeed, mockReplies } from '../data/mockData'
import { chatWithCoze, getMockReply, resetConversation } from '../services/ai'

// 通用Toast状态
interface ToastState {
  message: string
  type: 'default' | 'success'
  visible: boolean
  showToast: (msg: string, type?: 'default' | 'success') => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => {
  let timer: ReturnType<typeof setTimeout>
  return {
    message: '',
    type: 'default',
    visible: false,
    showToast: (msg, type = 'default') => {
      clearTimeout(timer)
      set({ message: msg, type, visible: true })
      timer = setTimeout(() => set({ visible: false }), 2500)
    },
    hideToast: () => set({ visible: false })
  }
})

// 导航状态
interface NavState {
  currentTab: number
  navTitle: string
  switchTab: (idx: number) => void
}

const navTitles = ['AI 智能咨询', '心灵驿站', '星语社区', '我的']

export const useNavStore = create<NavState>((set) => ({
  currentTab: 0,
  navTitle: navTitles[0],
  switchTab: (idx) => set({ currentTab: idx, navTitle: navTitles[idx] })
}))

// 聊天状态
interface ChatState {
  messages: ChatMessage[]
  webSearch: boolean
  toneStyle: 'gentle' | 'professional'
  isLoading: boolean
  aiEnabled: boolean
  toggleWebSearch: () => void
  toggleTone: () => void
  sendMessage: (text: string) => void
  newChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  webSearch: false,
  toneStyle: 'gentle',
  isLoading: false,
  aiEnabled: true, // 是否启用 Coze API

  toggleWebSearch: () => {
    const next = !get().webSearch
    set({ webSearch: next })
    useToastStore.getState().showToast(next ? '已开启联网搜索' : '已切换为知识库模式')
  },

  toggleTone: () => {
    const next = get().toneStyle === 'gentle' ? 'professional' : 'gentle'
    set({ toneStyle: next })
    useToastStore.getState().showToast(next === 'gentle' ? '已切换为温和语气' : '已切换为专业语气')
  },

  sendMessage: (text) => {
    const userMsg: ChatMessage = {
      id: 'u' + Date.now(),
      role: 'user',
      text
    }
    const aiId = 'a' + Date.now()
    const webSearch = get().webSearch
    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true
    }))

    const aiEnabled = get().aiEnabled

    // 优先使用 Coze API，降级到模拟回复
    if (aiEnabled) {
      ;(async () => {
        try {
          const fullReply = await chatWithCoze(text, undefined, webSearch)

          // 先插入空消息占位，然后打字机逐字输出
          set((s) => ({
            messages: [...s.messages, {
              id: aiId,
              role: 'ai',
              text: ''
            }],
            isLoading: false
          }))

          typewriterEffect(aiId, fullReply)
        } catch (err) {
          console.warn('Coze API 调用失败，使用模拟回复:', err)
          // 降级到模拟回复
          useMockReply(text, aiId)
        }
      })()
    } else {
      useMockReply(text, aiId)
    }
  },

  newChat: () => {
    resetConversation()
    set({ messages: [] })
    useToastStore.getState().showToast('已开启新对话', 'success')
  }
}))

/** 模拟回复降级方案 */
function useMockReply(text: string, aiId: string) {
  const replyData = getMockReply(text)
  setTimeout(() => {
    useChatStore.setState((s) => ({
      messages: s.messages
        .filter((m) => m.id !== aiId)
        .concat({
          id: aiId,
          role: 'ai',
          text: ''
        }),
      isLoading: false
    }))
    typewriterEffect(aiId, replyData.text, replyData.source, replyData.actionCard)
  }, 1200 + Math.random() * 800)
}

/**
 * 打字机逐字输出效果
 * 将完整文本按字符逐帧显示，模拟流式输出
 */
function typewriterEffect(
  aiId: string,
  fullText: string,
  source?: string,
  actionCard?: { title: string; desc: string }
) {
  let index = 0
  const chars = [...fullText] // 用数组展开，正确处理 emoji 等多字节字符
  // 每帧输出的字符数：根据文本长度动态调整速度
  const batchSize = fullText.length > 500 ? 3 : fullText.length > 200 ? 2 : 1
  const intervalMs = 25 // 每帧间隔

  const timer = setInterval(() => {
    index += batchSize
    const currentText = chars.slice(0, index).join('')
    const finished = index >= chars.length

    useChatStore.setState((s) => {
      const newMessages = s.messages.map((m) => {
        if (m.id !== aiId) return m
        return {
          ...m,
          text: currentText,
          ...(finished && source ? { source } : {}),
          ...(finished && actionCard ? { actionCard } : {})
        }
      })
      return { messages: newMessages }
    })

    if (finished) {
      clearInterval(timer)
    }
  }, intervalMs)
}

// 正念/心情状态
interface MindfulnessState {
  starCount: number
  todayMeds: number
  isMeditating: boolean
  remainingSec: number
  checkinStreak: number
  monthData: Record<number, DayData>
  selectedMood: MoodType | null
  moodOverlayOpen: boolean
  calOverlayOpen: boolean
  calYear: number
  calMonth: number

  startMeditation: () => void
  endMeditation: () => void
  tickMeditation: () => void
  completeMeditation: () => void
  recordMood: (day: number, mood: MoodType) => void
  openMoodPicker: () => void
  closeMoodPicker: () => void
  setSelectedMood: (mood: MoodType | null) => void
  toggleCalendar: () => void
  changeMonth: (delta: number) => void
}

const now = new Date()
const currentDay = now.getDate()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

function initDummyData(): Record<number, DayData> {
  const data: Record<number, DayData> = {}
  const moods: MoodType[] = ['happy', 'calm', 'tired', 'sad', 'hopeful', 'angry']
  for (let i = 1; i < currentDay; i++) {
    if (Math.random() > 0.4) {
      data[i] = {
        meditated: Math.random() > 0.3,
        mood: Math.random() > 0.5 ? moods[Math.floor(Math.random() * moods.length)] : undefined
      }
    }
  }
  return data
}

export const useMindfulnessStore = create<MindfulnessState>((set, get) => {
  let timer: ReturnType<typeof setInterval> | null = null

  return {
    starCount: 12,
    todayMeds: 0,
    isMeditating: false,
    remainingSec: 180,
    checkinStreak: 3,
    monthData: initDummyData(),
    selectedMood: null,
    moodOverlayOpen: false,
    calOverlayOpen: false,
    calYear: currentYear,
    calMonth: currentMonth,

    startMeditation: () => {
      if (get().isMeditating) return
      set({ isMeditating: true, remainingSec: 180 })
      timer = setInterval(() => {
        const s = get()
        if (s.remainingSec <= 1) {
          get().completeMeditation()
          return
        }
        set({ remainingSec: s.remainingSec - 1 })
      }, 1000)
    },

    tickMeditation: () => {
      if (!get().isMeditating) return
      const s = get()
      if (s.remainingSec <= 1) {
        get().completeMeditation()
        return
      }
      set({ remainingSec: s.remainingSec - 1 })
    },

    completeMeditation: () => {
      if (timer) { clearInterval(timer); timer = null }
      if (!get().isMeditating) return
      const s = get()
      const newMonthData = { ...s.monthData }
      if (!newMonthData[currentDay]) newMonthData[currentDay] = {}
      newMonthData[currentDay] = { ...newMonthData[currentDay], meditated: true }
      set({
        isMeditating: false,
        starCount: s.starCount + 1,
        todayMeds: s.todayMeds + 1,
        monthData: newMonthData
      })
      useToastStore.getState().showToast('✦ 今日正念完成', 'success')
    },

    endMeditation: () => {
      if (timer) { clearInterval(timer); timer = null }
      if (!get().isMeditating) return
      const s = get()
      const newMonthData = { ...s.monthData }
      if (!newMonthData[currentDay]) newMonthData[currentDay] = {}
      newMonthData[currentDay] = { ...newMonthData[currentDay], meditated: true }
      set({
        isMeditating: false,
        starCount: s.starCount + 1,
        todayMeds: s.todayMeds + 1,
        monthData: newMonthData
      })
      useToastStore.getState().showToast('✦ 已记录本次练习', 'success')
    },

    recordMood: (day, mood) => {
      const newMonthData = { ...get().monthData }
      if (!newMonthData[day]) newMonthData[day] = {}
      newMonthData[day] = { ...newMonthData[day], mood }
      set({ monthData: newMonthData, moodOverlayOpen: false })
      const isToday = day === currentDay
      useToastStore.getState().showToast(isToday ? '⭐ 心情已记录' : `⭐ ${day} 日心情已补充`, 'success')
    },

    openMoodPicker: () => set({ moodOverlayOpen: true, selectedMood: null }),
    closeMoodPicker: () => set({ moodOverlayOpen: false }),
    setSelectedMood: (mood) => set({ selectedMood: mood }),
    toggleCalendar: () => {
      set((s) => ({ calOverlayOpen: !s.calOverlayOpen }))
    },
    changeMonth: (delta) => {
      set((s) => {
        let m = s.calMonth + delta
        let y = s.calYear
        if (m > 12) { m = 1; y++ }
        if (m < 1) { m = 12; y-- }
        return { calMonth: m, calYear: y }
      })
    }
  }
})

// 社区状态
interface CommunityState {
  feedData: FeedItem[]
  currentFilter: CommunityCategory | 'all'
  writeSheetOpen: boolean
  writeCategory: number
  writeContent: string
  likedIds: Record<string, boolean>

  setWriteContent: (c: string) => void
  setWriteCategory: (idx: number) => void
  openWriteSheet: () => void
  closeWriteSheet: () => void
  filterCommunity: (cat: CommunityCategory | 'all') => void
  toggleLike: (id: string) => void
  submitPost: () => void
  refreshFeed: () => void
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  feedData: JSON.parse(JSON.stringify(presetFeed)),
  currentFilter: 'all',
  writeSheetOpen: false,
  writeCategory: -1,
  writeContent: '',
  likedIds: {},

  setWriteContent: (c) => set({ writeContent: c }),
  setWriteCategory: (idx) => set((s) => ({ writeCategory: s.writeCategory === idx ? -1 : idx })),

  openWriteSheet: () => set({ writeSheetOpen: true, writeCategory: -1, writeContent: '' }),
  closeWriteSheet: () => set({ writeSheetOpen: false }),

  filterCommunity: (cat) => set({ currentFilter: cat }),

  toggleLike: (id) => {
    set((s) => {
      const newFeed = s.feedData.map((f) => {
        if (f.id !== id) return f
        const newLiked = !f.liked
        return { ...f, liked: newLiked, likes: newLiked ? f.likes + 1 : f.likes - 1 }
      })
      return { feedData: newFeed }
    })
  },

  submitPost: () => {
    const { writeContent, writeCategory } = get()
    if (!writeContent.trim() || writeCategory < 0) return
    const cats: { key: CommunityCategory; label: string }[] = [
      { key: 'encourage', label: '暖心鼓励' },
      { key: 'experience', label: '经验分享' },
      { key: 'emotion', label: '情绪树洞' },
      { key: 'night', label: '晚安陪伴' }
    ]
    const cat = cats[writeCategory]
    const newPost: FeedItem = {
      id: 'u' + Date.now(),
      content: writeContent.trim(),
      category: cat.key,
      label: cat.label,
      likes: 0,
      liked: false,
      time: '刚刚',
      _new: true
    }
    set((s) => ({
      feedData: [newPost, ...s.feedData],
      currentFilter: 'all',
      writeSheetOpen: false,
      writeCategory: -1,
      writeContent: ''
    }))
    useToastStore.getState().showToast('你的星光已点亮', 'success')
  },

  refreshFeed: () => {
    const newFeed = JSON.parse(JSON.stringify(presetFeed))
    const shuffled = [...extraFeed].sort(() => Math.random() - 0.5)
    const pickCount = 3 + Math.floor(Math.random() * 2)
    const newPosts = shuffled.slice(0, pickCount).map((p: FeedItem) => ({
      ...JSON.parse(JSON.stringify(p)),
      id: 'r' + Date.now() + Math.random(),
      time: '刚刚',
      _new: true
    }))
    newFeed.unshift(...newPosts)
    set({ feedData: newFeed, currentFilter: 'all' })
    useToastStore.getState().showToast('已接收新的星光', 'success')
  }
}))

// 个人中心状态
interface ProfileState {
  editMode: boolean
  plugins: Plugin[]
  availPlugins: Plugin[]
  toggleEditMode: () => void
  removePlugin: (id: string) => void
  addPlugin: (id: string) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  editMode: false,
  plugins: [
    { id:'p1', icon:'bookmark', name:'知识库收藏夹', desc:'实用干预科普存档' },
    { id:'p2', icon:'grid', name:'PECS提示卡库', desc:'日常排期与沟通卡' }
  ],
  availPlugins: [
    { id:'a1', icon:'file', name:'政策补贴向导', desc:'' },
    { id:'a2', icon:'map', name:'机构资源雷达', desc:'' },
    { id:'a3', icon:'headphones', name:'专属客服通道', desc:'' },
    { id:'a4', icon:'message', name:'疗愈星语回顾', desc:'' },
    { id:'a5', icon:'heart', name:'照护者关怀', desc:'' },
    { id:'a6', icon:'calendar', name:'复诊提醒', desc:'' }
  ],

  toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
  removePlugin: (id) => set((s) => {
    const removed = s.plugins.find((p) => p.id === id)
    if (!removed) return s
    return {
      plugins: s.plugins.filter((p) => p.id !== id),
      availPlugins: [...s.availPlugins, { id: removed.id, icon: removed.icon, name: removed.name, desc: '' }]
    }
  }),
  addPlugin: (id) => set((s) => {
    const added = s.availPlugins.find((p) => p.id === id)
    if (!added) return s
    return {
      availPlugins: s.availPlugins.filter((p) => p.id !== id),
      plugins: [...s.plugins, { id: added.id, icon: added.icon, name: added.name, desc: '自定义功能模块' }]
    }
  })
}))

// 资源面板状态
interface ResourceState {
  resourceSheetOpen: boolean
  resourceFilter: number
  openResourceMap: () => void
  closeResourceMap: () => void
  setResourceFilter: (idx: number) => void
}

export const useResourceStore = create<ResourceState>((set) => ({
  resourceSheetOpen: false,
  resourceFilter: 0,
  openResourceMap: () => set({ resourceSheetOpen: true }),
  closeResourceMap: () => set({ resourceSheetOpen: false }),
  setResourceFilter: (idx) => set({ resourceFilter: idx })
}))
