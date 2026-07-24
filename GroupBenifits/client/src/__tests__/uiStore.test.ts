import { act } from '@testing-library/react';
import { useUiStore } from '../stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // reset store
    act(() => { useUiStore.setState({ searchOpen: false, sidebarOpen: true }); });
  });

  it('openSearch sets searchOpen true', () => {
    act(() => { useUiStore.getState().openSearch(); });
    expect(useUiStore.getState().searchOpen).toBe(true);
  });

  it('closeSearch sets searchOpen false', () => {
    act(() => { useUiStore.getState().openSearch(); useUiStore.getState().closeSearch(); });
    expect(useUiStore.getState().searchOpen).toBe(false);
  });

  it('toggleSidebar flips sidebarOpen', () => {
    act(() => { useUiStore.getState().toggleSidebar(); });
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });
});
