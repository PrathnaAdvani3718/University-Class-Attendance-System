const { v4: uuidv4 } = require('uuid');

class GeneticAlgorithm {
    constructor(config) {
        this.populationSize = config.populationSize || 100;
        this.generations = config.generations || 1000;
        this.mutationRate = config.mutationRate || 0.1;
        this.crossoverRate = config.crossoverRate || 0.8;
        this.elitismCount = config.elitismCount || 2;
        this.subjects = config.subjects;
        this.resources = config.resources;
        this.timeSlots = config.timeSlots;
        this.days = config.days;
        this.constraints = config.constraints;
    }

    // Initialize population
    initializePopulation() {
        const population = [];
        for (let i = 0; i < this.populationSize; i++) {
            population.push(this.createIndividual());
        }
        return population;
    }

    // Create a single individual (timetable)
    createIndividual() {
        const timetable = [];
        const availableSlots = [...this.timeSlots];
        const availableResources = [...this.resources];
        
        // Create a schedule for each day
        for (const day of this.days) {
            const daySchedule = {
                day,
                slots: []
            };

            // Create slots for each time slot
            for (const timeSlot of this.timeSlots) {
                const slot = {
                    timeSlot,
                    subject: null,
                    teacher: null,
                    room: null,
                    isEditable: true
                };

                // Randomly assign a subject if available
                if (this.subjects.length > 0 && Math.random() > 0.5) {
                    const randomSubject = this.subjects[Math.floor(Math.random() * this.subjects.length)];
                    const suitableRooms = this.findSuitableRooms(randomSubject, availableResources);
                    
                    if (suitableRooms.length > 0) {
                        const randomRoom = suitableRooms[Math.floor(Math.random() * suitableRooms.length)];
                        slot.subject = randomSubject;
                        slot.room = randomRoom;
                        slot.teacher = randomSubject.teacher;
                    }
                }

                daySchedule.slots.push(slot);
            }

            timetable.push(daySchedule);
        }

        return {
            id: uuidv4(),
            timetable,
            fitness: 0
        };
    }

    // Find suitable rooms for a subject
    findSuitableRooms(subject, availableResources) {
        return availableResources.filter(room => {
            // Check capacity
            if (room.capacity < subject.requiredCapacity) return false;
            
            // Check equipment requirements
            if (subject.requiredEquipment && subject.requiredEquipment.length > 0) {
                return subject.requiredEquipment.every(equipment => 
                    room.equipment.some(e => e.name === equipment)
                );
            }
            
            return true;
        });
    }

    // Calculate fitness of an individual
    calculateFitness(individual) {
        let fitness = 0;
        const timetable = individual.timetable;
        const subjectAssignments = new Map();
        
        // Track subject assignments
        for (const daySchedule of timetable) {
            for (const slot of daySchedule.slots) {
                if (slot.subject) {
                    const subjectName = slot.subject.subName;
                    if (!subjectAssignments.has(subjectName)) {
                        subjectAssignments.set(subjectName, 0);
                    }
                    subjectAssignments.set(subjectName, subjectAssignments.get(subjectName) + 1);
                }
            }
        }

        // Check if all subjects are assigned required number of times
        for (const subject of this.subjects) {
            const requiredAssignments = subject.creditHours >= 3 ? 2 : 1;
            const actualAssignments = subjectAssignments.get(subject.subName) || 0;
            
            if (actualAssignments === requiredAssignments) {
                fitness += 10;
            } else {
                fitness -= Math.abs(requiredAssignments - actualAssignments) * 5;
            }
        }

        // Check for teacher conflicts
        const teacherSchedule = new Map();
        for (const daySchedule of timetable) {
            for (const slot of daySchedule.slots) {
                if (slot.teacher) {
                    const key = `${daySchedule.day}-${slot.timeSlot}-${slot.teacher.id}`;
                    if (teacherSchedule.has(key)) {
                        fitness -= 20; // Penalize teacher conflicts
                    } else {
                        teacherSchedule.set(key, true);
                    }
                }
            }
        }

        // Check for room conflicts
        const roomSchedule = new Map();
        for (const daySchedule of timetable) {
            for (const slot of daySchedule.slots) {
                if (slot.room) {
                    const key = `${daySchedule.day}-${slot.timeSlot}-${slot.room.roomName}`;
                    if (roomSchedule.has(key)) {
                        fitness -= 15; // Penalize room conflicts
                    } else {
                        roomSchedule.set(key, true);
                    }
                }
            }
        }

        // Check for consecutive classes
        for (const daySchedule of timetable) {
            for (let i = 0; i < daySchedule.slots.length - 1; i++) {
                const currentSlot = daySchedule.slots[i];
                const nextSlot = daySchedule.slots[i + 1];
                
                if (currentSlot.subject && nextSlot.subject) {
                    if (currentSlot.subject.subName === nextSlot.subject.subName) {
                        fitness -= 10; // Penalize consecutive same subject
                    }
                }
            }
        }

        individual.fitness = fitness;
        return fitness;
    }

    // Selection using tournament selection
    selection(population) {
        const tournamentSize = 5;
        const selected = [];
        
        while (selected.length < this.populationSize) {
            const tournament = [];
            for (let i = 0; i < tournamentSize; i++) {
                const randomIndex = Math.floor(Math.random() * population.length);
                tournament.push(population[randomIndex]);
            }
            
            tournament.sort((a, b) => b.fitness - a.fitness);
            selected.push(tournament[0]);
        }
        
        return selected;
    }

    // Crossover between two parents
    crossover(parent1, parent2) {
        if (Math.random() > this.crossoverRate) {
            return [parent1, parent2];
        }

        const child1 = this.createIndividual();
        const child2 = this.createIndividual();

        // Perform uniform crossover
        for (let dayIndex = 0; dayIndex < this.days.length; dayIndex++) {
            for (let slotIndex = 0; slotIndex < this.timeSlots.length; slotIndex++) {
                if (Math.random() < 0.5) {
                    child1.timetable[dayIndex].slots[slotIndex] = parent1.timetable[dayIndex].slots[slotIndex];
                    child2.timetable[dayIndex].slots[slotIndex] = parent2.timetable[dayIndex].slots[slotIndex];
                } else {
                    child1.timetable[dayIndex].slots[slotIndex] = parent2.timetable[dayIndex].slots[slotIndex];
                    child2.timetable[dayIndex].slots[slotIndex] = parent1.timetable[dayIndex].slots[slotIndex];
                }
            }
        }

        return [child1, child2];
    }

    // Mutation of an individual
    mutate(individual) {
        if (Math.random() > this.mutationRate) {
            return individual;
        }

        const mutated = JSON.parse(JSON.stringify(individual));
        
        // Randomly select a day and time slot
        const dayIndex = Math.floor(Math.random() * this.days.length);
        const slotIndex = Math.floor(Math.random() * this.timeSlots.length);
        
        // Randomly decide to clear or assign a subject
        if (Math.random() < 0.5) {
            // Clear the slot
            mutated.timetable[dayIndex].slots[slotIndex] = {
                timeSlot: this.timeSlots[slotIndex],
                subject: null,
                teacher: null,
                room: null,
                isEditable: true
            };
        } else {
            // Assign a random subject
            const randomSubject = this.subjects[Math.floor(Math.random() * this.subjects.length)];
            const suitableRooms = this.findSuitableRooms(randomSubject, this.resources);
            
            if (suitableRooms.length > 0) {
                const randomRoom = suitableRooms[Math.floor(Math.random() * suitableRooms.length)];
                mutated.timetable[dayIndex].slots[slotIndex] = {
                    timeSlot: this.timeSlots[slotIndex],
                    subject: randomSubject,
                    teacher: randomSubject.teacher,
                    room: randomRoom,
                    isEditable: true
                };
            }
        }

        return mutated;
    }

    // Run the genetic algorithm
    run() {
        let population = this.initializePopulation();
        let bestIndividual = null;
        let bestFitness = -Infinity;

        for (let generation = 0; generation < this.generations; generation++) {
            // Calculate fitness for all individuals
            population.forEach(individual => this.calculateFitness(individual));

            // Sort population by fitness
            population.sort((a, b) => b.fitness - a.fitness);

            // Update best individual
            if (population[0].fitness > bestFitness) {
                bestFitness = population[0].fitness;
                bestIndividual = JSON.parse(JSON.stringify(population[0]));
            }

            // Create new population
            const newPopulation = [];

            // Elitism: Keep the best individuals
            for (let i = 0; i < this.elitismCount; i++) {
                newPopulation.push(population[i]);
            }

            // Fill the rest of the population
            while (newPopulation.length < this.populationSize) {
                // Selection
                const selected = this.selection(population);

                // Crossover
                const [child1, child2] = this.crossover(
                    selected[Math.floor(Math.random() * selected.length)],
                    selected[Math.floor(Math.random() * selected.length)]
                );

                // Mutation
                newPopulation.push(this.mutate(child1));
                if (newPopulation.length < this.populationSize) {
                    newPopulation.push(this.mutate(child2));
                }
            }

            population = newPopulation;

            // Log progress
            if (generation % 100 === 0) {
                console.log(`Generation ${generation}: Best Fitness = ${bestFitness}`);
            }
        }

        return bestIndividual;
    }
}

module.exports = GeneticAlgorithm; 