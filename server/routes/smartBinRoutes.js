const express = require("express");
const router = express.Router();
const SmartBin = require("../models/SmartBin");
const JobTicket = require("../models/JobTicket");
const authMiddleware = require("../middleware/authMiddleware");

// GET all bins
router.get("/bins", authMiddleware, async (req, res) => {
    try {
        const bins = await SmartBin.find().sort({ name: 1 });
        res.json(bins);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bins" });
    }
});

// POST new bin 
router.post("/bins", authMiddleware, async (req, res) => {
    try {
        const { name, location } = req.body;
        const newBin = await SmartBin.create({ name, location });
        res.json(newBin);
    } catch (err) {
        res.status(500).json({ error: "Failed to create bin" });
    }
});

// PUT update fill level manually
router.put("/bins/:id", authMiddleware, async (req, res) => {
    try {
        const { fillLevel } = req.body;
        const bin = await SmartBin.findByIdAndUpdate(
            req.params.id, 
            { fillLevel, lastUpdated: Date.now() }, 
            { new: true }
        );
        res.json(bin);
    } catch (err) {
        res.status(500).json({ error: "Failed to update bin" });
    }
});

// GET all job tickets
router.get("/tickets", authMiddleware, async (req, res) => {
    try {
        const tickets = await JobTicket.find().populate('binId').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});


router.post("/tickets", authMiddleware, async (req, res) => {
    try {
        const { binId } = req.body;
        const existingPending = await JobTicket.findOne({ binId, status: 'pending' });
        if (existingPending) {
            return res.status(400).json({ error: "Pending ticket already exists for this bin" });
        }
        const ticket = await JobTicket.create({ binId });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: "Failed to create ticket" });
    }
});


router.put("/tickets/:id/complete", authMiddleware, async (req, res) => {
    try {
        const ticket = await JobTicket.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        ).populate('binId');

        // Also reset the bin fill level back to 0 since it was serviced!
        if (ticket && ticket.binId) {
            await SmartBin.findByIdAndUpdate(ticket.binId._id, { fillLevel: 0, lastUpdated: Date.now() });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: "Failed to resolve ticket" });
    }
});


router.get("/bins/predictions", authMiddleware, async (req, res) => {
    try {
        const tickets = await JobTicket.find().populate('binId');
        
       
        let dayTracker = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let binTickets = {};

        tickets.forEach(t => {
            const dayName = days[new Date(t.createdAt).getDay()];
            dayTracker[dayName]++;
            
            const binName = t.binId ? t.binId.name : "Unknown Bin";
            if (!binTickets[binName]) binTickets[binName] = 0;
            binTickets[binName]++;
        });

        
        let busiestDay = 'Mon';
        let maxCount = -1;
        for (const [day, count] of Object.entries(dayTracker)) {
            if (count > maxCount) {
                maxCount = count;
                busiestDay = day;
            }
        }

        
        let worstBin = 'No data';
        let maxBinCount = -1;
        for (const [bin, count] of Object.entries(binTickets)) {
            if (count > maxBinCount) {
                maxBinCount = count;
                worstBin = bin;
            }
        }

        let suggestions = [];
        if (tickets.length > 0) {
            suggestions.push({
                insight: `System loads typically peak on ${busiestDay}s.`,
                action: `Consider preemptively dispatching staff to high-traffic areas early ${busiestDay} mornings.`
            });
            suggestions.push({
                insight: `${worstBin} hits critical capacity most frequently.`,
                action: "Review placement of this bin or upsize the container to prevent overflows."
            });
        } else {
            suggestions.push({
                insight: "Not enough historical ticket data gathered yet.",
                action: "Allow IoT sensors to gather more analytics."
            });
        }

        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: "Failed to generate predictions" });
    }
});

module.exports = router;
