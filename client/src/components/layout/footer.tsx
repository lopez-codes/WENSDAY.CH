import { SiX, SiLinkedin, SiGithub } from "react-icons/si";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-lopez-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold">wensday.ch</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Swiss AI chat platform for professional research and independent analysis.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Powered by</span>
              <span className="text-lopez-green font-semibold">lopez.codes</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-lopez-green transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-lopez-green transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-lopez-green transition-colors">API Access</a></li>
              <li><a href="#" className="hover:text-lopez-green transition-colors">Multiverse</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-lopez-green transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-lopez-green transition-colors">Kontakt</Link></li>
              <li><a href="#partners" className="hover:text-lopez-green transition-colors">Partners</a></li>
              <li><Link href="/contact" className="hover:text-lopez-green transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-lopez-green transition-colors">Documentation</Link></li>
              <li><Link href="/contact" className="hover:text-lopez-green transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-lopez-green transition-colors">Datenschutz</Link></li>
              <li><Link href="/terms" className="hover:text-lopez-green transition-colors">AGB</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 wensday.ch. All rights reserved. Made in Switzerland 🇨🇭
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Follow us:</span>
            <a href="#" className="text-gray-400 hover:text-lopez-green transition-colors">
              <SiX className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-lopez-green transition-colors">
              <SiLinkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-lopez-green transition-colors">
              <SiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
