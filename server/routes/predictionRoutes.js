const express = require('express');
const router = express.Router();
const axios = require('axios');

// Using the Flask ML server running on port 5001
const ML_SERVER_URL = 'http://127.0.0.1:5001';

// @route   POST api/prediction/predict-disease
// @desc    Predict disease based on symptoms
// @access  Private (should be authenticated)
router.post('/predict-disease', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({ error: 'Symptoms list is required' });
        }

        // Forward request to Flask server
        const response = await axios.post(`${ML_SERVER_URL}/predict`, { symptoms });

        // Transform response if necessary, or just forward
        // Flask returns: { disease, recommended_specialist, confidence, top_predictions }
        const predictionData = response.data;

        // Map Flask response to what frontend expects
        // Frontend expects: { name, accuracy, specialist, description, recommendations, ... }
        const formattedResult = {
            name: predictionData.disease,
            accuracy: Math.round(predictionData.confidence * 100),
            specialist: predictionData.recommended_specialist,
            description: `Analysis suggests a high probability of ${predictionData.disease}.`,
            recommendations: [
                "Consult with a specialist as recommended.",
                "Monitor your symptoms closely.",
                "If symptoms worsen, seek immediate medical attention."
            ],
            // preserve raw data if needed
            raw: predictionData
        };

        // Save to DB if user is authenticated (checked via middleware ideally)
        // For now, if req.user exists (added by auth middleware)
        if (req.user) {
            try {
                const Prediction = require('../models/Prediction');
                const newPrediction = new Prediction({
                    user: req.user.id,
                    symptoms: symptoms,
                    disease: predictionData.disease,
                    confidence: predictionData.confidence * 100,
                    specialist: predictionData.recommended_specialist
                });
                await newPrediction.save();
            } catch (dbError) {
                console.error("Error saving prediction to DB:", dbError);
                // Don't fail the response if saving fails
            }
        }

        res.json(formattedResult);

    } catch (error) {
        console.error('Error contacting ML Service:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'ML Service Unavailable',
                details: 'The disease prediction service is currently offline. Please try again later.'
            });
        }

        res.status(500).json({ error: 'Prediction failed' });
    }
});

module.exports = router;
