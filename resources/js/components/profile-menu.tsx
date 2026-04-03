import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, User, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ProfileMenu() {
  const { t } = useTranslation();
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get avatar URL
  const getAvatarUrl = () => {
    // Show uploaded avatar from database
    if (auth?.user?.avatar) {
      return window.storage(auth.user.avatar);
    }
    // Show default avatar
    return window.asset('images/avatar/avatar.png');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    router.post(route('logout'));
  };

  const initials = user?.name
    ? user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
    : 'U';

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8 rounded-md">
          <span className="text-sm font-medium hidden md:inline-block">{user?.name}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl()} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={route('profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>{t("Profile")}</span>
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("Log out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

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