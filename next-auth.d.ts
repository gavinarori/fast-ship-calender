import NextAuth, { DefaultSession, DefaultUser, JWT } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
  }

  interface User extends DefaultUser {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}



declare module "next-auth" {
  interface Session {
    accessToken?: string
    user?: {
      id: string
    } & DefaultSession["user"]
  }
}
