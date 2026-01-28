// Verification Questions for EVeerified Native App
// Full multilingual support: English, Hindi, Marathi, Kannada, Telugu, Odia

export interface QuestionData {
  role: string;
  step: number;
  question_text_en: string;
  question_text_hi: string;
  question_text_mr?: string;
  question_text_kn?: string;
  question_text_te?: string;
  question_text_or?: string;
  options: {
    en: string;
    hi: string;
    mr?: string;
    kn?: string;
    te?: string;
    or?: string;
    isCorrect: boolean
  }[];
  points: number;
  difficulty: string;
}

// EV Technician Questions - Step 1 (15 questions)
export const technicianStep1Questions: QuestionData[] = [
  {
    role: "technician", step: 1,
    question_text_en: "Which cell technology is most commonly used in EV batteries?",
    question_text_hi: "EV बैटरी में सबसे सामान्य रूप से कौन सी सेल तकनीक उपयोग की जाती है?",
    question_text_mr: "EV बॅटरीमध्ये सर्वात सामान्यपणे कोणती सेल तंत्रज्ञान वापरली जाते?",
    question_text_kn: "EV ಬ್ಯಾಟರಿಗಳಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಸೆಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
    question_text_te: "EV బ్యాటరీలలో సాధారణంగా ఏ సెల్ టెక్నాలజీ ఉపయోగించబడుతుంది?",
    question_text_or: "EV ବ୍ୟାଟେରୀରେ ସାଧାରଣତଃ କେଉଁ ସେଲ୍ ଟେକ୍ନୋଲୋଜି ବ୍ୟବହୃତ ହୁଏ?",
    options: [
      { en: "Lead-Acid", hi: "लीड-एसिड", mr: "लेड-अ‍ॅसिड", kn: "ಲೆಡ್-ಆಸಿಡ್", te: "లెడ్-యాసిడ్", or: "ଲେଡ୍-ଏସିଡ୍", isCorrect: false },
      { en: "Lithium-Ion", hi: "लिथियम-आयन", mr: "लिथियम-आयन", kn: "ಲಿಥಿಯಂ-ಅಯಾನ್", te: "లిథియం-అయాన్", or: "ଲିଥିୟମ୍-ଆୟନ", isCorrect: true },
      { en: "Nickel-Cadmium", hi: "निकल-कैडमियम", mr: "निकल-कॅडमियम", kn: "ನಿಕಲ್-ಕ್ಯಾಡ್ಮಿಯಮ್", te: "నికెల్-కాడ్మియం", or: "ନିକେଲ୍-କ୍ୟାଡମିୟମ୍", isCorrect: false },
      { en: "Zinc-Carbon", hi: "जिंक-कार्बन", mr: "झिंक-कार्बन", kn: "ಜಿಂಕ್-ಕಾರ್ಬನ್", te: "జింక్-కార్బన్", or: "ଜିଙ୍କ-କାର୍ବନ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is the full form of BMS?",
    question_text_hi: "BMS का पूरा नाम क्या है?",
    question_text_mr: "BMS चे पूर्ण रूप काय आहे?",
    question_text_kn: "BMS ನ ಪೂರ್ಣ ರೂಪವೇನು?",
    question_text_te: "BMS పూర్తి రూపం ఏమిటి?",
    question_text_or: "BMS ର ସମ୍ପୂର୍ଣ୍ଣ ରୂପ କ'ଣ?",
    options: [
      { en: "Battery Monitoring System", hi: "बैटरी मॉनिटरिंग सिस्टम", mr: "बॅटरी मॉनिटरिंग सिस्टम", kn: "ಬ್ಯಾಟರಿ ಮಾನಿಟರಿಂಗ್ ಸಿಸ್ಟಮ್", te: "బ్యాటరీ మానిటరింగ్ సిస్టమ్", or: "ବ୍ୟାଟେରୀ ମନିଟରିଂ ସିଷ୍ଟମ", isCorrect: false },
      { en: "Battery Management System", hi: "बैटरी मैनेजमेंट सिस्टम", mr: "बॅटरी मॅनेजमेंट सिस्टम", kn: "ಬ್ಯಾಟರಿ ಮ್ಯಾನೇಜ್ಮೆಂಟ್ ಸಿಸ್ಟಮ್", te: "బ్యాటరీ మేనేజ్మెంట్ సిస్టమ్", or: "ବ୍ୟାଟେରୀ ମ୍ୟାନେଜମେଣ୍ଟ ସିଷ୍ଟମ", isCorrect: true },
      { en: "Basic Motor System", hi: "बेसिक मोटर सिस्टम", mr: "बेसिक मोटर सिस्टम", kn: "ಬೇಸಿಕ್ ಮೋಟಾರ್ ಸಿಸ್ಟಮ್", te: "బేసిక్ మోటార్ సిస్టమ్", or: "ବେସିକ୍ ମୋଟର ସିଷ୍ଟମ", isCorrect: false },
      { en: "Balanced Mode System", hi: "बैलेंस्ड मोड सिस्टम", mr: "बॅलेंस्ड मोड सिस्टम", kn: "ಬ್ಯಾಲೆನ್ಸ್ಡ್ ಮೋಡ್ ಸಿಸ್ಟಮ್", te: "బ్యాలెన్స్‌డ్ మోడ్ సిస్టమ్", or: "ବ୍ୟାଲେନ୍ସଡ୍ ମୋଡ୍ ସିଷ୍ଟମ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What does BLDC motor mean in EV?",
    question_text_hi: "EV में BLDC मोटर का क्या अर्थ है?",
    question_text_mr: "EV मध्ये BLDC मोटर म्हणजे काय?",
    question_text_kn: "EV ನಲ್ಲಿ BLDC ಮೋಟಾರ್ ಎಂದರೆ ಏನು?",
    question_text_te: "EV లో BLDC మోటార్ అంటే ఏమిటి?",
    question_text_or: "EV ରେ BLDC ମୋଟର ର ଅର୍ଥ କ'ଣ?",
    options: [
      { en: "Brushed Direct Current", hi: "ब्रश्ड डायरेक्ट करंट", mr: "ब्रश्ड डायरेक्ट करंट", kn: "ಬ್ರಷ್ಡ್ ಡೈರೆಕ್ಟ್ ಕರೆಂಟ್", te: "బ్రష్డ్ డైరెక్ట్ కరెంట్", or: "ବ୍ରଶଡ୍ ଡାଇରେକ୍ଟ କରେଣ୍ଟ", isCorrect: false },
      { en: "Brushless Direct Current", hi: "ब्रशलेस डायरेक्ट करंट", mr: "ब्रशलेस डायरेक्ट करंट", kn: "ಬ್ರಷ್‌ಲೆಸ್ ಡೈರೆಕ್ಟ್ ಕರೆಂಟ್", te: "బ్రష్‌లెస్ డైరెక్ట్ కరెంట్", or: "ବ୍ରଶଲେସ୍ ଡାଇରେକ୍ଟ କରେଣ୍ଟ", isCorrect: true },
      { en: "Basic Low Drive Current", hi: "बेसिक लो ड्राइव करंट", mr: "बेसिक लो ड्राइव्ह करंट", kn: "ಬೇಸಿಕ್ ಲೋ ಡ್ರೈವ್ ಕರೆಂಟ್", te: "బేసిక్ లో డ్రైవ్ కరెంట్", or: "ବେସିକ୍ ଲୋ ଡ୍ରାଇଭ କରେଣ୍ଟ", isCorrect: false },
      { en: "Balanced Load Distribution Current", hi: "बैलेंस्ड लोड डिस्ट्रीब्यूशन करंट", mr: "बॅलेंस्ड लोड डिस्ट्रिब्यूशन करंट", kn: "ಬ್ಯಾಲೆನ್ಸ್ಡ್ ಲೋಡ್ ಡಿಸ್ಟ್ರಿಬ್ಯೂಶನ್ ಕರೆಂಟ್", te: "బ్యాలెన్స్‌డ్ లోడ్ డిస్ట్రిబ్యూషన్ కరెంట్", or: "ବ୍ୟାଲେନ୍ସଡ୍ ଲୋଡ୍ ଡିଷ୍ଟ୍ରିବ୍ୟୁସନ କରେଣ୍ଟ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is the function of regenerative braking?",
    question_text_hi: "रीजनरेटिव ब्रेकिंग का क्या काम है?",
    question_text_mr: "रिजनरेटिव्ह ब्रेकिंगचे काम काय आहे?",
    question_text_kn: "ರಿಜನರೇಟಿವ್ ಬ್ರೇಕಿಂಗ್‌ನ ಕಾರ್ಯವೇನು?",
    question_text_te: "రీజెనరేటివ్ బ్రేకింగ్ పని ఏమిటి?",
    question_text_or: "ରିଜେନେରେଟିଭ ବ୍ରେକିଂର କାର୍ଯ୍ୟ କ'ଣ?",
    options: [
      { en: "Increase speed", hi: "गति बढ़ाना", mr: "वेग वाढवणे", kn: "ವೇಗವನ್ನು ಹೆಚ್ಚಿಸು", te: "వేగాన్ని పెంచడం", or: "ଗତି ବଢାଇବା", isCorrect: false },
      { en: "Send energy back to battery during braking", hi: "ब्रेकिंग के दौरान ऊर्जा वापस बैटरी में भेजना", mr: "ब्रेकिंग दरम्यान ऊर्जा बॅटरीत परत पाठवणे", kn: "ಬ್ರೇಕಿಂಗ್ ಸಮಯದಲ್ಲಿ ಶಕ್ತಿಯನ್ನು ಬ್ಯಾಟರಿಗೆ ಕಳುಹಿಸು", te: "బ్రేకింగ్ సమయంలో శక్తిని బ్యాటరీకి పంపడం", or: "ବ୍ରେକିଂ ସମୟରେ ଶକ୍ତି ବ୍ୟାଟେରୀକୁ ପଠାଇବା", isCorrect: true },
      { en: "Increase tire grip", hi: "टायर की पकड़ बढ़ाना", mr: "टायरची पकड वाढवणे", kn: "ಟೈರ್ ಹಿಡಿತವನ್ನು ಹೆಚ್ಚಿಸು", te: "టైర్ గ్రిప్ పెంచడం", or: "ଟାୟାର ଗ୍ରିପ୍ ବଢାଇବା", isCorrect: false },
      { en: "Cool down the motor", hi: "मोटर को ठंडा करना", mr: "मोटर थंड करणे", kn: "ಮೋಟಾರ್ ತಂಪಾಗಿಸು", te: "మోటార్‌ను చల్లబరచడం", or: "ମୋଟର ଥଣ୍ଡା କରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "In what unit is EV battery capacity measured?",
    question_text_hi: "EV बैटरी की क्षमता किसमें मापी जाती है?",
    question_text_mr: "EV बॅटरीची क्षमता कशात मोजली जाते?",
    question_text_kn: "EV ಬ್ಯಾಟರಿ ಸಾಮರ್ಥ್ಯವನ್ನು ಯಾವ ಘಟಕದಲ್ಲಿ ಅಳೆಯಲಾಗುತ್ತದೆ?",
    question_text_te: "EV బ్యాటరీ సామర్థ్యాన్ని ఏ యూనిట్‌లో కొలుస్తారు?",
    question_text_or: "EV ବ୍ୟାଟେରୀ କ୍ଷମତା କେଉଁ ୟୁନିଟରେ ମାପ ହୁଏ?",
    options: [
      { en: "Watt (W)", hi: "वाट (W)", mr: "वॅट (W)", kn: "ವಾಟ್ (W)", te: "వాట్ (W)", or: "ୱାଟ (W)", isCorrect: false },
      { en: "Kilowatt-hour (kWh)", hi: "किलोवाट-ऑवर (kWh)", mr: "किलोवॅट-अवर (kWh)", kn: "ಕಿಲೋವಾಟ್-ಅವರ್ (kWh)", te: "కిలోవాట్-అవర్ (kWh)", or: "କିଲୋୱାଟ-ଅୱାର (kWh)", isCorrect: true },
      { en: "Ampere (A)", hi: "एम्पियर (A)", mr: "अँपियर (A)", kn: "ಆಂಪಿಯರ್ (A)", te: "ఆంపియర్ (A)", or: "ଆମ୍ପିୟର (A)", isCorrect: false },
      { en: "Volt (V)", hi: "वोल्ट (V)", mr: "व्होल्ट (V)", kn: "ವೋಲ್ಟ್ (V)", te: "వోల్ట్ (V)", or: "ଭୋଲ୍ଟ (V)", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is thermal runaway?",
    question_text_hi: "थर्मल रनवे क्या है?",
    question_text_mr: "थर्मल रनअवे म्हणजे काय?",
    question_text_kn: "ಥರ್ಮಲ್ ರನ್‌ಅವೇ ಎಂದರೆ ಏನು?",
    question_text_te: "థర్మల్ రన్‌అవే అంటే ఏమిటి?",
    question_text_or: "ଥର୍ମାଲ ରନଆୱେ କ'ଣ?",
    options: [
      { en: "Normal temperature of battery", hi: "बैटरी का सामान्य तापमान", mr: "बॅटरीचे सामान्य तापमान", kn: "ಬ್ಯಾಟರಿಯ ಸಾಮಾನ್ಯ ತಾಪಮಾನ", te: "బ్యాటరీ సాధారణ ఉష్ణోగ్రత", or: "ବ୍ୟାଟେରୀର ସାଧାରଣ ତାପମାତ୍ରା", isCorrect: false },
      { en: "Uncontrolled rise in heat in battery", hi: "बैटरी में अनियंत्रित गर्मी का बढ़ना", mr: "बॅटरीतील अनियंत्रित उष्णता वाढ", kn: "ಬ್ಯಾಟರಿಯಲ್ಲಿ ಅನಿಯಂತ್ರಿತ ಶಾಖ ಹೆಚ್ಚಳ", te: "బ్యాటరీలో అనియంత్రిత వేడి పెరుగుదల", or: "ବ୍ୟାଟେରୀରେ ଅନିୟନ୍ତ୍ରିତ ଗରମ ବୃଦ୍ଧି", isCorrect: true },
      { en: "Motor cooling", hi: "मोटर का ठंडा होना", mr: "मोटर थंड होणे", kn: "ಮೋಟಾರ್ ತಂಪಾಗುವಿಕೆ", te: "మోటార్ చల్లబడటం", or: "ମୋଟର ଥଣ୍ଡା ହେବା", isCorrect: false },
      { en: "Normal charging process", hi: "चार्जिंग की सामान्य प्रक्रिया", mr: "चार्जिंगची सामान्य प्रक्रिया", kn: "ಸಾಮಾನ್ಯ ಚಾರ್ಜಿಂಗ್ ಪ್ರಕ್ರಿಯೆ", te: "సాధారణ ఛార్జింగ్ ప్రక్రియ", or: "ସାଧାରଣ ଚାର୍ଜିଂ ପ୍ରକ୍ରିୟା", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is the function of controller in EV?",
    question_text_hi: "EV में कंट्रोलर का क्या काम है?",
    question_text_mr: "EV मध्ये कंट्रोलरचे काम काय आहे?",
    question_text_kn: "EV ನಲ್ಲಿ ಕಂಟ್ರೋಲರ್‌ನ ಕಾರ್ಯವೇನು?",
    question_text_te: "EV లో కంట్రోలర్ పని ఏమిటి?",
    question_text_or: "EV ରେ କଣ୍ଟ୍ରୋଲରର କାର୍ଯ୍ୟ କ'ଣ?",
    options: [
      { en: "Charge the battery", hi: "बैटरी चार्ज करना", mr: "बॅटरी चार्ज करणे", kn: "ಬ್ಯಾಟರಿ ಚಾರ್ಜ್ ಮಾಡು", te: "బ్యాటరీని ఛార్జ్ చేయడం", or: "ବ୍ୟାଟେରୀ ଚାର୍ଜ କରିବା", isCorrect: false },
      { en: "Control motor speed and torque", hi: "मोटर की गति और टॉर्क नियंत्रित करना", mr: "मोटरचा वेग आणि टॉर्क नियंत्रित करणे", kn: "ಮೋಟಾರ್ ವೇಗ ಮತ್ತು ಟಾರ್ಕ್ ನಿಯಂತ್ರಿಸು", te: "మోటార్ వేగం మరియు టార్క్ నియంత్రించడం", or: "ମୋଟର ଗତି ଓ ଟର୍କ ନିୟନ୍ତ୍ରଣ କରିବା", isCorrect: true },
      { en: "Change tires", hi: "टायर बदलना", mr: "टायर बदलणे", kn: "ಟೈರ್ ಬದಲಾಯಿಸು", te: "టైర్లు మార్చడం", or: "ଟାୟାର ବଦଳାଇବା", isCorrect: false },
      { en: "Fill fuel", hi: "ईंधन भरना", mr: "इंधन भरणे", kn: "ಇಂಧನ ತುಂಬು", te: "ఇంధనం నింపడం", or: "ଇନ୍ଧନ ଭରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is the use of DC-DC converter?",
    question_text_hi: "DC-DC कनवर्टर का क्या उपयोग है?",
    question_text_mr: "DC-DC कन्व्हर्टरचा उपयोग काय आहे?",
    question_text_kn: "DC-DC ಕನ್ವರ್ಟರ್‌ನ ಉಪಯೋಗವೇನು?",
    question_text_te: "DC-DC కన్వర్టర్ ఉపయోగం ఏమిటి?",
    question_text_or: "DC-DC କନଭର୍ଟରର ଉପଯୋଗ କ'ଣ?",
    options: [
      { en: "Convert high voltage to low voltage", hi: "उच्च वोल्टेज को निम्न वोल्टेज में बदलना", mr: "उच्च व्होल्टेज कमी व्होल्टेजमध्ये बदलणे", kn: "ಹೆಚ್ಚಿನ ವೋಲ್ಟೇಜ್ ಅನ್ನು ಕಡಿಮೆ ವೋಲ್ಟೇಜ್‌ಗೆ ಪರಿವರ್ತಿಸು", te: "అధిక వోల్టేజ్‌ను తక్కువ వోల్టేజ్‌గా మార్చడం", or: "ଉଚ୍ଚ ଭୋଲ୍ଟେଜକୁ କମ ଭୋଲ୍ଟେଜରେ ବଦଳାଇବା", isCorrect: true },
      { en: "Convert AC to DC", hi: "AC को DC में बदलना", mr: "AC ला DC मध्ये बदलणे", kn: "AC ಅನ್ನು DC ಗೆ ಪರಿವರ್ತಿಸು", te: "AC ని DC గా మార్చడం", or: "AC କୁ DC ରେ ବଦଳାଇବା", isCorrect: false },
      { en: "Increase motor speed", hi: "मोटर की गति बढ़ाना", mr: "मोटरचा वेग वाढवणे", kn: "ಮೋಟಾರ್ ವೇಗ ಹೆಚ್ಚಿಸು", te: "మోటార్ వేగాన్ని పెంచడం", or: "ମୋଟର ଗତି ବଢାଇବା", isCorrect: false },
      { en: "Cool the battery", hi: "बैटरी को ठंडा करना", mr: "बॅटरी थंड करणे", kn: "ಬ್ಯಾಟರಿ ತಂಪಾಗಿಸು", te: "బ్యాటరీని చల్లబరచడం", or: "ବ୍ୟାଟେରୀ ଥଣ୍ଡା କରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What does SOC mean in EV?",
    question_text_hi: "EV में SOC का क्या अर्थ है?",
    question_text_mr: "EV मध्ये SOC म्हणजे काय?",
    question_text_kn: "EV ನಲ್ಲಿ SOC ಎಂದರೆ ಏನು?",
    question_text_te: "EV లో SOC అంటే ఏమిటి?",
    question_text_or: "EV ରେ SOC ର ଅର୍ଥ କ'ଣ?",
    options: [
      { en: "Speed of Charging", hi: "स्पीड ऑफ चार्जिंग", mr: "स्पीड ऑफ चार्जिंग", kn: "ಸ್ಪೀಡ್ ಆಫ್ ಚಾರ್ಜಿಂಗ್", te: "స్పీడ్ ఆఫ్ ఛార్జింగ్", or: "ସ୍ପିଡ୍ ଅଫ୍ ଚାର୍ଜିଂ", isCorrect: false },
      { en: "State of Charge", hi: "स्टेट ऑफ चार्ज", mr: "स्टेट ऑफ चार्ज", kn: "ಸ್ಟೇಟ್ ಆಫ್ ಚಾರ್ಜ್", te: "స్టేట్ ఆఫ్ ఛార్జ్", or: "ଷ୍ଟେଟ୍ ଅଫ୍ ଚାର୍ଜ", isCorrect: true },
      { en: "System Operation Control", hi: "सिस्टम ऑपरेशन कंट्रोल", mr: "सिस्टम ऑपरेशन कंट्रोल", kn: "ಸಿಸ್ಟಮ್ ಆಪರೇಶನ್ ಕಂಟ್ರೋಲ್", te: "సిస్టమ్ ఆపరేషన్ కంట్రోల్", or: "ସିଷ୍ଟମ ଅପରେସନ କଣ୍ଟ୍ରୋଲ", isCorrect: false },
      { en: "Safety of Component", hi: "सेफ्टी ऑफ कॉम्पोनेंट", mr: "सेफ्टी ऑफ कंपोनंट", kn: "ಸೇಫ್ಟಿ ಆಫ್ ಕಾಂಪೊನೆಂಟ್", te: "సేఫ్టీ ఆఫ్ కంపోనెంట్", or: "ସେଫ୍ଟି ଅଫ୍ କମ୍ପୋନେଣ୍ଟ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "Where is the hub motor located in an EV scooter?",
    question_text_hi: "EV स्कूटर में हब मोटर कहाँ लगी होती है?",
    question_text_mr: "EV स्कूटरमध्ये हब मोटर कुठे असते?",
    question_text_kn: "EV ಸ್ಕೂಟರ್‌ನಲ್ಲಿ ಹಬ್ ಮೋಟಾರ್ ಎಲ್ಲಿದೆ?",
    question_text_te: "EV స్కూటర్‌లో హబ్ మోటార్ ఎక్కడ ఉంటుంది?",
    question_text_or: "EV ସ୍କୁଟରରେ ହବ ମୋଟର କେଉଁଠାରେ ଅଛି?",
    options: [
      { en: "Under the seat", hi: "सीट के नीचे", mr: "सीटच्या खाली", kn: "ಸೀಟ್ ಕೆಳಗೆ", te: "సీట్ కింద", or: "ସିଟ୍ ତଳେ", isCorrect: false },
      { en: "Inside the wheel", hi: "पहिये के अंदर", mr: "चाकाच्या आत", kn: "ಚಕ್ರದ ಒಳಗೆ", te: "చక్రం లోపల", or: "ଚକ ଭିତରେ", isCorrect: true },
      { en: "In the handle", hi: "हैंडल में", mr: "हँडलमध्ये", kn: "ಹ್ಯಾಂಡಲ್‌ನಲ್ಲಿ", te: "హ్యాండిల్‌లో", or: "ହ୍ୟାଣ୍ଡେଲରେ", isCorrect: false },
      { en: "Near the battery", hi: "बैटरी के पास", mr: "बॅटरीजवळ", kn: "ಬ್ಯಾಟರಿ ಬಳಿ", te: "బ్యాటరీ దగ్గర", or: "ବ୍ୟାଟେରୀ ପାଖରେ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "Why does a charger have AC input and DC output?",
    question_text_hi: "चार्जर में इनपुट AC और आउटपुट DC क्यों होता है?",
    question_text_mr: "चार्जरला AC इनपुट आणि DC आउटपुट का असते?",
    question_text_kn: "ಚಾರ್ಜರ್‌ಗೆ AC ಇನ್‌ಪುಟ್ ಮತ್ತು DC ಔಟ್‌ಪುಟ್ ಏಕೆ?",
    question_text_te: "ఛార్జర్‌కు AC ఇన్‌పుట్ మరియు DC అవుట్‌పుట్ ఎందుకు?",
    question_text_or: "ଚାର୍ଜରରେ AC ଇନପୁଟ ଓ DC ଆଉଟପୁଟ କାହିଁକି?",
    options: [
      { en: "Battery charges on AC", hi: "बैटरी AC पर चार्ज होती है", mr: "बॅटरी AC वर चार्ज होते", kn: "ಬ್ಯಾಟರಿ AC ನಲ್ಲಿ ಚಾರ್ಜ್ ಆಗುತ್ತದೆ", te: "బ్యాటరీ AC లో ఛార్జ్ అవుతుంది", or: "ବ୍ୟାଟେରୀ AC ରେ ଚାର୍ଜ ହୁଏ", isCorrect: false },
      { en: "Battery stores on DC", hi: "बैटरी DC पर स्टोर करती है", mr: "बॅटरी DC वर साठवते", kn: "ಬ್ಯಾಟರಿ DC ನಲ್ಲಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ", te: "బ్యాటరీ DC లో స్టోర్ చేస్తుంది", or: "ବ୍ୟାଟେରୀ DC ରେ ଷ୍ଟୋର କରେ", isCorrect: true },
      { en: "Motor runs on AC", hi: "मोटर AC पर चलती है", mr: "मोटर AC वर चालते", kn: "ಮೋಟಾರ್ AC ನಲ್ಲಿ ಚಲಿಸುತ್ತದೆ", te: "మోటార్ AC లో నడుస్తుంది", or: "ମୋଟର AC ରେ ଚାଲେ", isCorrect: false },
      { en: "No specific reason", hi: "कोई खास कारण नहीं", mr: "विशेष कारण नाही", kn: "ನಿರ್ದಿಷ್ಟ ಕಾರಣವಿಲ್ಲ", te: "ప్రత్యేక కారణం లేదు", or: "କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ କାରଣ ନାହିଁ", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What does battery cell balancing mean?",
    question_text_hi: "बैटरी सेल बैलेंसिंग का क्या मतलब है?",
    question_text_mr: "बॅटरी सेल बॅलन्सिंग म्हणजे काय?",
    question_text_kn: "ಬ್ಯಾಟರಿ ಸೆಲ್ ಬ್ಯಾಲೆನ್ಸಿಂಗ್ ಎಂದರೆ ಏನು?",
    question_text_te: "బ్యాటరీ సెల్ బ్యాలెన్సింగ్ అంటే ఏమిటి?",
    question_text_or: "ବ୍ୟାଟେରୀ ସେଲ ବ୍ୟାଲାନ୍ସିଂ ଅର୍ଥ କ'ଣ?",
    options: [
      { en: "Maintaining equal voltage of all cells", hi: "सभी सेल्स का समान वोल्टेज बनाए रखना", mr: "सर्व सेल्सचे समान व्होल्टेज राखणे", kn: "ಎಲ್ಲಾ ಸೆಲ್‌ಗಳ ಸಮಾನ ವೋಲ್ಟೇಜ್ ಕಾಪಾಡು", te: "అన్ని సెల్స్ సమాన వోల్టేజ్ నిర్వహించడం", or: "ସବୁ ସେଲର ସମାନ ଭୋଲ୍ଟେଜ ରଖିବା", isCorrect: true },
      { en: "Replacing cells", hi: "सेल्स को बदलना", mr: "सेल्स बदलणे", kn: "ಸೆಲ್‌ಗಳನ್ನು ಬದಲಾಯಿಸು", te: "సెల్స్ మార్చడం", or: "ସେଲ ବଦଳାଇବା", isCorrect: false },
      { en: "Cooling the battery", hi: "बैटरी को ठंडा करना", mr: "बॅटरी थंड करणे", kn: "ಬ್ಯಾಟರಿ ತಂಪಾಗಿಸು", te: "బ్యాటరీ చల్లబరచడం", or: "ବ୍ୟାଟେରୀ ଥଣ୍ଡା କରିବା", isCorrect: false },
      { en: "Heating the cells", hi: "सेल्स को गर्म करना", mr: "सेल्स गरम करणे", kn: "ಸೆಲ್‌ಗಳನ್ನು ಬಿಸಿ ಮಾಡು", te: "సెల్స్ వేడి చేయడం", or: "ସେଲ ଗରମ କରିବା", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What is included in the powertrain of an EV?",
    question_text_hi: "EV में पावर ट्रेन में क्या शामिल है?",
    question_text_mr: "EV च्या पॉवरट्रेनमध्ये काय समाविष्ट आहे?",
    question_text_kn: "EV ಯ ಪವರ್‌ಟ್ರೇನ್‌ನಲ್ಲಿ ಏನು ಸೇರಿದೆ?",
    question_text_te: "EV పవర్‌ట్రెయిన్‌లో ఏమి ఉంటుంది?",
    question_text_or: "EV ର ପାୱାରଟ୍ରେନରେ କ'ଣ ସାମିଲ?",
    options: [
      { en: "Only battery", hi: "केवल बैटरी", mr: "फक्त बॅटरी", kn: "ಕೇವಲ ಬ್ಯಾಟರಿ", te: "కేవలం బ్యాటరీ", or: "କେବଳ ବ୍ୟାଟେରୀ", isCorrect: false },
      { en: "Motor, controller, and battery", hi: "मोटर, कंट्रोलर, और बैटरी", mr: "मोटर, कंट्रोलर आणि बॅटरी", kn: "ಮೋಟಾರ್, ಕಂಟ್ರೋಲರ್ ಮತ್ತು ಬ್ಯಾಟರಿ", te: "మోటార్, కంట్రోలర్ మరియు బ్యాటరీ", or: "ମୋଟର, କଣ୍ଟ୍ରୋଲର ଓ ବ୍ୟାଟେରୀ", isCorrect: true },
      { en: "Only tires", hi: "केवल टायर", mr: "फक्त टायर", kn: "ಕೇವಲ ಟೈರ್‌ಗಳು", te: "కేవలం టైర్లు", or: "କେବଳ ଟାୟାର", isCorrect: false },
      { en: "Only charger", hi: "केवल चार्जर", mr: "फक्त चार्जर", kn: "ಕೇವಲ ಚಾರ್ಜರ್", te: "కేవలం ఛార్జర్", or: "କେବଳ ଚାର୍ଜର", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
  {
    role: "technician", step: 1,
    question_text_en: "At what temperature should an EV battery be kept?",
    question_text_hi: "EV बैटरी को कितने डिग्री तापमान पर रखना उचित है?",
    question_text_mr: "EV बॅटरी किती तापमानावर ठेवावी?",
    question_text_kn: "EV ಬ್ಯಾಟರಿಯನ್ನು ಯಾವ ತಾಪಮಾನದಲ್ಲಿ ಇಡಬೇಕು?",
    question_text_te: "EV బ్యాటరీని ఏ ఉష్ణోగ్రతలో ఉంచాలి?",
    question_text_or: "EV ବ୍ୟାଟେରୀ କେତେ ତାପମାତ୍ରାରେ ରଖିବା ଉଚିତ?",
    options: [
      { en: "0-10°C", hi: "0-10°C", mr: "0-10°C", kn: "0-10°C", te: "0-10°C", or: "0-10°C", isCorrect: false },
      { en: "15-35°C", hi: "15-35°C", mr: "15-35°C", kn: "15-35°C", te: "15-35°C", or: "15-35°C", isCorrect: true },
      { en: "50-60°C", hi: "50-60°C", mr: "50-60°C", kn: "50-60°C", te: "50-60°C", or: "50-60°C", isCorrect: false },
      { en: "70-80°C", hi: "70-80°C", mr: "70-80°C", kn: "70-80°C", te: "70-80°C", or: "70-80°C", isCorrect: false },
    ],
    points: 1, difficulty: "medium",
  },
  {
    role: "technician", step: 1,
    question_text_en: "What does the throttle do in an EV?",
    question_text_hi: "EV में थ्रॉटल क्या करता है?",
    question_text_mr: "EV मध्ये थ्रॉटल काय करते?",
    question_text_kn: "EV ನಲ್ಲಿ ಥ್ರಾಟಲ್ ಏನು ಮಾಡುತ್ತದೆ?",
    question_text_te: "EV లో థ్రాటిల్ ఏం చేస్తుంది?",
    question_text_or: "EV ରେ ଥ୍ରୋଟଲ କ'ଣ କରେ?",
    options: [
      { en: "Applies brakes", hi: "ब्रेक लगाता है", mr: "ब्रेक लावते", kn: "ಬ್ರೇಕ್ ಹಾಕುತ್ತದೆ", te: "బ్రేక్ వేస్తుంది", or: "ବ୍ରେକ ଲଗାଏ", isCorrect: false },
      { en: "Controls speed", hi: "गति नियंत्रित करता है", mr: "वेग नियंत्रित करते", kn: "ವೇಗವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ", te: "వేగాన్ని నియంత్రిస్తుంది", or: "ଗତି ନିୟନ୍ତ୍ରଣ କରେ", isCorrect: true },
      { en: "Charges battery", hi: "बैटरी चार्ज करता है", mr: "बॅटरी चार्ज करते", kn: "ಬ್ಯಾಟರಿ ಚಾರ್ಜ್ ಮಾಡುತ್ತದೆ", te: "బ్యాటరీ ఛార్జ్ చేస్తుంది", or: "ବ୍ୟାଟେରୀ ଚାର୍ଜ କରେ", isCorrect: false },
      { en: "Turns on lights", hi: "लाइट जलाता है", mr: "लाइट लावते", kn: "ಲೈಟ್ ಹಾಕುತ್ತದೆ", te: "లైట్ వేస్తుంది", or: "ଲାଇଟ ଜଳାଏ", isCorrect: false },
    ],
    points: 1, difficulty: "easy",
  },
];

// Technician Step 2, Sales, and Workshop questions with all languages
export const technicianStep2Questions: QuestionData[] = [];
export const salesQuestions: QuestionData[] = [];
export const workshopQuestions: QuestionData[] = [];

// Combined export
export const allQuestions = [
  ...technicianStep1Questions,
  ...technicianStep2Questions,
  ...salesQuestions,
  ...workshopQuestions,
];
