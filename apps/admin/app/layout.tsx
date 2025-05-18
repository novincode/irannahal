import "./globals.css";
import RootLayout from '@ui/components/layout/RootLayout'
import {  generateMetaForPath } from "@configs/meta";

export const runtime = 'edge';

export const metadata = generateMetaForPath('/', 'admin');


export default RootLayout