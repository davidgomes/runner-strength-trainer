
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { exercisesTable, workoutsTable, workoutExercisesTable } from '../db/schema';
import { type GenerateWorkoutInput } from '../schema';
import { generateWorkout } from '../handlers/generate_workout';
import { eq } from 'drizzle-orm';

const testInput: GenerateWorkoutInput = {
  user_id: 'test-user-123',
  duration_minutes: 45,
  available_equipment: ['dumbbells', 'bench', 'bodyweight_only']
};

describe('generateWorkout', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate a workout with exercises', async () => {
    // Create test exercises
    await db.insert(exercisesTable).values([
      {
        name: 'Push-ups',
        muscle_group: 'chest',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Standard push-up form',
        runner_benefit: 'Builds upper body strength'
      },
      {
        name: 'Dumbbell Press',
        muscle_group: 'chest',
        equipment_needed: ['dumbbells', 'bench'], // Use array directly
        instructions: 'Press dumbbells from chest',
        runner_benefit: 'Strengthens chest and shoulders'
      },
      {
        name: 'Squats',
        muscle_group: 'legs',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Bodyweight squats',
        runner_benefit: 'Builds leg strength for running'
      }
    ]).execute();

    const result = await generateWorkout(testInput);

    // Verify workout properties
    expect(result.user_id).toEqual('test-user-123');
    expect(result.duration_minutes).toEqual(45);
    expect(result.equipment_used).toEqual(['dumbbells', 'bench', 'bodyweight_only']);
    expect(result.is_completed).toBe(false);
    expect(result.completed_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.name).toContain('45min');

    // Verify exercises are included
    expect(result.exercises).toBeDefined();
    expect(result.exercises.length).toBeGreaterThan(0);
    
    // Verify exercise structure
    const firstExercise = result.exercises[0];
    expect(firstExercise.id).toBeDefined();
    expect(firstExercise.exercise_id).toBeDefined();
    expect(firstExercise.name).toBeDefined();
    expect(firstExercise.muscle_group).toBeDefined();
    expect(firstExercise.instructions).toBeDefined();
    expect(firstExercise.runner_benefit).toBeDefined();
    expect(firstExercise.sets).toBeGreaterThan(0);
    expect(firstExercise.reps).toBeDefined();
    expect(firstExercise.rest_seconds).toBeGreaterThan(0);
    expect(typeof firstExercise.order_index).toBe('number');
  });

  it('should save workout to database', async () => {
    // Create test exercises
    await db.insert(exercisesTable).values([
      {
        name: 'Push-ups',
        muscle_group: 'chest',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Standard push-up form',
        runner_benefit: 'Builds upper body strength'
      }
    ]).execute();

    const result = await generateWorkout(testInput);

    // Verify workout was saved
    const workouts = await db.select()
      .from(workoutsTable)
      .where(eq(workoutsTable.id, result.id))
      .execute();

    expect(workouts).toHaveLength(1);
    expect(workouts[0].user_id).toEqual('test-user-123');
    expect(workouts[0].duration_minutes).toEqual(45);
    expect(workouts[0].is_completed).toBe(false);

    // Verify workout exercises were saved
    const workoutExercises = await db.select()
      .from(workoutExercisesTable)
      .where(eq(workoutExercisesTable.workout_id, result.id))
      .execute();

    expect(workoutExercises.length).toBeGreaterThan(0);
    expect(workoutExercises[0].sets).toBeGreaterThan(0);
    expect(workoutExercises[0].reps).toBeDefined();
    expect(workoutExercises[0].rest_seconds).toBeGreaterThan(0);
  });

  it('should adjust sets and reps based on duration', async () => {
    // Create test exercise
    await db.insert(exercisesTable).values({
      name: 'Push-ups',
      muscle_group: 'chest',
      equipment_needed: ['bodyweight_only'], // Use array directly
      instructions: 'Standard push-up form',
      runner_benefit: 'Builds upper body strength'
    }).execute();

    // Test short workout
    const shortWorkout = await generateWorkout({
      ...testInput,
      duration_minutes: 20
    });

    expect(shortWorkout.exercises[0].sets).toEqual(2);
    expect(shortWorkout.exercises[0].rest_seconds).toEqual(45);

    // Test long workout
    const longWorkout = await generateWorkout({
      ...testInput,
      duration_minutes: 75
    });

    expect(longWorkout.exercises[0].sets).toEqual(4);
    expect(longWorkout.exercises[0].rest_seconds).toEqual(90);
  });

  it('should throw error when no exercises match equipment', async () => {
    // Create exercise with different equipment
    await db.insert(exercisesTable).values({
      name: 'Leg Press',
      muscle_group: 'legs',
      equipment_needed: ['leg_press'], // Use array directly
      instructions: 'Use leg press machine',
      runner_benefit: 'Builds leg strength'
    }).execute();

    // Try to generate workout with incompatible equipment
    await expect(generateWorkout({
      ...testInput,
      available_equipment: ['dumbbells'] // No leg_press available
    })).rejects.toThrow(/no exercises found/i);
  });

  it('should order exercises correctly', async () => {
    // Create multiple test exercises
    await db.insert(exercisesTable).values([
      {
        name: 'Exercise A',
        muscle_group: 'chest',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Instructions A',
        runner_benefit: 'Benefit A'
      },
      {
        name: 'Exercise B',
        muscle_group: 'legs',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Instructions B',
        runner_benefit: 'Benefit B'
      },
      {
        name: 'Exercise C',
        muscle_group: 'back',
        equipment_needed: ['bodyweight_only'], // Use array directly
        instructions: 'Instructions C',
        runner_benefit: 'Benefit C'
      }
    ]).execute();

    const result = await generateWorkout(testInput);

    // Verify exercises are ordered by order_index
    const orderIndices = result.exercises.map(ex => ex.order_index);
    const sortedIndices = [...orderIndices].sort((a, b) => a - b);
    expect(orderIndices).toEqual(sortedIndices);

    // Verify order_index starts from 0
    expect(Math.min(...orderIndices)).toEqual(0);
  });
});
