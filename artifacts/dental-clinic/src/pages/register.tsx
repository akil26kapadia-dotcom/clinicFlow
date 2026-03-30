import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const { register, isRegistering } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    clinicName: "",
    gstNumber: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register({ data: formData });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      <img 
        src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
      />
      
      <div className="w-full flex items-center justify-center z-10 px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Register Clinic</h1>
            <p className="text-muted-foreground mt-2 text-center">Set up your dental practice workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Your Name</label>
                <Input name="name" placeholder="Dr. John Doe" value={formData.name} onChange={handleChange} required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Email Address</label>
                <Input name="email" type="email" placeholder="doctor@clinic.com" value={formData.email} onChange={handleChange} required className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Password</label>
                <Input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Phone Number</label>
                <Input name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground px-1">Clinic Name</label>
              <Input name="clinicName" placeholder="Bright Smiles Dental" value={formData.clinicName} onChange={handleChange} required className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground px-1">GST Number (Optional)</label>
              <Input name="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} className="rounded-xl" />
            </div>

            <Button 
              type="submit" 
              disabled={isRegistering}
              className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white shadow-lg shadow-primary/25 text-base font-semibold"
            >
              {isRegistering ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
