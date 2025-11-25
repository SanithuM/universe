import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                U
              </div>
              <span className="text-xl font-bold tracking-tight">UniVerse</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
              The all-in-one workspace designed to help students organize their academic life, prioritize tasks, and achieve their goals.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                  <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn title="Product" links={["Features", "Priority Engine", "Integrations", "Changelog", "Docs"]} />
          <FooterColumn title="Resources" links={["Community", "Help Center", "Blog", "Student Discount", "Templates"]} />
          <FooterColumn title="Company" links={["About Us", "Careers", "Legal", "Privacy Policy", "Contact"]} />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2025 UniVerse Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-bold text-white mb-6">{title}</h4>
      <ul className="space-y-4">
        {links.map((link, i) => (
          <li key={i}>
            <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
