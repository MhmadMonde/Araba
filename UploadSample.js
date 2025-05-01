import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';

const ADMIN_UID = 'YOUR_ADMIN_UID';

export default function UploadSample() {
  const [user] = useAuthState(auth);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bpm, setBpm] = useState('');

  if (!user || user.uid !== ADMIN_UID) return null;

  const handleUpload = async () => {
    if (!file || !bpm) return;
    setUploading(true);
    const fileRef = ref(storage, `samples/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await addDoc(collection(db, 'samples'), {
      name: file.name,
      url,
      bpm: parseInt(bpm),
      createdAt: new Date(),
      userId: user.uid
    });
    setUploading(false);
  };

  return (
    <div className="p-4 border rounded-xl">
      <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} />
      <input type="number" placeholder="عدد النبضات في الدقيقة (BPM)" value={bpm} onChange={(e) => setBpm(e.target.value)} className="mt-2 p-1 border rounded" />
      <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white p-2 rounded mt-2">
        {uploading ? 'جاري الرفع...' : 'رفع العينة'}
      </button>
    </div>
  );
}