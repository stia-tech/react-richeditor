import Quill from 'quill'

// 自定义视频 Blot
const BlockEmbed = Quill.import('blots/block/embed') as any
const Link = Quill.import('formats/link') as any

const ATTRIBUTES = ['height', 'width'] as const
type AttributeType = (typeof ATTRIBUTES)[number]

type Formats = Record<string, string | undefined>

class CustomVideoBlot extends BlockEmbed {
  static create(value: string) {
    const node = super.create(value)
    // 添加video标签所需的属性
    node.setAttribute('controls', 'controls')
    node.setAttribute('type', 'video/mp4')
    node.setAttribute('src', this.sanitize(value))
    // 为了兼容 iOS 设备上，显示海报图（视频封面）
    node.setAttribute('preload', 'metadata')
    node.setAttribute(
      'poster',
      this.sanitize(value) + '?ci-process=snapshot&time=0.01',
    )
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

  static sanitize(url: string): string {
    return Link.sanitize(url)
  }

  static value(domNode: HTMLElement): string {
    return domNode.getAttribute('src') || ''
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

  html(): string {
    const video = this.value()
    return `<a href="${video}">${video}</a>`
  }
}
CustomVideoBlot.blotName = 'video'
CustomVideoBlot.className = 'ql-video'
CustomVideoBlot.tagName = 'video'

export default CustomVideoBlot
