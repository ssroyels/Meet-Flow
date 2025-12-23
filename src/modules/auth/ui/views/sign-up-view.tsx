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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { authClient } from "@/lib/auth-client";

/* =============================================================================
   VALIDATION SCHEMA
============================================================================= */
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export const SignUpView = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message || "Something went wrong. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-white to-green-100 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <Card className="overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-md">
          <CardContent className="grid p-0 md:grid-cols-2 lg:grid-cols-5">
            
            {/* LEFT — BRAND PANEL (Visible on MD+) */}
            <div className="relative hidden md:flex lg:col-span-2 flex-col items-center justify-center p-12 text-white bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full bg-emerald-400 blur-3xl" />
              </div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="mb-6 p-4 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                  <Image
                    src="/logo.avif"
                    alt="Meet.AI"
                    width={100}
                    height={100}
                    className="rounded-2xl"
                  />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">Meet.AI</h2>
                <div className="h-1 w-12 bg-green-400 rounded-full mb-4" />
                <p className="text-lg font-light opacity-90 leading-relaxed">
                  Smart Collaboration <br />
                  <span className="font-semibold text-green-300 italic text-xl">Simplified with Intelligence.</span>
                </p>
              </motion.div>

              <div className="absolute bottom-8 text-xs opacity-60 tracking-widest uppercase">
                Enterprise Ready • Secure • Fast
              </div>
            </div>

            {/* RIGHT — SIGN UP FORM */}
            <div className="flex flex-col p-8 md:p-12 lg:col-span-3 bg-white">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Get Started <Sparkles className="h-6 w-6 text-green-500 fill-green-500" />
                </h1>
                <p className="text-muted-foreground mt-2">
                  Join thousands of users optimizing their meetings.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-slate-700">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-slate-700">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="name@company.com" {...field} className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-11 bg-slate-50/50 pr-10 border-slate-200"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Confirm</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-11 bg-slate-50/50 pr-10 border-slate-200"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                              >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-3">
                          <OctagonAlertIcon className="h-4 w-4" />
                          <AlertDescription className="text-sm font-medium">
                            {error}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={pending}
                    className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                  >
                    {pending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>Create Account <ChevronRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-muted-foreground font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => authClient.signIn.social({ provider: "google" })}
                      className="h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <FcGoogle className="mr-2 h-5 w-5" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => authClient.signIn.social({ provider: "github" })}
                      className="h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <FaGithub className="mr-2 h-5 w-5" />
                      GitHub
                    </Button>
                  </div>
                </form>
              </Form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-green-700 underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-slate-400 uppercase tracking-widest px-4 leading-relaxed">
          By joining, you agree to our{" "}
          <span className="text-slate-600 font-semibold cursor-pointer hover:text-green-600">Terms of Service</span> and{" "}
          <span className="text-slate-600 font-semibold cursor-pointer hover:text-green-600">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
};