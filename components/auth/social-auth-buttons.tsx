import { GithubButton } from "@/components/auth/github-button";
import { GoogleButton } from "@/components/auth/google-button";

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 w-full">
      <GithubButton label="Continue with GitHub" />
      <GoogleButton label="Continue with Google" />
    </div>
  );
}
