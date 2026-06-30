import { useCommunityStore } from '../hooks/useStore'
import { StarIcon, RefreshIcon, HeartIcon, UserIcon, ChatIcon } from '../components/SvgIcons'
import type { CommunityCategory } from '../types'
import './CommunityPage.css'

const filterTags: { key: CommunityCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'encourage', label: '暖心鼓励' },
  { key: 'experience', label: '经验分享' },
  { key: 'emotion', label: '情绪树洞' },
  { key: 'night', label: '晚安陪伴' }
]

export function CommunityPage() {
  const { feedData, currentFilter, filterCommunity, toggleLike, openWriteSheet, refreshFeed } = useCommunityStore()

  const displayData = currentFilter === 'all'
    ? feedData
    : feedData.filter((item) => item.category === currentFilter)

  return (
    <div className="community-bg page-flex">
      <div className="page-scroll">
        {/* Hero */}
        <div className="hero-section">
          <span className="hero-title">每一份心事，都值得被温柔接住</span>
          <span className="hero-subtitle">匿名分享你的困扰与鼓励，让温暖在家长间流动</span>
        </div>

        {/* Action Buttons */}
        <div className="action-row">
          <div className="action-btn primary" onClick={openWriteSheet}>
            <StarIcon size={20} fill />
            <span className="action-text">点亮你的星</span>
          </div>
          <div className="action-btn secondary" onClick={refreshFeed}>
            <RefreshIcon size={20} />
            <span className="action-text">接收更多星光</span>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="community-filter">
          {filterTags.map((tag) => (
            <span
              key={tag.key}
              className={`comm-filter-tag ${currentFilter === tag.key ? 'active' : ''}`}
              onClick={() => filterCommunity(tag.key)}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Feed List */}
        <div className="feed-list">
          {displayData.length === 0 ? (
            <div className="empty-feed">
              暂无相关星光，来点亮第一颗吧 ✨
            </div>
          ) : (
            displayData.map((item, index) => (
              <div
                key={item.id}
                className={`feed-card ${item._new ? 'card-new' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="feed-header">
                  <div className="feed-avatar">
                    <UserIcon size={14} />
                  </div>
                  <div className="feed-meta">
                    <span className="feed-author">匿名家长</span>
                    <span className="feed-time">{item.time}</span>
                  </div>
                  <span className={`feed-category ${item.category}`}>{item.label}</span>
                </div>

                <span className="feed-content">{item.content}</span>

                <div className="feed-footer">
                  <div
                    className={`feed-action ${item.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(item.id)}
                  >
                    <HeartIcon size={14} fill={item.liked} />
                    <span className="action-count">{item.likes}</span>
                  </div>
                  <div className="feed-action" onClick={openWriteSheet}>
                    <ChatIcon size={14} />
                    <span className="action-count">回应鼓励</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  )
}
