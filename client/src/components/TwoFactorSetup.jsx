import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { Shield, Smartphone, CheckCircle, Copy, AlertCircle } from 'lucide-react';

const TwoFactorSetup = ({ userId, isEnabled, onEnabled }) => {
    const [step, setStep] = useState(isEnabled ? 4 : 1); // 1: intro, 2: scan, 3: success, 4: already enabled
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secretStr, setSecretStr] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEnabled) setStep(4);
    }, [isEnabled]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/2fa/generate', { userId });
            setQrCodeUrl(res.data.qrCode);
            setSecretStr(res.data.secret);
            setStep(2);
        } catch (err) {
            setError('Failed to generate 2FA setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/2fa/verify', {
                userId,
                secret: secretStr,
                token: token
            });
            setStep(3);
            if (typeof onEnabled === 'function') onEnabled(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!secretStr) return;
        navigator.clipboard.writeText(secretStr);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-md w-full">
            {step === 1 && (
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-[#0075D8]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Protect your UniVerse account with an extra layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile phone.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-[#0075D8] hover:bg-[#005FB0] text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? 'Generating...' : 'Set up 2FA'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#0075D8]" />
                        Configure Authenticator
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">1.</span> Open Google Authenticator or Authy on your phone and scan this QR code:
                        </div>

                        <div className="flex justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-inner">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Can't scan the code? Use this setup key:</p>
                            <div className="flex items-center justify-center gap-2 bg-gray-50 py-2 px-3 rounded-md border border-gray-200">
                                <code className="text-xs font-mono text-gray-800 tracking-wider">{secretStr}</code>
                                <button onClick={copyToClipboard} className="text-gray-400 hover:text-[#0075D8] transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">2.</span> Enter the 6-digit code generated by your app:
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="flex gap-3">
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#0075D8] focus:border-transparent"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || token.length !== 6}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">2FA Enabled Successfully!</h3>
                    <p className="text-sm text-gray-500">
                        Your account is now highly secure. You will need your authenticator app the next time you log in.
                    </p>
                </div>
            )}

            {step === 4 && (
                <div className="text-center py-4">
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                        <Shield className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">2FA is Active</h3>
                    <p className="text-sm text-gray-500 mb-6 px-4">
                        Your account is currently protected by an authenticator app. You will be prompted for a code whenever you sign in.
                    </p>

                    <button
                        disabled
                        className="text-sm text-gray-400 font-medium cursor-not-allowed"
                    >
                        Disable 2FA (Contact Support)
                    </button>
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
