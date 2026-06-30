import { useResourceStore, useToastStore } from '../hooks/useStore'
import { resources } from '../data/mockData'

const filters = ['全部', '幼儿园', '小学', '初中']

export function ResourceSheet() {
  const { resourceSheetOpen, resourceFilter, closeResourceMap, setResourceFilter } = useResourceStore()
  const showToast = useToastStore((s) => s.showToast)

  if (!resourceSheetOpen) return null

  return (
    <div className="sheet-overlay show" onClick={closeResourceMap}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <span className="sheet-title">融合教育资源地图</span>
        <span className="sheet-subtitle">查找接收ASD儿童的教育机构</span>

        <div className="resource-map">
          <div className="filter-bar">
            {filters.map((f, i) => (
              <span
                key={i}
                className={`filter-tag ${resourceFilter === i ? 'active' : ''}`}
                onClick={() => setResourceFilter(i)}
              >
                {f}
              </span>
            ))}
          </div>

          <div className="resource-list">
            {resources.map((r, i) => (
              <div className="resource-item" key={i}>
                <div className="ri-header">
                  <span className="ri-name">{r.name}</span>
                  <span className="ri-type">{r.type}</span>
                </div>
                <span className="ri-addr">{r.address}</span>
                <span className="ri-distance">{r.distance}</span>
                <div className="ri-tags">
                  {r.tags.map((t, j) => (
                    <span className="ri-tag" key={j}>{t}</span>
                  ))}
                </div>
                <div className="ri-actions">
                  <span className="ri-action" onClick={() => showToast('拨打功能开发中')}>拨打</span>
                  <span className="ri-action" onClick={() => showToast('导航功能开发中')}>导航</span>
                  <span className="ri-action" onClick={() => showToast('已收藏')}>收藏</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
