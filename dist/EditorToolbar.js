import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Quill } from "react-quill";
import external_video_js_default from "./video.js";
import external_document_js_default from "./document.js";
import "./document.css";
import { CodeOutlined, FileOutlined } from "@ant-design/icons";
import { message } from "antd";
const MAX_FILE_SIZE = 10485760;
const MAX_VIDEO_SIZE = 104857600;
const MAX_IMAGE_SIZE = 3145728;
const CustomUndo = ()=>/*#__PURE__*/ jsxs("svg", {
        viewBox: "0 0 18 18",
        children: [
            /*#__PURE__*/ jsx("polygon", {
                className: "ql-fill ql-stroke",
                points: "6 10 4 12 2 10 6 10"
            }),
            /*#__PURE__*/ jsx("path", {
                className: "ql-stroke",
                d: "M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
            })
        ]
    });
const CustomRedo = ()=>/*#__PURE__*/ jsxs("svg", {
        viewBox: "0 0 18 18",
        children: [
            /*#__PURE__*/ jsx("polygon", {
                className: "ql-fill ql-stroke",
                points: "12 10 14 12 16 10 12 10"
            }),
            /*#__PURE__*/ jsx("path", {
                className: "ql-stroke",
                d: "M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
            })
        ]
    });
function undoChange() {
    this.quill.history.undo();
}
function redoChange() {
    this.quill.history.redo();
}
const imageHandler = (uploadToS3)=>function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async ()=>{
            const file = input.files?.[0];
            if (file) {
                if (file.size > MAX_IMAGE_SIZE) return void message.error("\u6587\u4EF6\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC73MB");
                try {
                    const { cdnUrl } = await uploadToS3(file, {
                        pathPrefix: 'bbs/h5editor',
                        showProgressModal: true
                    });
                    const range = this.quill.getSelection(true);
                    this.quill.insertEmbed(range.index, 'image', cdnUrl);
                } catch (error) {
                    console.error("\u56FE\u7247\u4E0A\u4F20\u5931\u8D25:", error);
                }
            }
        };
    };
const Size = Quill["import"]('formats/size');
Size.whitelist = [
    'extra-small',
    'small',
    'medium',
    'large'
];
Quill.register(Size, true);
const Font = Quill["import"]('formats/font');
Font.whitelist = [
    'arial',
    'comic-sans',
    'courier-new',
    'georgia',
    'helvetica',
    'lucida'
];
Quill.register(Font, true);
Quill.register(external_video_js_default, true);
const videoHandler = (uploadToS3)=>function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'video/*');
        input.click();
        input.onchange = async ()=>{
            const file = input.files?.[0];
            if (file) {
                if (file.size > MAX_VIDEO_SIZE) return void message.error("\u6587\u4EF6\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC7100MB");
                try {
                    const { cdnUrl } = await uploadToS3(file, {
                        pathPrefix: 'bbs/h5editor',
                        showProgressModal: true
                    });
                    const range = this.quill.getSelection(true);
                    this.quill.insertEmbed(range.index, 'video', cdnUrl);
                } catch (error) {
                    console.error("\u89C6\u9891\u4E0A\u4F20\u5931\u8D25:", error);
                }
            }
        };
    };
const documentHandler = (uploadToS3)=>function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt');
        input.click();
        input.onchange = async ()=>{
            const file = input.files?.[0];
            if (file) try {
                if (file.size > MAX_FILE_SIZE) return void message.error("\u6587\u4EF6\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC710MB");
                const { cdnUrl } = await uploadToS3(file, {
                    pathPrefix: 'bbs/h5editor',
                    showProgressModal: true
                });
                const range = this.quill.getSelection(true);
                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                const size = formatFileSize(file.size);
                this.quill.insertEmbed(range.index, 'document', {
                    url: cdnUrl,
                    title: file.name,
                    size,
                    type: ext
                });
            } catch (error) {
                console.error("\u6587\u6863\u4E0A\u4F20\u5931\u8D25:", error);
            }
        };
    };
function handleInsertCodeBlock() {
    const editor = this.quill.current?.getEditor?.() || this.quill;
    const range = editor.getSelection(true);
    if (!range) return;
    const insertIndex = range.index;
    editor.insertText(insertIndex, '\n');
    editor.formatLine(insertIndex, 1, 'code-block', true);
    editor.insertText(insertIndex + 1, ' ');
    editor.formatLine(insertIndex + 1, 1, 'code-block', false);
    editor.setSelection(insertIndex, 0);
}
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
Quill.register(external_document_js_default, true);
const getModules = (uploadToS3)=>({
        toolbar: {
            handlers: {
                undo: undoChange,
                redo: redoChange,
                image: imageHandler(uploadToS3),
                video: videoHandler(uploadToS3),
                document: documentHandler(uploadToS3),
                'code-block-custom': handleInsertCodeBlock
            }
        },
        history: {
            delay: 500,
            maxStack: 100,
            userOnly: true
        }
    });
const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'align',
    'strike',
    "script",
    'blockquote',
    'background',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'document',
    'color',
    'code-block',
    'code-block-custom'
];
const QuillToolbar = ({ onContainerGet })=>{
    const ref = useRef(null);
    useEffect(()=>{
        if (ref.current) onContainerGet(ref.current);
    }, []);
    return /*#__PURE__*/ jsxs("div", {
        ref: ref,
        children: [
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsxs("select", {
                        className: "ql-font",
                        defaultValue: "arial",
                        children: [
                            /*#__PURE__*/ jsx("option", {
                                value: "arial",
                                children: "Arial"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "comic-sans",
                                children: "Comic Sans"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "courier-new",
                                children: "Courier New"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "georgia",
                                children: "Georgia"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "helvetica",
                                children: "Helvetica"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "lucida",
                                children: "Lucida"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsxs("select", {
                        className: "ql-size",
                        defaultValue: "medium",
                        children: [
                            /*#__PURE__*/ jsx("option", {
                                value: "extra-small",
                                children: "Size 1"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "small",
                                children: "Size 2"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "medium",
                                children: "Size 3"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "large",
                                children: "Size 4"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsxs("select", {
                        className: "ql-header",
                        defaultValue: "3",
                        children: [
                            /*#__PURE__*/ jsx("option", {
                                value: "1",
                                children: "Heading"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "2",
                                children: "Subheading"
                            }),
                            /*#__PURE__*/ jsx("option", {
                                value: "3",
                                children: "Normal"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-bold"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-italic"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-underline"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-strike"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-list",
                        value: "ordered"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-list",
                        value: "bullet"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-indent",
                        value: "-1"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-indent",
                        value: "+1"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-script",
                        value: "super"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-script",
                        value: "sub"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-blockquote"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-direction"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("select", {
                        className: "ql-align"
                    }),
                    /*#__PURE__*/ jsx("select", {
                        className: "ql-color"
                    }),
                    /*#__PURE__*/ jsx("select", {
                        className: "ql-background"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-link"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-image"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-video"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-document",
                        children: /*#__PURE__*/ jsx(FileOutlined, {
                            style: {
                                fontSize: '15px'
                            }
                        })
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-formula"
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-code-block-custom",
                        children: /*#__PURE__*/ jsx(CodeOutlined, {
                            style: {
                                fontSize: '15px'
                            }
                        })
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-clean"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("span", {
                className: "ql-formats",
                children: [
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-undo",
                        children: /*#__PURE__*/ jsx(CustomUndo, {})
                    }),
                    /*#__PURE__*/ jsx("button", {
                        className: "ql-redo",
                        children: /*#__PURE__*/ jsx(CustomRedo, {})
                    })
                ]
            })
        ]
    });
};
const EditorToolbar = QuillToolbar;
export { EditorToolbar as default, formats, getModules };
