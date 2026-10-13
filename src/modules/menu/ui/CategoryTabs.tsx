import type { Category } from '../../../core/db/schema';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  vegOnly: boolean;
  onToggleVegOnly: () => void;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  vegOnly,
  onToggleVegOnly,
}: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 mb-8 shadow-xs">
      <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar px-2">
        
        {/* 1. Category Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition whitespace-nowrap cursor-pointer ${
              selectedCategory === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 2. 🟢 Veg Only Toggle Pill */}
        <button
          onClick={onToggleVegOnly}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition whitespace-nowrap cursor-pointer ${
            vegOnly
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="h-3.5 w-3.5 border-2 border-emerald-600 flex items-center justify-center rounded-[2px] bg-white">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </div>
          <span>Veg Only</span>
        </button>

      </div>
    </div>
  );
}