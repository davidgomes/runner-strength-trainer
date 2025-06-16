
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import {
  generateWorkoutInputSchema,
  getUserWorkoutsInputSchema,
  completeWorkoutInputSchema,
  createExerciseInputSchema
} from './schema';

import { generateWorkout } from './handlers/generate_workout';
import { getUserWorkouts } from './handlers/get_user_workouts';
import { completeWorkout } from './handlers/complete_workout';
import { getExercises } from './handlers/get_exercises';
import { createExercise } from './handlers/create_exercise';
import { seedDatabase } from './handlers/seed_database';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Generate a new workout based on duration and available equipment
  generateWorkout: publicProcedure
    .input(generateWorkoutInputSchema)
    .mutation(({ input }) => generateWorkout(input)),
  
  // Get all workouts for a user
  getUserWorkouts: publicProcedure
    .input(getUserWorkoutsInputSchema)
    .query(({ input }) => getUserWorkouts(input)),
  
  // Mark a workout as completed
  completeWorkout: publicProcedure
    .input(completeWorkoutInputSchema)
    .mutation(({ input }) => completeWorkout(input)),
  
  // Get all available exercises
  getExercises: publicProcedure
    .query(() => getExercises()),
  
  // Create a new exercise (for seeding or admin purposes)
  createExercise: publicProcedure
    .input(createExerciseInputSchema)
    .mutation(({ input }) => createExercise(input)),
  
  // Seed the database with initial exercises
  seedDatabase: publicProcedure
    .mutation(() => seedDatabase()),
});

export type AppRouter = typeof appRouter;

async function start() {
  try {
    // Auto-seed database on startup
    console.log('🔍 Checking database initialization...');
    await seedDatabase();
    
    const port = process.env['SERVER_PORT'] || 2022;
    const server = createHTTPServer({
      middleware: (req, res, next) => {
        cors()(req, res, next);
      },
      router: appRouter,
      createContext() {
        return {};
      },
    });
    server.listen(port);
    console.log(`🚀 TRPC server listening at port: ${port}`);
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

start();
