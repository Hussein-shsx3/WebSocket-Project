import { redirectBasedOnAuth } from "@/protect";

export default async function MainPage() {
  await redirectBasedOnAuth();
}
