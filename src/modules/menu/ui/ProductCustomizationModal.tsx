// src/modules/menu/ui/ProductCustomizationModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { cartService, type CartItem } from '../../cart/cart.store';
import { DietaryBadge } from './DietaryBadge';
import { img } from '../../../core/utils/image';
import type { products, ModifierGroup, SelectedModifier } from '../../../core/db/schema';

type Product = typeof products.$inferSelect;

interface ProductCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  // Optional line item when editing an existing selection from the cart
  initialItem?: CartItem | null;
  onSaveUpdatedItem?: (oldCartItemId: string, updatedPayload: any) => void;
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);

export function ProductCustomizationModal({
  product,
  isOpen,
  onClose,
  initialItem,
  onSaveUpdatedItem,
}: ProductCustomizationModalProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const modifierGroups = useMemo(() => {
    if (!product || !product.modifierGroups) return [];
    return product.modifierGroups as ModifierGroup[];
  }, [product]);

  // Pre-populate selections when modal opens
  useEffect(() => {
    if (!isOpen || !product) return;

    // Case A: Editing an existing CartItem -> restore customer's previous selections
    if (initialItem && initialItem.selectedModifiers) {
      const restoredSelections: Record<string, string[]> = {};

      modifierGroups.forEach((group) => {
        const matchingModifiers = initialItem.selectedModifiers?.filter(
          (m) => m.groupId === group.id
        );
        restoredSelections[group.id] = matchingModifiers
          ? matchingModifiers.map((m) => m.optionId)
          : [];
      });

      setSelections(restoredSelections);
      setInstructions(initialItem.itemInstructions || '');
      setQuantity(initialItem.quantity || 1);
      return;
    }

    // Case B: Adding fresh item -> select standard defaults
    const defaultSelections: Record<string, string[]> = {};
    modifierGroups.forEach((group) => {
      const defaultOption =
        group.options.find((opt) => opt.isDefault) ||
        (group.minSelection > 0 ? group.options[0] : null);

      if (defaultOption) {
        defaultSelections[group.id] = [defaultOption.id];
      } else {
        defaultSelections[group.id] = [];
      }
    });

    setSelections(defaultSelections);
    setInstructions('');
    setQuantity(1);
  }, [isOpen, product, initialItem, modifierGroups]);

  if (!isOpen || !product) return null;

  const handleRadioSelect = (groupId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  const handleCheckboxToggle = (groupId: string, optionId: string, maxSelection: number) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(optionId);

      if (exists) {
        return {
          ...prev,
          [groupId]: current.filter((id) => id !== optionId),
        };
      }

      if (current.length >= maxSelection) {
        return prev;
      }

      return {
        ...prev,
        [groupId]: [...current, optionId],
      };
    });
  };

  const activeSelectedModifiers: SelectedModifier[] = [];
  let modifiersTotalPrice = 0;

  modifierGroups.forEach((group) => {
    const selectedIds = selections[group.id] || [];
    selectedIds.forEach((optId) => {
      const option = group.options.find((o) => o.id === optId);
      if (option) {
        activeSelectedModifiers.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          price: option.price,
        });
        modifiersTotalPrice += option.price;
      }
    });
  });

  const unitPrice = product.price + modifiersTotalPrice;
  const lineTotal = unitPrice * quantity;

  const isSelectionValid = modifierGroups.every((group) => {
    const count = (selections[group.id] || []).length;
    return count >= group.minSelection;
  });

  const handleSave = () => {
    if (!isSelectionValid) return;

    const payload = {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      selectedModifiers: activeSelectedModifiers,
      itemInstructions: instructions.trim() || undefined,
      quantity,
    };

    // If editing existing line item, trigger update callback
    if (initialItem && onSaveUpdatedItem) {
      onSaveUpdatedItem(initialItem.cartItemId, payload);
    } else {
      cartService.add(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <DietaryBadge dietaryType={product.dietaryType as any} />
            <h3 className="font-bold text-base text-slate-900 leading-tight truncate">
              {initialItem ? `Edit ${product.name}` : `Customize ${product.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex gap-3 items-center pb-4 border-b border-slate-100">
            {product.imageUrl && (
              <img
                src={img.cartThumb(product.imageUrl)}
                alt={product.name}
                className="h-16 w-16 object-cover rounded-lg border border-slate-200 shrink-0"
              />
            )}
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{product.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                Base Price: {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {modifierGroups.map((group) => {
            const isSingleChoice = group.maxSelection === 1;
            const currentSelected = selections[group.id] || [];

            return (
              <div key={group.id} className="space-y-2.5">
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-1.5">
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      {group.name}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {isSingleChoice
                        ? 'Select 1 option'
                        : `Select up to ${group.maxSelection} options`}
                    </p>
                  </div>
                  {group.minSelection > 0 && currentSelected.length === 0 && (
                    <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isChecked = currentSelected.includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-xs ${
                          isChecked
                            ? 'border-slate-900 bg-slate-900/5 font-semibold text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type={isSingleChoice ? 'radio' : 'checkbox'}
                            name={group.id}
                            checked={isChecked}
                            onChange={() => {
                              if (isSingleChoice) {
                                handleRadioSelect(group.id, option.id);
                              } else {
                                handleCheckboxToggle(group.id, option.id, group.maxSelection);
                              }
                            }}
                            className="accent-slate-900 cursor-pointer"
                          />
                          <span>{option.name}</span>
                        </div>

                        <span className="text-slate-500 font-medium">
                          {option.price > 0 ? `+${formatPrice(option.price)}` : 'Free'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Special Instructions
            </label>
            <textarea
              placeholder="e.g. Extra crispy, less spice, no garlic..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
              rows={2}
              maxLength={200}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Quantity</span>
            <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isSelectionValid}
            className="w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-between px-4 shadow-sm"
          >
            <span>
              {initialItem ? 'Update Cart Item' : isSelectionValid ? 'Add to Order' : 'Complete Required Choices'}
            </span>
            <span>{formatPrice(lineTotal)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}