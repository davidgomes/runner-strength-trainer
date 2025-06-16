
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { exercisesTable } from '../db/schema';
import { type CreateExerciseInput } from '../schema';
import { getExercises } from '../handlers/get_exercises';

const testExercise1: CreateExerciseInput = {
  name: 'Push-ups',
  muscle_group: 'chest',
  equipment_needed: ['bodyweight_only'],
  instructions: 'Start in plank position, lower body to ground, push back up',
  runner_benefit: 'Builds upper body strength and core stability for better running form'
};

const testExercise2: CreateExerciseInput = {
  name: 'Dumbbell Squats',
  muscle_group: 'legs',
  equipment_needed: ['dumbbells'],
  instructions: 'Hold dumbbells at sides, squat down keeping chest up, return to start',
  runner_benefit: 'Strengthens quadriceps and glutes for more powerful running stride'
};

describe('getExercises', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no exercises exist', async () => {
    const result = await getExercises();
    expect(result).toEqual([]);
  });

  it('should return all exercises', async () => {
    // Create test exercises
    await db.insert(exercisesTable)
      .values([
        {
          name: testExercise1.name,
          muscle_group: testExercise1.muscle_group,
          equipment_needed: testExercise1.equipment_needed,
          instructions: testExercise1.instructions,
          runner_benefit: testExercise1.runner_benefit
        },
        {
          name: testExercise2.name,
          muscle_group: testExercise2.muscle_group,
          equipment_needed: testExercise2.equipment_needed,
          instructions: testExercise2.instructions,
          runner_benefit: testExercise2.runner_benefit
        }
      ])
      .execute();

    const result = await getExercises();

    expect(result).toHaveLength(2);
    
    // Verify first exercise
    const exercise1 = result.find(e => e.name === 'Push-ups');
    expect(exercise1).toBeDefined();
    expect(exercise1!.muscle_group).toEqual('chest');
    expect(exercise1!.equipment_needed).toEqual(['bodyweight_only']);
    expect(exercise1!.instructions).toEqual(testExercise1.instructions);
    expect(exercise1!.runner_benefit).toEqual(testExercise1.runner_benefit);
    expect(exercise1!.id).toBeDefined();
    expect(exercise1!.created_at).toBeInstanceOf(Date);

    // Verify second exercise
    const exercise2 = result.find(e => e.name === 'Dumbbell Squats');
    expect(exercise2).toBeDefined();
    expect(exercise2!.muscle_group).toEqual('legs');
    expect(exercise2!.equipment_needed).toEqual(['dumbbells']);
    expect(exercise2!.instructions).toEqual(testExercise2.instructions);
    expect(exercise2!.runner_benefit).toEqual(testExercise2.runner_benefit);
    expect(exercise2!.id).toBeDefined();
    expect(exercise2!.created_at).toBeInstanceOf(Date);
  });

  it('should handle exercises with multiple equipment', async () => {
    const multiEquipmentExercise = {
      name: 'Bench Press',
      muscle_group: 'chest',
      equipment_needed: ['barbell', 'bench'],
      instructions: 'Lie on bench, grip barbell, lower to chest, press up',
      runner_benefit: 'Builds upper body power for arm drive while running'
    };

    await db.insert(exercisesTable)
      .values(multiEquipmentExercise)
      .execute();

    const result = await getExercises();

    expect(result).toHaveLength(1);
    expect(result[0].equipment_needed).toEqual(['barbell', 'bench']);
    expect(Array.isArray(result[0].equipment_needed)).toBe(true);
  });
});
