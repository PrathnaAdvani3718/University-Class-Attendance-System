const mongoose = require('mongoose');

// Genetic Algorithm Parameters
const POPULATION_SIZE = 100;
const MAX_GENERATIONS = 1000;
const MUTATION_RATE = 0.1;
const CROSSOVER_RATE = 0.8;
const TOURNAMENT_SIZE = 5;

class ScheduleOptimizer {
    constructor(resources, timeSlots, days, constraints) {
        this.resources = resources;
        this.timeSlots = timeSlots;
        this.days = days;
        this.constraints = constraints;
        this.historicalData = [];
    }

    // Initialize population
    initializePopulation() {
        const population = [];
        for (let i = 0; i < POPULATION_SIZE; i++) {
            const schedule = this.generateRandomSchedule();
            population.push(schedule);
        }
        return population;
    }

    // Calculate allocation score
    calculateAllocationScore(resource, day, timeSlot) {
        let score = 100;

        // Room capacity score (higher score for better capacity match)
        const capacityRatio = resource.capacity / this.constraints.classSize;
        if (capacityRatio <= 1.2) {
            score += 50; // Perfect or slightly larger room
        } else if (capacityRatio <= 1.5) {
            score += 30; // Moderately larger room
        } else {
            score -= 20; // Too large room
        }

        // Room type match score
        if (this.isResourceTypeMatch(resource, timeSlot)) {
            score += 40;
        } else {
            score -= 100; // Heavy penalty for wrong room type
        }

        // Time slot preference
        if (timeSlot.startTime === "08:30" || timeSlot.startTime === "13:00") {
            score += 20; // Preferred start times
        }

        return score;
    }

    // Generate random schedule
    generateRandomSchedule() {
        const schedule = {
            allocations: [],
            fitness: 0
        };

        // Randomly assign resources to time slots
        this.days.forEach(day => {
            this.timeSlots.forEach(timeSlot => {
                const availableResources = this.getAvailableResources(day, timeSlot);
                if (availableResources.length > 0) {
                    const randomResource = availableResources[Math.floor(Math.random() * availableResources.length)];
                    const score = this.calculateAllocationScore(randomResource, day, timeSlot);
                    schedule.allocations.push({
                        day,
                        timeSlot,
                        resource: randomResource,
                        score
                    });
                }
            });
        });

        schedule.fitness = this.calculateFitness(schedule);
        return schedule;
    }

    // Calculate fitness score for a schedule
    calculateFitness(schedule) {
        let fitness = 0;

        // Room utilization score
        const roomUtilization = this.calculateRoomUtilization(schedule);
        fitness += roomUtilization * 40;

        // Time slot distribution score
        const timeDistribution = this.calculateTimeDistribution(schedule);
        fitness += timeDistribution * 30;

        // Resource type matching score
        const resourceMatching = this.calculateResourceMatching(schedule);
        fitness += resourceMatching * 30;

        // Penalties for constraints
        const constraintPenalties = this.calculateConstraintPenalties(schedule);
        fitness -= constraintPenalties;

        return fitness;
    }

    // Calculate room utilization
    calculateRoomUtilization(schedule) {
        const roomUsage = {};
        schedule.allocations.forEach(allocation => {
            const roomId = allocation.resource._id.toString();
            roomUsage[roomId] = (roomUsage[roomId] || 0) + 1;
        });

        const totalSlots = this.days.length * this.timeSlots.length;
        const utilization = Object.values(roomUsage).reduce((sum, usage) => sum + (usage / totalSlots), 0);
        return utilization / Object.keys(roomUsage).length;
    }

    // Calculate time distribution
    calculateTimeDistribution(schedule) {
        const dayDistribution = {};
        this.days.forEach(day => {
            dayDistribution[day] = schedule.allocations.filter(a => a.day === day).length;
        });

        const mean = Object.values(dayDistribution).reduce((sum, count) => sum + count, 0) / this.days.length;
        const variance = Object.values(dayDistribution).reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / this.days.length;
        return 1 / (1 + Math.sqrt(variance));
    }

    // Calculate resource type matching
    calculateResourceMatching(schedule) {
        let matches = 0;
        schedule.allocations.forEach(allocation => {
            if (this.isResourceTypeMatch(allocation.resource, allocation.timeSlot)) {
                matches++;
            }
        });
        return matches / schedule.allocations.length;
    }

    // Calculate constraint penalties
    calculateConstraintPenalties(schedule) {
        let penalties = 0;

        // Check for conflicts
        const conflicts = this.findConflicts(schedule);
        penalties += conflicts * 100;

        // Check for capacity violations
        const capacityViolations = this.findCapacityViolations(schedule);
        penalties += capacityViolations * 50;

        // Check for time slot violations
        const timeViolations = this.findTimeViolations(schedule);
        penalties += timeViolations * 30;

        return penalties;
    }

    // Tournament selection
    tournamentSelection(population) {
        let best = population[Math.floor(Math.random() * population.length)];
        for (let i = 1; i < TOURNAMENT_SIZE; i++) {
            const candidate = population[Math.floor(Math.random() * population.length)];
            if (candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        return best;
    }

    // Crossover
    crossover(parent1, parent2) {
        const child1 = {
            allocations: [],
            fitness: 0
        };
        const child2 = {
            allocations: [],
            fitness: 0
        };

        // Single-point crossover
        const crossoverPoint = Math.floor(Math.random() * parent1.allocations.length);
        
        child1.allocations = [
            ...parent1.allocations.slice(0, crossoverPoint),
            ...parent2.allocations.slice(crossoverPoint)
        ];
        
        child2.allocations = [
            ...parent2.allocations.slice(0, crossoverPoint),
            ...parent1.allocations.slice(crossoverPoint)
        ];

        child1.fitness = this.calculateFitness(child1);
        child2.fitness = this.calculateFitness(child2);

        return [child1, child2];
    }

    // Mutation
    mutate(schedule) {
        const mutated = { ...schedule };
        
        // If there are no allocations, return the schedule as is
        if (!mutated.allocations || mutated.allocations.length === 0) {
            return mutated;
        }
        
        const mutationPoint = Math.floor(Math.random() * mutated.allocations.length);
        
        // Check if the mutation point is valid
        if (mutationPoint >= mutated.allocations.length || !mutated.allocations[mutationPoint]) {
            return mutated;
        }
        
        if (Math.random() < MUTATION_RATE) {
            // Get the day and timeSlot from the allocation
            const day = mutated.allocations[mutationPoint].day;
            const timeSlot = mutated.allocations[mutationPoint].timeSlot;
            
            // Check if day and timeSlot are valid
            if (!day || !timeSlot) {
                return mutated;
            }
            
            const availableResources = this.getAvailableResources(day, timeSlot);
            if (availableResources.length > 0) {
                mutated.allocations[mutationPoint].resource = 
                    availableResources[Math.floor(Math.random() * availableResources.length)];
                
                // Recalculate the score
                mutated.allocations[mutationPoint].score = 
                    this.calculateAllocationScore(
                        mutated.allocations[mutationPoint].resource, 
                        day, 
                        timeSlot
                    );
            }
        }

        mutated.fitness = this.calculateFitness(mutated);
        return mutated;
    }

    // Evolve population
    evolvePopulation(population) {
        const newPopulation = [];
        
        // Elitism: Keep the best individual
        const bestIndividual = population.reduce((best, current) => 
            current.fitness > best.fitness ? current : best
        );
        newPopulation.push(bestIndividual);

        // Generate new population
        while (newPopulation.length < POPULATION_SIZE) {
            // Select parents
            const parent1 = this.tournamentSelection(population);
            const parent2 = this.tournamentSelection(population);

            // Create children
            let child1, child2;
            if (Math.random() < CROSSOVER_RATE) {
                const children = this.crossover(parent1, parent2);
                child1 = children[0];
                child2 = children[1];
            } else {
                child1 = { ...parent1 };
                child2 = { ...parent2 };
            }

            // Mutate children
            if (Math.random() < MUTATION_RATE) {
                child1 = this.mutate(child1);
            }
            if (Math.random() < MUTATION_RATE) {
                child2 = this.mutate(child2);
            }

            // Add children to new population
            newPopulation.push(child1);
            if (newPopulation.length < POPULATION_SIZE) {
                newPopulation.push(child2);
            }
        }

        return newPopulation;
    }

    // Run genetic algorithm
    optimize() {
        let population = this.initializePopulation();
        let bestSolution = population[0];
        let generation = 0;

        while (generation < MAX_GENERATIONS) {
            population = this.evolvePopulation(population);
            
            const currentBest = population.reduce((best, current) => 
                current.fitness > best.fitness ? current : best
            );

            if (currentBest.fitness > bestSolution.fitness) {
                bestSolution = currentBest;
            }

            generation++;
        }

        return bestSolution;
    }

    // Predictive Analytics
    async predictRoomUtilization(roomId, day, timeSlot) {
        // Instead of historical data, use best and nearest matching
        const prediction = this.calculateBestMatchScore(roomId, day, timeSlot);
        return prediction;
    }

    calculateBestMatchScore(roomId, day, timeSlot) {
        const room = this.resources.find(r => r._id.toString() === roomId.toString());
        if (!room) return 0;

        let score = 0;

        // 1. Room Type Matching (40% weight)
        const typeMatch = this.isResourceTypeMatch(room, timeSlot) ? 1 : 0;
        score += typeMatch * 0.4;

        // 2. Capacity Matching (30% weight)
        const capacityMatch = this.calculateCapacityMatch(room);
        score += capacityMatch * 0.3;

        // 3. Time Slot Preference (20% weight)
        const timePreference = this.calculateTimePreference(day, timeSlot);
        score += timePreference * 0.2;

        // 4. Proximity to Other Classes (10% weight)
        const proximityScore = this.calculateProximityScore(room, day, timeSlot);
        score += proximityScore * 0.1;

        return score;
    }

    calculateCapacityMatch(room) {
        const { classSize } = this.constraints;
        const capacityRatio = room.capacity / classSize;
        
        if (capacityRatio >= 1 && capacityRatio <= 1.2) {
            return 1; // Perfect match
        } else if (capacityRatio >= 0.8 && capacityRatio <= 1.5) {
            return 0.8; // Good match
        } else if (capacityRatio >= 0.6 && capacityRatio <= 2) {
            return 0.6; // Acceptable match
        } else {
            return 0.2; // Poor match
        }
    }

    calculateTimePreference(day, timeSlot) {
        const { preferredTimeSlots } = this.constraints;
        
        // Check if this time slot is in preferred slots
        if (preferredTimeSlots.includes(timeSlot)) {
            return 1;
        }

        // Check for similar time slots (within 1 hour)
        const currentTime = this.parseTimeSlot(timeSlot);
        const similarSlots = preferredTimeSlots.filter(slot => {
            const slotTime = this.parseTimeSlot(slot);
            return Math.abs(slotTime - currentTime) <= 1;
        });

        return similarSlots.length > 0 ? 0.7 : 0.3;
    }

    calculateProximityScore(room, day, timeSlot) {
        // Find other classes in the same department
        const sameDeptRooms = this.resources.filter(r => 
            r.department.toString() === room.department.toString() &&
            r._id.toString() !== room._id.toString()
        );

        if (sameDeptRooms.length === 0) return 0.5;

        // Calculate average distance to other rooms
        const distances = sameDeptRooms.map(otherRoom => {
            return this.calculateRoomDistance(room, otherRoom);
        });

        const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        
        // Normalize score (closer rooms get higher score)
        return 1 - (avgDistance / 100); // Assuming max distance is 100
    }

    parseTimeSlot(timeSlot) {
        // Convert time slot string to hours (e.g., "8:00-9:00" -> 8.5)
        const [start, end] = timeSlot.split('-');
        const startHour = parseFloat(start.split(':')[0]);
        const endHour = parseFloat(end.split(':')[0]);
        return (startHour + endHour) / 2;
    }

    calculateRoomDistance(room1, room2) {
        // Simple distance calculation based on room numbers
        // You can replace this with actual building/floor coordinates
        const num1 = parseInt(room1.name.match(/\d+/)?.[0] || '0');
        const num2 = parseInt(room2.name.match(/\d+/)?.[0] || '0');
        return Math.abs(num1 - num2);
    }

    isResourceTypeMatch(resource, timeSlot) {
        const { subjectType } = this.constraints;
        return resource.type === (subjectType === 'Practical' ? 'Laboratory' : 'Classroom');
    }

    // Find conflicts in the schedule
    findConflicts(schedule) {
        let conflicts = 0;
        const resourceUsage = {};

        schedule.allocations.forEach(allocation => {
            const key = `${allocation.resource._id}-${allocation.day}-${allocation.timeSlot}`;
            if (resourceUsage[key]) {
                conflicts++;
            } else {
                resourceUsage[key] = true;
            }
        });

        return conflicts;
    }

    // Find capacity violations in the schedule
    findCapacityViolations(schedule) {
        let violations = 0;
        schedule.allocations.forEach(allocation => {
            if (allocation.resource.capacity < this.constraints.classSize) {
                violations++;
            }
        });
        return violations;
    }

    // Find time slot violations in the schedule
    findTimeViolations(schedule) {
        let violations = 0;
        const teacherSchedule = {};

        schedule.allocations.forEach(allocation => {
            if (this.constraints.teacherAvailability) {
                const teacherId = this.constraints.teacherAvailability.id;
                const key = `${teacherId}-${allocation.day}-${allocation.timeSlot}`;
                if (teacherSchedule[key]) {
                    violations++;
                } else {
                    teacherSchedule[key] = true;
                }
            }
        });

        return violations;
    }

    // Get available resources for a specific day and time slot
    getAvailableResources(day, timeSlot) {
        return this.resources.filter(resource => {
            // Check if resource is available
            if (resource.status !== 'Available') {
                return false;
            }

            // Check if resource type matches the subject type
            if (!this.isResourceTypeMatch(resource, timeSlot)) {
                return false;
            }

            // Check if resource capacity meets the requirements
            if (resource.capacity < this.constraints.classSize) {
                return false;
            }

            return true;
        });
    }
}

module.exports = ScheduleOptimizer; 