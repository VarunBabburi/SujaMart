// Put this file at: src/components/Footer.jsx
// Desktop/tablet footer. It is hidden on phones, where the same links live in
// the Profile page (and in the "More help & info" list on each info page).
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { APP_INFO, INFO_LINKS } from "../constants/appInfo";
import { Icon, ICONS } from "./Icon";

function Footer() {
  const pick = (paths) => INFO_LINKS.filter((l) => paths.includes(l.path));

  const columns = [
    { title: "Company", links: pick(["/about", "/contact"]) },
    { title: "Help", links: pick(["/support", "/faqs"]) },
    { title: "Legal", links: pick(["/privacy-policy", "/terms"]) },
  ];

  return (
    <footer className="hidden md:block bg-slate-900 text-slate-300 mt-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-12 grid grid-cols-5 gap-8">
        {/* Brand */}
        <div className="col-span-2 pr-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-white p-0.5 rounded-2xl overflow-hidden">
              <img src={logo} alt={`${APP_INFO.name} logo`} className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="leading-none">
              <p className="text-xl font-black tracking-tight text-white">
                SUJA<span className="text-purple-400">MART</span>
              </p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-purple-300">
                {APP_INFO.tagline}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-sm">
            Fresh groceries and daily essentials, delivered to your door in minutes.
          </p>

          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <Icon d={ICONS.phone} className="h-4 w-4 text-purple-400" />
              <a href={`tel:${APP_INFO.phoneLink}`} className="hover:text-white transition">
                {APP_INFO.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon d={ICONS.mail} className="h-4 w-4 text-purple-400" />
              <a href={`mailto:${APP_INFO.email}`} className="hover:text-white transition">
                {APP_INFO.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon d={ICONS.pin} className="h-4 w-4 text-purple-400" />
              <span>{APP_INFO.address}</span>
            </li>
          </ul>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm font-medium text-slate-400 hover:text-white transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>
              © {new Date().getFullYear()} {APP_INFO.name}. Owned &amp; operated by {APP_INFO.owner}. All rights reserved.
          </p>
          <p>Support hours: {APP_INFO.hours}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;