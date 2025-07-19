import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
    }
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, ensure the user exists in the database
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", session.user.id)
      .single();
    
    if (userCheckError && userCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("User check error:", userCheckError);
      return NextResponse.json({ error: userCheckError.message }, { status: 500 });
    }
    
    // If user doesn't exist, create them
    if (!existingUser) {
      const { error: userCreateError } = await supabase
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          updated_at: new Date().toISOString(),
        });
      
      if (userCreateError) {
        console.error("User creation error:", userCreateError);
        return NextResponse.json({ error: userCreateError.message }, { status: 500 });
      }
    }
    
    // Generate room code
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Create room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        id: roomCode,
        host_id: session.user.id,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (roomError) {
      console.error("Room creation error:", roomError);
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }
    
    // Add host as participant
    const { error: participantError } = await supabase
      .from("room_participants")
      .insert({
        room_id: roomCode,
        user_id: session.user.id,
        joined_at: new Date().toISOString()
      });
    
    if (participantError) {
      console.error("Participant error:", participantError);
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }
    
    // Initialize playback state
    const { error: playbackError } = await supabase
      .from("playback_state")
      .insert({
        room_id: roomCode,
        current_song_id: null,
        playback_position: 0,
        is_playing: false,
      });
    
    if (playbackError) {
      console.error("Playback state error:", playbackError);
      return NextResponse.json({ error: playbackError.message }, { status: 500 });
    }
    
    return NextResponse.json({ roomCode });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
