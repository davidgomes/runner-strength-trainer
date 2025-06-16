
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkoutGenerator } from '@/components/WorkoutGenerator';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { trpc } from '@/utils/trpc';
import type { WorkoutWithExercises } from '../../server/src/schema';

function App() {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithExercises | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const userId = 'user_123';

  const loadWorkoutHistory = useCallback(async () => {
    try {
      const history = await trpc.getUserWorkouts.query({ user_id: userId });
      setWorkoutHistory(history);
    } catch (error) {
      console.error('Failed to load workout history:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadWorkoutHistory();
  }, [loadWorkoutHistory]);

  const handleWorkoutGenerated = (workout: WorkoutWithExercises) => {
    setCurrentWorkout(workout);
    setActiveTab('current');
    // Refresh history to include the new workout
    loadWorkoutHistory();
  };

  const handleCompleteWorkout = async (workoutId: number) => {
    setIsLoading(true);
    try {
      await trpc.completeWorkout.mutate({ workout_id: workoutId });
      // Update current workout if it's the one being completed
      if (currentWorkout && currentWorkout.id === workoutId) {
        setCurrentWorkout({
          ...currentWorkout,
          is_completed: true,
          completed_at: new Date()
        });
      }
      // Refresh history to show updated completion status
      await loadWorkoutHistory();
    } catch (error) {
      console.error('Failed to complete workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏃‍♂️ Runner's Strength Training
          </h1>
          <p className="text-xl text-gray-600">
            Build strength to improve your running performance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              💪 Generate Workout
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-2">
              🎯 Current Workout
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              📚 Workout History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎲 Generate New Workout
                </CardTitle>
                <CardDescription>
                  Tell us your available time and equipment to get a personalized strength training workout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutGenerator 
                  userId={userId} 
                  onWorkoutGenerated={handleWorkoutGenerated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current">
            {currentWorkout ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        🏋️‍♀️ {currentWorkout.name}
                      </CardTitle>
                      <CardDescription>
                        {currentWorkout.duration_minutes} minutes • {currentWorkout.exercises.length} exercises
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentWorkout.is_completed ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✅ Completed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleCompleteWorkout(currentWorkout.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? 'Completing...' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Equipment Used:</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentWorkout.equipment_used.map((equipment) => (
                        <Badge key={equipment} variant="outline">
                          {equipment.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Exercises:</h3>
                    {currentWorkout.exercises
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((exercise, index) => (
                        <div key={exercise.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">
                              {index + 1}. {exercise.name}
                            </h4>
                            <Badge variant="secondary">
                              {exercise.muscle_group}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-800">Sets</div>
                              <div className="text-xl font-bold">{exercise.sets}</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-semibold text-green-800">Reps</div>
                              <div className="text-xl font-bold">{exercise.reps}</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <div className="font-semibold text-orange-800">Rest</div>
                              <div className="text-xl font-bold">{exercise.rest_seconds}s</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold">Instructions: </span>
                              <span className="text-gray-700">{exercise.instructions}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Runner Benefit: </span>
                              <span className="text-blue-700">{exercise.runner_benefit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No current workout
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Generate a new workout to get started!
                  </p>
                  <Button onClick={() => setActiveTab('generate')}>
                    Generate Workout
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <WorkoutHistory 
              workouts={workoutHistory}
              onCompleteWorkout={handleCompleteWorkout}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
