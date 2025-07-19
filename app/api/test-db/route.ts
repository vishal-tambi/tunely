import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: "Missing Supabase credentials",
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: "Database connection failed",
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Database connection successful",
      data: data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Server error",
      details: error.message
    }, { status: 500 });
  }
} 