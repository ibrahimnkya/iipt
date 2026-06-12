"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

export function AutoLogout() {
    const { data: session } = useSession();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (session) {
            timerRef.current = setTimeout(() => {
                // Determine if we are already on a public page to avoid annoying redirects or double sign-outs?
                // Actually signOut will handle redirection.
                signOut({ callbackUrl: "/login?reason=inactivity" });
            }, INACTIVITY_LIMIT_MS);
        }
    }, [session]);

    useEffect(() => {
        if (!session) {
            return;
        }

        // Events to listen for
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
        ];

        // Initial set
        resetTimer();

        // Add listeners
        const handleActivity = () => {
            resetTimer();
        };

        // We might want to throttle this if performance is an issue, 
        // but for simple timer reset, it's usually fine.
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [session, resetTimer]);

    return null; // This component renders nothing
}
