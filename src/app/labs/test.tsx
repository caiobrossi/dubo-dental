"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestLabsDatabase() {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function checkDatabase() {
      try {
        // First, check if lab_orders table exists
        const { data: labOrders, error } = await supabase
          .from('lab_orders')
          .select('*')
          .limit(5);

        if (error) {
          setStatus(`Error: ${error.message}`);
          return;
        }

        setStatus(`Success! Found ${labOrders?.length || 0} lab orders`);
        setData(labOrders || []);

      } catch (err) {
        setStatus(`Exception: ${err}`);
      }
    }

    checkDatabase();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lab Orders Database Test</h1>
      <p><strong>Status:</strong> {status}</p>
      
      {data.length > 0 && (
        <div>
          <h3>Sample Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}