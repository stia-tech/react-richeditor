import { jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import external_quill_default from "quill";
import "quill/dist/quill.snow.css";
import "./editor.css";
import external_video_js_default from "./video.js";
import external_document_js_default from "./document.js";
import { message } from "antd";
const MAX_FILE_SIZE = 10485760;
const MAX_VIDEO_SIZE = 104857600;
const MAX_IMAGE_SIZE = 3145728;
function formatFileSize(bytes) {
    if (0 === bytes) return '0 B';
    const k = 1024;
    const sizes = [
        'B',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
const ImageHandler = {
    upload: async (file, uploadFile)=>{
        try {
            if (file.size > MAX_IMAGE_SIZE) return void message.warning(`\u{56FE}\u{7247}\u{5927}\u{5C0F}\u{4E0D}\u{80FD}\u{8D85}\u{8FC7}${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
            const response = await uploadFile(file, {
                type: 'image'
            });
            return response.cdnUrl;
        } catch (error) {
            console.error("\u56FE\u7247\u4E0A\u4F20\u5931\u8D25:", error);
            throw error;
        }
    }
};
external_quill_default.register('formats/video', external_video_js_default);
external_quill_default.register('formats/document', external_document_js_default);
const VideoHandler = {
    upload: async (file, uploadFile)=>{
        try {
            if (file.size > MAX_VIDEO_SIZE) return void message.warning(`\u{89C6}\u{9891}\u{5927}\u{5C0F}\u{4E0D}\u{80FD}\u{8D85}\u{8FC7}${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
            const response = await uploadFile(file, {
                type: 'video'
            });
            return response.cdnUrl;
        } catch (error) {
            console.error("\u89C6\u9891\u4E0A\u4F20\u5931\u8D25:", error);
            throw error;
        }
    }
};
const DocumentHandler = {
    upload: async (file, uploadFile)=>{
        try {
            if (file.size > MAX_FILE_SIZE) return void message.warning(`\u{6587}\u{6863}\u{5927}\u{5C0F}\u{4E0D}\u{80FD}\u{8D85}\u{8FC7}${MAX_FILE_SIZE / 1024 / 1024}MB`);
            const response = await uploadFile(file, {
                type: 'document'
            });
            return response.cdnUrl;
        } catch (error) {
            console.error("\u6587\u6863\u4E0A\u4F20\u5931\u8D25:", error);
            throw error;
        }
    }
};
const Image = external_quill_default["import"]('formats/image');
Image.sanitize = (url)=>url;
external_quill_default.register('formats/image', Image);
const Video = external_quill_default["import"]('formats/video');
Video.sanitize = (url)=>url;
external_quill_default.register('formats/video', Video);
const Document = external_quill_default["import"]('formats/document');
Document.sanitize = (url)=>url;
external_quill_default.register('formats/document', Document);
const Editor = /*#__PURE__*/ forwardRef(({ value, onChange, readOnly, uploadFile }, ref)=>{
    const containerRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const quillRef = useRef(null);
    useImperativeHandle(ref, ()=>({
            getContentHtml: ()=>quillRef.current?.root.innerHTML || ''
        }));
    useLayoutEffect(()=>{
        onChangeRef.current = onChange;
    });
    useEffect(()=>{
        if (quillRef.current) quillRef.current.enable(!readOnly);
    }, [
        readOnly
    ]);
    useEffect(()=>{
        const container = containerRef.current;
        if (!container) return;
        const editorContainer = container.appendChild(container.ownerDocument.createElement('div'));
        const quill = new external_quill_default(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: [
                        [
                            'bold',
                            'italic',
                            'underline',
                            'strike'
                        ],
                        [
                            'blockquote',
                            'code-block'
                        ],
                        [
                            {
                                header: 1
                            },
                            {
                                header: 2
                            }
                        ],
                        [
                            {
                                list: 'ordered'
                            },
                            {
                                list: 'bullet'
                            }
                        ],
                        [
                            {
                                script: 'sub'
                            },
                            {
                                script: 'super'
                            }
                        ],
                        [
                            {
                                indent: '-1'
                            },
                            {
                                indent: '+1'
                            }
                        ],
                        [
                            {
                                direction: 'rtl'
                            }
                        ],
                        [
                            {
                                size: [
                                    'small',
                                    false,
                                    'large',
                                    'huge'
                                ]
                            }
                        ],
                        [
                            {
                                header: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6,
                                    false
                                ]
                            }
                        ],
                        [
                            {
                                color: []
                            },
                            {
                                background: []
                            }
                        ],
                        [
                            {
                                font: []
                            }
                        ],
                        [
                            {
                                align: []
                            }
                        ],
                        [
                            'clean'
                        ],
                        [
                            'link',
                            'image',
                            'video',
                            'document'
                        ]
                    ],
                    handlers: {
                        image: function() {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'file');
                            input.setAttribute('accept', 'image/*');
                            input.click();
                            input.onchange = async ()=>{
                                const file = input.files?.[0];
                                if (file) try {
                                    const url = await ImageHandler.upload(file, uploadFile);
                                    const range = quill.getSelection(true);
                                    quill.insertEmbed(range.index, 'image', url);
                                    quill.insertText(range.index + 1, '\n');
                                    quill.setSelection(range.index + 2, 0);
                                    onChangeRef.current?.(JSON.stringify(quill.getContents()));
                                } catch (error) {
                                    console.error("\u56FE\u7247\u4E0A\u4F20\u5931\u8D25:", error);
                                }
                            };
                        },
                        video: function() {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'file');
                            input.setAttribute('accept', 'video/*');
                            input.click();
                            input.onchange = async ()=>{
                                const file = input.files?.[0];
                                if (file) try {
                                    const url = await VideoHandler.upload(file, uploadFile);
                                    const range = quill.getSelection(true);
                                    quill.insertEmbed(range.index, 'video', url);
                                    quill.insertText(range.index + 1, '\n');
                                    quill.setSelection(range.index + 2, 0);
                                    onChangeRef.current?.(JSON.stringify(quill.getContents()));
                                } catch (error) {
                                    console.error("\u89C6\u9891\u4E0A\u4F20\u5931\u8D25:", error);
                                }
                            };
                        },
                        document: function() {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'file');
                            input.setAttribute('accept', '.doc,.docx,.pdf,.txt,.md');
                            input.click();
                            input.onchange = async ()=>{
                                const file = input.files?.[0];
                                if (file) try {
                                    const url = await DocumentHandler.upload(file, uploadFile);
                                    const range = quill.getSelection(true);
                                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                                    const size = formatFileSize(file.size);
                                    quill.insertEmbed(range.index, 'document', {
                                        url,
                                        title: file.name,
                                        size,
                                        type: ext
                                    });
                                    quill.insertText(range.index + 1, '\n');
                                    quill.setSelection(range.index + 2, 0);
                                    onChangeRef.current?.(JSON.stringify(quill.getContents()));
                                } catch (error) {
                                    console.error("\u6587\u6863\u4E0A\u4F20\u5931\u8D25:", error);
                                }
                            };
                        }
                    }
                }
            }
        });
        quillRef.current = quill;
        if (value) try {
            const delta = JSON.parse(value);
            quill.setContents(delta);
        } catch (error) {
            console.error('Invalid JSON value:', error);
        }
        quill.on(external_quill_default.events.TEXT_CHANGE, (_, __, source)=>{
            if ('user' === source) {
                const delta = quill.getContents();
                onChangeRef.current?.(JSON.stringify(delta));
            }
        });
        return ()=>{
            quillRef.current = null;
            container.innerHTML = '';
        };
    }, []);
    useEffect(()=>{
        if (quillRef.current && value) try {
            const delta = JSON.parse(value);
            const currentContents = quillRef.current.getContents();
            if (JSON.stringify(currentContents) !== JSON.stringify(delta)) quillRef.current.setContents(delta);
        } catch (error) {
            console.error('Invalid JSON value:', error);
        }
    }, [
        value
    ]);
    return /*#__PURE__*/ jsx("div", {
        ref: containerRef,
        style: {
            backgroundColor: '#fff'
        }
    });
});
Editor.displayName = 'Editor';
const editor = Editor;
export { editor as default };
