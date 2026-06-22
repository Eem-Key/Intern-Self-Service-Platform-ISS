import type { 
    InternshipStatus,
    InternPosition
} from './enums.types';

export type Intern = {
    id: string;
    university: string;
    year_level: number;
    program: string;
    required_hours: number;
    start_date: string;
    status: InternshipStatus
    is_deleted: boolean;
    intern_position: InternPosition;
};

export type InternInsert = Omit<Intern, 'id'>;

export type InternUpdate = Partial<InternInsert>;

export type InternInfo = Omit<
    Intern, 
    'id' |
    // 'university' |
    // 'year_level' |
    // 'program' |
    // 'required_hours' |
    // 'start_date' |
    'status' |
    'is_deleted' |
    'intern_position'
>;

export type ProgramProgress = {
    required_hours: number;
    rendered_hours: number;
    hours_left: number;
    wfh_hours: number;
    onsite_hours: number;
};

export type ProgramProgressResponse = {
    message: string;
    data: ProgramProgress;
};