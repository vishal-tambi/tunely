import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user) {
        try {
          // Create Supabase client
          const { createClient } = await import("@supabase/supabase-js");
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase credentials");
            return true; // Allow sign in anyway
          }
          
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // Check if user exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();
          
          // If user doesn't exist, create them
          if (!existingUser) {
            const { error } = await supabase
              .from("users")
              .insert({
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                updated_at: new Date().toISOString(),
              });
            
            if (error) {
              console.error("Error creating user:", error);
            }
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  // Add these configurations for better production support
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
});
