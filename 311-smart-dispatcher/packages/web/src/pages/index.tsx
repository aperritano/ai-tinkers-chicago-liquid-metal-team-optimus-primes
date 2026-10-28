import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Request {
  id: string;
  request_id: string;
  type: string;
  category: string;
  description: string;
  location_address: string;
  ward: number;
  priority_score: number;
  status: string;
  created_at: string;
}

interface Crew {
  id: string;
  name: string;
  type: string;
  available: boolean;
  equipment_type: string[];
}

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, crewsRes] = await Promise.all([
          fetch('http://localhost:3001/api/requests'),
          fetch('http://localhost:3001/api/crews')
        ]);

        const requestsData = await requestsRes.json();
        const crewsData = await crewsRes.json();

        setRequests(requestsData.requests);
        setCrews(crewsData.crews);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>311 Smart Dispatcher</title>
        <meta name="description" content="Smart dispatching for 311 requests" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              311 Smart Dispatcher
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Queue */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Request Queue
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.request_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-1 text-xs rounded text-white ${getPriorityColor(request.priority_score)}`}>
                              {request.priority_score}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Crew Status */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Available Crews
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {crews.map((crew) => (
                      <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{crew.name}</h4>
                          <p className="text-sm text-gray-500">Type: {crew.type}</p>
                          <p className="text-sm text-gray-500">
                            Equipment: {crew.equipment_type.join(', ')}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded ${crew.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {crew.available ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Open</h3>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">High Priority</h3>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.priority_score >= 80).length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Available Crews</h3>
                <p className="text-2xl font-bold text-green-600">
                  {crews.filter(c => c.available).length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500">Avg Response</h3>
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}