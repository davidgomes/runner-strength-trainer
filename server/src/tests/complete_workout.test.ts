
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workoutsTable } from '../db/schema';
import { type CompleteWorkoutInput } from '../schema';
import { completeWorkout } from '../handlers/complete_workout';
import { eq } from 'drizzle-orm';

describe('completeWorkout', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should complete a workout', async () => {
    // Create a test workout
    const workoutResult = await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'Morning Strength',
        duration_minutes: 45,
        equipment_used: ['dumbbells', 'bench'],
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    const workout = workoutResult[0];
    const input: CompleteWorkoutInput = {
      workout_id: workout.id
    };

    const result = await completeWorkout(input);

    // Verify the workout is marked as completed
    expect(result.id).toEqual(workout.id);
    expect(result.is_completed).toBe(true);
    expect(result.completed_at).toBeInstanceOf(Date);
    expect(result.user_id).toEqual('user123');
    expect(result.name).toEqual('Morning Strength');
    expect(result.duration_minutes).toEqual(45);
    expect(result.equipment_used).toEqual(['dumbbells', 'bench']);
  });

  it('should save completion status to database', async () => {
    // Create a test workout
    const workoutResult = await db.insert(workoutsTable)
      .values({
        user_id: 'user456',
        name: 'Evening Cardio',
        duration_minutes: 30,
        equipment_used: ['bodyweight_only'],
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    const workout = workoutResult[0];
    const input: CompleteWorkoutInput = {
      workout_id: workout.id
    };

    await completeWorkout(input);

    // Verify in database
    const updatedWorkouts = await db.select()
      .from(workoutsTable)
      .where(eq(workoutsTable.id, workout.id))
      .execute();

    expect(updatedWorkouts).toHaveLength(1);
    const updatedWorkout = updatedWorkouts[0];
    expect(updatedWorkout.is_completed).toBe(true);
    expect(updatedWorkout.completed_at).toBeInstanceOf(Date);
    expect(updatedWorkout.user_id).toEqual('user456');
  });

  it('should throw error for non-existent workout', async () => {
    const input: CompleteWorkoutInput = {
      workout_id: 99999
    };

    await expect(completeWorkout(input)).rejects.toThrow(/workout with id 99999 not found/i);
  });

  it('should handle already completed workout', async () => {
    // Create an already completed workout
    const completedAt = new Date();
    const workoutResult = await db.insert(workoutsTable)
      .values({
        user_id: 'user789',
        name: 'Already Done',
        duration_minutes: 60,
        equipment_used: ['kettlebells'],
        is_completed: true,
        completed_at: completedAt
      })
      .returning()
      .execute();

    const workout = workoutResult[0];
    const input: CompleteWorkoutInput = {
      workout_id: workout.id
    };

    const result = await completeWorkout(input);

    // Should still work and update the completed_at timestamp
    expect(result.is_completed).toBe(true);
    expect(result.completed_at).toBeInstanceOf(Date);
    expect(result.completed_at).not.toEqual(completedAt); // Should be a new timestamp
  });
});
