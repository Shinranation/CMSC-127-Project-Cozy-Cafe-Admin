import React, { useMemo, useState } from "react";
import noImage from "./assets/no-image.svg";

export default function Customer() {
  const categories = useMemo(
    () => [
      "All",
      "Rice Bowl Chicken Wings",
      "French Fries",
      "Others",
      "Waffles",
      "Soft Drinks",
      "Korean Rice Bowls",
      "Sandwiches",
      "Silog Bowls",
    ],
    []
  );

  const itemsFromDb = useMemo(
    () => [
      {
        id: "item-1",
        name: "Sample Item",
        category: "All",
        imageUrl: "",
        price: null,
      },
    ],
    []
  );

  const [activeCategory, setActiveCategory] = useState("All");

  const visibleItems = useMemo(() => {
    if (activeCategory === "All") return itemsFromDb;
    return itemsFromDb.filter((item) => item.category === activeCategory);
  }, [activeCategory, itemsFromDb]);

  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#3B2F2A]">
      <header className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-10 py-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#5BC0DE]">
            Cozy Coffee
          </h1>

          <nav className="flex items-center gap-10 text-lg font-semibold">
            <a
              href="#"
              className="text-[#D98C5F] underline decoration-[#D98C5F] underline-offset-4"
            >
              Home
            </a>
            <a href="#" className="text-[#5BC0DE] hover:opacity-80">
              Menu
            </a>
            <a href="#" className="text-[#5BC0DE] hover:opacity-80">
              About Us
            </a>

            <button
              type="button"
              aria-label="Profile"
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-black/30 text-black/70"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </button>
          </nav>
        </div>

        <div className="h-[2px] w-full bg-[#1E96AE]" />
      </header>

      <main className="mx-auto max-w-6xl px-10 pb-16">
        <h2 className="py-28 text-center text-7xl font-extrabold tracking-tight text-gray-500/80">
          Promotions
        </h2>

        <section className="mx-auto max-w-4xl">
          <h3 className="mb-10 text-center text-5xl font-extrabold">Menu</h3>

          <div className="mx-auto mb-12 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "rounded-full border px-7 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-transparent bg-[#3B2F2A] text-white"
                      : "border-black/50 bg-white text-[#3B2F2A] hover:bg-black/5",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                // reduced padding + made card height shrink to content
                className="rounded-[28px] border-2 border-[#D98C5F] bg-white p-5"
              >
                {/* Image (force inner box to WHITE) */}
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-black/40 bg-white">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    // Empty image placeholder (still white)
                    <div className="flex h-full w-full items-center justify-center bg-white">
                        <img
                        src={noImage}
                        alt="No image available"
                        className="h-24 w-24 opacity-60"
                        loading="lazy"
                        />
                    </div>
                  )}
                </div>

                {/* Bigger name + more noticeable price */}
                <div className="mt-4">
                  <p className="text-xl font-extrabold leading-tight text-[#3B2F2A]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#D98C5F]">
                    {item.price != null
                      ? `₱${Number(item.price).toFixed(2)}`
                      : "₱—"}
                  </p>
                </div>

                {/* Removed the big spacer to avoid too much white space */}
              </article>
            ))}
          </div>

          {visibleItems.length === 0 && (
            <p className="mt-10 text-center text-sm text-black/50">
              No items found in this category yet.
            </p>
          )}
        </section>
      </main>

      <footer className="mt-16">
        <div className="h-[2px] w-full bg-[#1E96AE]" />
      </footer>
    </div>
  );
}