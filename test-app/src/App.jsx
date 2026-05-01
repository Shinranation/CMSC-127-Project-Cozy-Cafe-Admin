import React, { useState } from 'react'

function App() {
  const [activeCategory, setActiveCategory] = useState("RICE BOWL CHICKEN WINGS");

  const categories = [
    "RICE BOWL CHICKEN WINGS", "FRENCH FRIES", "SOFT DRINKS", 
    "SANDWICHES", "WAFFLES", "OTHERS", "KOREAN RICE BOWLS", "SILOG BOWLS"
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-sans text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white border-b border-cyan-100">
        <h1 className="text-2xl font-bold text-[#5BC0DE]">Cozy Coffee</h1>
        <div className="flex items-center gap-6 text-sm font-bold">
          <a href="#" className="text-[#D98C5F] border-b-2 border-[#D98C5F]">Home</a>
          <a href="#" className="text-[#5BC0DE] hover:opacity-80 transition">Menu</a>
          <a href="#" className="text-[#5BC0DE] hover:opacity-80 transition">About Us</a>
          <div className="w-9 h-9 rounded-full border-2 border-[#5BC0DE] flex items-center justify-center text-[#5BC0DE]">
            👤
          </div>
        </div>
      </nav>

      {/* Main Promotion Container */}
      <main className="max-w-5xl mx-auto my-10 px-4">
        <div className="bg-white border-2 border-[#D98C5F]/30 rounded-[2.5rem] p-10 shadow-sm relative">
          
          <h2 className="text-7xl font-bold text-center text-gray-400/80 mb-12 tracking-tight">Promotions</h2>

          {/* Category List */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 px-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-black w-20 text-center leading-tight tracking-tighter uppercase transition-all
                  ${activeCategory === cat ? 'text-[#D98C5F] underline underline-offset-4' : 'text-gray-600 hover:text-[#D98C5F]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Label Section */}
          <div className="text-center mb-10">
            <div className="w-24 h-[3px] bg-cyan-100 mx-auto mb-4"></div>
            <p className="text-[10px] font-bold text-gray-900 uppercase">Menu</p>
            <h3 className="text-lg font-black text-[#D98C5F] uppercase">{activeCategory}</h3>
          </div>

          {/* Placeholder Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-400 rounded-[1.8rem] border-[3px] border-[#D98C5F]/30 hover:scale-[1.02] transition-transform"
              ></div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="w-full h-32 bg-[#D9C8B1] border-t-2 border-[#BFA888] mt-10"></footer>
    </div>
  )
}

export default App