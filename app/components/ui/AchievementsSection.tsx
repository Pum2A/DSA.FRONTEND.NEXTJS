import { useNotifications } from "@/app/hooks/useNotifications";
import { Award } from "lucide-react";

export default function AchievementsSection() {
  const { notifications, isLoading } = useNotifications();
  // Unikalne osiągnięcia po message
  const achievements = notifications
    .filter((n) => n.type === "achievement")
    .reduce<{ message: string; createdAt: string }[]>((acc, curr) => {
      if (!acc.some((a) => a.message === curr.message)) {
        acc.push({ message: curr.message, createdAt: curr.createdAt });
      }
      return acc;
    }, []);

  if (isLoading) {
    return <div className="p-4 text-gray-500">Ładowanie osiągnięć...</div>;
  }

  if (!achievements.length) {
    return (
      <div className="p-4 text-gray-400">
        Brak osiągnięć. Zdobywaj nowe osiągnięcia realizując lekcje, quizy i
        streaki!
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-2 text-base font-semibold text-yellow-700">
        <Award className="h-5 w-5 text-yellow-500" />
        Twoje osiągnięcia
      </div>
      <div className="space-y-2">
        {achievements.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
          >
            <Award className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="font-medium">{a.message}</div>
              <div className="text-xs text-gray-500">
                {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
