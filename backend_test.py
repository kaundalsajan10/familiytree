import requests
import sys
import json
import base64
from datetime import datetime

class FamilyTreeAPITester:
    def __init__(self, base_url="https://family-branch-web.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.auth_header = None
        self.tests_run = 0
        self.tests_passed = 0
        self.family_ids = []
        self.member_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        if self.auth_header:
            test_headers.update(self.auth_header)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def setup_admin_auth(self):
        """Setup admin authentication"""
        username = "admin"
        password = "admin123"
        
        # First try to setup admin (might already exist)
        print("\n🔧 Setting up admin user...")
        self.run_test(
            "Setup Admin User",
            "POST", 
            "admin/setup",
            200,  # Could be 200 or 400 if already exists
            data={"username": username, "password": password}
        )
        
        # Create auth header
        auth_string = base64.b64encode(f"{username}:{password}".encode()).decode()
        self.auth_header = {"Authorization": f"Basic {auth_string}"}
        
        # Verify admin authentication
        success, _ = self.run_test(
            "Verify Admin Auth",
            "GET",
            "admin/verify", 
            200
        )
        return success

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n" + "="*50)
        print("TESTING BASIC ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Initialize sample data
        self.run_test("Initialize Data", "POST", "initialize", 200)

    def test_family_endpoints(self):
        """Test family-related endpoints"""
        print("\n" + "="*50)
        print("TESTING FAMILY ENDPOINTS")
        print("="*50)
        
        # Get all families
        success, families_data = self.run_test("Get All Families", "GET", "families", 200)
        if success and families_data:
            self.family_ids = [family['id'] for family in families_data]
            print(f"   Found {len(families_data)} families")
            for family in families_data:
                print(f"   - {family['name']}: {family.get('description', 'No description')}")
        
        # Test individual family retrieval
        if self.family_ids:
            family_id = self.family_ids[0]
            self.run_test(f"Get Family {family_id[:8]}...", "GET", f"families/{family_id}", 200)
        
        # Test creating new family (requires admin)
        if self.auth_header:
            success, new_family = self.run_test(
                "Create New Family",
                "POST",
                "families",
                200,
                data={"name": "Test परिवार", "description": "Test family for API testing"}
            )
            if success and new_family:
                self.family_ids.append(new_family['id'])

    def test_member_endpoints(self):
        """Test member-related endpoints"""
        print("\n" + "="*50)
        print("TESTING MEMBER ENDPOINTS")
        print("="*50)
        
        # Get all members
        success, members_data = self.run_test("Get All Members", "GET", "members", 200)
        if success and members_data:
            self.member_ids = [member['id'] for member in members_data]
            print(f"   Found {len(members_data)} members")
            for member in members_data[:3]:  # Show first 3
                print(f"   - {member['name']}: {member.get('occupation', 'No occupation')}")
        
        # Test family members
        if self.family_ids:
            family_id = self.family_ids[0]
            success, family_members = self.run_test(
                f"Get Family Members", 
                "GET", 
                f"families/{family_id}/members", 
                200
            )
            if success:
                print(f"   Family has {len(family_members)} members")
        
        # Test creating new member (requires admin)
        if self.auth_header and self.family_ids:
            success, new_member = self.run_test(
                "Create New Member",
                "POST",
                "members",
                200,
                data={
                    "family_id": self.family_ids[0],
                    "name": "Test Member",
                    "age": 25,
                    "occupation": "Tester",
                    "gender": "पुरुष"
                }
            )
            if success and new_member:
                self.member_ids.append(new_member['id'])
                
                # Test updating the member
                self.run_test(
                    "Update Member",
                    "PUT",
                    f"members/{new_member['id']}",
                    200,
                    data={
                        "family_id": self.family_ids[0],
                        "name": "Updated Test Member",
                        "age": 26,
                        "occupation": "Senior Tester",
                        "gender": "पुरुष"
                    }
                )

    def test_relationship_endpoints(self):
        """Test relationship-related endpoints"""
        print("\n" + "="*50)
        print("TESTING RELATIONSHIP ENDPOINTS")
        print("="*50)
        
        # Get all relationships
        success, relationships_data = self.run_test("Get All Relationships", "GET", "relationships", 200)
        if success and relationships_data:
            print(f"   Found {len(relationships_data)} relationships")
            for rel in relationships_data[:3]:  # Show first 3
                print(f"   - {rel['relationship_type']} relationship")
        
        # Test member relationships
        if self.member_ids:
            member_id = self.member_ids[0]
            self.run_test(
                f"Get Member Relationships",
                "GET",
                f"members/{member_id}/relationships",
                200
            )
        
        # Test creating relationship (requires admin)
        if self.auth_header and len(self.member_ids) >= 2:
            success, new_rel = self.run_test(
                "Create New Relationship",
                "POST",
                "relationships",
                200,
                data={
                    "member1_id": self.member_ids[0],
                    "member2_id": self.member_ids[1],
                    "relationship_type": "friend"
                }
            )
            if success and new_rel:
                # Test deleting the relationship
                self.run_test(
                    "Delete Relationship",
                    "DELETE",
                    f"relationships/{new_rel['id']}",
                    200
                )

    def test_search_functionality(self):
        """Test search functionality"""
        print("\n" + "="*50)
        print("TESTING SEARCH FUNCTIONALITY")
        print("="*50)
        
        # Test search with Hindi name
        success, search_results = self.run_test(
            "Search Hindi Name (राम)",
            "GET",
            "search?q=राम",
            200
        )
        if success:
            print(f"   Found {len(search_results.get('members', []))} members, {len(search_results.get('families', []))} families")
        
        # Test search with English name
        self.run_test("Search English Name (Ram)", "GET", "search?q=Ram", 200)
        
        # Test search with occupation
        success, search_results = self.run_test(
            "Search Occupation (किसान)",
            "GET",
            "search?q=किसान",
            200
        )
        if success:
            print(f"   Found {len(search_results.get('members', []))} members with occupation")
        
        # Test search with family name
        self.run_test("Search Family (गुप्ता)", "GET", "search?q=गुप्ता", 200)
        
        # Test empty search
        self.run_test("Empty Search", "GET", "search?q=", 200)

    def test_admin_endpoints(self):
        """Test admin-specific endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        # Test admin verification (already done in setup)
        if self.auth_header:
            self.run_test("Admin Verification", "GET", "admin/verify", 200)
        
        # Test without auth (should fail)
        temp_auth = self.auth_header
        self.auth_header = None
        self.run_test("Admin Verify Without Auth", "GET", "admin/verify", 401)
        self.auth_header = temp_auth
        
        # Test with wrong credentials
        wrong_auth = {"Authorization": "Basic " + base64.b64encode("wrong:wrong".encode()).decode()}
        self.run_test(
            "Admin Verify Wrong Credentials",
            "GET",
            "admin/verify",
            401,
            headers=wrong_auth
        )

    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)
        
        if self.auth_header:
            # Delete test members (this will also delete their relationships)
            for member_id in self.member_ids[-2:]:  # Only delete the ones we created
                if member_id:
                    self.run_test(
                        f"Delete Test Member",
                        "DELETE",
                        f"members/{member_id}",
                        200
                    )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Family Tree API Tests")
        print(f"Testing against: {self.base_url}")
        
        try:
            # Setup admin authentication
            if not self.setup_admin_auth():
                print("❌ Failed to setup admin authentication. Some tests will be skipped.")
            
            # Run all test suites
            self.test_basic_endpoints()
            self.test_family_endpoints()
            self.test_member_endpoints()
            self.test_relationship_endpoints()
            self.test_search_functionality()
            self.test_admin_endpoints()
            
            # Cleanup
            self.cleanup_test_data()
            
        except Exception as e:
            print(f"❌ Test suite failed with error: {str(e)}")
        
        # Print final results
        print("\n" + "="*60)
        print("FINAL TEST RESULTS")
        print("="*60)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = FamilyTreeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())