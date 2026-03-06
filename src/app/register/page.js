"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

export default function RegisterPage() {

    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()
        console.log(name, email, password)

        // add backend api call 
        alert("User registered successfully")

        // Redirect to dashboard
        router.push("/dashboard")
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">

            <Card className="w-96">

                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        Register
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {/* Manual Register */}
                    <form onSubmit={handleRegister} className="space-y-4">

                        <Input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

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

                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Register
                        </Button>

                    </form>

                    <div className="my-4">
                        <Separator />
                    </div>

                    {/* Google Register */}
                    <Button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        variant="secondary"
                        className="w-full"
                    >
                        Register with Google
                    </Button>
                    <div className="text-center text-sm mt-4">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Login
                        </Link>
                    </div>
                </CardContent>

            </Card>

        </div>
    )
}