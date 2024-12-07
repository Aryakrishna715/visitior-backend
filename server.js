const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors({ origin: '*' })); // Allows requests from all origins
app.use(bodyParser.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Atlas connection
const mongoURI = "mongodb+srv://snehasnair1149:EbHrylGWLOYaNfyL@cluster0.xysjr.mongodb.net/visitorDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB Atlas:", err);
    });

// Schema and Model for Visitor
const visitorSchema = new mongoose.Schema({
    visitorName: String,
    noOfPersons: Number,
    purpose: String,
    contactNumber: String,
    visitDate: String,
    submissionTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});
const Visitor = mongoose.model('Visitor', visitorSchema);

// Route to handle form submission and PDF generation
app.post('/submit', async (req, res) => {
    try {
        const { visitorName, noOfPersons, purpose, contactNumber, visitDate } = req.body;
        const submissionTime = new Date();

        // Save visitor data to MongoDB
        const visitor = new Visitor({ visitorName, noOfPersons, purpose, contactNumber, visitDate, submissionTime });
        const savedVisitor = await visitor.save();

        // Prepare directory for saving PDFs
        const pdfDirectory = path.join(__dirname, 'public', 'pdfs');
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        // Generate PDF e-pass
        const pdfPath = path.join(pdfDirectory, `${savedVisitor._id}-epass.pdf`);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        // Add content to the PDF
        doc.font('Times-Bold').fontSize(28).fillColor('blue')
            .text('Brindavan Group of Institutions', { align: 'center' });
        doc.moveDown();
        doc.fontSize(22).fillColor('black')
            .text('Visitor E-Pass', { align: 'center', underline: true });
        doc.moveDown();
        doc.font('Helvetica').fontSize(18).fillColor('black');
        doc.text(`Visitor Name: ${visitorName}`);
        doc.text(`Number of Persons: ${noOfPersons}`);
        doc.text(`Purpose of Visit: ${purpose}`);
        doc.text(`Contact Number: ${contactNumber}`);
        doc.text(`Visit Date: ${visitDate}`);
        doc.text(`Submission Time: ${submissionTime.toLocaleString()}`);
        doc.end();

        // Send response with download link
        res.json({
            success: true,
            message: 'E-Pass generated successfully!',
            downloadLink: `http://192.168.133.156:3001/pdf/${savedVisitor._id}-epass.pdf`,
        });
    } catch (err) {
        console.error("Error handling form submission:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Serve PDFs for download
app.use('/pdf', express.static(path.join(__dirname, 'public', 'pdfs')));

// Route to serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://192.168.133.156:${PORT}`);
});
