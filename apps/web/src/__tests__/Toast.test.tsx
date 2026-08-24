import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/Toast';

const TestComponent = () => {
  const { showToast, success, error, info, warning, dismissToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Oddiy xabar')}>Oddiy</button>
      <button onClick={() => showToast('Muvaffaqiyatli saqlandi!', 'success')}>
        Muvaffaqiyat
      </button>
      <button onClick={() => showToast('Xatolik yuz berdi!', 'error')}>
        Xato
      </button>
      <button onClick={() => showToast('Muhim ogohlantirish!', 'warning')}>
        Ogohlantirish
      </button>
      <button onClick={() => showToast('Maʼlumot xabari', 'info')}>
        Info
      </button>
      <button onClick={() => success('Yangi eʼlon yaratildi!')}>
        Shorthand Success
      </button>
      <button onClick={() => error('Serverda nosozlik!')}>
        Shorthand Error
      </button>
    </div>
  );
};

describe('Toast Notification System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('throws error if useToast is used outside of ToastProvider', () => {
    // Suppress expected console.error in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    consoleSpy.mockRestore();
  });

  it('renders and displays success toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByText('Muvaffaqiyat');
    fireEvent.click(btn);

    expect(screen.getByText('Muvaffaqiyatli saqlandi!')).toBeInTheDocument();
  });

  it('renders different toast types (error, warning, info)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Xato'));
    expect(screen.getByText('Xatolik yuz berdi!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ogohlantirish'));
    expect(screen.getByText('Muhim ogohlantirish!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Info'));
    expect(screen.getByText('Maʼlumot xabari')).toBeInTheDocument();
  });

  it('supports shorthand helper functions', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Shorthand Success'));
    expect(screen.getByText('Yangi eʼlon yaratildi!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Shorthand Error'));
    expect(screen.getByText('Serverda nosozlik!')).toBeInTheDocument();
  });

  it('auto-dismisses toast after duration (default 3000ms)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Muvaffaqiyat'));
    expect(screen.getByText('Muvaffaqiyatli saqlandi!')).toBeInTheDocument();

    // Advance 3000ms (dismiss triggered) + 300ms (exit animation)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Muvaffaqiyatli saqlandi!')).not.toBeInTheDocument();
  });

  it('dismisses toast when dismiss X button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Muvaffaqiyat'));
    expect(screen.getByText('Muvaffaqiyatli saqlandi!')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Yopish' });
    fireEvent.click(closeBtn);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Muvaffaqiyatli saqlandi!')).not.toBeInTheDocument();
  });

  it('stacks multiple toasts simultaneously', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Muvaffaqiyat'));
    fireEvent.click(screen.getByText('Xato'));
    fireEvent.click(screen.getByText('Ogohlantirish'));

    expect(screen.getByText('Muvaffaqiyatli saqlandi!')).toBeInTheDocument();
    expect(screen.getByText('Xatolik yuz berdi!')).toBeInTheDocument();
    expect(screen.getByText('Muhim ogohlantirish!')).toBeInTheDocument();
  });
});
