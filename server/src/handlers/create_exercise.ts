
import { db } from '../db';
import { exercisesTable } from '../db/schema';
import { type CreateExerciseInput, type Exercise } from '../schema';

export const createExercise = async (input: CreateExerciseInput): Promise<Exercise> => {
  try {
    // Insert exercise record
    const result = await db.insert(exercisesTable)
      .values({
        name: input.name,
        muscle_group: input.muscle_group,
        equipment_needed: input.equipment_needed, // JSONB array - no conversion needed
        instructions: input.instructions,
        runner_benefit: input.runner_benefit
      })
      .returning()
      .execute();

    const exercise = result[0];
    return {
      ...exercise,
      // JSONB array is already properly typed, no conversion needed
      equipment_needed: exercise.equipment_needed as Exercise['equipment_needed']
    };
  } catch (error) {
    console.error('Exercise creation failed:', error);
    throw error;
  }
};
