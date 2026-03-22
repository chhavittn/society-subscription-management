import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {

    async signIn({ account }) {

      try {
        const res = await fetch("http://localhost:5000/api/v1/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: account.id_token
          })
        });

        const data = await res.json();

        // 👇 store backend token
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
        }

        return true;

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
  }
})

export { handler as GET, handler as POST }