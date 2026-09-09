import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-green-50/60 text-green-800 py-4 border-t border-green-200 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
       {/*logo */}
        <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="NGTC Logo" width={24} height={24} className="w-12 h-12 object-contain" />
          
          <span className="text-lg font-bold tracking-wide text-green-900">NGTC</span>
        </div>

        <div>
          <Link 
            href="/reviews" 
            className="group inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-650 transition-colors"
          >
            <span>شاركنا برأيك أو اترك تقييمك الآن</span>
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </Link>
        </div>

        <div className="text-xs text-green-700/80 font-medium">
          جميع الحقوق محفوظة &copy; 2026 NGTC
        </div>

      </div>
    </footer>
  );
}