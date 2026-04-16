import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "SafeSan Login": "SafeSan Login",
      "Create your account": "Create your account",
      "Access your workspace": "Access your workspace",
      "Enter admin credentials": "Enter admin credentials",
      "Sign up to report sanitation issues": "Sign up to report sanitation issues",
      "Sign in to your user account": "Sign in to your user account",
      "Email": "Email",
      "Password": "Password",
      "Role": "Role",
      "User": "User",
      "Admin": "Admin",
      "Sign up": "Sign up",
      "Sign in": "Sign in",
      "Already have an account? Sign in": "Already have an account? Sign in",
      "Don't have an account? Sign up": "Don't have an account? Sign up"
    }
  },
  hi: {
    translation: {
      "SafeSan Login": "सेफसैन लॉगिन",
      "Create your account": "अपना खाता बनाएं",
      "Access your workspace": "अपने कार्यक्षेत्र तक पहुंचें",
      "Enter admin credentials": "एडमिन क्रेडेंशियल दर्ज करें",
      "Sign up to report sanitation issues": "स्वच्छता मुद्दों की रिपोर्ट करने के लिए साइन अप करें",
      "Sign in to your user account": "अपने उपयोगकर्ता खाते में साइन इन करें",
      "Email": "ईमेल पता",
      "Password": "पासवर्ड",
      "Role": "भूमिका",
      "User": "उपयोगकर्ता",
      "Admin": "एडमिन",
      "Sign up": "साइन अप करें",
      "Sign in": "साइन इन करें",
      "Already have an account? Sign in": "पहले से खाता है? साइन इन करें",
      "Don't have an account? Sign up": "खाता नहीं है? साइन अप करें"
    }
  },
  ta: {
    translation: {
      "SafeSan Login": "சேஃப்சான் உள்நுழைவு",
      "Create your account": "உங்கள் கணக்கை உருவாக்கவும்",
      "Access your workspace": "உங்கள் பணியிடத்தை அணுகவும்",
      "Enter admin credentials": "நிர்வாகி சான்றுகளை உள்ளிடவும்",
      "Sign up to report sanitation issues": "சுகாதாரப் பிரச்சினைகளைப் புகாரளிக்க பதிவு செய்யவும்",
      "Sign in to your user account": "உங்கள் பயனர் கணக்கில் உள்நுழையவும்",
      "Email": "மின்னஞ்சல்",
      "Password": "கடவுச்சொல்",
      "Role": "பங்கு",
      "User": "பயனர்",
      "Admin": "நிர்வாகி",
      "Sign up": "பதிவு செய்",
      "Sign in": "உள்நுழைய",
      "Already have an account? Sign in": "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைய",
      "Don't have an account? Sign up": "கணக்கு இல்லையா? பதிவு செய்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
