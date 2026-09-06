import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ValuationRule } from '../models/ValuationRule';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Property_Valuation';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const rulesExist = await ValuationRule.findOne({ schemaVersion: '1.0.0' });
    if (rulesExist) {
      console.log('Rules version 1.0.0 already exists. Removing old rules to re-seed...');
      await ValuationRule.deleteMany({});
    }

    const seedFilePath = path.join(__dirname, '../../../seed/valuation-rules.json');
    if (!fs.existsSync(seedFilePath)) {
      console.error(`Seed file not found at ${seedFilePath}`);
      process.exit(1);
    }

    const rulesData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

    // We only take the relevant parts for our schema.
    const newRule = new ValuationRule({
      schemaVersion: rulesData.schemaVersion,
      name: rulesData.name,
      active: true,
      constants: rulesData.constants,
      scoreLookup: rulesData.scoreLookup,
      landZoneRatesPerKhatha: rulesData.landZoneRatesPerKhatha,
      mainLandSlabs: rulesData.mainLandSlabs,
      standaloneLandSlabs: rulesData.standaloneLandSlabs,
      locationData: rulesData.locationData
    });

    // Deactivate any existing active rules
    await ValuationRule.updateMany({}, { active: false });

    await newRule.save();
    console.log('Valuation rules seeded successfully.');

  } catch (error) {
    console.error('Error seeding valuation rules:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

seed();
