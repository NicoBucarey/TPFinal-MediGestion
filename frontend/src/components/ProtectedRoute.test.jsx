import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const renderWithRoutes = (protectedElement, initialPath = '/private') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Página Login</div>} />
        <Route path="/" element={<div>Página Home</div>} />
        <Route path="/private" element={protectedElement} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige a login si no está autenticado', async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    renderWithRoutes(
      <ProtectedRoute>
        <div>Contenido privado</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Página Login')).toBeInTheDocument();
  });

  it('redirige a home si el rol no está permitido', async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'paciente' },
    });

    renderWithRoutes(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Contenido admin</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Página Home')).toBeInTheDocument();
  });

  it('renderiza children cuando está autenticado y rol permitido', async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'admin' },
    });

    renderWithRoutes(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Contenido admin</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Contenido admin')).toBeInTheDocument();
  });
});
