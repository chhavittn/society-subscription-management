"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import { loginUser, logout, loadUser } from "../../redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error?.message || "Login failed");
      console.error(error);
    }
  };

  const handleLogOut = () => {
    if (user) {
      dispatch(logout());
      router.push("/login");
    } else if (session) {
      signOut({ callbackUrl: "/login" });
    }
  };

  useEffect(() => {
    if (session) {
      dispatch(loadUser());
    }
  }, [dispatch, session]);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="text-lg font-medium text-[#2d3436] animate-pulse">Loading...</div>
      </div>
    );
  }

  if (session || (isAuthenticated && user)) {
    return (
      <div className="auth-shell">
        <Card className="auth-card w-full max-w-md overflow-hidden p-0">
          <div className="h-3 bg-[#00cec9]" />
          <CardHeader className="space-y-2 bg-[#f8fcfb] px-8 pb-4 pt-8 text-center">
            <p className="summary-kicker">Already Signed In</p>
            <CardTitle className="text-3xl font-bold text-[#2d3436]">
              Welcome {user?.name || session?.user?.name || "User"}
            </CardTitle>
            <p className="text-sm text-[#636e72]">
              {user?.email || session?.user?.email}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8 pt-6">
            <Button onClick={handleLogOut} className="admin-btn-danger h-12 w-full rounded-xl text-base font-semibold">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card w-full max-w-md overflow-hidden p-0">
        <div className="h-3 bg-[#00cec9]" />
        <CardHeader className="space-y-3 bg-[#f8fcfb] px-6 pb-4 pt-8 sm:px-8">
          <p className="summary-kicker">Welcome Back</p>
          <CardTitle className="text-3xl font-bold tracking-tight text-[#2d3436] sm:text-4xl">
            Sign in to your dashboard
          </CardTitle>
          <p className="text-sm leading-6 text-[#636e72]">
            Continue with email and password or use your Google account to reach the admin workspace.
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-6 sm:px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />

            <Button type="submit" className="admin-btn-primary h-12 w-full rounded-xl text-base font-semibold">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center justify-center">
            <Separator className="flex-1 bg-[#dfe6e9]" />
            <span className="mx-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#636e72]">
              Or
            </span>
            <Separator className="flex-1 bg-[#dfe6e9]" />
          </div>

          <Button
            variant="outline"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/admin/dashboard",
                prompt: "select_account",
              })
            }
            className="h-12 w-full rounded-xl border border-[#dfe6e9] bg-[#f8fcfb] text-[#2d3436] shadow-none hover:bg-[#edf7f5]"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-[#636e72]">
            Need help accessing the portal? Contact your society admin.
          </p>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-[#0984e3] hover:text-[#00b894]">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
