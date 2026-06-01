"use client";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@/my-components/Editor/monacoEditor"),
  { ssr: false }
);
import NavBar from "@/my-components/Editor/NavBar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import Terminal from "@/my-components/Editor/Terminal";
import { runCode } from "@/lib/codeRunner";
import ActiveUsers from "@/my-components/Editor/ActiveUsers";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import ChatComponent from "@/my-components/Editor/ChatComponent";
import { Button } from "@/components/ui/button";
import { Copy, Folder, LogOut, ScanEye, SquareTerminal } from "lucide-react";
import { toast } from "sonner";
import { Separator as ShadSeparator } from "@/components/ui/separator";
import { markUsersInactive } from "@/lib/userPresenceService";
import FileExplorer from "@/my-components/Editor/FileExplorer";
const PreviewPanel = dynamic(
  () => import("@/my-components/Editor/PreviewPanel"),
  { ssr: false }
);

// ─── Preset file contents ───────────────────────────────────────────────────
const INITIAL_FILES: Record<string, string> = {
  "src/App.jsx": `export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Hello from DevHive! 🐝</h1>
      <p>Start editing to see live preview</p>
    </div>
  )
}`,
  "src/index.jsx": `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)`,
  "src/styles.css": `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  background: #f9f9f9;
}`
};

export default function WorkspaceIdPage() {
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [language, setLanguage] = useState("javascript");

  //sandPack setup
  const [centreTab, setCenterTab] = useState<"project" | "editor" | "preview">(
    "editor"
  );
  const [activeFile, setActiveFile] = useState("");
  const [openTabs, setOpenTabs] = useState<string[]>(["src/App.jsx"]);
  // liveFiles — updates as users type, fed to Sandpack and FileExplorer
  // starts with same content as INITIAL_FILES
  const [liveFiles, setLiveFiles] =
    useState<Record<string, string>>(INITIAL_FILES);
  //---------------Handle the open file----------------//
  const handleFileClick = (filePath: string) => {
    setActiveFile(filePath);
    if (!openTabs.includes(filePath)) {
      setOpenTabs((prev) => [...prev, filePath]);
    }
    setCenterTab("editor");
  };
  //---------------Handle the close file----------------//
  const handleClose = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((t) => t !== filePath);
    setOpenTabs(newTabs);

    // If closing active tab switch to previous one
    if (activeFile === filePath) {
      setActiveFile(newTabs[newTabs.length - 1] ?? "src/App.jsx");
    }
  };
  //---------------Handle the new file creating----------------//

  const handleNewFile = (filepath: string) => {
    // Don't create if already exists
    if (liveFiles[filepath]) return;

    setLiveFiles((prev) => ({
      ...prev,
      [filepath]: "" // empty file
    }));
    // Auto open the new file
    handleFileClick(filepath);
  };

  useEffect(() => {
    if (language !== "react") {
      setCenterTab("editor");
    }
  }, [language]);

  //---------------Handle the content change----------------//
  const handleContentChange = useCallback(
    (content: string) => {
      setLiveFiles((prev) => ({
        ...prev,
        [activeFile]: content
      }));
    },
    [activeFile]
  );
  const router = useRouter();

  const editorRef = useRef<any>(null);
  const params = useParams();

  const roomCode = params.workspaceId?.toString();
  const userName = Cookies.get("userName");
  const userId = Cookies.get("userId");

  useEffect(() => {
    const id = Cookies.get("roomId") || null;
    setRoomId(id);
  }, []);

  //---------------Handle the code running----------------//

  const handleOnRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError(null);

    const currentCode = editorRef.current?.getValue() ?? "";
    const result = await runCode(currentCode, language); // ← reads from Monaco directly

    setOutput(result.output);
    setError(result.error);
    setIsRunning(false);
  };
  //---------------Handle the Leaving Room----------------//
  const handleLeaveRoom = async () => {
    if (userId && roomId) {
      await markUsersInactive(userId, roomId);
    }
    //Clear the cookies
    Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("roomCode");
    Cookies.remove("roomId");

    router.push("/join-room");
  };
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="h-16">
        {userId && userName && (
          <NavBar
            onRun={handleOnRun}
            isRunning={isRunning}
            userId={userId}
            userName={userName}
            language={language}
            setLanguage={setLanguage}
          />
        )}
        {/* --------------------Below Navbar content-----------------*/}
      </div>
      <div className="flex-1 min-h-0 flex">
        {/*------------------- Room Participants Section -------------------------*/}
        <div className="w-65 flex flex-col bg-black">
          <div className="flex-1">
            {roomId && userId && (
              <ActiveUsers roomId={roomId} userId={userId} />
            )}
          </div>
          <div className="p-3 border-t border-primary bg-background">
            <p className="text-lg font-bold text-muted-foreground">Room Code</p>
            <div className="flex items-center justify-between border border-slate-700 p-2 rounded-lg mt-1">
              <p className="text-sm font-semibold font-mono">{roomCode}</p>
              <Button
                size={"icon"}
                className="border-2 border-green-700 bg-green-600/30 
                hover:bg-green-300 text-emerald-600 
                transition-colors duration-300"
                onClick={() => {
                  navigator.clipboard.writeText(roomCode ?? "");
                  toast.success("Room Code Copied");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <ShadSeparator className="mt-2 mb-2" />
            <Button
              className="bg-red-500/15 w-full text-red-600
             hover:bg-red-300 border-2 border-red-700
              h-12 font-bold transition-colors duration-300"
              onClick={handleLeaveRoom}
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
              Leave Room
            </Button>
          </div>
        </div>
        {/*------------------ Editor and Terminal Section  ------------------------*/}

        <div className="flex flex-col flex-1 min-h-0 border-r border-l-2 border-slate-700 ">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-slate-700 bg-background shrink-0">
            {language === "react" && (
              <button
                onClick={() => setCenterTab("project")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-r border-slate-700 transition-colors
                  ${
                    centreTab === "project"
                      ? "bg-primary/20 text-primary border-b-2 border-b-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                  `}
              >
                <Folder />
                <span>Files</span>
              </button>
            )}
            {/* Editor tab-it will be always visible */}
            <button
              onClick={() => setCenterTab("editor")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-r border-slate-700 transition-colors
                  ${
                    centreTab === "editor"
                      ? "bg-primary/20 text-primary border-b-2 border-b-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                  `}
            >
              <span>
                <SquareTerminal />
              </span>
              <span>Editor</span>
            </button>
            {/* Preview Tab only in react mode */}
            {language === "react" && (
              <button
                onClick={() => setCenterTab("preview")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-r border-slate-700 transition-colors
                  ${
                    centreTab === "preview"
                      ? "bg-primary/20 text-primary border-b-2 border-b-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                  `}
              >
                <span>
                  <ScanEye />
                </span>
                <span>Preview</span>
              </button>
            )}
            {/*when a file is opened, Open File Tab- only in editor tab */}
            {centreTab === "editor" && language === "react" && (
              <div className="flex items-center overflow-x-auto">
                {openTabs.map((filepath) => {
                  const fileName = filepath.split("/").pop() ?? filepath;
                  const isActive = filepath === activeFile;
                  return (
                    <div
                      key={filepath}
                      onClick={() => setActiveFile(filepath)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-r border-slate-700 shrink-0 transition-colors
                      ${
                        isActive
                          ? "bg-accent text-foreground border-b-2 border-b-primary"
                          : "text-foreground hover:text-foreground hover:bg-accent"
                      }
                        `}
                    >
                      <span>{fileName}</span>
                      <button onClick={(e) => handleClose(filepath, e)}>
                        x
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Panel Content */}
          <Group orientation={"vertical"} className="h-full flex-1 min-h-0">
            <Panel defaultSize={"70%"} minSize={"200px"}>
              {/* Files Tab */}
              <div
                className={centreTab === "project" ? "h-full w-full" : "hidden"}
              >
                <FileExplorer
                  files={liveFiles}
                  activeFile={activeFile}
                  onFileClick={handleFileClick}
                  onNewFile={handleNewFile}
                />
              </div>
              <div
                className={centreTab === "editor" ? "h-full w-full" : "hidden"}
              >
                {roomCode && userId && userName && (
                  <MonacoEditor
                    roomCode={roomCode}
                    userId={userId}
                    userName={userName}
                    editorRef={editorRef}
                    language={language}
                    activeFile={activeFile}
                    isReactMode={language === "react"}
                    onContentChange={handleContentChange}
                    defaultContent={
                      language === "react"
                        ? (INITIAL_FILES[activeFile] ?? "")
                        : ""
                    }
                  />
                )}
              </div>
              {/* Preview Tab — placeholder for  */}
              <div
                className={centreTab === "preview" ? "h-full w-full" : "hidden"}
              >
                <PreviewPanel files={liveFiles} />
              </div>
            </Panel>
            <Separator />
            <Panel defaultSize={"30%"} minSize={"100px"}>
              <Terminal output={output} error={error} isRunning={isRunning} />
            </Panel>
          </Group>
        </div>

        {/*-------------------- Chat Section------------------- */}
        <div className="w-100">
          {roomId && userId && userName && (
            <ChatComponent
              roomId={roomId}
              userId={userId}
              userName={userName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
