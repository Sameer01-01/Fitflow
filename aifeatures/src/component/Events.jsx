import { useState } from "react";

import i1 from "../assets/yoga.png";
import i2 from "../assets/strength.png";
import i3 from "../assets/cardio.png";
import i4 from "../assets/zumba.png";
import i5 from "../assets/flies.png";
import i6 from "../assets/meditation.png";
import i7 from "../assets/img4.png";
import i8 from "../assets/img5.png";
import i9 from "../assets/img8.png";

const events = [
  { id: 1, name: "Yoga for Beginners", theme: "Mental Wellness", participants: 50, type: "Online", day: "Monday", date: "2025-03-10", time: "10:00 AM", image: i1 },
  { id: 2, name: "Cardio Blast", theme: "Weight Loss", participants: 30, type: "Offline", day: "Tuesday", date: "2025-03-11", time: "6:00 PM", image: i2 },
  { id: 3, name: "Strength Training", theme: "Muscle Gain", participants: 20, type: "Online", day: "Wednesday", date: "2025-03-12", time: "7:00 AM", image: i3 },
  { id: 4, name: "Mindfulness Meditation", theme: "Mental Wellness", participants: 40, type: "Offline", day: "Thursday", date: "2025-03-13", time: "5:00 PM", image: i4 },
  { id: 5, name: "Zumba Dance", theme: "Fun Fitness", participants: 60, type: "Online", day: "Friday", date: "2025-03-14", time: "8:00 PM", image: i5 },
  { id: 6, name: "Pilates Basics", theme: "Core Strength", participants: 25, type: "Offline", day: "Saturday", date: "2025-03-15", time: "9:00 AM", image: i6 },
  { id: 7, name: "Aerobics Blast", theme: "Cardio Fitness", participants: 35, type: "Online", day: "Sunday", date: "2025-03-16", time: "11:00 AM", image: i7 },
  { id: 8, name: "HIIT Session", theme: "Fat Burn", participants: 45, type: "Offline", day: "Monday", date: "2025-03-17", time: "6:00 PM", image: i8 },
  { id: 9, name: "Stretch & Flex", theme: "Flexibility", participants: 20, type: "Online", day: "Tuesday", date: "2025-03-18", time: "7:00 AM", image: i9 }
];

export const EventsPage = () => {
  const [filter, setFilter] = useState("All");
  const [registered, setRegistered] = useState([]);
  const [showRegistered, setShowRegistered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleJoin = (event) => {
    if (!registered.some((e) => e.id === event.id)) {
      setRegistered([...registered, event]);
    }
  };

  const handleUnregister = (event) => {
    setRegistered(registered.filter((e) => e.id !== event.id));
  };

  const toggleRegisteredEvents = () => {
    setShowRegistered(!showRegistered);
  };

  const filteredEvents = events
    .filter(event => filter === "All" || event.type === filter)
    .filter(event => 
      searchQuery === "" || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.theme.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const EventCard = ({ event, isRegistered = false }) => {
    const isEventRegistered = registered.some(e => e.id === event.id);
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="relative">
          <img 
            src={event.image} 
            alt={event.name} 
            className="w-full h-48 object-cover" 
          />
          <div className="absolute top-0 right-0 m-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              event.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {event.type}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <h2 className="font-bold text-xl mb-1 text-gray-900">{event.name}</h2>
            <p className="text-sm font-medium text-purple-600 mb-2">{event.theme}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{event.day}, {event.date}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{event.participants} participants</span>
            </div>
          </div>
          
          {isRegistered || isEventRegistered ? (
            <button 
              onClick={() => handleUnregister(event)} 
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-300"
            >
              Unregister
            </button>
          ) : (
            <button 
              onClick={() => handleJoin(event)} 
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-300"
            >
              Join Event
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Health & Fitness Events</h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:text-lg">
            Join our community events to stay fit and healthy
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by event name or theme..."
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="block w-full sm:w-auto bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Events</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <button 
                onClick={toggleRegisteredEvents} 
                className={`px-4 py-2 rounded-md text-white font-medium ${showRegistered ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} transition-colors duration-300`}
              >
                {showRegistered ? "Show All Events" : `My Events (${registered.length})`}
              </button>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-gray-500">Try changing your search or filter criteria.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showRegistered
            ? registered.map((event) => <EventCard key={event.id} event={event} isRegistered={true} />)
            : filteredEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;