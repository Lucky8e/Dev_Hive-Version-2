"use client";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { useEffect, useRef, useState } from "react";

type MonacoEditorProps = {
  roomCode: string;
  userId: string;
  userName: string;
  editorRef: React.RefObject<any>;
  language: string;
  activeFile: string;
  isReactMode: boolean;
  onContentChange: (content: string) => void;
  defaultContent: string;
};

const MonacoEditor = ({
  roomCode,
  userId,
  userName,
  editorRef,
  language,
  activeFile,
  isReactMode,
  onContentChange,
  defaultContent
}: MonacoEditorProps) => {
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isProviderReady, setIsProviderReady] = useState(false);
  const seededFiles = useRef<Set<string>>(new Set());

  const defaultContentRef = useRef<string>(defaultContent);
  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  //Cleanup on Unmount
  useEffect(() => {
    return () => {
      docRef.current?.destroy();
      providerRef.current?.destroy();
      bindingRef.current?.destroy();
    };
  }, []);

  //Step-1:- Create doc and provider once on mount
  useEffect(() => {
    const doc = new Y.Doc();
    docRef.current = doc;

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      roomCode,
      doc
    );
    provider.on("status", (event: any) => {
      if (event.status === "connected") {
        setIsProviderReady(true);
      }
    });
    providerRef.current = provider;

    //set user awareness
    const getRandomColor = () => {
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2"
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    const userColor = getRandomColor();

    //set user awareness with user details
    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: userColor,
      colorLight: userColor + "40"
    });

    //Cursor Styles
    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const oldStyle = document.getElementById("yjs-cursor-styles");
      if (oldStyle) oldStyle.remove();

      const style = document.createElement("style");
      style.id = "yjs-cursor-styles";
      let css = "";

      states.forEach((state, clientId) => {
        if (state.user) {
          const { color, colorLight, name } = state.user;
          css += `
          .yRemoteSelectionHead-${clientId} {
              border-left-color: ${color} !important;
              border-top-color: ${color} !important;
            }
            .yRemoteSelectionHead-${clientId}::after {
              content: "${name}" !important;
              background-color: ${color} !important;
            }
            .yRemoteSelection-${clientId} {
              background-color: ${colorLight} !important;
            }`;
        }
      });
      style.innerHTML = css;
      document.head.appendChild(style);
    });
  }, []);

  //Step-2:-Rebind Monaco to correct Y.text when activeFile changes
  useEffect(() => {
    if (!editorRef.current || !docRef.current || !providerRef.current) return;
    if (!isEditorReady || !isProviderReady) return;

    const editor = editorRef.current;
    const doc = docRef.current;
    const provider = providerRef.current;

    //Destroy current binding first
    bindingRef.current?.destroy();

    //Get the Y.Text for this file
    //In nonReact mode always use "monaco" as the key
    const textKey = isReactMode ? activeFile : "monaco";
    const yText = doc.getText(textKey);

    const alreadySeeded = seededFiles.current.has(textKey);
    //seed content of empty on first sync
    if (yText.length === 0 && !alreadySeeded) {
      if (isReactMode && defaultContentRef.current) {
        yText.insert(0, defaultContentRef.current);
        seededFiles.current.add(textKey);
      } else if (!isReactMode) {
        yText.insert(0, "console.log('Hello World')");
        seededFiles.current.add(textKey);
      }
    }
    //create new binding
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    // Listen to Yjs changes and report back to parent
    const observer = () => {
      onContentChange?.(yText.toString());
    };
    yText.observe(observer);

    bindingRef.current = binding;

    return () => {
      yText.unobserve(observer);
    };
  }, [activeFile, isReactMode, isEditorReady, isProviderReady]);

  //Step-3:-Update Monaco language when language prop changes
  useEffect(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    //Detect language from file extension in react mode
    const getLanguage = () => {
      if (!isReactMode) return language;
      if (activeFile.endsWith(".jsx") || activeFile.endsWith(".js"))
        return "javascript";
      if (activeFile.endsWith(".tsx") || activeFile.endsWith(".ts"))
        return "typescript";
      if (activeFile.endsWith(".css")) return "css";
      if (activeFile.endsWith(".html")) return "html";
      return "javascript";
    };
    import("monaco-editor").then((monaco) => {
      monaco.editor.setModelLanguage(model, getLanguage());
    });
  }, [language, activeFile, isReactMode]);

  const handleMount = (editor: any, monaco: any) => {
    // Store editor in ref so useEffect can access it
    if (editorRef) editorRef.current = editor;
    // Note: Yjs setup is in useEffect above, not here
    // handleMount just stores the editor reference
    setIsEditorReady(true);
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 16,
          fontLigatures: true,
          minimap: { enabled: false }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
