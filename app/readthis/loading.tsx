import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReadThisLoading() {
  return (
    <div className="readthis-container">
      <Header activePage="readthis" />
      <div className="readthis-content">
        <section className="readthis-hero">
          <div className="skeleton" style={{ width: 180, height: 14, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "80%", height: 32, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "60%", height: 16, marginBottom: 24 }} />
          <div className="readthis-metrics">
            {[1, 2, 3].map((i) => (
              <div key={i} className="readthis-metric">
                <div className="skeleton" style={{ width: 60, height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 40, height: 24 }} />
              </div>
            ))}
          </div>
        </section>
        <div className="article-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: "70%", height: 18, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: "100%", height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "40%", height: 12 }} />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
