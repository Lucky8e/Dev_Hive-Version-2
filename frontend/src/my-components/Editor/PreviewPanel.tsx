"use client";
import { useEffect, useRef } from "react";

type PreviewPanelProps = {
  files: Record<string, string>;
};

const PreviewPanel = ({ files }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const appCode = (files["src/App.jsx"] ?? "")
      .replace("export default function", "function")
      .replace("export default", "");
    const cssCode = files["src/styles.css"] ?? "";

    console.log("App code:", appCode); // ← add this
    console.log("CSS code:", cssCode); // ← add this

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>${cssCode}</style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    ${appCode}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
    console.log("Generated HTML:", html); // ← add this

    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  }, [files]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts"
      title="React Preview"
    />
  );
};
export default PreviewPanel;
// ```

// ---

// ## How it works
// ```
// files["src/App.jsx"] → injected as JSX into iframe
// files["src/styles.css"] → injected as <style> tag
// Babel standalone → compiles JSX in the browser
// React UMD → runs the compiled code
// iframe srcdoc → renders the result
