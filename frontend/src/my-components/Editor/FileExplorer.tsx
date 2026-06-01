import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, File, FileCode, FolderOpen, Plus, X } from "lucide-react";
import { useState } from "react";

interface FileExplorerProps {
  files: Record<string, string>;
  activeFile: string;
  onFileClick: (file: string) => void;
  onNewFile: (name: string) => void;
}

const getFileColor = (fileName: string): string => {
  if (fileName.endsWith(".jsx") || fileName.endsWith(".tsx")) {
    return "text-blue-400";
  }
  if (fileName.endsWith(".js") || fileName.endsWith(".ts")) {
    return "text-yellow-400";
  }
  if (fileName.endsWith(".css")) {
    return "text-pink-400";
  }
  return "text=gray-400";
};

const FileExplorer = ({
  files,
  activeFile,
  onFileClick,
  onNewFile
}: FileExplorerProps) => {
  const [isCreating, setIsCreating] = useState<Boolean>(false);
  const [newFileName, setNewFileName] = useState<string>("");
  //Group files by folders
  const folders: Record<string, string[]> = {};
  Object.keys(files).forEach((filePath) => {
    const parts = filePath.split("/");
    const folder = parts.length > 1 ? parts[0] : "root";
    if (!folders[folder]) folders[folder] = [];
    folders[folder].push(filePath);
  });
  //Create new File
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) return;
    const fullPath = newFileName.startsWith("src/")
      ? newFileName
      : `src/${newFileName}`;
    onNewFile(fullPath);
    setNewFileName("");
    setIsCreating(false);
  };
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Headers */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <File className="w-3 h-3" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            File Explore
          </span>
        </div>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {Object.entries(folders).map(([folder, filePaths]) => (
          <div key={folder}>
            {/* Folder Row */}
            <div className="flex items-center gap-1 px-3 py-1">
              <FolderOpen />
              <span className="text-xs font-semibold text-muted-foreground">
                {folder}
              </span>
            </div>
            {/* Files inside the folder */}
            {filePaths.map((file) => {
              const filename = file.split("/").pop() ?? file;
              const isActive = file === activeFile;
              return (
                <div
                  key={file}
                  onClick={() => onFileClick(file)}
                  className={`flex items-center gap-2 px-6 py-1 cursor-pointer text-xs 
                    ${
                      isActive
                        ? "bg-primary/20 text-foreground border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                    `}
                >
                  <FileCode className={`w-3 h-3 ${getFileColor(file)}`} />
                  <span>{filename}</span>
                </div>
              );
            })}
          </div>
        ))}
        {/* New File Input */}
        {isCreating && (
          <div className="px-3 py-2 flex items-center gap-1">
            <Input
              autoFocus
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
              }}
              placeholder=".src/newFile.jsx"
              className="h-6 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNewFile();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFileName("");
                }
              }}
            />
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={handleCreateNewFile}
              className="h-6 w-6 text-green-500"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={() => {
                setIsCreating(false);
                setNewFileName("");
              }}
              className="h-6 w-6 text-red-500"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default FileExplorer;
