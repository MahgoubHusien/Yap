'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function TestPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from('users')            // Replace with a table name!
        .select('*');

      if (error) {
        setErrorMessage(error.message);
      } else {
        setRecords(data || []);
      }
    };

    fetchData();
  }, []);

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <div>
      <h1>TestPage: Records from SomeTable</h1>
      <pre>{JSON.stringify(records, null, 2)}</pre>
    </div>
  );
}
