"use client";

import { useEffect } from "react";

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="workspace error-screen">
      <div className="error-state">
        <h1>Something went wrong</h1>
        <p>We couldn’t load the CRM page. Please try again or refresh.</p>
        <pre>{error.message}</pre>
      </div>
    </main>
  );
}
