
import { db } from '../db';
import { workoutsTable } from '../db/schema';
import { type CompleteWorkoutInput, type Workout, type Equipment } from '../schema';
import { eq } from 'drizzle-orm';

export const completeWorkout = async (input: CompleteWorkoutInput): Promise<Workout> => {
  try {
    // Update workout to mark as completed
    const result = await db.update(workoutsTable)
      .set({
        is_completed: true,
        completed_at: new Date()
      })
      .where(eq(workoutsTable.id, input.workout_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Workout with id ${input.workout_id} not found`);
    }

    const workout = result[0];
    return {
      ...workout,
      equipment_used: workout.equipment_used as Equipment[], // Cast jsonb to Equipment array
      completed_at: workout.completed_at || null
    };
  } catch (error) {
    console.error('Workout completion failed:', error);
    throw error;
  }
};
