import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AetherMine crashed while rendering", error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-[#0D121F] border border-[#FF3D00]/40 rounded-xl p-6 shadow-2xl">
          <div className="text-[10px] font-mono text-[#FF3D00] tracking-widest uppercase font-bold mb-2">
            Telemetry fault
          </div>
          <h1 className="text-lg font-bold text-white mb-2">
            The control room failed to render
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            A component threw while drawing the isometric stack. Reload the console to
            rebuild the scene from the last saved state.
          </p>
          <pre className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800 rounded p-3 overflow-auto mb-4">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.handleReload}
            className="bg-[#00D4FF]/15 hover:bg-[#00D4FF]/30 text-[#00D4FF] border border-[#00D4FF]/40 font-mono font-bold text-xs py-2 px-4 rounded transition duration-150"
          >
            Reload console
          </button>
        </div>
      </div>
    );
  }
}
