
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workoutsTable, exercisesTable, workoutExercisesTable } from '../db/schema';
import { type GetUserWorkoutsInput } from '../schema';
import { getUserWorkouts } from '../handlers/get_user_workouts';

// Test input
const testInput: GetUserWorkoutsInput = {
  user_id: 'user123'
};

describe('getUserWorkouts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for user with no workouts', async () => {
    const result = await getUserWorkouts(testInput);

    expect(result).toHaveLength(0);
  });

  it('should return workouts with exercises for user', async () => {
    // Create test exercise
    const exerciseResult = await db.insert(exercisesTable)
      .values({
        name: 'Push-ups',
        muscle_group: 'chest',
        equipment_needed: ['bodyweight_only'],
        instructions: 'Do push-ups',
        runner_benefit: 'Builds upper body strength'
      })
      .returning()
      .execute();

    const exercise = exerciseResult[0];

    // Create test workout
    const workoutResult = await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'Upper Body Strength',
        duration_minutes: 30,
        equipment_used: ['bodyweight_only'],
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    const workout = workoutResult[0];

    // Create workout exercise
    await db.insert(workoutExercisesTable)
      .values({
        workout_id: workout.id,
        exercise_id: exercise.id,
        sets: 3,
        reps: '10-12',
        rest_seconds: 60,
        order_index: 0
      })
      .execute();

    const result = await getUserWorkouts(testInput);

    expect(result).toHaveLength(1);
    
    const workoutWithExercises = result[0];
    expect(workoutWithExercises.id).toEqual(workout.id);
    expect(workoutWithExercises.user_id).toEqual('user123');
    expect(workoutWithExercises.name).toEqual('Upper Body Strength');
    expect(workoutWithExercises.duration_minutes).toEqual(30);
    expect(workoutWithExercises.equipment_used).toEqual(['bodyweight_only']);
    expect(workoutWithExercises.is_completed).toEqual(false);
    expect(workoutWithExercises.completed_at).toBeNull();
    expect(workoutWithExercises.created_at).toBeInstanceOf(Date);

    expect(workoutWithExercises.exercises).toHaveLength(1);
    
    const exerciseDetail = workoutWithExercises.exercises[0];
    expect(exerciseDetail.exercise_id).toEqual(exercise.id);
    expect(exerciseDetail.name).toEqual('Push-ups');
    expect(exerciseDetail.muscle_group).toEqual('chest');
    expect(exerciseDetail.instructions).toEqual('Do push-ups');
    expect(exerciseDetail.runner_benefit).toEqual('Builds upper body strength');
    expect(exerciseDetail.sets).toEqual(3);
    expect(exerciseDetail.reps).toEqual('10-12');
    expect(exerciseDetail.rest_seconds).toEqual(60);
    expect(exerciseDetail.order_index).toEqual(0);
  });

  it('should return workouts ordered by created_at descending', async () => {
    // Create first workout
    const workout1 = await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'First Workout',
        duration_minutes: 20,
        equipment_used: ['bodyweight_only'],
        is_completed: true,
        completed_at: new Date('2024-01-01')
      })
      .returning()
      .execute();

    // Create second workout (more recent)
    const workout2 = await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'Second Workout',
        duration_minutes: 25,
        equipment_used: ['dumbbells'],
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    const result = await getUserWorkouts(testInput);

    expect(result).toHaveLength(2);
    // More recent workout should be first
    expect(result[0].name).toEqual('Second Workout');
    expect(result[1].name).toEqual('First Workout');
  });

  it('should only return workouts for specified user', async () => {
    // Create workout for different user
    await db.insert(workoutsTable)
      .values({
        user_id: 'other_user',
        name: 'Other User Workout',
        duration_minutes: 30,
        equipment_used: ['barbell'],
        is_completed: false,
        completed_at: null
      })
      .execute();

    // Create workout for test user
    await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'Test User Workout',
        duration_minutes: 25,
        equipment_used: ['dumbbells'],
        is_completed: false,
        completed_at: null
      })
      .execute();

    const result = await getUserWorkouts(testInput);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Test User Workout');
    expect(result[0].user_id).toEqual('user123');
  });

  it('should handle multiple exercises in correct order', async () => {
    // Create test exercises
    const exercise1 = await db.insert(exercisesTable)
      .values({
        name: 'Squats',
        muscle_group: 'legs',
        equipment_needed: ['bodyweight_only'],
        instructions: 'Do squats',
        runner_benefit: 'Builds leg strength'
      })
      .returning()
      .execute();

    const exercise2 = await db.insert(exercisesTable)
      .values({
        name: 'Lunges',
        muscle_group: 'legs',
        equipment_needed: ['bodyweight_only'],
        instructions: 'Do lunges',
        runner_benefit: 'Improves balance'
      })
      .returning()
      .execute();

    // Create test workout
    const workout = await db.insert(workoutsTable)
      .values({
        user_id: 'user123',
        name: 'Leg Day',
        duration_minutes: 45,
        equipment_used: ['bodyweight_only'],
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    // Create workout exercises in specific order
    await db.insert(workoutExercisesTable)
      .values([
        {
          workout_id: workout[0].id,
          exercise_id: exercise1[0].id,
          sets: 3,
          reps: '15',
          rest_seconds: 90,
          order_index: 1
        },
        {
          workout_id: workout[0].id,
          exercise_id: exercise2[0].id,
          sets: 2,
          reps: '12 each leg',
          rest_seconds: 60,
          order_index: 0
        }
      ])
      .execute();

    const result = await getUserWorkouts(testInput);

    expect(result).toHaveLength(1);
    expect(result[0].exercises).toHaveLength(2);
    
    // Should be ordered by order_index
    expect(result[0].exercises[0].name).toEqual('Lunges');
    expect(result[0].exercises[0].order_index).toEqual(0);
    expect(result[0].exercises[1].name).toEqual('Squats');
    expect(result[0].exercises[1].order_index).toEqual(1);
  });
});
