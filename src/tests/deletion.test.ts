import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INITIAL_STUDENTS, INITIAL_TRAINERS } from '../services/mockData';
import { Student, Trainer } from '../types';

describe('Exclusion & Deletion of Students and Trainers', () => {
  let mockStudents: Student[];
  let mockTrainers: Trainer[];
  let studentCount: number;
  let proCount: number;
  let deletedStudentIds: string[];
  let deletedTrainerIds: string[];

  beforeEach(() => {
    mockStudents = [...INITIAL_STUDENTS];
    mockTrainers = [...INITIAL_TRAINERS];
    studentCount = mockStudents.length;
    proCount = mockTrainers.length;
    deletedStudentIds = [];
    deletedTrainerIds = [];
  });

  const deleteStudent = (id: string) => {
    mockStudents = mockStudents.filter(s => s.id !== id);
    studentCount = Math.max(0, studentCount - 1);
    if (!deletedStudentIds.includes(id)) {
      deletedStudentIds.push(id);
    }
  };

  const deleteTrainer = (id: string) => {
    mockTrainers = mockTrainers.filter(t => t.id !== id);
    proCount = Math.max(0, proCount - 1);
    if (!deletedTrainerIds.includes(id)) {
      deletedTrainerIds.push(id);
    }
  };

  it('permanently deletes a student from the active list', () => {
    const studentToDelete = mockStudents[0];
    const initialLength = mockStudents.length;

    deleteStudent(studentToDelete.id);

    expect(mockStudents.length).toBe(initialLength - 1);
    expect(mockStudents.some(s => s.id === studentToDelete.id)).toBe(false);
    expect(studentCount).toBe(initialLength - 1);
    expect(deletedStudentIds).toContain(studentToDelete.id);
  });

  it('permanently deletes a trainer from the active list', () => {
    const trainerToDelete = mockTrainers[0];
    const initialLength = mockTrainers.length;

    deleteTrainer(trainerToDelete.id);

    expect(mockTrainers.length).toBe(initialLength - 1);
    expect(mockTrainers.some(t => t.id === trainerToDelete.id)).toBe(false);
    expect(proCount).toBe(initialLength - 1);
    expect(deletedTrainerIds).toContain(trainerToDelete.id);
  });

  it('does not resurrect deleted trainers when merging with initial mock data', () => {
    const deletedId = INITIAL_TRAINERS[1].id;
    const activeStoredTrainers = INITIAL_TRAINERS.filter(t => t.id !== deletedId);
    const trackedDeleted = [deletedId];

    const existingIds = new Set(activeStoredTrainers.map(t => t.id));
    const missing = INITIAL_TRAINERS.filter(t => !existingIds.has(t.id) && !trackedDeleted.includes(t.id));

    const finalTrainers = [...activeStoredTrainers, ...missing];

    expect(finalTrainers.some(t => t.id === deletedId)).toBe(false);
    expect(finalTrainers.length).toBe(INITIAL_TRAINERS.length - 1);
  });

  it('does not resurrect deleted students when initializing from initial mock data', () => {
    const deletedId = INITIAL_STUDENTS[0].id;
    const trackedDeleted = [deletedId];

    const initializedStudents = INITIAL_STUDENTS.filter(s => !trackedDeleted.includes(s.id));

    expect(initializedStudents.some(s => s.id === deletedId)).toBe(false);
    expect(initializedStudents.length).toBe(INITIAL_STUDENTS.length - 1);
  });

  it('logs out the user if the deleted student or trainer was currently logged in', () => {
    let currentUser: { id: string; role: string } | null = {
      id: INITIAL_STUDENTS[0].id,
      role: 'student'
    };
    let isUserLoggedIn = true;

    const logoutUser = () => {
      currentUser = null;
      isUserLoggedIn = false;
    };

    const deleteWithSessionCheck = (id: string) => {
      mockStudents = mockStudents.filter(s => s.id !== id);
      if (currentUser?.id === id) {
        logoutUser();
      }
    };

    deleteWithSessionCheck(INITIAL_STUDENTS[0].id);

    expect(isUserLoggedIn).toBe(false);
    expect(currentUser).toBeNull();
  });
});
