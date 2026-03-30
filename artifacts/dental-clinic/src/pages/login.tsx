import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Syringe } from "lucide-react";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ data: { email, password } });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Background Image */}
      <img 
        src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
      />
      
      <div className="w-full flex items-center justify-center z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2 text-center">Enter your details to access your clinic dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground px-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="doctor@clinic.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12 bg-background border-border focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground px-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12 bg-background border-border focus:ring-primary/20"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white shadow-lg shadow-primary/25 text-base font-semibold transition-all hover:scale-[1.02]"
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Register your clinic
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
