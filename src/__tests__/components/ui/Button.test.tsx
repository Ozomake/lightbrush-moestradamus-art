import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import Button from '../../../components/ui/Button';

// Mock framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: vi.fn(({ children, ...props }) => (
      <button {...props}>{children}</button>
    )),
    div: vi.fn(({ children, ...props }) => (
      <div {...props}>{children}</div>
    )),
  },
  HTMLMotionProps: {},
}));

describe('Button', () => {
  test('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  test('renders with custom className', () => {
    render(<Button className="custom-class">Test</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  describe('Variants', () => {
    test('renders primary variant by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('from-blue-500');
      expect(button.className).toContain('to-purple-600');
    });

    test('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('from-purple-500');
      expect(button.className).toContain('to-pink-600');
    });

    test('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('text-gray-300');
    });

    test('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border-blue-500/50');
    });
  });

  describe('Sizes', () => {
    test('renders medium size by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('py-3');
      expect(button.className).toContain('text-base');
    });

    test('renders small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('py-2');
      expect(button.className).toContain('text-sm');
    });

    test('renders large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-8');
      expect(button.className).toContain('py-4');
      expect(button.className).toContain('text-lg');
    });

    test('renders extra large size', () => {
      render(<Button size="xl">Extra Large</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-10');
      expect(button.className).toContain('py-5');
      expect(button.className).toContain('text-xl');
    });
  });

  describe('States', () => {
    test('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });

    test('renders loading state', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });

    test('renders loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);

      // The loading spinner should be present as a div with border styles
      const loadingSpinner = screen.getByRole('button').querySelector('div[class*="border-2"]');
      expect(loadingSpinner).toBeInTheDocument();
    });

    test('renders glow effect when glow prop is true', () => {
      render(<Button glow>Glowing</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('shadow-2xl');
    });
  });

  describe('Interactions', () => {
    test('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button with ref</Button>);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('supports custom aria-label', () => {
      render(<Button aria-label="Custom button label">Icon only</Button>);

      const button = screen.getByRole('button', { name: /custom button label/i });
      expect(button).toBeInTheDocument();
    });

    test('supports custom type attribute', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('is focusable with keyboard navigation', () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  describe('Custom content', () => {
    test('renders JSX children correctly', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    test('renders text content correctly', () => {
      const buttonText = 'Simple text button';
      render(<Button>{buttonText}</Button>);

      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
  });
});