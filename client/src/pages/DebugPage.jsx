import React, { useState, useEffect } from 'react';
import { supabase, userService } from '../services'; // Updated import
import DataViewer from '../components/debug/DataViewer';
import { logApiResponse, visualizeData } from '../utils/debugUtils';

function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState(null);

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('users').select('count');
        
        if (error) {
          console.error('Connection error:', error);
          setConnectionStatus('Failed to connect');
          setError(error.message);
          return;
        }
        
        console.log('Connection successful:', data);
        setConnectionStatus('Connected');
        
        // If connection works, load data
        loadData();
      } catch (err) {
        console.error('Exception testing connection:', err);
        setConnectionStatus('Error');
        setError(err.message);
      }
    };
    
    checkConnection();
  }, []);

  // Load users and activities data
  const loadData = async () => {
    // Fetch users
    try {
      setLoadingUsers(true);
      console.log('Fetching users...');
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .limit(10);
      
      if (error) throw error;
      
      logApiResponse('users', data);
      setUsers(data || []);
      visualizeData({ users: data }, 'debug-panel');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
    
    // Fetch activities
    try {
      setLoadingActivities(true);
      console.log('Fetching activities...');
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id, type, description, created_at,
          user:user_id (id, first_name, last_name)
        `)
        .limit(5);
      
      if (error) throw error;
      
      logApiResponse('activities', data);
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  return (
    <div className="debug-page">
      <h1>Supabase Debug Page</h1>
      
      <div className="connection-status">
        <h2>Connection Status: <span className={connectionStatus === 'Connected' ? 'status-ok' : 'status-error'}>
          {connectionStatus}
        </span></h2>
        {error && <p className="error">Error: {error}</p>}
      </div>

      <div className="debug-section">
        <h2>Environment Info</h2>
        <pre>
          {`SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'Not defined'}\n`}
          {`SUPABASE_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined' : 'Not defined'}`}
        </pre>
      </div>
      
      <div className="data-section">
        <h2>Users Data</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length > 0 ? (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No users found</p>
        )}
      </div>
      
      <div className="data-section">
        <h2>Activities Data</h2>
        {loadingActivities ? (
          <p>Loading activities...</p>
        ) : activities.length > 0 ? (
          <div>
            {activities.map(activity => (
              <div key={activity.id} className="activity-card">
                <h3>{activity.type}</h3>
                <p>{activity.description}</p>
                <p>By: {activity.user?.first_name} {activity.user?.last_name}</p>
                <p>Created: {new Date(activity.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No activities found</p>
        )}
      </div>
      
      <div className="data-viewer-section">
        <h2>Raw Data Viewer</h2>
        <div className="data-viewer-container">
          <DataViewer table="users" limit={3} />
        </div>
      </div>

      <div className="refresh-section">
        <button onClick={loadData}>Refresh Data</button>
      </div>
    </div>
  );
}

export default DebugPage;
