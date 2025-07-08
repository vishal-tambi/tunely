import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseClient } from "@/lib/supabase/server";
import { Account, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      // On first sign in, user and account will be present
      if (account && user) {
        console.log("JWT callback - first sign in:", { user, account });
        
        const supabase = createSupabaseClient();
        
        // Use the Google sub (subject) as the user ID for consistency
        const userId = account.providerAccountId || user.id || token.sub;
        
        try {
          const { data, error } = await supabase
            .from("users")
            .upsert({
              id: userId,
              email: user.email,
              name: user.name,
              image: user.image,
              updated_at: new Date().toISOString(),
            })
            .select();

          if (error) {
            console.error("Error storing user in Supabase:", error);
          } else {
            console.log("User stored successfully in Supabase:", data);
          }
        } catch (err) {
          console.error("Supabase upsert failed:", err);
        }

        // Store the user ID in the token
        token.id = userId;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("Session callback:", { session, token });
      
      // Ensure the session has the user ID
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      console.log("Final session:", session);
      return session;
    },
    
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile });
      
      // Always allow sign in for Google provider
      if (account?.provider === "google") {
        return true;
      }
      
      return false;
    }
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  debug: process.env.NODE_ENV === "development",
  
  // Make sure cookies work in production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});