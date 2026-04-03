import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const { t } = useTranslation();
    const cleanup = useMobileNavigation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        cleanup();
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false);
        router.post(route('logout'));
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        {t("Profile")}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
                <LogOut className="mr-2" />
                {t("Log out")}
            </DropdownMenuItem>

            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center text-center gap-3 pt-2">
                        <AlertCircle className="h-20 w-20 text-red-500" />
                        <DialogHeader>
                            <DialogTitle className="text-center">{t("You're about to log out of TECC People.")}</DialogTitle>
                            <DialogDescription className="text-center">{t("Do you want to proceed?")}</DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-center">
                        <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
                            {t("Stay")}
                        </Button>
                        <Button variant="destructive" onClick={handleLogoutConfirm}>
                            {t("Logout")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
