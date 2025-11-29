import { renderHook } from '@testing-library/react';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

// Mock react-router-dom
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
}));

describe('useBreadcrumbs hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return no breadcrumbs for home page', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([]);
  });

  it('should return breadcrumbs for dashboard', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/dashboard',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard' },
    ]);
  });

  it('should return breadcrumbs for courses page', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/courses',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'All Courses' },
    ]);
  });

  it('should return breadcrumbs for student-courses page', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/student-courses',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Courses' },
    ]);
  });

  it('should return breadcrumbs for course details', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/course/details/123',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Courses', href: '/course' },
      { label: 'Course Details' },
    ]);
  });

  it('should return breadcrumbs for settings', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/settings',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' },
    ]);
  });

  it('should handle custom overrides', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/settings',
    });

    const { result } = renderHook(() =>
      useBreadcrumbs({
        settings: 'Custom Settings',
      })
    );

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Custom Settings' },
    ]);
  });

  it('should hide segments with overrides', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/settings',
    });

    const { result } = renderHook(() =>
      useBreadcrumbs({
        hide: ['dashboard'],
      })
    );

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Settings' },
    ]);
  });

  it('should handle other nested routes', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/settings/profile',
    });

    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' },
      { label: 'Profile' },
    ]);
  });
});