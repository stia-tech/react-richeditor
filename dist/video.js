import external_quill_default from "quill";
const BlockEmbed = external_quill_default["import"]('blots/block/embed');
const Link = external_quill_default["import"]('formats/link');
const ATTRIBUTES = [
    'height',
    'width'
];
class CustomVideoBlot extends BlockEmbed {
    static create(value) {
        const node = super.create(value);
        node.setAttribute('controls', 'controls');
        node.setAttribute('type', 'video/mp4');
        node.setAttribute('src', this.sanitize(value));
        node.setAttribute('preload', 'metadata');
        node.setAttribute('poster', this.sanitize(value) + '?ci-process=snapshot&time=0.01');
        return node;
    }
    static formats(domNode) {
        return ATTRIBUTES.reduce((formats, attribute)=>{
            if (domNode.hasAttribute(attribute)) formats[attribute] = domNode.getAttribute(attribute) || void 0;
            return formats;
        }, {});
    }
    static sanitize(url) {
        return Link.sanitize(url);
    }
    static value(domNode) {
        return domNode.getAttribute('src') || '';
    }
    format(name, value) {
        if (ATTRIBUTES.includes(name)) if (value) this.domNode.setAttribute(name, value.toString());
        else this.domNode.removeAttribute(name);
        else super.format(name, value);
    }
    html() {
        const video = this.value();
        return `<a href="${video}">${video}</a>`;
    }
}
CustomVideoBlot.blotName = 'video';
CustomVideoBlot.className = 'ql-video';
CustomVideoBlot.tagName = 'video';
const src_video = CustomVideoBlot;
export { src_video as default };
