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
import { Search, Users, UserPlus, Settings, Users2, Heart, Home, Plus, Network, TreePine } from "lucide-react";

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
    if (!searchQuery.trim()) {
      setSearchResults({ members: [], families: [] });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults({ members: [], families: [] });
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
                <TreePine className="w-6 h-6 text-white" />
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
                  onKeyPress={handleKeyPress}
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
                          <Link key={member.id} to={`/family/${member.family_id}`}>
                            <Card className="bg-white border-orange-100 hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    member.gender === 'पुरुष' ? 'bg-blue-400 border-4 border-blue-600' : 'bg-pink-400 border-4 border-pink-600'
                                  }`}>
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
                                    <p className="text-xs text-gray-500 mt-1">परिवार देखने के लिए क्लिक करें</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  member.gender === 'पुरुष' ? 'bg-blue-400 border-2 border-blue-600' : 'bg-pink-400 border-2 border-pink-600'
                }`}
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

// Traditional Family Tree Component
const FamilyTree = ({ familyId }) => {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [treeData, setTreeData] = useState({});

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
      buildTreeStructure(membersRes.data, relationshipsRes.data);
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  const buildTreeStructure = (members, relationships) => {
    const tree = {};
    const memberMap = {};
    
    // Create member map
    members.forEach(member => {
      memberMap[member.id] = { ...member, children: [], spouses: [], parents: [] };
    });

    // Process relationships
    relationships.forEach(rel => {
      const member1 = memberMap[rel.member1_id];
      const member2 = memberMap[rel.member2_id];
      
      if (member1 && member2) {
        if (rel.relationship_type === 'spouse') {
          if (!member1.spouses.find(s => s.id === member2.id)) {
            member1.spouses.push(member2);
          }
          if (!member2.spouses.find(s => s.id === member1.id)) {
            member2.spouses.push(member1);
          }
        } else if (rel.relationship_type === 'father') {
          // member1 is father of member2
          if (!member1.children.find(c => c.id === member2.id)) {
            member1.children.push(member2);
          }
          if (!member2.parents.find(p => p.id === member1.id)) {
            member2.parents.push(member1);
          }
        } else if (rel.relationship_type === 'mother') {
          // member1 is mother of member2
          if (!member1.children.find(c => c.id === member2.id)) {
            member1.children.push(member2);
          }
          if (!member2.parents.find(p => p.id === member1.id)) {
            member2.parents.push(member1);
          }
        } else if (rel.relationship_type === 'son') {
          // member1 is son of member2, so member2 is parent of member1
          if (!member2.children.find(c => c.id === member1.id)) {
            member2.children.push(member1);
          }
          if (!member1.parents.find(p => p.id === member2.id)) {
            member1.parents.push(member2);
          }
        } else if (rel.relationship_type === 'daughter') {
          // member1 is daughter of member2, so member2 is parent of member1
          if (!member2.children.find(c => c.id === member1.id)) {
            member2.children.push(member1);
          }
          if (!member1.parents.find(p => p.id === member2.id)) {
            member1.parents.push(member2);
          }
        }
        // Note: brother/sister relationships don't create parent-child hierarchies
      }
    });

    // Find root members (those with no parents in this family)
    const roots = members.filter(member => {
      const memberData = memberMap[member.id];
      return memberData.parents.length === 0;
    });

    setTreeData({ memberMap, roots });
  };

  const renderMember = (member, level = 0) => {
    const memberData = treeData.memberMap[member.id];
    if (!memberData) return null;

    return (
      <div key={member.id} className="flex flex-col items-center mb-8">
        {/* Member Card */}
        <div className="relative">
          <div className={`w-24 h-32 rounded-xl border-4 ${
            member.gender === 'पुरुष' ? 'border-blue-500 bg-blue-50' : 'border-pink-500 bg-pink-50'
          } flex flex-col items-center justify-center p-2 shadow-lg`}>
            <div className={`w-16 h-16 rounded-full ${
              member.gender === 'पुरुष' ? 'bg-blue-400' : 'bg-pink-400'
            } flex items-center justify-center mb-2`}>
              <span className="text-white font-bold text-lg">
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{member.name}</p>
              {member.age && <p className="text-xs text-gray-600">उम्र: {member.age}</p>}
            </div>
          </div>
          
          {/* Individual Family Link for married MALE members only */}
          {memberData.spouses.length > 0 && member.gender === 'पुरुष' && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <Link to={`/individual-family/${member.id}`}>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  {member.name.split(' ')[0]} का परिवार
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Spouse */}
        {memberData.spouses.length > 0 && (
          <div className="flex flex-col items-center mt-8 mb-4">
            <div className="text-xs text-gray-500 mb-2">पति/पत्नी (Spouse)</div>
            <div className="flex items-center space-x-4">
              {memberData.spouses.map((spouse, index) => (
                <div key={spouse.id} className="flex items-center space-x-2">
                  <div className={`w-20 h-28 rounded-xl border-4 ${
                    spouse.gender === 'पुरुष' ? 'border-blue-500 bg-blue-50' : 'border-pink-500 bg-pink-50'
                  } flex flex-col items-center justify-center p-2 shadow-lg`}>
                    <div className={`w-12 h-12 rounded-full ${
                      spouse.gender === 'पुरुष' ? 'bg-blue-400' : 'bg-pink-400'
                    } flex items-center justify-center mb-1`}>
                      <span className="text-white font-bold text-sm">
                        {spouse.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{spouse.name}</p>
                      {spouse.age && <p className="text-xs text-gray-600">उम्र: {spouse.age}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children */}
        {memberData.children.length > 0 && (
          <div className="mt-8">
            <div className="text-xs text-gray-500 mb-2 text-center">बच्चे (Children)</div>
            {/* Connection line */}
            <div className="w-px h-8 bg-gray-400 mx-auto"></div>
            <div className="flex justify-center space-x-8">
              {memberData.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Horizontal line to child */}
                  <div className="absolute -top-8 left-1/2 w-px h-8 bg-gray-400"></div>
                  {renderMember(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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

      {/* Traditional Family Tree */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">पारंपरिक पारिवारिक वृक्ष</h2>
            <p className="text-gray-600">Traditional Family Tree Structure</p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full flex justify-center">
              <div className="space-y-8">
                {treeData.roots && treeData.roots.map((root) => renderMember(root))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Individual Family Component
const IndividualFamily = ({ memberId }) => {
  const [member, setMember] = useState(null);
  const [family, setFamily] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    if (memberId) {
      fetchIndividualFamily();
    }
  }, [memberId]);

  const fetchIndividualFamily = async () => {
    try {
      // Get all members and relationships
      const [membersRes, relationshipsRes] = await Promise.all([
        axios.get(`${API}/members`),
        axios.get(`${API}/relationships`)
      ]);

      const allMembers = membersRes.data;
      const allRelationships = relationshipsRes.data;
      
      // Find the specific member
      const targetMember = allMembers.find(m => m.id === memberId);
      setMember(targetMember);

      // Find member's immediate family (spouse and children)
      const memberRelationships = allRelationships.filter(
        rel => rel.member1_id === memberId || rel.member2_id === memberId
      );

      const familyMemberIds = new Set([memberId]);
      memberRelationships.forEach(rel => {
        if (rel.relationship_type === 'spouse' || rel.relationship_type === 'father' || rel.relationship_type === 'mother') {
          const otherId = rel.member1_id === memberId ? rel.member2_id : rel.member1_id;
          familyMemberIds.add(otherId);
        }
      });

      const individualFamily = allMembers.filter(m => familyMemberIds.has(m.id));
      setFamily(individualFamily);
      setRelationships(memberRelationships);
    } catch (error) {
      console.error("Error fetching individual family:", error);
    }
  };

  if (!member) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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
                <h1 className="text-2xl font-bold text-gray-900">{member.name} का परिवार</h1>
                <p className="text-sm text-gray-600">{member.name}'s Individual Family</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
            <CardTitle className="text-xl">{member.name} का व्यक्तिगत परिवार</CardTitle>
            <CardDescription>Individual family tree for {member.name}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {family.map((familyMember) => (
                <Card key={familyMember.id} className="border-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        familyMember.gender === 'पुरुष' ? 'bg-blue-400 border-4 border-blue-600' : 'bg-pink-400 border-4 border-pink-600'
                      }`}>
                        <span className="text-white font-bold text-xl">
                          {familyMember.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{familyMember.name}</h4>
                        <p className="text-sm text-gray-600">उम्र: {familyMember.age}</p>
                        {familyMember.occupation && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {familyMember.occupation}
                          </Badge>
                        )}
                        {familyMember.id === memberId && (
                          <p className="text-xs text-gray-500 mt-1">परिवार के मुखिया</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
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
  const [relationships, setRelationships] = useState([]);
  const [activeTab, setActiveTab] = useState("families");
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
  const [newRelationship, setNewRelationship] = useState({
    member1_id: "",
    member2_id: "",
    relationship_type: "",
    family_filter: ""
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
      const [familiesRes, membersRes, relationshipsRes] = await Promise.all([
        axios.get(`${API}/families`),
        axios.get(`${API}/members`),
        axios.get(`${API}/relationships`)
      ]);
      setFamilies(familiesRes.data);
      setMembers(membersRes.data);
      setRelationships(relationshipsRes.data);
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

  const addRelationship = async () => {
    try {
      await axios.post(`${API}/relationships`, newRelationship);
      
      setNewRelationship({
        member1_id: "",
        member2_id: "",
        relationship_type: "",
        family_filter: ""
      });
      
      fetchData();
      alert("Relationship added successfully!");
    } catch (error) {
      alert("Error adding relationship: " + error.response?.data?.detail);
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

  const deleteRelationship = async (relationshipId) => {
    if (window.confirm("Are you sure you want to delete this relationship?")) {
      try {
        await axios.delete(`${API}/relationships/${relationshipId}`);
        fetchData();
        alert("Relationship deleted successfully!");
      } catch (error) {
        alert("Error deleting relationship: " + error.response?.data?.detail);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="families">Families</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="view">View All</TabsTrigger>
          </TabsList>

          <TabsContent value="families" className="space-y-6">
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
                      placeholder="e.g. दास परिवार"
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
                <Button onClick={addFamily} className="w-full">Add Family</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
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
                <Button onClick={addMember} className="w-full">Add Member</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Add New Relationship</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="family-filter">Filter by Family</Label>
                    <Select value={newRelationship.family_filter} onValueChange={(value) => setNewRelationship({ ...newRelationship, family_filter: value, member1_id: "", member2_id: "" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Families</SelectItem>
                        {families.map((family) => (
                          <SelectItem key={family.id} value={family.id}>
                            {family.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="member1">First Member</Label>
                    <Select value={newRelationship.member1_id} onValueChange={(value) => setNewRelationship({ ...newRelationship, member1_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members
                          .filter(member => newRelationship.family_filter === "all" || !newRelationship.family_filter || member.family_id === newRelationship.family_filter)
                          .map((member) => {
                            const family = families.find(f => f.id === member.family_id);
                            return (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} ({family?.name || 'Unknown Family'})
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="member2">Second Member</Label>
                    <Select value={newRelationship.member2_id} onValueChange={(value) => setNewRelationship({ ...newRelationship, member2_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members
                          .filter(member => !newRelationship.family_filter || member.family_id === newRelationship.family_filter)
                          .map((member) => {
                            const family = families.find(f => f.id === member.family_id);
                            return (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} ({family?.name || 'Unknown Family'})
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship Type</Label>
                    <Select value={newRelationship.relationship_type} onValueChange={(value) => setNewRelationship({ ...newRelationship, relationship_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="son">Son</SelectItem>
                        <SelectItem value="daughter">Daughter</SelectItem>
                        <SelectItem value="brother">Brother</SelectItem>
                        <SelectItem value="sister">Sister</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addRelationship} className="w-full">Add Relationship</Button>
              </CardContent>
            </Card>

            {/* Existing Relationships */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relationships.map((rel) => {
                    const member1 = members.find(m => m.id === rel.member1_id);
                    const member2 = members.find(m => m.id === rel.member2_id);
                    
                    return (
                      <div key={rel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <strong>{member1?.name}</strong> is <strong>{rel.relationship_type}</strong> of <strong>{member2?.name}</strong>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRelationship(rel.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {member.name} {member.age && `(${member.age})`}
                              </span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMember(member.id)}
                              >
                                Delete
                              </Button>
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

// Route wrapper for Individual Family
const IndividualFamilyRoute = () => {
  const { memberId } = useParams();
  return <IndividualFamily memberId={memberId} />;
};

// Route wrapper for Family Tree
const FamilyTreeRoute = () => {
  const { familyId } = useParams();
  return <FamilyTree familyId={familyId} />;
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/family/:familyId" element={<FamilyTreeRoute />} />
          <Route path="/individual-family/:memberId" element={<IndividualFamilyRoute />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;