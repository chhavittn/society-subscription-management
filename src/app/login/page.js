"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logout } from "../../redux/slices/authSlice";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();
    const [userData, setUserData] = useState(null);
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    const handleLogOut = () => {
        if (user) {
            dispatch(logout())
            router.push("/login");
        } else if (session) {
            if (!user) {
                signOut({ callbackUrl: "/login" })
            }
        }
    }

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            if (user.role === "admin") {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/user/dashboard");
            }
        }

        if (session) {
            router.replace("/admin/dashboard")
        }
    }, [isAuthenticated, user, session, loading, router]);


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-lg font-medium text-slate-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    if (session || (isAuthenticated && user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-sm shadow-xl border-slate-200 rounded-2xl bg-white">
                    <CardHeader className="space-y-2 pb-4 pt-8 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                            Welcome {userData?.name || user?.name || session?.user?.name || "User"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8 pb-8">
                        <p className="text-center text-slate-500 text-sm font-medium">
                            {userData?.email || user?.email || session?.user?.email}
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleLogOut}
                            className="w-full h-11 text-base font-semibold rounded-xl"
                        >
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-100 rounded-2xl bg-white">
                <CardHeader className="space-y-3 pb-6 pt-8 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome Back
                    </CardTitle>
                    <p className="text-sm text-slate-500 font-medium tracking-wide">
                        Sign in to your account
                    </p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    {/* Email Password Login */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-slate-400 transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-slate-400 transition-colors"
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all">
                            Login
                        </Button>
                    </form>

                    <div className="my-6 flex items-center justify-center">
                        <Separator className="flex-1 bg-slate-200" />
                        <span className="mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Or continue with
                        </span>
                        <Separator className="flex-1 bg-slate-200" />
                    </div>

                    {/* Google Login */}
                    <Button
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
                        className="w-full h-12 text-base font-medium rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </Button>

                    <div className="text-center mt-8 text-sm text-slate-600">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-slate-900 hover:text-slate-700 hover:underline transition-colors block mt-2"
                        >
                            Create a new account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}