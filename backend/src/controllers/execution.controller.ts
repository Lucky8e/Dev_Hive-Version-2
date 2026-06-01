import spawn from "cross-spawn";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { randomUUID } from "crypto";
import { prisma } from "../database/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { exitCode, stderr, stdout } from "process";

const TEMP_DIR = join(process.cwd(), "tmp");
const TIMEOUT_MS = 10000;
const MAX_OUTPUT_SIZE = 10 * 1024;

//lets make sure temp_dir exist
const ensureTempDir = async () => {
  try {
    await mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  executionTime: number;
};

const executeCode = (
  command: string,
  args: string[],
  timeout: number
): Promise<ExecutionResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const child = spawn(command, args, {
      timeout,
      env: {
        PATH: process.env.Path
      }
    });

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      if (stderr.length < MAX_OUTPUT_SIZE) {
        stderr += data.toString();
      }
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeout);

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode,
        timedOut,
        executionTime: Date.now() - startTime
      });
    });
  });
};

const isSupportedLanguage = (language: string): boolean => {
  const supported = ["javascript", "typescript", "python", "java", "cpp"];
  return supported.includes(language);
};

const getExecutionConfig = (
  language: string,
  filePath: string
): { command: string; args: string[] } | null => {
  const configs: Record<string, { command: string; args: string[] }> = {
    javascript: { command: "node", args: [filePath] },
    typescript: { command: "npx", args: ["ts-node", "--esm", filePath] },
    python: { command: "python", args: [filePath] },
    java: { command: "java", args: [filePath] },
    cpp: {
      command: "g++",
      args: [filePath, "-o", filePath + ".out", "&&", filePath + ".out"]
    }
  };
  return configs[language] || null;
};

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp"
  };
  return extensions[language] || "txt";
};

//-------------------------------Execute code controller-------------------------------//
const runCode = asyncHandler(async (req, res) => {
  const { language, code } = req.body;
  if (!language || !code) {
    throw new ApiError(400, "Code and language are required");
  }

  const isSupported = isSupportedLanguage(language);
  if (!isSupported) {
    throw new ApiError(400, "Language is not supported yet.");
  }
  await ensureTempDir();

  const fileId = randomUUID();
  const filename = `${fileId}.${getFileExtension(language)}`;
  const filePath = join(TEMP_DIR, filename);

  try {
    //now we wanna write file to  the temp file we created
    writeFile(filePath, code, "utf-8");

    const executionConfig = getExecutionConfig(language, filePath);
    if (!executionConfig) {
      throw new ApiError(400, "The language is not supported yet.");
    }
    const results = await executeCode(
      executionConfig.command,
      executionConfig.args,
      TIMEOUT_MS
    );

    if (req.body.snippetId) {
      await prisma.snippet.update({
        where: { id: req.body.snippetId },
        data: { updatedAt: new Date() }
      });
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stdout: results.stdout,
          stderr: results.stderr,
          exitCode: results.exitCode,
          timedOut: results.timedOut,
          executionTime: results.executionTime,
          language
        },
        results.timedOut ? "Execution timed out" : "Execution successful"
      )
    );
  } finally {
    // always clean up temp file
    await unlink(filePath).catch(() => {});
  }
});

export { runCode };
