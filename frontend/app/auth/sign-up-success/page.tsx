import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-sm">
        <Card className="border border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-accent">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              After verification, you can sign in and start using the dashboard.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
