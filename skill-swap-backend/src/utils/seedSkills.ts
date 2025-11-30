import Skill from '../models/Skill';
import { PREDEFINED_SKILLS } from './predefinedSkills';
import mongoose from 'mongoose';
import logger from './logger';

/**
 * Seed predefined skills into the database
 * This ensures all predefined skills exist in the database
 */
export const seedPredefinedSkills = async (): Promise<void> => {
  try {
    logger.info('Starting to seed predefined skills...');
    console.log('🌱 Starting to seed predefined skills...');

    let createdCount = 0;
    let existingCount = 0;

    // Use a system user ID for seeding (or create a system user)
    // For now, we'll use a placeholder ObjectId
    const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');

    for (const predefinedSkill of PREDEFINED_SKILLS) {
      try {
        // Check if skill already exists (case-insensitive, exact match)
        // Escape special regex characters in skill name
        const escapedName = predefinedSkill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingSkill = await Skill.findOne({
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
        });

        if (existingSkill) {
          // Update category if it doesn't match (in case predefined list was updated)
          if (existingSkill.category !== predefinedSkill.category) {
            existingSkill.category = predefinedSkill.category;
            await existingSkill.save();
            logger.info(`Updated category for skill: ${predefinedSkill.name}`);
            console.log(`  ↻ Updated category for skill: ${predefinedSkill.name}`);
          }
          existingCount++;
          console.log(`  ✓ Skill already exists: ${predefinedSkill.name}`);
        } else {
          // Create the skill
          const newSkill = new Skill({
            name: predefinedSkill.name,
            category: predefinedSkill.category,
            description: '',
            createdBy: systemUserId,
          });

          await newSkill.save();
          createdCount++;
          logger.info(`Created skill: ${predefinedSkill.name}`);
          console.log(`  ✓ Created skill: ${predefinedSkill.name} (${predefinedSkill.category})`);
        }
      } catch (error: any) {
        logger.error(`Error processing skill ${predefinedSkill.name}:`, error);
        console.error(`  ✗ Error processing skill ${predefinedSkill.name}:`, error.message);
        // Continue with next skill instead of failing completely
      }
    }

    const message = `Skill seeding completed. Created: ${createdCount}, Already existed: ${existingCount}, Total: ${PREDEFINED_SKILLS.length}`;
    logger.info(message);
    console.log(`✅ ${message}`);
  } catch (error) {
    logger.error('Error seeding predefined skills:', error);
    throw error;
  }
};

