import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import { LanguageProvider } from '@/context/LanguageContext';
import { ViewProvider } from '@/map/ViewProvider';
import { PassportProvider } from '@/passport/PassportProvider';

/**
 * Renders inside the providers with Map mode available. jsdom has no 2D canvas,
 * so the provider's canvas probe is given a context; a test that wants Reading
 * mode simply renders without this helper. Restore mocks in `afterEach`.
 */
export function renderInMap(ui: ReactElement, hash = '') {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never);
  localStorage.clear();
  window.history.replaceState(null, '', `/${hash}`);
  return render(
    <LanguageProvider>
      <PassportProvider>
        <ViewProvider>{ui}</ViewProvider>
      </PassportProvider>
    </LanguageProvider>,
  );
}
