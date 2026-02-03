import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'or';

interface Translations {
    [key: string]: {
        en: string;
        hi: string;
        mr?: string;
        kn?: string;
        te?: string;
        or?: string;
    };
}

// All translations for the app (ported from web)
export const translations: Translations = {
    // App name and general
    appName: { hi: 'EVerified', en: 'EVerified' },
    tagline: { hi: 'EV & BS6 वर्कफोर्स के लिए भरोसेमंद प्लेटफॉर्म', en: 'Trusted Platform for EV & BS6 Workforce' },
    selectLanguage: {
        en: 'Select Language',
        hi: 'भाषा चुनें',
        mr: 'भाषा निवडा',
        kn: 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
        te: 'భాషను ఎంచుకోండి',
        or: 'ଭାଷା ଚୟନ କରନ୍ତୁ'
    },
    continue: {
        en: 'Continue',
        hi: 'जारी रखें',
        mr: 'पुढे सुरू ठेवा',
        kn: 'ಮುಂದುವರಿಸಿ',
        te: 'కొనసాగించండి',
        or: 'ଜାରି ରଖନ୍ତୁ'
    },

    // Role selection
    whoAreYou: { hi: 'आप कौन हैं?', en: 'Who are you?', mr: 'तुम्ही कोण आहात?', kn: 'ನೀವು ಯಾರು?', te: 'మీరు ఎవరు?', or: 'ତୁମେ କିଏ?' },
    selectRole: { hi: 'अपनी भूमिका चुनें', en: 'Select your role', mr: 'तुमची भूमिका निवडा', kn: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ', te: 'మీ పాత్రను ఎంచుకోండి', or: 'ଆପଣଙ୍କର ଭୂମିକା ଚୟନ କରନ୍ତୁ' },
    evTechnician: { hi: 'EV तकनीशियन', en: 'EV Technician', mr: 'EV तंत्रज्ञ', kn: 'EV ತಂತ್ರಜ್ಞ', te: 'EV సాంకేతిక నిపుణుడు', or: 'EV ଟେକ୍ନିସିଆନ୍' },
    evTechnicianDesc: { hi: 'इलेक्ट्रिक वाहनों की मरम्मत और रखरखाव', en: 'Repair and maintain electric vehicles', mr: 'इलेक्ट्रिक वाहनांची दुरुस्ती आणि देखभाल', kn: 'ಎಲೆಕ್ಟ್ರಿಕ್ ವಾಹನಗಳ ದುರಸ್ತಿ ಮತ್ತು ನಿರ್ವಹಣೆ', te: 'ఎలక్ట్రిక్ వాహనాల మరమ్మత్తు మరియు నిర్వహణ', or: 'ଇଲେକ୍ଟ୍ରିକ୍ ଯାନଗୁଡିକର ମରାମତି ଏବଂ ରକ୍ଷଣାବେକ୍ଷଣ' },
    evShowroomManager: { hi: 'शोरूम मैनेजर', en: 'Showroom Manager', mr: 'शोरूम व्यवस्थापक', kn: 'ಶೋರೂಮ್ ವ್ಯವಸ್ಥಾಪಕ', te: 'షోరూమ్ మేనేజర్', or: 'ଶୋରୁମ୍ ମ୍ୟାନେଜର୍' },
    evShowroomManagerDesc: { hi: 'शोरूम का प्रबंधन और ग्राहक सेवा', en: 'Showroom management and customer service', mr: 'शोरूम व्यवस्थापन आणि ग्राहक सेवा', kn: 'ಶೋರೂಮ್ ನಿರ್ವಹಣೆ ಮತ್ತು ಗ್ರಾಹಕ ಸೇವೆ', te: 'షోరూమ్ నిర్వహణ మరియు కస్టమర్ సర్వీస్', or: 'ଶୋରୁମ୍ ପରିଚାଳନା ଏବଂ ଗ୍ରାହକ ସେବା' },
    evWorkshopManager: { hi: 'वर्कशॉप मैनेजर', en: 'Workshop Manager', mr: 'कार्यशाळा व्यवस्थापक', kn: 'ಕಾರ್ಯಾಗಾರ ವ್ಯವಸ್ಥಾಪಕ', te: 'వర్క్‌షాప్ మేనేజర్', or: 'ୱର୍କସପ୍ ମ୍ୟାନେଜର୍' },
    evWorkshopManagerDesc: { hi: 'वर्कशॉप का प्रबंधन और टीम नेतृत्व', en: 'Workshop management and team leadership', mr: 'कार्यशाळा व्यवस्थापन आणि टीम नेतृत्व', kn: 'ಕಾರ್ಯಾγಾರ ನಿರ್ವಹಣೆ ಮತ್ತು ತಂಡ ನಾಯಕತ್ವ', te: 'వర్క్‌షాప్ నిర్వహణ మరియు టీమ్ నాయకత్వం', or: 'ୱର୍କସପ୍ ପରିଚାଳନା ଏବଂ ଦଳ ନେତୃତ୍ୱ' },
    evRecruiter: { hi: ' रिक्रूटर', en: 'Recruiter', mr: ' नियोक्ता', kn: ' ನೇಮಕಾತಿದಾರ', te: ' రిక్రూటర్', or: ' ନିଯୁକ୍ତିକର୍ତ୍ତା' },
    evRecruiterDesc: { hi: 'EV & BS6 पेशेवरों की भर्ती करें', en: 'Hire EV & BS6 professionals', mr: 'EV & BS6 व्यावसायिकांची भरती करा', kn: 'EV & BS6 ವೃತ್ತಿಪರರನ್ನು ನೇಮಿಸಿ', te: 'EV & BS6 నిపుణులను నియమించండి', or: 'EV & BS6 ପେଶାଦାରମାନଙ୍କୁ ନିଯୁକ୍ତ କରନ୍ତୁ' },
    showroomManager: { hi: 'शोरूम मैनेजर', en: 'Showroom Manager', mr: 'शोरूम व्यवस्थापक', kn: 'ಶೋರೂಮ್ ವ್ಯವಸ್ಥಾಪಕ', te: 'షోరూమ్ మేనేజర్', or: 'ଶୋରୁମ୍ ମ୍ୟାନେଜର୍' },
    workshopManager: { hi: 'वर्कशॉप मैनेजर', en: 'Workshop Manager', mr: 'कार्यशाळा व्यवस्थापक', kn: 'ಕಾರ್ಯಾಗಾರ ವ್ಯವಸ್ಥಾಪಕ', te: 'వర్క్‌షాప్ మేనేజర్', or: 'ୱର୍କସପ୍ ମ୍ୟାନେଜର୍' },
    recruiter: { hi: 'रिक्रूटर', en: 'Recruiter', mr: ' नियोक्ता', kn: ' ನೇಮಕಾತಿದಾರ', te: ' రిక్రూటర్', or: ' ନିଯୁକ୍ତିକର୍ତ୍ତା' },
    bs6Technician: { hi: 'BS6 तकनीशियन', en: 'BS6 Technician', mr: 'BS6 तंत्रज्ञ', kn: 'BS6 ತಂತ್ರಜ್ಞ', te: 'BS6 సాంకేతిక నిపుణుడు', or: 'BS6 ଟେକ୍ନିସିଆନ୍' },
    bs6TechnicianDesc: { hi: 'BS6 वाहनों का रखरखाव (2W/3W)', en: 'Repair and Maintain of BS6 vehicles (2W/3W)', mr: 'BS6 वाहनांची देखभाल', kn: 'BS6 ವಾಹನಗಳ ನಿರ್ವಹಣೆ', te: 'BS6 వాహనాల నిర్వహణ', or: 'BS6 ଯାନର ରକ୍ଷଣାବେକ୍ଷଣ' },
    evAspirant: { hi: 'EV/BS6 फ्रेशर', en: 'EV/BS6 Fresher', mr: 'EV/BS6 फ्रेशर', kn: 'EV/BS6 ಫ್ರೆಶರ್', te: 'EV/BS6 ఫ్రెషర్', or: 'EV/BS6 ଫ୍ରେଶର୍' },
    evAspirantDesc: { hi: 'EV/BS6 सेक्टर में करियर शुरू करें', en: 'Start career in EV & BS6 sector', mr: 'EV & BS6 क्षेत्रात करिअर सुरू करा', kn: 'EV & BS6 ವಲಯದಲ್ಲಿ ವೃತ್ತಿಜೀವನವನ್ನು ಪ್ರಾರಂಭಿಸಿ', te: 'EV & BS6 రంగంలో కెరీర్ ప్రారంభించండి', or: 'EV & BS6 କ୍ଷେତ୍ରରେ କ୍ୟାରିଅର୍ ଆରମ୍ଭ କରନ୍ତୁ' },
    evInfrastructure: { hi: 'EV इन्फ्रास्ट्रक्चर', en: 'EV Infrastructure', mr: 'EV पायाभूत सुविधा', kn: 'EV ಮೂಲಸೌಕರ್ಯ', te: 'EV మౌలిక ସుబిధా', or: 'EV ଭିତ୍ତିଭୂମି' },
    evInfrastructureDesc: { hi: 'चार्जिंग स्टेशन और इन्फ्रा सेवाएं', en: 'Charging stations & infra services', mr: 'चार्जिंग स्टेशन आणि इन्फ्रा सेवा', kn: 'ಚಾರ್ಜಿಂಗ್ ಕೇಂದ್ರಗಳು ಮತ್ತು ಇನ್ಫ್ರಾ ಸೇವೆಗಳು', te: 'ఛార్జింగ్ స్టేషన్లు మరియు ఇన్ఫ్రా సేవలు', or: 'ଚାର୍ଜିଂ ଷ୍ଟେସନ୍ ଏବଂ ଇନ୍‌ଫ୍ରା ସେବାଗୁଡ଼ିକ' },
    comingSoon: { hi: 'जल्द आ रहा है', en: 'Coming Soon', mr: 'लवकरच येत आहे', kn: 'ಶೀಘ್ರದಲ್ಲಿ ಬರಲಿದೆ', te: 'త్వରలో వస్తోంది', or: 'ଶୀଘ୍ର ଆସୁଛି' },

    // Action selection
    whatToDo: { hi: 'आप क्या करना चाहते हैं?', en: 'What would you like to do?', mr: 'तुम्हाला काय करायचे आहे?', kn: 'ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?', te: 'మీరు ఏమి చేయాలనుకుంటున్నారు?', or: 'ଆପଣ କ\'ଣ କରିବାକୁ ଚାହୁଁଛନ୍ତି?' },
    applyForVerification: { hi: 'वेरिफिकेशन के लिए आवेदन करें', en: 'Apply for Verification', mr: 'पडताळणीसाठी अर्ज करा', kn: 'ಪರಿಶೀಲನೆಗೆ ಅರ್ಜಿಸಿ', te: 'ధృవీకరణ కోసం ଦାଖଲ କରନ୍ତୁ', or: 'ଯାଞ୍ଚ ପାଇଁ ଆବେଦନ କରନ୍ତୁ' },
    applyDesc: { hi: 'नया खाता बनाएं और वेरिफाई हों', en: 'Create new account and get verified', mr: 'नवीन खाते तयार करा आणि पडताळणी करा', kn: 'ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ', te: 'కొత్త ఖాతాను సృష్టించి ಧృవీకరించుకోండి', or: 'ନୂତନ ଖାତା ତିଆରି କରନ୍ତୁ ଏବଂ ଯାଞ୍ଚ ହୁଅନ୍ତୁ' },
    login: { hi: 'लॉगिन करें', en: 'Login', mr: 'लॉगिन करा', kn: 'ಲಾಗಿನ್', te: 'లాగిన్', or: 'ଲଗ୍‌ଇନ୍' },
    loginDesc: { hi: 'पहले से खाता है? लॉगिन करें', en: 'Already have an account? Login', mr: 'आधीच खाते आहे? लॉगिन करा', kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ', te: 'ఇప్పటికే ఖాతା ఉందా? లాగిನ್ అవ్వండి', or: 'ଆଗରୁ ଖାତା ଅଛି? ଲଗ୍‌ଇନ୍ କରନ୍ତୁ' },

    // Form steps
    step: { hi: 'चरण', en: 'Step', mr: 'पायरी', kn: 'ಹಂತ', te: 'దಶ', or: 'ପଦକ୍ଷେପ' },
    basicDetails: { hi: 'बुनियादी जानकारी', en: 'Basic Details', mr: 'मूलभूत माहिती', kn: 'ಮೂಲ ವಿವರಗಳು', te: 'ప్రాథమిక ವಿವರాలు', or: 'ମୂଳଭୂତ ତଥ୍ୟ' },
    professionalDetails: { hi: 'पेशेवर जानकारी', en: 'Professional Details', mr: 'व्यावसायिक माहिती', kn: 'ವೃತ್ತಿಪರ ವಿವರಗಳು', te: 'వృత్తిపరమైన ವಿವರాలు', or: 'ପେଶାଦାର ତଥ୍ୟ' },
    reviewSubmit: { hi: 'समीक्षा और सबमिट', en: 'Review & Submit', mr: 'पुनरावलोकन आणि सबमिट करा', kn: 'ಪರಿಶೀಲನೆ ಮತ್ತು ಸಲ್ಲಿಸಿ', te: 'సమీక్షించండి మరియు సమర్పించండి', or: 'ପର୍ଯାଳୋଚନା ଏବଂ ଦାଖଲ କରନ୍ତୁ' },

    // Basic details form
    fullName: { hi: 'पूरा नाम', en: 'Full Name', mr: 'पूर्ण नाव', kn: 'ಪೂರ್ಣ ಹೆಸರು', te: 'పూర్తి పేరు', or: 'ପୂର୍ଣ୍ଣ ନାମ' },
    phoneNumber: { hi: 'फ़ोन नंबर', en: 'Phone Number', mr: 'फोन नंबर', kn: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ', te: 'ఫోన్ నంబర్', or: 'ଫୋନ୍ ନମ୍ବର' },
    state: { hi: 'राज्य', en: 'State', mr: 'राज्य', kn: 'ರಾಜ್ಯ', te: 'రాష్ట్రం', or: 'ରାଜ୍ୟ' },
    city: { hi: 'शहर', en: 'City', mr: 'शहर', kn: 'ನಗರ', te: 'నగరం', or: 'ଶହର' },
    createPassword: { hi: 'पासवर्ड बनाएं', en: 'Create Password', mr: 'पासवर्ड तयार करा', kn: 'ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ', te: 'పాస్‌వర్డ్ సృష్టించండి', or: 'ପାସୱର୍ଡ ତିଆରି କରନ୍ତୁ' },
    confirmPassword: { hi: 'पासवर्ड की पुष्टि करें', en: 'Confirm Password', mr: 'पासवर्डची पुष्टी करा', kn: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ', te: 'పాస్‌వర్డ్ నిర్ధారించండి', or: 'ପାସୱର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ' },
    pincode: { hi: 'पिनकोड', en: 'Pincode', mr: 'पिनकोड', kn: 'ಪಿನ್‌ಕೋಡ್', te: 'పిన్‌కోడ్', or: 'ପିନ୍‌କୋଡ୍' },

    // Professional details
    qualification: { hi: 'योग्यता', en: 'Qualification', mr: 'पात्रता', kn: 'ಅರ್ಹತೆ', te: 'అర్హత', or: 'ଯୋଗ୍ୟତା' },
    selectQualification: { hi: 'अपनी योग्यता चुनें', en: 'Select your qualification' },
    specifyQualification: { hi: 'योग्यता निर्दिष्ट करें (डिग्री/डिप्लोमा)', en: 'Specify Qualification (Degree/Diploma)' },
    iti: { hi: 'ITI', en: 'ITI' },
    diploma: { hi: 'डिप्लोमा', en: 'Diploma' },
    other: { hi: 'अन्य', en: 'Other' },
    totalExperience: { hi: 'कुल अनुभव', en: 'Total Experience', mr: 'एकूण अनुभव', kn: 'ಒಟ್ಟು ಅನುಭವ', te: 'మొత్తం అనుభవం', or: 'ମୋଟ ଅଭିଜ୍ଞତା' },
    fresher: { hi: 'फ्रेशर', en: 'Fresher', mr: 'फ्रेशर', kn: 'ಫ್ರೆಶರ್', te: 'ఫ్రెషర్', or: 'ଫ୍ରେଶର୍' },
    priorKnowledge: { hi: 'पूर्व EV ज्ञान / प्रमाणपत्र (वैकल्पिक)', en: 'Prior EV Knowledge / Certifications (Optional)' },
    priorKnowledgePlaceholder: { hi: 'किसी भी पूर्व प्रशिक्षण, प्रमाण पत्र या EV ज्ञान का वर्णन करें...', en: 'Describe any prior training, certificates, or EV knowledge...' },
    years: { hi: 'वर्ष', en: 'years' },
    currentWorkshop: { hi: 'वर्तमान वर्कशॉप / कंपनी का नाम', en: 'Current Workshop / Company Name' },
    brandsWorkedWith: { hi: 'किन ब्रांड्स के साथ काम किया', en: 'Brands Worked With' },
    bajaj: { hi: 'बजाज', en: 'Bajaj' },
    ola: { hi: 'ओला', en: 'Ola' },
    ather: { hi: 'एथर', en: 'Ather' },
    otherEVBrands: { hi: 'अन्य EV ब्रांड्स', en: 'Other EV Brands' },

    // Buttons
    next: { hi: 'आगे बढ़ें', en: 'Next', mr: 'पुढे', kn: 'ಮುಂದೆ', te: 'తరువాత', or: 'ପରବର୍ତ୍ତୀ' },
    back: { hi: 'वापस जाएं', en: 'Back', mr: 'मागे', kn: 'ಹಿಂದಕ್ಕೆ', te: 'వెనుకకు', or: 'ପଛକୁ' },
    submit: { hi: 'सबमिट करें', en: 'Submit', mr: 'सबमिट करा', kn: 'ಸಲ್ಲಿಸಿ', te: 'సమర్పించండి', or: 'ଦାଖଲ କରନ୍ତୁ' },
    goToLogin: { hi: 'लॉगिन पर जाएं', en: 'Go to Login' },

    // Login
    loginTitle: { hi: 'अपने खाते में लॉगिन करें', en: 'Login to your account' },
    forgotPassword: { hi: 'पासवर्ड भूल गए?', en: 'Forgot Password?' },
    password: { hi: 'पासवर्ड', en: 'Password' },
    loginButton: { hi: 'लॉगिन', en: 'Login' },
    noAccount: { hi: 'खाता नहीं है?', en: "Don't have an account?" },
    applyNow: { hi: 'अभी आवेदन करें', en: 'Apply Now' },

    // Dashboard
    welcome: { hi: 'स्वागत है', en: 'Welcome' },
    yourRole: { hi: 'आपकी भूमिका', en: 'Your Role' },
    verificationStatus: { hi: 'वेरिफिकेशन स्थिति', en: 'Verification Status' },
    pending: { hi: 'लंबित', en: 'Pending' },
    approved: { hi: 'स्वीकृत', en: 'Approved' },
    rejected: { hi: 'अस्वीकृत', en: 'Rejected' },
    pendingMessage: { hi: 'आपका आवेदन समीक्षाधीन है। कृपया प्रतीक्षा करें।', en: 'Your application is under review. Please wait.' },
    approvedMessage: { hi: 'बधाई हो! आपका आवेदन स्वीकृत हो गया है।', en: 'Congratulations! Your application has been approved.' },
    rejectedMessage: { hi: 'आपका आवेदन अस्वीकृत हो गया। कृपया संपर्क करें।', en: 'Your application was rejected. Please contact support.' },
    logout: { hi: 'लॉगआउट', en: 'Logout' },

    // Success
    applicationSubmitted: { hi: 'आवेदन सबमिट हो गया!', en: 'Application Submitted!' },
    applicationSuccess: { hi: 'आपका आवेदन सफलतापूर्वक जमा हो गया है। कृपया लॉगिन करें।', en: 'Your application has been submitted successfully. Please login.' },

    // Validation
    required: { hi: 'यह फ़ील्ड आवश्यक है', en: 'This field is required' },
    invalidPhone: { hi: 'कृपया वैध फ़ोन नंबर दर्ज करें', en: 'Please enter a valid phone number' },
    passwordMismatch: { hi: 'पासवर्ड मेल नहीं खाते', en: 'Passwords do not match' },
    passwordLength: { hi: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए', en: 'Password must be at least 6 characters' },
    selectAtLeastOne: { hi: 'कम से कम एक विकल्प चुनें', en: 'Select at least one option' },
    termsAndConditions: { hi: 'मैं गोपनीयता नीति और शर्तों से सहमत हूं', en: 'I agree to the Privacy Policy & Terms' },
    termsRequired: { hi: 'कृपया शर्तों से सहमत हों', en: 'Please agree to the terms' },

    // Language
    switchLanguage: { hi: 'English में देखें', en: 'हिंदी में देखें' },

    // Form placeholders
    selectState: { hi: 'राज्य चुनें', en: 'Select State' },
    selectCity: { hi: 'शहर चुनें', en: 'Select City' },
    selectExperience: { hi: 'अनुभव चुनें', en: 'Select Experience' },

    currentSalary: { hi: 'वर्तमान मासिक वेतन', en: 'Current Monthly Salary' },
    selectSalary: { hi: 'वेतन सीमा चुनें', en: 'Select Salary Range' },

    // Recruiter
    recruiterRegistration: { hi: 'रिक्रूटर पंजीकरण', en: 'Recruiter Registration' },
    recruiterLogin: { hi: 'रिक्रूटर लॉगिन', en: 'Recruiter Login' },
    companyName: { hi: 'कंपनी / रिक्रूटर का नाम', en: 'Recruiter / Company Name' },
    entityType: { hi: 'संस्था का प्रकार', en: 'Entity Type' },
    selectEntityType: { hi: 'प्रकार चुनें', en: 'Select Type' },
    dealer: { hi: 'डीलर', en: 'Dealer' },
    fleet: { hi: 'फ्लीट', en: 'Fleet' },
    oem: { hi: 'OEM', en: 'OEM' },
    workshopEntity: { hi: 'वर्कशॉप', en: 'Workshop' },
    register: { hi: 'पंजीकरण करें', en: 'Register' },
    registerNow: { hi: 'अभी पंजीकरण करें', en: 'Register Now' },
    alreadyHaveAccount: { hi: 'पहले से खाता है?', en: 'Already have an account?' },
    createAccount: { hi: 'खाता बनाएं', en: 'Create Account' },
    recruiterRegisterDesc: { hi: 'नया रिक्रूटर खाता बनाएं', en: 'Create a new recruiter account' },
    registrationSuccess: { hi: 'पंजीकरण सफल!', en: 'Registration Successful!' },
    registrationFailed: { hi: 'पंजीकरण विफल', en: 'Registration Failed' },
    loginSuccess: { hi: 'लॉगिन सफल!', en: 'Login Successful!' },
    loginFailed: { hi: 'लॉगिन विफल', en: 'Login Failed' },

    // Job posting
    postNewJob: { hi: 'नई नौकरी पोस्ट करें', en: 'Post New Job' },
    postNewJobDesc: { hi: 'EV पेशेवरों की भर्ती के लिए', en: 'Hire EV professionals' },
    previousJobPosts: { hi: 'पिछली नौकरी पोस्ट', en: 'Previous Job Posts' },
    previousJobPostsDesc: { hi: 'अपनी पोस्ट की गई नौकरियां देखें', en: 'View your posted jobs' },
    basics: { hi: 'बुनियादी जानकारी', en: 'Basics' },
    conditions: { hi: 'शर्तें', en: 'Conditions' },
    selectBrand: { hi: 'ब्रांड चुनें', en: 'Select Brand' },
    roleRequired: { hi: 'आवश्यक भूमिका', en: 'Role Required' },
    numberOfPeople: { hi: 'कितने लोग चाहिए', en: 'Number of People' },
    experienceRequired: { hi: 'अनुभव', en: 'Experience Required' },
    salaryRange: { hi: 'वेतन सीमा', en: 'Salary Range' },
    incentiveYes: { hi: 'इन्सेंटिव: हां', en: 'Incentive: Yes' },
    incentiveNo: { hi: 'इन्सेंटिव: नहीं', en: 'Incentive: No' },
    stayYes: { hi: 'रहने की व्यवस्था: हां', en: 'Stay Provided: Yes' },
    stayNo: { hi: 'रहने की व्यवस्था: नहीं', en: 'Stay Provided: No' },
    urgency: { hi: 'तत्काल', en: 'Urgency' },
    immediateUrgency: { hi: 'तुरंत', en: 'Immediate' },
    within7Days: { hi: '7 दिनों के भीतर', en: 'Within 7 Days' },
    submitJob: { hi: 'नौकरी पोस्ट करें', en: 'Post Job' },
    jobPostCreated: { hi: 'नौकरी पोस्ट सफल!', en: 'Job Posted Successfully!' },
    jobPostFailed: { hi: 'नौकरी पोस्ट विफल', en: 'Job Posting Failed' },
    noJobsYet: { hi: 'अभी तक कोई नौकरी पोस्ट नहीं', en: 'No jobs posted yet' },

    // Job status
    jobStatus: { hi: 'नौकरी की स्थिति', en: 'Job Status' },
    statusReceived: { hi: 'आवश्यकता प्राप्त', en: 'Requirement Received' },
    statusMatching: { hi: 'मैन्युअल मिलान चल रहा है', en: 'Manual Matching in Progress' },
    matchingMessage: { hi: 'हमारे विशेषज्ञ स्किल स्कोर जांच रहे हैं', en: 'Our experts are checking skill scores' },
    statusProfilesSent: { hi: 'WhatsApp पर प्रोफाइल भेजी गई', en: 'Profiles Sent on WhatsApp' },
    statusTrialBooked: { hi: 'मुफ्त ट्रायल बुक किया गया', en: 'Free Trial Booked' },

    // User dashboard
    applyForJobs: { hi: 'नौकरी के लिए आवेदन करें', en: 'Apply for Jobs' },
    learnings: { hi: 'सीखें', en: 'Learnings' },
    noJobsYetMessage: { hi: 'अभी कोई नौकरी उपलब्ध नहीं है। जल्द ही नई नौकरियां आएंगी।', en: 'No jobs available yet. New jobs coming soon.' },
    learningsComingSoon: { hi: 'सीखने की सामग्री जल्द उपलब्ध होगी', en: 'Learning content coming soon' },
    people: { hi: 'लोग', en: 'people' },

    // Verification
    verificationPending: { hi: 'वेरिफिकेशन लंबित', en: 'Verification Pending' },
    startVerification: { hi: 'वेरिफिकेशन शुरू करें', en: 'Start Verification' },
    step1Completed: { hi: 'चरण 1 पूरा', en: 'Step 1 Completed' },
    completeStep2: { hi: 'चरण 2 पूरा करें', en: 'Complete Step 2' },
    step2Pending: { hi: 'चरण 2 लंबित', en: 'Step 2 Pending' },
    quizInProgress: { hi: 'क्विज़ जारी है', en: 'Quiz in Progress' },
    verified: { hi: 'वेरिफाइड', en: 'Verified' },
    verificationComplete: { hi: 'आपका वेरिफिकेशन पूरा हो गया', en: 'Your verification is complete' },
    failed: { hi: 'असफल', en: 'Failed' },
    retryAfter7Days: { hi: '7 दिन बाद फिर से प्रयास करें', en: 'Retry after 7 days' },
    skillVerification: { hi: 'स्किल वेरिफिकेशन', en: 'Skill Verification' },
    question: { hi: 'प्रश्न', en: 'Question' },
    answered: { hi: 'उत्तर दिए', en: 'answered' },
    previous: { hi: 'पिछला', en: 'Previous' },
    incompleteQuiz: { hi: 'अधूरा क्विज़', en: 'Incomplete Quiz' },
    answerAllQuestions: { hi: 'कृपया सभी प्रश्नों के उत्तर दें', en: 'Please answer all questions' },
    congratulations: { hi: 'बधाई हो!', en: 'Congratulations!' },
    quizFailed: { hi: 'क्विज़ असफल', en: 'Quiz Failed' },
    score: { hi: 'स्कोर', en: 'Score' },
    step1PassedMessage: { hi: 'चरण 1 पास! अब चरण 2 शुरू करें।', en: 'Step 1 passed! Now start Step 2.' },
    verificationPassedMessage: { hi: 'आप अब वेरिफाइड EV पेशेवर हैं!', en: 'You are now a verified EV professional!' },
    verificationFailedMessage: { hi: '70% से कम स्कोर। 7 दिन बाद फिर प्रयास करें।', en: 'Score below 70%. Try again after 7 days.' },
    continueToStep2: { hi: 'चरण 2 शुरू करें', en: 'Continue to Step 2' },
    goToDashboard: { hi: 'डैशबोर्ड पर जाएं', en: 'Go to Dashboard' },
    error: { hi: 'त्रुटि', en: 'Error' },
    failedToLoadQuestions: { hi: 'प्रश्न लोड करने में विफल', en: 'Failed to load questions' },
    submitFailed: { hi: 'सबमिट करने में विफल', en: 'Submit failed' },
    networkError: { hi: 'नेटवर्क त्रुटि', en: 'Network error' },

    // ID Card
    jobs: { hi: 'नौकरियां', en: 'Jobs' },
    idCard: { hi: 'आईडी कार्ड', en: 'ID Card' },
    notVerified: { hi: 'वेरिफाइड नहीं', en: 'Not Verified' },
    verificationProgress: { hi: 'वेरिफिकेशन प्रगति', en: 'Verification Progress' },
    testPassed: { hi: 'टेस्ट पास ✓', en: 'Test passed ✓' },
    allTestsPassed: { hi: 'सभी टेस्ट पास ✓', en: 'All tests passed ✓' },
    oneTestPassed: { hi: '1 टेस्ट पास, 1 बाकी', en: '1 test passed, 1 remaining' },
    completeVerification: { hi: 'अपना वेरिफिकेशन पूरा करें', en: 'Complete your verification' },
    actionRequired: { hi: 'कार्रवाई आवश्यक', en: 'Action Required' },
    verificationCompleteTitle: { hi: 'वेरिफिकेशन पूरा हुआ', en: 'Verification Complete' },
    cardOrdered: { hi: 'कार्ड ऑर्डर किया गया ✓', en: 'Card Already Ordered ✓' },
    cardDeliveredMsg: { hi: 'आपका कार्ड 7-10 दिनों में डिलीवर हो जाएगा', en: 'Your card will be delivered in 7-10 days' },
    experiencePartners: { hi: 'अनुभव पार्टनर्स', en: 'Experience Partners' },
    scanToVerify: { hi: 'लाइव स्किल वेरिफाई\nकरने के लिए स्कैन करें', en: 'SCAN TO VERIFY\nLIVE SKILLS' },
    download: { hi: 'डाउनलोड', en: 'Download' },
    share: { hi: 'शेयर करें', en: 'Share' },
    orderCard: { hi: 'फिजिकल कार्ड ऑर्डर करें (Rs 199)', en: 'Order Physical Card (Rs 199)' },
    getPremiumCard: { hi: 'अपने घर पर प्रीमियम आईडी कार्ड प्राप्त करें', en: 'Get your premium ID card at your door step' },
    whatsappSupport: { hi: 'व्हाट्सएप सपोर्ट', en: 'WhatsApp Support' },
    getHelp: { hi: 'तुरंत मदद पाएं', en: 'Get help instantly' },
    yearExperienced: { hi: 'साल का अनुभव', en: 'Year Experienced' },
    year: { hi: 'साल', en: 'Year' },
    yearsExp: { hi: 'साल+', en: '+' }, // Special case for 1+ Year -> 1 साल+

    // Form
    naOption: { hi: 'NA (लागू नहीं)', en: 'NA (Not Applicable)' },
    brandWorkshop: { hi: 'ब्रांड वर्कशॉप', en: 'Brand Workshop' },
    enterPincode: { hi: 'पिनकोड दर्ज करें', en: 'Enter Pincode' },
    invalidPincode: { hi: 'कृपया 6 अंकों का पिनकोड दर्ज करें', en: 'Please enter a valid 6-digit pincode' },
    enterCity: { hi: 'शहर का नाम दर्ज करें', en: 'Enter city name' },

    // Errors
    pass10th: { hi: '10वीं पास', en: '10th Pass' },
    pass12th: { hi: '12वीं पास', en: '12th Pass' },
    twoWheeler: { hi: '2 व्हीलर', en: '2 Wheeler' },
    threeWheeler: { hi: '3 व्हीलर', en: '3 Wheeler' },
    vehicleCategory: { hi: 'वाहन श्रेणी', en: 'Vehicle Category' },
    selectVehicleCategory: { hi: 'वाहन श्रेणी चुनें', en: 'Select Vehicle Category' },
    btech: { hi: 'B.Tech / B.E.', en: 'B.Tech / B.E.' },

    userAlreadyExists: { hi: 'यह फ़ोन नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।', en: 'This phone number is already registered. Please login.' },
    phoneAlreadyRegistered: { hi: 'फ़ोन नंबर पहले से पंजीकृत है', en: 'Phone number already registered' },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const LANGUAGE_KEY = '@app_language';

export const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    toggleLanguage: () => void;
    availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, _setLanguage] = useState<Language>('en');

    useEffect(() => {
        // Load persisted language
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
                if (savedLanguage) {
                    _setLanguage(savedLanguage as Language);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
            _setLanguage(lang);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const t = (key: string): string => {
        if (translations[key]) {
            return translations[key][language] || translations[key]['en'];
        }
        console.warn(`Translation missing for key: ${key}`);
        return key;
    };

    const toggleLanguage = () => {
        const nextLang: Language = language === 'hi' ? 'en' : 'hi';
        setLanguage(nextLang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, availableLanguages: languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
