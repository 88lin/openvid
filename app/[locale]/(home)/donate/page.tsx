import { redirect } from "next/navigation";

// Donations / "buy me a coffee" now point to the maintainer's external page.
export default function DonatePage() {
  redirect("https://blog.88lin.eu.org/coffee");
}
