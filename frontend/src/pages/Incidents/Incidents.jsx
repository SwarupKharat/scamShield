import React, { useEffect } from 'react';
import IncidentCard from '../../components/IncidentCard/IncidentCard';
import { useAuthStore } from '../../stores/authStore';

const Incident = () => {
  const { viewIncidents, incidents } = useAuthStore();

  const consoleLog = () => {
    console.log(incidents);
  };

  useEffect(() => {
    viewIncidents();
  }, [viewIncidents]);

  if (!incidents || incidents.length === 0) {
    return <div className="text-lg text-red-700">No Incidents Reported Yet!</div>;
  }

  return (
    <>
      <button onClick={consoleLog} className="btn btn-primary">
        Print
      </button>
      {incidents.map((incident, index) => (
        <div key={index} className="p-4 bg-gray-100 min-h-screen">
          <IncidentCard {...incident} />
        </div>
      ))}
    </>
  );
};

export default Incident;
