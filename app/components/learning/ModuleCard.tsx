import { Module } from "@/app/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link href={`/learning/${module.externalId}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <div
          className="h-24 flex items-center justify-center"
          style={{ backgroundColor: module.iconColor }}
        >
          <span className="text-4xl text-white">{module.icon}</span>
        </div>
        <CardContent className="flex flex-col h-full p-4">
          {" "}
          {/* Adjusted padding */}
          <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
            {module.description}
          </p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{module.lessons?.length || 0} lekcji</span>
            <span className="flex items-center">
              Przejdź
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
