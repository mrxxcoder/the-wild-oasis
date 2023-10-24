import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://alahairmghosbfkhdhsr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYWhhaXJtZ2hvc2Jma2hkaHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU1OTI1MDgsImV4cCI6MjAxMTE2ODUwOH0.U6LEyYRhFi8kUC2QTp_J84vBMvv2WMwKHZSSaxRLFTg";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
