import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function SimpleApp() {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#333'
    }}>
      <div>
        <h1>🚀 测试页面</h1>
        <p>如果你能看到这个，说明 React 正常工作</p>
        <div style={{ marginTop: '20px', fontSize: '16px' }}>
          <div>时间: {new Date().toLocaleString()}</div>
          <div>环境: 开发模式</div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>,
)
