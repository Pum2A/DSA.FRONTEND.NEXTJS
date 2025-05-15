import { EmptyModuleMessageProps } from "../types";

export default function EmptyModuleMessage({
  icon,
  title,
  subtitle,
}: EmptyModuleMessageProps) {
  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
      {icon}
      <p className="mt-3 text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        {subtitle}
      </p>
    </div>
  );
}
