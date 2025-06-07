import './document.css';
import { UploadFile } from './Editor';
declare function undoChange(this: any): void;
declare function redoChange(this: any): void;
declare function handleInsertCodeBlock(this: any): void;
export declare const getModules: (uploadToS3: UploadFile) => {
    toolbar: {
        handlers: {
            undo: typeof undoChange;
            redo: typeof redoChange;
            image: (this: any) => void;
            video: (this: any) => void;
            document: (this: any) => void;
            'code-block-custom': typeof handleInsertCodeBlock;
        };
    };
    history: {
        delay: number;
        maxStack: number;
        userOnly: boolean;
    };
};
export declare const formats: string[];
declare const QuillToolbar: ({ onContainerGet, }: {
    onContainerGet: (container: HTMLDivElement) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default QuillToolbar;
