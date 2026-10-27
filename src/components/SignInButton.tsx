import { signIn } from "@/auth";
export default function SignInButton({ label = "Sign in" }: { label?: string }) {
  return <form action={async () => { "use server"; await signIn("google", { redirectTo: "/" }); }}><button className="btn" type="submit">{label}</button></form>;
}
