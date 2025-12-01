import { render, screen } from '@testing-library/react';
import { ProgressBadge } from './ProgressBadge';

describe('ProgressBadge', () => {
  it('renders "Not Started" for 0 progress', () => {
    render(<ProgressBadge progress={0} />);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('renders "Completed" for 100 progress', () => {
    render(<ProgressBadge progress={100} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders percentage for in-progress values', () => {
    render(<ProgressBadge progress={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies correct color classes for different progress levels', () => {
    const { rerender } = render(<ProgressBadge progress={0} />);
    expect(screen.getByText('Not Started')).toHaveClass('bg-gray-100', 'text-gray-600');

    rerender(<ProgressBadge progress={25} />);
    expect(screen.getByText('25%')).toHaveClass('bg-red-100', 'text-red-700');

    rerender(<ProgressBadge progress={50} />);
    expect(screen.getByText('50%')).toHaveClass('bg-orange-100', 'text-orange-700');

    rerender(<ProgressBadge progress={75} />);
    expect(screen.getByText('75%')).toHaveClass('bg-yellow-100', 'text-yellow-700');

    rerender(<ProgressBadge progress={90} />);
    expect(screen.getByText('90%')).toHaveClass('bg-blue-100', 'text-blue-700');

    rerender(<ProgressBadge progress={100} />);
    expect(screen.getByText('Completed')).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('has consistent styling classes', () => {
    render(<ProgressBadge progress={50} />);
    const badge = screen.getByText('50%');

    expect(badge).toHaveClass(
      'font-medium',
      'text-xs',
      'px-2',
      'py-1'
    );
  });
});