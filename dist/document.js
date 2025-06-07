import external_quill_default from "quill";
import file_pdf_js_default from "./assets/file_pdf.js";
import file_docx_js_default from "./assets/file_docx.js";
import file_xlsx_js_default from "./assets/file_xlsx.js";
import file_unknown_js_default from "./assets/file_unknown.js";
import "./document.css";
const BlockEmbed = external_quill_default["import"]('blots/block/embed');
const Link = external_quill_default["import"]('formats/link');
const ATTRIBUTES = [
    'title',
    'size',
    'type'
];
const FILE_ICONS = {
    pdf: file_pdf_js_default,
    doc: file_docx_js_default,
    docx: file_docx_js_default,
    xls: file_xlsx_js_default,
    xlsx: file_xlsx_js_default,
    ppt: file_unknown_js_default,
    pptx: file_unknown_js_default,
    txt: file_unknown_js_default,
    default: file_unknown_js_default
};
class CustomDocumentBlot extends BlockEmbed {
    static create(value) {
        const node = super.create(value);
        node.setAttribute('href', this.sanitize(value.url));
        node.setAttribute('data-original-url', value.url);
        node.setAttribute('target', '_blank');
        node.setAttribute('title', value.title);
        node.setAttribute('data-size', value.size);
        node.setAttribute('data-type', value.type);
        const card = document.createElement('div');
        card.className = 'document-card';
        const icon = document.createElement('img');
        icon.className = 'document-icon';
        icon.src = this.getFileIcon(value.type);
        icon.alt = value.type.toUpperCase();
        const info = document.createElement('div');
        info.className = 'document-info';
        const title = document.createElement('div');
        title.className = 'document-title';
        title.textContent = value.title;
        const meta = document.createElement('div');
        meta.className = 'document-meta';
        meta.textContent = `\u{6587}\u{4EF6}\u{5927}\u{5C0F}\u{FF1A}${value.size}`;
        info.appendChild(title);
        info.appendChild(meta);
        card.appendChild(icon);
        card.appendChild(info);
        node.appendChild(card);
        return node;
    }
    static formats(domNode) {
        return ATTRIBUTES.reduce((formats, attribute)=>{
            if (domNode.hasAttribute(attribute)) formats[attribute] = domNode.getAttribute(attribute) || void 0;
            return formats;
        }, {});
    }
    static isOfficeDoc(url) {
        const ext = url.split('.').pop()?.toLowerCase();
        return [
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx'
        ].includes(ext || '');
    }
    static sanitize(url) {
        if (this.isOfficeDoc(url)) return Link.sanitize(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`);
        return Link.sanitize(url);
    }
    static value(domNode) {
        return {
            url: domNode.getAttribute('data-original-url') || '',
            title: domNode.getAttribute('title') || '',
            size: domNode.getAttribute('data-size') || '',
            type: domNode.getAttribute('data-type') || ''
        };
    }
    format(name, value) {
        if (ATTRIBUTES.includes(name)) if (value) this.domNode.setAttribute(name, value.toString());
        else this.domNode.removeAttribute(name);
        else super.format(name, value);
    }
    static getFileIcon(type) {
        return FILE_ICONS[type.toLowerCase()] || FILE_ICONS.default;
    }
}
CustomDocumentBlot.blotName = 'document';
CustomDocumentBlot.className = 'ql-document';
CustomDocumentBlot.tagName = 'a';
const src_document = CustomDocumentBlot;
export { src_document as default };
