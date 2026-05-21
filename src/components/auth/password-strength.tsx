"use client";

import { getPasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}
