const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

const salesQuestions = [
    {
        role: 'sales',
        step: 1,
        question_text_en: "The 'Range' Dilemma: A customer asks for the 'True Range' of the scooter. The marketing brochure says 150km (IDC), but you know in city traffic it gives 100km. What do you tell the customer?",
        options: [
            { en: "Stick to the 150km figure; otherwise, the customer won't buy it.", isCorrect: false },
            { en: "Explain the difference between IDC (Ideal) and True Range, and ask about their riding style to give a realistic 100-110km estimate.", isCorrect: true },
            { en: "Say 'Range is unlimited if you drive slowly.'", isCorrect: false },
            { en: "Tell them the range is 200km just to close the sale today.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A customer is waiting in the lounge to take delivery of their new EV. The Sales team is pushing you to hand over the bike immediately, but the PDI (Pre-Delivery Inspection) checklist is only 50% complete. What do you do?",
        options: [
            { en: "Hand over the bike and tell the customer to come back tomorrow for the remaining checkup.", isCorrect: false },
            { en: "Refuse the handover. Explain to the Sales team that an incomplete PDI is a safety risk, and only release the bike once every 'Critical Safety Point' (Brakes, Battery, Software) is signed off.", isCorrect: true },
            { en: "Sign the PDI paper yourself without checking the bike just to keep the customer happy.", isCorrect: false },
            { en: "Tell the technician to just check the lights and horns and skip the battery diagnostic.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "Handling Warranty Objections: A customer is worried about the high cost of battery replacement after the 3-year warranty ends. How do you respond?",
        options: [
            { en: "Tell them batteries never fail, so they don't need to worry.", isCorrect: false },
            { en: "Tell them to sell the bike before the warranty expires.", isCorrect: false },
            { en: "Explain the 'Life Cycles' of the cells and the cost-per-km savings they will have made over 3 years, which covers the battery cost.", isCorrect: true },
            { en: "Lie and say the warranty is actually for 10 years.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "Competitor Comparison: A customer says, 'The Ola/Ather is better than your model because it has a higher top speed.' How do you handle this?",
        options: [
            { en: "Agree with them and say your model is bad.", isCorrect: false },
            { en: "Acknowledge the competitor's strength, then highlight your model's unique advantages (e.g., better build quality, service network, or boot space).", isCorrect: true },
            { en: "Tell the customer they are wrong and that they don't know anything about bikes.", isCorrect: false },
            { en: "Start insulting the competitor brand's quality to make your bike look better.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "Explaining 'Smart' Features: Many customers are 'Tech-Scared.' How should a Sales Manager train the team to explain features like 'Hill Hold' or 'Regenerative Braking'?",
        options: [
            { en: "Use complex engineering terms to sound smart.", isCorrect: false },
            { en: "Use 'Benefit-Led' explanations (e.g., 'Hill-Hold means your bike won't roll back on a slope even if you leave the brakes').", isCorrect: true },
            { en: "Just tell them to read the manual after buying.", isCorrect: false },
            { en: "Don't mention tech features; they confuse the customer.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A senior citizen visits the showroom. They are interested in an EV but are overwhelmed by the touch-screen features and mobile app integration. What is your approach?",
        options: [
            { en: "Tell them they must learn it because 'this is the future' and show them a YouTube tutorial.", isCorrect: false },
            { en: "Simplify the pitch. Focus on the 'Key-and-Go' simplicity, mechanical safety, and comfort, and offer to set up the app for them personally.", isCorrect: true },
            { en: "Suggest they buy a petrol bike instead since EVs are for young people.", isCorrect: false },
            { en: "Ignore the tech features and only talk about the color and price.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A customer says, 'The initial price of your EV is ₹30,000 more than a petrol scooter. It's too expensive.' How do you prove the value?",
        options: [
            { en: "Agree that it is expensive and offer a ₹5,000 discount immediately to close the deal.", isCorrect: false },
            { en: "Ask for their daily running (e.g., 40km) and calculate the 'Per Day' savings on petrol vs. electricity to show they recover the ₹30k in just 12–15 months.", isCorrect: true },
            { en: "Tell them that petrol prices will double next year, so they have no choice.", isCorrect: false },
            { en: "Focus only on the 'Environment' and 'Green Energy' to make them feel guilty.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A customer says, 'Competitor X has a 5.0 kWh battery, but yours is only 4.0 kWh. Yours is weaker.' How do you respond?",
        options: [
            { en: "Lie and say your battery is actually 5.5 kWh.", isCorrect: false },
            { en: "Say that Competitor X is using 'low-quality' cells that will explode.", isCorrect: false },
            { en: "Acknowledge the battery size, then explain 'Efficiency' (e.g., 'Our bike is 20kg lighter and our motor is 95% efficient, so we give the same range with a safer, lighter battery').", isCorrect: true },
            { en: "Tell the customer that 'battery size doesn't matter' and change the topic.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "You see a customer walking out of the showroom without booking. What is the most 'Customer-Centric' way to stop them?",
        options: [
            { en: "Sir, if you book now, I will give you a free helmet.", isCorrect: false },
            { en: "Sir, I noticed you were concerned about the 'Charging Time.' May I show you how our 'Fast Home Charger' works? It might solve that worry.", isCorrect: true },
            { en: "Sir, please don't go to the other showroom, their bikes are very bad.", isCorrect: false },
            { en: "Let them go; a customer who doesn't buy immediately is not a 'serious' buyer.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A customer is 90% convinced but says, 'I'll think about it and come back next month.' How do you handle this to close the sale now?",
        options: [
            { en: "Tell them the price will increase tomorrow (even if it won't) to scare them into buying.", isCorrect: false },
            { en: "Ask a 'Discovery Question': 'Sir, usually when someone says they need to think, it's because they have a specific doubt I haven't cleared. Is it the charging, the range, or the price?'", isCorrect: true },
            { en: "Say 'Okay, no problem' and let them walk out.", isCorrect: false },
            { en: "Keep repeating the features of the bike louder so they listen better.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "A customer is about to sign the booking form and says, 'I am so happy that for the next 1 years, I don't have to spend a single rupee on this bike.' How do you respond?",
        options: [
            { en: "Say nothing and take the booking—technically, you didn't lie, they just assumed it.", isCorrect: false },
            { en: "Sir, I want to be 100% clear: your Labor Charges for service are zero, but if physical parts like brake pads or tires wear out, those are paid items. You save on oil and petrol, but tires are still a cost.", isCorrect: true },
            { en: "Tell them that everything is indeed free, including tires, to ensure they don't cancel the booking.", isCorrect: false },
            { en: "Tell them that the bike is so good it will never need new parts for 5 years.", isCorrect: false }
        ]
    },
    {
        role: 'sales',
        step: 1,
        question_text_en: "Your EV brand does NOT offer any 'Free Services.' Every visit is a 'Paid Service.' How do you explain this to a customer who is used to getting 4 free services with a petrol bike?",
        options: [
            { en: "Lie and say the first two are free, then hope they forget after 6 months.", isCorrect: false },
            { en: "Sir, unlike petrol bikes that need frequent oil changes, our EV only needs a checkup once a year. We charge a small fee for the 'Software Diagnostic' and 'Battery Health Report' to ensure your bike stays safe.", isCorrect: true },
            { en: "Tell them 'Service is free' but add the cost hidden inside the registration or insurance charges.", isCorrect: false },
            { en: "Tell them the bike is so good it never needs to come to the service center at all.", isCorrect: false }
        ]
    },
];

async function updateSalesQuestions() {
    try {
        console.log('Clearing existing sales questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'sales'`;
        console.log('✅ Cleared old sales questions.');

        console.log('Inserting new sales questions for Step 1 and Step 2...');
        let count = 0;

        const steps = [1, 2];

        for (const step of steps) {
            for (const q of salesQuestions) {
                // Use English for Hindi as fallback to prevent empty field issues
                const question_text_hi = q.question_text_en;

                const optionsJSON = JSON.stringify(q.options.map(opt => ({
                    ...opt,
                    hi: opt.en // Fallback for options too
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

        console.log(`✅ Successfully inserted ${count} sales questions.`);
    } catch (error) {
        console.error('Error updating questions:', error);
    }
}

updateSalesQuestions();
