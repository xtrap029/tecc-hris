import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function WelcomeSplash() {
    const [visible, setVisible] = useState(false);
    const [fading, setFading] = useState(false);
    const fadeTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const triggerSplash = () => {
        if (!sessionStorage.getItem('justLoggedIn')) return;
        sessionStorage.removeItem('justLoggedIn');

        clearTimeout(fadeTimer.current!);
        clearTimeout(hideTimer.current!);

        setFading(false);
        setVisible(true);

        fadeTimer.current = setTimeout(() => setFading(true), 2000);
        hideTimer.current = setTimeout(() => setVisible(false), 3000);
    };

    useEffect(() => {
        // Covers: component mounts fresh after login (layout switch)
        triggerSplash();

        // Covers: layout stays mounted, Inertia navigates after re-login
        const unsubscribe = router.on('navigate', () => triggerSplash());

        return () => {
            unsubscribe();
            clearTimeout(fadeTimer.current!);
            clearTimeout(hideTimer.current!);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            style={{
                background: 'radial-gradient(ellipse at center, #0d1f3c 0%, #132952 55%, #1a3a6e 100%)',
                opacity: fading ? 0 : 1,
                transition: 'opacity 1s ease-out',
            }}
        >
            <h1
                style={{
                    fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                    fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                    color: '#ffffff',
                    animation: 'splashPulse 1.8s ease-in-out infinite',
                    letterSpacing: '0.05em',
                    textShadow: '0 2px 24px rgba(255,255,255,0.18)',
                    userSelect: 'none',
                }}
            >
                you matter
            </h1>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');

                @keyframes splashPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.06); opacity: 0.85; }
                }
            `}</style>
        </div>
    );
}
