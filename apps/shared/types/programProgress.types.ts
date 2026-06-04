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