import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';

const ADMIN_UID = 'YOUR_ADMIN_UID';

export default function AdminPage() {
  const [user] = useAuthState(auth);
  const [samples, setSamples] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.uid !== ADMIN_UID) {
      router.push('/');
    } else {
      const fetchSamples = async () => {
        const snapshot = await getDocs(collection(db, 'samples'));
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSamples(docs);
      };
      fetchSamples();
    }
  }, [user]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'samples', id));
    setSamples(samples.filter(s => s.id !== id));
  };

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم ARABA</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samples.map(sample => (
          <div key={sample.id} className="border p-4 rounded">
            <p>{sample.name}</p>
            <p className="text-sm text-gray-500">BPM: {sample.bpm}</p>
            <audio controls src={sample.url} className="w-full mt-2" />
            <button onClick={() => handleDelete(sample.id)} className="bg-red-500 text-white px-3 py-1 rounded mt-2">حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}