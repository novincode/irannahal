import localFont from "next/font/local";

const IranSansX = localFont({
    src: [
      {
        path: './IRANSansX/woff/IRANSansX-Light.woff',
        weight: '100 300',
        style: 'normal',
      },
      {
        path: './IRANSansX/woff/IRANSansX-Medium.woff',
        weight: '500 300',
        style: 'normal',
      },
      {
        path: './IRANSansX/woff/IRANSansX-black.woff',
        weight: '500 700',
        style: 'normal',
      },
      {
        path: './IRANSansX/woff/IRANSansX-Heavy.woff',
        weight: '700 900',
        style: 'normal',
      },
    ],
  })
  
  export const IranSansXClassName = IranSansX.className