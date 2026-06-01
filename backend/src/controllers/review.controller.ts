import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../database/prisma.js";
import { type Request, type Response } from "express";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

//-------------------------------Stream Ai Review-------------------------------//
const streamReview = async (req: Request, res: Response) => {
  const { code, language, snippetId } = req.body;

  if (!code || !language) {
    throw new ApiError(400, "Code and language are required");
  }

  const prompt = `You are an expert ${language} code reviewer. Review the following code and provide:
1. **Overall Assessment** — quality score out of 10 and summary
2. **Bugs & Errors** — any bugs, logical errors or edge cases
3. **Performance** — performance issues and optimizations
4. **Best Practices** — violations of best practices or conventions
5. **Security** — any security vulnerabilities
6. **Suggestions** — concrete improvements with code examples

Be specific, concise and actionable. Format your response in clean markdown.

\`\`\`${language}
${code}
\`\`\``;

  //set SSE headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContentStream(prompt);

    let fullReview = "";

    for await (const chunk of result.stream) {
      const text = chunk.text;
      fullReview += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    //save the fullReview the review db
    if (snippetId) {
      await prisma.review.create({
        data: {
          content: fullReview,
          snippetId
        }
      });
    }
    // Signal stream end
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Gemini error:", error);
    res.write(`data: ${JSON.stringify({ error: "Review failed" })}\n\n`);
    res.end();
  }
};

//-------------------------------Get snippet reviews-------------------------------//
const getSnippetReviews = async (req: Request, res: Response) => {
  const { snippetId } = req.params;

  if (!snippetId || Array.isArray(snippetId)) {
    throw new ApiError(400, "SnippetId is not found or its not required ");
  }

  const reviews = await prisma.review.findMany({
    where: { snippetId },
    orderBy: { createdAt: "desc" }
  });

  res
    .status(200)
    .json(new ApiResponse(200, { reviews }, "Reviews fetched successfully"));
};

export { getSnippetReviews, streamReview };
