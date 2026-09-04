import React from "react";
import {
  ShoppingBag,
  Home,
  Building2,
  Plane,
  Package,
  Repeat,
  Utensils,
  Zap,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  Sparkles,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  LucideProps,
} from "lucide-react";
import { ExpenseCategory } from "../types";
import { getCategoryMeta } from "../utils/categories";

interface CategoryIconProps extends LucideProps {
  category: ExpenseCategory;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  const meta = getCategoryMeta(category);

  switch (meta.iconName) {
    case "ShoppingBag":
      return <ShoppingBag {...props} />;
    case "Home":
      return <Home {...props} />;
    case "Building2":
      return <Building2 {...props} />;
    case "Plane":
      return <Plane {...props} />;
    case "Package":
      return <Package {...props} />;
    case "Repeat":
      return <Repeat {...props} />;
    case "Utensils":
      return <Utensils {...props} />;
    case "Zap":
      return <Zap {...props} />;
    case "Car":
      return <Car {...props} />;
    case "Film":
      return <Film {...props} />;
    case "HeartPulse":
      return <HeartPulse {...props} />;
    case "GraduationCap":
      return <GraduationCap {...props} />;
    case "Sparkles":
      return <Sparkles {...props} />;
    case "TrendingUp":
      return <TrendingUp {...props} />;
    case "DollarSign":
      return <DollarSign {...props} />;
    default:
      return <MoreHorizontal {...props} />;
  }
};
