const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.json()); 

const DB_URI = 'mongodb+srv://msaso0725_db_user:Z9lY66ImIs4hwyhx@adatkezelo.otlp11o.mongodb.net/DiakAdatok?retryWrites=true&w=majority&appName=Adatkezelo';

mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
}).catch(err => {
    console.error("Initial connection error:", err.message);
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('Connected to MongoDB Atlas'));

const COLLECTION_NAME = 'DiakAdatok'; 
//diak séma
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

// --- Configuration: Subjects to initialize for new students ---
// Use the subjects that exist in your database or should be standard.
const DEFAULT_SUBJECTS = ["Magyar", "Matematika", "Történelem", "Angol"];


// --- 1. GET ALL DIAKOK API ---
app.get('/api/diakok', async (req, res) => {
    try {
        const diakok = await Diak.find({}).lean(); 
        console.log(`🔎 Found ${diakok.length} documents in collection '${COLLECTION_NAME}'.`);
        res.json(diakok);
    } catch (err) {
        console.error('Error during database query:', err.message);
        res.status(500).json({ message: 'Server error fetching students data.', error: err.message });
    }
});

// --- 2. ADD NEW DIAK API (Modified to initialize subjects) ---
app.post('/api/diakok', async (req, res) => {
    try {
        // Initialize tantárgyak object with empty arrays for all default subjects
        const initialTantargy = DEFAULT_SUBJECTS.reduce((acc, subject) => {
            acc[subject] = [];
            return acc;
        }, {});

        const newDiak = new Diak({
            ...req.body,
            tantárgyak: initialTantargy, // Overwrite placeholder with initialized subjects
        });

        await newDiak.save();
        res.status(201).json(newDiak);
    } catch (err) {
        console.error('Error during document insertion:', err.message);
        res.status(500).json({ message: 'Server error saving student data.', error: err.message });
    }
});

// --- 3. ADD NEW MARK API (NEW ENDPOINT) ---
app.post('/api/diakok/:id/mark', async (req, res) => {
    const diakId = req.params.id; // The Mongoose _id
    const { tantargy, jegy } = req.body;

    if (!tantargy || !jegy) {
        return res.status(400).json({ message: 'Missing subject (tantargy) or mark (jegy).' });
    }

    try {
        const diak = await Diak.findById(diakId);

        if (!diak) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Use $push to append the new mark to the array within the tantárgyak object
        // The path must be constructed dynamically: "tantárgyak.SubjectName"
        const update = {
            $push: { [`tantárgyak.${tantargy}`]: jegy }
        };

        const updatedDiak = await Diak.findByIdAndUpdate(diakId, update, { new: true, runValidators: true }).lean();

        res.json(updatedDiak);
    } catch (err) {
        console.error('Error adding mark:', err.message);
        res.status(500).json({ message: 'Server error adding mark.', error: err.message });
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
