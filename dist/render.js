import { jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import external_quill_default from "quill";
import "quill/dist/quill.snow.css";
import "./render.css";
const Render = ({ value })=>{
    const containerRef = useRef(null);
    useEffect(()=>{
        const container = containerRef.current;
        if (!container) return;
        const quill = new external_quill_default(container, {
            theme: 'snow',
            readOnly: true,
            modules: {
                toolbar: false
            }
        });
        try {
            const content = JSON.parse(value);
            quill.setContents(content);
        } catch  {
            const editor = container.querySelector('.ql-editor');
            if (editor) editor.innerHTML = value;
        }
        return ()=>{
            const editor = container.querySelector('.ql-editor');
            if (editor) editor.innerHTML = '';
        };
    }, [
        value
    ]);
    return /*#__PURE__*/ jsx("div", {
        ref: containerRef,
        className: "richeditor-render"
    });
};
const render = Render;
export { render as default };
