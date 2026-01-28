const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

const technicianStep2Questions = [
    {
        role: 'technician',
        step: 2,
        question_text_en: "1. What does the 'Orange' color on a cable represent?",
        options: [
            { en: "High Speed", isCorrect: false },
            { en: "High Voltage (Dangerous)", isCorrect: true },
            { en: "Low Battery", isCorrect: false },
            { en: "Ground Connection", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "2. A 'U' code (e.g., U0100) on the scanner means what?",
        options: [
            { en: "Under-voltage fault.", isCorrect: false },
            { en: "Communication Fault (CAN Bus error).", isCorrect: true },
            { en: "Universal motor error.", isCorrect: false },
            { en: "User error.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "3. The scanner shows a 'Current' fault vs. a 'History' fault. Which do you fix first?",
        options: [
            { en: "Current (Active) fault.", isCorrect: true },
            { en: "History fault.", isCorrect: false },
            { en: "Delete both and ignore", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "4. What is the first step when a diagnostic tool shows a code you don't know?",
        options: [
            { en: "Call a friend.", isCorrect: false },
            { en: "Check the OEM Service Manual for the code description.", isCorrect: true },
            { en: "Replace the VCU.", isCorrect: false },
            { en: "Twist the throttle 3 times to reset.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "5. What is the minimum 12V battery voltage required to start a software flash?",
        options: [
            { en: "5V", isCorrect: false },
            { en: "9V", isCorrect: false },
            { en: "12.4V or higher (Stable).", isCorrect: true },
            { en: "Voltage doesn't matter.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "6. After replacing a NEW MCU, why won't the scooty move even if there are no errors?",
        options: [
            { en: "The motor is shy.", isCorrect: false },
            { en: "The MCU needs 'Pairing' or 'Configuration' with the VCU.", isCorrect: true },
            { en: "The battery is full.", isCorrect: false },
            { en: "The keys are wrong.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "7. A DC-DC Converter does what?",
        options: [
            { en: "Charges the main battery.", isCorrect: false },
            { en: "Turns 72V Traction power into 12V for lights/horn.", isCorrect: true },
            { en: "Converts DC to AC for the motor.", isCorrect: false },
            { en: "Increases the speed of the bike.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "8. You see 'Carbon/Black marks' inside the main battery connector (Chogori connector). What is the correct action?",
        options: [
            { en: "Clean it with a cloth and plug it back in.", isCorrect: false },
            { en: "Replace the connector and check the terminal tension.", isCorrect: true },
            { en: "Put some grease on it to stop the sparking.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "9. You need to check a wire for a 'break' (continuity). Where do you set your Multimeter?",
        options: [
            { en: "DC Voltage (V=).", isCorrect: false },
            { en: "Resistance/Continuity (Ohm/Beep symbol).", isCorrect: true },
            { en: "AC Voltage (V~).", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "10. A customer brings a bike that was 'submerged in water' during rain. What is the first thing you do?",
        options: [
            { en: "Turn on the ignition to see if the screen works.", isCorrect: false },
            { en: "Isolate the battery immediately and do NOT turn on the ignition.", isCorrect: true },
            { en: "Blow-dry the outside of the motor and give it back.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "11. You are charging a battery in the workshop and it feels 'Hot to touch' (above 50°C). What do you do?",
        options: [
            { en: "Keep charging, it's normal in Indian summers.", isCorrect: false },
            { en: "Stop charging, disconnect, and move it to an open/safe area.", isCorrect: true },
            { en: "Pour water on the battery to cool it down.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "12. What is the 'Golden Rule' for handling an opened Battery Pack?",
        options: [
            { en: "Always use magnetic screwdrivers so screws don't fall.", isCorrect: false },
            { en: "Use only 'Insulated Tools' (tools covered in rubber/plastic) and remove your metal ring/watch.", isCorrect: true },
            { en: "Work as fast as possible.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "13. You are about to replace a faulty VCU. Which is the CORRECT safety sequence?",
        options: [
            { en: "Open the seat → Disconnect Main HV Battery → Disconnect 12V Battery → Remove VCU.", isCorrect: false },
            { en: "Open the seat → Disconnect 12V Battery → Disconnect Main HV Battery → Remove VCU.", isCorrect: true },
            { en: "Unbolt the VCU → Disconnect 12V Battery → Disconnect Main HV Battery.", isCorrect: false },
            { en: "Disconnect Main HV Battery → Unbolt VCU → Disconnect 12V Battery.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "14. How do you verify 'Zero Voltage' before touching motor phase wires?",
        options: [
            { en: "Use a test lamp on the battery terminals.", isCorrect: false },
            { en: "Set Multimeter to DC Voltage and check across MCU input terminals (P+ and P-) until it shows <5V.", isCorrect: true },
            { en: "Set Multimeter to Resistance (Ohms) and check the motor casing.", isCorrect: false },
            { en: "Touch the wires quickly with the back of your hand to feel for heat.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "15. You just installed a NEW Motor. It spins backward when you twist the throttle. What is the fix?",
        options: [
            { en: "Open the motor and flip the magnets.", isCorrect: false },
            { en: "Swap the Positive and Negative wires on the battery.", isCorrect: false },
            { en: "Swap any TWO of the three motor phase wires (e.g., Yellow and Blue).", isCorrect: true },
            { en: "Reset the dashboard software three times.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "16. The Diagnostic tool shows Error Code P0A0D (High Voltage Interlock Circuit). You don't know this code. What is the CORRECT 'Soldier' move?",
        options: [
            { en: "Clear the code and tell the customer it's fixed.", isCorrect: false },
            { en: "Open the OEM Service Manual PDF → Search 'P0A0D' → Follow the step-by-step wiring check for the Safety Interlock.", isCorrect: true },
            { en: "Replace the main wiring harness immediately.", isCorrect: false },
            { en: "Call a friend and ask them what they think the problem is.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "17. You are starting a Software/Firmware Update. Which condition is a 'FAIL' (Stop the update)?",
        options: [
            { en: "The scooter is connected to a stable Wi-Fi.", isCorrect: false },
            { en: "The 12V Battery voltage is 10.8V. (Too Low - Risk of Bricking).", isCorrect: true },
            { en: "The Main Traction Battery is at 60% SOC.", isCorrect: false },
            { en: "The Side-stand is down.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "18. You are bolting the terminals of a new Traction Battery. Which is the CORRECT way?",
        options: [
            { en: "Tighten as hard as you can with a normal wrench so it never comes loose.", isCorrect: false },
            { en: "Use a Torque Wrench set to the OEM spec (e.g., 10 Nm) to prevent arcing or terminal damage.", isCorrect: true },
            { en: "Use a screwdriver and some electrical tape to hold the wire.", isCorrect: false },
            { en: "Leave it slightly loose so the wire can move easily.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "19. The BMS shows a 'Cell Imbalance' (One cell is 3.1V, others are 4.1V). What does this mean?",
        options: [
            { en: "The battery just needs to be charged for 24 hours.", isCorrect: false },
            { en: "The charger is defective and needs replacement.", isCorrect: false },
            { en: "The battery pack has a hardware fault and is a safety risk; it needs professional repair/replacement.", isCorrect: true },
            { en: "The rider is driving too fast.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "20. Before working on any motor or traction battery (HV COMPONENT), the FIRST action is:",
        options: [
            { en: "Remove body panels", isCorrect: false },
            { en: "Disconnect 12V battery", isCorrect: true },
            { en: "Switch OFF ignition only", isCorrect: false },
            { en: "Inform customer", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "21. You are assigned to replace the High Voltage Motor Controller/traction battery on an EV. To ensure the vehicle is 100% safe to work on, in what exact order must you perform these steps?",
        options: [
            { en: "Remove Service Plug(Main fuse) -> Disconnect 12V Battery -> Remove HV Cables.", isCorrect: false },
            { en: "Disconnect 12V Battery -> Remove Service Plug(Main fuse) -> Wait 5 Minutes -> Verify 0V with Multimeter.", isCorrect: true },
            { en: "Remove Service Plug (Main fuse) -> Wait 5 Minutes -> Turn off Ignition.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "22. When disconnecting the 12V Auxiliary Battery or the High Voltage Battery cables, which terminal should you remove FIRST?",
        options: [
            { en: "The Positive terminal (+)", isCorrect: false },
            { en: "The Negative terminal (-)", isCorrect: true },
            { en: "Both at the same time", isCorrect: false },
            { en: "It doesn't matter", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "23. You disconnected the battery terminals to clean them. After putting them back, the bike shows a 'BMS Error' and won't start. What should you do first?",
        options: [
            { en: "Order a new battery.", isCorrect: false },
            { en: "Perform Software Pairing.", isCorrect: false },
            { en: "Check for a loose connection and perform a 12V Reset (Disconnect/Reconnect 12V).", isCorrect: true },
            { en: "Change the Motor.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "24. To check if an EV throttle (accelerator) is working correctly, what mode should the Multimeter be in and what is the typical voltage range you should see?",
        options: [
            { en: "AC Voltage mode; 12V to 24V.", isCorrect: false },
            { en: "Resistance (Ohms) mode; 0Ω to 100Ω.", isCorrect: false },
            { en: "DC Voltage mode; approximately 0.8V to 4.2V.", isCorrect: true },
            { en: "Continuity mode; a loud beep when the throttle is twisted.", isCorrect: false }
        ]
    },
    {
        role: 'technician',
        step: 2,
        question_text_en: "25. You plug your Diagnostic Tool (Scanner) into the EV's OBD-II port, but the tool's screen does not light up at all. What is the most likely reason?",
        options: [
            { en: "The main Traction Battery (72V) is discharged.", isCorrect: false },
            { en: "The Motor Controller (MCU) is faulty.", isCorrect: false },
            { en: "The 12V Auxiliary Battery is low or the OBD power fuse is blown.", isCorrect: true },
            { en: "The bike is in 'Eco Mode'.", isCorrect: false }
        ]
    }
];

async function updateTechnicianStep2() {
    try {
        console.log('Clearing existing Technician Step 2 questions...');
        await sql`DELETE FROM verification_questions WHERE role = 'technician' AND step = 2`;
        console.log('✅ Cleared old Step 2 questions.');

        console.log('Inserting new Technician Step 2 questions...');
        let count = 0;

        for (const q of technicianStep2Questions) {
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

        console.log(`✅ Successfully inserted ${count} Technician Step 2 questions.`);
    } catch (error) {
        console.error('Error updating questions:', error);
    }
}

updateTechnicianStep2();
