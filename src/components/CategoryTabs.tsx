import React from "react";
import type { Category, Lang } from "../types";

interface CategoryTabsProps {
  categories: Category[];
  currentCategory: Category["key"] | null;
  onCategoryChange: (category: Category["key"]) => void;
  language: Lang;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  currentCategory,
  onCategoryChange,
  language,
}) => {
  return (
    <div className="w-full mb-lg">
      {/* Category tabs - always visible */}
      <div className="flex flex-wrap justify-center gap-sm border-b border-border pb-md">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={`
              flex flex-col items-center px-sm py-sm font-semibold text-xs border-b-2 transition-colors bg-white
              ${
                currentCategory === category.key
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text hover:border-border"
              }
            `}
            style={{ minHeight: "90px", minWidth: "120px" }}
          >
            {category.categoryImage && (
              <img
                src={category.categoryImage}
                alt={category.label[language]}
                className="w-12 h-12 object-contain mb-xs rounded"
              />
            )}
            <span className="text-center text-sm leading-tight font-semibold">
              {category.label[language]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
