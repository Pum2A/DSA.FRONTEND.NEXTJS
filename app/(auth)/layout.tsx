
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
      
      {/* Right side - Brand Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="max-w-md text-white space-y-6">
            <h2 className="text-3xl font-bold">Witaj na platformie DSA!</h2>
            <p className="text-brand-100">
              Rozpocznij swoją podróż w świat struktur danych i algorytmów.
              Nasza platforma oferuje interaktywne lekcje, quizy i wizualizacje,
              które ułatwią Ci naukę.
            </p>
            <div className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-brand-50">Interaktywne lekcje</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-brand-50">Śledzenie postępów</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="rounded-full bg-white/20 p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-brand-50">Społeczność uczących się</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-12 text-white/80 text-sm">
          © 2024 DSA Learning Platform
        </div>
      </div>
    </div>
  );
}