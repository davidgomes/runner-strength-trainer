
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { exercisesTable } from '../db/schema';
import { type CreateExerciseInput } from '../schema';
import { createExercise } from '../handlers/create_exercise';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateExerciseInput = {
  name: 'Push-ups',
  muscle_group: 'chest',
  equipment_needed: ['bodyweight_only'],
  instructions: 'Start in plank position, lower body to ground, push back up',
  runner_benefit: 'Builds upper body strength to improve running posture'
};

// Test input with multiple equipment
const multiEquipmentInput: CreateExerciseInput = {
  name: 'Weighted Squats',
  muscle_group: 'legs',
  equipment_needed: ['dumbbells', 'squat_rack'],
  instructions: 'Hold weights, squat down keeping knees aligned, stand back up',
  runner_benefit: 'Strengthens leg muscles for better running power and endurance'
};

describe('createExercise', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an exercise', async () => {
    const result = await createExercise(testInput);

    // Basic field validation
    expect(result.name).toEqual('Push-ups');
    expect(result.muscle_group).toEqual('chest');
    expect(result.equipment_needed).toEqual(['bodyweight_only']);
    expect(result.instructions).toEqual(testInput.instructions);
    expect(result.runner_benefit).toEqual(testInput.runner_benefit);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save exercise to database', async () => {
    const result = await createExercise(testInput);

    // Query using proper drizzle syntax
    const exercises = await db.select()
      .from(exercisesTable)
      .where(eq(exercisesTable.id, result.id))
      .execute();

    expect(exercises).toHaveLength(1);
    expect(exercises[0].name).toEqual('Push-ups');
    expect(exercises[0].muscle_group).toEqual('chest');
    expect(exercises[0].equipment_needed).toEqual(['bodyweight_only']);
    expect(exercises[0].instructions).toEqual(testInput.instructions);
    expect(exercises[0].runner_benefit).toEqual(testInput.runner_benefit);
    expect(exercises[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple equipment types', async () => {
    const result = await createExercise(multiEquipmentInput);

    // Verify multiple equipment items are stored correctly
    expect(result.equipment_needed).toEqual(['dumbbells', 'squat_rack']);
    expect(result.equipment_needed).toHaveLength(2);
    expect(result.name).toEqual('Weighted Squats');
    expect(result.muscle_group).toEqual('legs');

    // Verify in database
    const exercises = await db.select()
      .from(exercisesTable)
      .where(eq(exercisesTable.id, result.id))
      .execute();

    expect(exercises[0].equipment_needed).toEqual(['dumbbells', 'squat_rack']);
  });

  it('should create exercises with different muscle groups', async () => {
    // Create exercises for different muscle groups
    const chestExercise = await createExercise(testInput);
    const legExercise = await createExercise(multiEquipmentInput);

    // Verify both are created with correct muscle groups
    expect(chestExercise.muscle_group).toEqual('chest');
    expect(legExercise.muscle_group).toEqual('legs');

    // Verify both exist in database
    const allExercises = await db.select()
      .from(exercisesTable)
      .execute();

    expect(allExercises).toHaveLength(2);
    const muscleGroups = allExercises.map(ex => ex.muscle_group);
    expect(muscleGroups).toContain('chest');
    expect(muscleGroups).toContain('legs');
  });
});
