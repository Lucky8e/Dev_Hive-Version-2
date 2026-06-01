"use client";
import { Button } from "@/components/ui/button";
import { Black_Ops_One } from "next/font/google";
import { motion } from "framer-motion";
import {
  Code2,
  PlaySquare,
  Sparkles,
  TerminalSquare,
  Users
} from "lucide-react";
import CodeEditorMockup from "@/my-components/Editor/CodeEditorMockup";
import { FaXTwitter, FaDiscord, FaGithub } from "react-icons/fa6";

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"] // choose the weight you need
});

const features = [
  {
    title: "Real-time Collaboration",
    description:
      "Code together seamlessly with zero latency. Powered by Yjs for flawless conflict resolution.",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Integrated Terminal",
    description:
      "Full xterm.js integration directly in your browser. Run commands, start servers, deploy apps.",
    icon: TerminalSquare,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Live React Previews",
    description:
      "Instant hot-module reloading with Sandpack. See your React components update as you type.",
    icon: PlaySquare,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Multi-language Support",
    description:
      "Write Python, Rust, Go, and more. Backed by the robust Piston API for secure execution.",
    icon: Code2,
    color: "text-primary",
    bg: "bg-primary/10"
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-body flex flex-col relative">
      {/* BackGround Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      {/* NavBar */}
      <nav className="relative z-20 container mx-auto px-6 py-6 lg:px-24 flex items-center justify-between">
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
        <Button
          variant="ghost"
          className="hover:bg-white/40 hover:text-white transition-colors rounded-full px-6"
        >
          Request Access
        </Button>
      </nav>
      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center container mx-auto px-4 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-8 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-primary/20 text-sm font-medium text-primary-foreground/80  mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>The next evolution of cloud IDEs</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-white to-white/50"
          >
            Code together,
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-800 to-purple-700/35 text-glow ">
              {" "}
              instantly.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground leading-relaxed"
          >
            A multiplayer development environment built for modern teams.
            Real-time sync, powerful terminals, and instant previews—all in your
            browser.
          </motion.p>
        </div>
        <CodeEditorMockup />
      </main>
      {/* Features Section */}
      <section className="relative z-10 py-25 bg-black/40 border-t border-white/5">
        <div className="container mx-auto px-6">
          {/* Feature Header */}
          <div className="text-center mb-16">
            <h2 className="font-mono text-3xl md:text-5xl font-bold mb-4">
              Everything you need to ship faster.
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              We've combined the best open-source technologies to create an
              unparalleled development experience.
            </p>
          </div>
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07]
                       transition-all duration-300 hover:shadow-2xl hover:translate-y-2 overflow-hidden"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-sans text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  {/* Subtle hover gradient */}
                  <div
                    className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 
                  group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer className="relative z-10 py-10 border-t border-white/10 bg-background/5 text-center">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center ">
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
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} DevHive Collaborative. All rights
            reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <FaXTwitter />
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <FaGithub />
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <FaDiscord />
              Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
