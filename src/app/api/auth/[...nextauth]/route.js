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
    async jwt({ token, account }) {

      // Assign role 
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