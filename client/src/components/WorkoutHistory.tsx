import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { WorkoutWithExercises } from '../../../server/src/schema';

interface WorkoutHistoryProps {
  workouts: WorkoutWithExercises[];
  onCompleteWorkout: (workoutId: number) => Promise<void>;
  isLoading: boolean;
}

export function WorkoutHistory({ workouts, onCompleteWorkout, isLoading }: WorkoutHistoryProps) {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<number>>(new Set());

  const toggleWorkout = (workoutId: number) => {
    setExpandedWorkouts((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No workout history yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your completed and saved workouts will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedWorkouts = workouts.filter(w => w.is_completed);
  const pendingWorkouts = workouts.filter(w => !w.is_completed);

  return (
    <div className="space-y-6">
      {pendingWorkouts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-gray-200">
            ⏳ Pending Workouts ({pendingWorkouts.length})
          </h2>
          <div className="space-y-4">
            {pendingWorkouts.map((workout: WorkoutWithExercises) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedWorkouts.has(workout.id)}
                onToggle={() => toggleWorkout(workout.id)}
                onComplete={() => onCompleteWorkout(workout.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {completedWorkouts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-gray-200">
            ✅ Completed Workouts ({completedWorkouts.length})
          </h2>
          <div className="space-y-4">
            {completedWorkouts.map((workout: WorkoutWithExercises) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedWorkouts.has(workout.id)}
                onToggle={() => toggleWorkout(workout.id)}
                onComplete={undefined}
                isLoading={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete?: () => void;
  isLoading: boolean;
}

function WorkoutCard({ workout, isExpanded, onToggle, onComplete, isLoading }: WorkoutCardProps) {
  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-5 w-5 dark:text-gray-300" /> : <ChevronRight className="h-5 w-5 dark:text-gray-300" />}
                <div>
                  <CardTitle className="text-lg dark:text-gray-100">{workout.name}</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    {workout.duration_minutes} minutes • {workout.exercises.length} exercises •{' '}
                    Created {workout.created_at.toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {workout.is_completed ? (
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✅ Completed
                    </Badge>
                    {workout.completed_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {workout.completed_at.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  onComplete && (
                    <Button 
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onComplete();
                      }}
                      disabled={isLoading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Completing...' : 'Complete'}
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="mb-4">
              <h4 className="font-semibold mb-2 dark:text-gray-200">Equipment Used:</h4>
              <div className="flex flex-wrap gap-2">
                {workout.equipment_used.map((equipment) => (
                  <Badge key={equipment} variant="outline">
                    {equipment.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold dark:text-gray-200">Exercises:</h4>
              {workout.exercises
                .sort((a, b) => a.order_index - b.order_index)
                .map((exercise, index) => (
                  <div key={exercise.id} className="border rounded p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium dark:text-gray-100">
                        {index + 1}. {exercise.name}
                      </h5>
                      <Badge variant="secondary" className="text-xs">
                        {exercise.muscle_group}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span><strong>Sets:</strong> {exercise.sets}</span>
                      <span><strong>Reps:</strong> {exercise.reps}</span>
                      <span><strong>Rest:</strong> {exercise.rest_seconds}s</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}