
import { db } from '../db';
import { workoutsTable, workoutExercisesTable, exercisesTable } from '../db/schema';
import { type GetUserWorkoutsInput, type WorkoutWithExercises } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getUserWorkouts = async (input: GetUserWorkoutsInput): Promise<WorkoutWithExercises[]> => {
  try {
    // Get all workouts for the user
    const workouts = await db.select()
      .from(workoutsTable)
      .where(eq(workoutsTable.user_id, input.user_id))
      .orderBy(desc(workoutsTable.created_at))
      .execute();

    // Get all workout exercises with exercise details for these workouts
    const workoutIds = workouts.map(w => w.id);
    
    let workoutExercisesWithDetails: any[] = [];
    if (workoutIds.length > 0) {
      workoutExercisesWithDetails = await db.select({
        workoutExercise: workoutExercisesTable,
        exercise: exercisesTable
      })
        .from(workoutExercisesTable)
        .innerJoin(exercisesTable, eq(workoutExercisesTable.exercise_id, exercisesTable.id))
        .where(eq(workoutExercisesTable.workout_id, workoutIds[0]))
        .execute();

      // If there are multiple workouts, get exercises for all of them
      for (let i = 1; i < workoutIds.length; i++) {
        const additionalExercises = await db.select({
          workoutExercise: workoutExercisesTable,
          exercise: exercisesTable
        })
          .from(workoutExercisesTable)
          .innerJoin(exercisesTable, eq(workoutExercisesTable.exercise_id, exercisesTable.id))
          .where(eq(workoutExercisesTable.workout_id, workoutIds[i]))
          .execute();
        
        workoutExercisesWithDetails.push(...additionalExercises);
      }
    }

    // Group exercises by workout_id
    const exercisesByWorkout = workoutExercisesWithDetails.reduce((acc, item) => {
      const workoutId = item.workoutExercise.workout_id;
      if (!acc[workoutId]) {
        acc[workoutId] = [];
      }
      acc[workoutId].push({
        id: item.workoutExercise.id,
        exercise_id: item.workoutExercise.exercise_id,
        name: item.exercise.name,
        muscle_group: item.exercise.muscle_group,
        instructions: item.exercise.instructions,
        runner_benefit: item.exercise.runner_benefit,
        sets: item.workoutExercise.sets,
        reps: item.workoutExercise.reps,
        rest_seconds: item.workoutExercise.rest_seconds,
        order_index: item.workoutExercise.order_index
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Combine workouts with their exercises
    const result: WorkoutWithExercises[] = workouts.map(workout => ({
      id: workout.id,
      user_id: workout.user_id,
      name: workout.name,
      duration_minutes: workout.duration_minutes,
      equipment_used: workout.equipment_used as any[],
      is_completed: workout.is_completed,
      completed_at: workout.completed_at,
      created_at: workout.created_at,
      exercises: (exercisesByWorkout[workout.id] || []).sort((a: any, b: any) => a.order_index - b.order_index)
    }));

    return result;
  } catch (error) {
    console.error('Get user workouts failed:', error);
    throw error;
  }
};
