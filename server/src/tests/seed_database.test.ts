import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { exercisesTable } from '../db/schema';
import { seedDatabase } from '../handlers/seed_database';

describe('seedDatabase', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed the database with exercises', async () => {
    const result = await seedDatabase();

    expect(result.message).toEqual('Database seeded successfully');
    expect(result.count).toBeGreaterThan(0);
    expect(typeof result.count).toBe('number');
  });

  it('should save exercises to database', async () => {
    await seedDatabase();

    const exercises = await db.select().from(exercisesTable).execute();

    expect(exercises.length).toBeGreaterThan(15); // We expect many exercises
    
    // Check first exercise structure
    const firstExercise = exercises[0];
    expect(firstExercise.name).toBeDefined();
    expect(firstExercise.muscle_group).toBeDefined();
    expect(firstExercise.equipment_needed).toBeDefined();
    expect(firstExercise.instructions).toBeDefined();
    expect(firstExercise.runner_benefit).toBeDefined();
    expect(firstExercise.created_at).toBeInstanceOf(Date);
    
    // Verify equipment_needed is stored as JSON array
    expect(Array.isArray(firstExercise.equipment_needed)).toBe(true);
    expect((firstExercise.equipment_needed as string[]).length).toBeGreaterThan(0);
  });

  it('should not seed twice', async () => {
    // First seeding
    const firstResult = await seedDatabase();
    expect(firstResult.count).toBeGreaterThan(0);

    // Second seeding attempt
    const secondResult = await seedDatabase();
    expect(secondResult.message).toEqual('Database already seeded');
    expect(secondResult.count).toEqual(0);
  });

  it('should create exercises with correct muscle groups', async () => {
    await seedDatabase();

    const exercises = await db.select().from(exercisesTable).execute();
    
    // Check that we have exercises for different muscle groups
    const muscleGroups = exercises.map(ex => ex.muscle_group);
    const uniqueMuscleGroups = [...new Set(muscleGroups)];
    
    expect(uniqueMuscleGroups).toContain('Legs');
    expect(uniqueMuscleGroups).toContain('Core');
    expect(uniqueMuscleGroups).toContain('Back');
    expect(uniqueMuscleGroups).toContain('Chest');
    expect(uniqueMuscleGroups.length).toBeGreaterThan(4);
  });

  it('should create exercises with runner-specific benefits', async () => {
    await seedDatabase();

    const exercises = await db.select().from(exercisesTable).execute();
    
    // Every exercise should have a runner benefit
    exercises.forEach(exercise => {
      expect(exercise.runner_benefit).toBeDefined();
      expect(exercise.runner_benefit.length).toBeGreaterThan(10);
      expect(exercise.runner_benefit.toLowerCase()).toMatch(/run|stride|power|stability|strength/);
    });
  });

  it('should create exercises with various equipment requirements', async () => {
    await seedDatabase();

    const exercises = await db.select().from(exercisesTable).execute();
    
    // Check for bodyweight exercises
    const bodyweightExercises = exercises.filter(ex => 
      (ex.equipment_needed as string[]).includes('bodyweight_only')
    );
    expect(bodyweightExercises.length).toBeGreaterThan(5);
    
    // Check for dumbbell exercises
    const dumbbellExercises = exercises.filter(ex => 
      (ex.equipment_needed as string[]).includes('dumbbells')
    );
    expect(dumbbellExercises.length).toBeGreaterThan(3);
  });
});