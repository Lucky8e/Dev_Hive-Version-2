"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"] // choose the weight you need
});

const RegisterPage = () => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegistration = async () => {
    if (!email || !userName || !password) {
      toast.error("Username, email and password is required");
      return;
    }
    setIsLoading(true);

    try {
      await register(userName.trim(), email.trim(), password.trim());
      toast.success("Registration Successfully");
      router.replace("/join-room");
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Registration failed try again!!!"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center ">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="flex flex-col space-y-4 justify-center items-center p-8 border-4 border-t-2 max-w-md w-full rounded-lg shadow-2xl">
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
          Register your account
        </p>
        {/* labels and inputs for registering */}
        <div className="w-full space-y-4">
          {/* username labels and inputs */}
          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium text-sm">
              UserName
            </Label>
            <Input
              type="text"
              value={userName}
              placeholder={"Username"}
              className="h-12"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          {/* email labels and inputs */}
          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium text-sm">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              placeholder={"your@email.com"}
              className="h-12"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* password labels and inputs */}
          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium text-sm">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              placeholder={"••••••••"}
              className="h-12"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegistration()}
            />
          </div>

          <Button
            className={`w-full hover:bg-purple-400 h-12`}
            onClick={handleRegistration}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account...." : "Register"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
