import { Quill } from 'react-quill'
const BlockEmbed = Quill.import('blots/block/embed')
const Link = Quill.import('formats/link')

const ATTRIBUTES = ['title', 'size', 'type'] as const
type AttributeType = (typeof ATTRIBUTES)[number]

type Formats = Record<string, string | undefined>

// 文件类型图标映射
const FILE_ICONS = {
  pdf: new URL('./assets/file/file_pdf.svg', import.meta.url).href,
  doc: new URL('./assets/file/file_docx.svg', import.meta.url).href,
  docx: new URL('./assets/file/file_docx.svg', import.meta.url).href,
  xls: new URL('./assets/file/file_xlsx.svg', import.meta.url).href,
  xlsx: new URL('./assets/file/file_xlsx.svg', import.meta.url).href,
  ppt: new URL('./assets/file/file_unknown.svg', import.meta.url).href,
  pptx: new URL('./assets/file/file_unknown.svg', import.meta.url).href,
  txt: new URL('./assets/file/file_unknown.svg', import.meta.url).href,
  default: new URL('./assets/file/file_unknown.svg', import.meta.url).href,
}

class Document extends BlockEmbed {
  static create(value: {
    url: string
    title: string
    size: string
    type: string
  }) {
    const node = super.create(value)
    node.setAttribute('href', this.sanitize(value.url))
    node.setAttribute('target', '_blank')
    node.setAttribute('title', value.title)
    node.setAttribute('data-size', value.size)
    node.setAttribute('data-type', value.type)

    // 创建文档卡片内容
    const card = document.createElement('div')
    card.className = 'document-card'

    // 添加文件图标
    const icon = document.createElement('img')
    icon.className = 'document-icon'
    icon.src = this.getFileIcon(value.type)
    icon.alt = value.type.toUpperCase()

    // 添加文件信息
    const info = document.createElement('div')
    info.className = 'document-info'

    const title = document.createElement('div')
    title.className = 'document-title'
    title.textContent = value.title

    const meta = document.createElement('div')
    meta.className = 'document-meta'
    meta.textContent = `文件大小：${value.size}`

    info.appendChild(title)
    info.appendChild(meta)

    card.appendChild(icon)
    card.appendChild(info)
    node.appendChild(card)

    return node
  }

  static formats(domNode: HTMLElement): Formats {
    return ATTRIBUTES.reduce((formats: Formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute) || undefined
      }
      return formats
    }, {})
  }

  static isOfficeDoc(url: string): boolean {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')
  }

  static sanitize(url: string): string {
    if (this.isOfficeDoc(url)) {
      return Link.sanitize(
        `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`,
      )
    }

    return Link.sanitize(url)
  }

  static value(domNode: HTMLElement): {
    url: string
    title: string
    size: string
    type: string
  } {
    return {
      url: domNode.getAttribute('href') || '',
      title: domNode.getAttribute('title') || '',
      size: domNode.getAttribute('data-size') || '',
      type: domNode.getAttribute('data-type') || '',
    }
  }

  format(name: string, value: string | boolean): void {
    if (ATTRIBUTES.includes(name as AttributeType)) {
      if (value) {
        this.domNode.setAttribute(name, value.toString())
      } else {
        this.domNode.removeAttribute(name)
      }
    } else {
      super.format(name, value)
    }
  }

  private static getFileIcon(type: string): string {
    return (
      FILE_ICONS[type.toLowerCase() as keyof typeof FILE_ICONS] ||
      FILE_ICONS.default
    )
  }
}

Document.blotName = 'document'
Document.className = 'ql-document'
Document.tagName = 'a'

export default Document
