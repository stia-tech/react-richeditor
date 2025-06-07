declare const BlockEmbed: any;
import './document.css';
type Formats = Record<string, string | undefined>;
declare class CustomDocumentBlot extends BlockEmbed {
    static create(value: {
        url: string;
        title: string;
        size: string;
        type: string;
    }): any;
    static formats(domNode: HTMLElement): Formats;
    static isOfficeDoc(url: string): boolean;
    static sanitize(url: string): string;
    static value(domNode: HTMLElement): {
        url: string;
        title: string;
        size: string;
        type: string;
    };
    format(name: string, value: string | boolean): void;
    private static getFileIcon;
}
export default CustomDocumentBlot;
