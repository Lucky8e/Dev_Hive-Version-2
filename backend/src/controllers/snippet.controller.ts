import { nanoid } from "nanoid";
import { prisma } from "../database/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//------------------------------------Create code snippet------------------------------------//
const createSnippet = asyncHandler(async (req, res) => {
  const { title, code, language, isPublic } = req.body;

  if (!title || !code || !language) {
    throw new ApiError(400, "Title code and language is required");
  }

  const snippet = await prisma.snippet.create({
    data: {
      title: title,
      code,
      language,
      isPublic: isPublic ?? false,
      userId: req.user!.id,
      shortCode: nanoid(8)
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  });
  return res
    .status(201)
    .json(new ApiResponse(201, snippet, "Snippet created successfully"));
});

//------------------------------------Get code snippets------------------------------------//
const getMyCodeSnippets = asyncHandler(async (req, res) => {
  const { cursor, limit = "10" } = req.query;

  const snippets = await prisma.snippet.findMany({
    where: { userId: req.user!.id },
    take: parseInt(limit as string) + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor as string }
    }),
    orderBy: { createdAt: "desc" },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    }
  });

  const hasNextPage = snippets.length > parseInt(limit as string);
  if (hasNextPage) {
    snippets.pop();
  }
  const nextCursor = hasNextPage ? snippets[snippets.length - 1]?.id : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        snippets,
        hasNextPage,
        nextCursor
      },
      "Snippets has been fetched successfully"
    )
  );
});

//------------------------------------Get single code snippet by shortcode------------------------------------//
const getCodeSnippetsByShortcode = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  if (!shortCode || Array.isArray(shortCode)) {
    throw new ApiError(400, "Invalid shortcode");
  }
  const snippet = await prisma.snippet.findUnique({
    where: { shortCode },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    }
  });
  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }
  if (!snippet.isPublic && snippet.userId !== req.user?.id) {
    throw new ApiError(403, "You don't have the access to this snippet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { snippet }, "Snippet fetched successfully"));
});

//------------------------------------Update code snippet ------------------------------------//
const updateSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new ApiError(401, "Id is required ");
  }
  const { title, code, language, isPublic } = req.body;

  if (!title || !code || !language) {
    throw new ApiError(400, "Title, code, language is required");
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id: id }
  });
  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  if (snippet.userId !== req.user?.id) {
    throw new ApiError(
      403,
      "You don't have access to make changes to the snippet"
    );
  }

  const updatedSnippet = await prisma.snippet.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(code && { code }),
      ...(language && { language }),
      ...(isPublic !== undefined && { isPublic })
    }
  });
  if (!updatedSnippet) {
    throw new ApiError(
      401,

      "There was a problem updating the snippet.Try again!!!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedSnippet }, "Snippet successfully updated")
    );
});

//------------------------------------Delete snippet------------------------------------//
const deleteSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new ApiError(401, "Id is required ");
  }
  const snippetToDelete = await prisma.snippet.findUnique({
    where: { id }
  });

  if (!snippetToDelete || snippetToDelete?.userId !== req.user?.id) {
    throw new ApiError(403, "You don't have permission to delete snippet");
  }

  const deletedSnippet = await prisma.snippet.delete({
    where: { id }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedSnippet }, "Snippet deleted successfully")
    );
});

//------------------------------------Fork the snippet------------------------------------//
const forkSnippet = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  if (!shortCode || Array.isArray(shortCode)) {
    throw new ApiError(401, "Shortcode not found is or undefined");
  }

  const originalSnippet = await prisma.snippet.findUnique({
    where: { shortCode }
  });

  if (!originalSnippet || !originalSnippet.isPublic) {
    throw new ApiError(404, "Snippet not found or is not public");
  }

  const forkedSnippet = await prisma.snippet.create({
    data: {
      title: `${originalSnippet.title}(forked)`,
      code: originalSnippet.code,
      language: originalSnippet.language,
      isPublic: false,
      shortCode: nanoid(8),
      forkedFrom: originalSnippet.id,
      userId: req.user!.id
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { forkedSnippet }, "Snippet forked successfully")
    );
});

//------------------------------------Toggle the like------------------------------------//
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new ApiError(404, "Id not found or is undefined");
  }

  const snippet = await prisma.snippet.findUnique({ where: { id } });

  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_snippetId: {
        userId: req.user!.id,
        snippetId: id
      }
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_snippetId: {
          userId: req.user!.id,
          snippetId: id
        }
      }
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Snippet unLiked"));
  }

  await prisma.like.create({
    data: {
      userId: req.user!.id,
      snippetId: id
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Snippet liked"));
});

export {
  createSnippet,
  getMyCodeSnippets,
  getCodeSnippetsByShortcode,
  updateSnippet,
  deleteSnippet,
  forkSnippet,
  toggleLike
};
