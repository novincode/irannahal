import type { Metadata } from "next";
import "./globals.css";
import RootLayout from '@ui/components/layout/RootLayout'
import { generateMetaForPath, webMeta } from "@configs/meta";

export const runtime = 'edge';

export const metadata = generateMetaForPath('/', 'web');

export default RootLayout