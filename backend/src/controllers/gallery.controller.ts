import { prisma } from "../database/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//-------------------------------Get public gallery-------------------------------//
const getGallery = asyncHandler(async (req, res) => {
  const { cursor, limit = "10", language, sort = "recent" } = req.query;

  const snippets = await prisma.snippet.findMany({
    where: {
      isPublic: true,
      ...(language && { language: language as string })
    },
    take: parseInt(limit as string) + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor as string }
    }),
    orderBy:
      sort === "popular"
        ? { likes: { _count: "desc" } }
        : { createdAt: "desc" },

    include: {
      user: {
        select: {
          username: true,
          email: true,
          avatarUrl: true
        }
      },
      _count: {
        select: { likes: true }
      }
    }
  });
  const hasNextPage = snippets.length > parseInt(limit as string);
  if (hasNextPage) {
    snippets.pop();
  }
  const nextCursor = hasNextPage ? snippets[snippets.length - 1]?.id : null;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { snippets, hasNextPage, nextCursor },
        "Gallery fetched successfully"
      )
    );
});

//-------------------------------Search snippets-------------------------------//
const searchSnippets = asyncHandler(async (req, res) => {
  const { q, language, cursor, limit = "10" } = req.query;
  if (!q) {
    throw new ApiError(400, "Query is required");
  }

  const snippets = await prisma.snippet.findMany({
    where: {
      isPublic: true,
      ...(language && { language: language as string }),
      OR: [
        { title: { contains: q as string, mode: "insensitive" } },
        { title: { contains: q as string, mode: "insensitive" } }
      ]
    },
    take: parseInt(limit as string),
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor as string }
    }),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          username: true,
          id: true,
          avatarUrl: true
        }
      },
      _count: {
        select: { likes: true }
      }
    }
  });

  const hasNextPage = snippets.length > parseInt(limit as string);
  if (hasNextPage) snippets.pop();

  const nextCursor = hasNextPage ? snippets[snippets.length - 1]?.id : null;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { snippets, nextCursor, hasNextPage },
        "Search results fetched successfully"
      )
    );
});

//-------------------------------Get trending snippets-------------------------------//
const trendingSnippets = asyncHandler(async (req, res) => {
  const snippets = await prisma.snippet.findMany({
    where: {
      isPublic: true
    },
    orderBy: { likes: { _count: "desc" } },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      },
      _count: {
        select: { likes: true }
      }
    }
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { snippets },
        "Trending snippets fetched successfully"
      )
    );
});

export { getGallery, searchSnippets, trendingSnippets };
