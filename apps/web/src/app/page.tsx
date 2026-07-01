import { HomePageGuestOnly } from "./home-page-guest-only";
import { HomePageWithClerk } from "./home-page-with-clerk";
import { isClerkEnabled } from "@/lib/clerk-config";

export default function HomePage() {
  if (isClerkEnabled()) {
    return <HomePageWithClerk />;
  }

  return <HomePageGuestOnly />;
}
