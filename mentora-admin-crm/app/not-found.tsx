import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="workspace not-found-screen">
      <div className="not-found-state">
        <h1>Page not found</h1>
        <p>The CRM page you requested does not exist.</p>
        <Link href="/" className="btn btn-primary">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
