/* const Language_Map: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "*" },
  typescript: { language: "typescript", version: "*" },
  html: { language: "html", version: "*" },
  css: { language: "css", version: "*" },
  java: { language: "java", version: "*" }
};

export const runCode = async (
  code: string,
  language: string
): Promise<{
  output: string;
  error: string | null;
}> => {
  try {
    const lang = Language_Map[language];
    if (!lang) {
      return {
        output: "",
        error: `${language} is not supported yet please wait`
      };
    }
    const response = await fetch("https://api.piston.rs/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang.language,
        version: lang.version,
        files: [{ content: code }]
      })
    });
    if (!response.ok) {
      return {
        output: "",
        error: `Piston error: ${response.status}`
      };
    }
    const data = await response.json();
    const stdout = data.run?.stdout ?? "";
    const stderr = data.run?.stderr ?? "";
    return {
      output: stdout || "",
      error: stderr || ""
    };
  } catch (error: any) {
    return {
      output: "",
      error: `Failed to execute the code: ${error}`
    };
  }
};
 */

export const runCode = async (
  code: string,
  language: string
): Promise<{ output: string; error: string | null }> => {
  try {
    console.log(language, code);
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language })
    });

    const data = await response.json();
    return {
      output: data.output ?? "",
      error: data.error ?? null
    };
  } catch (error: any) {
    return {
      output: "",
      error: `Failed to execute: ${error.message}`
    };
  }
};
