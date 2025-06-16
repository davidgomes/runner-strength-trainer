
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { GenerateWorkoutInput, WorkoutWithExercises, Equipment } from '../../../server/src/schema';

interface WorkoutGeneratorProps {
  userId: string;
  onWorkoutGenerated: (workout: WorkoutWithExercises) => void;
}

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; emoji: string }[] = [
  { value: 'dumbbells', label: 'Dumbbells', emoji: '🏋️' },
  { value: 'barbell', label: 'Barbell', emoji: '🏋️‍♂️' },
  { value: 'kettlebells', label: 'Kettlebells', emoji: '⚽' },
  { value: 'resistance_bands', label: 'Resistance Bands', emoji: '🔗' },
  { value: 'pull_up_bar', label: 'Pull-up Bar', emoji: '🏗️' },
  { value: 'bench', label: 'Bench', emoji: '🪑' },
  { value: 'cable_machine', label: 'Cable Machine', emoji: '🎰' },
  { value: 'leg_press', label: 'Leg Press', emoji: '🦵' },
  { value: 'squat_rack', label: 'Squat Rack', emoji: '🏗️' },
  { value: 'bodyweight_only', label: 'Bodyweight Only', emoji: '🤸' }
];

export function WorkoutGenerator({ userId, onWorkoutGenerated }: WorkoutGeneratorProps) {
  const [formData, setFormData] = useState<GenerateWorkoutInput>({
    user_id: userId,
    duration_minutes: 30,
    available_equipment: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEquipmentChange = (equipment: Equipment, checked: boolean) => {
    setFormData((prev: GenerateWorkoutInput) => ({
      ...prev,
      available_equipment: checked
        ? [...prev.available_equipment, equipment]
        : prev.available_equipment.filter(e => e !== equipment)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.available_equipment.length === 0) {
      alert('Please select at least one piece of equipment');
      return;
    }

    setIsLoading(true);
    try {
      const workout = await trpc.generateWorkout.mutate(formData);
      onWorkoutGenerated(workout);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      alert('Failed to generate workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="duration">Workout Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="15"
          max="120"
          value={formData.duration_minutes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: GenerateWorkoutInput) => ({
              ...prev,
              duration_minutes: parseInt(e.target.value) || 30
            }))
          }
          className="text-lg"
          required
        />
        <p className="text-sm text-gray-600">Choose between 15-120 minutes</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Available Equipment</Label>
        <p className="text-sm text-gray-600 mb-4">
          Select all equipment you have access to at your gym
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EQUIPMENT_OPTIONS.map((option) => (
            <Card key={option.value} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={option.value}
                    checked={formData.available_equipment.includes(option.value)}
                    onCheckedChange={(checked: boolean) =>
                      handleEquipmentChange(option.value, checked)
                    }
                  />
                  <Label 
                    htmlFor={option.value} 
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span className="text-xl">{option.emoji}</span>
                    {option.label}
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || formData.available_equipment.length === 0}
        className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating Workout...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            ⚡ Generate My Workout
          </div>
        )}
      </Button>
    </form>
  );
}
