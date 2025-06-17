
import { db } from '../db';
import { exercisesTable, workoutsTable, workoutExercisesTable } from '../db/schema';
import { type GenerateWorkoutInput, type WorkoutWithExercises, type Equipment } from '../schema';
import { sql, or } from 'drizzle-orm';

export const generateWorkout = async (input: GenerateWorkoutInput): Promise<WorkoutWithExercises> => {
  try {
    // Find exercises that match the available equipment
    // Use the ? operator to check if the JSONB array contains any of the available equipment
    const equipmentConditions = input.available_equipment.map(equipment => 
      sql`equipment_needed ? ${equipment}`
    );

    let availableExercises = await db.select()
      .from(exercisesTable)
      .where(or(...equipmentConditions))
      .execute();

    // Fallback logic: if no exercises found for selected equipment, use bodyweight exercises
    if (availableExercises.length === 0) {
      availableExercises = await db.select()
        .from(exercisesTable)
        .where(sql`equipment_needed ? 'bodyweight_only'`)
        .execute();
    }

    if (availableExercises.length === 0) {
      throw new Error('No exercises found for the available equipment');
    }

    // Calculate number of exercises based on duration
    // Assuming 3-5 minutes per exercise (including rest)
    const targetExerciseCount = Math.max(3, Math.min(8, Math.floor(input.duration_minutes / 4)));
    
    // Select a diverse set of exercises (shuffle and pick)
    const shuffledExercises = availableExercises.sort(() => 0.5 - Math.random());
    const selectedExercises = shuffledExercises.slice(0, targetExerciseCount);

    // Generate workout name based on equipment and muscle groups
    const muscleGroups = [...new Set(selectedExercises.map(ex => ex.muscle_group))];
    const workoutName = `${input.duration_minutes}min ${muscleGroups.slice(0, 2).join(' & ')} Workout`;

    // Create the workout
    const workoutResult = await db.insert(workoutsTable)
      .values({
        user_id: input.user_id,
        name: workoutName,
        duration_minutes: input.duration_minutes,
        equipment_used: input.available_equipment, // Store array directly, not as JSON string
        is_completed: false,
        completed_at: null
      })
      .returning()
      .execute();

    const workout = workoutResult[0];

    // Create workout exercises with calculated sets/reps based on duration
    const workoutExercises = selectedExercises.map((exercise, index) => {
      // Calculate sets and reps based on workout duration
      let sets = 3;
      let reps = '8-12';
      let restSeconds = 60;

      if (input.duration_minutes <= 30) {
        sets = 2;
        reps = '10-15';
        restSeconds = 45;
      } else if (input.duration_minutes >= 60) {
        sets = 4;
        reps = '6-10';
        restSeconds = 90;
      }

      return {
        workout_id: workout.id,
        exercise_id: exercise.id,
        sets,
        reps,
        rest_seconds: restSeconds,
        order_index: index
      };
    });

    // Insert workout exercises
    const workoutExerciseResults = await db.insert(workoutExercisesTable)
      .values(workoutExercises)
      .returning()
      .execute();

    // Build the response with exercise details
    const exercisesWithDetails = workoutExerciseResults.map(we => {
      const exercise = selectedExercises.find(ex => ex.id === we.exercise_id)!;
      return {
        id: we.id,
        exercise_id: we.exercise_id,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        instructions: exercise.instructions,
        runner_benefit: exercise.runner_benefit,
        sets: we.sets,
        reps: we.reps,
        rest_seconds: we.rest_seconds,
        order_index: we.order_index
      };
    });

    return {
      id: workout.id,
      user_id: workout.user_id,
      name: workout.name,
      duration_minutes: workout.duration_minutes,
      equipment_used: workout.equipment_used as Equipment[], // Cast to Equipment array
      is_completed: workout.is_completed,
      completed_at: workout.completed_at,
      created_at: workout.created_at,
      exercises: exercisesWithDetails.sort((a, b) => a.order_index - b.order_index)
    };
  } catch (error) {
    console.error('Workout generation failed:', error);
    throw error;
  }
};
