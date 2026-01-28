const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

const technicianStep1Questions = [
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q1. What is this tool? (Imagine a photo of a Multimeter)",
        options: [
            { en: "Battery charger", isCorrect: false },
            { en: "Multimeter", isCorrect: true },
            { en: "Tyre inflator", isCorrect: false },
            { en: "Controller", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q2. Multimeter is mainly used to:",
        options: [
            { en: "Tighten bolts", isCorrect: false },
            { en: "Measure voltage/current/continuity", isCorrect: true },
            { en: "Wash vehicle", isCorrect: false },
            { en: "Program ECU", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q3. What is this device? (Imagine a photo of a Scan Tool)",
        options: [
            { en: "Air pump", isCorrect: false },
            { en: "Diagnostic tool / scan tool", isCorrect: true },
            { en: "GPS tracker", isCorrect: false },
            { en: "Battery tester", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q4. What do you use a diagnostic tool for?",
        options: [
            { en: "Inflate tyre", isCorrect: false },
            { en: "See error codes & system status", isCorrect: true },
            { en: "Paint body", isCorrect: false },
            { en: "Charge battery", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q5. Where is diagnostic tool usually connected?",
        options: [
            { en: "Battery terminal", isCorrect: false },
            { en: "Diagnostic port / service connector", isCorrect: true },
            { en: "Headlamp socket", isCorrect: false },
            { en: "Motor cable", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q6. Why is SOP (Standard Operating Procedure) important in EV work?",
        options: [
            { en: "For attendance", isCorrect: false },
            { en: "For safety & correct process", isCorrect: true },
            { en: "For billing", isCorrect: false },
            { en: "For customer signature", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q7. If SOP says wait 10 minutes after HV shutdown, why do we wait?",
        options: [
            { en: "Tea break", isCorrect: false },
            { en: "Cooling", isCorrect: false },
            { en: "Capacitor discharge / voltage drop", isCorrect: true },
            { en: "For paperwork", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q8. If diagnostic tool shows HV error code and you don't understand it, what will you do?",
        options: [
            { en: "Clear it", isCorrect: false },
            { en: "Deliver vehicle", isCorrect: false },
            { en: "Refer SOP or escalate to senior", isCorrect: true },
            { en: "Ignore", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q9. Have you personally connected a diagnostic tool and read codes on an EV?",
        options: [
            { en: "Yes, many times", isCorrect: true },
            { en: "Once or twice", isCorrect: false },
            { en: "Seen someone else", isCorrect: false },
            { en: "Never", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "Q10. Insulation resistance test is done to check:",
        options: [
            { en: "Battery capacity", isCorrect: false },
            { en: "Cable thickness", isCorrect: false },
            { en: "Leakage current to chassis / safety isolation", isCorrect: true },
            { en: "Motor speed", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 1,
        question_text_en: "which component stores the highest electrical energy in an EV?",
        options: [
            { en: "Controller", isCorrect: false },
            { en: "Motor", isCorrect: false },
            { en: "Battery pack", isCorrect: true },
            { en: "DC-DC converter", isCorrect: false }
        ]
    }
];

async function updateTechnicianStep1() {
    try {
        console.log('Clearing existing Technician Step 1 questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'technician' AND step = 1`;
        console.log('✅ Cleared old Step 1 questions.');

        console.log('Inserting new Technician Step 1 questions...');
        let count = 0;

        for (const q of technicianStep1Questions) {
            // Use English for Hindi as fallback
            const question_text_hi = q.question_text_en;

            const optionsJSON = JSON.stringify(q.options.map(opt => ({
                ...opt,
                hi: opt.en
            })));

            await sql`
        INSERT INTO verification_questions (
          role, step, question_text_en, question_text_hi, options
        ) VALUES (
          ${q.role}, 
          ${q.step}, 
          ${q.question_text_en}, 
          ${question_text_hi}, 
          ${optionsJSON}
        )
      `;
            count++;
        }

        console.log(`✅ Successfully inserted ${count} Technician Step 1 questions.`);
    } catch (error) {
        console.error('Error updating questions:', error);
    }
}

updateTechnicianStep1();
