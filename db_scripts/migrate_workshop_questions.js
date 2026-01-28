const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

const workshopQuestions = [
    {
        role: 'workshop',
        question_text_en: "Team Productivity: To ensure the workshop is profitable, how should you distribute the daily workload among your technicians?",
        options: [
            { en: "Give the most work to the junior technicians so they can learn.", isCorrect: false },
            { en: "Assign jobs based on a 'Skill Matrix' (matching the hardest jobs to the most skilled tech) to reduce repeat complaints.", isCorrect: true },
            { en: "Let the technicians choose their own jobs every morning.", isCorrect: false },
            { en: "Give every technician exactly the same number of vehicles regardless of the problem.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "The 'Job Card' Discipline: Why is it a 'Red Flag' if a Workshop Manager does not close all Job Cards (JCs) daily?",
        options: [
            { en: "Because the computer might run out of storage space.", isCorrect: false },
            { en: "It creates an 'Inventory Gap' in spare parts and delays the billing/revenue cycle for the dealership.", isCorrect: true },
            { en: "Technicians don't like seeing open JCs on the screen.", isCorrect: false },
            { en: "It makes the workshop look messy.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "Handling NPS Detractors: If a customer gives a 'Detractor' score (0-6) on an NPS survey, what is the most professional first step?",
        options: [
            { en: "Ignore it; some customers are never happy.", isCorrect: false },
            { en: "Call the customer and argue that the rating is unfair.", isCorrect: false },
            { en: "Call the customer within 24 hours to 'Listen, Apologize, and Resolve' (LAR) the specific issue.", isCorrect: true },
            { en: "Give the customer a 50% discount on their next service immediately without asking questions.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "Customer Retention Strategy: What is the most effective way to ensure a customer comes back for their next service?",
        options: [
            { en: "Having a big TV in the waiting lounge.", isCorrect: false },
            { en: "PSF (Post-Service Follow-up) calls within 3 days to ensure the vehicle is running perfectly.", isCorrect: true },
            { en: "Sending them 5 SMS per day about new bike offers.", isCorrect: false },
            { en: "Offering the cheapest service price in the city.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "Complaint Response Time: What is the industry-standard 'Lead Time' to acknowledge and start investigating a high-priority customer complaint?",
        options: [
            { en: "1 week.", isCorrect: false },
            { en: "1 to 4 Hours (Immediate acknowledgement is key to de-escalating anger).", isCorrect: true },
            { en: "48 Hours.", isCorrect: false },
            { en: "Only when the customer visits the workshop in person.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "Workshop Throughput (Capacity): If your workshop has 4 bays and 4 technicians, what is a healthy 'Average Vehicle Intake' per day for standard maintenance?",
        options: [
            { en: "2 vehicles total (takes too long).", isCorrect: false },
            { en: "12 to 16 vehicles (assuming 3–4 vehicles per bay per day).", isCorrect: true },
            { en: "50 vehicles (leads to poor quality and high repeat complaints).", isCorrect: false },
            { en: "It doesn't matter as long as the technicians are busy.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "A customer gave an NPS score of 3 but did not pick up your 'Recovery Call' twice. What is the risk if you simply 'Close' the case without talking to them?",
        options: [
            { en: "No risk; you tried your best, so the complaint is legally over.", isCorrect: false },
            { en: "The customer will probably forget the issue and come back next month.", isCorrect: false },
            { en: "High Risk: The 'Unresolved Detractor' will likely escalate to Social Media or a Formal Legal Complaint, causing 10x more damage to the brand.", isCorrect: true },
            { en: "The NPS score will automatically become a 9 (Promoter) after 48 hours.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "The OEM has issued a 'Mandatory Field Fix' for a specific batch of VINs to replace a faulty fuse. Your workshop is overloaded with paid repairs. How do you handle the VIN list?",
        options: [
            { en: "Mark the VINs as 'Completed' in the software now and fix them later when the customer comes for regular service.", isCorrect: false },
            { en: "Inform the Service Advisors to call those specific VIN owners immediately and ensure the physical part is replaced and photographed before closing the action in the system.", isCorrect: true },
            { en: "Only fix the bikes that belong to 'VIP' customers; for others, just update the software.", isCorrect: false },
            { en: "Wait for the OEM to send a reminder before starting the work.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "You need to hire 5 EV Technicians for a new service center opening next week. Where is the most effective place to find 'Ready-to-Work' talent with proven EV skills?",
        options: [
            { en: "Post a 'Hiring' banner outside the local petrol pump.", isCorrect: false },
            { en: "Use the 'Everified' app to filter candidates who have already passed the 12V Safety and Powertrain Diagnostic tests.", isCorrect: true },
            { en: "Visit a local college and hire 5 freshers who have never seen an EV motor.", isCorrect: false },
            { en: "Wait for people to send their CVs to your email and call them one by one for basic interviews.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "Your workshop is currently running at 50% capacity (intake is low). What is the most sustainable way to increase service volume without spending a lot on ads?",
        options: [
            { en: "Ask technicians to stand outside and wave at EV riders to come in.", isCorrect: false },
            { en: "Run a 'Battery Health Clinic' campaign, calling existing customers for a free diagnostic checkup to identify hidden wear and tear.", isCorrect: true },
            { en: "Reduce the service quality so the bikes break down faster and come back sooner.", isCorrect: false },
            { en: "Fire half the technicians to save money until the volume increases.", isCorrect: false }
        ]
    },
    {
        role: 'workshop',
        question_text_en: "A customer is shouting loudly in the waiting area about a 'Repeat Complaint' and is insulting the technician. As a Manager, what is your first action?",
        options: [
            { en: "Shout back so the customer knows you are the boss of the workshop.", isCorrect: false },
            { en: "Tell the technician to apologize even if it wasn't his fault to make the customer go away.", isCorrect: false },
            { en: "Politely ask the customer to join you in the office to discuss the matter privately and offer them water to calm them down.", isCorrect: true },
            { en: "Call the police immediately without trying to talk.", isCorrect: false }
        ]
    }
];

async function updateWorkshopQuestions() {
    try {
        console.log('Clearing existing workshop questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'workshop'`;
        console.log('✅ Cleared old workshop questions.');

        console.log('Inserting new workshop questions for Step 1 and Step 2...');
        let count = 0;

        // Insert for both steps to ensure availability
        const steps = [1, 2];

        for (const step of steps) {
            for (const q of workshopQuestions) {
                // Use English for Hindi as fallback
                const question_text_hi = q.question_text_en;

                const optionsJSON = JSON.stringify(q.options.map(opt => ({
                    ...opt,
                    hi: opt.en // Fallback for options
                })));

                await sql`
          INSERT INTO verification_questions (
            role, step, question_text_en, question_text_hi, options
          ) VALUES (
            ${q.role}, 
            ${step}, 
            ${q.question_text_en}, 
            ${question_text_hi}, 
            ${optionsJSON}
          )
        `;
                count++;
            }
        }

        console.log(`✅ Successfully inserted ${count} workshop questions (Role: workshop).`);
    } catch (error) {
        console.error('Error updating questions:', error);
    }
}

updateWorkshopQuestions();
