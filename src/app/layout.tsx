import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { userAuth } from '@/lib/auth/hooks';
import { Role } from '@prisma/client';
import Link from 'next/link';
config.autoAddCss = false;

const mono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "PINTAG - LWHS's Ultimate Game of Tag",
  description:
    "The official mission portal website for Lick-Wilmerding's Pin-Tag game.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await userAuth();
  return (
    <html lang="en">
      <body className={mono.className}>
        <div className="flex">
          <h1 className="m-4 font-bold text-4xl border-2 px-2 border-green-600 w-fit">
            PINTAG
          </h1>
          {user?.role === Role.ADMIN && (
            <div className="ml-auto p-4">
              <Link href="/admin" className="hover:underline">
                Admin Portal
              </Link>
            </div>
          )}
        </div>

        <div className="grid-pattern w-full h-full fixed top-0" />
        <div>{children}</div>
      </body>
    </html>
  );
}
