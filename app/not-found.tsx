import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><p className="eyebrow dark">404</p><h1>Page not found.</h1><p>The page or product may have moved. Return to the current equipment catalogue.</p><Link className="button primary" href="/shop">Open shop</Link></main>;
}

