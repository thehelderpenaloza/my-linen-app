import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// PWA Installation and Offline Support
const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installPWA = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
  };

  return { isInstallable, installPWA };
};

// Local Storage Hook for Offline Persistence
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [value, setStoredValue];
};

const closets = [
  {
    name: 'CABIN 10',
    par: {
      'Pillow Cases': 255,
      'King Sheets': 34,
      'Queen Sheets': 113,
      'Twin Sheets': 3,
      'Bath Towels': 75,
      'Hand Towels': 75,
      'Washcloths': 75,
      'Bath Mats': 26,
      'Deluxe Bath Sheet': 28,
      'Deluxe Hand Towel': 28,
      'Deluxe Washcloth': 28,
      'Deluxe Bath Rug': 12,
    },
  },
  {
    name: 'Main Lodge 2nd Floor',
    par: {
      'Pillow Cases': 101,
      'King Sheets': 23,
      'Queen Sheets': 37,
      'Bath Towels': 18,
      'Hand Towels': 18,
      'Washcloths': 18,
      'Bath Mats': 9,
      'Deluxe Bath Sheet': 22,
      'Deluxe Hand Towel': 22,
      'Deluxe Washcloth': 22,
      'Deluxe Bath Rug': 8,
    },
  },
  {
    name: 'Main Lodge 3rd Floor',
    par: {
      'Pillow Cases': 85,
      'King Sheets': 18,
      'Queen Sheets': 33,
      'Bath Towels': 16,
      'Hand Towels': 16,
      'Washcloths': 16,
      'Bath Mats': 8,
      'Deluxe Bath Sheet': 20,
      'Deluxe Hand Towel': 20,
      'Deluxe Washcloth': 20,
      'Deluxe Bath Rug': 7,
    },
  },
  {
    name: 'Snyder',
    par: {
      'Pillow Cases': 32,
      'Queen Sheets': 8,
      'Twin Sheets': 16,
      'Bath Towels': 16,
      'Hand Towels': 16,
      'Washcloths': 8,
      'Bath Mats': 8,
    },
  },
  {
    name: 'Cobb Basement',
    par: {
      'Pillow Cases': 26,
      'King Sheets': 8,
      'Queen Sheets': 10,
      'Deluxe Bath Sheet': 14,
      'Deluxe Hand Towel': 14,
      'Deluxe Washcloth': 14,
      'Deluxe Bath Rug': 4,
    },
  },
];

const avatars = ['👤', '👨‍💼', '👩‍💼', '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍💻', '👨‍💻', '👩‍💻'];

export default function EnhancedLinenApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('userSetup'); // userSetup, closetSelection, counting, dashboard
  const [currentClosetIndex, setCurrentClosetIndex] = useState(null);
  const [counts, setCounts] = useState({});
  const [completedClosets, setCompletedClosets] = useState(new Set());

  // User Management
  const addUser = () => {
    const newUser = {
      id: Date.now(),
      name: `Houseperson ${users.length + 1}`,
      avatar: avatars[users.length % avatars.length],
      assignedClosets: []
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (userId, updates) => {
    setUsers(users.map(user => user.id === userId ? { ...user, ...updates } : user));
  };

  const selectUser = (user) => {
    setCurrentUser(user);
    setCurrentView('closetSelection');
  };

  // Closet Assignment
  const toggleClosetAssignment = (closetIndex) => {
    if (!currentUser) return;

    const updatedClosets = currentUser.assignedClosets.includes(closetIndex)
      ? currentUser.assignedClosets.filter(i => i !== closetIndex)
      : [...currentUser.assignedClosets, closetIndex];

    updateUser(currentUser.id, { assignedClosets: updatedClosets });
    setCurrentUser({ ...currentUser, assignedClosets: updatedClosets });
  };

  const startCounting = (closetIndex) => {
    setCurrentClosetIndex(closetIndex);
    setCurrentView('counting');
  };

  // Counting Logic
  const handleChange = (closetIndex, item, type, value, multiplier = 1) => {
    const updated = { ...counts };
    if (!updated[closetIndex]) updated[closetIndex] = {};
    const entry = updated[closetIndex][item] || { groups: 0, extras: 0, total: 0 };

    if (type === 'total') {
      entry.total = Number(value) || 0;
    } else {
      entry[type] = Number(value) || 0;
      entry.total = (entry.groups || 0) * multiplier + (entry.extras || 0);
    }

    updated[closetIndex][item] = entry;
    setCounts(updated);
  };

  const calculateMissing = (closetIndex, item) => {
    const par = closets[closetIndex].par[item] || 0;
    const counted = counts[closetIndex]?.[item]?.total || 0;
    return Math.max(par - counted, 0);
  };

  const isGroupedItem = (item) => {
    if (item === 'Pillow Cases') return { grouped: true, multiplier: 5 };
    if (item === 'Washcloths' || item === 'Deluxe Washcloth') return { grouped: true, multiplier: 2 };
    return { grouped: false, multiplier: 1 };
  };

  const markClosetComplete = (closetIndex) => {
    const newCompleted = new Set(completedClosets);
    newCompleted.add(closetIndex);
    setCompletedClosets(newCompleted);
    setCurrentView('closetSelection');
  };

  // User Setup View
  if (currentView === 'userSetup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🧼 Linen Count App</h1>
            <p className="text-gray-600">Multi-User Inventory Management System</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Team Setup</h2>
                <Button onClick={addUser} className="bg-blue-600 hover:bg-blue-700 text-white">
                  ➕ Add Houseperson
                </Button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-lg">No team members added yet</p>
                  <p className="text-sm">Click "Add Houseperson" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(user => (
                    <Card key={user.id} className="border-2 hover:border-blue-300 transition-colors">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{user.avatar}</div>
                        <Input
                          value={user.name}
                          onChange={(e) => updateUser(user.id, { name: e.target.value })}
                          className="text-center font-medium mb-4"
                        />

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Choose Avatar:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {avatars.map(avatar => (
                              <button
                                key={avatar}
                                onClick={() => updateUser(user.id, { avatar })}
                                className={`text-2xl p-2 rounded-lg transition-colors ${user.avatar === avatar ? 'bg-blue-100 border-2 border-blue-400' : 'hover:bg-gray-100'}`}
                              >
                                {avatar}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Assigned: {user.assignedClosets.length} closets
                          </p>
                          <Button
                            onClick={() => selectUser(user)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            Start Working
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {users.length > 0 && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => setCurrentView('dashboard')}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    📊 View Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Closet Selection View
  if (currentView === 'closetSelection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currentUser.avatar}</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                  <p className="text-gray-600">Select closets to count</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentView('dashboard')}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  📊 Dashboard
                </Button>
                <Button
                  onClick={() => setCurrentView('userSetup')}
                  variant="outline"
                >
                  ← Back to Team
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {closets.map((closet, index) => {
              const isAssigned = currentUser.assignedClosets.includes(index);
              const isCompleted = completedClosets.has(index);

              return (
                <Card key={index} className={`shadow-lg transition-all ${isCompleted ? 'bg-green-50 border-green-300' : isAssigned ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{closet.name}</h3>
                      {isCompleted && <span className="text-2xl">✅</span>}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {Object.keys(closet.par).length} items to count
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={() => toggleClosetAssignment(index)}
                        variant={isAssigned ? "default" : "outline"}
                        className={`w-full ${isAssigned ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
                      >
                        {isAssigned ? '✓ Assigned to Me' : '+ Assign to Me'}
                      </Button>

                      {isAssigned && (
                        <Button
                          onClick={() => startCounting(index)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={isCompleted}
                        >
                          {isCompleted ? '✅ Completed' : '🔢 Start Counting'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Counting View (Full Screen)
  if (currentView === 'counting' && currentClosetIndex !== null) {
    const closet = closets[currentClosetIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-purple-800 mb-2">
                YOU ARE COUNTING: {closet.name}
              </h1>
              <div className="flex items-center justify-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <div className="text-2xl">{currentUser.avatar}</div>
                  {currentUser.name}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-6">
            {Object.entries(closet.par).map(([item, par]) => {
              const { grouped, multiplier } = isGroupedItem(item);
              const current = counts[currentClosetIndex]?.[item] || { groups: 0, extras: 0, total: 0 };
              const missing = calculateMissing(currentClosetIndex, item);

              return (
                <Card key={item} className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{item}</h3>
                      <div className="flex justify-center gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{par}</div>
                          <div className="text-sm text-gray-600">PAR Target</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-700">{current.total}</div>
                          <div className="text-sm text-gray-600">Counted</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${missing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {missing}
                          </div>
                          <div className="text-sm text-gray-600">Missing</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {grouped ? (
                        <>
                          <div className="flex-1 max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Groups of {multiplier}
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              className="w-full text-center text-2xl py-3"
                              value={current.groups || ''}
                              onChange={(e) => handleChange(currentClosetIndex, item, 'groups', e.target.value, multiplier)}
                            />
                          </div>
                          <div className="flex-1 max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Extras
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              className="w-full text-center text-2xl py-3"
                              value={current.extras || ''}
                              onChange={(e) => handleChange(currentClosetIndex, item, 'extras', e.target.value, multiplier)}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 max-w-xs">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Count
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            className="w-full text-center text-2xl py-3"
                            value={current.total || ''}
                            onChange={(e) => handleChange(currentClosetIndex, item, 'total', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setCurrentView('closetSelection')}
              variant="outline"
              className="px-8 py-3 text-lg"
            >
              ← Back to Selection
            </Button>
            <Button
              onClick={() => markClosetComplete(currentClosetIndex)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              ✅ Mark Complete & Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    const getCabin10FinalInventory = () => {
      const cabinIndex = closets.findIndex(c => c.name === 'CABIN 10');
      const base = counts[cabinIndex] || {};
      const updated = {};

      closets.forEach((closet, i) => {
        if (i === cabinIndex) return;
        Object.keys(closet.par).forEach(item => {
          const missing = calculateMissing(i, item);
          if (!updated[item]) updated[item] = { totalTaken: 0, sources: [], remaining: 0 };
          if (missing > 0) {
            updated[item].totalTaken += missing;
            updated[item].sources.push({ closet: closet.name, amount: missing });
          }
        });
      });

      Object.keys(updated).forEach(item => {
        const cabinTotal = base[item]?.total || 0;
        updated[item].remaining = Math.max(cabinTotal - updated[item].totalTaken, 0);
      });

      return updated;
    };

    const cabin10Results = getCabin10FinalInventory();

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard Overview</h1>
                <p className="text-gray-600">Complete inventory status across all locations</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{completedClosets.size}/{closets.length}</div>
                  <div className="text-xs text-blue-600">Closets Done</div>
                </div>
                <Button onClick={() => setCurrentView('userSetup')} variant="outline">
                  ← Back to Team
                </Button>
              </div>
            </div>
          </div>

          {/* Team Status */}
          <Card className="bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Team Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{user.avatar}</div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Assigned: {user.assignedClosets.length} closets
                    </div>
                    <div className="text-sm text-gray-600">
                      Completed: {user.assignedClosets.filter(i => completedClosets.has(i)).length} closets
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Closets Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {closets.map((closet, index) => {
              const isCompleted = completedClosets.has(index);
              const assignedUser = users.find(user => user.assignedClosets.includes(index));

              return (
                <Card key={index} className={`shadow-lg ${isCompleted ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{closet.name}</h3>
                        {assignedUser && (
                          <p className="text-sm text-gray-600">
                            Assigned to: {assignedUser.avatar} {assignedUser.name}
                          </p>
                        )}
                      </div>
                      {isCompleted && <span className="text-2xl">✅</span>}
                    </div>

                    <div className="space-y-2">
                      {Object.entries(closet.par).map(([item, par]) => {
                        const counted = counts[index]?.[item]?.total || 0;
                        const missing = calculateMissing(index, item);                        
                        return (
                          <div key={item} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item}</span>
                            <div className="flex gap-2">
                              <span className="text-gray-600">{counted}/{par}</span>
                              {missing > 0 && (
                                <span className="text-red-600 font-medium">(-{missing})</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CABIN 10 Distribution */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">📦 CABIN 10 Distribution Summary</h2>

              {Object.keys(cabin10Results).length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Complete counts to see distribution summary
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cabin10Results)
                    .filter(([_, data]) => data.totalTaken > 0)
                    .map(([item, data]) => (
                      <div key={item} className="bg-green-50 p-4 rounded-lg">
                        <div className="font-medium text-green-800 mb-2">
                          {item}: <span className="font-bold">{data.totalTaken}</span> to distribute
                          <span className="ml-4 text-sm">→ <strong>{data.remaining}</strong> remaining in CABIN 10</span>
                        </div>
                        <div className="space-y-1">
                          {data.sources.map((source, i) => (
                            <div key={i} className="text-sm text-green-700 pl-4">
                              • {source.amount} for {source.closet}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  {Object.entries(cabin10Results).every(([_, data]) => data.totalTaken === 0) && (
                    <div className="text-green-600 text-center py-4 font-medium">
                      🎉 All closets are at PAR levels! No restocking needed.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}