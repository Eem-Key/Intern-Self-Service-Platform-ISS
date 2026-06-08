import PrimaryButton from '../../../components/ui/primaryButton';
import SecondaryButton from '../../../components/ui/secondaryButton';

type FirstLoginPromptProps = {
    internName?: string;
    onChangePassword: () => void;
    onChangeLater: () => void;
};

function FirstLoginPrompt({
    internName = 'Intern',
    onChangePassword,
    onChangeLater,
    }: FirstLoginPromptProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
        <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-[#005de8] to-[#003d8f] px-10 py-7">
            <div className="flex items-center gap-3">
                <div className="h-10 w-[3px] rounded-full bg-[#ffbd13]" />

                <h2 className="text-3xl font-bold text-white">
                Welcome, {internName}!
                </h2>
            </div>
            </div>

            <div className="px-10 py-7">
            <p className="text-sm leading-relaxed text-black">
                To keep your account secure, we recommend replacing your temporary,
                system-generated password with a personal one.
            </p>

            <p className="mt-5 text-sm font-bold text-black">
                Would you like to change your password now?
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SecondaryButton onClick={onChangeLater}>
                No, Change it Later
                </SecondaryButton>

                <PrimaryButton onClick={onChangePassword}>
                Yes, Change Password
                </PrimaryButton>
            </div>
            </div>
        </div>
        </div>
    );
}

export default FirstLoginPrompt;