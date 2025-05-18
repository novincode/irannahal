import { Metadata } from "next";

interface RouteMeta {
    [key: string]: Metadata;
}
export const webMeta: RouteMeta = {
    '/': {
        title: "Nahaleto",
        description: "Nahaleto - نهالتو",
    },
    '/about': {
        title: "About",
        description: "About page",
    },
}
export const adminMeta: RouteMeta = {
    '/': {
        title: "Admin Panel",
        description: "Admin panel",
    },

}

export const generateMetaForPath  = (path: string, type: "admin" | "web" = "web"): Metadata => {
    const meta = type === "admin" ? adminMeta : webMeta;
    return meta[path] || {
        title: `${process.env.NEXT_PUBLIC_APP_NAME} - ${process.env.NEXT_PUBLIC_APP_NAME_PERSIAN}`,
        description: `${process.env.NEXT_PUBLIC_APP_NAME} - ${process.env.NEXT_PUBLIC_APP_NAME_PERSIAN}`,
    }
}