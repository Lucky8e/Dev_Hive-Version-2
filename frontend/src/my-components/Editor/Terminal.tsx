import { SquareTerminal } from "lucide-react";
import { Terminal as XTerm } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";

interface TerminalProps {
  output: string;
  error: string | null;
  isRunning: boolean;
}
const Terminal = ({ output, error, isRunning }: TerminalProps) => {
  const terminalDivRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddOnRef = useRef<FitAddon | null>(null);
  //Create the terminal
  useEffect(() => {
    const xTerm = new XTerm({
      theme: {
        background: "#020617",
        foreground: "#d1d5db",
        cursor: "#7c3aed"
      },
      fontFamily: "Jetbrains Mono, monospace",
      fontSize: 13,
      cursorBlink: false,
      disableStdin: true,
      scrollback: 1000,
      convertEol: true,
      scrollOnUserInput: false
    });
    //Create and load the fitAddOn
    const fitAddon = new FitAddon();
    xTerm.loadAddon(fitAddon);
    //Attach to the Dom
    if (terminalDivRef.current) {
      xTerm.open(terminalDivRef.current);
      fitAddon.fit();
      /* Welcome message */
      xTerm.writeln('\x1b[38;5;240mClick "Run Code" to see output here\x1b[0m');
    }
    //Store xterm adn fitAddon ref
    xtermRef.current = xTerm;
    fitAddOnRef.current = fitAddon;

    //Cleanup the mount
    return () => {
      xTerm.dispose();
    };
  }, []);

  //Handle the resize
  useEffect(() => {
    if (!terminalDivRef.current) return;

    const observer = new ResizeObserver(() => {
      fitAddOnRef.current?.fit();
    });

    observer.observe(terminalDivRef.current);

    return () => observer.disconnect();
  }, []);
  //Write output when it changes
  useEffect(() => {
    if (!xtermRef.current) return;
    const xterm = xtermRef.current;
    xterm.clear();
    if (isRunning) {
      xterm.writeln(`\x1b[33m⟳ Running...\x1b[0m`);
    }
    if (error) {
      xterm.writeln(`\x1b[31m✖ ${error}\x1b[0m`);
    }
    if (output) {
      xterm.writeln(`\x1b[32m▶ ${output}\x1b[0m`);
    }
  }, [output, error, isRunning]);
  return (
    <div className="h-full w-full flex flex-col">
      {/*------------------Header---------------*/}
      <div className="flex items-center justify-between p-2 border-b-2 border-slate-800">
        <div className="flex items-center gap-2">
          <SquareTerminal className="w-4 h-4 text-green-500" />
          <h3 className="text-green-500 font-semibold">Output</h3>
        </div>
        {isRunning && (
          <span className="text-yellow-400 text-xs animate-pulse">
            Running...
          </span>
        )}
      </div>
      {/*------------------Output---------------*/}
      <div ref={terminalDivRef} className="flex-1  overflow-hidden min-h-0" />
    </div>
  );
};
export default Terminal;
