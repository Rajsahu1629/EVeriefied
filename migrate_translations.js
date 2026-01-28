#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ EXPO_PUBLIC_DATABASE_URL not found'); process.exit(1); }

const sql = neon(DATABASE_URL);

// Technician Step 1 Questions with full translations (from verificationQuestions.ts)
const questions = [
    {
        role: "technician", step: 1,
        question_text_en: "Which cell technology is most commonly used in EV batteries?",
        question_text_hi: "EV बैटरी में सबसे सामान्य रूप से कौन सी सेल तकनीक उपयोग की जाती है?",
        question_text_mr: "EV बॅटरीमध्ये सर्वात सामान्यपणे कोणती सेल तंत्रज्ञान वापरली जाते?",
        question_text_kn: "EV ಬ್ಯಾಟರಿಗಳಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಸೆಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
        question_text_te: "EV బ్యాటరీలలో సాధారణంగా ఏ సెల్ టెక్నాలజీ ఉపయోగించబడుతుంది?",
        question_text_or: "EV ବ୍ୟାଟେରୀରେ ସାଧାରଣତଃ କେଉଁ ସେଲ୍ ଟେକ୍ନୋଲୋଜି ବ୍ୟବହୃତ ହୁଏ?",
        options: JSON.stringify([
            { en: "Lead-Acid", hi: "लीड-एसिड", mr: "लेड-अ‍ॅसिड", kn: "ಲೆಡ್-ಆಸಿಡ್", te: "లెడ్-యాసిడ్", or: "ଲେଡ୍-ଏସିଡ୍", isCorrect: false },
            { en: "Lithium-Ion", hi: "लिथियम-आयन", mr: "लिथियम-आयन", kn: "ಲಿಥಿಯಂ-ಅಯಾನ್", te: "లిథియం-అయాన్", or: "ଲିଥିୟମ୍-ଆୟନ", isCorrect: true },
            { en: "Nickel-Cadmium", hi: "निकल-कैडमियम", mr: "निकल-कॅडमियम", kn: "ನಿಕಲ್-ಕ್ಯಾಡ್ಮಿಯಮ್", te: "నికెల్-కాడ్మియం", or: "ନିକେଲ୍-କ୍ୟାଡମିୟମ୍", isCorrect: false },
            { en: "Zinc-Carbon", hi: "जिंक-कार्बन", mr: "झिंक-कार्बन", kn: "ಜಿಂಕ್-ಕಾರ್ಬನ್", te: "జింక్-కార్బన్", or: "ଜିଙ୍କ-କାର୍ବନ", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Battery Monitoring System", hi: "बैटरी मॉनिटरिंग सिस्टम", isCorrect: false },
            { en: "Battery Management System", hi: "बैटरी मैनेजमेंट सिस्टम", isCorrect: true },
            { en: "Basic Motor System", hi: "बेसिक मोटर सिस्टम", isCorrect: false },
            { en: "Balanced Mode System", hi: "बैलेंस्ड मोड सिस्टम", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Brushed Direct Current", hi: "ब्रश्ड डायरेक्ट करंट", isCorrect: false },
            { en: "Brushless Direct Current", hi: "ब्रशलेस डायरेक्ट करंट", isCorrect: true },
            { en: "Basic Low Drive Current", hi: "बेसिक लो ड्राइव करंट", isCorrect: false },
            { en: "Balanced Load Distribution Current", hi: "बैलेंस्ड लोड डिस्ट्रीब्यूशन करंट", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Increase speed", hi: "गति बढ़ाना", isCorrect: false },
            { en: "Send energy back to battery during braking", hi: "ब्रेकिंग के दौरान ऊर्जा वापस बैटरी में भेजना", isCorrect: true },
            { en: "Increase tire grip", hi: "टायर की पकड़ बढ़ाना", isCorrect: false },
            { en: "Cool down the motor", hi: "मोटर को ठंडा करना", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Watt (W)", hi: "वाट (W)", isCorrect: false },
            { en: "Kilowatt-hour (kWh)", hi: "किलोवाट-ऑवर (kWh)", isCorrect: true },
            { en: "Ampere (A)", hi: "एम्पियर (A)", isCorrect: false },
            { en: "Volt (V)", hi: "वोल्ट (V)", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Normal temperature of battery", hi: "बैटरी का सामान्य तापमान", isCorrect: false },
            { en: "Uncontrolled rise in heat in battery", hi: "बैटरी में अनियंत्रित गर्मी का बढ़ना", isCorrect: true },
            { en: "Motor cooling", hi: "मोटर का ठंडा होना", isCorrect: false },
            { en: "Normal charging process", hi: "चार्जिंग की सामान्य प्रक्रिया", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Charge the battery", hi: "बैटरी चार्ज करना", isCorrect: false },
            { en: "Control motor speed and torque", hi: "मोटर की गति और टॉर्क नियंत्रित करना", isCorrect: true },
            { en: "Change tires", hi: "टायर बदलना", isCorrect: false },
            { en: "Fill fuel", hi: "ईंधन भरना", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Convert high voltage to low voltage", hi: "उच्च वोल्टेज को निम्न वोल्टेज में बदलना", isCorrect: true },
            { en: "Convert AC to DC", hi: "AC को DC में बदलना", isCorrect: false },
            { en: "Increase motor speed", hi: "मोटर की गति बढ़ाना", isCorrect: false },
            { en: "Cool the battery", hi: "बैटरी को ठंडा करना", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Speed of Charging", hi: "स्पीड ऑफ चार्जिंग", isCorrect: false },
            { en: "State of Charge", hi: "स्टेट ऑफ चार्ज", isCorrect: true },
            { en: "System Operation Control", hi: "सिस्टम ऑपरेशन कंट्रोल", isCorrect: false },
            { en: "Safety of Component", hi: "सेफ्टी ऑफ कॉम्पोनेंट", isCorrect: false },
        ]),
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
        options: JSON.stringify([
            { en: "Under the seat", hi: "सीट के नीचे", isCorrect: false },
            { en: "Inside the wheel", hi: "पहिये के अंदर", isCorrect: true },
            { en: "In the handle", hi: "हैंडल में", isCorrect: false },
            { en: "Near the battery", hi: "बैटरी के पास", isCorrect: false },
        ]),
        points: 1, difficulty: "easy",
    },
];

async function migrate() {
    console.log('🚀 Migrating verification questions with translations...\n');
    try {
        // Delete technician step 1 questions only
        console.log('🗑️  Clearing technician step 1 questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'technician' AND step = 1`;

        console.log(`📝 Inserting ${questions.length} questions...`);
        for (const q of questions) {
            await sql`
        INSERT INTO verification_questions (
          role, step, question_text_en, question_text_hi, question_text_mr,
          question_text_kn, question_text_te, question_text_or, options, points, difficulty
        ) VALUES (
          ${q.role}, ${q.step}, ${q.question_text_en}, ${q.question_text_hi}, ${q.question_text_mr || null},
          ${q.question_text_kn || null}, ${q.question_text_te || null}, ${q.question_text_or || null},
          ${q.options}, ${q.points}, ${q.difficulty}
        )
      `;
        }

        // Verify
        const sample = await sql`SELECT id, question_text_en, question_text_hi FROM verification_questions WHERE role = 'technician' LIMIT 2`;
        console.log('\n✅ Sample questions:');
        sample.forEach(q => {
            console.log(`  EN: ${q.question_text_en.substring(0, 40)}...`);
            console.log(`  HI: ${q.question_text_hi.substring(0, 40)}...`);
        });
        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
