import { useCommunityStore } from '../hooks/useStore'

const categories = [
  { key: 'encourage', label: '暖心鼓励', dotColor: 'var(--primary)' },
  { key: 'experience', label: '经验分享', dotColor: 'var(--accent)' },
  { key: 'emotion', label: '情绪树洞', dotColor: 'var(--accent-light)' },
  { key: 'night', label: '晚安陪伴', dotColor: 'var(--warm)' }
]

export function WriteSheet() {
  const {
    writeSheetOpen, writeContent, writeCategory,
    setWriteContent, setWriteCategory, submitPost, closeWriteSheet
  } = useCommunityStore()

  const canSubmit = writeContent.trim().length > 0 && writeCategory >= 0

  return (
    <>
      {writeSheetOpen && (
        <div className="sheet-overlay show" onClick={closeWriteSheet}>
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <span className="sheet-title">点亮你的星</span>
            <span className="sheet-subtitle">你的每一句话，都会温暖另一位家长</span>

            <textarea
              className="write-textarea"
              placeholder="写下你想说的话..."
              maxLength={200}
              value={writeContent}
              onChange={(e) => setWriteContent(e.target.value)}
            />
            <span className="write-counter">{writeContent.length} / 200</span>

            <div className="category-select">
              <span className="category-label">选择分类：</span>
              <div className="category-tags">
                {categories.map((cat, i) => (
                  <span
                    key={i}
                    className={`cat-tag ${writeCategory === i ? 'selected' : ''}`}
                    onClick={() => setWriteCategory(i)}
                  >
                    <span className="cat-dot" style={{ background: cat.dotColor }} />
                    {cat.label}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`submit-btn ${canSubmit ? 'active' : ''}`}
              onClick={canSubmit ? submitPost : undefined}
            >
              发布星光
            </div>
          </div>
        </div>
      )}
    </>
  )
}
