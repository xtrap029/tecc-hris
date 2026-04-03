import { router, useForm, usePage } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import AuthButton from '@/components/auth/auth-button';
import InputError from '@/components/input-error';
import Recaptcha from '@/components/recaptcha';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from 'react-i18next';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    recaptcha_token?: string;
};

interface Business {
    id: number;
    name: string;
    slug: string;
    business_type: string;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    demoBusinesses?: Business[];
}

export default function Login({ status, canResetPassword, demoBusinesses = [] }: LoginProps) {
    const { t } = useTranslation();
    const [recaptchaToken, setRecaptchaToken] = useState<string>('');
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const { props } = usePage();
    const isSaas = (props as any).globalSettings?.is_saas;
    const isDemo = (props as any).globalSettings?.is_demo;

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        // Set default credentials if in demo mode
        if (isDemo) {
            setData({
                email: isSaas ? 'company@example.com' : 'company@example.com',
                password: 'password',
                remember: false,
            });
        }
    }, [isDemo]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const formData = { ...data, recaptcha_token: recaptchaToken };
        post(route('login'), formData, {
            onFinish: () => reset('password'),
        });
    };

    // No longer needed as we're using router.post directly in the button handlers

    const openBusinessInNewTab = (businessId: number, slug: string, e: React.MouseEvent) => {
        // Prevent the default form submission
        e.preventDefault();
        e.stopPropagation();

        // Use the same URL structure as in vcard-builder/index.tsx
        const url = route('public.vcard.show.direct', slug);
        window.open(url, '_blank');
    };

    return (
        <AuthLayout title={t('LOG IN TO YOUR ACCOUNT')} status={status}>
            <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="relative">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Enter your work email address"
                                className="w-full rounded-lg border-gray-300 bg-white pl-10 transition-all duration-200 dark:border-gray-600 dark:bg-gray-700"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                className="w-full rounded-lg border-gray-300 bg-white pl-10 transition-all duration-200 dark:border-gray-600 dark:bg-gray-700"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="rounded border-gray-300"
                                style={{ '--tw-ring-color': primaryColor, color: primaryColor } as React.CSSProperties}
                            />
                            <Label htmlFor="remember" className="ml-2 text-gray-600 dark:text-gray-400">
                                {t('Remember me')}
                            </Label>
                        </div>
                        {canResetPassword && (
                            <TextLink
                                href={route('password.request')}
                                className="text-sm transition-colors duration-200"
                                style={{ color: primaryColor }}
                                tabIndex={5}
                            >
                                {t('Forgot password?')}
                            </TextLink>
                        )}
                    </div>
                </div>

                <Recaptcha onVerify={setRecaptchaToken} onExpired={() => setRecaptchaToken('')} onError={() => setRecaptchaToken('')} />

                <AuthButton tabIndex={4} processing={processing} style={{ backgroundColor: '#132952' }}>
                    {t('LOGIN')}
                </AuthButton>

                {isDemo && (
                    <div className="mt-6">
                        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
                            <h3 className="mb-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Demo Quick Access</h3>

                            {isSaas ? (
                                // SaaS Demo Buttons
                                <div className="flex flex-col space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'superadmin@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login as Super Admin
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'company@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login as Company
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'maggie93@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login As HR
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'qwaters@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login As Employee
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // Non-SaaS Demo Buttons
                                <div className="flex flex-col space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'company@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login as Company
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'hr@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login As HR
                                        </Button>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                router.post(route('login'), {
                                                    email: 'employee@example.com',
                                                    password: 'password',
                                                    remember: false,
                                                    recaptcha_token: recaptchaToken,
                                                });
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-xs font-medium text-white transition-all duration-200 sm:flex-1 sm:text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Login As Employee
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isSaas && (
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t("Don't have an account?")}{' '}
                        <TextLink
                            href={route('register')}
                            className="font-medium transition-colors duration-200"
                            style={{ color: primaryColor }}
                            tabIndex={6}
                        >
                            {t('Sign up')}
                        </TextLink>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
}
