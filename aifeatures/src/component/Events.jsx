import { useState } from "react";
import { events } from "../data/data";

export const EventsPage = () => {
  const [filter, setFilter] = useState("All");
  const [registered, setRegistered] = useState([]);
  const [showRegistered, setShowRegistered] = useState(false);

  const handleJoin = (event) => {
    setRegistered([...registered, event]);
  };

  const handleUnregister = (event) => {
    setRegistered(registered.filter((e) => e.id !== event.id));
  };

  const filteredEvents = filter === "All" ? events : events.filter((event) => event.type === filter);

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 m-2 text-center">
      <h2 className="font-bold text-xl mb-2">{event.name}</h2>
      <p className="text-gray-600">Theme: {event.theme}</p>
      <p className="text-gray-500">Participants: {event.participants}</p>
      <p className="text-gray-500">Type: {event.type}</p>
      <p className="text-gray-500">Day: {event.day}</p>
      <p className="text-gray-500">Date: {event.date}</p>
      <p className="text-gray-500">Time: {event.time}</p>
      <button onClick={() => handleJoin(event)} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Join Event</button>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Health Events</h1>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-4 p-2 border rounded">
        <option value="All">All Events</option>
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
      </select>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredEvents.map((event) => (<EventCard key={event.id} event={event} />))}
      </div>
    </div>
  );
};

export default EventsPage
