import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { isClerkEnabled } from "@/lib/clerk-config";

export default function SignUpPage() {
  if (!isClerkEnabled()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p className="text-slate-300">Sign-up is unavailable in preview mode.</p>
        <Link href="/" className="text-violet-400 underline">
          Continue as guest on the home page
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <SignUp />
    </div>
  );
}
