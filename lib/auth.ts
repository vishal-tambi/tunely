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
      if (account && user) {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("Error storing user in Supabase:", error);
        }

        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
}); 