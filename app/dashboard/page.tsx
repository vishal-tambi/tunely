import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  console.log("Dashboard page loading...");
  
  const session = await auth();
  
  // Add detailed logging
  console.log("Session data:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    userName: session?.user?.name
  });
  
  if (!session?.user) {
    console.log("No session or user found, redirecting to login");
    redirect("/login");
  }

  console.log("User authenticated, rendering dashboard");

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user.name}. Create a new room or join an existing one.
          </p>
          
          {/* Debug information - remove this after fixing */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>Debug Info:</strong>
            <br />
            User ID: {session.user.id}
            <br />
            Email: {session.user.email}
            <br />
            Name: {session.user.name}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a Room</CardTitle>
              <CardDescription>
                Start a new music session and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                As the room host, you control playback while everyone votes on the queue.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/create-room">Create Room</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join a Room</CardTitle>
              <CardDescription>
                Enter a room code to join an existing session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add songs to the queue and vote on what plays next.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/join-room">Join Room</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* This section would show recent or active rooms once implemented */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Recent Rooms</h2>
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-muted-foreground">
              Your recent and active rooms will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}