import { Building2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-br from-[#C9A84C] to-[#1b4332] rounded-lg p-1.5">
        <Building2 className={`${sizeMap[size]} text-white`} />
      </div>
    </div>
  );
}
