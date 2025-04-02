import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LA SAFARI HOTEL",
  description: "Sign in to your account",
};

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <SignIn
          afterSignInUrl="/rooms"
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              card: "shadow-lg",
              rootBox: "mx-auto"
            },
          }}
        />
      </div>
    </div>
  );
}
