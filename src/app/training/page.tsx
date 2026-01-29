import { Metadata } from "next";
import {
  workforceSpecialists,
  courseCategories,
  getTotalCourseCount,
} from "@/data/training";
import { TrainingPageClient } from "@/components/sections/training-page-client";

export const metadata: Metadata = {
  title: "Safety Training",
  description:
    "Wide-ranging workplace safety training and certification for the energy industry — OSHA, H2S, SafeLand, confined space, fall protection, HAZMAT, and more.",
};

export default function TrainingPage() {
  return (
    <TrainingPageClient
      specialists={workforceSpecialists}
      categories={courseCategories}
      totalCourses={getTotalCourseCount()}
    />
  );
}
