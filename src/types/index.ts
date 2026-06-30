// 全局类型定义

// 心情状态
export type MoodType = 'happy' | 'hopeful' | 'calm' | 'tired' | 'sad' | 'angry'

// 社区分类
export type CommunityCategory = 'encourage' | 'experience' | 'emotion' | 'night'

// 社区帖子
export interface FeedItem {
  id: string
  content: string
  category: CommunityCategory
  label: string
  likes: number
  liked: boolean
  time: string
  _new?: boolean
}

// 徽章
export interface Badge {
  icon: string
  name: string
  unlocked: boolean
}

// 插件
export interface Plugin {
  id: string
  icon: string
  name: string
  desc: string
}

// 聊天消息
export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  source?: string
  actionCard?: {
    title: string
    desc: string
  }
}

// 每日数据
export interface DayData {
  meditated?: boolean
  mood?: MoodType
  note?: string
}

// 资源
export interface Resource {
  name: string
  type: string
  address: string
  distance: string
  tags: string[]
}

// 正念引导语
export interface Guide {
  in: string
  out: string
}
