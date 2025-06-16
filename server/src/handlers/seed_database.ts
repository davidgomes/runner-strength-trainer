import { db } from '../db';
import { exercisesTable } from '../db/schema';

const seedExercises = [
  // Lower Body Exercises
  {
    name: 'Squats',
    muscle_group: 'Legs',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Stand with feet shoulder-width apart\n2. Lower your body by bending knees and hips\n3. Keep chest up and knees aligned with toes\n4. Lower until thighs are parallel to ground\n5. Push through heels to return to starting position',
    runner_benefit: 'Builds quadriceps, glutes, and core strength essential for powerful running stride and injury prevention'
  },
  {
    name: 'Goblet Squats',
    muscle_group: 'Legs',
    equipment_needed: ['dumbbells', 'kettlebells'],
    instructions: '1. Hold a dumbbell or kettlebell at chest level\n2. Stand with feet slightly wider than shoulder-width\n3. Squat down keeping chest up and elbows inside knees\n4. Push through heels to return to start\n5. Keep weight close to body throughout movement',
    runner_benefit: 'Strengthens legs while improving mobility and core stability for better running posture'
  },
  {
    name: 'Single-Leg Deadlifts',
    muscle_group: 'Legs',
    equipment_needed: ['dumbbells', 'bodyweight_only'],
    instructions: '1. Stand on one leg with slight bend in knee\n2. Hinge at hip, reaching opposite hand toward ground\n3. Keep back straight and lift non-standing leg behind you\n4. Return to upright position with control\n5. Complete all reps before switching legs',
    runner_benefit: 'Develops unilateral strength, balance, and posterior chain power crucial for running efficiency'
  },
  {
    name: 'Bulgarian Split Squats',
    muscle_group: 'Legs',
    equipment_needed: ['bench', 'dumbbells'],
    instructions: '1. Stand 2-3 feet in front of bench, place rear foot on bench\n2. Lower body until front thigh is parallel to ground\n3. Keep most weight on front leg\n4. Push through front heel to return to start\n5. Complete all reps before switching legs',
    runner_benefit: 'Builds single-leg strength and addresses muscle imbalances common in runners'
  },
  {
    name: 'Calf Raises',
    muscle_group: 'Calves',
    equipment_needed: ['bodyweight_only', 'dumbbells'],
    instructions: '1. Stand with balls of feet on elevated surface\n2. Let heels drop below level of toes\n3. Rise up on toes as high as possible\n4. Lower with control to starting position\n5. Keep legs straight throughout movement',
    runner_benefit: 'Strengthens calf muscles for better push-off power and Achilles tendon health'
  },
  
  // Upper Body Exercises
  {
    name: 'Push-ups',
    muscle_group: 'Chest',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Start in plank position with hands slightly wider than shoulders\n2. Lower body until chest nearly touches ground\n3. Keep body in straight line from head to heels\n4. Push back to starting position\n5. Engage core throughout movement',
    runner_benefit: 'Builds upper body and core strength for better arm swing and posture during long runs'
  },
  {
    name: 'Dumbbell Rows',
    muscle_group: 'Back',
    equipment_needed: ['dumbbells', 'bench'],
    instructions: '1. Place one knee and hand on bench for support\n2. Hold dumbbell in opposite hand with arm extended\n3. Pull dumbbell to side of torso, squeezing shoulder blade\n4. Lower weight with control\n5. Complete all reps before switching sides',
    runner_benefit: 'Strengthens upper back and rear delts to counteract forward head posture from running'
  },
  {
    name: 'Overhead Press',
    muscle_group: 'Shoulders',
    equipment_needed: ['dumbbells', 'barbell'],
    instructions: '1. Stand with feet shoulder-width apart\n2. Hold weights at shoulder height with palms facing forward\n3. Press weights straight up until arms are fully extended\n4. Lower weights back to shoulder height with control\n5. Keep core engaged throughout movement',
    runner_benefit: 'Develops shoulder stability and strength for efficient arm swing mechanics'
  },
  {
    name: 'Pull-ups',
    muscle_group: 'Back',
    equipment_needed: ['pull_up_bar'],
    instructions: '1. Hang from pull-up bar with palms facing away\n2. Pull body up until chin clears the bar\n3. Focus on squeezing shoulder blades together\n4. Lower body with control to full arm extension\n5. Avoid swinging or using momentum',
    runner_benefit: 'Builds lat strength and grip endurance while improving overall upper body power'
  },
  
  // Core Exercises
  {
    name: 'Plank',
    muscle_group: 'Core',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Start in push-up position on forearms\n2. Keep body in straight line from head to heels\n3. Engage core and glutes\n4. Breathe normally while holding position\n5. Avoid sagging hips or raising butt',
    runner_benefit: 'Develops core stability and endurance essential for maintaining proper running form over distance'
  },
  {
    name: 'Russian Twists',
    muscle_group: 'Core',
    equipment_needed: ['bodyweight_only', 'dumbbells'],
    instructions: '1. Sit with knees bent and feet slightly off ground\n2. Lean back to create V-shape with torso and thighs\n3. Rotate torso left and right, touching ground beside hips\n4. Keep chest up and core engaged\n5. Add weight for increased difficulty',
    runner_benefit: 'Strengthens obliques and rotational core stability for better torso control while running'
  },
  {
    name: 'Dead Bug',
    muscle_group: 'Core',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Lie on back with arms extended toward ceiling\n2. Bring knees to 90-degree angle over hips\n3. Slowly extend opposite arm and leg away from body\n4. Return to starting position with control\n5. Alternate sides while keeping core engaged',
    runner_benefit: 'Improves core stability and coordination while teaching proper hip and shoulder dissociation'
  },
  {
    name: 'Mountain Climbers',
    muscle_group: 'Core',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Start in push-up position\n2. Bring one knee toward chest while keeping other leg extended\n3. Quickly switch leg positions\n4. Continue alternating legs at rapid pace\n5. Keep hips level and core tight',
    runner_benefit: 'Builds core strength while improving cardiovascular fitness and running-specific movement patterns'
  },
  
  // Glute-Specific Exercises
  {
    name: 'Glute Bridges',
    muscle_group: 'Glutes',
    equipment_needed: ['bodyweight_only', 'dumbbells'],
    instructions: '1. Lie on back with knees bent and feet flat on ground\n2. Squeeze glutes and lift hips toward ceiling\n3. Create straight line from knees to shoulders\n4. Hold briefly at top, then lower with control\n5. Focus on glute activation, not just hip height',
    runner_benefit: 'Activates and strengthens glutes for better hip extension power and reduced knee stress'
  },
  {
    name: 'Lateral Lunges',
    muscle_group: 'Legs',
    equipment_needed: ['bodyweight_only', 'dumbbells'],
    instructions: '1. Stand with feet together\n2. Step wide to one side, bending that knee\n3. Keep other leg straight and chest up\n4. Push off bent leg to return to center\n5. Alternate sides or complete all reps on one side first',
    runner_benefit: 'Strengthens glutes and improves lateral stability to prevent IT band issues and improve running efficiency'
  },
  
  // Full Body/Functional Exercises
  {
    name: 'Burpees',
    muscle_group: 'Full Body',
    equipment_needed: ['bodyweight_only'],
    instructions: '1. Start standing, drop into squat position\n2. Place hands on ground and jump feet back to plank\n3. Perform push-up (optional)\n4. Jump feet back to squat position\n5. Jump up with arms overhead to complete one rep',
    runner_benefit: 'Builds total-body strength and cardiovascular endurance while improving explosive power'
  },
  {
    name: 'Kettlebell Swings',
    muscle_group: 'Full Body',
    equipment_needed: ['kettlebells'],
    instructions: '1. Stand with feet wider than shoulder-width, hold kettlebell with both hands\n2. Hinge at hips and swing kettlebell between legs\n3. Drive hips forward explosively to swing kettlebell to chest height\n4. Let kettlebell fall naturally while hinging at hips\n5. Keep core engaged and back straight throughout',
    runner_benefit: 'Develops explosive hip extension and posterior chain power crucial for running speed and efficiency'
  },
  {
    name: 'Step-ups',
    muscle_group: 'Legs',
    equipment_needed: ['bench', 'dumbbells'],
    instructions: '1. Stand facing bench or step\n2. Step up with one foot, placing entire foot on surface\n3. Drive through heel to lift body up\n4. Step down with control\n5. Complete all reps on one leg before switching',
    runner_benefit: 'Builds unilateral leg strength and power transfer similar to running stride mechanics'
  }
];

export const seedDatabase = async (): Promise<{ message: string; count: number }> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercisesTable).limit(1);
    
    if (existingExercises.length > 0) {
      console.log('✅ Database already seeded, skipping...');
      return { message: 'Database already seeded', count: 0 };
    }
    
    // Insert seed data
    const result = await db.insert(exercisesTable)
      .values(seedExercises)
      .returning({ id: exercisesTable.id, name: exercisesTable.name });
    
    console.log(`✅ Successfully seeded ${result.length} exercises:`);
    result.forEach((exercise, index) => {
      console.log(`   ${index + 1}. ${exercise.name} (ID: ${exercise.id})`);
    });
    
    return { message: 'Database seeded successfully', count: result.length };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};