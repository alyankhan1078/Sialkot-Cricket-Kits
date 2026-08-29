"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class CheckoutSelectorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred in this field.",
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Checkout Selector Error Caught]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            borderRadius: 8,
            color: "#991b1b",
            fontSize: ".84rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>
              {this.props.fallbackTitle || "We could not load the country list. Please try again."}
            </span>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              background: "#ffffff",
              border: "1px solid #f87171",
              borderRadius: 6,
              color: "#b91c1c",
              fontSize: ".76rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
