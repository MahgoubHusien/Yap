"use client";
import React from "react";
import { Video, Users } from "lucide-react";

const features = [
  { icon: <Video className="w-10 h-10 text-red-500" />, title: "Instant Video Chat" },
  { icon: <Users className="w-10 h-10 text-red-500" />, title: "Group Sessions" },
];

const FeatureCards = () => {
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md"
        >
          {feature.icon}
          <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
