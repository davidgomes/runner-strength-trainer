
import { db } from '../db';
import { exercisesTable } from '../db/schema';
import { type Exercise, type Equipment } from '../schema';

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const result = await db.select()
      .from(exercisesTable)
      .execute();

    return result.map(exercise => ({
      ...exercise,
      equipment_needed: exercise.equipment_needed as Equipment[], // Cast JSONB to Equipment array
      created_at: exercise.created_at!
    }));
  } catch (error) {
    console.error('Failed to get exercises:', error);
    throw error;
  }
};
