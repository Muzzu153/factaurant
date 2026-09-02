import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // What to show if it crashes (e.g. "Cart unavailable")
  name?: string; // For logging
}

interface State {
  hasError: boolean;
}

export class FeatureBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🔍 LOGGING: In production, send this to Sentry/PostHog
    console.error(`💥 Feature [${this.props.name}] crashed:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If a fallback is provided, show it. Otherwise, show nothing (invisible failure).
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}