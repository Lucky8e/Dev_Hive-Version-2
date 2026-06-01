import { motion } from "framer-motion";
import { Terminal, Copy, CheckCircle2 } from "lucide-react";

const CodeEditorMockup = () => {
  const codeSnippet = `import { YjsProvider } from '@devhive/yjs';
import { Terminal } from '@devhive/xterm';

export function CollaborativeSpace() {
  return (
    <YjsProvider room="demo-room-123">
      <div className="workspace-grid">
        <Editor language="typescript" />
        <Terminal 
          theme="aura-dark"
          onData={handleTermData} 
        />
        <SandpackPreview 
          template="react-ts" 
        />
      </div>
    </YjsProvider>
  );
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="relative w-full max-w-2xl mx-auto z-10"
    >
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-[80px]" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-[80px]" />

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs text-muted-foreground">
            <Terminal className="w-3 h-3" />
            <span>workspace.tsx</span>
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {/* Editor Body */}
        <div className="p-6 overflow-x-auto text-sm sm:text-base">
          <pre className="font-mono text-gray-300">
            <code>
              <span className="text-purple-400">import</span> {"{ "}
              <span className="text-blue-300">YjsProvider</span>
              {" }"} <span className="text-purple-400">from</span>{" "}
              <span className="text-green-300">'@devhive/yjs'</span>;
              <br />
              <span className="text-purple-400">import</span> {"{ "}
              <span className="text-blue-300">Terminal</span>
              {" }"} <span className="text-purple-400">from</span>{" "}
              <span className="text-green-300">'@devhive/xterm'</span>;
              <br />
              <br />
              <span className="text-purple-400">export function</span>{" "}
              <span className="text-blue-300">CollaborativeSpace</span>() {"{"}
              <br />
              {"  "}
              <span className="text-purple-400">return</span> (
              <br />
              {"    "}&lt;<span className="text-blue-400">YjsProvider</span>{" "}
              <span className="text-yellow-200">room</span>=
              <span className="text-green-300">"demo-room-123"</span>&gt;
              <br />
              {"      "}&lt;<span className="text-blue-400">div</span>{" "}
              <span className="text-yellow-200">className</span>=
              <span className="text-green-300">"workspace-grid"</span>&gt;
              <br />
              {"        "}&lt;<span className="text-blue-400">Editor</span>{" "}
              <span className="text-yellow-200">language</span>=
              <span className="text-green-300">"typescript"</span> /&gt;
              <br />
              {"        "}&lt;<span className="text-blue-400">Terminal</span>
              <br />
              {"          "}
              <span className="text-yellow-200">theme</span>=
              <span className="text-green-300">"aura-dark"</span>
              <br />
              {"          "}
              <span className="text-yellow-200">onData</span>={"{"}
              <span className="text-blue-300">handleTermData</span>
              {"}"}
              <br />
              {"        "}/&gt;
              <br />
              {"        "}&lt;
              <span className="text-blue-400">SandpackPreview</span>
              <br />
              {"          "}
              <span className="text-yellow-200">template</span>=
              <span className="text-green-300">"react-ts"</span>
              <br />
              {"        "}/&gt;
              <br />
              {"      "}&lt;/<span className="text-blue-400">div</span>&gt;
              <br />
              {"    "}&lt;/<span className="text-blue-400">YjsProvider</span>
              &gt;
              <br />
              {"  "});
              <br />
              {"}"}
            </code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
};
export default CodeEditorMockup;
