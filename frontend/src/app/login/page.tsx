"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"] // choose the weight you need
});
const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      toast("Email and Password is required to sign in");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      router.replace("/join-room");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* form div */}
      <div className="flex flex-col justify-center items-center p-8 rounded-lg max-w-md w-full border-2 shadow-2xl border-t-0">
        <h1
          className={`${blackOps.className} text-5xl font-bold bg-linear-to-r
             from-purple-500
             via-indigo-600
             to-purple-500
               bg-clip-text 
               text-transparent`}
        >
          DevHive
        </h1>
        <p className="text-muted-foreground mb-8 capitalize">
          Log in to your account
        </p>
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium text-sm">
              Email
            </Label>
            <Input
              placeholder="your@email.com"
              value={email}
              type="email"
              className="h-12"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-12"
            />
          </div>

          <Button
            className="w-full h-12 hover:bg-purple-400"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:underline font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
