import { jsx, jsxs } from "react/jsx-runtime";
import external_react_default, { useEffect, useRef } from "react";
import external_react_quill_default from "react-quill";
import external_EditorToolbar_js_default, { formats, getModules } from "./EditorToolbar.js";
import "react-quill/dist/quill.snow.css";
import "./styles.css";
const Editor = ({ value, onChange, uploadFile })=>{
    const quillRef = useRef(null);
    const [state, setState] = external_react_default.useState({
        value: value ?? '',
        toolbar: void 0
    });
    const modulesRef = useRef(getModules(uploadFile));
    const handleChange = (newValue)=>{
        setState((prev)=>({
                ...prev,
                value: newValue
            }));
        onChange?.(newValue);
    };
    useEffect(()=>{
        setState((prev)=>({
                ...prev,
                value
            }));
    }, [
        value
    ]);
    useEffect(()=>{
        const adjustTooltipPosition = ()=>{
            const tooltip = document.querySelector('.ql-tooltip');
            if (tooltip) {
                const left = parseFloat(tooltip.style.left) || 0;
                console.log(left);
                if (left < 0) tooltip.style.left = '10px';
            }
        };
        const observer = new MutationObserver(adjustTooltipPosition);
        const editorContainer = document.querySelector('.ql-container');
        if (editorContainer) observer.observe(editorContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
        return ()=>{
            observer.disconnect();
        };
    }, [
        quillRef.current
    ]);
    return /*#__PURE__*/ jsxs("div", {
        className: "text-editor",
        style: {
            backgroundColor: '#fff',
            height: '100%'
        },
        children: [
            /*#__PURE__*/ jsx("style", {
                children: `
        .ql-snow {
          border: none !important;
        }
        
        .text-editor {
          border: 1px solid #ccc;
        }

        .ql-toolbar {
          border-bottom: 1px solid #ccc !important;
        }
      `
            }),
            /*#__PURE__*/ jsx(external_EditorToolbar_js_default, {
                onContainerGet: (v)=>{
                    setState((prev)=>({
                            ...prev,
                            toolbar: v
                        }));
                }
            }),
            state.toolbar && /*#__PURE__*/ jsx(external_react_quill_default, {
                ref: quillRef,
                style: {
                    overflowY: 'hidden',
                    minHeight: 600,
                    backgroundColor: '#fff',
                    paddingLeft: 10,
                    paddingRight: 10
                },
                theme: "snow",
                value: state.value,
                onChange: handleChange,
                placeholder: "",
                modules: {
                    ...modulesRef.current,
                    toolbar: {
                        ...modulesRef.current.toolbar,
                        container: state.toolbar
                    }
                },
                formats: formats
            })
        ]
    });
};
const src_Editor = Editor;
export { src_Editor as default };
