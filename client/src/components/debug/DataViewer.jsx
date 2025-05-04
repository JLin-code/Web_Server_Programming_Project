/**
 * DataViewer Component
 * 
 * A debug component that can be inserted anywhere in the app
 * to display data received from the API
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const DataViewer = ({ table = 'users', limit = 5 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data from ${table} table...`);
        
        // Request data from Supabase
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(limit);
        
        if (error) {
          console.error('Error fetching data:', error);
          setError(error.message);
          return;
        }
        
        console.log(`Received ${data?.length || 0} records from ${table} table:`, data);
        setData(data || []);
        setError(null);
      } catch (err) {
        console.error('Exception fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, limit, refreshCount]);

  const refreshData = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="data-viewer">
      <div className="data-viewer-header">
        <h3>Debug Data Viewer: {table}</h3>
        <button onClick={refreshData}>Refresh</button>
      </div>
      
      {loading && <div>Loading data...</div>}
      
      {error && (
        <div className="error-message">
          <h4>Error:</h4>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && data.length === 0 && (
        <div className="no-data">No data found in {table} table</div>
      )}
      
      {!loading && !error && data.length > 0 && (
        <div className="data-container">
          <h4>Found {data.length} records:</h4>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <div className="connection-info">
        <h4>Connection Info:</h4>
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL?.substring(0, 20)}...</p>
        <p>API Key Set: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default DataViewer;
