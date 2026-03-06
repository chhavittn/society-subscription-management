"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function LoginPage() {

    const { data: session } = useSession()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = (e) => {
        e.preventDefault()

        console.log("Email:", email)
        console.log("Password:", password)

        alert("Manual login requires backend validation.")
    }

    if (session) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">

                <Card className="w-96 text-center">

                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Welcome {session.user.name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        <p className="text-gray-600">
                            {session.user.email}
                        </p>

                        <Button
                            variant="destructive"
                            onClick={() => signOut()}
                            className="w-full"
                        >
                            Logout
                        </Button>

                    </CardContent>

                </Card>

            </div>
        )
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
                        onClick={() => signIn("google")}
                        className="w-full"
                        variant="secondary"
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
    )
}