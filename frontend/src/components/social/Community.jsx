import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageCircle, Search, X } from 'lucide-react';
import { createCommunity, listCommunities, joinCommunity } from '../../services/api'; // Adjust path as needed

export default function Community() {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    listCommunities()
      .then(data => setCommunities(data))
      .catch(err => console.error(err));
  }, []);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async () => {
    if (!name.trim() || !desc.trim()) {
      showNotif('Please fill all fields', 'error');
      return;
    }
    try {
      const newCom = await createCommunity({ name, description: desc });
      setCommunities(prev => [newCom, ...prev]);
      setName('');
      setDesc('');
      setShowCreate(false);
      showNotif('Community created!');
    } catch (err) {
      showNotif('Failed to create', 'error');
      console.error(err);
    }
  };

  const handleJoin = async (id, comName) => {
    try {
      await joinCommunity(id);
      showNotif(`Joined ${comName}!`);
    } catch (err) {
      showNotif('Failed to join', 'error');
      console.error(err);
    }
  };

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Communities</h1>
            <p className="text-slate-600 mt-1">Connect with like-minded people</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-6 border border-slate-200 group">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{c.name}</h3>
              <p className="text-slate-600 text-sm mb-4">{c.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {c.members || 0}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {c.posts || 0}
                </span>
              </div>
              <button
                onClick={() => handleJoin(c.id, c.name)}
                className="w-full py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Join Community
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Community</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Community Name"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description"
                rows="4"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-6 py-2.5 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-6 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}