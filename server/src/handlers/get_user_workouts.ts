
import { type GetUserWorkoutsInput, type WorkoutWithExercises } from '../schema';

export declare function getUserWorkouts(input: GetUserWorkoutsInput): Promise<WorkoutWithExercises[]>;
