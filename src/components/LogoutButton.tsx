"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button onClick={logout} className="btn-ghost ml-auto" title="Log out">
      ⏻ <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
