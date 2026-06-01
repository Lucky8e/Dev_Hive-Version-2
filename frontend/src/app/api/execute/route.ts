import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> =
  {
    javascript: { language: "nodejs", versionIndex: "4" },
    typescript: { language: "typescript", versionIndex: "0" },
    python: { language: "python3", versionIndex: "4" },
    java: { language: "java", versionIndex: "4" },
    cpp: { language: "cpp17", versionIndex: "0" },
    c: { language: "c", versionIndex: "5" },
    rust: { language: "rust", versionIndex: "0" },
    go: { language: "go", versionIndex: "4" },
    php: { language: "php", versionIndex: "4" },
    ruby: { language: "ruby", versionIndex: "4" }
  };

export async function POST(req: NextRequest) {
  const { code, language } = await req.json();

  console.log("🔥 API hit — language:", language);

  const lang = LANGUAGE_MAP[language];
  console.log("🔥 Mapped lang:", lang);

  if (!lang) {
    return NextResponse.json(
      { error: `Language ${language} not supported yet` },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: lang.language,
        versionIndex: lang.versionIndex
      })
    });
    console.log("🔥 Glot status:", response.status);
    const data = await response.json();
    console.log("🔥 Glot data:", data);

    return NextResponse.json({
      output: data.output ?? "",
      error: data.error || data.error || null
    });
  } catch (error: any) {
    console.log("🔥 Error:", error.message);
    return NextResponse.json(
      { error: `Execution failed: ${error.message}` },
      { status: 500 }
    );
  }
}
