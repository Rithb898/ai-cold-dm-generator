import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: import.meta.env.MODE === "development",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <App />
      </PostHogProvider>
      <Toaster position='top-center' reverseOrder={false} />
    </ThemeProvider>
  </StrictMode>
);
