
import { serial, text, pgTable, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Equipment enum
export const equipmentEnum = pgEnum('equipment', [
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

// Exercises table
export const exercisesTable = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  muscle_group: text('muscle_group').notNull(),
  equipment_needed: jsonb('equipment_needed').notNull(), // Array of equipment
  instructions: text('instructions').notNull(),
  runner_benefit: text('runner_benefit').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Workouts table
export const workoutsTable = pgTable('workouts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  duration_minutes: integer('duration_minutes').notNull(),
  equipment_used: jsonb('equipment_used').notNull(), // Array of equipment
  is_completed: boolean('is_completed').default(false).notNull(),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Workout exercises junction table
export const workoutExercisesTable = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workout_id: integer('workout_id').notNull(),
  exercise_id: integer('exercise_id').notNull(),
  sets: integer('sets').notNull(),
  reps: text('reps').notNull(), // Can be "8-10", "12", "30 seconds", etc.
  rest_seconds: integer('rest_seconds').notNull(),
  order_index: integer('order_index').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const workoutsRelations = relations(workoutsTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const exercisesRelations = relations(exercisesTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const workoutExercisesRelations = relations(workoutExercisesTable, ({ one }) => ({
  workout: one(workoutsTable, {
    fields: [workoutExercisesTable.workout_id],
    references: [workoutsTable.id],
  }),
  exercise: one(exercisesTable, {
    fields: [workoutExercisesTable.exercise_id],
    references: [exercisesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Exercise = typeof exercisesTable.$inferSelect;
export type NewExercise = typeof exercisesTable.$inferInsert;
export type Workout = typeof workoutsTable.$inferSelect;
export type NewWorkout = typeof workoutsTable.$inferInsert;
export type WorkoutExercise = typeof workoutExercisesTable.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercisesTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  exercises: exercisesTable,
  workouts: workoutsTable,
  workoutExercises: workoutExercisesTable,
};
