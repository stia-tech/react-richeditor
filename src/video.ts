import { Quill } from 'react-quill'
const BlockEmbed = Quill.import('blots/block/embed')
const Link = Quill.import('formats/link')

const ATTRIBUTES = ['height', 'width'] as const
type AttributeType = (typeof ATTRIBUTES)[number]

type Formats = Record<string, string | undefined>

class Video extends BlockEmbed {
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
Video.blotName = 'video'
Video.className = 'ql-video'
Video.tagName = 'video'

export default Video
