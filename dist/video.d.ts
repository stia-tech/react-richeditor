declare const BlockEmbed: any;
type Formats = Record<string, string | undefined>;
declare class Video extends BlockEmbed {
    static create(value: string): any;
    static formats(domNode: HTMLElement): Formats;
    static sanitize(url: string): string;
    static value(domNode: HTMLElement): string;
    format(name: string, value: string | boolean): void;
    html(): string;
}
export default Video;
