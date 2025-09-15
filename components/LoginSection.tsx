"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BadgeComponent from "@/components/BadgeComponent";

export default function LoginSection({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <Card className="w-full shadow-lg border rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Invoice App</span>
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Please log in with your Google account to start managing your invoices 🚀
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 mt-4">
          <Button
            onClick={onLogin}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 hover:border-gray-400 rounded-xl"
          >
            {/* Google SVG */}
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
              <path
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.2h146.9c-6.3 34-25 62.8-53.3 82.1v68h86.2c50.4-46.4 81.7-115 81.7-194.9z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c72.6 0 133.6-24.1 178.2-65.2l-86.2-68c-24 16.1-54.5 25.6-92 25.6-70.9 0-131-47.8-152.5-112.2h-89.9v70.6C88 470.4 174.6 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M119.5 323.1c-10.7-31.5-10.7-65.7 0-97.2v-70.6h-89.9C11.2 199.1 0 239.2 0 278.4s11.2 79.3 29.6 123.1l89.9-70.6z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.6c38.3 0 72.7 13.2 99.9 39.2l74.8-74.8C405.6 24.1 344.6 0 272 0 174.6 0 88 73.9 49.6 178.4l89.9 70.6C141 155.4 201.1 107.6 272 107.6z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </Button>
        </CardContent>
      </Card>

      {/* Floating Badge */}
      <div className="mt-6">
        <BadgeComponent />
      </div>
    </div>
  );
}
