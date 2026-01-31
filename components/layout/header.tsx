'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useAuth();

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex-1">
        {/* Page title will be added dynamically by each page */}
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
