const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

const DB_URI = 'mongodb+srv://msaso0725_db_user:Z9lY66ImIs4hwyhx@adatkezelo.otlp11o.mongodb.net/DiakAdatok?retryWrites=true&w=majority&appName=Adatkezelo';

mongoose.connect(DB_URI, {

    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
}).catch(err => {
    console.error("❌ Initial connection error:", err.message);
});

const db = mongoose.connection;
db.on('error', (err) => console.error('❌ MongoDB connection error:', err));
db.once('open', () => console.log('✅ Connected to MongoDB Atlas'));

const COLLECTION_NAME = 'DiakAdatok'; 

const diakSchema = new mongoose.Schema({
    id: String,
    nev: String,
    anyja_neve: String,
    szuletesi_hely: String,
    szuletesi_ido: String,
    évfolyam: String, 
    osztály: String,
    kolis: Boolean,
    nyelv: String,
    tantárgyak: Object 
}, {
    toJSON: { virtuals: true }, 
    versionKey: false,
    strict: false 
});

const Diak = mongoose.model('Diak', diakSchema, COLLECTION_NAME); 


app.get('/api/diakok', async (req, res) => {
    try {
        const diakok = await Diak.find({}).lean(); 
        

        console.log(`🔎 Found ${diakok.length} documents in collection '${COLLECTION_NAME}'.`);
        
        res.json(diakok);
    } catch (err) {
        console.error('❌ Error during database query:', err.message);
        res.status(500).json({ message: 'Server error fetching students data.', error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));