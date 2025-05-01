import Head from 'next/head';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import UploadSample from '../components/UploadSample';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import Link from 'next/link';

export default function Home() {
  const [samples, setSamples] = useState([]);
  const [bpmFilter, setBpmFilter] = useState('');
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchSamples = async () => {
      const snapshot = await getDocs(collection(db, 'samples'));
      const allSamples = snapshot.docs.map(doc => doc.data());
      setSamples(allSamples);
    };
    fetchSamples();
  }, []);

  const filteredSamples = bpmFilter
    ? samples.filter(sample => sample.bpm?.toString() === bpmFilter)
    : samples;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  return (
    <div dir="rtl">
      <Head>
        <title>ARABA - عينات صوتية</title>
      </Head>
      <main className="p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">ARABA - عينات صوتية</h1>
          <div className="flex gap-2">
            {user?.uid === 'YOUR_ADMIN_UID' && (
              <Link href="/admin" className="text-sm bg-gray-700 text-white px-3 py-1 rounded">لوحة التحكم</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">تسجيل الخروج</button>
            ) : (
              <button onClick={handleLogin} className="text-sm bg-green-500 text-white px-3 py-1 rounded">تسجيل الدخول</button>
            )}
          </div>
        </div>

        <UploadSample />

        <div className="mt-4">
          <input
            type="number"
            placeholder="تصفية حسب BPM"
            value={bpmFilter}
            onChange={(e) => setBpmFilter(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSamples.map((sample, i) => (
            <div key={i} className="border p-4 rounded-xl">
              <p className="font-semibold">{sample.name}</p>
              <p className="text-sm text-gray-500">عدد النبضات: {sample.bpm || 'غير معروف'}</p>
              <audio controls src={sample.url} className="mt-2 w-full" />
              <a href={sample.url} download className="block mt-2 text-blue-600 underline text-sm">تحميل</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}