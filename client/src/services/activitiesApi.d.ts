import { Activity, ActivityResponse } from '../types';

export interface ActivitiesService {
  getAll(): Promise<ActivityResponse>;
  getByUser(userId: string | number): Promise<ActivityResponse>;
  get(id: string | number): Promise<Activity>;
  create(activity: Partial<Activity>): Promise<Activity>;
  update(id: string | number, updates: Partial<Activity>): Promise<Activity>;
  delete(id: string | number): Promise<Activity>;
  like?(id: string | number): Promise<Activity>;
}

export const activitiesService: ActivitiesService;
