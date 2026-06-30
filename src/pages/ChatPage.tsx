import { useState, useRef, useEffect, useMemo } from 'react'
import { useChatStore, useResourceStore } from '../hooks/useStore'
import { quickTags } from '../data/mockData'
import { BotIcon, UserIcon, LocationIcon, ChatIcon, PlusIcon, ClockIcon, SendIcon, UploadIcon } from '../components/SvgIcons'
import { marked } from 'marked'
import './ChatPage.css'

// 配置 marked 渲染器
marked.setOptions({
  breaks: true,  // 换行转 <br>
  gfm: true,     // GitHub 风格 Markdown
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  // 用 marked 解析 Markdown 为 HTML
  const html = marked.parse(text) as string
  return html
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function ChatPage() {
  const { messages, webSearch, isLoading, toggleWebSearch, sendMessage, newChat } = useChatStore()
  const openResourceMap = useResourceStore((s) => s.openResourceMap)
  const [input, setInput] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text && !uploadedFile) return

    // 构建发送文本：优先用输入文字，有文件则附加文件名
    let sendText = text
    if (uploadedFile) {
      sendText = text
        ? `${text}\n[已上传文件: ${uploadedFile.name}]`
        : `[已上传文件: ${uploadedFile.name}]`
    }
    if (sendText) {
      sendMessage(sendText)
    }
    setInput('')
    setUploadedFile(null)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  return (
    <div className="chat-bg page-flex">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="tool-item" onClick={openResourceMap}>
          <div className="tool-icon-wrap" style={{ background: 'linear-gradient(135deg, #a8d0e0, #80b8d0)' }}>
            <LocationIcon size={18} />
          </div>
          <span className="tool-label">资源地图</span>
        </div>
        <div className={`tool-item ${webSearch ? 'active' : ''}`} onClick={toggleWebSearch}>
          <div className="tool-icon-wrap" style={{ background: 'linear-gradient(135deg, #a0c8e8, #80b0d0)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
            </svg>
          </div>
          <span className="tool-label">联网搜索</span>
        </div>
        <div className="tool-item" onClick={newChat}>
          <div className="tool-icon-wrap" style={{ background: 'linear-gradient(135deg, #b8d0c0, #98b8a8)' }}>
            <PlusIcon size={18} />
          </div>
          <span className="tool-label">新对话</span>
        </div>
        <div className="tool-item">
          <div className="tool-icon-wrap" style={{ background: 'linear-gradient(135deg, #d0b8d0, #b8a0b8)' }}>
            <ClockIcon size={18} />
          </div>
          <span className="tool-label">历史</span>
        </div>
      </div>

      {/* Messages */}
      <div className="page-scroll" ref={scrollRef} id="chatMessages">
        {!hasMessages && (
          <div className="welcome">
            <div className="welcome-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span className="welcome-title">你好，我是星伴</span>
            <span className="welcome-desc">由专业医生审核的知识库支持<br/>随时为你提供ASD干预咨询</span>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`msg-wrapper ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
            {msg.role === 'ai' ? (
              <div className="msg-bubble ai-bubble">
                <div className="ai-avatar"><BotIcon size={16} /></div>
                <div className="bubble-content">
                  <div className="msg-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  {msg.source && (
                    <div className="msg-source">
                      <span className="source-label">知识库来源：</span>
                      <span className="source-text">{msg.source}</span>
                    </div>
                  )}
                  {msg.actionCard && (
                    <div className="action-card">
                      <div className="card-inner">
                        <span className="card-title">{msg.actionCard.title}</span>
                        <span className="card-desc">{msg.actionCard.desc}</span>
                        <span className="card-btn">查看详细 →</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="msg-bubble user-bubble">
                <div className="bubble-content">
                  <span className="msg-text">{escapeHtml(msg.text)}</span>
                </div>
                <div className="user-avatar"><UserIcon size={14} /></div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="msg-wrapper msg-ai">
            <div className="msg-bubble ai-bubble">
              <div className="ai-avatar"><BotIcon size={16} /></div>
              <div className="bubble-content">
                <div className="typing-indicator">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
                <span className="typing-hint">正在为你查找资料...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tags */}
      <div className="quick-tags">
        <div className="tags-row">
          {quickTags.map((tag, i) => (
            <span key={i} className="tag-item" onClick={() => sendMessage(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="input-bar">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <div className={`upload-btn ${uploadedFile ? 'has-file' : ''}`} onClick={handleFileUpload}>
          <UploadIcon size={18} />
        </div>
        <div className="input-wrapper">
          <input
            className="text-input"
            placeholder="输入你的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          />
        </div>
        <div className={`send-btn ${input.trim() || uploadedFile ? 'active' : ''}`} onClick={handleSend}>
          <SendIcon size={14} />
        </div>
      </div>
    </div>
  )
}
