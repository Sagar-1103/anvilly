import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials"
import { DefaultSession, DefaultUser, NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prismaClient from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
    jwtToken?: string;
  }

  interface User extends DefaultUser {
    id?: string;
    jwtToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    jwtToken?: string;
  }
}

const generateJWT = async (payload: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, secret, { expiresIn: "365d" });
}


export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prismaClient.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        return { id: String(user.id), email: user.email }
      },
    }),
  ],
  // adapter: PrismaAdapter(prismaClient),
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account }) {
      const newToken: JWT = token;
      if (account && user) {
        newToken.accessToken = account.access_token;
        newToken.id = user.id;
      }

      if (!newToken.jwtToken && newToken.email) {
        try {
          const dbUser = await prismaClient.user.upsert({
            where: { email: newToken.email },
            update: {},
            create: {
              email: newToken.email,
              image: newToken.picture || undefined,
            }
          });
          newToken.id = String(dbUser.id);

          const payload = { id: dbUser.id };
          const jwt = await generateJWT(payload);

          newToken.jwtToken = jwt;
        } catch (error) {
          console.error("Error generating jwtToken in jwt callback:", error);
        }
      }
      return newToken;
    },
    async session({ session, token }) {
      const newSession: Session = session;
      if (token) {
        if (newSession.user) {
          newSession.user.id = token.id;
        }
        newSession.jwtToken = token.jwtToken;
      }
      return newSession;
    }
  }
} satisfies NextAuthOptions