import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickFilterChips } from '../features/search/QuickFilterChips';
import { useAppStore } from '../store/useAppStore';
import { TransactionType } from '@uytop/shared-types';

describe('QuickFilterChips Component', () => {
  beforeEach(() => {
    useAppStore.getState().resetFilters();
    useAppStore.getState().setLanguage('uz');
  });

  it('renders all preset chips with Uzbek text by default', () => {
    render(<QuickFilterChips />);

    expect(screen.getByText('🔥 Eng arzon')).toBeInTheDocument();
    expect(screen.getByText('🏠 Chilonzorda')).toBeInTheDocument();
    expect(screen.getByText('🚇 Metroga yaqin')).toBeInTheDocument();
    expect(screen.getByText("💎 Yangi ta'mir")).toBeInTheDocument();
    expect(screen.getByText('🏢 Yunusobodda')).toBeInTheDocument();
    expect(screen.getByText('💰 3 mln gacha')).toBeInTheDocument();
    expect(screen.getByText('🛋️ Mebelli 2 xona')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Sotuvga')).toBeInTheDocument();
    expect(screen.getByText('📅 Kunlik ijara')).toBeInTheDocument();
  });

  it('renders Russian text when language is ru', () => {
    useAppStore.getState().setLanguage('ru');
    render(<QuickFilterChips />);

    expect(screen.getByText('🔥 Самые дешевые')).toBeInTheDocument();
    expect(screen.getByText('🏠 На Чиланзаре')).toBeInTheDocument();
    expect(screen.getByText('🚇 Рядом с метро')).toBeInTheDocument();
    expect(screen.getByText('💎 С ремонтом')).toBeInTheDocument();
    expect(screen.getByText('🏢 На Юнусабаде')).toBeInTheDocument();
    expect(screen.getByText('💰 До 3 млн')).toBeInTheDocument();
    expect(screen.getByText('🛋️ 2-комн. с мебелью')).toBeInTheDocument();
    expect(screen.getByText('🏷️ На продажу')).toBeInTheDocument();
    expect(screen.getByText('📅 Посуточно')).toBeInTheDocument();
  });

  it('applies filters when "🔥 Eng arzon" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🔥 Eng arzon');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.sortBy).toBe('price_asc');
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "🏠 Chilonzorda" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🏠 Chilonzorda');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.district).toBe('Chilonzor');
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "🚇 Metroga yaqin" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🚇 Metroga yaqin');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.nearMetro).toBe(true);
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "💎 Yangi ta\'mir" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText("💎 Yangi ta'mir");
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.furnished).toBe(true);
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "🏢 Yunusobodda" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🏢 Yunusobodda');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.district).toBe('Yunusobod');
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "💰 3 mln gacha" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('💰 3 mln gacha');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.maxPrice).toBe(3000000);
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "🛋️ Mebelli 2 xona" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🛋️ Mebelli 2 xona');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.rooms).toEqual([2]);
    expect(filters.furnished).toBe(true);
    expect(filters.transactionType).toBe(TransactionType.RENT);
  });

  it('applies filters when "🏷️ Sotuvga" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🏷️ Sotuvga');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.transactionType).toBe(TransactionType.SALE);
  });

  it('applies filters when "📅 Kunlik ijara" chip is clicked', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('📅 Kunlik ijara');
    fireEvent.click(chip);

    const { filters } = useAppStore.getState();
    expect(filters.transactionType).toBe(TransactionType.DAILY);
  });

  it('toggles off active preset and resets filters when clicked again', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🏷️ Sotuvga');
    // First click: activate SALE
    fireEvent.click(chip);
    expect(useAppStore.getState().filters.transactionType).toBe(TransactionType.SALE);

    // Second click: toggle off (resets to default filters)
    fireEvent.click(chip);
    expect(useAppStore.getState().filters.transactionType).toBe(TransactionType.RENT);
  });

  it('highlights the active chip with brand styles', () => {
    render(<QuickFilterChips />);

    const chip = screen.getByText('🏷️ Sotuvga');
    expect(chip.className).toContain('bg-white');

    fireEvent.click(chip);
    expect(chip.className).toContain('bg-brand-600');
    expect(chip.className).toContain('text-white');
  });
});
