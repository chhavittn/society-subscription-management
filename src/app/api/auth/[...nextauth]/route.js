import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {

    async signIn({ user }) {

      try {

        await fetch("http://localhost:5000/api/v1/google-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            name: user.name,
            email: user.email
          })
        })

        return true

      } catch (error) {

        console.error("Google backend login failed:", error)
        return false

      }

    },

    async jwt({ token, account }) {

      if (account) {
        token.role = "admin"
      }

      return token
    },

    async session({ session, token }) {

      session.user.role = token.role
      return session

    }
  },

  pages: {
    signIn: "/login",
    newUser: "/register"
  }
})

export { handler as GET, handler as POST }