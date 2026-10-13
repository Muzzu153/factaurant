interface DietaryBadgeProps {
  dietaryType: 'veg' | 'non_veg' | 'contains_egg' | 'vegan';
  showLabel?: boolean;
}

export function DietaryBadge({ dietaryType, showLabel = false }: DietaryBadgeProps) {
  switch (dietaryType) {
    case 'veg':
    case 'vegan':
      return (
        <div className="flex items-center gap-1.5" title={dietaryType === 'vegan' ? 'Vegan' : 'Vegetarian'}>
          <div className="h-4 w-4 border-2 border-emerald-600 flex items-center justify-center rounded-[3px] bg-white p-[1px]">
            <div className="h-2 w-2 rounded-full bg-emerald-600" />
          </div>
          {showLabel && (
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {dietaryType === 'vegan' ? 'Vegan' : 'Veg'}
            </span>
          )}
        </div>
      );

    case 'non_veg':
      return (
        <div className="flex items-center gap-1.5" title="Non-Vegetarian">
          <div className="h-4 w-4 border-2 border-red-700 flex items-center justify-center rounded-[3px] bg-white p-[1px]">
            <div className="h-2 w-2 rounded-full bg-red-700" />
          </div>
          {showLabel && (
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Non-Veg
            </span>
          )}
        </div>
      );

    case 'contains_egg':
      return (
        <div className="flex items-center gap-1.5" title="Contains Egg">
          <div className="h-4 w-4 border-2 border-amber-600 flex items-center justify-center rounded-[3px] bg-white p-[1px]">
            <div className="h-2 w-2 rounded-full bg-amber-600" />
          </div>
          {showLabel && (
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Egg
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
}