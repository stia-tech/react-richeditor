import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './editor.css';
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
}
declare const Editor: import("react").ForwardRefExoticComponent<EditorProps & import("react").RefAttributes<Quill>>;
export default Editor;
