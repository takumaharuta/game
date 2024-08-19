import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/inertia-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import Header from '@/Components/Header';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, setError } = useForm({
        email: '',
        password: '',
        remember: false,
        intended: '',
    });

    useEffect(() => {
        const intended = new URL(window.location.href).searchParams.get('intended') || '/';
        setData('intended', intended);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                window.location.href = data.intended !== '/' ? data.intended : '/';
            },
            onError: (errors) => {
                if (errors.email) {
                    setError('email', errors.email);
                }
                if (errors.password) {
                    setError('password', errors.password);
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Head title="ログイン" />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">ログイン</h1>
                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 p-4 bg-red-100 rounded-lg">
                            <div className="font-medium text-red-600">エラーが発生しました。</div>
                            <ul className="mt-3 list-disc list-inside text-sm text-red-600">
                                {Object.keys(errors).map((key, index) => (
                                    <li key={index}>{errors[key]}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <InputLabel htmlFor="email" value="メールアドレス" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <InputLabel htmlFor="password" value="パスワード" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">ログイン状態を保持する</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    パスワードをお忘れですか？
                                </Link>
                            )}
                            <PrimaryButton className="ml-4" disabled={processing}>
                                ログイン
                            </PrimaryButton>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            アカウントをお持ちでない方は
                            <Link
                                href={`/register?intended=${encodeURIComponent(data.intended)}`}
                                className="font-medium text-blue-600 hover:underline ml-1"
                            >
                                こちら
                            </Link>
                            から登録できます。
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}