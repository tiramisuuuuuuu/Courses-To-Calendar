import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: `${process.env.GOOGLE_CLIENT_ID}`,
            clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                    }
                }           
            }),
        ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (account) {
              token.accessToken = account.access_token;
              token.refreshToken = account.refresh_token;
              console.log(token.accessToken);
            }
            return token;
        },

        async session({ session, token, user }) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            
            return session
        },
        }
} satisfies NextAuthOptions;

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };