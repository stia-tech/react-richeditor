import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './render.css'

interface RenderProps {
  value: string // JSON 字符串
}

const Render = ({ value }: RenderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 创建 Quill 实例，设置为只读模式
    const quill = new Quill(container, {
      theme: 'snow',
      readOnly: true,
      modules: {
        toolbar: false, // 不显示工具栏
      },
    })

    try {
      // 解析 JSON 字符串并设置内容
      const content = JSON.parse(value)
      quill.setContents(content)
    } catch (error) {
      console.error('解析内容失败:', error)
    }

    return () => {
      // 清理 Quill 实例
      const editor = container.querySelector('.ql-editor')
      if (editor) {
        editor.innerHTML = ''
      }
    }
  }, [value])

  return <div ref={containerRef} className='richeditor-render' />
}

export default Render
