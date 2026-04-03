import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado. Podés recargar la página para intentar nuevamente.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-[#00796B] text-white hover:bg-[#00796B]/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
