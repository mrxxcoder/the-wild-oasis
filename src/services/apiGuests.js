import supabase from "./supabase";

export async function getGuests() {
  let { data, error } = await supabase.from("guests").select("*");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
}
