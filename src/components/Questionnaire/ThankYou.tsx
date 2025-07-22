// src/components/Questionnaire/ThankYou.tsx

const ThankYou = () => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">Vielen Dank für die Beantwortung der Fragen!</h2>
      <p className="text-xl text-gray-600">Wir haben die Angaben erhalten und Nextcloud eingerichtet. Mit Klick auf "Password vergessen?" kann das Passwort für den Account festgelegt werden.</p>
      <a href="https://nc.abgwt.at/index.php/login">Zur Anmeldung bei Nextcloud der ABG</a>
    </div>
  );
};

export default ThankYou;
