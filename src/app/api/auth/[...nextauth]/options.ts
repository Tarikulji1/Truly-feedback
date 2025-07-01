import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";
// import DiscordProvider from "next-auth/providers/discord";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          if (!credentials?.identifier || !credentials.password) {
            throw new Error("Missing credentials")
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }).select('+password');

          if (!user) {
            throw new Error("Invalid credentials");
          }
          
          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }
          
          if (typeof user.password !== "string") {
            throw new Error("User password is not set");
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: (user as any)._id.toString(),
            _id: (user as any)._id.toString(),
            username: user.username,
            email: user.email,
            name: user.name,
            image: user.image,
            isVerified: user.isVerified,
            isAcceptingMessages: user.isAcceptingMessages,
          };
        } catch (error: any) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),

    /*
    // Google Provider
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_ID,
          clientSecret: process.env.GOOGLE_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          },
          profile(profile) {
            return {
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              username: profile.email.split('@')[0],
              isVerified: true,
              isAcceptingMessages: true,
            };
          }
        })]
      : []),

    // GitHub Provider
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [GitHubProvider({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
          profile(profile) {
            return {
              id: profile.id.toString(),
              name: profile.name || profile.login,
              email: profile.email,
              image: profile.avatar_url,
              username: profile.login,
              isVerified: true,
              isAcceptingMessages: true,
            };
          }
        })]
      : []),

    // Discord Provider
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [DiscordProvider({
          clientId: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          profile(profile) {
            return {
              id: profile.id,
              name: profile.username,
              email: profile.email,
              image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
              username: `${profile.username}#${profile.discriminator}`,
              isVerified: true,
              isAcceptingMessages: true,
            };
          }
        })]
      : []),
      */
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Skip for credentials provider
      if (account?.provider === "credentials") return true;
      await dbConnect();

      try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: user.email });

        if (existingUser) {
          // Update user information if needed
          existingUser.image = user.image ?? "null";
          existingUser.name = user.name ?? "null";
            // Only save if there are changes to avoid unnecessary writes
            if (
            existingUser.image !== user.image ||
            existingUser.name !== user.name
            ) {
            await existingUser.save();
            }
          return true;
        }

        // Create new user for social providers
        const newUser = new UserModel({
          email: user.email,
          username: user.username || user.email?.split('@')[0],
          name: user.name,
          image: user.image,
          isVerified: true,
          isAcceptingMessages: true,
          // No password for social auth users
        });
        
        await newUser.save();
        return true;
      } catch (error) {
        console.error("SignIn Callback error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/auth-error",
    newUser: "/onboarding"
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Security enhancements
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};
