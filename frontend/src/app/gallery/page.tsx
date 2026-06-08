"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/apiClient";
import { Clock, Eye, GitFork, Heart, Search, TrendingUp } from "lucide-react";
import { Black_Ops_One } from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: ["400"] });

type Snippet = {
  id: string;
  title: string;
  code: string;
  language: string;
  shortCode: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
  };
};

const GalleryPage = () => {
  const [snippet, setSnippet] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [language, setLanguage] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  const router = useRouter();

  const roomCode = Cookies.get("roomCode");

  /* ------------------------------------Fetch snippet function------------------------------------*/
  const fetchSnippets = async (reset = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (language) params.set("language", language);
      if (!reset && nextCursor) params.set("cursor", nextCursor);

      const { data } = await apiClient.get(`/gallery?${params.toString()}`);
      const newSnippets = data.data.snippets;
      setSnippet(reset ? newSnippets : (prev) => [...prev, ...newSnippets]);
      setNextCursor(data.data.nextCursor);
      setHasNextPage(data.data.hasNextPage);
    } catch (error) {
      toast.error("Failed to fetch the snippets");
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------Search snippet function------------------------------------*/
  const searchSnippet = async () => {
    if (!search) {
      fetchSnippets(true);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await apiClient.get(
        `/gallery/search?q=${search}&language=${language}`
      );
      setSnippet(data.data.snippets);
      setNextCursor(data.data.nextCursor);
      setHasNextPage(data.data.hasNextPage);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------Search snippet function------------------------------------*/
  const handleLike = async (snippetId: string) => {
    if (!isAuthenticated) {
      toast.warning("You need to be logged in to like the snippets");
    }
    try {
      const { data } = await apiClient.post(`snippet/${snippetId}/like`);
      setSnippet((prev) =>
        prev.map((s) =>
          s.id === snippetId
            ? {
                ...s,
                _count: {
                  likes: data.data.liked
                    ? s._count.likes + 1
                    : s._count.likes - 1
                }
              }
            : s
        )
      );
    } catch (error) {
      toast.error("Failed to like snippet");
    }
  };

  /* ------------------------------------Search snippet function------------------------------------*/
  const handleFork = async (shortCode: string) => {
    if (!isAuthenticated) {
      toast.error("Login to fork snippets");
      return;
    }
    try {
      await apiClient.post(`/snippet/fork/${shortCode}`);
      toast.success("Snippet forked to your collection!");
    } catch {
      toast.error("Failed to fork snippet");
    }
  };

  useEffect(() => {
    fetchSnippets(true);
  }, [sort, language]);

  const languages = ["javascript", "typescript", "python", "java", "cpp"];

  return (
    <div className="min-h-screen bg-background">
      {/*--------------------------------------------Headers--------------------------------------------*/}
      <div className="flex items-center justify-between border-b border-b-slate-700 px-6 py-4">
        <h1
          className={`${blackOps.className} text-2xl font-bold bg-linear-to-r
             from-purple-500
             via-indigo-600
             to-purple-500
               bg-clip-text 
               text-transparent`}
        >
          DevHive
        </h1>
        <div className="flex items-center gap-3">
          {roomCode ? (
            <Link href={`/workspace/${roomCode}`}>
              <Button
                variant={"outline"}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10!"
              >
                Go To Editor
              </Button>
            </Link>
          ) : (
            <Link href={"/join-room"}>
              <Button
                variant={"outline"}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10!"
              >
                Join Room
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <Link href={`/snippets/${roomCode}`}>
              <Button
                variant={"outline"}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10!"
              >
                My Snippets
              </Button>
            </Link>
          ) : (
            <Link href={"/login"}>
              <Button
                variant={"outline"}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10!"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      {/*--------------------------------------------Page content--------------------------------------------*/}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/*--------------------Title--------------------*/}
        <div className="text-center mb-8">
          <h2 className="capitalize text-4xl font-bold text-foreground mb-2">
            community snippets
          </h2>
          <p className="text-muted-foreground">
            Browse, fork and learn from code shared by the community
          </p>
        </div>
        {/*----------------Search + Filters----------------*/}
        <div className="flex flex-col items-center sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Snippets"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSnippet}
              className="pl-10 h-12"
            />
          </div>
          <Button
            onClick={searchSnippet}
            className="h-12 bg-linear-to-r from-violet-700 via-violet-500 to-violet-700 hover:opacity-80"
          >
            Search
          </Button>
        </div>
        {/*----------------Sort + language Filters----------------*/}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={sort === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("recent")}
            className="gap-1"
          >
            <Clock className="size-3" /> Recent
          </Button>
          <Button
            variant={sort === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("popular")}
            className="gap-1"
          >
            <TrendingUp className="size-3" /> Popular
          </Button>
          <div className="w-px bg-slate-700 mx-1" />
          <Button
            variant={language === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("")}
          >
            All
          </Button>
          {languages.map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage(lang)}
              className="capitalize"
            >
              {lang}
            </Button>
          ))}
        </div>
        {/*----------------------Snippets Grid----------------------*/}
        {isLoading && snippet.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48  rounded-lg bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : snippet.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No snippets found. Be the first one to share.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippet.map((snip) => (
              <div
                key={snip.id}
                className="border border-slate-700 rounded-lg p-4 bg-background hover:border-purple-600 transition-colors flex flex-col gap-3"
              >
                {/* ----------------------top---------------------- */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground truncate max-w-45">
                      {snip.title}
                    </h3>
                    <p className=" text-sm mt-1 text-muted-foreground">
                      {snip.user.username}
                    </p>
                    <Badge
                      variant={"outline"}
                      className="text-sm capitalize shrink-0 rounded mt-2"
                    >
                      {snip.language}
                    </Badge>
                  </div>
                </div>
                {/* ----------------------Code Preview---------------------- */}
                <pre className="text-xs bg-slate-900 rounded overflow-hidden max-h-24 text-slate-300 font-mono">
                  {snip.code.slice(0, 200)}
                  {snip.code.length > 200 && "..."}
                </pre>

                {/* ----------------------Actions---------------------- */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(snip.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Heart className="size-3" />
                      {snip._count.likes}
                    </button>
                    <button
                      onClick={() => handleFork(snip.shortCode)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <GitFork className="size-3" />
                      Fork
                    </button>
                  </div>

                  <Link
                    href={`/snippet/${snip.shortCode}`}
                    className="text-xs text-purple-400 hover:underline flex items-center justify-center gap-1 capitalize"
                  >
                    <Eye className="size-3" />
                    view
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ----------------------Load More---------------------- */}
        {hasNextPage && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => fetchSnippets(false)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GalleryPage;
