const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

// --- Question Data from Source Files ---

const technicianStep1Questions = [
    {
        role: "technician",
        step: 1,
        question_text_hi: "केबल पर \"नारंगी\" रंग क्या दर्शाता है?",
        question_text_en: "What does the \"Orange\" color on a cable represent?",
        options: [
            { hi: "हाई स्पीड", en: "High Speed", isCorrect: false },
            { hi: "हाई वोल्टेज (खतरनाक)", en: "High Voltage (Dangerous)", isCorrect: true },
            { hi: "लो बैटरी", en: "Low Battery", isCorrect: false },
            { hi: "ग्राउंड कनेक्शन", en: "Ground Connection", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "स्कैनर पर \"U\" कोड (जैसे U0100) का क्या मतलब है?",
        question_text_en: "A \"U\" code (e.g., U0100) on the scanner means what?",
        options: [
            { hi: "अंडर-वोल्टेज फॉल्ट", en: "Under-voltage fault", isCorrect: false },
            { hi: "कम्युनिकेशन फॉल्ट (CAN Bus एरर)", en: "Communication Fault (CAN Bus error)", isCorrect: true },
            { hi: "यूनिवर्सल मोटर एरर", en: "Universal motor error", isCorrect: false },
            { hi: "यूजर एरर", en: "User error", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "स्कैनर \"Current\" फॉल्ट vs \"History\" फॉल्ट दिखाता है। पहले कौन सा ठीक करें?",
        question_text_en: "The scanner shows a \"Current\" fault vs. a \"History\" fault. Which do you fix first?",
        options: [
            { hi: "करंट (एक्टिव) फॉल्ट", en: "Current (Active) fault", isCorrect: true },
            { hi: "हिस्ट्री फॉल्ट", en: "History fault", isCorrect: false },
            { hi: "दोनों को डिलीट करें और इग्नोर करें", en: "Delete both and ignore", isCorrect: false },
            { hi: "कोई भी पहले", en: "Any one first", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "जब डायग्नोस्टिक टूल कोई ऐसा कोड दिखाए जो आपको नहीं पता, तो पहला कदम क्या है?",
        question_text_en: "What is the first step when a diagnostic tool shows a code you don't know?",
        options: [
            { hi: "किसी दोस्त को कॉल करें", en: "Call a friend", isCorrect: false },
            { hi: "OEM सर्विस मैनुअल में कोड डिस्क्रिप्शन देखें", en: "Check the OEM Service Manual for the code description", isCorrect: true },
            { hi: "VCU बदल दें", en: "Replace the VCU", isCorrect: false },
            { hi: "थ्रॉटल को 3 बार घुमाकर रीसेट करें", en: "Twist the throttle 3 times to reset", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "सॉफ्टवेयर फ्लैश शुरू करने के लिए न्यूनतम 12V बैटरी वोल्टेज कितना चाहिए?",
        question_text_en: "What is the minimum 12V battery voltage required to start a software flash?",
        options: [
            { hi: "5V", en: "5V", isCorrect: false },
            { hi: "9V", en: "9V", isCorrect: false },
            { hi: "12.4V या उससे ज्यादा (स्थिर)", en: "12.4V or higher (Stable)", isCorrect: true },
            { hi: "वोल्टेज मायने नहीं रखता", en: "Voltage doesn't matter", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "नया MCU लगाने के बाद, बिना एरर के भी स्कूटी क्यों नहीं चलती?",
        question_text_en: "After replacing a NEW MCU, why won't the scooty move even if there are no errors?",
        options: [
            { hi: "मोटर शर्मीली है", en: "The motor is shy", isCorrect: false },
            { hi: "MCU को VCU के साथ 'पेयरिंग' या 'कॉन्फ़िगरेशन' की जरूरत है", en: "The MCU needs 'Pairing' or 'Configuration' with the VCU", isCorrect: true },
            { hi: "बैटरी फुल है", en: "The battery is full", isCorrect: false },
            { hi: "चाबियाँ गलत हैं", en: "The keys are wrong", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "DC-DC कनवर्टर क्या करता है?",
        question_text_en: "A DC-DC Converter does what?",
        options: [
            { hi: "मेन बैटरी चार्ज करता है", en: "Charges the main battery", isCorrect: false },
            { hi: "72V ट्रैक्शन पावर को 12V में बदलता है लाइट/हॉर्न के लिए", en: "Turns 72V Traction power into 12V for lights/horn", isCorrect: true },
            { hi: "DC को AC में बदलता है मोटर के लिए", en: "Converts DC to AC for the motor", isCorrect: false },
            { hi: "बाइक की स्पीड बढ़ाता है", en: "Increases the speed of the bike", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "मेन बैटरी कनेक्टर के अंदर 'कार्बन/काले निशान' दिखें तो सही एक्शन क्या है?",
        question_text_en: "You see 'Carbon/Black marks' inside the main battery connector. What is the correct action?",
        options: [
            { hi: "कपड़े से साफ करें और वापस लगा दें", en: "Clean it with a cloth and plug it back in", isCorrect: false },
            { hi: "कनेक्टर बदलें और टर्मिनल टेंशन चेक करें", en: "Replace the connector and check the terminal tension", isCorrect: true },
            { hi: "स्पार्किंग रोकने के लिए ग्रीस लगा दें", en: "Put some grease on it to stop the sparking", isCorrect: false },
            { hi: "इसे इग्नोर करें", en: "Ignore it", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "वायर में 'ब्रेक' (कंटीन्यूटी) चेक करने के लिए मल्टीमीटर कहाँ सेट करें?",
        question_text_en: "You need to check a wire for a 'break' (continuity). Where do you set your Multimeter?",
        options: [
            { hi: "DC वोल्टेज (V=)", en: "DC Voltage (V=)", isCorrect: false },
            { hi: "रेजिस्टेंस/कंटीन्यूटी (Ohm/Beep सिंबल)", en: "Resistance/Continuity (Ohm/Beep symbol)", isCorrect: true },
            { hi: "AC वोल्टेज (V~)", en: "AC Voltage (V~)", isCorrect: false },
            { hi: "करंट मोड", en: "Current mode", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "बारिश में 'पानी में डूबी' बाइक आए तो सबसे पहले क्या करें?",
        question_text_en: "A customer brings a bike that was 'submerged in water' during rain. What is the first thing you do?",
        options: [
            { hi: "इग्निशन ऑन करके स्क्रीन चेक करें", en: "Turn on the ignition to see if the screen works", isCorrect: false },
            { hi: "तुरंत बैटरी आइसोलेट करें और इग्निशन ऑन न करें", en: "Isolate the battery immediately and do NOT turn on the ignition", isCorrect: true },
            { hi: "मोटर को ब्लो-ड्राई करें और वापस दे दें", en: "Blow-dry the outside of the motor and give it back", isCorrect: false },
            { hi: "कस्टमर से पूछें कि पानी कितना था", en: "Ask the customer how much water there was", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "वर्कशॉप में बैटरी चार्ज करते समय 'गर्म' (50°C से ऊपर) लगे तो क्या करें?",
        question_text_en: "You are charging a battery in the workshop and it feels 'Hot to touch' (above 50°C). What do you do?",
        options: [
            { hi: "चार्जिंग जारी रखें, गर्मी में नॉर्मल है", en: "Keep charging, it's normal in Indian summers", isCorrect: false },
            { hi: "चार्जिंग बंद करें, डिस्कनेक्ट करें और सेफ एरिया में ले जाएं", en: "Stop charging, disconnect, and move it to an open/safe area", isCorrect: true },
            { hi: "बैटरी पर पानी डालकर ठंडा करें", en: "Pour water on the battery to cool it down", isCorrect: false },
            { hi: "AC चालू कर दें", en: "Turn on the AC", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "खुली बैटरी पैक को हैंडल करने का 'गोल्डन रूल' क्या है?",
        question_text_en: "What is the 'Golden Rule' for handling an opened Battery Pack?",
        options: [
            { hi: "मैग्नेटिक स्क्रूड्राइवर यूज करें ताकि स्क्रू न गिरें", en: "Always use magnetic screwdrivers so screws don't fall", isCorrect: false },
            { hi: "'इंसुलेटेड टूल्स' यूज करें और मेटल रिंग/घड़ी उतार दें", en: "Use only 'Insulated Tools' and remove your metal ring/watch", isCorrect: true },
            { hi: "जितना जल्दी हो सके काम करें", en: "Work as fast as possible", isCorrect: false },
            { hi: "दस्ताने पहनने की जरूरत नहीं", en: "No need to wear gloves", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "VCU बदलने से पहले सही सेफ्टी सीक्वेंस क्या है?",
        question_text_en: "You are about to replace a faulty VCU. Which is the CORRECT safety sequence?",
        options: [
            { hi: "सीट खोलें→HV बैटरी डिस्कनेक्ट→12V बैटरी डिस्कनेक्ट→VCU निकालें", en: "Open seat → Disconnect HV Battery → Disconnect 12V Battery → Remove VCU", isCorrect: false },
            { hi: "सीट खोलें→12V बैटरी डिस्कनेक्ट→HV बैटरी डिस्कनेक्ट→VCU निकालें", en: "Open seat → Disconnect 12V Battery → Disconnect HV Battery → Remove VCU", isCorrect: true },
            { hi: "VCU खोलें→12V बैटरी डिस्कनेक्ट→HV बैटरी डिस्कनेक्ट", en: "Unbolt VCU → Disconnect 12V Battery → Disconnect HV Battery", isCorrect: false },
            { hi: "HV बैटरी डिस्कनेक्ट→VCU खोलें→12V बैटरी डिस्कनेक्ट", en: "Disconnect HV Battery → Unbolt VCU → Disconnect 12V Battery", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "मोटर फेज वायर छूने से पहले 'जीरो वोल्टेज' कैसे वेरिफाई करें?",
        question_text_en: "How do you verify 'Zero Voltage' before touching motor phase wires?",
        options: [
            { hi: "बैटरी टर्मिनल पर टेस्ट लैंप यूज करें", en: "Use a test lamp on the battery terminals", isCorrect: false },
            { hi: "मल्टीमीटर DC वोल्टेज पर सेट करें और MCU टर्मिनल (P+ और P-) पर <5V दिखने तक चेक करें", en: "Set Multimeter to DC Voltage and check across MCU input terminals (P+ and P-) until it shows <5V", isCorrect: true },
            { hi: "मल्टीमीटर रेजिस्टेंस पर सेट करें और मोटर केसिंग चेक करें", en: "Set Multimeter to Resistance and check motor casing", isCorrect: false },
            { hi: "हाथ के पीछे से वायर टच करके गर्मी महसूस करें", en: "Touch the wires quickly with the back of your hand", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 1,
        question_text_hi: "नई मोटर लगाई और थ्रॉटल दबाने पर उल्टी घूमती है। क्या फिक्स करें?",
        question_text_en: "You just installed a NEW Motor. It spins backward when you twist the throttle. What is the fix?",
        options: [
            { hi: "मोटर खोलें और मैग्नेट पलट दें", en: "Open the motor and flip the magnets", isCorrect: false },
            { hi: "बैटरी के पॉजिटिव और नेगेटिव वायर स्वैप करें", en: "Swap the Positive and Negative wires on the battery", isCorrect: false },
            { hi: "तीन मोटर फेज वायर में से कोई दो स्वैप करें (जैसे Yellow और Blue)", en: "Swap any TWO of the three motor phase wires (e.g., Yellow and Blue)", isCorrect: true },
            { hi: "डैशबोर्ड सॉफ्टवेयर को तीन बार रीसेट करें", en: "Reset the dashboard software three times", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
];

const technicianStep2Questions = [
    {
        role: "technician",
        step: 2,
        question_text_hi: "डायग्नोस्टिक टूल P0A0D (High Voltage Interlock Circuit) एरर दिखाए और आपको नहीं पता। सही 'सोल्जर' मूव क्या है?",
        question_text_en: "The Diagnostic tool shows Error Code P0A0D (High Voltage Interlock Circuit). You don't know this code. What is the CORRECT 'Soldier' move?",
        options: [
            { hi: "कोड क्लियर करें और कस्टमर को बोलें ठीक हो गया", en: "Clear the code and tell the customer it's fixed", isCorrect: false },
            { hi: "OEM सर्विस मैनुअल PDF खोलें→'P0A0D' सर्च करें→स्टेप-बाय-स्टेप वायरिंग चेक फॉलो करें", en: "Open the OEM Service Manual PDF → Search 'P0A0D' → Follow the step-by-step wiring check for Safety Interlock", isCorrect: true },
            { hi: "मेन वायरिंग हार्नेस तुरंत बदल दें", en: "Replace the main wiring harness immediately", isCorrect: false },
            { hi: "किसी दोस्त को कॉल करें और पूछें", en: "Call a friend and ask them what they think", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "सॉफ्टवेयर/फर्मवेयर अपडेट शुरू करते समय कौन सी कंडीशन 'FAIL' (अपडेट रोकें) है?",
        question_text_en: "You are starting a Software/Firmware Update. Which condition is a 'FAIL' (Stop the update)?",
        options: [
            { hi: "स्कूटर स्टेबल Wi-Fi से कनेक्ट है", en: "The scooter is connected to a stable Wi-Fi", isCorrect: false },
            { hi: "12V बैटरी वोल्टेज 10.8V है (बहुत कम - ब्रिकिंग का रिस्क)", en: "The 12V Battery voltage is 10.8V (Too Low - Risk of Bricking)", isCorrect: true },
            { hi: "मेन ट्रैक्शन बैटरी 60% SOC पर है", en: "The Main Traction Battery is at 60% SOC", isCorrect: false },
            { hi: "साइड-स्टैंड नीचे है", en: "The Side-stand is down", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "नई ट्रैक्शन बैटरी के टर्मिनल बोल्ट करते समय सही तरीका क्या है?",
        question_text_en: "You are bolting the terminals of a new Traction Battery. Which is the CORRECT way?",
        options: [
            { hi: "नॉर्मल रेंच से जितना हो सके टाइट करें ताकि कभी लूज न हो", en: "Tighten as hard as you can with a normal wrench so it never comes loose", isCorrect: false },
            { hi: "टॉर्क रेंच यूज करें OEM स्पेक (जैसे 10 Nm) पर सेट करके ताकि आर्किंग या टर्मिनल डैमेज न हो", en: "Use a Torque Wrench set to the OEM spec (e.g., 10 Nm) to prevent arcing or terminal damage", isCorrect: true },
            { hi: "स्क्रूड्राइवर और इलेक्ट्रिकल टेप से वायर होल्ड करें", en: "Use a screwdriver and some electrical tape to hold the wire", isCorrect: false },
            { hi: "थोड़ा लूज रखें ताकि वायर आसानी से हिल सके", en: "Leave it slightly loose so the wire can move easily", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "BMS 'Cell Imbalance' दिखाए (एक सेल 3.1V, बाकी 4.1V)। इसका क्या मतलब है?",
        question_text_en: "The BMS shows a 'Cell Imbalance' (One cell is 3.1V, others are 4.1V). What does this mean?",
        options: [
            { hi: "बैटरी को बस 24 घंटे चार्ज करना है", en: "The battery just needs to be charged for 24 hours", isCorrect: false },
            { hi: "चार्जर खराब है और बदलना है", en: "The charger is defective and needs replacement", isCorrect: false },
            { hi: "बैटरी पैक में हार्डवेयर फॉल्ट है और सेफ्टी रिस्क है; प्रोफेशनल रिपेयर/रिप्लेसमेंट जरूरी", en: "The battery pack has a hardware fault and is a safety risk; needs professional repair/replacement", isCorrect: true },
            { hi: "राइडर बहुत तेज चला रहा है", en: "The rider is driving too fast", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "किसी भी मोटर या ट्रैक्शन बैटरी (HV कंपोनेंट) पर काम करने से पहले पहला एक्शन क्या है?",
        question_text_en: "Before working on any motor or traction battery (HV COMPONENT), the FIRST action is:",
        options: [
            { hi: "बॉडी पैनल हटाएं", en: "Remove body panels", isCorrect: false },
            { hi: "12V बैटरी डिस्कनेक्ट करें", en: "Disconnect 12V battery", isCorrect: true },
            { hi: "सिर्फ इग्निशन ऑफ करें", en: "Switch OFF ignition only", isCorrect: false },
            { hi: "कस्टमर को इनफॉर्म करें", en: "Inform customer", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "HV Motor Controller/ट्रैक्शन बैटरी बदलने के लिए सही क्रम क्या है?",
        question_text_en: "To ensure 100% safe work on HV components, what is the exact order of steps?",
        options: [
            { hi: "सर्विस प्लग हटाएं→12V बैटरी डिस्कनेक्ट→HV केबल हटाएं", en: "Remove Service Plug → Disconnect 12V Battery → Remove HV Cables", isCorrect: false },
            { hi: "12V बैटरी डिस्कनेक्ट→सर्विस प्लग हटाएं→5 मिनट रुकें→मल्टीमीटर से 0V वेरिफाई करें", en: "Disconnect 12V Battery → Remove Service Plug → Wait 5 Minutes → Verify 0V with Multimeter", isCorrect: true },
            { hi: "सर्विस प्लग हटाएं→5 मिनट रुकें→इग्निशन ऑफ करें", en: "Remove Service Plug → Wait 5 Minutes → Turn off Ignition", isCorrect: false },
            { hi: "इग्निशन ऑफ करें→HV केबल हटाएं→12V बैटरी डिस्कनेक्ट", en: "Turn off Ignition → Remove HV Cables → Disconnect 12V Battery", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "12V या HV बैटरी केबल डिस्कनेक्ट करते समय कौन सा टर्मिनल पहले हटाएं?",
        question_text_en: "When disconnecting the 12V or HV Battery cables, which terminal should you remove FIRST?",
        options: [
            { hi: "पॉजिटिव टर्मिनल (+)", en: "The Positive terminal (+)", isCorrect: false },
            { hi: "नेगेटिव टर्मिनल (-)", en: "The Negative terminal (-)", isCorrect: true },
            { hi: "दोनों एक साथ", en: "Both at the same time", isCorrect: false },
            { hi: "कोई फर्क नहीं पड़ता", en: "It doesn't matter", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "बैटरी टर्मिनल साफ करने के लिए डिस्कनेक्ट किया। वापस लगाने पर 'BMS Error' दिखे और बाइक स्टार्ट न हो। पहले क्या करें?",
        question_text_en: "You disconnected battery terminals to clean them. After putting them back, the bike shows 'BMS Error' and won't start. What should you do first?",
        options: [
            { hi: "नई बैटरी ऑर्डर करें", en: "Order a new battery", isCorrect: false },
            { hi: "सॉफ्टवेयर पेयरिंग करें", en: "Perform Software Pairing", isCorrect: false },
            { hi: "लूज कनेक्शन चेक करें और 12V रीसेट (डिस्कनेक्ट/रीकनेक्ट 12V) करें", en: "Check for a loose connection and perform a 12V Reset (Disconnect/Reconnect 12V)", isCorrect: true },
            { hi: "मोटर बदलें", en: "Change the Motor", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "EV थ्रॉटल (एक्सेलरेटर) सही काम कर रहा है या नहीं चेक करने के लिए मल्टीमीटर किस मोड पर हो और टिपिकल वोल्टेज रेंज क्या है?",
        question_text_en: "To check if an EV throttle (accelerator) is working correctly, what mode should the Multimeter be in and what is the typical voltage range?",
        options: [
            { hi: "AC वोल्टेज मोड; 12V से 24V", en: "AC Voltage mode; 12V to 24V", isCorrect: false },
            { hi: "रेजिस्टेंस (Ohms) मोड; 0Ω से 100Ω", en: "Resistance (Ohms) mode; 0Ω to 100Ω", isCorrect: false },
            { hi: "DC वोल्टेज मोड; लगभग 0.8V से 4.2V", en: "DC Voltage mode; approximately 0.8V to 4.2V", isCorrect: true },
            { hi: "कंटीन्यूटी मोड; थ्रॉटल घुमाने पर लाउड बीप", en: "Continuity mode; a loud beep when throttle is twisted", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "डायग्नोस्टिक टूल (स्कैनर) OBD-II पोर्ट में प्लग किया लेकिन स्क्रीन ऑन नहीं हुई। सबसे संभावित कारण क्या है?",
        question_text_en: "You plug your Diagnostic Tool (Scanner) into the EV's OBD-II port, but the tool's screen does not light up at all. What is the most likely reason?",
        options: [
            { hi: "मेन ट्रैक्शन बैटरी (72V) डिस्चार्ज है", en: "The main Traction Battery (72V) is discharged", isCorrect: false },
            { hi: "Motor Controller (MCU) खराब है", en: "The Motor Controller (MCU) is faulty", isCorrect: false },
            { hi: "12V ऑक्सिलरी बैटरी लो है या OBD पावर फ्यूज उड़ा हुआ है", en: "The 12V Auxiliary Battery is low or the OBD power fuse is blown", isCorrect: true },
            { hi: "बाइक 'Eco Mode' में है", en: "The bike is in 'Eco Mode'", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "मल्टीमीटर मुख्य रूप से किसलिए यूज होता है?",
        question_text_en: "Multimeter is mainly used to:",
        options: [
            { hi: "बोल्ट टाइट करना", en: "Tighten bolts", isCorrect: false },
            { hi: "वोल्टेज/करंट/कंटीन्यूटी मापना", en: "Measure voltage/current/continuity", isCorrect: true },
            { hi: "वाहन धोना", en: "Wash vehicle", isCorrect: false },
            { hi: "ECU प्रोग्राम करना", en: "Program ECU", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "डायग्नोस्टिक टूल / स्कैन टूल किसलिए यूज होता है?",
        question_text_en: "What do you use a diagnostic tool for?",
        options: [
            { hi: "टायर इन्फ्लेट करना", en: "Inflate tyre", isCorrect: false },
            { hi: "एरर कोड और सिस्टम स्टेटस देखना", en: "See error codes & system status", isCorrect: true },
            { hi: "बॉडी पेंट करना", en: "Paint body", isCorrect: false },
            { hi: "बैटरी चार्ज करना", en: "Charge battery", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "डायग्नोस्टिक टूल आमतौर पर कहाँ कनेक्ट होता है?",
        question_text_en: "Where is diagnostic tool usually connected?",
        options: [
            { hi: "बैटरी टर्मिनल", en: "Battery terminal", isCorrect: false },
            { hi: "डायग्नोस्टिक पोर्ट / सर्विस कनेक्टर", en: "Diagnostic port / service connector", isCorrect: true },
            { hi: "हेडलैंप सॉकेट", en: "Headlamp socket", isCorrect: false },
            { hi: "मोटर केबल", en: "Motor cable", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "EV वर्क में SOP क्यों जरूरी है?",
        question_text_en: "Why is SOP important in EV work?",
        options: [
            { hi: "अटेंडेंस के लिए", en: "For attendance", isCorrect: false },
            { hi: "सेफ्टी और सही प्रोसेस के लिए", en: "For safety & correct process", isCorrect: true },
            { hi: "बिलिंग के लिए", en: "For billing", isCorrect: false },
            { hi: "कस्टमर सिग्नेचर के लिए", en: "For customer signature", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "technician",
        step: 2,
        question_text_hi: "अगर SOP कहे HV शटडाउन के बाद 10 मिनट रुकें, तो क्यों रुकते हैं?",
        question_text_en: "If SOP says wait 10 minutes after HV shutdown, why do we wait?",
        options: [
            { hi: "चाय ब्रेक", en: "Tea break", isCorrect: false },
            { hi: "कूलिंग", en: "Cooling", isCorrect: false },
            { hi: "कैपेसिटर डिस्चार्ज / वोल्टेज ड्रॉप", en: "Capacitor discharge / voltage drop", isCorrect: true },
            { hi: "पेपरवर्क के लिए", en: "For paperwork", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
];

const salesQuestions = [
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर स्कूटर की 'True Range' पूछे। मार्केटिंग ब्रोशर में 150km (IDC) है, लेकिन सिटी ट्रैफिक में 100km मिलती है। क्या बताएं?",
        question_text_en: "A customer asks for the 'True Range' of the scooter. The marketing brochure says 150km (IDC), but in city traffic it gives 100km. What do you tell the customer?",
        options: [
            { hi: "150km फिगर पर रहें; वरना कस्टमर नहीं खरीदेगा", en: "Stick to the 150km figure; otherwise, the customer won't buy it", isCorrect: false },
            { hi: "IDC (Ideal) और True Range का फर्क समझाएं, और राइडिंग स्टाइल पूछकर रियलिस्टिक 100-110km एस्टीमेट दें", en: "Explain the difference between IDC (Ideal) and True Range, and ask about their riding style to give a realistic 100-110km estimate", isCorrect: true },
            { hi: "बोलें 'धीरे चलाओ तो रेंज अनलिमिटेड है'", en: "Say 'Range is unlimited if you drive slowly'", isCorrect: false },
            { hi: "सेल क्लोज करने के लिए 200km बोल दें", en: "Tell them the range is 200km just to close the sale today", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर लाउंज में डिलीवरी का इंतजार कर रहा है। सेल्स टीम तुरंत बाइक देने का प्रेशर दे रही है, लेकिन PDI चेकलिस्ट 50% ही पूरी हुई है। क्या करें?",
        question_text_en: "A customer is waiting in the lounge for delivery. Sales team is pushing to hand over the bike immediately, but PDI checklist is only 50% complete. What do you do?",
        options: [
            { hi: "बाइक दे दें और कस्टमर को कल आने बोलें बाकी चेकअप के लिए", en: "Hand over the bike and tell customer to come back tomorrow for remaining checkup", isCorrect: false },
            { hi: "हैंडओवर से मना करें। सेल्स टीम को समझाएं कि इनकम्पलीट PDI सेफ्टी रिस्क है, और हर 'Critical Safety Point' साइन ऑफ होने के बाद ही बाइक दें", en: "Refuse handover. Explain to Sales team that incomplete PDI is safety risk, and only release bike after every Critical Safety Point is signed off", isCorrect: true },
            { hi: "बिना चेक किए खुद PDI पेपर साइन कर दें", en: "Sign the PDI paper yourself without checking the bike", isCorrect: false },
            { hi: "टेक्नीशियन से बोलें सिर्फ लाइट और हॉर्न चेक करें, बैटरी डायग्नोस्टिक स्किप करें", en: "Tell technician to check only lights and horns, skip battery diagnostic", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर को 3 साल वारंटी खत्म होने के बाद बैटरी रिप्लेसमेंट की हाई कॉस्ट की चिंता है। कैसे जवाब दें?",
        question_text_en: "A customer is worried about high cost of battery replacement after 3-year warranty ends. How do you respond?",
        options: [
            { hi: "बोलें बैटरी कभी फेल नहीं होती, चिंता मत करो", en: "Tell them batteries never fail, so they don't need to worry", isCorrect: false },
            { hi: "बोलें वारंटी खत्म होने से पहले बाइक बेच दो", en: "Tell them to sell the bike before warranty expires", isCorrect: false },
            { hi: "सेल्स के 'Life Cycles' और 3 साल में cost-per-km सेविंग्स समझाएं जो बैटरी कॉस्ट कवर करती है", en: "Explain 'Life Cycles' of cells and cost-per-km savings over 3 years which covers battery cost", isCorrect: true },
            { hi: "झूठ बोलें कि वारंटी 10 साल की है", en: "Lie and say warranty is actually for 10 years", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर बोले 'Ola/Ather बेहतर है क्योंकि टॉप स्पीड ज्यादा है'। इसे कैसे हैंडल करें?",
        question_text_en: "A customer says 'Ola/Ather is better because it has higher top speed.' How do you handle this?",
        options: [
            { hi: "उनसे अग्री करें और बोलें आपका मॉडल खराब है", en: "Agree with them and say your model is bad", isCorrect: false },
            { hi: "कॉम्पिटिटर की स्ट्रेंथ एक्नॉलेज करें, फिर अपने मॉडल के यूनिक एडवांटेज हाइलाइट करें (जैसे बेहतर बिल्ड क्वालिटी, सर्विस नेटवर्क, बूट स्पेस)", en: "Acknowledge competitor's strength, then highlight your model's unique advantages (better build quality, service network, boot space)", isCorrect: true },
            { hi: "कस्टमर को बोलें वो गलत हैं और बाइक के बारे में कुछ नहीं जानते", en: "Tell customer they are wrong and don't know anything about bikes", isCorrect: false },
            { hi: "कॉम्पिटिटर ब्रांड की क्वालिटी को इंसल्ट करें", en: "Start insulting the competitor brand's quality", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "बहुत से कस्टमर 'Tech-Scared' हैं। 'Hill Hold' या 'Regenerative Braking' जैसे फीचर्स कैसे समझाएं?",
        question_text_en: "Many customers are 'Tech-Scared.' How should you explain features like 'Hill Hold' or 'Regenerative Braking'?",
        options: [
            { hi: "स्मार्ट साउंड करने के लिए कॉम्प्लेक्स इंजीनियरिंग टर्म्स यूज करें", en: "Use complex engineering terms to sound smart", isCorrect: false },
            { hi: "'Benefit-Led' एक्सप्लेनेशन यूज करें (जैसे 'Hill-Hold का मतलब आपकी बाइक स्लोप पर पीछे नहीं जाएगी भले ब्रेक छोड़ दो')", en: "Use 'Benefit-Led' explanations (e.g., 'Hill-Hold means your bike won't roll back on slope even if you leave brakes')", isCorrect: true },
            { hi: "बोलें खरीदने के बाद मैनुअल पढ़ लेना", en: "Just tell them to read the manual after buying", isCorrect: false },
            { hi: "टेक फीचर्स का जिक्र न करें; कस्टमर कन्फ्यूज होता है", en: "Don't mention tech features; they confuse customer", isCorrect: false },
        ],
        points: 1,
        difficulty: "easy",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "एक सीनियर सिटीजन शोरूम आए। EV में इंटरेस्ट है लेकिन टच-स्क्रीन और मोबाइल ऐप से ओवरव्हेल्म्ड हैं। आपका अप्रोच क्या है?",
        question_text_en: "A senior citizen visits showroom. Interested in EV but overwhelmed by touch-screen and mobile app features. What is your approach?",
        options: [
            { hi: "बोलें सीखना पड़ेगा क्योंकि 'यही फ्यूचर है' और YouTube ट्यूटोरियल दिखाएं", en: "Tell them they must learn because 'this is the future' and show YouTube tutorial", isCorrect: false },
            { hi: "पिच सिम्प्लीफाई करें। 'Key-and-Go' सिम्प्लिसिटी, मैकेनिकल सेफ्टी, कम्फर्ट पर फोकस करें और ऐप पर्सनली सेटअप करने की ऑफर दें", en: "Simplify pitch. Focus on 'Key-and-Go' simplicity, mechanical safety, comfort, and offer to set up app for them personally", isCorrect: true },
            { hi: "सजेस्ट करें पेट्रोल बाइक लें क्योंकि EV यंग लोगों के लिए है", en: "Suggest they buy petrol bike since EVs are for young people", isCorrect: false },
            { hi: "टेक फीचर्स इग्नोर करें और सिर्फ कलर और प्राइस बताएं", en: "Ignore tech features and only talk about color and price", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर बोले 'आपकी EV की इनिशियल प्राइस पेट्रोल स्कूटर से ₹30,000 ज्यादा है। बहुत महंगा है।' वैल्यू कैसे प्रूव करें?",
        question_text_en: "A customer says 'Your EV initial price is ₹30,000 more than petrol scooter. Too expensive.' How do you prove the value?",
        options: [
            { hi: "अग्री करें और डील क्लोज करने के लिए तुरंत ₹5,000 डिस्काउंट ऑफर करें", en: "Agree it is expensive and offer ₹5,000 discount immediately to close deal", isCorrect: false },
            { hi: "उनकी डेली रनिंग पूछें (जैसे 40km) और 'Per Day' पेट्रोल vs इलेक्ट्रिसिटी सेविंग कैलकुलेट करके दिखाएं कि 12-15 महीने में ₹30k रिकवर हो जाते हैं", en: "Ask their daily running (e.g., 40km) and calculate 'Per Day' petrol vs electricity savings to show they recover ₹30k in 12-15 months", isCorrect: true },
            { hi: "बोलें अगले साल पेट्रोल डबल हो जाएगा तो चॉइस नहीं है", en: "Tell them petrol prices will double next year so they have no choice", isCorrect: false },
            { hi: "सिर्फ 'Environment' और 'Green Energy' पर फोकस करें", en: "Focus only on Environment and Green Energy to make them feel guilty", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर बोले 'Competitor X की 5.0 kWh बैटरी है, आपकी सिर्फ 4.0 kWh। आपकी कमजोर है।' कैसे जवाब दें?",
        question_text_en: "Customer says 'Competitor X has 5.0 kWh battery, yours is only 4.0 kWh. Yours is weaker.' How do you respond?",
        options: [
            { hi: "झूठ बोलें आपकी बैटरी 5.5 kWh है", en: "Lie and say your battery is actually 5.5 kWh", isCorrect: false },
            { hi: "बोलें Competitor X 'low-quality' सेल्स यूज करता है जो फटेंगी", en: "Say Competitor X is using 'low-quality' cells that will explode", isCorrect: false },
            { hi: "बैटरी साइज एक्नॉलेज करें, फिर 'Efficiency' समझाएं (जैसे 'हमारी बाइक 20kg हल्की है और मोटर 95% एफिशिएंट है, तो सेफर, हल्की बैटरी में भी सेम रेंज मिलती है')", en: "Acknowledge battery size, then explain 'Efficiency' (e.g., 'Our bike is 20kg lighter and motor is 95% efficient, so we give same range with safer, lighter battery')", isCorrect: true },
            { hi: "बोलें 'बैटरी साइज मैटर नहीं करता' और टॉपिक बदल दें", en: "Tell customer 'battery size doesn't matter' and change topic", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "आप देखते हैं कस्टमर बिना बुकिंग किए शोरूम से निकल रहा है। उन्हें रोकने का सबसे 'Customer-Centric' तरीका क्या है?",
        question_text_en: "You see a customer walking out of showroom without booking. What is the most 'Customer-Centric' way to stop them?",
        options: [
            { hi: "'सर, अभी बुक करो तो फ्री हेलमेट दूंगा'", en: "'Sir, if you book now, I will give you a free helmet'", isCorrect: false },
            { hi: "'सर, मैंने नोटिस किया आप 'Charging Time' से concerned थे। क्या मैं 'Fast Home Charger' दिखाऊं? शायद वो worry सॉल्व हो जाए'", en: "'Sir, I noticed you were concerned about Charging Time. May I show you our Fast Home Charger? It might solve that worry'", isCorrect: true },
            { hi: "'सर, दूसरे शोरूम मत जाओ, उनकी बाइक बहुत खराब हैं'", en: "'Sir, please don't go to other showroom, their bikes are very bad'", isCorrect: false },
            { hi: "जाने दो; जो तुरंत नहीं खरीदता वो 'serious' buyer नहीं है", en: "Let them go; a customer who doesn't buy immediately is not a 'serious' buyer", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर 90% convince है लेकिन बोले 'सोचकर अगले महीने आऊंगा।' अभी सेल क्लोज करने के लिए कैसे हैंडल करें?",
        question_text_en: "Customer is 90% convinced but says 'I'll think about it and come back next month.' How do you handle this to close the sale now?",
        options: [
            { hi: "बोलें कल प्राइस बढ़ जाएगा (भले न बढ़े) उन्हें डराने के लिए", en: "Tell them price will increase tomorrow (even if it won't) to scare them into buying", isCorrect: false },
            { hi: "'Discovery Question' पूछें: 'सर, आमतौर पर जब कोई सोचने बोलता है, तो कोई स्पेसिफिक डाउट होता है जो मैंने क्लियर नहीं किया। चार्जिंग है, रेंज है, या प्राइस?'", en: "Ask 'Discovery Question': 'Sir, usually when someone says they need to think, there is specific doubt I haven't cleared. Is it charging, range, or price?'", isCorrect: true },
            { hi: "'ओके, नो प्रॉब्लम' बोलकर जाने दें", en: "Say 'Okay, no problem' and let them walk out", isCorrect: false },
            { hi: "बाइक के फीचर्स और जोर से रिपीट करते रहें", en: "Keep repeating features of bike louder so they listen better", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "कस्टमर बुकिंग फॉर्म साइन करने वाला है और बोले 'बहुत खुश हूं कि अगले 1 साल इस बाइक पर एक पैसा खर्च नहीं करना।' कैसे जवाब दें?",
        question_text_en: "Customer is about to sign booking form and says 'I am so happy that for next 1 year, I won't spend a single rupee on this bike.' How do you respond?",
        options: [
            { hi: "कुछ न बोलें और बुकिंग लें—टेक्निकली आपने झूठ नहीं बोला, उन्होंने assume किया", en: "Say nothing and take booking—technically you didn't lie, they just assumed", isCorrect: false },
            { hi: "'सर, मैं 100% क्लियर करना चाहता हूं: सर्विस के लेबर चार्जेस जीरो हैं, लेकिन ब्रेक पैड या टायर जैसे फिजिकल पार्ट्स पेड आइटम्स हैं। ऑयल और पेट्रोल बचता है, लेकिन टायर की कॉस्ट है'", en: "'Sir, I want to be 100% clear: Labor Charges for service are zero, but physical parts like brake pads or tires are paid items. You save on oil and petrol, but tires are still a cost'", isCorrect: true },
            { hi: "बोलें सब कुछ फ्री है, टायर भी, ताकि बुकिंग कैंसल न हो", en: "Tell them everything is indeed free, including tires, to ensure they don't cancel", isCorrect: false },
            { hi: "बोलें बाइक इतनी अच्छी है कि 5 साल तक पार्ट्स नहीं बदलने पड़ेंगे", en: "Tell them bike is so good it will never need new parts for 5 years", isCorrect: false },
        ],
        points: 1,
        difficulty: "hard",
    },
    {
        role: "sales",
        step: 1,
        question_text_hi: "आपका EV ब्रांड कोई 'Free Services' ऑफर नहीं करता। हर विजिट 'Paid Service' है। कस्टमर को कैसे समझाएं जो पेट्रोल बाइक में 4 फ्री सर्विस के आदी है?",
        question_text_en: "Your EV brand does NOT offer 'Free Services.' Every visit is 'Paid Service.' How do you explain this to customer who is used to 4 free services with petrol bike?",
        options: [
            { hi: "झूठ बोलें पहली दो फ्री हैं और 6 महीने बाद भूल जाएंगे", en: "Lie and say first two are free, then hope they forget after 6 months", isCorrect: false },
            { hi: "'सर, पेट्रोल बाइक को बार-बार ऑयल चेंज चाहिए, हमारी EV को साल में एक बार चेकअप। 'Software Diagnostic' और 'Battery Health Report' के लिए छोटी फीस लेते हैं आपकी बाइक सेफ रहे'", en: "'Sir, unlike petrol bikes that need frequent oil changes, our EV only needs yearly checkup. We charge small fee for Software Diagnostic and Battery Health Report to keep your bike safe'", isCorrect: true },
            { hi: "बोलें 'सर्विस फ्री है' लेकिन कॉस्ट रजिस्ट्रेशन या इंश्योरेंस में छुपा दें", en: "Tell them 'Service is free' but add cost hidden in registration or insurance", isCorrect: false },
            { hi: "बोलें बाइक इतनी अच्छी है कि कभी सर्विस सेंटर आने की जरूरत नहीं", en: "Tell them bike is so good it never needs to come to service center", isCorrect: false },
        ],
        points: 1,
        difficulty: "medium",
    },
];

async function updateAllQuestions() {
    try {
        console.log('🔄 Starting migration of ALL questions...');

        // 1. Clear existing questions for Technician (Step 1 & 2) and Sales
        console.log('🧹 Clearing existing questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'technician' AND step IN (1, 2)`;
        await sql`DELETE FROM verification_questions WHERE role = 'sales' AND step = 1`;
        console.log('✅ Cleared old questions for Technician (Step 1 & 2) and Sales.');

        // 2. Insert Technician Step 1 Questions
        console.log('📝 Inserting Technician Step 1 questions...');
        let countTech1 = 0;
        for (const q of technicianStep1Questions) {
            await sql`
        INSERT INTO verification_questions (
          role, step, question_text_en, question_text_hi, options, points, difficulty
        ) VALUES (
          ${q.role}, 
          ${q.step}, 
          ${q.question_text_en}, 
          ${q.question_text_hi}, 
          ${JSON.stringify(q.options)}::jsonb,
          ${q.points},
          ${q.difficulty}
        )
      `;
            countTech1++;
        }
        console.log(`✅ Inserted ${countTech1} Technician Step 1 questions.`);

        // 3. Insert Technician Step 2 Questions
        console.log('📝 Inserting Technician Step 2 questions...');
        let countTech2 = 0;
        for (const q of technicianStep2Questions) {
            await sql`
        INSERT INTO verification_questions (
          role, step, question_text_en, question_text_hi, options, points, difficulty
        ) VALUES (
          ${q.role}, 
          ${q.step}, 
          ${q.question_text_en}, 
          ${q.question_text_hi}, 
          ${JSON.stringify(q.options)}::jsonb,
          ${q.points},
          ${q.difficulty}
        )
      `;
            countTech2++;
        }
        console.log(`✅ Inserted ${countTech2} Technician Step 2 questions.`);

        // 4. Insert Sales Questions
        console.log('📝 Inserting Sales questions...');
        let countSales = 0;
        for (const q of salesQuestions) {
            await sql`
        INSERT INTO verification_questions (
          role, step, question_text_en, question_text_hi, options, points, difficulty
        ) VALUES (
          ${q.role}, 
          ${q.step}, 
          ${q.question_text_en}, 
          ${q.question_text_hi}, 
          ${JSON.stringify(q.options)}::jsonb,
          ${q.points},
          ${q.difficulty}
        )
      `;
            countSales++;
        }
        console.log(`✅ Inserted ${countSales} Sales questions.`);

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error updating questions:', error);
    }
}

updateAllQuestions();
