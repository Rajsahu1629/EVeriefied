#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode') ? { rejectUnauthorized: false } : false
});

async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res.rows;
    } finally {
        client.release();
    }
}

// ═══════════════════════════════════════════
// QUESTIONS DATA
// ═══════════════════════════════════════════

const technicianStep1Questions = [
    { role: "technician", step: 1, en: "What does the 'Orange' color on a cable represent?", hi: "केबल पर 'नारंगी' रंग क्या दर्शाता है?", options: [{ hi: "हाई स्पीड", en: "High Speed", isCorrect: false }, { hi: "हाई वोल्टेज (खतरनाक)", en: "High Voltage (Dangerous)", isCorrect: true }, { hi: "लो बैटरी", en: "Low Battery", isCorrect: false }, { hi: "ग्राउंड कनेक्शन", en: "Ground Connection", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 1, en: "A 'U' code (e.g., U0100) on the scanner means what?", hi: "स्कैनर पर 'U' कोड (जैसे U0100) का क्या मतलब है?", options: [{ hi: "अंडर-वोल्टेज फॉल्ट", en: "Under-voltage fault", isCorrect: false }, { hi: "कम्युनिकेशन फॉल्ट (CAN Bus एरर)", en: "Communication Fault (CAN Bus error)", isCorrect: true }, { hi: "यूनिवर्सल मोटर एरर", en: "Universal motor error", isCorrect: false }, { hi: "यूजर एरर", en: "User error", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 1, en: "The scanner shows a 'Current' fault vs. a 'History' fault. Which do you fix first?", hi: "स्कैनर 'Current' फॉल्ट vs 'History' फॉल्ट दिखाता है। पहले कौन सा ठीक करें?", options: [{ hi: "करंट (एक्टिव) फॉल्ट", en: "Current (Active) fault", isCorrect: true }, { hi: "हिस्ट्री फॉल्ट", en: "History fault", isCorrect: false }, { hi: "दोनों को डिलीट करें", en: "Delete both and ignore", isCorrect: false }, { hi: "कोई भी पहले", en: "Any one first", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 1, en: "What is the first step when a diagnostic tool shows a code you don't know?", hi: "जब डायग्नोस्टिक टूल कोई ऐसा कोड दिखाए जो आपको नहीं पता, तो पहला कदम क्या है?", options: [{ hi: "किसी दोस्त को कॉल करें", en: "Call a friend", isCorrect: false }, { hi: "OEM सर्विस मैनुअल में कोड देखें", en: "Check the OEM Service Manual", isCorrect: true }, { hi: "VCU बदल दें", en: "Replace the VCU", isCorrect: false }, { hi: "थ्रॉटल को 3 बार घुमाकर रीसेट करें", en: "Twist the throttle 3 times to reset", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 1, en: "What is the minimum 12V battery voltage required to start a software flash?", hi: "सॉफ्टवेयर फ्लैश शुरू करने के लिए न्यूनतम 12V बैटरी वोल्टेज कितना चाहिए?", options: [{ hi: "5V", en: "5V", isCorrect: false }, { hi: "9V", en: "9V", isCorrect: false }, { hi: "12.4V या उससे ज्यादा (स्थिर)", en: "12.4V or higher (Stable)", isCorrect: true }, { hi: "वोल्टेज मायने नहीं रखता", en: "Voltage doesn't matter", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 1, en: "After replacing a NEW MCU, why won't the scooty move even if there are no errors?", hi: "नया MCU लगाने के बाद, बिना एरर के भी स्कूटी क्यों नहीं चलती?", options: [{ hi: "मोटर शर्मीली है", en: "The motor is shy", isCorrect: false }, { hi: "MCU को VCU के साथ 'पेयरिंग' की जरूरत है", en: "The MCU needs 'Pairing' with the VCU", isCorrect: true }, { hi: "बैटरी फुल है", en: "The battery is full", isCorrect: false }, { hi: "चाबियाँ गलत हैं", en: "The keys are wrong", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "A DC-DC Converter does what?", hi: "DC-DC कनवर्टर क्या करता है?", options: [{ hi: "मेन बैटरी चार्ज करता है", en: "Charges the main battery", isCorrect: false }, { hi: "72V को 12V में बदलता है लाइट/हॉर्न के लिए", en: "Turns 72V into 12V for lights/horn", isCorrect: true }, { hi: "DC को AC में बदलता है", en: "Converts DC to AC for the motor", isCorrect: false }, { hi: "बाइक की स्पीड बढ़ाता है", en: "Increases the speed of the bike", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 1, en: "You see 'Carbon/Black marks' inside the main battery connector. What is the correct action?", hi: "मेन बैटरी कनेक्टर के अंदर 'कार्बन/काले निशान' दिखें तो सही एक्शन क्या है?", options: [{ hi: "कपड़े से साफ करें", en: "Clean it with a cloth", isCorrect: false }, { hi: "कनेक्टर बदलें और टर्मिनल चेक करें", en: "Replace the connector and check terminal tension", isCorrect: true }, { hi: "ग्रीस लगा दें", en: "Put grease on it", isCorrect: false }, { hi: "इसे इग्नोर करें", en: "Ignore it", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "You need to check a wire for a 'break' (continuity). Where do you set your Multimeter?", hi: "वायर में 'ब्रेक' चेक करने के लिए मल्टीमीटर कहाँ सेट करें?", options: [{ hi: "DC वोल्टेज (V=)", en: "DC Voltage (V=)", isCorrect: false }, { hi: "रेजिस्टेंस/कंटीन्यूटी (Ohm/Beep)", en: "Resistance/Continuity (Ohm/Beep symbol)", isCorrect: true }, { hi: "AC वोल्टेज (V~)", en: "AC Voltage (V~)", isCorrect: false }, { hi: "करंट मोड", en: "Current mode", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 1, en: "A customer brings a bike that was 'submerged in water'. What is the first thing you do?", hi: "बारिश में 'पानी में डूबी' बाइक आए तो सबसे पहले क्या करें?", options: [{ hi: "इग्निशन ऑन करके स्क्रीन चेक करें", en: "Turn on the ignition to see if screen works", isCorrect: false }, { hi: "तुरंत बैटरी आइसोलेट करें", en: "Isolate the battery immediately", isCorrect: true }, { hi: "मोटर को ब्लो-ड्राई करें", en: "Blow-dry the motor", isCorrect: false }, { hi: "कस्टमर से पूछें कि पानी कितना था", en: "Ask customer how much water", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "You are charging a battery and it feels 'Hot to touch' (above 50C). What do you do?", hi: "वर्कशॉप में बैटरी चार्ज करते समय 'गर्म' लगे तो क्या करें?", options: [{ hi: "चार्जिंग जारी रखें", en: "Keep charging, it's normal", isCorrect: false }, { hi: "चार्जिंग बंद करें और सेफ एरिया में ले जाएं", en: "Stop charging, disconnect, and move to safe area", isCorrect: true }, { hi: "बैटरी पर पानी डालें", en: "Pour water on it", isCorrect: false }, { hi: "AC चालू कर दें", en: "Turn on the AC", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "What is the 'Golden Rule' for handling an opened Battery Pack?", hi: "खुली बैटरी पैक को हैंडल करने का 'गोल्डन रूल' क्या है?", options: [{ hi: "मैग्नेटिक स्क्रूड्राइवर यूज करें", en: "Use magnetic screwdrivers", isCorrect: false }, { hi: "'इंसुलेटेड टूल्स' यूज करें और मेटल रिंग/घड़ी उतार दें", en: "Use 'Insulated Tools' and remove metal ring/watch", isCorrect: true }, { hi: "जितना जल्दी हो सके काम करें", en: "Work as fast as possible", isCorrect: false }, { hi: "दस्ताने पहनने की जरूरत नहीं", en: "No need for gloves", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 1, en: "You just installed a NEW Motor. It spins backward. What is the fix?", hi: "नई मोटर लगाई और उल्टी घूमती है। क्या फिक्स करें?", options: [{ hi: "मोटर खोलें और मैग्नेट पलट दें", en: "Flip the magnets", isCorrect: false }, { hi: "बैटरी वायर स्वैप करें", en: "Swap battery wires", isCorrect: false }, { hi: "तीन मोटर फेज वायर में से कोई दो स्वैप करें", en: "Swap any TWO of the three motor phase wires", isCorrect: true }, { hi: "डैशबोर्ड तीन बार रीसेट करें", en: "Reset dashboard three times", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "You are about to replace a faulty VCU. Which is the CORRECT safety sequence?", hi: "VCU बदलने से पहले सही सेफ्टी सीक्वेंस क्या है?", options: [{ hi: "सीट→HV बैटरी→12V बैटरी→VCU", en: "Seat→HV Battery→12V Battery→VCU", isCorrect: false }, { hi: "सीट→12V बैटरी→HV बैटरी→VCU", en: "Seat→12V Battery→HV Battery→Remove VCU", isCorrect: true }, { hi: "VCU→12V→HV", en: "Unbolt VCU→12V→HV", isCorrect: false }, { hi: "HV→VCU→12V", en: "HV→VCU→12V", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 1, en: "How do you verify 'Zero Voltage' before touching motor phase wires?", hi: "मोटर फेज वायर छूने से पहले 'जीरो वोल्टेज' कैसे वेरिफाई करें?", options: [{ hi: "टेस्ट लैंप यूज करें", en: "Use a test lamp", isCorrect: false }, { hi: "मल्टीमीटर DC वोल्टेज पर सेट करें और MCU टर्मिनल चेक करें", en: "Set Multimeter to DC Voltage and check MCU terminals until <5V", isCorrect: true }, { hi: "रेजिस्टेंस पर सेट करें", en: "Set Multimeter to Resistance", isCorrect: false }, { hi: "हाथ से टच करें", en: "Touch wires quickly with back of hand", isCorrect: false }], points: 1, difficulty: "hard" },
];

const technicianStep2Questions = [
    { role: "technician", step: 2, en: "When disconnecting battery cables, which terminal should you remove FIRST?", hi: "12V या HV बैटरी केबल डिस्कनेक्ट करते समय कौन सा टर्मिनल पहले हटाएं?", options: [{ hi: "पॉजिटिव (+)", en: "Positive (+)", isCorrect: false }, { hi: "नेगेटिव (-)", en: "Negative (-)", isCorrect: true }, { hi: "दोनों एक साथ", en: "Both at same time", isCorrect: false }, { hi: "कोई फर्क नहीं", en: "It doesn't matter", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "To check if an EV throttle is working correctly, what mode should Multimeter be in?", hi: "EV थ्रॉटल चेक करने के लिए मल्टीमीटर किस मोड पर हो?", options: [{ hi: "AC वोल्टेज; 12V-24V", en: "AC Voltage; 12V to 24V", isCorrect: false }, { hi: "रेजिस्टेंस; 0-100Ω", en: "Resistance; 0Ω to 100Ω", isCorrect: false }, { hi: "DC वोल्टेज; 0.8V-4.2V", en: "DC Voltage; 0.8V to 4.2V", isCorrect: true }, { hi: "कंटीन्यूटी; बीप", en: "Continuity; loud beep", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 2, en: "Diagnostic Tool shows Error Code P0A0D (HV Interlock Circuit). What is the CORRECT move?", hi: "डायग्नोस्टिक टूल P0A0D एरर दिखाए। सही मूव क्या है?", options: [{ hi: "कोड क्लियर करें", en: "Clear the code", isCorrect: false }, { hi: "OEM मैनुअल में P0A0D सर्च करें और वायरिंग चेक फॉलो करें", en: "Open OEM Manual → Search P0A0D → Follow wiring check", isCorrect: true }, { hi: "वायरिंग हार्नेस बदलें", en: "Replace wiring harness", isCorrect: false }, { hi: "किसी दोस्त को कॉल करें", en: "Call a friend", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 2, en: "Starting a Software/Firmware Update. Which condition is a 'FAIL' (Stop the update)?", hi: "सॉफ्टवेयर अपडेट शुरू करते समय कौन सी कंडीशन 'FAIL' है?", options: [{ hi: "स्कूटर Wi-Fi से कनेक्ट", en: "Scooter connected to Wi-Fi", isCorrect: false }, { hi: "12V बैटरी 10.8V (बहुत कम)", en: "12V Battery is 10.8V (Too Low - Risk of Bricking)", isCorrect: true }, { hi: "बैटरी 60% SOC", en: "Battery at 60% SOC", isCorrect: false }, { hi: "साइड-स्टैंड नीचे", en: "Side-stand down", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 2, en: "BMS shows 'Cell Imbalance' (One cell 3.1V, others 4.1V). What does this mean?", hi: "BMS 'Cell Imbalance' दिखाए (एक सेल 3.1V, बाकी 4.1V)। इसका क्या मतलब है?", options: [{ hi: "24 घंटे चार्ज करें", en: "Charge for 24 hours", isCorrect: false }, { hi: "चार्जर खराब है", en: "Charger is defective", isCorrect: false }, { hi: "बैटरी में हार्डवेयर फॉल्ट है, सेफ्टी रिस्क", en: "Battery has hardware fault, safety risk; needs professional repair", isCorrect: true }, { hi: "राइडर तेज चला रहा है", en: "Rider driving too fast", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 2, en: "Before working on HV COMPONENT, the FIRST action is:", hi: "HV कंपोनेंट पर काम करने से पहले पहला एक्शन:", options: [{ hi: "बॉडी पैनल हटाएं", en: "Remove body panels", isCorrect: false }, { hi: "12V बैटरी डिस्कनेक्ट करें", en: "Disconnect 12V battery", isCorrect: true }, { hi: "इग्निशन ऑफ करें", en: "Switch OFF ignition only", isCorrect: false }, { hi: "कस्टमर को इनफॉर्म करें", en: "Inform customer", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "To ensure 100% safe work on HV components, what is the exact order of steps?", hi: "HV कंपोनेंट्स पर सेफ वर्क के लिए सही क्रम क्या है?", options: [{ hi: "सर्विस प्लग→12V→HV केबल", en: "Service Plug→12V→HV Cables", isCorrect: false }, { hi: "12V डिस्कनेक्ट→सर्विस प्लग→5 मिनट→मल्टीमीटर से 0V वेरिफाई", en: "Disconnect 12V→Service Plug→Wait 5 Min→Verify 0V", isCorrect: true }, { hi: "सर्विस प्लग→5 मिनट→इग्निशन ऑफ", en: "Service Plug→Wait→Ignition Off", isCorrect: false }, { hi: "इग्निशन ऑफ→HV केबल→12V", en: "Ignition Off→HV Cables→12V", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "technician", step: 2, en: "You disconnected battery terminals to clean them. After reconnecting, 'BMS Error' and won't start. What first?", hi: "बैटरी टर्मिनल साफ करने के लिए डिस्कनेक्ट किया। वापस लगाने पर 'BMS Error'। पहले क्या करें?", options: [{ hi: "नई बैटरी ऑर्डर करें", en: "Order new battery", isCorrect: false }, { hi: "सॉफ्टवेयर पेयरिंग करें", en: "Software Pairing", isCorrect: false }, { hi: "लूज कनेक्शन चेक करें और 12V रीसेट करें", en: "Check loose connection and do 12V Reset", isCorrect: true }, { hi: "मोटर बदलें", en: "Change Motor", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 2, en: "Multimeter is mainly used to:", hi: "मल्टीमीटर मुख्य रूप से किसलिए यूज होता है?", options: [{ hi: "बोल्ट टाइट करना", en: "Tighten bolts", isCorrect: false }, { hi: "वोल्टेज/करंट/कंटीन्यूटी मापना", en: "Measure voltage/current/continuity", isCorrect: true }, { hi: "वाहन धोना", en: "Wash vehicle", isCorrect: false }, { hi: "ECU प्रोग्राम करना", en: "Program ECU", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "What do you use a diagnostic tool for?", hi: "डायग्नोस्टिक टूल किसलिए यूज होता है?", options: [{ hi: "टायर इन्फ्लेट करना", en: "Inflate tyre", isCorrect: false }, { hi: "एरर कोड और सिस्टम स्टेटस देखना", en: "See error codes & system status", isCorrect: true }, { hi: "बॉडी पेंट करना", en: "Paint body", isCorrect: false }, { hi: "बैटरी चार्ज करना", en: "Charge battery", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "Where is diagnostic tool usually connected?", hi: "डायग्नोस्टिक टूल कहाँ कनेक्ट होता है?", options: [{ hi: "बैटरी टर्मिनल", en: "Battery terminal", isCorrect: false }, { hi: "डायग्नोस्टिक पोर्ट / सर्विस कनेक्टर", en: "Diagnostic port / service connector", isCorrect: true }, { hi: "हेडलैंप सॉकेट", en: "Headlamp socket", isCorrect: false }, { hi: "मोटर केबल", en: "Motor cable", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "Why is SOP important in EV work?", hi: "EV वर्क में SOP क्यों जरूरी है?", options: [{ hi: "अटेंडेंस के लिए", en: "For attendance", isCorrect: false }, { hi: "सेफ्टी और सही प्रोसेस के लिए", en: "For safety & correct process", isCorrect: true }, { hi: "बिलिंग के लिए", en: "For billing", isCorrect: false }, { hi: "कस्टमर सिग्नेचर के लिए", en: "For customer signature", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "technician", step: 2, en: "If SOP says wait 10 minutes after HV shutdown, why do we wait?", hi: "SOP कहे HV शटडाउन के बाद 10 मिनट रुकें, तो क्यों?", options: [{ hi: "चाय ब्रेक", en: "Tea break", isCorrect: false }, { hi: "कूलिंग", en: "Cooling", isCorrect: false }, { hi: "कैपेसिटर डिस्चार्ज / वोल्टेज ड्रॉप", en: "Capacitor discharge / voltage drop", isCorrect: true }, { hi: "पेपरवर्क के लिए", en: "For paperwork", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 2, en: "OBD-II tool plugged in but screen does not light up. Most likely reason?", hi: "OBD-II प्लग किया लेकिन स्क्रीन ऑन नहीं हुई। कारण?", options: [{ hi: "ट्रैक्शन बैटरी (72V) डिस्चार्ज है", en: "Traction Battery (72V) is discharged", isCorrect: false }, { hi: "MCU खराब है", en: "MCU is faulty", isCorrect: false }, { hi: "12V ऑक्सिलरी बैटरी लो है या OBD फ्यूज उड़ा है", en: "12V Auxiliary Battery is low or OBD fuse is blown", isCorrect: true }, { hi: "बाइक Eco Mode में है", en: "Bike is in Eco Mode", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "technician", step: 2, en: "You are bolting terminals of a new Traction Battery. Which is CORRECT?", hi: "नई ट्रैक्शन बैटरी के टर्मिनल बोल्ट करते समय सही तरीका?", options: [{ hi: "जितना हो टाइट करें", en: "Tighten as hard as possible", isCorrect: false }, { hi: "टॉर्क रेंच यूज करें OEM स्पेक पर सेट करके", en: "Use Torque Wrench set to OEM spec to prevent arcing", isCorrect: true }, { hi: "स्क्रूड्राइवर और टेप से होल्ड करें", en: "Use screwdriver and tape", isCorrect: false }, { hi: "लूज रखें", en: "Leave slightly loose", isCorrect: false }], points: 1, difficulty: "medium" },
];

const salesQuestions = [
    { role: "sales", step: 1, en: "Customer asks for 'True Range'. Marketing says 150km (IDC), city gives 100km. What do you say?", hi: "कस्टमर 'True Range' पूछे। ब्रोशर 150km, सिटी 100km। क्या बताएं?", options: [{ hi: "150km पर रहें", en: "Stick to 150km", isCorrect: false }, { hi: "IDC vs True Range का फर्क समझाएं, 100-110km एस्टीमेट दें", en: "Explain IDC vs True Range, give realistic 100-110km estimate", isCorrect: true }, { hi: "'धीरे चलाओ तो अनलिमिटेड'", en: "Range is unlimited if you drive slowly", isCorrect: false }, { hi: "200km बोल दें", en: "Say 200km to close the sale", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "PDI checklist is only 50% complete but sales pushes for delivery. What do you do?", hi: "PDI चेकलिस्ट 50% है लेकिन सेल्स टीम डिलीवरी का प्रेशर दे रही है। क्या करें?", options: [{ hi: "बाइक दे दें, कल आने बोलें", en: "Hand over and tell customer to come back tomorrow", isCorrect: false }, { hi: "हैंडओवर से मना करें, Critical Safety Points चेक करें", en: "Refuse handover until every Critical Safety Point is signed off", isCorrect: true }, { hi: "PDI पेपर साइन कर दें", en: "Sign PDI paper without checking", isCorrect: false }, { hi: "सिर्फ लाइट-हॉर्न चेक करें", en: "Check only lights and horns", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "sales", step: 1, en: "Customer worried about battery replacement cost after 3-year warranty. How do you respond?", hi: "कस्टमर को 3 साल वारंटी बाद बैटरी कॉस्ट की चिंता। कैसे जवाब दें?", options: [{ hi: "बैटरी कभी फेल नहीं होती", en: "Batteries never fail", isCorrect: false }, { hi: "वारंटी खत्म होने से पहले बाइक बेच दो", en: "Sell bike before warranty expires", isCorrect: false }, { hi: "Life Cycles और cost-per-km सेविंग्स समझाएं", en: "Explain Life Cycles and cost-per-km savings", isCorrect: true }, { hi: "वारंटी 10 साल की है", en: "Lie about 10-year warranty", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "Customer says 'Ola/Ather is better because higher top speed.' How to handle?", hi: "कस्टमर बोले 'Ola/Ather बेहतर है'। कैसे हैंडल करें?", options: [{ hi: "अग्री करें", en: "Agree your model is bad", isCorrect: false }, { hi: "कॉम्पिटिटर की स्ट्रेंथ एक्नॉलेज करें, अपने यूनिक एडवांटेज बताएं", en: "Acknowledge competitor strength, highlight your unique advantages", isCorrect: true }, { hi: "कस्टमर गलत है", en: "Tell customer they are wrong", isCorrect: false }, { hi: "कॉम्पिटिटर को इंसल्ट करें", en: "Insult the competitor", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "Many customers are 'Tech-Scared.' How should you explain features like Hill Hold?", hi: "Tech-Scared कस्टमर को Hill Hold जैसे फीचर्स कैसे समझाएं?", options: [{ hi: "कॉम्प्लेक्स टर्म्स यूज करें", en: "Use complex engineering terms", isCorrect: false }, { hi: "Benefit-Led एक्सप्लेनेशन यूज करें", en: "Use Benefit-Led explanations", isCorrect: true }, { hi: "मैनुअल पढ़ लेना", en: "Tell them to read the manual", isCorrect: false }, { hi: "टेक फीचर्स न बताएं", en: "Don't mention tech features", isCorrect: false }], points: 1, difficulty: "easy" },
    { role: "sales", step: 1, en: "Senior citizen overwhelmed by touch-screen. What is your approach?", hi: "सीनियर सिटीजन टच-स्क्रीन से ओवरव्हेल्म्ड। आपका अप्रोच?", options: [{ hi: "सीखना पड़ेगा, यही फ्यूचर है", en: "Tell them to learn, this is the future", isCorrect: false }, { hi: "पिच सिम्प्लीफाई करें, ऐप सेटअप की ऑफर दें", en: "Simplify pitch, offer to set up app personally", isCorrect: true }, { hi: "पेट्रोल बाइक लें", en: "Suggest petrol bike", isCorrect: false }, { hi: "सिर्फ कलर और प्राइस बताएं", en: "Only talk color and price", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "Customer says EV price is ₹30,000 more than petrol. How to prove value?", hi: "कस्टमर बोले EV ₹30,000 महंगा है। वैल्यू कैसे प्रूव करें?", options: [{ hi: "₹5,000 डिस्काउंट दें", en: "Offer ₹5,000 discount", isCorrect: false }, { hi: "डेली रनिंग पूछें, पेट्रोल vs इलेक्ट्रिसिटी सेविंग कैलकुलेट करें", en: "Calculate petrol vs electricity savings for daily running", isCorrect: true }, { hi: "पेट्रोल डबल हो जाएगा", en: "Petrol will double next year", isCorrect: false }, { hi: "Environment और Green Energy बताएं", en: "Focus only on environment", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "Customer says 'Competitor X has 5.0 kWh, yours only 4.0 kWh. Yours is weaker.' How?", hi: "कस्टमर बोले 'Competitor की 5.0 kWh बैटरी है, आपकी 4.0 kWh'। कैसे जवाब दें?", options: [{ hi: "5.5 kWh बोलें", en: "Lie and say 5.5 kWh", isCorrect: false }, { hi: "Competitor low-quality है", en: "Say competitor uses low-quality cells", isCorrect: false }, { hi: "बैटरी साइज एक्नॉलेज करें, Efficiency समझाएं", en: "Acknowledge size, explain Efficiency advantage", isCorrect: true }, { hi: "बैटरी साइज मैटर नहीं करता", en: "Battery size doesn't matter", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "sales", step: 1, en: "Customer walking out without booking. Most 'Customer-Centric' way to stop them?", hi: "कस्टमर बिना बुकिंग किए जा रहा है। कैसे रोकें?", options: [{ hi: "फ्री हेलमेट ऑफर", en: "Offer free helmet", isCorrect: false }, { hi: "उनकी specific concern address करें", en: "Address their specific concern about charging/range", isCorrect: true }, { hi: "दूसरे शोरूम मत जाओ", en: "Don't go to other showroom", isCorrect: false }, { hi: "जाने दो", en: "Let them go", isCorrect: false }], points: 1, difficulty: "medium" },
    { role: "sales", step: 1, en: "Customer 90% convinced says 'I'll think and come back next month.' How to handle?", hi: "कस्टमर 90% convince है लेकिन 'सोचकर अगले महीने आऊंगा'। कैसे हैंडल करें?", options: [{ hi: "कल प्राइस बढ़ जाएगा", en: "Say price will increase", isCorrect: false }, { hi: "Discovery Question पूछें: specific डाउट पता करें", en: "Ask Discovery Question to find specific doubt", isCorrect: true }, { hi: "ओके, नो प्रॉब्लम", en: "Say okay, no problem", isCorrect: false }, { hi: "फीचर्स और जोर से रिपीट करें", en: "Repeat features louder", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "sales", step: 1, en: "Customer about to sign says 'Won't spend a rupee for 1 year.' How do you respond?", hi: "कस्टमर बुकिंग करने वाला है बोले '1 साल में एक पैसा नहीं'। कैसे जवाब दें?", options: [{ hi: "कुछ न बोलें, बुकिंग लें", en: "Say nothing and take booking", isCorrect: false }, { hi: "सर्विस लेबर फ्री है, ब्रेक पैड/टायर पेड हैं—क्लियर करें", en: "Clarify: Labor free, but brake pads/tires are paid items", isCorrect: true }, { hi: "सब फ्री है", en: "Tell them everything is free", isCorrect: false }, { hi: "5 साल तक पार्ट्स नहीं बदलने पड़ेंगे", en: "No parts need changing for 5 years", isCorrect: false }], points: 1, difficulty: "hard" },
    { role: "sales", step: 1, en: "Your EV brand has NO free services. How to explain to customer used to petrol free services?", hi: "आपका ब्रांड फ्री सर्विस नहीं देता। कस्टमर को कैसे समझाएं?", options: [{ hi: "पहली दो फ्री बोलें", en: "Lie and say first two are free", isCorrect: false }, { hi: "EV को साल में एक बार चेकअप चाहिए, छोटी फीस Software Diagnostic के लिए", en: "EV needs yearly checkup, small fee for Software Diagnostic & Battery Health", isCorrect: true }, { hi: "कॉस्ट छुपा दें", en: "Hide the cost", isCorrect: false }, { hi: "कभी सर्विस नहीं चाहिए", en: "Bike never needs service", isCorrect: false }], points: 1, difficulty: "medium" },
];

// ═══════════════════════════════════════════
// MIGRATION
// ═══════════════════════════════════════════

async function migrate() {
    console.log('🚀 Starting Master RDS Migration...\n');

    try {
        // ── STEP 1: Create Tables ──
        console.log('📝 Creating recruiters table...');
        await query(`
            CREATE TABLE IF NOT EXISTS recruiters (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ recruiters');

        console.log('📝 Creating users table...');
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                state VARCHAR(100),
                city VARCHAR(100),
                pincode VARCHAR(10),
                qualification VARCHAR(50),
                experience VARCHAR(50),
                current_workshop VARCHAR(255),
                brand_workshop VARCHAR(255),
                brands JSONB,
                role VARCHAR(50) NOT NULL DEFAULT 'technician',
                verification_status VARCHAR(50) DEFAULT 'pending',
                verification_step INTEGER DEFAULT 0,
                quiz_score INTEGER,
                total_questions INTEGER,
                prior_knowledge TEXT,
                domain TEXT,
                vehicle_category TEXT,
                training_role TEXT,
                is_admin_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ users');

        console.log('📝 Creating job_posts table...');
        await query(`
            CREATE TABLE IF NOT EXISTS job_posts (
                id SERIAL PRIMARY KEY,
                recruiter_id INTEGER NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
                brand VARCHAR(100) NOT NULL,
                role_required VARCHAR(100) NOT NULL,
                number_of_people VARCHAR(10),
                experience VARCHAR(50),
                salary_min INTEGER,
                salary_max INTEGER,
                has_incentive BOOLEAN DEFAULT FALSE,
                pincode VARCHAR(10),
                city VARCHAR(100),
                stay_provided BOOLEAN DEFAULT FALSE,
                urgency VARCHAR(50) DEFAULT 'within_7_days',
                status VARCHAR(50) DEFAULT 'received',
                is_active BOOLEAN DEFAULT TRUE,
                job_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ job_posts');

        console.log('📝 Creating job_applications table...');
        await query(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                job_post_id INTEGER NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'applied',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_post_id)
            );
        `);
        console.log('✅ job_applications');

        console.log('📝 Creating verification_questions table...');
        await query(`
            CREATE TABLE IF NOT EXISTS verification_questions (
                id SERIAL PRIMARY KEY,
                role VARCHAR(50) NOT NULL,
                step INTEGER NOT NULL,
                question_text_en TEXT NOT NULL,
                question_text_hi TEXT NOT NULL,
                question_text_mr TEXT,
                question_text_kn TEXT,
                question_text_te TEXT,
                question_text_or TEXT,
                options JSONB NOT NULL,
                points INTEGER DEFAULT 1,
                difficulty VARCHAR(20) DEFAULT 'easy',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ verification_questions');

        // ── STEP 2: Create Indexes ──
        console.log('\n📝 Creating indexes...');
        await query('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)');
        await query('CREATE INDEX IF NOT EXISTS idx_recruiters_phone ON recruiters(phone_number)');
        await query('CREATE INDEX IF NOT EXISTS idx_job_posts_recruiter ON job_posts(recruiter_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_job_posts_active ON job_posts(is_active)');
        await query('CREATE INDEX IF NOT EXISTS idx_applications_user ON job_applications(user_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_post_id)');
        console.log('✅ All indexes created');

        // ── STEP 3: Populate Questions ──
        console.log('\n📝 Populating verification questions...');
        await query('DELETE FROM verification_questions');

        const allQuestions = [
            ...technicianStep1Questions,
            ...technicianStep2Questions,
            ...salesQuestions
        ];

        for (const q of allQuestions) {
            await query(
                'INSERT INTO verification_questions (role, step, question_text_en, question_text_hi, options, points, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [q.role, q.step, q.en, q.hi, JSON.stringify(q.options), q.points, q.difficulty]
            );
        }

        console.log(`✅ Migrated ${allQuestions.length} questions`);

        // ── STEP 4: Verify ──
        console.log('\n🔍 Verifying tables...');
        const tables = await query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        console.log('📋 Tables found:');
        tables.forEach(t => console.log(`   - ${t.tablename}`));

        const qCount = await query('SELECT COUNT(*) as count FROM verification_questions');
        console.log(`\n📊 Questions in DB: ${qCount[0].count}`);

        console.log('\n🎉 RDS Migration completed successfully! 🥳');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
