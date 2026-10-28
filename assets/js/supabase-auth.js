
const supabaseClient = supabase.createClient(
  "https://lbvgfojyqqfevmpugibc.supabase.co",
  "YOUR_SUPABASE_PUBLISHABLE_KEY"
);

async function signInWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard/"
    }
  });

  if (error) {
    console.error("Google login failed:", error.message);
  }
}

async function saveUserProfile() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) return;

  const user = data.user;

  const { data: existing, error: lookupError } =
    await supabaseClient
      .from("mail_merge_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

  if (lookupError) {
    console.error(lookupError.message);
    return;
  }

  if (existing) return;

  const { error: insertError } = await supabaseClient
    .from("mail_merge_users")
    .insert({
      auth_user_id: user.id,
      name: user.user_metadata?.full_name || "",
      email: user.email,
      emails_sent: 0
    });

  if (insertError) {
    console.error("Profile save failed:", insertError.message);
  }
}

async function initializeAccount() {
  await saveUserProfile();
}

initializeAccount();
