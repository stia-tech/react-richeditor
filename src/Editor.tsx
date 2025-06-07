import React, { useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import EditorToolbar, { getModules, formats } from './EditorToolbar'
import 'react-quill/dist/quill.snow.css'
import './styles.css'

export type UploadConfig = {
  bucket?: string
  mimeType?: string
  contentDisposition?: string
  contentEncoding?: string
  progress?: (percent: number) => void
  showProgressModal?: boolean
  /** 例如 aigc/text */
  pathPrefix?:
    | 'aigc/text'
    | 'aigc/image'
    | 'aigc/video'
    | 'tmp/clouddisk'
    | 'wxminprogram'
    | 'bbs'
    | 'bbs/h5editor'
}

export type UploadFile = (
  file: File,
  config: UploadConfig,
) => Promise<{ url: string; cdnUrl: string }>

type EditorProps = {
  uploadFile: UploadFile
  value?: string
  onChange?: (value: string) => void
}

const Editor: React.FC<EditorProps> = ({ value, onChange, uploadFile }) => {
  const quillRef = useRef<ReactQuill>(null)
  const [state, setState] = React.useState<{
    value: string | undefined
    toolbar: HTMLDivElement | undefined
  }>({
    value: value ?? '',
    toolbar: undefined,
  })
  const modulesRef = useRef<ReturnType<typeof getModules>>(
    getModules(uploadFile),
  )

  const handleChange = (newValue: string) => {
    setState((prev) => ({ ...prev, value: newValue }))
    onChange?.(newValue)
  }

  useEffect(() => {
    setState((prev) => ({ ...prev, value }))
  }, [value])

  useEffect(() => {
    const adjustTooltipPosition = () => {
      const tooltip = document.querySelector<HTMLDivElement>('.ql-tooltip')
      if (tooltip) {
        const left = parseFloat(tooltip.style.left) || 0
        console.log(left)
        if (left < 0) {
          tooltip.style.left = '10px'
        }
      }
    }

    const observer = new MutationObserver(adjustTooltipPosition)
    const editorContainer = document.querySelector('.ql-container')

    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [quillRef.current])

  return (
    <div
      className='text-editor'
      style={{ backgroundColor: '#fff', height: '100%' }}
    >
      <style>{`
        .ql-snow {
          border: none !important;
        }
        
        .text-editor {
          border: 1px solid #ccc;
        }

        .ql-toolbar {
          border-bottom: 1px solid #ccc !important;
        }
      `}</style>
      <EditorToolbar
        onContainerGet={(v) => {
          setState((prev) => ({ ...prev, toolbar: v }))
        }}
      />
      {state.toolbar && (
        <ReactQuill
          ref={quillRef}
          style={{
            overflowY: 'hidden',
            minHeight: 600,
            backgroundColor: '#fff',
            paddingLeft: 10,
            paddingRight: 10,
          }}
          theme='snow'
          value={state.value}
          onChange={handleChange}
          placeholder=''
          modules={{
            ...modulesRef.current,
            toolbar: {
              ...modulesRef.current.toolbar,
              container: state.toolbar,
            },
          }}
          formats={formats}
        />
      )}
    </div>
  )
}

export default Editor
