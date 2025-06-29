import 'quill/dist/quill.snow.css';
import './editor.css';
import 'highlight.js/styles/github-dark.css';
export type UploadConfig = {
    type: 'image' | 'video' | 'document';
};
export type UploadFile = (file: File, config: UploadConfig) => Promise<{
    url: string;
    cdnUrl: string;
}>;
interface EditorProps {
    value?: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    uploadFile: UploadFile;
    className?: string;
}
export interface EditorRef {
    /** 返回内容的 html 文本，注意只包含内容文本，不包含 html 文件头 */
    getContentHtml: () => string;
}
declare const Editor: import("react").ForwardRefExoticComponent<EditorProps & import("react").RefAttributes<EditorRef>>;
export default Editor;
