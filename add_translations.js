#!/usr/bin/env node

/**
 * Add Multilingual Translations to Existing Questions
 * Matches by English question text and updates all translations
 * ORDER DOESN'T MATTER - matching is done by content
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Error: EXPO_PUBLIC_DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// PASTE YOUR QUESTIONS HERE - Order doesn't matter!
// The script matches by question_text_en
const questions = [
  // === SALES QUESTIONS ===
  {
    role: "sales",
    step: 1,
    question_text_hi: "ग्राहक को EV की सबसे बड़ी बचत किस पर होती है?",
    question_text_en: "What is the biggest saving for customers with EV?",
    question_text_mr: "ग्राहकांना EV मध्ये सर्वात मोठी बचत कशावर होते?",
    question_text_kn: "ಗ್ರಾಹಕರಿಗೆ EV ನಲ್ಲಿ ದೊಡ್ಡ ಉಳಿತಾಯ ಯಾವುದರಲ್ಲಿ?",
    question_text_te: "కస్టమర్కు EV లో అత్యంత పెద్ద పొదుపు ఏమిటి?",
    question_text_or: "ଗ୍ରାହକଙ୍କୁ EV ରେ ସବୁଠାରୁ ବଡ଼ ସଞ୍ଚୟ କେଉଁଠାରେ ହୁଏ?",
    options: [
      { hi: "ईंधन/चार्जिंग लागत", en: "Fuel/charging cost", mr: "इंधन/चार्जिंग खर्च", kn: "ಇಂಧನ/ಚಾರ್ಜಿಂಗ್ ವೆಚ್ಚ", te: "ఇంధనం/ఛార్జింగ్ ఖర్చు", or: "ଇନ୍ଧନ/ଚାର୍ଜିଂ ଖର୍ଚ୍ଚ", isCorrect: true },
      { hi: "टायर", en: "Tires", mr: "टायर", kn: "ಟೈರ್ಗಳು", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
      { hi: "बीमा", en: "Insurance", mr: "विमा", kn: "ವಿಮೆ", te: "బీమా", or: "ବୀମା", isCorrect: false },
      { hi: "पार्किंग", en: "Parking", mr: "पार्किंग", kn: "ಪಾರ್ಕಿಂಗ್", te: "పార్కింగ్", or: "ପାର୍କିଂ", isCorrect: false },
    ],
    points: 1,
    difficulty: "easy",
  },
  {
    role: "sales",
    step: 1,
    question_text_hi: "EV में रेंज एंग्जाइटी का क्या मतलब है?",
    question_text_en: "What does range anxiety mean in EV?",
    question_text_mr: "EV मध्ये रेंज ऍन्झायटी म्हणजे काय?",
    question_text_kn: "EV ನಲ್ಲಿ ರೇಂಜ್ ಆ್ಯಂಗ್ಜೈಟಿ ಎಂದರೆ ಏನು?",
    question_text_te: "EV లో రేంజ్ యాంగ్జైటీ అంటే ఏమిటి?",
    question_text_or: "EV ରେ ରେଞ୍ଜ ଆନ୍ଜାଇଟି ଅର୍ଥ କ'ଣ?",
    options: [
      { hi: "बैटरी खत्म होने का डर", en: "Fear of battery running out", mr: "बॅटरी संपण्याची भीती", kn: "ಬ್ಯಾಟರಿ ಖಾಲಿಯಾಗುವ ಭಯ", te: "బ్యాటరీ అయిపోయే భయం", or: "ବ୍ୟାଟେରୀ ଶେଷ ହେବାର ଭୟ", isCorrect: true },
      { hi: "स्पीड का डर", en: "Fear of speed", mr: "वेगाची भीती", kn: "ವೇಗದ ಭಯ", te: "వేగం భయం", or: "ଗତିର ଭୟ", isCorrect: false },
      { hi: "कीमत का डर", en: "Fear of price", mr: "किंमतीची भीती", kn: "ಬೆಲೆಯ ಭಯ", te: "ధర భయం", or: "ମୂଲ୍ୟର ଭୟ", isCorrect: false },
      { hi: "सर्विस का डर", en: "Fear of service", mr: "सेवेची भीती", kn: "ಸೇವೆಯ ಭಯ", te: "సర్వీస్ భయం", or: "ସେବାର ଭୟ", isCorrect: false },
    ],
    points: 1,
    difficulty: "easy",
  },
  // === WORKSHOP QUESTIONS ===
  {
    role: "workshop",
    step: 1,
    question_text_hi: "वर्कशॉप को प्रॉफिटेबल बनाने के लिए, टेक्नीशियन के बीच डेली वर्कलोड कैसे बाँटना चाहिए?",
    question_text_en: "To ensure the workshop is profitable, how should you distribute the daily workload among your technicians?",
    question_text_mr: "वर्कशॉपला फायदेशीर बनवण्यासाठी, तुम्ही तुमच्या तंत्रज्ञांमध्ये दैनिक कामाचे वाटप कसे केले पाहिजे?",
    question_text_kn: "ವರ್ಕ್ಶಾಪ್ ಲಾಭದಾಯಕವಾಗಿರುವುದನ್ನು ಖಾತ್ರಿಪಡಿಸಲು, ನಿಮ್ಮ ತಂತ್ರಜ್ಞರ ನಡುವೆ ದೈನಂದಿನ ಕೆಲಸದ ಹೊರೆಯನ್ನು ನೀವು ಹೇಗೆ ವಿತರಿಸಬೇಕು?",
    question_text_te: "వర్క్షాప్ లాభదాయకంగా ఉండేలా చూసుకోవడానికి, మీ టెక్నీషియన్ల మధ్య రోజువారీ పనిని ఎలా పంచాలి?",
    question_text_or: "କର୍ମଶାଳାକୁ ଲାଭଜନକ କରିବା ପାଇଁ, ଆପଣ ଆପଣଙ୍କର ଟେକ୍ନିସିଆନ୍ମାନଙ୍କ ମଧ୍ୟରେ ଦୈନିକ କାର୍ଯ୍ୟଭାର କିପରି ବଣ୍ଟନ କରିବା ଉଚିତ?",
    options: [
      { hi: "जूनियर टेक्नीशियन को सबसे ज्यादा काम दें ताकि वे सीख सकें", en: "Give the most work to the junior technicians so they can learn", mr: "कनिष्ठ तंत्रज्ञांना सर्वाधिक काम द्या जेणेकरून ते शिकू शकतील", kn: "ಕಿರಿಯ ತಂತ್ರಜ್ಞರಿಗೆ ಹೆಚ್ಚು ಕೆಲಸವನ್ನು ನೀಡಿ ಇದರಿಂದ ಅವರು ಕಲಿಯಬಹುದು", te: "జూనియర్ టెక్నీషియన్లకు ఎక్కువ పని ఇవ్వండి తద్వారా వారు నేర్చుకోగలరు", or: "ଜୁନିଅର ଟେକ୍ନିସିଆନ୍ମାନଙ୍କୁ ଅଧିକ କାମ ଦିଅନ୍ତୁ ଯାହାଫଳରେ ସେମାନେ ଶିଖିପାରିବେ", isCorrect: false },
      { hi: "स्किल मैट्रिक्स के आधार पर जॉब असाइन करें", en: "Assign jobs based on a 'Skill Matrix' (matching the hardest jobs to the most skilled tech) to reduce repeat complaints", mr: "स्किल मॅट्रिक्सच्या आधारे नोकऱ्या नियुक्त करा", kn: "'ಸ್ಕಿಲ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್' ಆಧಾರದ ಮೇಲೆ ಕೆಲಸಗಳನ್ನು ನಿಯೋಜಿಸಿ", te: "'స్కిల్ మ్యాట్రిక్స్' ఆధారంగా ఉద్యోగాలను కేటాయించండి", or: "'ସ୍କିଲ୍ ମ୍ୟାଟ୍ରିକ୍ସ' ଆଧାରରେ କାର୍ଯ୍ୟ ନ୍ୟସ୍ତ କରନ୍ତୁ", isCorrect: true },
      { hi: "हर सुबह टेक्नीशियन को अपनी जॉब खुद चुनने दें", en: "Let the technicians choose their own jobs every morning", mr: "दररोज सकाळी तंत्रज्ञांना स्वतःच्या नोकऱ्या निवडू द्या", kn: "ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ ತಂತ್ರಜ್ಞರು ತಮ್ಮ ಸ್ವಂತ ಕೆಲಸಗಳನ್ನು ಆರಿಸಲು ಅವಕಾಶ ನೀಡಿ", te: "ప్రతి ఉదయం టెక్నీషియన్లు వారి స్వంత ఉద్యోగాలను ఎంచుకోనివ్వండి", or: "ପ୍ରତିଦିନ ସକାଳେ ଟେକ୍ନିସିଆନ୍ମାନଙ୍କୁ ନିଜ କାର୍ଯ୍ୟ ବାଛିବାକୁ ଦିଅନ୍ତୁ", isCorrect: false },
      { hi: "हर टेक्नीशियन को वाहनों की एक समान संख्या दें", en: "Give every technician exactly the same number of vehicles regardless of the problem", mr: "प्रत्येक तंत्रज्ञाला समान संख्येची वाहने द्या", kn: "ಪ್ರತಿ ತಂತ್ರಜ್ಞರಿಗೆ ಅದೇ ಸಂಖ್ಯೆಯ ವಾಹನಗಳನ್ನು ನೀಡಿ", te: "ప్రతి టెక్నీషియన్కు అదే సంఖ్యలో వాహనాలను ఇవ్వండి", or: "ପ୍ରତ୍ୟେକ ଟେକ୍ନିସିଆନ୍ଙ୍କୁ ସମାନ ସଂଖ୍ୟକ ଯାନ ଦିଅନ୍ତୁ", isCorrect: false },
    ],
    points: 1,
    difficulty: "medium",
  },
  // ADD MORE QUESTIONS HERE - just paste your objects!
];
export const workshopQuestions: QuestionData[] = [
  {
    role: "workshop",
    step: 1,
    question_text_en: "Workload distribution?",
    question_text_hi: "वर्कशॉप को प्रॉफिटेबल बनाने के लिए, टेक्नीशियन के बीच डेली वर्कलोड कैसे बाँटना चाहिए?",
    question_text_mr: "कामाचे वाटप?",
    question_text_kn: "ಕೆಲಸದ ಹಂಚಿಕೆ?",
    question_text_te: "పని పంపిణీ?",
    question_text_or: "କାର୍ଯ୍ୟ ବଣ୍ଟନ?",
    options: [
      { en: "Most to juniors", hi: "जूनियर टेक्नीशियन को सबसे ज्यादा काम दें", mr: "ज्युनिअरला", kn: "ಕಿರಿಯರಿಗೆ", te: "జూనియర్లకు", or: "ଜୁନିଅରଙ୍କୁ", isCorrect: false },
      { en: "Skill Matrix", hi: "स्किल मैट्रिक्स के आधार पर जॉब असाइन करें", mr: "स्किल मॅट्रिक्स", kn: "ಸ್ಕಿಲ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್", te: "స్కిల్ మ్యాట్రిక్స్", or: "ସ୍କିଲ୍ ମ୍ୟାଟ୍ରିକ୍ସ", isCorrect: true },
      { en: "They choose", hi: "हर सुबह टेक्नीशियन को अपनी जॉब खुद चुनने दें", mr: "निवड", kn: "ಆಯ್ಕೆ", te: "ఎంపిక", or: "ପସନ୍ଦ", isCorrect: false },
      { en: "Equal numbers", hi: "हर टेक्नीशियन को वाहनों की एक समान संख्या दें", mr: "समान", kn: "ಸಮಾನ", te: "సమానం", or: "ସମାନ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "JC Red Flag:",
    question_text_hi: "जॉब कार्ड डिसिप्लिन: अगर वर्कशॉप मैनेजर रोज़ सभी जॉब कार्ड (JCs) बंद नहीं करता तो यह 'रेड फ्लैग' क्यों है?",
    question_text_mr: "जॉब कार्ड रेड फ्लॅग:",
    question_text_kn: "ಜಾಬ್ ಕಾರ್ಡ್ ರೆಡ್ ಫ್ಲ್ಯಾಗ್:",
    question_text_te: "జాబ్ కార్డ్ రెడ్ ఫ్లాగ్:",
    question_text_or: "ଜବ୍ କାର୍ଡ ରେଡ୍ ଫ୍ଲାଗ୍:",
    options: [
      { en: "Storage", hi: "कंप्यूटर में स्टोरेज", mr: "स्टोरेज", kn: "ಸಂಗ್ರಹ", te: "స్టోరేజ్", or: "ଷ୍ଟୋରେଜ୍", isCorrect: false },
      { en: "Inventory/Revenue gap", hi: "स्पेयर पार्ट्स में इन्वेंटरी गैप और बिलिंग में देरी", mr: "महसूल तफावत", kn: "ದಾಸ್ತಾನು/ಆದಾಯ", te: "ఇన్వెంటరీ/రెవెన్యూ", or: "ଭଣ୍ଡାର/ରାଜସ୍ୱ", isCorrect: true },
      { en: "Sceen display", hi: "स्क्रीन पर ओपन जॉब कार्ड", mr: "स्क्रीन", kn: "ಸ್ಕ್ರೀನ್", te: "స్క్రీన్", or: "ସ୍କ୍ରିନ୍", isCorrect: false },
      { en: "Messy workshop", hi: "वर्कशॉप गंदा दिखता है", mr: "अस्वच्छ", kn: "ಗಲೀಜು", te: "అపరిశుభ్రం", or: "ଅପରିଷ୍କାର", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Handling NPS Detractor:",
    question_text_hi: "NPS डिट्रैक्टर को हैंडल करना: सबसे प्रोफेशनल पहला कदम क्या है?",
    question_text_mr: "NPS डिट्रॅक्टर:",
    question_text_kn: "NPS ಡಿಟ್ರಾಕ್ಟರ್:",
    question_text_te: "NPS డిట్రాక్టర్:",
    question_text_or: "NPS ଡିଟ୍ରାକ୍ଟର:",
    options: [
      { en: "Ignore", hi: "इग्नोर करें", mr: "दुर्लक्ष", kn: "ನಿರ್ಲಕ್ಷಿಸಿ", te: "నిర్లక్ష్యం", or: "ଅବହେଳା", isCorrect: false },
      { en: "Argue", hi: "ग्राहक को कॉल करें और तर्क दें", mr: "वाद", kn: "ವಾದ", te: "వాదించడం", or: "ଯୁକ୍ତି", isCorrect: false },
      { en: "LAR within 24h", hi: "24 घंटे के अंदर कॉल करें, 'Listen, Apologize, and Resolve' करें", mr: "२४ तासात समाधान", kn: "24 ಗಂಟೆಯಲ್ಲಿ LAR", te: "24 గంటల్లో LAR", or: "24 ଘଣ୍ଟାରେ LAR", isCorrect: true },
      { en: "Discount", hi: "अगली सर्विस पर 50% डिस्काउंट दें", mr: "सवलत", kn: "ರಿಯಾಯಿತಿ", te: "రాయితీ", or: "ରିହାତି", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Retention strategy:",
    question_text_hi: "ग्राहक रिटेंशन स्ट्रैटेजी: अगली सर्विस के लिए ग्राहक को वापस लाने का सबसे प्रभावी तरीका क्या है?",
    question_text_mr: "रिटेन्शन स्ट्रॅटेजी:",
    question_text_kn: "ಉಳಿಸಿಕೊಳ್ಳುವ ತಂತ್ರ:",
    question_text_te: "నిలుపుదల వ్యూహం:",
    question_text_or: "ଧରି ରଖିବା କୌଶଳ:",
    options: [
      { en: "Big TV", hi: "वेटिंग लाउंज में बड़ा टीवी", mr: "टीव्ही", kn: "ಟಿವಿ", te: "టీవీ", or: "ଟିଭି", isCorrect: false },
      { en: "PSF call 3 days", hi: "सर्विस के 3 दिनों के अंदर PSF कॉल करना", mr: "PSF कॉल", kn: "PSF ಕರೆ", te: "PSF కాల్", or: "PSF କଲ୍", isCorrect: true },
      { en: "5 SMS daily", hi: "हर दिन 5 SMS भेजना", mr: "SMS", kn: "SMS", te: "SMS", or: "SMS", isCorrect: false },
      { en: "Cheapest", hi: "सबसे सस्ती सर्विस प्राइस", mr: "स्वस्त", kn: "ಅಗ್ಗದ", te: "చౌకైన", or: "ଶସ୍ତା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Response lead time:",
    question_text_hi: "शिकायत रिस्पॉन्स टाइम: हाई-प्रायोरिटी ग्राहक शिकायत का इंडस्ट्री-स्टैंडर्ड क्या है?",
    question_text_mr: "रिस्पॉन्स वेळ:",
    question_text_kn: "ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ:",
    question_text_te: "ప్రతిస్పందన సమయం:",
    question_text_or: "ପ୍ରତିକ୍ରିୟା ସମୟ:",
    options: [
      { en: "1 week", hi: "1 हफ्ता", mr: "१ आठवडा", kn: "1 ವಾರ", te: "1 వారం", or: "୧ ସପ୍ତାହ", isCorrect: false },
      { en: "1 to 4 hours", hi: "1 से 4 घंटे", mr: "१ ते ४ तास", kn: "1 ರಿಂದ 4 ಗಂಟೆ", te: "1 నుండి 4 గంటలు", or: "୧ ରୁ ୪ ଘଣ୍ଟା", isCorrect: true },
      { en: "48 hours", hi: "48 घंटे", mr: "४८ तास", kn: "48 ಗಂಟೆಗಳು", te: "48 గంటలు", or: "୪୮ ଘଣ୍ଟା", isCorrect: false },
      { en: "When they visit", hi: "जब ग्राहक वर्कशॉप आए", mr: "भेट", kn: "ಭೇಟಿ", te: "దర్శించినప్పుడు", or: "ଭେଟିବା ବେଳେ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Capacity throughput:",
    question_text_hi: "वर्कशॉप थ्रूपुट: 4 बे और 4 टेक्नीशियन के लिए हेल्दी व्हीकल इनटेक क्या है?",
    question_text_mr: "कार्यक्षमता:",
    question_text_kn: "ಸಾಮರ್ಥ್ಯ:",
    question_text_te: "సామర్థ్యం:",
    question_text_or: "କ୍ଷମତା:",
    options: [
      { en: "2 total", hi: "कुल 2 वाहन", mr: "२ एकूण", kn: "ಒಟ್ಟು 2", te: "మొత్తం 2", or: "ମୋଟ୍ ୨", isCorrect: false },
      { en: "12 to 16", hi: "12 से 16 वाहन", mr: "१२ ते १६", kn: "12 ರಿಂದ 16", te: "12 నుండి 16", or: "୧୨ ରୁ ୧୬", isCorrect: true },
      { en: "50 vehicles", hi: "50 वाहन", mr: "५०", kn: "50", te: "50", or: "୫୦", isCorrect: false },
      { en: "No matter", hi: "कोई फर्क नहीं पड़ता", mr: "काही नाही", kn: "ಪರವಾಗಿಲ್ಲ", te: "పర్వాలేదు", or: "କିଛି ନୁହେଁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "NPS 3 Recovery risk:",
    question_text_hi: "ग्राहक ने NPS 3 दिया पर कॉल नहीं उठाया। केस बंद करने का रिस्क?",
    question_text_mr: "NPS ३ धोका:",
    question_text_kn: "NPS 3 ಅಪಾಯ:",
    question_text_te: "NPS 3 రిస్క్:",
    question_text_or: "NPS 3 ବିପଦ:",
    options: [
      { en: "No risk", hi: "कोई रिस्क नहीं", mr: "धोका नाही", kn: "ಅಪಾಯವಿಲ್ಲ", te: "రిస్క్ లేదు", or: "ବିପଦ ନାହିଁ", isCorrect: false },
      { en: "They forget", hi: "ग्राहक मुद्दा भूल जाएगा", mr: "विसरणार", kn: "ಮರೆಯುತ್ತಾರೆ", te: "మర్చిపోతారు", or: "ଭୁଲିଯିବେ", isCorrect: false },
      { en: "Social media/Legal escalation", hi: "सोशल मीडिया या लीगल कम्प्लेंट", mr: "सोशल मीडिया/लीगल", kn: "ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ/ಕಾನೂನು", te: "సోషల్ మీడియా/లీగల్", or: "ସୋସିଆଲ୍ ମିଡିଆ/ଆଇନଗତ", isCorrect: true },
      { en: "Becomes 9", hi: "ऑटोमैटिक 9 हो जाएगा", mr: "९ होईल", kn: "9 ಆಗುತ್ತದೆ", te: "9 అవుతుంది", or: "9 ହେବ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Mandatory Field Fix:",
    question_text_hi: "OEM ने 'Mandatory Field Fix' जारी किया है। कैसे हैंडल करें?",
    question_text_mr: "फील्ड फिक्स:",
    question_text_kn: "ಫೀಲ್ಡ್ ಫಿಕ್ಸ್:",
    question_text_te: "ఫీల్డ్ ఫిక్స్:",
    question_text_or: "ଫିଲ୍ଡ ଫିକ୍ସ:",
    options: [
      { en: "Mark completed now, fix later", hi: "Completed मार्क करें और बाद में फिक्स करें", mr: "नंतर करा", kn: "ನಂತರ ಮಾಡಿ", te: "తర్వాత చేయండి", or: "ପରେ କରନ୍ତୁ", isCorrect: false },
      { en: "Call VIN owners immediately", hi: "VIN ओनर्स को तुरंत कॉल करें और पार्ट बदलें", mr: "त्वरीत कॉल", kn: "ತಕ್ಷಣ ಕರೆ ಮಾಡಿ", te: "వెంటనే కాల్ చేయండి", or: "ତୁରନ୍ତ କଲ୍ କରନ୍ତୁ", isCorrect: true },
      { en: "Only VIPs", hi: "केवल VIPs की बाइक्स", mr: "फक्त VIP", kn: "ಕೇವಲ VIP", te: "కేవలం VIP", or: "କେବଳ VIP", isCorrect: false },
      { en: "Wait for reminder", hi: "रिमाइंडर का इंतजार करें", mr: "वाट पाहा", kn: "ಕಾಯುವಿಕೆ", te: "వేచి ఉండండి", or: "ଅପେକ୍ଷା କରନ୍ତୁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Hiring EV talent:",
    question_text_hi: "5 EV टेक्नीशियन हायर करने हैं। प्रभावी जगह क्या है?",
    question_text_mr: "EV भरती:",
    question_text_kn: "EV ನೇಮಕಾತಿ:",
    question_text_te: "EV నియామకం:",
    question_text_or: "EV ନିଯୁକ୍ତି:",
    options: [
      { en: "Petrol pump banner", hi: "पेट्रोल पंप के बाहर बैनर", mr: "बॅनर", kn: "ಬ್ಯಾನರ್", te: "బ్యానర్", or: "ବ୍ୟାନର୍", isCorrect: false },
      { en: "Everified app", hi: "'Everified' ऐप यूज करें", mr: "Everified ॲप", kn: "Everified ಆ್ಯಪ್", te: "Everified యాప్", or: "Everified ଆପ୍", isCorrect: true },
      { en: "College freshers", hi: "लोकल कॉलेज के फ्रेशर्स", mr: "फ्रेशर्स", kn: "ಫ್ರೆಶರ್ಸ್", te: "ఫ్రెషర్లు", or: "ଫ୍ରେସରସ୍", isCorrect: false },
      { en: "Wait for CV", hi: "CV का इंतजार करें", mr: "वाट पाहा", kn: "ಕಾಯುವಿಕೆ", te: "వేచి ఉండండి", or: "ଅପେକ୍ଷା କରନ୍ତୁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "workshop",
    step: 1,
    question_text_en: "Increase volume (low ads):",
    question_text_hi: "सर्विस वॉल्यूम बढ़ाने का सस्टेनेबल तरीका क्या है?",
    question_text_mr: "व्हॉल्यूम वाढवणे:",
    question_text_kn: "ವಾಲ್ಯೂಮ್ ಹೆಚ್ಚಳ:",
    question_text_te: "వాల్యూమ్ పెంపు:",
    question_text_or: "ପରିମାଣ ବୃଦ୍ଧି:",
    options: [
      { en: "Wave at riders", hi: "EV राइडर्स को हाथ हिलाकर बुलाना", mr: "हाक मारणे", kn: "ಕೈ ಬೀಸುವುದು", te: "పిలవడం", or: "ଡାକିବା", isCorrect: false },
      { en: "Battery clinic campaign", hi: "Battery Health Clinic कैंपेन", mr: "बॅटरी क्लिनिक", kn: "ಬ್ಯಾಟರಿ ಕ್ಲಿನಿಕ್", te: "బ్యాటరీ క్లినిక్", or: "ବ୍ୟାଟେରୀ କ୍ଲିନିକ୍", isCorrect: true },
      { en: "Reduce quality", hi: "सर्विस क्वालिटी कम करें", mr: "क्वालिटी कमी", kn: "ಗುಣಮಟ್ಟ ಕಡಿಮೆ", te: "నాణ్యత తగ్గించడం", or: "ଗୁଣବତ୍ତା ହ୍ରାସ", isCorrect: false },
      { en: "Fire techs", hi: "टेक्नीशियन निकाल दें", mr: "कपात", kn: "ತೆಗೆದುಹಾಕುವುದು", te: "తొలగించడం", or: "ବାହାର କରିଦେବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  }
];
export const salesQuestions: QuestionData[] = [
  {
    role: "sales",
    step: 1,
    question_text_en: "Biggest saving with EV?",
    question_text_hi: "ग्राहक को EV की सबसे बड़ी बचत किस पर होती है?",
    question_text_mr: "सर्वात मोठी बचत?",
    question_text_kn: "ಅತಿ ದೊಡ್ಡ ಉಳಿತಾಯ?",
    question_text_te: "పెద్ద పొదుపు?",
    question_text_or: "ସବୁଠାରୁ ବଡ଼ ସଞ୍ଚୟ?",
    options: [
      { en: "Fuel/Charging", hi: "ईंधन/चार्जिंग लागत", mr: "इंधन/चार्जिंग", kn: "ಇಂಧನ/ಚಾರ್ಜಿಂಗ್", te: "ఇంధనం/ఛార్జింగ్", or: "ଇନ୍ଧନ/ଚାର୍ଜିଂ", isCorrect: true },
      { en: "Tires", hi: "टायर", mr: "टायर", kn: "ಟೈರ್", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
      { en: "Insurance", hi: "बीमा", mr: "विमा", kn: "ವಿಮೆ", te: "బీమా", or: "ବୀମା", isCorrect: false },
      { en: "Parking", hi: "पार्किंग", mr: "पार्किंग", kn: "ಪಾರ್ಕಿಂಗ್", te: "పార్కింగ్", or: "ପାର୍କିଂ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "What is range anxiety?",
    question_text_hi: "EV में रेंज एंग्जाइटी का क्या मतलब है?",
    question_text_mr: "रेंज एंग्जाइटी म्हणजे?",
    question_text_kn: "ರೇಂಜ್ ಆತಂಕ ಎಂದರೇನು?",
    question_text_te: "రేంజ్ యాంగ్జైటీ అంటే?",
    question_text_or: "ରେଞ୍ଜ୍ ଆଙ୍ଗଜାଇଟି କଣ?",
    options: [
      { en: "Fear of battery running out", hi: "बैटरी खत्म होने का डर", mr: "बॅटरी संपण्याची भीती", kn: "ಬ್ಯಾಟರಿ ಮುಗಿಯುವ ಭಯ", te: "బ్యాటరీ అయిపోయే భయం", or: "ବ୍ୟାଟେରୀ ଶେଷ ହେବାର ଭୟ", isCorrect: true },
      { en: "Speed", hi: "स्पीड का डर", mr: "वेग", kn: "ವೇಗ", te: "వేగం", or: "ଗତି", isCorrect: false },
      { en: "Price", hi: "कीमत का डर", mr: "किंमत", kn: "ಬೆಲೆ", te: "ధర", or: "ମୂଲ୍ୟ", isCorrect: false },
      { en: "Service", hi: "सर्विस का डर", mr: "सर्व्हिस", kn: "ಸೇವೆ", te: "సర్వీస్", or: "ସେବା", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "How to get subsidy?",
    question_text_hi: "ग्राहक EV पर सब्सिडी कैसे प्राप्त करता है?",
    question_text_mr: "सबसिडी कशी मिळते?",
    question_text_kn: "ಸಬ್ಸಿಡಿ ಪಡೆಯುವುದು ಹೇಗೆ?",
    question_text_te: "సబ్సిడీ ఎలా పొందాలి?",
    question_text_or: "ସବସିଡି କିପରି ପାଇବେ?",
    options: [
      { en: "FAME-II/State schemes", hi: "FAME-II और राज्य योजनाओं के तहत", mr: "FAME-II योजना", kn: "FAME-II ಯೋಜನೆಗಳು", te: "FAME-II పథకాలు", or: "FAME-II ଯୋଜନା", isCorrect: true },
      { en: "Petrol pump", hi: "पेट्रोल पंप से", mr: "पेट्रोल पंप", kn: "ಪೆಟ್ರೋಲ್ ಪಂಪ್", te: "పెట్రోల్ బంక్", or: "ପେଟ୍ରୋଲ ପମ୍ପ", isCorrect: false },
      { en: "Insurance", hi: "बीमा कंपनी से", mr: "विमा", kn: "ವಿಮೆ", te: "బీమా", or: "ବୀମା", isCorrect: false },
      { en: "Toll", hi: "टोल प्लाजा से", mr: "टोल", kn: "ಟೋಲ್", te: "టోల్", or: "ଟୋଲ୍", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Biggest concern?",
    question_text_hi: "EV खरीदने में ग्राहक की सबसे बड़ी चिंता क्या होती है?",
    question_text_mr: "सर्वात मोठी चिंता?",
    question_text_kn: "ದೊಡ್ಡ ಕಾಳಜಿ?",
    question_text_te: "పెద్ద ఆందోళన?",
    question_text_or: "ସବୁଠାରୁ ବଡ଼ ଚିନ୍ତା?",
    options: [
      { en: "Range/Infrastructure", hi: "रेंज और चार्जिंग इंफ्रास्ट्रक्चर", mr: "रेंज/इन्फ्रा", kn: "ರೇಂಜ್/ಮೂಲಸೌಕರ್ಯ", te: "రేంజ్/మౌలిక సదుపాయాలు", or: "ରେଞ୍ଜ୍/ଭିତ୍ତିଭୂମି", isCorrect: true },
      { en: "Color", hi: "रंग", mr: "रंग", kn: "ಬಣ್ಣ", te: "రంగు", or: "ରଙ୍ଗ", isCorrect: false },
      { en: "Seat cover", hi: "सीट कवर", mr: "सीट कव्हर", kn: "ಸೀಟ್ ಕವರ್", te: "సీటు కవర్", or: "ସିଟ୍ କଭର୍", isCorrect: false },
      { en: "Horn", hi: "हॉर्न", mr: "हॉर्न", kn: "ಹಾರ್ನ್", te: "హారన్", or: "ହର୍ଣ୍ଣ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Why is TCO lower?",
    question_text_hi: "EV की TCO पेट्रोल वाहन से कम क्यों है?",
    question_text_mr: "TCO कमी का?",
    question_text_kn: "TCO ಏಕೆ ಕಡಿಮೆ?",
    question_text_te: "TCO ఎందుకు తక్కువ?",
    question_text_or: "TCO କାହିଁକି କମ୍?",
    options: [
      { en: "Low charge/maintenance", hi: "कम चार्जिंग और मेंटेनेंस लागत", mr: "कमी खर्च", kn: "ಕಡಿಮೆ ಖರ್ಚು", te: "తక్కువ ఖర్చు", or: "କମ୍ ଖର୍ଚ୍ଚ", isCorrect: true },
      { en: "Speed", hi: "अधिक स्पीड", mr: "वेग", kn: "ವೇಗ", te: "వేగం", or: "ଗତି", isCorrect: false },
      { en: "Size", hi: "बड़ा साइज", mr: "आकार", kn: "ಗಾತ್ರ", te: "పరిమాణం", or: "ଆକାର", isCorrect: false },
      { en: "Weight", hi: "ज्यादा वजन", mr: "वजन", kn: "ತೂಕ", te: "బరువు", or: "ଓଜନ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Battery warranty?",
    question_text_hi: "बैटरी वारंटी आमतौर पर कितने साल की होती है?",
    question_text_mr: "बॅटरी वॉरंटी?",
    question_text_kn: "ಬ್ಯಾಟರಿ ವಾರಂಟಿ?",
    question_text_te: "బ్యాటరీ వారంటీ?",
    question_text_or: "ବ୍ୟାଟେରୀ ୱାରେଣ୍ଟି?",
    options: [
      { en: "1 year", hi: "1 साल", mr: "१ वर्ष", kn: "1 ವರ್ಷ", te: "1 సంవత్సరం", or: "୧ ବର୍ଷ", isCorrect: false },
      { en: "3-5 years", hi: "3-5 साल", mr: "३-५ वर्षे", kn: "3-5 ವರ್ಷಗಳು", te: "3-5 సంవత్సరాలు", or: "୩-୫ ବର୍ଷ", isCorrect: true },
      { en: "10 years", hi: "10 साल", mr: "१० वर्षे", kn: "10 ವರ್ಷಗಳು", te: "10 సంవత్సరాలు", or: "୧୦ ବର୍ଷ", isCorrect: false },
      { en: "6 months", hi: "6 महीने", mr: "६ महिने", kn: "6 ತಿಂಗಳು", te: "6 నెలలు", or: "୬ ମାସ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Home charging benefit?",
    question_text_hi: "ग्राहक को होम चार्जिंग का क्या फायदा बताएंगे?",
    question_text_mr: "होम चार्जिंग फायदा?",
    question_text_kn: "ಹೋಮ್ ಚಾರ್ಜಿಂಗ್ ಲಾಭ?",
    question_text_te: "హోమ్ ఛార్జింగ్ ప్రయోజనం?",
    question_text_or: "ହୋମ୍ ଚାର୍ଜିଙ୍ଗ୍ ଫାଇଦା?",
    options: [
      { en: "Ready in morning", hi: "रात में चार्ज, सुबह तैयार", mr: "सकाळी तयार", kn: "ಬೆಳಿಗ್ಗೆ ಸಿದ್ಧ", te: "ఉదయానికి సిద్ధం", or: "ସକାଳେ ପ୍ରସ୍ତୁତ", isCorrect: true },
      { en: "Pump", hi: "पेट्रोल पंप जाना", mr: "पेट्रोल पंप", kn: "ಪಂಪ್", te: "బంక్", or: "ପମ୍ପ", isCorrect: false },
      { en: "Daily service", hi: "हर दिन सर्विस", mr: "सर्व्हिस", kn: "ಸೇವೆ", te: "సర్వీస్", or: "ସେବା", isCorrect: false },
      { en: "Traffic", hi: "ट्रैफिक में खड़ा रहना", mr: "ट्रॅफिक", kn: "ಟ್ರಾಫಿಕ್", te: "ట్రాఫిక్", or: "ଟ୍ରାଫିକ୍", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "EMI explanation:",
    question_text_hi: "EV में डाउन पेमेंट और EMI कैसे समझाएंगे?",
    question_text_mr: "EMI स्पष्टीकरण:",
    question_text_kn: "EMI ವಿವರಣೆ:",
    question_text_te: "EMI వివరణ:",
    question_text_or: "EMI ବ୍ୟାଖ୍ୟା:",
    options: [
      { en: "On price after subsidy", hi: "सब्सिडी के बाद की कीमत पर", mr: "सबसिडीनंतर", kn: "ಸಬ್ಸಿಡಿ ನಂತರ", te: "సబ్సిడీ తర్వాత", or: "ସବସିଡି ପରେ", isCorrect: true },
      { en: "Only MRP", hi: "केवल MRP पर", mr: "MRP वर", kn: "MRP ಮೇಲೆ", te: "MRP పై", or: "MRP ଉପରେ", isCorrect: false },
      { en: "No interest", hi: "बिना ब्याज के", mr: "व्याजाशिवाय", kn: "ಬಡ್ಡಿ ಇಲ್ಲ", te: "వడ్డీ లేదు", or: "ବିନା ସୁଧ", isCorrect: false },
      { en: "Cash", hi: "केवल कैश में", mr: "कॅश", kn: "ನಗದು", te: "నగదు", or: "ନଗଦ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Why test ride?",
    question_text_hi: "ग्राहक को टेस्ट राइड क्यों जरूरी है?",
    question_text_mr: "टेस्ट राइड का?",
    question_text_kn: "ಟೆಸ್ಟ್ ರೈಡ್ ಏಕೆ?",
    question_text_te: "టెస్ట్ రైడ్ ఎందుకు?",
    question_text_or: "ଟେଷ୍ଟ ରାଇଡ୍ କାହିଁକି?",
    options: [
      { en: "Experience/Questions", hi: "राइड का अनुभव और सवालों का जवाब", mr: "अनुभव", kn: "ಅನುಭವ", te: "అనుభవం", or: "ଅନୁଭବ", isCorrect: true },
      { en: "Waste time", hi: "समय बर्बाद करने के लिए", mr: "वेळ घालवणे", kn: "ಸಮಯ ವ್ಯರ್ಥ", te: "సమయం వృధా", or: "ସମୟ ନଷ୍ଟ", isCorrect: false },
      { en: "Save petrol", hi: "पेट्रोल खर्च बचाने के लिए", mr: "पेट्रोल बचत", kn: "ಪೆಟ್ರೋಲ್ ಉಳಿತಾಯ", te: "పెట్రోల్ ఆదా", or: "ପେଟ୍ରୋଲ ସଞ୍ଚୟ", isCorrect: false },
      { en: "Roam", hi: "शोरूम में घूमने के लिए", mr: "फिरणे", kn: "ತಿರುಗಾಡಲು", te: "తిరగడానికి", or: "ବୁଲିବା", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "sales",
    step: 1,
    question_text_en: "Response to expensive:",
    question_text_hi: 'ग्राहक की आपत्ति "EV महंगी है" का जवाब क्या देंगे?',
    question_text_mr: "महाग आहे?",
    question_text_kn: "ದುಬಾರಿ ಎಂಬ ಪ್ರತಿಕ್ರಿಯೆ:",
    question_text_te: "ఖరీదైనది అనే దానికి సమాధానం:",
    question_text_or: "ମହଙ୍ଗା ପାଇଁ ଉତ୍ତର:",
    options: [
      { en: "Show TCO savings", hi: "TCO तुलना दिखाएं - 3-5 साल में बचत", mr: "बचत दाखवा", kn: "ಉಳಿತಾಯ ತೋರಿಸಿ", te: "పొదుపు చూపండి", or: "ସଞ୍ଚୟ ଦେଖାନ୍ତୁ", isCorrect: true },
      { en: "Agree", hi: "हां, बहुत महंगी है", mr: "हो", kn: "ಹೌದು", te: "అవును", or: "ହଁ", isCorrect: false },
      { en: "Petrol vehicle", hi: "पेट्रोल गाड़ी लें", mr: "पेट्रोल गाडी", kn: "ಪೆಟ್ರೋಲ್ ವಾಹನ", te: "పెట్రోల్ వాహనం", or: "ପେଟ୍ରୋଲ ଗାଡ଼ି", isCorrect: false },
      { en: "Nothing", hi: "कुछ न कहें", mr: "काही नाही", kn: "ಏನೂ ಬೇಡ", te: "ఏమీ వద్దు", or: "କିଛି ନାହିଁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  }
];
export const technicianStep2Questions: QuestionData[] = [
  {
    role: "technician",
    step: 2,
    question_text_en: "How to measure voltage with multimeter?",
    question_text_hi: "मल्टीमीटर से बैटरी वोल्टेज कैसे मापते हैं?",
    question_text_mr: "मल्टीमीटरने व्होल्टेज कसे मोजायचे?",
    question_text_kn: "ವೋಲ್ಟೇಜ್ ಅಳೆಯುವುದು ಹೇಗೆ?",
    question_text_te: "వోల్టేజ్ ఎలా కొలవాలి?",
    question_text_or: "ଭୋଲ୍ଟେଜ୍ କିପରି ମାପିବେ?",
    options: [
      { en: "AC mode", hi: "AC मोड पर", mr: "AC मोड", kn: "AC ಮೋಡ್", te: "AC మోడ్", or: "AC ମୋଡ୍", isCorrect: false },
      { en: "DC mode", hi: "DC वोल्टेज मोड पर", mr: "DC मोड", kn: "DC ಮೋಡ್", te: "DC మోడ్", or: "DC ମୋଡ୍", isCorrect: true },
      { en: "Resistance", hi: "रेजिस्टेंस मोड पर", mr: "रेझिस्टन्स", kn: "ರೆಸಿಸ್ಟೆನ್ಸ್", te: "రెసిస్టెన్స్", or: "ରେଜିଷ୍ଟାନ୍ସ", isCorrect: false },
      { en: "Current", hi: "करंट मोड पर", mr: "करंट मोड", kn: "ಕರೆಂಟ್ ಮೋಡ್", te: "కరెంట్ మోడ్", or: "କରେଣ୍ଟ ମୋଡ୍", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Detect short circuit?",
    question_text_hi: "बैटरी में शॉर्ट सर्किट का पता कैसे लगाएं?",
    question_text_mr: "शॉर्ट सर्किट कसे ओळखावे?",
    question_text_kn: "ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ ಪತ್ತೆ?",
    question_text_te: "షార్ట్ సర్క్యూట్ గుర్తింపు?",
    question_text_or: "ସର୍ଟ ସର୍କିଟ୍ ଚିହ୍ନଟ?",
    options: [
      { en: "Heat/Voltage drop", hi: "बैटरी गर्म होगी और वोल्टेज गिरेगा", mr: "उष्णता/व्होल्टेज कमी", kn: "ಶಾಖ/ವೋಲ್ಟೇಜ್ ಕುಸಿತ", te: "వేడి/వోల్టేజ్ తగ్గుదల", or: "ଉତ୍ତାପ/ଭୋଲ୍ଟେଜ୍ ହ୍ରାସ", isCorrect: true },
      { en: "Cold", hi: "बैटरी ठंडी रहेगी", mr: "थंड", kn: "ತಂಪು", te: "చల్లగా", or: "ଥଣ୍ଡା", isCorrect: false },
      { en: "Voltage rise", hi: "वोल्टेज बढ़ेगा", mr: "व्होल्टेज वाढ", kn: "ವೋಲ್ಟೇಜ್ ಏರಿಕೆ", te: "వోల్టేజ్ పెరుగుదల", or: "ଭୋଲ୍ଟେଜ୍ ବୃଦ୍ଧି", isCorrect: false },
      { en: "No change", hi: "कोई बदलाव नहीं", mr: "बदल नाही", kn: "ಬದಲಾವಣೆ ಇಲ್ಲ", te: "మార్పు లేదు", or: "କୌଣସି ପରିବର୍ତ୍ତନ ନାହିଁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Motor noise? Check first:",
    question_text_hi: "मोटर में कोई आवाज़ आए तो पहले क्या चेक करें?",
    question_text_mr: "मोटार आवाज? आधी काय तपासावे:",
    question_text_kn: "ಮೋಟಾರ್ ಶಬ್ದ? ಮೊದಲು ಪರೀಕ್ಷಿಸಿ:",
    question_text_te: "మోటారు శబ్దం? మొదట చూడండి:",
    question_text_or: "ମୋଟର ଶବ୍ଦ? ପ୍ରଥମେ ଯାଞ୍ଚ କରନ୍ତୁ:",
    options: [
      { en: "Battery", hi: "बैटरी", mr: "बॅटरी", kn: "ಬ್ಯಾಟರಿ", te: "బ్యాటరీ", or: "ବ୍ୟାଟେରୀ", isCorrect: false },
      { en: "Bearing/Connections", hi: "बेयरिंग और कनेक्शन", mr: "बेअरिंग/कनेक्शन", kn: "ಬೇರಿಂಗ್/ಸಂಪರ್ಕ", te: "బేరింగ్/కనెక్షన్లు", or: "ବେରିଂ/ସଂଯୋଗ", isCorrect: true },
      { en: "Tires", hi: "टायर", mr: "टायर", kn: "ಟೈರ್", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
      { en: "Seat", hi: "सीट", mr: "सीट", kn: "ಸೀಟು", te: "సీటు", or: "ସିଟ୍", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Controller failure symptoms:",
    question_text_hi: "कंट्रोलर फेल होने के लक्षण क्या हैं?",
    question_text_mr: "कंट्रोलर फेल होण्याची लक्षणे:",
    question_text_kn: "ಕಂಟ್ರೋಲರ್ ವೈಫಲ್ಯದ ಲಕ್ಷಣಗಳು:",
    question_text_te: "కంట్రోలర్ ఫెయిల్యూర్ లక్షణాలు:",
    question_text_or: "କଣ୍ଟ୍ରୋଲର ଫେଲ୍ ଲକ୍ଷଣ:",
    options: [
      { en: "Motor wont start/intermittent", hi: "मोटर स्टार्ट नहीं होगा या रुक-रुक कर चलेगा", mr: "मोटार सुरू होणार नाही", kn: "ಮೋಟಾರ್ ಆರಂಭವಾಗಲ್ಲ", te: "మోటారు స్టార్ట్ అవ్వదు", or: "ମୋଟର ଆରମ୍ଭ ହେବ ନାହିଁ", isCorrect: true },
      { en: "Fast charge", hi: "बैटरी जल्दी चार्ज होगी", mr: "फास्ट चार्ज", kn: "ವೇಗದ ಚಾರ್ಜ್", te: "వేగవంతమైన ఛార్జ్", or: "ଦ୍ରୁତ ଚାର୍ଜ", isCorrect: false },
      { en: "Brighter lights", hi: "लाइट तेज होगी", mr: "लाईट प्रखर", kn: "ಬೆಳಕು ಹೆಚ್ಚು", te: "ప్రకాశవంతమైన లైట్లు", or: "ଉଜ୍ଜ୍ୱଳ ଆଲୋକ", isCorrect: false },
      { en: "Loud horn", hi: "हॉर्न जोर से बजेगा", mr: "हॉर्न जोरात", kn: "ಹಾರ್ನ್ ಜೋರಾಗಿ", te: "బిగ్గరగా హారన్", or: "ଉଚ୍ଚ ହର୍ଣ୍ଣ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Green light off on charger:",
    question_text_hi: "चार्जर का ग्रीन लाइट नहीं जल रही, क्या कारण हो सकता है?",
    question_text_mr: "हिरवा दिवा बंद:",
    question_text_kn: "ಹಸಿರು ಲೈಟ್ ಆಫ್:",
    question_text_te: "గ్రీన్ లైట్ ఆఫ్:",
    question_text_or: "ସବୁଜ ଆଲୋକ ବନ୍ଦ:",
    options: [
      { en: "Faulty/Not full", hi: "चार्जर खराब या बैटरी फुल नहीं हुई", mr: "खराब/पूर्ण नाही", kn: "ದೋಷ/ಪೂರ್ಣವಿಲ್ಲ", te: "లోపం/పూర్తి కాలేదు", or: "ତ୍ରୁଟିପୂର୍ଣ୍ଣ/ପୂର୍ଣ୍ଣ ନୁହେଁ", isCorrect: true },
      { en: "Motor issue", hi: "मोटर में समस्या", mr: "मोटार समस्या", kn: "ಮೋಟಾರ್ ಸಮಸ್ಯೆ", te: "మోటారు సమస్య", or: "ମୋଟର ସମସ୍ୟା", isCorrect: false },
      { en: "Puncture", hi: "टायर पंचर", mr: "पंचर", kn: "ಪಂಚರ್", te: "పంచర్", or: "ପଙ୍କଚର୍", isCorrect: false },
      { en: "Brakes", hi: "ब्रेक की समस्या", mr: "ब्रेक", kn: "ಬ್ರೇಕ್", te: "బ్రేకులు", or: "ବ୍ରେକ୍", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "BMS error? Do this:",
    role: "technician",
    step: 2,
    question_text_hi: "BMS एरर आने पर क्या करें?",
    question_text_mr: "BMS एरर? काय करावे:",
    question_text_kn: "BMS ದೋಷ? ಹೀಗೆ ಮಾಡಿ:",
    question_text_te: "BMS ఎర్రర్? ఇలా చేయండి:",
    question_text_or: "BMS ତ୍ରୁଟି? ଏହା କରନ୍ତୁ:",
    options: [
      { en: "Reset BMS", hi: "बैटरी को डिस्कनेक्ट करके BMS रीसेट करें", mr: "BMS रिसेट", kn: "BMS ರಿಸೆಟ್", te: "BMS రీసెట్", or: "BMS ରିସେଟ୍", isCorrect: true },
      { en: "Replace motor", hi: "मोटर बदलें", mr: "मोटार बदला", kn: "ಮೋಟಾರ್ ಬದಲಿಸಿ", te: "మోటారు మార్చండి", or: "ମୋଟର ବଦଳାନ୍ତୁ", isCorrect: false },
      { en: "Change tires", hi: "टायर बदलें", mr: "टायर बदला", kn: "ಟೈರ್ ಬದಲಿಸಿ", te: "టైర్లు మార్చండి", or: "ଟାୟାର ବଦଳାନ୍ତୁ", isCorrect: false },
      { en: "Nothing", hi: "कुछ न करें", mr: "काहीही नाही", kn: "ಏನೂ ಇಲ್ಲ", te: "ఏమీ వద్దు", or: "କିଛି ନାହିଁ", isCorrect: false },
    ],
    points: 1, difficulty: "hard"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Scooter stops suddenly?",
    question_text_hi: "स्कूटर अचानक बंद हो जाए तो पहले क्या चेक करें?",
    question_text_mr: "स्कूटर अचानक बंद?",
    question_text_kn: "ಸ್ಕೂಟರ್ ಹಠಾತ್ ನಿಲುಗಡೆ?",
    question_text_te: "స్కూటర్ అకస్మాత్తుగా ఆగిందా?",
    question_text_or: "ସ୍କୁଟର ହଠାତ୍ ବନ୍ଦ?",
    options: [
      { en: "Connection/Fuse", hi: "बैटरी कनेक्शन और फ्यूज", mr: "कनेक्शन/फ्यूज", kn: "ಸಂಪರ್ಕ/ಫ್ಯೂಸ್", te: "కనెక్షన్/ఫ్యూజ్", or: "ସଂଯୋଗ/ଫ୍ୟୁଜ୍", isCorrect: true },
      { en: "Seat", hi: "सीट", mr: "सीट", kn: "ಸೀಟು", te: "సీటు", or: "ସିଟ୍", isCorrect: false },
      { en: "Mirror", hi: "मिरर", mr: "आरसा", kn: "ಕನ್ನಡಿ", te: "అద్దం", or: "ଦର୍ପଣ", isCorrect: false },
      { en: "Panel", hi: "बॉडी पैनल", mr: "पॅनेल", kn: "ಪ್ಯಾನೆಲ್", te: "ప్యానెల్", or: "ପ୍ୟାନେଲ୍", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "What are U, V, W wires?",
    question_text_hi: "मोटर में तीन वायर (U, V, W) का क्या काम है?",
    question_text_mr: "U, V, W वायर्स काय आहेत?",
    question_text_kn: "U, V, W ವೈರ್‌ಗಳು ಯಾವುವು?",
    question_text_te: "U, V, W వైర్లు అంటే ఏమిటి?",
    question_text_or: "U, V, W ତାରଗୁଡ଼ିକ କଣ?",
    options: [
      { en: "Charging", hi: "बैटरी चार्जिंग", mr: "चार्जिंग", kn: "ಚಾರ್ಜಿಂಗ್", te: "ఛార్జింగ్", or: "ଚାର୍ଜିଂ", isCorrect: false },
      { en: "3-phase supply", hi: "थ्री-फेज पावर सप्लाई", mr: "३-फेज सप्लाय", kn: "3-ಫೇಸ್ ಪೂರೈಕೆ", te: "3-ఫేజ్ సరఫరా", or: "3-ଫେଜ୍ ଯୋଗାଣ", isCorrect: true },
      { en: "Lighting", hi: "लाइटिंग", mr: "लाईट", kn: "ಲೈಟಿಂಗ್", te: "లైటింగ్", or: "ଆଲୋକ", isCorrect: false },
      { en: "Horn", hi: "हॉर्न कनेक्शन", mr: "हॉर्न", kn: "ಹಾರ್ನ್", te: "హారన్", or: "ହର୍ଣ୍ଣ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Hall sensor function:",
    question_text_hi: "हॉल सेंसर का क्या काम है?",
    question_text_mr: "हॉल सेन्सर कार्य:",
    question_text_kn: "ಹಾಲ್ ಸೆನ್ಸರ್ ಕೆಲಸ:",
    question_text_te: "హాల్ సెన్సార్ పని:",
    question_text_or: "ହଲ୍ ସେନସର କାମ:",
    options: [
      { en: "Temp", hi: "बैटरी तापमान नापना", mr: "तापमान", kn: "ತಾಪಮಾನ", te: "ఉష్ణోగ్రత", or: "ତାପମାତ୍ରା", isCorrect: false },
      { en: "Motor position", hi: "मोटर की पोजीशन बताना", mr: "मोटार स्थिती", kn: "ಮೋಟಾರ್ ಸ್ಥಾನ", te: "మోటారు స్థానం", or: "ମୋଟର ସ୍ଥିତି", isCorrect: true },
      { en: "Speed", hi: "स्पीड मापना", mr: "वेग", kn: "ವೇಗ", te: "వేగం", or: "ଗତି", isCorrect: false },
      { en: "Lights", hi: "लाइट कंट्रोल", mr: "लाईट", kn: "ಲೈಟ್", te: "లైట్లు", or: "ଲାଇଟ୍", isCorrect: false },
    ],
    points: 1, difficulty: "hard"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "One bad cell in pack?",
    question_text_hi: "बैटरी पैक में एक सेल खराब हो तो क्या होगा?",
    question_text_mr: "एक खराब सेल?",
    question_text_kn: "ಒಂದು ಕೆಟ್ಟ ಸೆಲ್?",
    question_text_te: "ఒక పాడైన సెల్?",
    question_text_or: "ଗୋଟିଏ ଖରାପ ସେଲ୍?",
    options: [
      { en: "Entire pack affected", hi: "पूरी बैटरी प्रभावित होगी", mr: "पूर्ण बॅटरीवर परिणाम", kn: "ಪೂರ್ತಿ ಬ್ಯಾಟರಿ ತೊಂದರೆ", te: "మొత్తం బ్యాటరీపై ప్రభావం", or: "ସମଗ୍ର ବ୍ୟାଟେରୀ ପ୍ରଭାବିତ", isCorrect: true },
      { en: "No effect", hi: "कोई असर नहीं", mr: "काही नाही", kn: "ಪರಿಣಾಮವಿಲ್ಲ", te: "ప్రభావం లేదు", or: "କୌଣସି ପ୍ରଭାବ ନାହିଁ", isCorrect: false },
      { en: "Faster", hi: "मोटर तेज चलेगी", mr: "वेगवान", kn: "ವೇಗ", te: "వేగం", or: "ଦ୍ରୁତ", isCorrect: false },
      { en: "Brighter", hi: "लाइट तेज होगी", mr: "प्रखर", kn: "ಬೆಳಕು", te: "ప్రకాశం", or: "ଉଜ୍ଜ୍ୱଳ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Insulation test reason:",
    question_text_hi: "इन्सुलेशन रेजिस्टेंस टेस्ट क्यों किया जाता है?",
    question_text_mr: "इन्सुलेशन चाचणी:",
    question_text_kn: "ಇನ್ಸುಲೇಶನ್ ಪರೀಕ್ಷೆ:",
    question_text_te: "ఇన్సులేషన్ పరీక్ష:",
    question_text_or: "ଇନସୁଲେସନ୍ ପରୀକ୍ଷା:",
    options: [
      { en: "Leakage check", hi: "करंट लीकेज चेक करने के लिए", mr: "लीकेज चेक", kn: "ಸೋರಿಕೆ ತಪಾಸಣೆ", te: "లీకేజీ తనిఖీ", or: "ଲିକ୍ ଯାଞ୍ଚ", isCorrect: true },
      { en: "Charge", hi: "बैटरी चार्ज करने के लिए", mr: "चार्ज", kn: "ಚಾರ್ಜ್", te: "ఛార్జ్", or: "ଚାର୍ଜ", isCorrect: false },
      { en: "Speed", hi: "मोटर स्पीड बढ़ाने के लिए", mr: "वेग", kn: "ವೇಗ", te: "వేగం", or: "ଗତି", isCorrect: false },
      { en: "Tires", hi: "टायर प्रेशर चेक करने के लिए", mr: "टायर", kn: "ಟೈರ್", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
    ],
    points: 1, difficulty: "hard"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "IP rating means:",
    question_text_hi: "EV में वॉटरप्रूफिंग का IP रेटिंग क्या दर्शाती है?",
    question_text_mr: "IP रेटिंग म्हणजे:",
    question_text_kn: "IP ರೇಟಿಂಗ್ ಎಂದರೆ:",
    question_text_te: "IP రేటింగ్ అంటే:",
    question_text_or: "IP ରେଟିଂ ମାନେ:",
    options: [
      { en: "Dust/Water protection", hi: "धूल और पानी से सुरक्षा का स्तर", mr: "धूळ/पाणी संरक्षण", kn: "ಧೂಳು/ನೀರು ರಕ್ಷಣೆ", te: "ధూళి/నీటి రక్షణ", or: "ଧୂଳି/ଜଳ ସୁରକ୍ଷା", isCorrect: true },
      { en: "Capacity", hi: "बैटरी क्षमता", mr: "क्षमता", kn: "ಸಾಮರ್ಥ್ಯ", te: "సామర్థ్యం", or: "କ୍ଷମତା", isCorrect: false },
      { en: "Power", hi: "मोटर पावर", mr: "शक्ती", kn: "ಶಕ್ತಿ", te: "శక్తి", or: "ଶକ୍ତି", isCorrect: false },
      { en: "Limit", hi: "स्पीड लिमिट", mr: "मर्यादा", kn: "ಮಿತಿ", te: "పరిమితి", or: "ସୀମା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "SOC for storage:",
    question_text_hi: "लिथियम बैटरी को स्टोर करते समय SOC कितनी रखनी चाहिए?",
    question_text_mr: "स्टोरेज SOC:",
    question_text_kn: "ಸಂಗ್ರಹಣೆ SOC:",
    question_text_te: "నిల్వ SOC:",
    question_text_or: "ଷ୍ଟୋରେଜ୍ SOC:",
    options: [
      { en: "100%", hi: "100%", mr: "१००%", kn: "100%", te: "100%", or: "100%", isCorrect: false },
      { en: "40-60%", hi: "40-60%", mr: "४०-६०%", kn: "40-60%", te: "40-60%", or: "40-60%", isCorrect: true },
      { en: "0%", hi: "0%", mr: "०%", kn: "0%", te: "0%", or: "0%", isCorrect: false },
      { en: "10%", hi: "10%", mr: "१०%", kn: "10%", te: "10%", or: "10%", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "Regen not working?",
    question_text_hi: "रीजनरेटिव ब्रेकिंग काम न करे तो क्या चेक करें?",
    question_text_mr: "रिजनरेटिव्ह काम करत नाही?",
    question_text_kn: "ರಿಜೆನ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲವೇ?",
    question_text_te: "రీజెన్ పనిచేయడం లేదా?",
    question_text_or: "ରିଜେନ୍ କାମ କରୁନାହିଁ କି?",
    options: [
      { en: "Settings/Sensor", hi: "कंट्रोलर सेटिंग्स और ब्रेक सेंसर", mr: "सेटिंग्स/सेन्सर", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು/ಸೆನ್ಸರ್", te: "సెట్టింగ్‌లు/సెన్సార్", or: "ସେଟିଂସୃ/ସେନସର", isCorrect: true },
      { en: "Tires", hi: "टायर प्रेशर", mr: "टायर", kn: "ಟೈರ್", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
      { en: "Seat", hi: "सीट पोजीशन", mr: "सीट", kn: "ಸೀಟು", te: "సీటు", or: "ସିଟ୍", isCorrect: false },
      { en: "Mirror", hi: "मिरर एंगल", mr: "आरसा", kn: "ಕನ್ನಡಿ", te: "అద్దం", or: "ଦର୍ପଣ", isCorrect: false },
    ],
    points: 1, difficulty: "hard"
  },
  {
    role: "technician",
    step: 2,
    question_text_en: "CAN bus function:",
    question_text_hi: "CAN बस का क्या काम है EV में?",
    question_text_mr: "CAN बस कार्य:",
    question_text_kn: "CAN ಬಸ್ ಕೆಲಸ:",
    question_text_te: "CAN బస్ పని:",
    question_text_or: "CAN ବସ୍ କାମ:",
    options: [
      { en: "Communication", hi: "विभिन्न कंपोनेंट्स के बीच कम्युनिकेशन", mr: "संवाद", kn: "ಸಂವಹನ", te: "కమ్యూనికేషన్", or: "ଯୋଗାଯୋଗ", isCorrect: true },
      { en: "Charging", hi: "बैटरी चार्जिंग", mr: "चार्जिंग", kn: "ಚಾರ್ಜಿಂಗ್", te: "ఛార్జింగ్", or: "ଚାର୍ଜିଂ", isCorrect: false },
      { en: "Cooling", hi: "मोटर कूलिंग", mr: "कूलिंग", kn: "ಕೂಲಿಂಗ್", te: "కూలింగ్", or: "କୁଲିଂ", isCorrect: false },
      { en: "Tires", hi: "टायर प्रेशर मॉनिटरिंग", mr: "टायर", kn: "ಟೈರ್", te: "టైర్లు", or: "ଟାୟାର", isCorrect: false },
    ],
    points: 1, difficulty: "hard"
  }
];

export const technicianStep1Questions: QuestionData[] = [
  {
    role: "technician",
    step: 1,
    question_text_en: "Which cell technology is most commonly used in EV batteries?",
    question_text_hi: "EV बैटरी में सबसे सामान्य रूप से कौन सी सेल तकनीक उपयोग की जाती है?",
    question_text_mr: "EV बॅटरीमध्ये सामान्यतः कोणती सेल तंत्रज्ञान वापरले जाते?",
    question_text_kn: "EV ಬ್ಯಾಟರಿಗಳಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಸೆಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
    question_text_te: "EV బ్యాటరీలలో సాధారణంగా ఏ సెల్ టెక్నాలజీని ఉపయోగిస్తారు?",
    question_text_or: "EV ବ୍ୟାଟେରୀରେ ସାଧାରଣତଃ କେଉଁ ସେଲ୍ ଟେକ୍ନୋଲୋଜି ବ୍ୟବହୃତ ହୁଏ?",
    options: [
      { en: "Lead-Acid", hi: "लीड-एसिड", mr: "लेड-ॲसिड", kn: "ಲೆಡ್-ಆಸಿಡ್", te: "లెడ్-యాసిడ్", or: "ଲେଡ୍-ଏସିଡ୍", isCorrect: false },
      { en: "Lithium-Ion", hi: "लिथियम-आयन", mr: "लिथियम-आयन", kn: "ಲಿಥಿಯಂ-ಐಯಾನ್", te: "లిథియం-అయాన్", or: "ଲିଥିୟମ୍-ଆୟନ", isCorrect: true },
      { en: "Nickel-Cadmium", hi: "निकल-कैडमियम", mr: "निकेल-कॅडमियम", kn: "ನಿಕಲ್-ಕ್ಯಾಡ್ಮಿಯಮ್", te: "నికెల్-కాడ్మియం", or: "ନିକେଲ୍-କ୍ୟାଡମିୟମ୍", isCorrect: false },
      { en: "Zinc-Carbon", hi: "जिंक-कार्बन", mr: "झिंक-कार्बन", kn: "ಜಿಂಕ್-ಕಾರ್ಬನ್", te: "జింಕ್-కార్బన్", or: "ଜିଙ୍କ-କାର୍ବନ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is the full form of BMS?",
    question_text_hi: "BMS का पूरा नाम क्या है?",
    question_text_mr: "BMS चे पूर्ण रूप काय आहे?",
    question_text_kn: "BMS ನ ಪೂರ್ಣ ರೂಪವೇನು?",
    question_text_te: "BMS అంటే పూర్తి రూపం ఏమిటి?",
    question_text_or: "BMS ର ପୂର୍ଣ୍ଣ ରୂପ କଣ?",
    options: [
      { en: "Battery Monitoring System", hi: "बैटरी मॉनिटरिंग सिस्टम", mr: "बॅटरी मॉनिटरिंग सिस्टम", kn: "ಬ್ಯಾಟರಿ ಮಾನಿಟರಿಂಗ್ ಸಿಸ್ಟಮ್", te: "బ్యాటరీ మానిటరింగ్ సిస్టమ్", or: "ବ୍ୟାଟେରୀ ମନିଟରିଂ ସିଷ୍ଟମ", isCorrect: false },
      { en: "Battery Management System", hi: "बैटरी मैनेजमेंट सिस्टम", mr: "बॅटरी मॅनेजमेंट सिस्टम", kn: "ಬ್ಯಾಟರಿ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ಸಿಸ್ಟಮ್", te: "బ్యాటరీ మేనేజ్‌మెంట్ సిస్టమ్", or: "ବ୍ୟାଟେରୀ ମ୍ୟାନେଜମେଣ୍ଟ ସିଷ୍ଟମ", isCorrect: true },
      { en: "Basic Motor System", hi: "बेसिक मोटर सिस्टम", mr: "बेसिक मोटर सिस्टम", kn: "ಬೇಸಿಕ್ ಮೋಟಾರ್ ಸಿಸ್ಟಮ್", te: "బేసిక్ మోటార్ సిస్టమ్", or: "ବେସିକ ମୋଟର ସିଷ୍ଟମ", isCorrect: false },
      { en: "Balanced Mode System", hi: "बैलेंस्ड मोड सिस्टम", mr: "बॅलन्स्ड मोड सिस्टम", kn: "ಬ್ಯಾಲೆನ್ಸ್ಡ್ ಮೋಡ್ ಸಿಸ್ಟಮ್", te: "బ్యాలెన్స్‌డ్ మోడ్ సిస్టమ్", or: "ବ୍ୟାଲେନ୍ସଡ ମୋଡ ସିଷ୍ଟମ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What does BLDC motor mean in EV?",
    question_text_hi: "EV में BLDC मोटर का क्या अर्थ है?",
    question_text_mr: "EV मध्ये BLDC मोटरचा अर्थ काय?",
    question_text_kn: "EV ನಲ್ಲಿ BLDC ಮೋಟಾರ್ ಎಂದರೆ ಏನು?",
    question_text_te: "EVలో BLDC మోటార్ అంటే ఏమిటి?",
    question_text_or: "EV ରେ BLDC ମୋଟରର ଅର୍ଥ କଣ?",
    options: [
      { en: "Brushed Direct Current", hi: "ब्रश्ड डायरेक्ट करंट", mr: "ब्रश्ड डायरेक्ट करंट", kn: "ಬ್ರಷ್ಡ್ ಡೈರೆಕ್ಟ್ ಕರೆಂಟ್", te: "బ్రష్డ్ డైరెక్ట్ కరెంట్", or: "ବ୍ରଶଡ୍ ଡାଇରେକ୍ଟ କରେଣ୍ଟ", isCorrect: false },
      { en: "Brushless Direct Current", hi: "ब्रशलेस डायरेक्ट करंट", mr: "ब्रशलेस डायरेक्ट करंट", kn: "ಬ್ರಷ್‌ಲೆಸ್ ಡೈರೆಕ್ಟ್ ಕರೆಂಟ್", te: "బ్రష్‌లెస్ డైరెక్ట్ కరెంట్", or: "ବ୍ରଶଲେସ୍ ଡାଇରେକ୍ଟ କରେଣ୍ଟ", isCorrect: true },
      { en: "Basic Low Drive Current", hi: "बेसिक लो ड्राइव करंट", mr: "बेसिक लो ड्राइव करंट", kn: "ಬೇಸಿಕ್ ಲೋ ಡ್ರೈವ್ ಕರೆಂಟ್", te: "బేసిక్ లో డ్రైవ్ కరెంట్", or: "ବେସିକ ଲୋ ଡ୍ରାଇଭ କରେଣ୍ଟ", isCorrect: false },
      { en: "Balanced Load Distribution Current", hi: "बैलेंस्ड लोड डिस्ट्रीब्यूशन करंट", mr: "बॅलन्स्ड लोड डिस्ट्रिब्युशन करंट", kn: "ಬ್ಯಾಲೆನ್ಸ್ಡ್ ಲೋಡ್ ಡಿಸ್ಟ್ರಿಬ್ಯೂಷನ್ ಕರೆಂಟ್", te: "బ్యాలెన్స్‌డ్ లోడ్ డిస్ట్రిబ్యూషన్ కరెంట్", or: "ବ୍ୟାଲେନ୍ସଡ ଲୋଡ ଡିଷ୍ଟ୍ରିବ୍ୟୁସନ କରେଣ୍ଟ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is the function of regenerative braking?",
    question_text_hi: "रीजनरेटिव ब्रेकिंग का क्या काम है?",
    question_text_mr: "रिजनरेटिव्ह ब्रेकिंगचे कार्य काय आहे?",
    question_text_kn: "ರಿಜನರೇಟಿವ್ ಬ್ರೇಕಿಂಗ್‌ನ ಕೆಲಸವೇನು?",
    question_text_te: "రీజెనరేటివ్ బ్రేకింగ్ పని ఏమిటి?",
    question_text_or: "ରିଜେନେରେଟିଭ୍ ବ୍ରେକିଂର କାମ କଣ?",
    options: [
      { en: "Increase speed", hi: "गति बढ़ाना", mr: "वेग वाढवणे", kn: "ವೇಗ ಹೆಚ್ಚಿಸುವುದು", te: "వేగం పెంచడం", or: "ଗତି ବଢାଇବା", isCorrect: false },
      { en: "Send energy back to battery during braking", hi: "ब्रेकिंग के दौरान ऊर्जा वापस बैटरी में भेजना", mr: "ब्रेकिंग दरम्यान ऊर्जा बॅटरीमध्ये परत पाठवणे", kn: "ಬ್ರೇಕಿಂಗ್ ಸಮಯದಲ್ಲಿ ಶಕ್ತಿಯನ್ನು ಮತ್ತೆ ಬ್ಯಾಟರಿಗೆ ಕಳುಹಿಸುವುದು", te: "బ్రేకింగ్ సమయంలో శక్తిని తిరిగి బ్యాటరీకి పంపడం", or: "ବ୍ରେକିଂ ସମୟରେ ଶକ୍ତିକୁ ପୁନର୍ବାର ବ୍ୟାଟେରୀକୁ ପଠାଇବା", isCorrect: true },
      { en: "Increase tire grip", hi: "टायर की पकड़ बढ़ाना", mr: "टायरची पकड वाढवणे", kn: "ಟೈರ್ ಗ್ರಿಪ್ ಹೆಚ್ಚಿಸುವುದು", te: "టైర్ గ్రిప్ పెంచడం", or: "ଟାୟାର୍ ଗ୍ରିପ୍ ବଢାଇବା", isCorrect: false },
      { en: "Cool down the motor", hi: "मोटर को ठंडा करना", mr: "मोटार थंड करणे", kn: "ಮೋಟಾರ್ ತಂಪಾಗಿಸುವುದು", te: "మోటారును చల్లబరచడం", or: "ମୋଟରକୁ ଥଣ୍ଡା କରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "In what unit is EV battery capacity measured?",
    question_text_hi: "EV बैटरी की क्षमता किसमें मापी जाती है?",
    question_text_mr: "EV बॅटरीची क्षमता कशात मोजली जाते?",
    question_text_kn: "EV ಬ್ಯಾಟರಿ ಸಾಮರ್ಥ್ಯವನ್ನು ಯಾವ ಘಟಕದಲ್ಲಿ ಅಳೆಯಲಾಗುತ್ತದೆ?",
    question_text_te: "EV బ్యాటరీ సామర్థ్యాన్ని ఏ యూనిట్‌లో కొలుస్తారు?",
    question_text_or: "EV ବ୍ୟାଟେରୀ କ୍ଷମତା କେଉଁ ୟୁନିଟରେ ମାପ ହୁଏ?",
    options: [
      { en: "Watt (W)", hi: "वाट (W)", mr: "वॅट (W)", kn: "ವ್ಯಾಟ್ (W)", te: "వాట్ (W)", or: "ୱାଟ୍ (W)", isCorrect: false },
      { en: "Kilowatt-hour (kWh)", hi: "किलोवाट-ऑवर (kWh)", mr: "किलोवॅट-अवर (kWh)", kn: "ಕಿಲೋವ್ಯಾಟ್-ಅವರ್ (kWh)", te: "కిలోవాట్-అవర్ (kWh)", or: "କିଲୋୱାଟ-ଆୱାର (kWh)", isCorrect: true },
      { en: "Ampere (A)", hi: "एम्पियर (A)", mr: "अँपिअर (A)", kn: "ಆಂಪಿಯರ್ (A)", te: "ఆంపియర్ (A)", or: "ଏମ୍ପିୟର (A)", isCorrect: false },
      { en: "Volt (V)", hi: "वोल्ट (V)", mr: "व्होल्ट (V)", kn: "ವೋಲ್ಟ್ (V)", te: "వోల్ట్ (V)", or: "ଭୋଲ୍ଟ (V)", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is thermal runaway?",
    question_text_hi: "थर्मल रनवे क्या है?",
    question_text_mr: "थर्मल रनवे म्हणजे काय?",
    question_text_kn: "ಥರ್ಮಲ್ ರನ್‌ಅವೇ ಎಂದರೇನು?",
    question_text_te: "థర్మల్ రన్‌అవే అంటే ఏమిటి?",
    question_text_or: "ଥର୍ମାଲ୍ ରନୱେ କଣ?",
    options: [
      { en: "Normal battery temp", hi: "बैटरी का सामान्य तापमान", mr: "बॅटरीचे सामान्य तापमान", kn: "ಬ್ಯಾಟರಿಯ ಸಾಮಾನ್ಯ ತಾಪಮಾನ", te: "సాధారణ బ్యాటరీ ఉష్ణోగ్రత", or: "ବ୍ୟାଟେରୀର ସାଧାରଣ ତାପମାତ୍ରା", isCorrect: false },
      { en: "Uncontrolled rise in heat", hi: "बैटरी में अनियंत्रित गर्मी का बढ़ना", mr: "बॅटरीमध्ये उष्णतेची अनियंत्रित वाढ", kn: "ಬ್ಯಾಟರಿಯಲ್ಲಿ ಶಾಖದ ಅನಿಯಂತ್ರಿತ ಏರಿಕೆ", te: "బ్యాటరీలో అదుపులేని వేడి పెరుగుదల", or: "ବ୍ୟାଟେରୀରେ ଅନିୟନ୍ତ୍ରିତ ଉତ୍ତାପ ବୃଦ୍ଧି", isCorrect: true },
      { en: "Motor cooling", hi: "मोटर का ठंडा होना", mr: "मोटार थंड करणे", kn: "ಮೋಟಾರ್ ಕೂಲಿಂಗ್", te: "మోటారు శీతలీకరణ", or: "ମୋଟର କୁଲିଂ", isCorrect: false },
      { en: "Normal charging", hi: "चार्जिंग की सामान्य प्रक्रिया", mr: "सामान्य चार्जिंग प्रक्रिया", kn: "ಸಾಮಾನ್ಯ ಚಾರ್ಜಿಂಗ್", te: "సాధారణ ఛార్జింగ్", or: "ସାଧାରଣ ଚାର୍ଜିଂ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is the function of controller in EV?",
    question_text_hi: "EV में कंट्रोलर का क्या काम है?",
    question_text_mr: "EV मध्ये कंट्रोलरचे कार्य काय आहे?",
    question_text_kn: "EV ನಲ್ಲಿ ಕಂಟ್ರೋಲರ್‌ನ ಕೆಲಸವೇನು?",
    question_text_te: "EVలో కంట్రోలర్ పని ఏమిటి?",
    question_text_or: "EV ରେ କଣ୍ଟ୍ରୋଲରର କାମ କଣ?",
    options: [
      { en: "Charge battery", hi: "बैटरी चार्ज करना", mr: "बॅटरी चार्ज करणे", kn: "ಬ್ಯಾಟರಿ ಚಾರ್ಜ್", te: "బ్యాటరీ ఛార్జింగ్", or: "ବ୍ୟାଟେରୀ ଚାର୍ଜିଂ", isCorrect: false },
      { en: "Control speed and torque", hi: "मोटर की गति और टॉर्क नियंत्रित करना", mr: "मोटार वेग आणि टॉर्क नियंत्रित करणे", kn: "ವೇಗ ಮತ್ತು ಟಾರ್ಕ್ ನಿಯಂತ್ರಣ", te: "వేగం మరియు టార్క్ నియంత్రణ", or: "ଗତି ଏବଂ ଟର୍କ ନିୟନ୍ତ୍ରଣ", isCorrect: true },
      { en: "Change tires", hi: "टायर बदलना", mr: "टायर बदलणे", kn: "ಟೈರ್ ಬದಲಾವಣೆ", te: "టైర్లు మార్చడం", or: "ଟାୟାର ବଦଳାଇବା", isCorrect: false },
      { en: "Fill fuel", hi: "ईंधन भरना", mr: "इंधन भरणे", kn: "ಇಂಧನ ತುಂಬಿಸುವುದು", te: "ఇంధనం నింపడం", or: "ଇନ୍ଧନ ଭରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is the use of DC-DC converter?",
    question_text_hi: "DC-DC कनवर्टर का क्या उपयोग है?",
    question_text_mr: "DC-DC कन्व्हर्टरचा उपयोग काय आहे?",
    question_text_kn: "DC-DC ಪರಿವರ್ತಕದ ಉಪಯೋಗವೇನು?",
    question_text_te: "DC-DC కన్వర్టర్ ఉపయోగం ఏమిటి?",
    question_text_or: "DC-DC କନଭର୍ଟରର ବ୍ୟବହାର କଣ?",
    options: [
      { en: "High to low voltage", hi: "उच्च वोल्टेज को निम्न वोल्टेज में बदलना", mr: "उच्च ते कमी व्होल्टेज", kn: "ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ ವೋಲ್ಟೇಜ್", te: "హై టు లో వోల్టేజ్", or: "ଉଚ୍ଚରୁ ନିମ୍ନ ଭୋଲ୍ଟେଜ୍", isCorrect: true },
      { en: "AC to DC", hi: "AC को DC में बदलना", mr: "AC ते DC", kn: "AC ಇಂದ DC", te: "AC నుండి DC", or: "AC ରୁ DC", isCorrect: false },
      { en: "Increase speed", hi: "मोटर की गति बढ़ाना", mr: "वेग वाढवणे", kn: "ವೇಗ ಹೆಚ್ಚಳ", te: "వేగం పెంచడం", or: "ଗତି ବଢାଇବା", isCorrect: false },
      { en: "Cool battery", hi: "बैटरी को ठंडा करना", mr: "बॅटरी थंड करणे", kn: "ಬ್ಯಾಟರಿ ತಂಪಾಗಿಸುವುದು", te: "బ్యాటరీ కూలింగ్", or: "ବ୍ୟାଟେରୀ କୁଲିଂ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What does SOC mean in EV?",
    question_text_hi: "EV में सोक (SOC) का क्या अर्थ है?",
    question_text_mr: "EV मध्ये SOC चा अर्थ काय आहे?",
    question_text_kn: "EV ನಲ್ಲಿ SOC ಎಂದರೆ ಏನು?",
    question_text_te: "EVలో SOC అంటే ఏమిటి?",
    question_text_or: "EV ରେ SOC ର ଅର୍ଥ କଣ?",
    options: [
      { en: "Speed of Charging", hi: "स्पीड ऑफ चार्जिंग", mr: "स्पीड ऑफ चार्जिंग", kn: "ಚಾರ್ಜಿಂಗ್ ವೇಗ", te: "ఛార్జింగ్ వేగం", or: "ଚାର୍ଜିଂ ସ୍ପିଡ୍", isCorrect: false },
      { en: "State of Charge", hi: "स्टेट ऑफ चार्ज", mr: "स्टेट ऑफ चार्ज", kn: "ಸ್ಟೇಟ್ ಆಫ್ ಚಾರ್ಜ್", te: "స్టేట్ ఆఫ్ ఛార్జ్", or: "ଷ୍ଟେଟ୍ ଅଫ୍ ଚାର୍ଜ", isCorrect: true },
      { en: "Operation Control", hi: "सिस्टम ऑपरेशन कंट्रोल", mr: "सिस्टम ऑपरेशन कंट्रोल", kn: "ಆಪರೇಷನ್ ಕಂಟ್ರೋಲ್", te: "ఆపరేషన్ కంట్రోల్", or: "ଅପରେସନ୍ କଣ୍ଟ୍ରୋଲ୍", isCorrect: false },
      { en: "Safety Component", hi: "सेफ्टी ऑफ कॉम्पोनेंट", mr: "सेफ्टी ऑफ कॉम्पोनेंट", kn: "ಸೇಫ್ಟಿ ಕಾಂಪೊನೆಂಟ್", te: "సేఫ్టీ కాంపోనెంట్", or: "ସେଫ୍ଟି କମ୍ପୋନେଣ୍ଟ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "Where is the hub motor located?",
    question_text_hi: "EV स्कूटर में हब मोटर कहाँ लगी होती है?",
    question_text_mr: "EV स्कूटरमध्ये हब मोटर कोठे असते?",
    question_text_kn: "ಹಬ್ ಮೋಟಾರ್ ಎಲ್ಲಿದೆ?",
    question_text_te: "హబ్ మోటార్ ఎక్కడ ఉంటుంది?",
    question_text_or: "ହବ୍ ମୋଟର କେଉଁଠାରେ ଥାଏ?",
    options: [
      { en: "Under seat", hi: "सीट के नीचे", mr: "सीट खाली", kn: "ಸೀಟಿನ ಅಡಿಯಲ್ಲಿ", te: "సీటు కింద", or: "ସିଟ୍ ତଳେ", isCorrect: false },
      { en: "Inside wheel", hi: "पहिये के अंदर", mr: "चाकाच्या आत", kn: "ಚಕ್ರದ ಒಳಗೆ", te: "చక్రం లోపల", or: "ଚକ ଭିତରେ", isCorrect: true },
      { en: "In handle", hi: "हैंडल में", mr: "हँडलमध्ये", kn: "ಹ್ಯಾಂಡಲ್‌ನಲ್ಲಿ", te: "హ్యాండిల్‌లో", or: "ହ୍ୟାଣ୍ଡେଲରେ", isCorrect: false },
      { en: "Near battery", hi: "बैटरी के पास", mr: "बॅटरीजवळ", kn: "ಬ್ಯಾಟರಿ ಹತ್ತಿರ", te: "బ్యాటరీ దగ్గర", or: "ବ୍ୟାଟେରୀ ପାଖରେ", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "Why AC input and DC output in charger?",
    question_text_hi: "चार्जर में इनपुट AC और आउटपुट DC क्यों होता है?",
    question_text_mr: "चार्जरमध्ये AC इनपुट आणि DC आउटपुट का असते?",
    question_text_kn: "ಚಾರ್ಜರ್‌ನಲ್ಲಿ ಏಕೆ AC ಮತ್ತು DC ಇರುತ್ತದೆ?",
    question_text_te: "ఛార్జర్‌లో AC ఇన్‌పుట్ మరియు DC అవుట్‌పుట్ ఎందుకు ఉంటుంది?",
    question_text_or: "ଚାର୍ଜରରେ କାହିଁକି AC ଏବଂ DC ଥାଏ?",
    options: [
      { en: "Battery charges on AC", hi: "बैटरी AC पर चार्ज होती है", mr: "बॅटरी AC वर चार्ज होते", kn: "ಬ್ಯಾಟರಿ AC ಯಲ್ಲಿ ಚಾರ್ಜ್ ಆಗುತ್ತದೆ", te: "బ్యాటరీ AC పై ఛార్జ్ అవుతుంది", or: "ବ୍ୟାଟେରୀ AC ରେ ଚାର୍ଜ ହୁଏ", isCorrect: false },
      { en: "Battery stores DC", hi: "बैटरी DC पर स्टोर करती है", mr: "बॅटरी DC साठवते", kn: "ಬ್ಯಾಟರಿ DC ಯನ್ನು ಸಂಗ್ರಹಿಸುತ್ತದೆ", te: "బ్యాటరీ DC ని స్టోర్ చేస్తుంది", or: "ବ୍ୟାଟେରୀ DC ଷ୍ଟୋର୍ କରେ", isCorrect: true },
      { en: "Motor runs on AC", hi: "मोटर AC पर चलती है", mr: "मोटार AC वर चालते", kn: "ಮೋಟಾರ್ AC ಯಲ್ಲಿ ಚಲಿಸುತ್ತದೆ", te: "మోటారు AC పై నడుస్తుంది", or: "ମୋଟର AC ରେ ଚାଲେ", isCorrect: false },
      { en: "No reason", hi: "कोई खास कारण नहीं", mr: "काही कारण नाही", kn: "ಯಾವುದೇ ಕಾರಣವಿಲ್ಲ", te: "కారణం లేదు", or: "କୌଣସି କାରଣ ନାହିଁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is cell balancing?",
    question_text_hi: "बैटरी सेल बैलेंसिंग का क्या मतलब है?",
    question_text_mr: "बॅटरी सेल बॅलन्सिंग म्हणजे काय?",
    question_text_kn: "ಸೆಲ್ ಬ್ಯಾಲೆನ್ಸಿಂಗ್ ಎಂದರೇನು?",
    question_text_te: "సెల్ బ్యాలెన్సింగ్ అంటే ఏమిటి?",
    question_text_or: "ସେଲ୍ ବାଲାନ୍ସିଂ କଣ?",
    options: [
      { en: "Equal voltage", hi: "सभी सेल्स का समान वोल्टेज बनाए रखना", mr: "समान व्होल्टेज", kn: "ಸಮಾನ ವೋಲ್ಟೇಜ್", te: "సమాన వోల్టేజీ", or: "ସମାନ ଭୋଲ୍ଟେଜ୍", isCorrect: true },
      { en: "Replacing cells", hi: "सेल्स को बदलना", mr: "सेल्स बदलणे", kn: "ಸೆಲ್ ಬದಲಾವಣೆ", te: "సెల్స్ మార్చడం", or: "ସେଲ୍ ବଦଳାଇବା", isCorrect: false },
      { en: "Cooling", hi: "बैटरी को ठंडा करना", mr: "थंड करणे", kn: "ತಂಪಾಗಿಸುವುದು", te: "చల్లబరచడం", or: "ଥଣ୍ଡା କରିବା", isCorrect: false },
      { en: "Heating", hi: "सेल्स को गर्म करना", mr: "गरम करणे", kn: "ಬಿಸಿ ಮಾಡುವುದು", te: "వేడి చేయడం", or: "ଗରମ କରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What is in a powertrain?",
    question_text_hi: "EV में पावर ट्रेन में क्या शामिल है?",
    question_text_mr: "पॉवर ट्रेनमध्ये काय असते?",
    question_text_kn: "ಪವರ್‌ಟ್ರೇನ್‌ನಲ್ಲಿ ಏನಿದೆ?",
    question_text_te: "పవర్‌ట్రైన్‌లో ఏముంటుంది?",
    question_text_or: "ପାୱାରଟ୍ରେନରେ କଣ ଥାଏ?",
    options: [
      { en: "Only battery", hi: "केवल बैटरी", mr: "फक्त बॅटरी", kn: "ಕೇವಲ ಬ್ಯಾಟರಿ", te: "కేవలం బ్యాటరీ", or: "କେବଳ ବ୍ୟାଟେରୀ", isCorrect: false },
      { en: "Motor, controller, battery", hi: "मोटर, कंट्रोलर, और बैटरी", mr: "मोटार, कंट्रोलर, बॅटरी", kn: "ಮೋಟಾರ್, ಕಂಟ್ರೋಲರ್, ಬ್ಯಾಟರಿ", te: "మోటారు, కంట్రోలర్, బ్యాటరీ", or: "ମୋଟର, କଣ୍ଟ୍ରୋଲର, ବ୍ୟାଟେରୀ", isCorrect: true },
      { en: "Only tires", hi: "केवल टायर", mr: "फक्त टायर", kn: "ಕೇವಲ ಟೈರ್", te: "కేవలం టైర్లు", or: "କେବଳ ଟାୟାର", isCorrect: false },
      { en: "Only charger", hi: "केवल चार्जर", mr: "फक्त चार्जर", kn: "ಕೇವಲ ಚಾರ್ಜರ್", te: "కేవలం ఛార్జర్", or: "କେବଳ ଚାର୍ଜର", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "Proper battery temp?",
    question_text_hi: "EV बैटरी को कितने डिग्री तापमान पर रखना उचित है?",
    question_text_mr: "योग्य बॅटरी तापमान?",
    question_text_kn: "ಸೂಕ್ತ ಬ್ಯಾಟರಿ ತಾಪಮಾನ?",
    question_text_te: "సరైన బ్యాటరీ ఉష్ణోగ్రత?",
    question_text_or: "ସଠିକ୍ ବ୍ୟାଟେରୀ ତାପମାତ୍ରା?",
    options: [
      { en: "0-10°C", hi: "0-10°C", mr: "0-10°C", kn: "0-10°C", te: "0-10°C", or: "0-10°C", isCorrect: false },
      { en: "15-35°C", hi: "15-35°C", mr: "15-35°C", kn: "15-35°C", te: "15-35°C", or: "15-35°C", isCorrect: true },
      { en: "50-60°C", hi: "50-60°C", mr: "50-60°C", kn: "50-60°C", te: "50-60°C", or: "50-60°C", isCorrect: false },
      { en: "70-80°C", hi: "70-80°C", mr: "70-80°C", kn: "70-80°C", te: "70-80°C", or: "70-80°C", isCorrect: false },
    ],
    points: 1, difficulty: "medium"
  },
  {
    role: "technician",
    step: 1,
    question_text_en: "What does throttle do?",
    question_text_hi: "EV में थ्रॉटल क्या करता है?",
    question_text_mr: "थ्रॉटल काय करते?",
    question_text_kn: "ಥ್ರೊಟಲ್ ಏನು ಮಾಡುತ್ತದೆ?",
    question_text_te: "థొరెటల్ ఏమి చేస్తుంది?",
    question_text_or: "ଥ୍ରୋଟଲ୍ କଣ କରେ?",
    options: [
      { en: "Brakes", hi: "ब्रेक लगाता है", mr: "ब्रेक लावणे", kn: "ಬ್ರೇಕ್", te: "బ్రేకులు", or: "ବ୍ରେକ୍", isCorrect: false },
      { en: "Controls speed", hi: "गति नियंत्रित करता है", mr: "वेग नियंत्रित करणे", kn: "ವೇಗ ನಿಯಂತ್ರಣ", te: "వేగ నియంత్రణ", or: "ଗତି ନିୟନ୍ତ୍ରଣ", isCorrect: true },
      { en: "Charges", hi: "बैटरी चार्ज करता है", mr: "चार्ज करणे", kn: "ಚಾರ್ಜ್", te: "ఛార్జింగ్", or: "ଚାର୍ଜିଂ", isCorrect: false },
      { en: "Lights", hi: "लाइट जलाता है", mr: "लाईट लावणे", kn: "ಲೈಟ್", te: "లైట్లు", or: "ଲାଇଟ୍", isCorrect: false },
    ],
    points: 1, difficulty: "easy"
  }
];

async function updateTranslations() {
  console.log('🌐 Adding multilingual translations to questions...\n');
  console.log(`📝 Processing ${questions.length} questions...\n`);

  let updated = 0;
  let notFound = 0;

  try {
    for (const q of questions) {
      // Update question text translations
      const result = await sql`
                UPDATE verification_questions 
                SET question_text_mr = ${q.question_text_mr || ''},
                    question_text_kn = ${q.question_text_kn || ''},
                    question_text_te = ${q.question_text_te || ''},
                    question_text_or = ${q.question_text_or || ''},
                    options = ${JSON.stringify(q.options)}::jsonb
                WHERE question_text_en = ${q.question_text_en}
                RETURNING id
            `;

      if (result.length > 0) {
        console.log(`✅ Updated: ${q.question_text_en.substring(0, 50)}...`);
        updated++;
      } else {
        console.log(`⚠️ Not found: ${q.question_text_en.substring(0, 50)}...`);
        notFound++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ Updated: ${updated} questions`);
    if (notFound > 0) {
      console.log(`⚠️ Not found: ${notFound} questions (may need exact English text match)`);
    }
    console.log('🎉 Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTranslations();
