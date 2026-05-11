const express = require("express");
const router = express.Router();
const Waste = require("../models/Waste");
const authMiddleware = require("../middleware/authMiddleware");

// Add Waste
router.post("/waste", authMiddleware, async (req, res) => {
    try {
        const newWaste = await Waste.create({
            userId: req.user.id,
            type: req.body.type,
            weight: Number(req.body.weight),
            isAi: req.body.isAi || false,
            confidence: req.body.confidence || null,
            aiOriginalType: req.body.aiOriginalType || null,
            image: req.body.image || null,
            date: new Date().toISOString()
        });
        res.json(newWaste);
    } catch (err) {
        res.status(500).json({ error: "Failed to save waste" });
    }
});


router.get("/waste", authMiddleware, async (req, res) => {
    try {
        const entries = await Waste.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: "Failed to get waste logs" });
    }
});

router.get("/suggestions", authMiddleware, async (req, res) => {
    try {
        const entries = await Waste.find({ userId: req.user.id });

        let total = 0;
        let typeMap = {};

        entries.forEach(e => {
            total += e.weight;
            if (!typeMap[e.type]) typeMap[e.type] = 0;
            typeMap[e.type] += e.weight;
        });

        let suggestions = [];

        if (total === 0) {
            return res.json([{
                title: "Zero Waste Baseline",
                insight: "You haven't logged any waste points yet.",
                instruction: "Start logging your daily waste to generate intelligent actionable insights."
            }]);
        }

        const plasticRatio = (typeMap["plastic"] || 0) / total;
        if (plasticRatio > 0.3) {
            suggestions.push({
                title: "Critical Plastic Threshold",
                insight: `Plastic accounts for ${(plasticRatio * 100).toFixed(0)}% of your total waste metric, which is unusually high.`,
                instruction: "Swap single-use water bottles for a stainless steel alternative and establish a dedicated soft-plastics recycling bin."
            });
        }

        const organicRatio = (typeMap["organic"] || 0) / total;
        if (organicRatio > 0.2) {
            suggestions.push({
                title: "High Organic Volume",
                insight: `Organic matter makes up ${(organicRatio * 100).toFixed(0)}% of your footprint. This decomposes quickly but takes up landfill space.`,
                instruction: "Investigate starting a small kitchen compost bin for food scraps, or use local green-waste municipal collection."
            });
        }

        if (typeMap["e-waste"] && typeMap["e-waste"] > 0) {
            suggestions.push({
                title: "E-Waste Warning",
                insight: "You have logged electronic waste. This contains heavy metals that are devastating to groundwater if landfilled.",
                instruction: "Do absolutely not put e-waste in general bins. Locate a specialized municipal e-waste drop-off center near your zip code."
            });
        }

        const recyclableRatio = (typeMap["recyclable"] || 0) / total;
        if (recyclableRatio < 0.1 && total > 5) {
            suggestions.push({
                title: "Recycling Deficit",
                insight: "Your confirmed recyclable waste is shockingly low compared to your overall volume.",
                instruction: "Review your local municipality's recycling guidelines. You are likely throwing away clean paper, cardboard, or glass into the general trash."
            });
        }
        
        if (suggestions.length === 0) {
            suggestions.push({
                title: "Optimized Baseline",
                insight: "Your logged metrics do not trigger any negative alerts.",
                instruction: "Maintain current behaviors and attempt a zero-waste challenge this week."
            });
        }

        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
});

router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const entries = await Waste.find({ userId: req.user.id });

        let typeMap = {};

        entries.forEach(e => {
            if (!typeMap[e.type]) typeMap[e.type] = 0;
            typeMap[e.type] += e.weight;
        });

        const data = Object.keys(typeMap).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: typeMap[key]
        }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

router.get("/weekly", authMiddleware, async (req, res) => {
    try {
        const entries = await Waste.find({ userId: req.user.id });

        let weekMap = {};

        entries.forEach(e => {
            const date = new Date(e.date);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });

            if (!weekMap[day]) weekMap[day] = 0;
            weekMap[day] += e.weight;
        });

        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const data = daysOrder.map(day => ({
            day,
            value: weekMap[day] || 0
        }));

        res.json(data);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const entries = await Waste.find({ userId: req.user.id });
        
        let total = 0;
        let plastic = 0;
        let goodWaste = 0;

        entries.forEach(e => {
            total += e.weight;
            if (e.type === "plastic") plastic += e.weight;
            if (e.type === "organic" || e.type === "recyclable") goodWaste += e.weight;
        });

        let statusStr = "Novice";
        let descStr = "Getting started on tracking. Try lowering plastic usage.";

        if (total > 0) {
            const plasticRatio = plastic / total;
            const goodRatio = goodWaste / total;

            if (goodRatio >= 0.5 && plasticRatio <= 0.2) {
                statusStr = "Master";
                descStr = "Highly optimal. Over 50% of waste is recycled or composted.";
            } else if (goodRatio >= 0.3 || plasticRatio <= 0.3) {
                statusStr = "Warrior";
                descStr = "Good recycling habits solidifying.";
            } else if (entries.length >= 3 && plasticRatio <= 0.5) {
                statusStr = "Advocate";
                descStr = "Consistent tracker. Moderate recycling levels.";
            }
        }
        
        res.json({ status: statusStr, description: descStr });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

module.exports = router;
