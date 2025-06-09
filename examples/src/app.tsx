import { useState } from 'react'
import { Editor, Render } from 'react-richeditor'

function App() {
  const [content, setContent] = useState(undefined as string | undefined)

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <Editor
      value={content}
      onChange={setContent}
      uploadFile={async (file) => {
        return {
          url: URL.createObjectURL(file),
          cdnUrl: URL.createObjectURL(file),
        }
      }}
    />
    <Render value={content ?? ''} />
  </div>
}

export default App
