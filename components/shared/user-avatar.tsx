import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";
import { getInitials, cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizeClass = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  }[size];

  return (
    <Avatar className={cn(sizeClass, className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(user.fullName)}
      </AvatarFallback>
    </Avatar>
  );
}
