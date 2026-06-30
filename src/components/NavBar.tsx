import { useNavStore } from '../hooks/useStore'

export function NavBar() {
  const navTitle = useNavStore((s) => s.navTitle)

  return (
    <div className="nav-bar">
      {navTitle}
    </div>
  )
}
