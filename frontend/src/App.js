import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Search, Users, UserPlus, Settings, Users2, Heart, Home, Plus, Network } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Homepage Component
const Homepage = () => {
  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ members: [], families: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFamilies();
    initializeData();
  }, []);

  const fetchFamilies = async () => {
    try {
      const response = await axios.get(`${API}/families`);
      setFamilies(response.data);
    } catch (error) {
      console.error("Error fetching families:", error);
    }
  };

  const initializeData = async () => {
    try {
      await axios.post(`${API}/initialize`);
    } catch (error) {
      console.error("Data already initialized or error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/search`, {
        params: { q: searchQuery }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Users2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">गाँव का पारिवारिक वृक्ष</h1>
                <p className="text-sm text-gray-600">Village Family Tree</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Admin Panel</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-orange-600" />
                <span>सदस्य खोजें (Search Members)</span>
              </CardTitle>
              <CardDescription>
                नाम, रिश्ता, या परिवार के आधार पर खोजें
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="नाम, व्यवसाय, या परिवार दर्ज करें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? "खोज रहे हैं..." : "खोजें"}
                </Button>
              </div>

              {/* Search Results */}
              {(searchResults.members.length > 0 || searchResults.families.length > 0) && (
                <div className="mt-6 space-y-4">
                  {searchResults.members.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">सदस्य (Members)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.members.map((member) => (
                          <Card key={member.id} className="bg-white border-orange-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-lg">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                  {member.age && <p className="text-sm text-gray-600">उम्र: {member.age}</p>}
                                  {member.occupation && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      {member.occupation}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.families.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">परिवार (Families)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.families.map((family) => (
                          <Card key={family.id} className="bg-white border-orange-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-gray-900">{family.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{family.description}</p>
                              <Link to={`/family/${family.id}`}>
                                <Button variant="outline" size="sm" className="mt-2">
                                  परिवार देखें
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Families Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      </main>
    </div>
  );
};

// Family Card Component
const FamilyCard = ({ family }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, [family.id]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API}/families/${family.id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-orange-600" />
          <span>{family.name}</span>
        </CardTitle>
        <CardDescription>{family.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">सदस्य संख्या:</span>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
          
          {/* Member Avatars */}
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 6).map((member) => (
              <div
                key={member.id}
                className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {members.length > 6 && (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xs">
                +{members.length - 6}
              </div>
            )}
          </div>

          <Link to={`/family/${family.id}`}>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              परिवार का वृक्ष देखें
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Family Tree Component
const FamilyTree = ({ familyId }) => {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    if (familyId) {
      fetchFamilyData();
    }
  }, [familyId]);

  const fetchFamilyData = async () => {
    try {
      const [familyRes, membersRes, relationshipsRes] = await Promise.all([
        axios.get(`${API}/families/${familyId}`),
        axios.get(`${API}/families/${familyId}/members`),
        axios.get(`${API}/relationships`)
      ]);

      setFamily(familyRes.data);
      setMembers(membersRes.data);
      setRelationships(relationshipsRes.data);
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  const getRelationships = (memberId) => {
    return relationships.filter(
      rel => rel.member1_id === memberId || rel.member2_id === memberId
    );
  };

  const getRelatedMember = (relationship, currentMemberId) => {
    const otherMemberId = relationship.member1_id === currentMemberId 
      ? relationship.member2_id 
      : relationship.member1_id;
    return members.find(m => m.id === otherMemberId);
  };

  if (!family) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  मुख्य पृष्ठ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
                <p className="text-sm text-gray-600">{family.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Family Tree Network */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-orange-600" />
                <span>पारिवारिक संबंध नेटवर्क (Family Relationship Network)</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Network Graph Visualization */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative" style={{ minHeight: '400px' }}>
            <svg width="100%" height="400" className="border border-orange-100 rounded">
              {/* Generate network connections */}
              {members.map((member, index) => {
                const memberRelationships = getRelationships(member.id);
                const x = 100 + (index % 4) * 200;
                const y = 100 + Math.floor(index / 4) * 120;
                
                return (
                  <g key={member.id}>
                    {/* Connection lines */}
                    {memberRelationships.map((rel) => {
                      const relatedMember = getRelatedMember(rel, member.id);
                      const relatedIndex = members.findIndex(m => m.id === relatedMember?.id);
                      if (relatedIndex === -1) return null;
                      
                      const x2 = 100 + (relatedIndex % 4) * 200;
                      const y2 = 100 + Math.floor(relatedIndex / 4) * 120;
                      
                      return (
                        <g key={rel.id}>
                          <line
                            x1={x}
                            y1={y}
                            x2={x2}
                            y2={y2}
                            stroke="#fb923c"
                            strokeWidth="2"
                            opacity="0.6"
                          />
                          <text
                            x={(x + x2) / 2}
                            y={(y + y2) / 2 - 5}
                            fill="#f97316"
                            fontSize="12"
                            textAnchor="middle"
                            className="font-medium"
                          >
                            {rel.relationship_type}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Member node */}
                    <circle
                      cx={x}
                      cy={y}
                      r="30"
                      fill="url(#memberGradient)"
                      stroke="#f97316"
                      strokeWidth="3"
                    />
                    <text
                      x={x}
                      y={y + 5}
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {member.name.charAt(0)}
                    </text>
                    <text
                      x={x}
                      y={y + 50}
                      fill="#374151"
                      fontSize="12"
                      fontWeight="medium"
                      textAnchor="middle"
                    >
                      {member.name}
                    </text>
                    {member.age && (
                      <text
                        x={x}
                        y={y + 65}
                        fill="#6b7280"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        उम्र: {member.age}
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="memberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#fb923c', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Member Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const memberRelationships = getRelationships(member.id);
            
            return (
              <Card key={member.id} className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      {member.age && <p className="text-sm text-gray-600">उम्र: {member.age}</p>}
                      
                      {/* Check if member has additional families */}
                      {member.name === "विकास शर्मा" && (
                        <div className="mt-2">
                          <Link to="/family/new-vikas-family" className="text-sm text-blue-600 hover:text-blue-800 underline">
                            विकास का परिवार देखें →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {member.occupation && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">व्यवसाय: </span>
                        <Badge variant="secondary">{member.occupation}</Badge>
                      </div>
                    )}
                    
                    {member.contact && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">संपर्क: </span>
                        <span className="text-sm text-gray-600">{member.contact}</span>
                      </div>
                    )}

                    {memberRelationships.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 block mb-2">रिश्ते:</span>
                        <div className="space-y-2">
                          {memberRelationships.map((rel) => {
                            const relatedMember = getRelatedMember(rel, member.id);
                            if (!relatedMember) return null;
                            
                            return (
                              <div key={rel.id} className="flex items-center space-x-2 text-sm">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-gray-600">
                                  {relatedMember.name} ({rel.relationship_type})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  const [newFamily, setNewFamily] = useState({
    name: "",
    description: ""
  });
  const [newMember, setNewMember] = useState({
    family_id: "",
    name: "",
    age: "",
    occupation: "",
    contact: "",
    gender: ""
  });

  const authenticate = async () => {
    try {
      const auth = btoa(`${credentials.username}:${credentials.password}`);
      await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      
      // Store credentials for future requests
      axios.defaults.headers.common['Authorization'] = `Basic ${auth}`;
      setIsAuthenticated(true);
      fetchData();
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const fetchData = async () => {
    try {
      const [familiesRes, membersRes] = await Promise.all([
        axios.get(`${API}/families`),
        axios.get(`${API}/members`)
      ]);
      setFamilies(familiesRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addFamily = async () => {
    try {
      await axios.post(`${API}/families`, newFamily);
      
      setNewFamily({
        name: "",
        description: ""
      });
      
      fetchData();
      alert("Family added successfully!");
    } catch (error) {
      alert("Error adding family: " + error.response?.data?.detail);
    }
  };

  const addMember = async () => {
    try {
      await axios.post(`${API}/members`, {
        ...newMember,
        age: newMember.age ? parseInt(newMember.age) : null
      });
      
      setNewMember({
        family_id: "",
        name: "",
        age: "",
        occupation: "",
        contact: "",
        gender: ""
      });
      
      fetchData();
      alert("Member added successfully!");
    } catch (error) {
      alert("Error adding member: " + error.response?.data?.detail);
    }
  };

  const deleteMember = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await axios.delete(`${API}/members/${memberId}`);
        fetchData();
        alert("Member deleted successfully!");
      } catch (error) {
        alert("Error deleting member: " + error.response?.data?.detail);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            <Button onClick={authenticate} className="w-full">
              Login
            </Button>
            <div className="text-sm text-gray-600 mt-4 p-3 bg-yellow-50 rounded-lg">
              <p><strong>Default Admin:</strong></p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
              <p className="text-xs mt-2 text-gray-500">Use the setup endpoint to create your own admin account</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex space-x-4">
              <Link to="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthenticated(false);
                  delete axios.defaults.headers.common['Authorization'];
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="families">Manage Families</TabsTrigger>
            <TabsTrigger value="members">Manage Members</TabsTrigger>
            <TabsTrigger value="view">View Families</TabsTrigger>
          </TabsList>

          <TabsContent value="families" className="space-y-6">
            {/* Add Family Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add New Family</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="family-name">Family Name</Label>
                    <Input
                      id="family-name"
                      value={newFamily.name}
                      placeholder="e.g. नया परिवार"
                      onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="family-description">Description</Label>
                    <Input
                      id="family-description"
                      value={newFamily.description}
                      placeholder="e.g. Description of the family"
                      onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={addFamily} className="w-full">
                  Add Family
                </Button>
              </CardContent>
            </Card>

            {/* Existing Families List */}
            <Card>
              <CardHeader>
                <CardTitle>All Families</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {families.map((family) => {
                    const familyMembers = members.filter(m => m.family_id === family.id);
                    
                    return (
                      <Card key={family.id} className="border-orange-100">
                        <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                          <CardTitle>{family.name}</CardTitle>
                          <CardDescription>{family.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Members:</span>
                              <Badge variant="secondary">{familyMembers.length}</Badge>
                            </div>
                            
                            <div className="space-y-1">
                              {familyMembers.map((member) => (
                                <div key={member.id} className="text-sm text-gray-700">
                                  {member.name} {member.age && `(${member.age})`}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Add Member Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Add New Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="family">Family</Label>
                    <Select value={newMember.family_id} onValueChange={(value) => setNewMember({ ...newMember, family_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {families.map((family) => (
                          <SelectItem key={family.id} value={family.id}>
                            {family.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newMember.age}
                      onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newMember.gender} onValueChange={(value) => setNewMember({ ...newMember, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="पुरुष">पुरुष (Male)</SelectItem>
                        <SelectItem value="महिला">महिला (Female)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={newMember.occupation}
                      onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      value={newMember.contact}
                      onChange={(e) => setNewMember({ ...newMember, contact: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={addMember} className="w-full">
                  Add Member
                </Button>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>All Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => {
                    const family = families.find(f => f.id === member.family_id);
                    
                    return (
                      <Card key={member.id} className="border-orange-100">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{member.name}</h4>
                                <p className="text-xs text-gray-600">{family?.name}</p>
                                {member.occupation && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {member.occupation}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMember(member.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => {
                const familyMembers = members.filter(m => m.family_id === family.id);
                
                return (
                  <Card key={family.id} className="border-orange-100">
                    <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                      <CardTitle>{family.name}</CardTitle>
                      <CardDescription>{family.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Members:</span>
                          <Badge variant="secondary">{familyMembers.length}</Badge>
                        </div>
                        
                        <div className="space-y-1">
                          {familyMembers.map((member) => (
                            <div key={member.id} className="text-sm text-gray-700">
                              {member.name} {member.age && `(${member.age})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/family/:familyId" element={<FamilyTreeRoute />} />
          <Route path="/family/new-vikas-family" element={<VikasFamily />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Vikas Family Component
const VikasFamily = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  मुख्य पृष्ठ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">विकास शर्मा का परिवार</h1>
                <p className="text-sm text-gray-600">Vikas Sharma's Family Tree</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
            <CardTitle className="text-xl">विकास शर्मा का अपना परिवार</CardTitle>
            <CardDescription>
              यह विकास शर्मा का अपना परिवार है जो मुख्य शर्मा परिवार से अलग है
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vikas as head of his own family */}
              <Card className="border-orange-100">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">वि</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">विकास शर्मा</h4>
                      <p className="text-sm text-gray-600">उम्र: 32</p>
                      <Badge variant="secondary" className="text-xs mt-1">किसान</Badge>
                      <p className="text-xs text-gray-500 mt-1">परिवार के मुखिया</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder for future family members */}
              <Card className="border-dashed border-2 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-gray-400">
                    <Users2 className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">भविष्य में परिवार के सदस्य यहाँ दिखाए जाएंगे</p>
                    <p className="text-xs mt-1">Future family members will be shown here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>नोट:</strong> विकास शर्मा मुख्य शर्मा परिवार का सदस्य है लेकिन उसका अपना अलग परिवार भी है। 
                यह पारिवारिक संरचना में सामान्य बात है जहाँ बेटे अपना अलग परिवार बनाते हैं।
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Route wrapper for Family Tree
const FamilyTreeRoute = () => {
  const { familyId } = useParams();
  return <FamilyTree familyId={familyId} />;
};

export default App;