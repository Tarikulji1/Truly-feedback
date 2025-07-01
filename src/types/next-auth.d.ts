import NextAuth from "next-auth";

interface AppUserFields {
  _id: string;
  username: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
}

declare module "next-auth" {
  interface Session {
    user: AppUserFields & DefaultSession["user"];
  }
  
  interface User extends AppUserFields {}
  interface JWT extends AppUserFields {}
}
