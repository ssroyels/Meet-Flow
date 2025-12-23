"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  Eye,
  EyeOff,
  OctagonAlertIcon,
  Loader2,
  LogIn,
  ArrowRight,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { authClient } from "@/lib/auth-client";

/* =============================================================================
   VALIDATION SCHEMA
============================================================================= */
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export const SignInView = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/dashboard");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message || "Invalid email or password");
        },
      }
    );
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Dynamic Background Auras */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl z-10"
      >
        <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-xl">
          <CardContent className="grid p-0 md:grid-cols-10">
            
            {/* LEFT SIDE — BRAND EXPERIENCE (40%) */}
            <div className="relative hidden md:flex md:col-span-4 flex-col items-center justify-center p-12 text-white bg-gradient-to-br from-green-600 to-emerald-900">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-center"
              >
                <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                  <Image
                    src="/logo.avif"
                    alt="Meet.AI"
                    width={80}
                    height={80}
                    className="rounded-xl"
                  />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
                <p className="text-green-100/80 text-sm font-light">
                  Continue your journey with the worlds smartest collaboration tool.
                </p>
              </motion.div>

              <div className="absolute bottom-8 flex gap-2">
                <div className="h-1.5 w-8 bg-white rounded-full" />
                <div className="h-1.5 w-2 bg-white/30 rounded-full" />
                <div className="h-1.5 w-2 bg-white/30 rounded-full" />
              </div>
            </div>

            {/* RIGHT SIDE — LOGIN FORM (60%) */}
            <div className="flex flex-col p-8 md:p-12 md:col-span-6 bg-white/50">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  Sign In to Meet.AI <LogIn className="h-5 w-5 text-green-600" />
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="m@example.com" 
                            {...field} 
                            className="h-12 bg-white border-slate-200 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                          <Link href="#" className="text-xs font-medium text-green-700 hover:text-green-800 underline-offset-4 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-12 bg-white border-slate-200 pr-11 shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert className="border-none bg-red-50 text-red-700">
                          <OctagonAlertIcon className="h-4 w-4 fill-red-100" />
                          <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={pending}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                  >
                    {pending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Enter Workspace <ArrowRight size={18} />
                      </span>
                    )}
                  </Button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><Separator /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-slate-400 font-medium tracking-tighter">
                        Fast Login with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => authClient.signIn.social({ provider: "google" })}
                      className="h-11 border-slate-200 hover:bg-slate-50 transition-all font-semibold"
                    >
                      <FcGoogle className="mr-2 h-5 w-5" /> Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => authClient.signIn.social({ provider: "github" })}
                      className="h-11 border-slate-200 hover:bg-slate-50 transition-all font-semibold"
                    >
                      <FaGithub className="mr-2 h-5 w-5" /> GitHub
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">
                  New to Meet.AI?{" "}
                  <Link
                    href="/sign-up"
                    className="font-bold text-green-700 hover:text-green-800 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Footer Policy */}
        <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium opacity-60">
          Secured by Enterprise-Grade Encryption
        </p>
      </motion.div>
    </div>
  );
};