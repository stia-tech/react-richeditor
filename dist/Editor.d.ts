import React from 'react';
import 'react-quill/dist/quill.snow.css';
import './styles.css';
export type UploadConfig = {
    bucket?: string;
    mimeType?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    progress?: (percent: number) => void;
    showProgressModal?: boolean;
    /** 例如 aigc/text */
    pathPrefix?: 'aigc/text' | 'aigc/image' | 'aigc/video' | 'tmp/clouddisk' | 'wxminprogram' | 'bbs' | 'bbs/h5editor';
};
export type UploadFile = (file: File, config: UploadConfig) => Promise<{
    url: string;
    cdnUrl: string;
}>;
type EditorProps = {
    uploadFile: UploadFile;
    value?: string;
    onChange?: (value: string) => void;
};
declare const Editor: React.FC<EditorProps>;
export default Editor;
