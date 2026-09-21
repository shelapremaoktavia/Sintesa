'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyClassRoute() {
  const { id } = useParams();
  const router = useRouter();
  useEffect(() => { router.replace(`/guru/kelas/${id}`); }, [id, router]);
  return <main className="page-loading">Membuka kelas...</main>;
}
