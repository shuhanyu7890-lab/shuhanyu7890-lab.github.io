import { useNavStore, useToastStore } from './hooks/useStore'
import { BackgroundParticles } from './components/BackgroundParticles'
import { StatusBar } from './components/StatusBar'
import { NavBar } from './components/NavBar'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { ChatPage } from './pages/ChatPage'
import { MindfulnessPage } from './pages/MindfulnessPage'
import { CommunityPage } from './pages/CommunityPage'
import { ProfilePage } from './pages/ProfilePage'
import { WriteSheet } from './components/WriteSheet'
import { ResourceSheet } from './components/ResourceSheet'

export default function App() {
  const currentTab = useNavStore((s) => s.currentTab)
  const toastVisible = useToastStore((s) => s.visible)
  const toastMessage = useToastStore((s) => s.message)
  const toastType = useToastStore((s) => s.type)

  return (
    <>
      <BackgroundParticles />
      <div className="phone-wrapper">
        <div className="phone-frame">
          <StatusBar />
          <NavBar />

          <div className="page-container">
            <div className={`page ${currentTab === 0 ? 'active' : ''}`}>
              <ChatPage />
            </div>
            <div className={`page ${currentTab === 1 ? 'active' : ''}`}>
              <MindfulnessPage />
            </div>
            <div className={`page ${currentTab === 2 ? 'active' : ''}`}>
              <CommunityPage />
            </div>
            <div className={`page ${currentTab === 3 ? 'active' : ''}`}>
              <ProfilePage />
            </div>
          </div>

          <TabBar />

          <WriteSheet />
          <ResourceSheet />
          <Toast visible={toastVisible} message={toastMessage} type={toastType} />
        </div>
      </div>
    </>
  )
}
