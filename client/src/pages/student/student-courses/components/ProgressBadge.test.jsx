import { render, screen } from '@testing-library/react';
import { ProgressBadge } from './ProgressBadge';

describe('ProgressBadge', () => {
  const defaultProps = {
    totalLectures: 10,
    completedLectures: 7,
    isCompleted: false,
  };

  it('renders progress percentage correctly', () => {
    render(<ProgressBadge {...defaultProps} />);
    expect(screen.getByText('70% Complete')).toBeInTheDocument();
  });

  it('shows completed status when course is completed', () => {
    render(<ProgressBadge {...defaultProps} isCompleted={true} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays lecture count correctly', () => {
    render(<ProgressBadge {...defaultProps} />);
    expect(screen.getByText('7/10 lectures')).toBeInTheDocument();
  });

  it('shows progress bar for incomplete courses', () => {
    render(<ProgressBadge {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
  });

  it('does not show progress bar for completed courses', () => {
    render(<ProgressBadge {...defaultProps} isCompleted={true} />);
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('handles zero total lectures', () => {
    render(<ProgressBadge totalLectures={0} completedLectures={0} isCompleted={false} />);
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  it('handles 100% completion', () => {
    render(<ProgressBadge totalLectures={10} completedLectures={10} isCompleted={false} />);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<ProgressBadge {...defaultProps} size="small" />);
    expect(screen.getByText('70% Complete').closest('div')).toHaveClass('px-2 py-1');

    rerender(<ProgressBadge {...defaultProps} size="large" />);
    expect(screen.getByText('70% Complete').closest('div')).toHaveClass('px-4 py-2');
  });
});