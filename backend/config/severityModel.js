const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI();
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function predictSeverity() {
    try {

        const prompt = `Given the incident description: "A large fire has broken out in a multi-story building, with smoke billowing out from several floors. Emergency services are on the scene, and residents are being evacuated.", predict its severity in one word (low, medium, high, critical).`;

        const result = await model.generateContent(prompt);
        console.log(result.response.text().toLowerCase());
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

// Call the function with a sample incident ID
predictSeverity();
