import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  const session = await auth();
  
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Information</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Has Session:</strong> {session ? "Yes" : "No"}
              </div>
              <div>
                <strong>Has User:</strong> {session?.user ? "Yes" : "No"}
              </div>
              {session?.user && (
                <>
                  <div>
                    <strong>User ID:</strong> {session.user.id}
                  </div>
                  <div>
                    <strong>Email:</strong> {session.user.email}
                  </div>
                  <div>
                    <strong>Name:</strong> {session.user.name}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || "Not set"}
              </div>
              <div>
                <strong>NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? "Set" : "Not set"}
              </div>
              <div>
                <strong>GOOGLE_CLIENT_ID:</strong> {process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"}
              </div>
              <div>
                <strong>GOOGLE_CLIENT_SECRET:</strong> {process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>If authentication is not working:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check that all environment variables are set in Vercel</li>
                <li>Ensure NEXTAUTH_SECRET is properly configured</li>
                <li>Verify Google OAuth credentials are correct</li>
                <li>Check that NEXTAUTH_URL matches your Vercel deployment URL</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 