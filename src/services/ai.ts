/**
 * Coze AI API 服务
 * 接入 Coze 项目工作流 API (v1/workflow/run)
 */

const COZE_API_TOKEN = 'pat_oOcXEkavKUDPYsHS7JQ3G9txdlLLLxGfGH6L4JYAtj4oEqYs0aL1i4OsIEgjEDCf'
const COZE_WORKFLOW_ID = '7587060690864848936'
const COZE_API_BASE = 'https://api.coze.cn/v1'

// 生成或获取用户唯一标识
function getUserId(): string {
  const key = 'star_companion_user_id'
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem(key, userId)
  }
  return userId
}

// 会话历史（用于多轮对话）
let conversationHistory: Array<{ role: string; content: string }> = []

export function resetConversation() {
  conversationHistory = []
}

/**
 * 调用 Coze 工作流 API
 * Coze 项目模式使用 workflow/run 接口
 */
export async function chatWithCoze(
  message: string,
  onChunk?: (text: string) => void,
  webSearch?: boolean
): Promise<string> {
  if (!COZE_API_TOKEN || !COZE_WORKFLOW_ID) {
    throw new Error('请先配置 COZE_API_TOKEN 和 COZE_WORKFLOW_ID')
  }

  // 构建对话上下文
  let contextMessage = message
  if (conversationHistory.length > 0) {
    const history = conversationHistory
      .map((m) => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
      .join('\n')
    contextMessage = `【对话历史】\n${history}\n【用户新消息】${message}`
  }

  // 联网搜索模式
  if (webSearch) {
    contextMessage = `【联网搜索模式】请结合最新网络信息回答以下问题：\n${contextMessage}`
  }

  const payload = {
    workflow_id: COZE_WORKFLOW_ID,
    parameters: {
      USER_INPUT: contextMessage
    }
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${COZE_API_TOKEN}`,
    'Content-Type': 'application/json'
  }

  // 30 秒超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${COZE_API_BASE}/workflow/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Coze API 错误 (${response.status}): ${errorText}`)
    }

    const result = await response.json()

    if (result.code !== 0) {
      throw new Error(`Coze API 错误: ${result.msg || '未知错误'}`)
    }

    // 解析工作流返回的数据
    let replyText = ''
    try {
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
      replyText = data?.data || data?.output || '抱歉，我暂时无法回复，请稍后再试。'
    } catch {
      replyText = result.data || '抱歉，我暂时无法回复，请稍后再试。'
    }

    // 清理转义字符
    replyText = replyText
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')

    // 保存对话历史
    conversationHistory.push({ role: 'user', content: message })
    conversationHistory.push({ role: 'assistant', content: replyText })

    // 限制历史长度，避免 token 过长
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20)
    }

    return replyText
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试')
    }
    throw err
  }
}

/**
 * 模拟回复 - 当 API 不可用时的降级方案
 */
import { mockReplies } from '../data/mockData'

export function getMockReply(text: string): {
  text: string
  source: string
  actionCard?: { title: string; desc: string }
} {
  for (const [kw, data] of Object.entries(mockReplies)) {
    if (text.includes(kw)) return data
  }
  return mockReplies['默认']
}
