import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your PostPilot account.',
  robots: { index: false, follow: false },
}

export default function SignInPage() {
  return (
    <div className="w-full max-w-md mx-auto flex justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full",
            card: "bg-[#FF9B4F] rounded-2xl shadow-[0_12px_30px_rgba(255,155,79,0.35)] border border-[#FFB67D]",
            headerTitle: "text-white",
            headerSubtitle: "text-white/85",
            socialButtonsBlockButton:
              "bg-white text-[#181817] border border-white/80 hover:bg-white/90",
            socialButtonsBlockButtonText: "text-[#181817]",
            dividerLine: "bg-white/30",
            dividerText: "text-white/80",
            formFieldLabel: "text-white/90",
            formFieldInput:
              "bg-white text-[#181817] placeholder:text-[#4D4946]/60 border border-white/70 focus-visible:ring-[#FF6E00]",
            formButtonPrimary:
              "bg-[#FF6E00] hover:bg-[#FF6E00]/90 text-white shadow-[0_6px_18px_rgba(255,110,0,0.35)]",
            footerActionText: "text-white/85",
            footerActionLink: "text-white underline hover:text-white/90"
          }
        }}
      />
    </div>
  )
}