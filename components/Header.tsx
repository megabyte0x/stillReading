import Link from "next/link";

interface HeaderProps {
  activePage: "reader" | "readthis";
  showEditTab?: boolean;
}

export default function Header({ activePage, showEditTab }: HeaderProps) {
  return (
    <header id="header">
      <Link href="/" className="logo" style={{ textDecoration: "none" }}>
        <span className="logo-icon">◉</span>
        <span className="logo-text">still</span>
        <span className="logo-sub">Reading</span>
      </Link>
      <nav className="nav-tabs">
        <Link
          href="/"
          className={`tab${activePage === "reader" ? " active" : ""}`}
          id="tab-read"
        >
          Read
        </Link>
        {showEditTab && (
          <button type="button" className="tab" id="tab-edit">
            Edit
          </button>
        )}
        <Link
          href="/readthis"
          className={`tab readthis-tab${activePage === "readthis" ? " active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          you should read this 👇🏻
        </Link>
      </nav>
    </header>
  );
}
