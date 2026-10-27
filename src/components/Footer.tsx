import Link from "next/link";
export default function Footer() {
  return (
    <footer className="foot set3">
      <Link href="/" className="logo">SportsFB</Link>
      <div className="cols">
        <div><Link href="/play">Find a pitch</Link><Link href="/bookings">My bookings</Link></div>
        <div><Link href="/owner">Owner dashboard</Link><Link href="/#owners">List your facility</Link></div>
        <div><Link href="/legal/privacy">Privacy policy</Link><Link href="/legal/terms">Terms of use</Link></div>
      </div>
      <small>© {new Date().getFullYear()} SportsFB</small>
    </footer>
  );
}
