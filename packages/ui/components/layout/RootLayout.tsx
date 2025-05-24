
import { IranSansXClassName } from "@ui/fonts/fonts";
import { ThemeProvider } from "@ui/components/providers/ThemeProvider"
import { SessionProvider } from "next-auth/react"
import { auth } from "@auth";
import { Toaster } from "@shadcn/sonner"


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${IranSansXClassName} antialiased`}
      >
        <SessionProvider session={session}>
          
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
