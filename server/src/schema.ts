
import { z } from 'zod';

// Equipment enum
export const equipmentSchema = z.enum([
  'dumbbells',
  'barbell',
  'kettlebells',
  'resistance_bands',
  'pull_up_bar',
  'bench',
  'cable_machine',
  'leg_press',
  'squat_rack',
  'bodyweight_only'
]);

export type Equipment = z.infer<typeof equipmentSchema>;

// Exercise schema
export const exerciseSchema = z.object({
  id: z.number(),
  name: z.string(),
  muscle_group: z.string(),
  equipment_needed: equipmentSchema.array(),
  instructions: z.string(),
  runner_benefit: z.string(),
  created_at: z.coerce.date()
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Workout exercise schema (junction table with exercise details)
export const workoutExerciseSchema = z.object({
  id: z.number(),
  workout_id: z.number(),
  exercise_id: z.number(),
  sets: z.number().int().positive(),
  reps: z.string(), // Can be "8-10", "12", "30 seconds", etc.
  rest_seconds: z.number().int().positive(),
  order_index: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;

// Workout schema
export const workoutSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  duration_minutes: z.number().int().positive(),
  equipment_used: equipmentSchema.array(),
  is_completed: z.boolean(),
  completed_at: z.coerce.date().nullable(),
  created_at: z.coerce.date()
});

export type Workout = z.infer<typeof workoutSchema>;

// Input schemas
export const generateWorkoutInputSchema = z.object({
  user_id: z.string(),
  duration_minutes: z.number().int().positive().min(15).max(120),
  available_equipment: equipmentSchema.array().min(1)
});

export type GenerateWorkoutInput = z.infer<typeof generateWorkoutInputSchema>;

export const createExerciseInputSchema = z.object({
  name: z.string().min(1),
  muscle_group: z.string().min(1),
  equipment_needed: equipmentSchema.array().min(1),
  instructions: z.string().min(1),
  runner_benefit: z.string().min(1)
});

export type CreateExerciseInput = z.infer<typeof createExerciseInputSchema>;

export const completeWorkoutInputSchema = z.object({
  workout_id: z.number().int().positive()
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutInputSchema>;

export const getUserWorkoutsInputSchema = z.object({
  user_id: z.string()
});

export type GetUserWorkoutsInput = z.infer<typeof getUserWorkoutsInputSchema>;

// Response schemas
export const workoutWithExercisesSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  duration_minutes: z.number().int(),
  equipment_used: equipmentSchema.array(),
  is_completed: z.boolean(),
  completed_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  exercises: z.array(z.object({
    id: z.number(),
    exercise_id: z.number(),
    name: z.string(),
    muscle_group: z.string(),
    instructions: z.string(),
    runner_benefit: z.string(),
    sets: z.number().int(),
    reps: z.string(),
    rest_seconds: z.number().int(),
    order_index: z.number().int()
  }))
});

export type WorkoutWithExercises = z.infer<typeof workoutWithExercisesSchema>;
