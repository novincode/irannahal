import type { Session } from "next-auth";

declare global {
    type CommonProps = {
        className?: string;
        session?: Session | null | undefined;
        [key: string]: any;
    };
}

export {};
