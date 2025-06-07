import { useEffect, useRef } from 'react'
import { Quill } from 'react-quill'
import CustomVideo from './video'
import CustomDocument from './document'
import './document.css'
import { CodeOutlined, FileOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { UploadFile } from './Editor'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGE_SIZE = 3 * 1024 * 1024 // 3MB

// Custom Undo button icon component for Quill editor. You can import it directly
// from 'quill/assets/icons/undo.svg' but I found that a number of loaders do not
// handle them correctly
const CustomUndo = () => (
  <svg viewBox='0 0 18 18'>
    <polygon className='ql-fill ql-stroke' points='6 10 4 12 2 10 6 10' />
    <path
      className='ql-stroke'
      d='M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9'
    />
  </svg>
)

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox='0 0 18 18'>
    <polygon className='ql-fill ql-stroke' points='12 10 14 12 16 10 12 10' />
    <path
      className='ql-stroke'
      d='M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5'
    />
  </svg>
)

// Undo and redo functions for Custom Toolbar
function undoChange(this: any) {
  this.quill.history.undo()
}
function redoChange(this: any) {
  this.quill.history.redo()
}

// 图片上传处理函数
const imageHandler = (uploadToS3: UploadFile) =>
  function (this: any) {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        if (file.size > MAX_IMAGE_SIZE) {
          message.error('文件大小不能超过3MB')
          return
        }

        try {
          const { cdnUrl } = await uploadToS3(file, {
            pathPrefix: 'bbs/h5editor',
            showProgressModal: true,
          })
          const range = this.quill.getSelection(true)
          this.quill.insertEmbed(range.index, 'image', cdnUrl)
        } catch (error) {
          console.error('图片上传失败:', error)
        }
      }
    }
  }

// Add sizes to whitelist and register them
const Size = Quill.import('formats/size')
Size.whitelist = ['extra-small', 'small', 'medium', 'large']
Quill.register(Size, true)

// Add fonts to whitelist and register them
const Font = Quill.import('formats/font')
Font.whitelist = [
  'arial',
  'comic-sans',
  'courier-new',
  'georgia',
  'helvetica',
  'lucida',
]
Quill.register(Font, true)

// 注册视频格式
Quill.register(CustomVideo, true)

// 视频上传处理函数
const videoHandler = (uploadToS3: UploadFile) =>
  function (this: any) {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'video/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        if (file.size > MAX_VIDEO_SIZE) {
          message.error('文件大小不能超过100MB')
          return
        }

        try {
          const { cdnUrl } = await uploadToS3(file, {
            pathPrefix: 'bbs/h5editor',
            showProgressModal: true,
          })
          const range = this.quill.getSelection(true)
          // 插入视频
          this.quill.insertEmbed(range.index, 'video', cdnUrl)
        } catch (error) {
          console.error('视频上传失败:', error)
        }
      }
    }
  }

// 文档上传处理函数
const documentHandler = (uploadToS3: UploadFile) =>
  function (this: any) {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        try {
          if (file.size > MAX_FILE_SIZE) {
            message.error('文件大小不能超过10MB')
            return
          }

          const { cdnUrl } = await uploadToS3(file, {
            pathPrefix: 'bbs/h5editor',
            showProgressModal: true,
          })
          const range = this.quill.getSelection(true)
          // 获取文件扩展名
          const ext = file.name.split('.').pop()?.toLowerCase() || ''
          // 格式化文件大小
          const size = formatFileSize(file.size)
          // 插入文档
          this.quill.insertEmbed(range.index, 'document', {
            url: cdnUrl,
            title: file.name,
            size,
            type: ext,
          })
        } catch (error) {
          console.error('文档上传失败:', error)
        }
      }
    }
  }

function handleInsertCodeBlock(this: any) {
  const editor = this.quill.current?.getEditor?.() || this.quill
  const range = editor.getSelection(true)
  if (!range) return

  const insertIndex = range.index

  // 插入一个代码块行
  editor.insertText(insertIndex, '\n')
  editor.formatLine(insertIndex, 1, 'code-block', true)

  // 插入一个普通段落（非代码块）在代码块之后
  editor.insertText(insertIndex + 1, ' ')
  editor.formatLine(insertIndex + 1, 1, 'code-block', false)

  // 将光标定位在代码块内（第一行）
  editor.setSelection(insertIndex, 0)
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 注册文档格式
Quill.register(CustomDocument, true)

// Modules object for setting up the Quill editor
export const getModules = (uploadToS3: UploadFile) => ({
  toolbar: {
    handlers: {
      undo: undoChange,
      redo: redoChange,
      image: imageHandler(uploadToS3),
      video: videoHandler(uploadToS3),
      document: documentHandler(uploadToS3),
      'code-block-custom': handleInsertCodeBlock,
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
})

// Formats objects for setting up the Quill editor
export const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'align',
  'strike',
  'script',
  'blockquote',
  'background',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'document',
  'color',
  'code-block',
  'code-block-custom',
]

// Quill Toolbar component
const QuillToolbar = ({
  onContainerGet,
}: {
  onContainerGet: (container: HTMLDivElement) => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      onContainerGet(ref.current)
    }
  }, [])

  return (
    <div ref={ref}>
      <span className='ql-formats'>
        <select className='ql-font' defaultValue='arial'>
          <option value='arial'>Arial</option>
          <option value='comic-sans'>Comic Sans</option>
          <option value='courier-new'>Courier New</option>
          <option value='georgia'>Georgia</option>
          <option value='helvetica'>Helvetica</option>
          <option value='lucida'>Lucida</option>
        </select>
        <select className='ql-size' defaultValue='medium'>
          <option value='extra-small'>Size 1</option>
          <option value='small'>Size 2</option>
          <option value='medium'>Size 3</option>
          <option value='large'>Size 4</option>
        </select>
        <select className='ql-header' defaultValue='3'>
          <option value='1'>Heading</option>
          <option value='2'>Subheading</option>
          <option value='3'>Normal</option>
        </select>
      </span>
      <span className='ql-formats'>
        <button className='ql-bold' />
        <button className='ql-italic' />
        <button className='ql-underline' />
        <button className='ql-strike' />
      </span>
      <span className='ql-formats'>
        <button className='ql-list' value='ordered' />
        <button className='ql-list' value='bullet' />
        <button className='ql-indent' value='-1' />
        <button className='ql-indent' value='+1' />
      </span>
      <span className='ql-formats'>
        <button className='ql-script' value='super' />
        <button className='ql-script' value='sub' />
        <button className='ql-blockquote' />
        <button className='ql-direction' />
      </span>
      <span className='ql-formats'>
        <select className='ql-align' />
        <select className='ql-color' />
        <select className='ql-background' />
      </span>
      <span className='ql-formats'>
        <button className='ql-link' />
        <button className='ql-image' />
        <button className='ql-video' />
        <button className='ql-document'>
          <FileOutlined style={{ fontSize: '15px' }} />
        </button>
      </span>
      <span className='ql-formats'>
        <button className='ql-formula' />
        <button className='ql-code-block-custom'>
          <CodeOutlined style={{ fontSize: '15px' }} />
        </button>
        <button className='ql-clean' />
      </span>
      <span className='ql-formats'>
        <button className='ql-undo'>
          <CustomUndo />
        </button>
        <button className='ql-redo'>
          <CustomRedo />
        </button>
      </span>
    </div>
  )
}

export default QuillToolbar
