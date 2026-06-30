interface ToastProps {
  visible: boolean
  message: string
  type: 'default' | 'success'
}

export function Toast({ visible, message, type }: ToastProps) {
  return (
    <div className={`toast ${visible ? 'show' : ''} ${type === 'success' ? 'success' : ''}`}>
      {message}
    </div>
  )
}
