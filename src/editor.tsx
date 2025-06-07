import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import type { ForwardedRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './editor.css'
import CustomVideoBlot from './video'
import CustomDocumentBlot from './document'
import { message } from 'antd'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGE_SIZE = 3 * 1024 * 1024 // 3MB

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export type UploadConfig = {
  type: 'image' | 'video' | 'document'
}

export type UploadFile = (
  file: File,
  config: UploadConfig,
) => Promise<{ url: string; cdnUrl: string }>

// 自定义图片处理器
const ImageHandler = {
  upload: async (file: File, uploadFile: UploadFile) => {
    try {
      if (file.size > MAX_IMAGE_SIZE) {
        message.warning(`图片大小不能超过${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
        return
      }
      const response = await uploadFile(file, { type: 'image' })
      return response.cdnUrl
    } catch (error) {
      console.error('图片上传失败:', error)
      throw error
    }
  },
}

Quill.register('formats/video', CustomVideoBlot)
Quill.register('formats/document', CustomDocumentBlot)

// 自定义视频处理器
const VideoHandler = {
  upload: async (file: File, uploadFile: UploadFile) => {
    try {
      if (file.size > MAX_VIDEO_SIZE) {
        message.warning(`视频大小不能超过${MAX_VIDEO_SIZE / 1024 / 1024}MB`)
        return
      }
      const response = await uploadFile(file, { type: 'video' })
      return response.cdnUrl
    } catch (error) {
      console.error('视频上传失败:', error)
      throw error
    }
  },
}

// 自定义文档处理器
const DocumentHandler = {
  upload: async (file: File, uploadFile: UploadFile) => {
    try {
      if (file.size > MAX_FILE_SIZE) {
        message.warning(`文档大小不能超过${MAX_FILE_SIZE / 1024 / 1024}MB`)
        return
      }
      const response = await uploadFile(file, { type: 'document' })
      return response.cdnUrl
    } catch (error) {
      console.error('文档上传失败:', error)
      throw error
    }
  },
}

// 注册自定义图片处理器
const Image = Quill.import('formats/image')
;(Image as any).sanitize = (url: string) => url
Quill.register('formats/image', Image)

// 注册自定义视频处理器
const Video = Quill.import('formats/video')
;(Video as any).sanitize = (url: string) => url
Quill.register('formats/video', Video)

// 注册自定义文档处理器
const Document = Quill.import('formats/document')
;(Document as any).sanitize = (url: string) => url
Quill.register('formats/document', Document)

interface EditorProps {
  value?: string // JSON 字符串
  onChange?: (value: string) => void // 返回 JSON 字符串
  readOnly?: boolean
  uploadFile: UploadFile
}

// Editor is a controlled React component
const Editor = forwardRef(
  (
    { value, onChange, readOnly, uploadFile }: EditorProps,
    ref: ForwardedRef<Quill>,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const onChangeRef = useRef(onChange)

    useLayoutEffect(() => {
      onChangeRef.current = onChange
    })

    useEffect(() => {
      if (ref && 'current' in ref) {
        ref.current?.enable(!readOnly)
      }
    }, [ref, readOnly])

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      )
      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ header: 1 }, { header: 2 }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ script: 'sub' }, { script: 'super' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ direction: 'rtl' }],
              [{ size: ['small', false, 'large', 'huge'] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              [{ align: [] }],
              ['clean'],
              ['link', 'image', 'video', 'document'],
            ],
            handlers: {
              image: function () {
                const input = document.createElement('input')
                input.setAttribute('type', 'file')
                input.setAttribute('accept', 'image/*')
                input.click()

                input.onchange = async () => {
                  const file = input.files?.[0]
                  if (file) {
                    try {
                      const url = await ImageHandler.upload(file, uploadFile)
                      const range = quill.getSelection(true)
                      quill.insertEmbed(range.index, 'image', url)
                      // 在图片后插入换行并移动光标
                      quill.insertText(range.index + 1, '\n')
                      quill.setSelection(range.index + 2, 0)
                      // 手动触发 onChange
                      onChangeRef.current?.(JSON.stringify(quill.getContents()))
                    } catch (error) {
                      console.error('图片上传失败:', error)
                    }
                  }
                }
              },
              video: function () {
                const input = document.createElement('input')
                input.setAttribute('type', 'file')
                input.setAttribute('accept', 'video/*')
                input.click()

                input.onchange = async () => {
                  const file = input.files?.[0]
                  if (file) {
                    try {
                      const url = await VideoHandler.upload(file, uploadFile)
                      const range = quill.getSelection(true)
                      quill.insertEmbed(range.index, 'video', url)
                      // 在视频后插入换行并移动光标
                      quill.insertText(range.index + 1, '\n')
                      quill.setSelection(range.index + 2, 0)
                      // 手动触发 onChange
                      onChangeRef.current?.(JSON.stringify(quill.getContents()))
                    } catch (error) {
                      console.error('视频上传失败:', error)
                    }
                  }
                }
              },
              document: function () {
                const input = document.createElement('input')
                input.setAttribute('type', 'file')
                input.setAttribute('accept', '.doc,.docx,.pdf,.txt,.md')
                input.click()

                input.onchange = async () => {
                  const file = input.files?.[0]
                  if (file) {
                    try {
                      const url = await DocumentHandler.upload(file, uploadFile)
                      const range = quill.getSelection(true)
                      // 获取文件扩展名
                      const ext =
                        file.name.split('.').pop()?.toLowerCase() || ''
                      // 格式化文件大小
                      const size = formatFileSize(file.size)
                      quill.insertEmbed(range.index, 'document', {
                        url,
                        title: file.name,
                        size,
                        type: ext,
                      })
                      // 在文档后插入换行并移动光标
                      quill.insertText(range.index + 1, '\n')
                      quill.setSelection(range.index + 2, 0)
                      // 手动触发 onChange
                      onChangeRef.current?.(JSON.stringify(quill.getContents()))
                    } catch (error) {
                      console.error('文档上传失败:', error)
                    }
                  }
                }
              },
            },
          },
        },
      })

      if (ref && 'current' in ref) {
        ref.current = quill
      }

      // 处理初始值
      if (value) {
        try {
          const delta = JSON.parse(value)
          quill.setContents(delta)
        } catch (error) {
          console.error('Invalid JSON value:', error)
        }
      }

      quill.on(Quill.events.TEXT_CHANGE, (_, __, source) => {
        if (source === 'user') {
          const delta = quill.getContents()
          onChangeRef.current?.(JSON.stringify(delta))
        }
      })

      return () => {
        if (ref && 'current' in ref) {
          ref.current = null
        }
        container.innerHTML = ''
      }
    }, [ref])

    // 同步外部 value 到编辑器
    useEffect(() => {
      if (ref && 'current' in ref && ref.current && value) {
        try {
          const delta = JSON.parse(value)
          const currentContents = ref.current.getContents()
          if (JSON.stringify(currentContents) !== JSON.stringify(delta)) {
            ref.current.setContents(delta)
          }
        } catch (error) {
          console.error('Invalid JSON value:', error)
        }
      }
    }, [ref, value])

    return <div ref={containerRef} style={{ backgroundColor: '#fff' }} />
  },
)

Editor.displayName = 'Editor'

export default Editor
