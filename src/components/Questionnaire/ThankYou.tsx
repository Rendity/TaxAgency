// src/components/Questionnaire/ThankYou.tsx

const ThankYou = () => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">Vielen Dank für die Beantwortung der Fragen!</h2>
      <p className="text-xl text-gray-600">Wir haben die Angaben erhalten und Nextcloud eingerichtet. Mit Klick auf "Password vergessen?" kann das Passwort für den Account festgelegt werden.</p>
      <a href="https://nc.abgwt.at/index.php/login">Zur Anmeldung bei Nextcloud der ABG</a>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mobile App herunterladen</h3>
        <div className="flex justify-center gap-4">
          <a
            href="https://apps.apple.com/at/app/nextcloud/id1125420102"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
              alt="Download on the App Store"
              className="h-12"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.nextcloud.client&hl=de_AT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-12"
            />
          </a>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Detaillierte Anleitungen</h4>
          <div className="flex justify-center gap-6">
            <a
              href="/assets/documents/NC_Erste-Schritte-Nextclolud_iOS.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              iOS Anleitung (PDF)
            </a>
            <a
              href="/assets/documents/NC_Erste-Schritte-Nextclolud_Android.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Android Anleitung (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
