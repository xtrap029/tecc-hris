import CookieConsentBanner from '@/components/CookieConsentBanner';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS, useAppearance } from '@/hooks/use-appearance';
import { useFavicon } from '@/hooks/use-favicon';
import { getImagePath } from '@/utils/helpers';
import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    icon?: ReactNode;
    status?: string;
    statusType?: 'success' | 'error';
}
function hexToAdjustedRgba(hex, opacity = 1, adjust = 0) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const getF = (ch) => (typeof adjust === 'number' ? clamp(adjust) : clamp(adjust[ch] ?? 0));
    const adj = (c, f) => (f < 0 ? Math.floor(c * (1 + f)) : Math.floor(c + (255 - c) * f));
    const rr = adj(r, getF('r'));
    const gg = adj(g, getF('g'));
    const bb = adj(b, getF('b'));
    return opacity === 1
        ? `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`.toUpperCase()
        : `rgba(${rr}, ${gg}, ${bb}, ${opacity})`;
}

export default function AuthLayout({ children, title, description, icon, status, statusType = 'success' }: AuthLayoutProps) {
    useFavicon();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const { logoLight, logoDark, themeColor, customColor } = useBrand();
    const { appearance } = useAppearance();

    const currentLogo = appearance === 'dark' ? logoLight : logoDark;
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];

    useEffect(() => {
        setMounted(true);
    }, []);

    // RTL Support for auth pages
    useEffect(() => {
        const globalSettings = (window as any).page?.props?.globalSettings;
        const isDemo = globalSettings?.is_demo || false;
        let storedPosition = 'left';

        if (isDemo) {
            // In demo mode, use cookies
            const getCookie = (name: string): string | null => {
                if (typeof document === 'undefined') return null;
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    const cookieValue = parts.pop()?.split(';').shift();
                    return cookieValue ? decodeURIComponent(cookieValue) : null;
                }
                return null;
            };
            const stored = getCookie('layoutPosition');
            if (stored === 'left' || stored === 'right') {
                storedPosition = stored;
            }
        } else {
            // In normal mode, get from database via globalSettings
            const stored = globalSettings?.layoutDirection;
            if (stored === 'left' || stored === 'right') {
                storedPosition = stored;
            }
        }

        const dir = storedPosition === 'right' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.setAttribute('dir', dir);

        // Check if it was actually set
        setTimeout(() => {
            const actualDir = document.documentElement.getAttribute('dir');
            if (actualDir !== dir) {
                document.documentElement.dir = dir;
                document.documentElement.setAttribute('dir', dir);
            }
        }, 1);
    }, []);

    return (
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
            <Head title={title} />

            {/* Left side - SVG illustration */}
            <div className="relative hidden overflow-hidden lg:block lg:w-1/2" style={{ backgroundColor: '#132952' }}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 h-full w-full"></div>
                </div>
            </div>

            {/* Right side - Content */}
            <div className="relative flex w-full items-center justify-center bg-white p-6 md:p-12 lg:w-1/2 dark:bg-slate-900">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20"
                        style={{ backgroundColor: `${primaryColor}20` }}
                    ></div>
                    <div
                        className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full opacity-15"
                        style={{ backgroundColor: `${primaryColor}30` }}
                    ></div>
                </div>
                <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {/* Mobile branding - only visible on small screens */}
                    <div className="mb-8 flex flex-col items-center lg:hidden">
                        <div className="mb-4 inline-flex rounded-xl p-4 shadow-lg" style={{ backgroundColor: primaryColor }}>
                            {currentLogo ? (
                                <img src={getImagePath(currentLogo)} alt="Logo" className="h-8 w-8 object-contain" />
                            ) : (
                                <CreditCard className="h-8 w-8 text-white" />
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-6 text-center">
                            {icon && (
                                <div
                                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                                    style={{ backgroundColor: `${primaryColor}20` }}
                                >
                                    {icon}
                                </div>
                            )}
                            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                        </div>

                        {status && (
                            <div
                                className={`mb-6 text-center text-sm font-medium ${
                                    statusType === 'success'
                                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-400'
                                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400'
                                } rounded-lg border p-3`}
                            >
                                {status}
                            </div>
                        )}

                        {children}
                    </div>
                </div>
            </div>
            <CookieConsentBanner />
        </div>
    );
}
