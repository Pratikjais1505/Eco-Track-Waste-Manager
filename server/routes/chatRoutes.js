const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// CHATBOT 
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "No message provided." });

        const lowerMsg = message.toLowerCase();
        let reply = "I'm your Eco-Bot! I can give you advice on disposing of materials like batteries, electronics, evaluating food waste, or plastic reduction. What do you need help with?";

        if (lowerMsg.includes("battery") || lowerMsg.includes("batteries")) {
            reply = "Batteries contain toxic chemicals and heavy metals. Do not throw them in your regular trash. You must take them to a designated e-waste recycling facility, a hardware store (like Home Depot or Lowe's that accepts them), or a local municipal hazardous waste drop-off event.";
        } else if (lowerMsg.includes("food") || lowerMsg.includes("organic") || lowerMsg.includes("compost")) {
            reply = "To reduce food waste, start by meal planning and freezing leftovers. For unavoidable scraps (like banana peels or coffee grounds), consider starting a kitchen compost bin or using a municipal green-waste container. Composting keeps organics out of landfills where they'd produce methane.";
        } else if (lowerMsg.includes("plastic")) {
            reply = "Plastic reduction is critical. Start by swapping single-use items (bottles, bags, straws) for reusable alternatives like stainless steel or cloth. Always rinse out plastic containers before throwing them in the blue recycling bin, otherwise they might contaminate the batch.";
        } else if (lowerMsg.includes("electronic") || lowerMsg.includes("e-waste") || lowerMsg.includes("phone") || lowerMsg.includes("laptop")) {
            reply = "Electronics cannot be securely disposed of in normal bins. Wait for a local e-waste drive or visit an electronics retailer like Best Buy, which often offers safe electronic recycling boxes for old phones, cables, and laptops.";
        } else if (lowerMsg.includes("glass")) {
            reply = "Glass is 100% recyclable and can be recycled endlessly. Ensure glass bottles and jars are rinsed clean and their metal or plastic lids are removed before placing them in your curb-side recycling bin.";
        }

        
        setTimeout(() => {
            res.json({ reply });
        }, 600);

    } catch (err) {
        res.status(500).json({ error: "Failed to process chat message." });
    }
});

module.exports = router;
