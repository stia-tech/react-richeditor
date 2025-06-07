import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './render.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

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
        syntax: { hljs },
      },
    })

    try {
      // 尝试解析 JSON 字符串
      const content = JSON.parse(value)
      quill.setContents(content)
    } catch {
      // 如果 JSON 解析失败，则认为是 HTML 字符串，直接设置内容
      const editor = container.querySelector('.ql-editor')
      if (editor) {
        editor.innerHTML = value
      }
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
