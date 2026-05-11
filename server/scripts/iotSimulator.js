const mongoose = require("mongoose");
const SmartBin = require("../models/SmartBin");
const JobTicket = require("../models/JobTicket");

const DELHI_BINS = [
    { name: "CP Central Bin", area: "Connaught Place", latitude: 28.6315, longitude: 77.2167 },
    { name: "Karol Bagh Market Bin", area: "Karol Bagh", latitude: 28.6519, longitude: 77.1909 },
    { name: "Lajpat Nagar Bin", area: "Lajpat Nagar", latitude: 28.5677, longitude: 77.2433 },
    { name: "Dwarka Sector 21 Bin", area: "Dwarka", latitude: 28.5511, longitude: 77.0570 },
    { name: "Rohini Sector 18 Bin", area: "Rohini", latitude: 28.7436, longitude: 77.0847 },
    { name: "Saket Mall Bin", area: "Saket", latitude: 28.5245, longitude: 77.2066 },
    { name: "Chandni Chowk Bin", area: "Chandni Chowk", latitude: 28.6506, longitude: 77.2303 },
    { name: "Nehru Place Bin", area: "Nehru Place", latitude: 28.5494, longitude: 77.2513 }
];

const startIoTSimulator = async () => {
    try {
        console.log("Starting IoT SmartBin Simulator (Delhi Deployment)...");
        
        let bins = await SmartBin.find();
        
        
        const hasLegacyData = bins.some(b => !b.area || b.location);
        
        if (hasLegacyData || bins.length === 0) {
            console.log("Legacy DB schema detected or empty DB. Wiping existing SmartBin and Maintenance Ticket caches...");
            await SmartBin.deleteMany({});
            await JobTicket.deleteMany({});
            
            console.log("Seeding fresh localized Delhi SmartBins...");
            await SmartBin.insertMany(DELHI_BINS);
            bins = await SmartBin.find();
        }

        
        setInterval(async () => {
            const currentBins = await SmartBin.find();
            
            for (const bin of currentBins) {
                
                const fillIncrease = Math.floor(Math.random() * 15);
                let newFill = bin.fillLevel + fillIncrease;
                if (newFill > 100) newFill = 100;
                
                await SmartBin.findByIdAndUpdate(bin._id, {
                    fillLevel: newFill,
                    lastUpdated: Date.now()
                });

                
                if (newFill >= 90) {
                    const existingTicket = await JobTicket.findOne({ binId: bin._id, status: 'pending' });
                    if (!existingTicket) {
                        console.log(`[IoT Alert] Bin ${bin.name} in ${bin.area} hit ${newFill}%. Dispatching Job Ticket.`);
                        await JobTicket.create({ binId: bin._id });
                    }
                }
            }
        }, 15000);

    } catch (err) {
        console.error("IoT Simulator Error:", err);
    }
};

module.exports = startIoTSimulator;
