import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import AdminSidebar from '../AdminSidebar';
import RequiredMark from '../../components/ui/RequiredMark';

import {
    USER_GENDER_VALUES,
    type CompanyDepartment,
    type UserGender,
    type JobPosition,
    type OfficeLocation,
    type InternPosition,
} from '../../../../shared/types/enums.types';

import type { ProfileInternInsert } from '../../../../shared/types/profile.types';

import {
    useInviteInternAPIMutation,
    useResendInviteInternAPIMutation,
} from '../../api/admin/admin.interns.use';

import { validateInternEmailBeforeCreate } from '../../utils/validateIntern';

const FORM_CARD_CLASS =
    'mx-auto flex min-h-[360px] w-full max-w-[760px] flex-col rounded-xl bg-white px-8 py-8 shadow-md';

const ACTION_ROW_CLASS =
    'mx-auto flex w-full max-w-[760px] items-center justify-between gap-4';
    
const steps = ['Personal Info', 'Academic', 'Internship', 'Review', 'Result'];

const COMPANY_DEPARTMENT_OPTIONS: {
    label: string;
    value: CompanyDepartment;
}[] = [
    { label: 'ISS', value: 'ISS' },
    { label: 'SDS', value: 'SDS' },
];

const OFFICE_LOCATION_OPTIONS: {
    label: string;
    value: OfficeLocation;
}[] = [
    { label: 'Binondo', value: 'binondo' },
    { label: 'Makati', value: 'makati' },
];

const INTERN_POSITION_OPTIONS: {
    label: string;
    value: InternPosition;
}[] = [
    { label: 'Quality Assurance', value: 'quality_assurance' },
    { label: 'Front-end Developer', value: 'frontend_developer' },
    { label: 'Back-end Developer', value: 'backend_developer' },
    { label: 'Business Analyst', value: 'business_analyst' },
];

const INTERN_TO_JOB_POSITION: Record<InternPosition, JobPosition> = {
    quality_assurance: 'Quality Assurance',
    frontend_developer: 'Front-end Developer',
    backend_developer: 'Back-end Developer',
    business_analyst: 'Business Analyst',
};

function formatInternPosition(value: string) {
    return (
        INTERN_POSITION_OPTIONS.find((option) => option.value === value)
            ?.label || '--'
    );
}

type FormValues = {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    birth_date: string;
    gender: UserGender | '';
    email: string;
    contact_number: string;
    address: string;

    year_level: string;
    program: string;
    university: string;

    department: CompanyDepartment | '';
    office: OfficeLocation | '';
    required_hours: string;
    start_date: string;
    intern_position: InternPosition | '';
};

const initialFormValues: FormValues = {
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    birth_date: '',
    gender: '',
    email: '',
    contact_number: '',
    address: '',

    year_level: '',
    program: '',
    university: '',

    department: '',
    office: '',
    required_hours: '',
    start_date: '',
    intern_position: '',
};


const ADD_INTERN_DRAFT_KEY = 'admin-add-intern-draft';

type AddInternDraft = {
    currentStep: number;
    maxVisitedStep: number;
    formValues: FormValues;
};

function getSavedDraft(): AddInternDraft | null {
    const savedDraft = sessionStorage.getItem(ADD_INTERN_DRAFT_KEY);

    if (!savedDraft) return null;

    try {
        return JSON.parse(savedDraft) as AddInternDraft;
    } catch {
        return null;
    }
}

function AdminAddIntern() {
    const navigate = useNavigate();

    
    const [creationStatus, setCreationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const savedDraft = getSavedDraft();

    const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
    const [maxVisitedStep, setMaxVisitedStep] = useState(
    savedDraft?.maxVisitedStep || 1
    );
    const [formValues, setFormValues] = useState<FormValues>(
    savedDraft?.formValues || initialFormValues
    );

    const [resultData, setResultData] = useState<{
    fullName: string;
    department: string;
    email: string;
    reason?: string;
    } | null>(null);

    useEffect(() => {
        document.title = 'Add Intern | Intern Self Service';
    }, []);

    useEffect(() => {
    if (creationStatus !== 'idle') return;

    sessionStorage.setItem(
        ADD_INTERN_DRAFT_KEY,
        JSON.stringify({
        currentStep,
        maxVisitedStep,
        formValues,
        })
    );
    }, [currentStep, maxVisitedStep, formValues, creationStatus]);

    const handleChange = (field: keyof FormValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const resetProcess = () => {
        sessionStorage.removeItem(ADD_INTERN_DRAFT_KEY);

        setCurrentStep(1);
        setMaxVisitedStep(1);
        setCreationStatus('idle');
        setFormValues(initialFormValues);
        setFieldErrors({});
        setOpenDropdown(null);
        setResultData(null);
    };

    const validateStep = () => {
        const stepFields: Record<number, (keyof FormValues)[]> = {
        1: [
            'first_name',
            'last_name',
            'birth_date',
            'gender',
            'email',
            'contact_number',
            'address',
        ],
        2: ['year_level', 'program', 'university'],
        3: [
            'intern_position',
            'department',
            'office',
            'required_hours',
            'start_date',
        ],
        4: [],
        5: [],
        };

    const newErrors: Partial<Record<keyof FormValues, string>> = {};

        stepFields[currentStep].forEach((field) => {
        if (!String(formValues[field] ?? '').trim()) {
            newErrors[field] = 'This field is required.';
        }
        });

        setFieldErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMaxVisitedStep((prev) => Math.max(prev, nextStep));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleStepClick = (stepNumber: number) => {
        if (stepNumber === 5 && creationStatus === 'idle') {
            return;
        }

        if (stepNumber <= maxVisitedStep) {
            setCurrentStep(stepNumber);
        }
    };

    const handleCancel = () => {
        resetProcess();
        navigate('/admin/interns', { replace: true });
    };

    const inviteInternMutation = useInviteInternAPIMutation();
        const resendInviteMutation = useResendInviteInternAPIMutation();

    const fullName = [
        formValues.first_name,
        formValues.middle_name,
        formValues.last_name,
        formValues.suffix,
    ]
        .filter(Boolean)
        .join(' ');

    const buildInternPayload = (): ProfileInternInsert => ({
        email: formValues.email,
        first_name: formValues.first_name,
        middle_name: formValues.middle_name,
        last_name: formValues.last_name,
        suffix: formValues.suffix,

        role: 'intern',
        position: INTERN_TO_JOB_POSITION[
            formValues.intern_position as InternPosition
        ],
        department: formValues.department as CompanyDepartment,
        office: formValues.office as OfficeLocation,

        birth_date: formValues.birth_date,
        gender: formValues.gender as UserGender,
        contact_number: formValues.contact_number,
        address: formValues.address,

        university: formValues.university,
        year_level: Number(formValues.year_level),
        program: formValues.program,
        required_hours: Number(formValues.required_hours),
        start_date: formValues.start_date,
        intern_position: formValues.intern_position as InternPosition,
    });

    const handleCreateIntern = async () => {
    if (!validateStep()) return;

    const emailValidation = await validateInternEmailBeforeCreate(
        formValues.email
    );

    if (!emailValidation.isValid) {
        setResultData({
            fullName: fullName || '[Intern Name]',
            department: formValues.department || '[Department]',
            email: formValues.email,
            reason:
                emailValidation.message ===
                'Email address already exists in the system.'
                    ? 'Email address already exists in the system.'
                    : 'We could not create the intern profile at this time. Please review the information and try again.',
        });

        setCreationStatus('failed');
        setCurrentStep(5);
        setMaxVisitedStep(5);
        return;
    }

    const payload = buildInternPayload();

    inviteInternMutation.mutate(payload, {
        onSuccess: () => {
            const createdIntern = {
                fullName: fullName || '[Intern Name]',
                department: formValues.department || '[Department]',
                email: formValues.email,
            };

            sessionStorage.removeItem(ADD_INTERN_DRAFT_KEY);

            setResultData(createdIntern);
            setCreationStatus('success');
            setCurrentStep(5);
            setMaxVisitedStep(5);
        },

        onError: () => {
            setResultData({
                fullName: fullName || '[Intern Name]',
                department: formValues.department || '[Department]',
                email: formValues.email,
                reason:
                    'We could not create the intern profile at this time. Please review the information and try again.',
            });

            setCreationStatus('failed');
            setCurrentStep(5);
            setMaxVisitedStep(5);
        },
    });

    console.log('CREATE INTERN PAYLOAD:', payload);
};

    const handleResendActivationLink = () => {
    if (!resultData?.email) return;

    resendInviteMutation.mutate(resultData.email);
    };

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col gap-6">
            <AddInternBanner />

            <StepTracker
                currentStep={currentStep}
                maxVisitedStep={maxVisitedStep}
                onStepClick={handleStepClick}
            />

            

            {creationStatus === 'idle' && (
                <>
                <div className="mx-auto flex min-h-[380px] w-full max-w-[760px] flex-col rounded-xl bg-white px-8 py-8 shadow-md">
                    {currentStep === 1 && (
                        <StepCard title="Personal Information">
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <FormField
                                    label="First Name"
                                    value={formValues.first_name}
                                    required
                                    error={fieldErrors.first_name}
                                    onChange={(value) =>
                                        handleChange('first_name', value)
                                    }
                                />

                                <FormField
                                    label="Middle Name"
                                    value={formValues.middle_name}
                                    error={fieldErrors.middle_name}
                                    onChange={(value) =>
                                        handleChange('middle_name', value)
                                    }
                                />

                                <FormField
                                    label="Last Name"
                                    value={formValues.last_name}
                                    required
                                    error={fieldErrors.last_name}
                                    onChange={(value) =>
                                        handleChange('last_name', value)
                                    }
                                />

                                <FormField
                                    label="Birthdate"
                                    type="date"
                                    value={formValues.birth_date}
                                    required
                                    error={fieldErrors.birth_date}
                                    onChange={(value) =>
                                        handleChange('birth_date', value)
                                    }
                                />

                                <DropdownField
                                    label="Gender"
                                    value={formValues.gender}
                                    required
                                    error={fieldErrors.gender}
                                    isOpen={openDropdown === 'gender'}
                                    placeholder="Select gender"
                                    options={USER_GENDER_VALUES.map((gender) => ({
                                        label: formatGenderLabel(gender),
                                        value: gender,
                                    }))}
                                    onToggle={() =>
                                        setOpenDropdown(
                                            openDropdown === 'gender' ? null : 'gender'
                                        )
                                    }
                                    onSelect={(value) => {
                                        handleChange('gender', value);
                                        setOpenDropdown(null);
                                    }}
                                />

                                <FormField
                                    label="Suffix"
                                    value={formValues.suffix}
                                    error={fieldErrors.suffix}
                                    onChange={(value) =>
                                        handleChange('suffix', value)
                                    }
                                />

                                <div className="col-span-2">
                                    <FormField
                                        label="Email"
                                        value={formValues.email}
                                        required
                                        error={fieldErrors.email}
                                        onChange={(value) =>
                                            handleChange('email', value)
                                        }
                                    />
                                </div>

                                <FormField
                                    label="Contact Number"
                                    value={formValues.contact_number}
                                    required
                                    error={fieldErrors.contact_number}
                                    onChange={(value) =>
                                        handleChange('contact_number', value)
                                    }
                                />

                                <div className="col-span-3">
                                    <FormField
                                        label="Address"
                                        value={formValues.address}
                                        required
                                        error={fieldErrors.address}
                                        onChange={(value) =>
                                            handleChange('address', value)
                                        }
                                    />
                                </div>
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 2 && (
                        <StepCard title="Academics">
                            <div className="grid grid-cols-[0.45fr_1fr] gap-2 sm:gap-3">
                                <FormField
                                    label="Year Level"
                                    value={formValues.year_level}
                                    required
                                    error={fieldErrors.year_level}
                                    onChange={(value) =>
                                        handleChange('year_level', value)
                                    }
                                />

                                <FormField
                                    label="Program"
                                    value={formValues.program}
                                    required
                                    error={fieldErrors.program}
                                    onChange={(value) =>
                                        handleChange('program', value)
                                    }
                                />

                                <div className="col-span-2">
                                    <FormField
                                        label="Educational Institution"
                                        value={formValues.university}
                                        required
                                        error={fieldErrors.university}
                                        onChange={(value) =>
                                            handleChange('university', value)
                                        }
                                    />
                                </div>
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 3 && (
                        <StepCard title="Internship Information">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <DropdownField
                                    label="Position"
                                    value={formValues.intern_position}
                                    required
                                    error={fieldErrors.intern_position}
                                    isOpen={openDropdown === 'intern_position'}
                                    placeholder="Select position"
                                    options={INTERN_POSITION_OPTIONS}
                                    onToggle={() =>
                                        setOpenDropdown(
                                            openDropdown === 'intern_position'
                                                ? null
                                                : 'intern_position'
                                        )
                                    }
                                    onSelect={(value) => {
                                        handleChange('intern_position', value);
                                        setOpenDropdown(null);
                                    }}
                                />

                                <DropdownField
                                    label="Department"
                                    value={formValues.department}
                                    required
                                    error={fieldErrors.department}
                                    isOpen={openDropdown === 'department'}
                                    placeholder="Select department"
                                    options={COMPANY_DEPARTMENT_OPTIONS}
                                    onToggle={() =>
                                        setOpenDropdown(
                                            openDropdown === 'department'
                                                ? null
                                                : 'department'
                                        )
                                    }
                                    onSelect={(value) => {
                                        handleChange('department', value);
                                        setOpenDropdown(null);
                                    }}
                                />

                                <FormField
                                    label="Required Hours"
                                    value={formValues.required_hours}
                                    required
                                    error={fieldErrors.required_hours}
                                    onChange={(value) =>
                                        handleChange('required_hours', value)
                                    }
                                />

                                <DropdownField
                                    label="Office"
                                    value={formValues.office}
                                    required
                                    error={fieldErrors.office}
                                    isOpen={openDropdown === 'office'}
                                    placeholder="Select office"
                                    options={OFFICE_LOCATION_OPTIONS}
                                    onToggle={() =>
                                        setOpenDropdown(
                                            openDropdown === 'office'
                                                ? null
                                                : 'office'
                                        )
                                    }
                                    onSelect={(value) => {
                                        handleChange('office', value);
                                        setOpenDropdown(null);
                                    }}
                                />

                                <FormField
                                    label="Start Date"
                                    type="date"
                                    value={formValues.start_date}
                                    required
                                    error={fieldErrors.start_date}
                                    onChange={(value) =>
                                        handleChange('start_date', value)
                                    }
                                />
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 4 && (
                        <div className="h-full space-y-5 overflow-y-auto text-sm">
                            <ReviewSection title="Personal Information">
                                <ReviewItem label="Name" value={fullName || '--'} />
                                <ReviewItem
                                    label="Gender"
                                    value={formValues.gender || '--'}
                                />
                                <ReviewItem
                                    label="Birthdate"
                                    value={formValues.birth_date || '--'}
                                />
                                <ReviewItem
                                    label="Contact Number"
                                    value={formValues.contact_number || '--'}
                                />
                                <ReviewItem
                                    label="Email Address"
                                    value={formValues.email || '--'}
                                />
                                <ReviewItem
                                    label="Address"
                                    value={formValues.address || '--'}
                                    full
                                />
                            </ReviewSection>

                            <ReviewSection title="Academics">
                                <ReviewItem
                                    label="Year Level"
                                    value={formValues.year_level || '--'}
                                />
                                <ReviewItem
                                    label="Program"
                                    value={formValues.program || '--'}
                                />
                                <ReviewItem
                                    label="Educational Institution"
                                    value={formValues.university || '--'}
                                    full
                                />
                            </ReviewSection>

                            <ReviewSection title="Internship Information">
                                <ReviewItem
                                    label="Position"
                                    value={formatInternPosition(
                                        formValues.intern_position
                                    )}
                                />
                                <ReviewItem
                                    label="Department"
                                    value={formValues.department || '--'}
                                />
                                <ReviewItem
                                    label="Required Hours"
                                    value={
                                        formValues.required_hours
                                            ? `${formValues.required_hours} Hrs`
                                            : '--'
                                    }
                                />
                                <ReviewItem
                                    label="Office"
                                    value={formValues.office || '--'}
                                />
                                <ReviewItem
                                    label="Start Date"
                                    value={formValues.start_date || '--'}
                                />
                            </ReviewSection>
                        </div>
                    )}
                </div>

                <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-full bg-[#eeeeee] px-8 py-2 text-sm font-bold text-gray-500 shadow-md"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-8">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-sm font-bold text-gray-500"
                            >
                                Go Back
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-bold text-white shadow-md"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCreateIntern}
                                disabled={inviteInternMutation.isPending}
                                className="rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {inviteInternMutation.isPending ? 'Creating...' : 'Create'}
                            </button>
                        )}
                    </div>
                </div>
            </>
        )}

            {creationStatus === 'success' && resultData && (
                <ResultCard
                    title="Intern Profile Created Successfully"
                    titleAction={
                        <button
                            type="button"
                            onClick={handleResendActivationLink}
                            disabled={resendInviteMutation.isPending}
                            className="shrink-0 rounded-full bg-[#FFBF10] px-5 py-2 text-xs font-bold text-black shadow-md transition hover:bg-[#e5aa0e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {resendInviteMutation.isPending ? 'Sending...' : 'Resend Link'}
                        </button>
                    }
                    description={
                        <>
                            <p>
                                {resultData.fullName} has been added to the{' '}
                                {resultData.department} Department.
                            </p>

                            <p className="mt-5">
                                An email containing the activation link has been sent to the
                                intern. They will be required to set up their password.
                            </p>
                        </>
                    }
                    actions={
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    resetProcess();
                                    navigate('/admin/dashboard', { replace: true });
                                }}
                                className="rounded-full bg-[#eeeeee] px-8 py-2 text-sm font-bold text-gray-500 shadow-md"
                            >
                                Back to Home
                            </button>

                            <div className="flex items-center gap-8">
                                <button
                                    type="button"
                                    onClick={resetProcess}
                                    className="text-sm font-bold text-gray-500"
                                >
                                    Add New Intern
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetProcess();
                                        navigate('/admin/interns', { replace: true });
                                    }}
                                    className="rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-bold text-white shadow-md"
                                >
                                    Finish
                                </button>
                            </div>
                        </>
                    }
                />
            )}

            

        {creationStatus === 'failed' && resultData && (
                <ResultCard
                    title="Intern Profile Creation Failed"
                    description={
                    <>
                        <p>
                        {resultData.fullName} could not be added to the{' '}
                        {resultData.department} department due to a system error. Please check
                        the information provided and try again.
                        </p>

                        <p className="mt-5 font-bold">
                        Reason:{' '}
                        <span className="font-normal">
                            {resultData.reason || 'Email address already exists in the system.'}
                        </span>
                        </p>
                    </>
                    }
                    actions={
                    <>
                        <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-full bg-[#eeeeee] px-8 py-2 text-sm font-bold text-gray-500 shadow-md"
                        >
                        Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setCreationStatus('idle');
                                setCurrentStep(4);
                                setMaxVisitedStep(4);
                                setResultData(null);
                            }}
                            className="rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-bold text-white shadow-md"
                        >
                            Back to Review
                        </button>
                    </>
                    }
                />
                )}
            </div>
        </section>
        </main>
    );
}

function formatGenderLabel(gender: UserGender) {
    switch (gender) {
        case 'male':
        return 'Male';
        case 'female':
        return 'Female';
        case 'non-binary':
        return 'Non-binary';
        case 'prefer_not_to_say':
        return 'Prefer not to say';
        default:
        return gender;
    }
}

function AddInternBanner() {
    return (
        <div className="relative w-full overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 shadow-md sm:px-7 sm:py-7 lg:px-8 xl:py-8">
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Add Intern
        </h1>

        <p className="mt-2 max-w-[1100px] text-xs leading-snug text-white sm:text-sm lg:text-base xl:text-lg">
            Register a new intern by completing the required personal, academic, and assignment details.
        </p>
        </div>
    );
}

function StepTracker({
    currentStep,
    maxVisitedStep,
    onStepClick,
}: {
    currentStep: number;
    maxVisitedStep: number;
    onStepClick: (step: number) => void;
}) {
    return (
        <div className="mx-auto w-full max-w-[900px] px-2">
        <div className="grid grid-cols-5 items-start">
            {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep >= stepNumber;
            const isClickable = stepNumber <= maxVisitedStep;

            return (
                <button
                key={step}
                type="button"
                onClick={() => onStepClick(stepNumber)}
                disabled={!isClickable}
                className="relative flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                >
                {index > 0 && (
                    <span className={`absolute right-1/2 top-5 h-[3px] w-full ${currentStep >= stepNumber ? 'bg-[#FFBF10]' : 'bg-gray-300'}`} />
                )}

                <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${isActive ? 'bg-[#FFBF10] text-[#002D6F]' : 'bg-gray-300 text-gray-500'}`}>
                    {stepNumber}
                </span>

                <span className={`text-center text-xs font-bold sm:text-sm ${isActive ? 'text-[#002D6F]' : 'text-gray-500'}`}>
                    {step}
                </span>
                </button>
            );
            })}
        </div>
        </div>
    );
}

function StepCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full flex-col">
            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
                {title}
            </h2>

            <div className="mt-5 flex-1 text-sm text-gray-600">
                {children}
            </div>
        </div>
    );
}

function FormField({
    label,
    value,
    type = 'text',
    required = false,
    error,
    onChange,
}: {
    label: string;
    value: string;
    type?: string;
    required?: boolean;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
        <label className="inline-flex items-center gap-1 text-xs font-medium">
            {label}
            {required && <RequiredMark />}
        </label>

        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-full min-w-0 rounded bg-[#eeeeee] px-2 text-xs outline-none sm:px-3 sm:text-sm"
        />

        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

function DropdownField({
    label,
    value,
    required = false,
    error,
    placeholder,
    isOpen,
    options,
    onToggle,
    onSelect,
}: {
    label: string;
    value: string;
    required?: boolean;
    error?: string;
    placeholder: string;
    isOpen: boolean;
    options: { label: string; value: string }[];
    onToggle: () => void;
    onSelect: (value: string) => void;
}) {
    const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;

    return (
        <div>
        <label className="inline-flex items-center gap-1 text-xs font-medium">
            {label}
            {required && <RequiredMark />}
        </label>

        <div className="relative">
            <button
            type="button"
            onClick={onToggle}
            className={`flex h-9 w-full min-w-0 items-center justify-between rounded bg-[#eeeeee] px-2 text-left text-xs outline-none sm:px-3 sm:text-sm ${
                value ? 'text-black' : 'text-gray-400'
            }`}
            >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown size={16} className="shrink-0 text-gray-600" />
            </button>

            {isOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded bg-white shadow-lg">
                {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelect(option.value)}
                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-[#eeeeee]"
                >
                    {option.label}
                </button>
                ))}
            </div>
            )}
        </div>

        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

function ReviewSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
        <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold">
            {title}
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-x-10 gap-y-4">
            {children}
        </div>
        </div>
    );
}

function ReviewItem({
    label,
    value,
    full = false,
}: {
    label: string;
    value: string;
    full?: boolean;
}) {
    return (
        <div className={full ? 'col-span-2' : ''}>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-black">{value}</p>
        </div>
    );
}

function ResultCard({
    title,
    titleAction,
    description,
    actions,
}: {
    title: string;
    titleAction?: React.ReactNode;
    description: React.ReactNode;
    actions: React.ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-[760px]">
            <div className="min-h-[360px] rounded-xl bg-white px-8 py-8 shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
                        {title}
                    </h2>

                    {titleAction}
                </div>

                <div className="mt-5 text-sm leading-relaxed text-black">
                    {description}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
                {actions}
            </div>
        </div>
    );
}

export default AdminAddIntern;