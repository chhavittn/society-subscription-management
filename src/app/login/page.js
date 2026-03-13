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
    const [userData,setUserData] = useState(null);
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    const handleLogOut = () => {
        if(user) {
            dispatch(logout())
            router.push("/login");
        } else if(session) {
            if(!user){
                signOut({callbackUrl: "/login"})
            }
        }
    }

    useEffect(() => {

        if (!loading && isAuthenticated && user) {

            console.log(loading, isAuthenticated, user);

            if (user.role === "admin") {
                router.replace("/admin/dashboard");
            }
            else {
                router.replace("/user/dashboard");
            }

        }

        if(session) {
            setUserData(session?.user)
        } else {
            setUserData(user)
        }

    }, [isAuthenticated, user, loading]);


    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (session || (isAuthenticated && user)) {

        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">

                <Card className="w-96 text-center">

                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Welcome {userData?.name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        <p className="text-gray-600">
                            {userData?.email}
                        </p>

                        <Button
                            variant="destructive"
                            onClick={handleLogOut}
                            className="w-full"
                        >
                            Logout
                        </Button>

                    </CardContent>

                </Card>

            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">

            <Card className="w-96">

                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Login
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {/* Email Password Login */}
                    <form onSubmit={handleLogin} className="space-y-4">

                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full">
                            Login
                        </Button>

                    </form>

                    <div className="my-4">
                        <Separator />
                    </div>

                    {/* Google Login */}
                    <Button
                        onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
                        className="w-full"
                    >
                        Sign in with Google
                    </Button>

                    <div className="text-center text-sm mt-4">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Create a new account
                        </Link>
                    </div>

                </CardContent>

            </Card>

        </div>
    );
}