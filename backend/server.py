from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security for admin
security = HTTPBasic()

# Define Models
class Family(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FamilyCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Member(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_id: str
    name: str
    age: Optional[int] = None
    occupation: Optional[str] = None
    contact: Optional[str] = None
    photo_url: Optional[str] = None
    gender: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MemberCreate(BaseModel):
    family_id: str
    name: str
    age: Optional[int] = None
    occupation: Optional[str] = None
    contact: Optional[str] = None
    photo_url: Optional[str] = None
    gender: Optional[str] = None

class Relationship(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    member1_id: str
    member2_id: str
    relationship_type: str  # father, mother, son, daughter, brother, sister, spouse, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RelationshipCreate(BaseModel):
    member1_id: str
    member2_id: str
    relationship_type: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminUserCreate(BaseModel):
    username: str
    password: str

class SearchResult(BaseModel):
    members: List[Member]
    families: List[Family]

# Helper functions
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt + pwd_hash.hex()

def verify_password(password: str, hashed: str) -> bool:
    salt = hashed[:32]
    stored_hash = hashed[32:]
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return pwd_hash.hex() == stored_hash

async def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    admin = await db.admin_users.find_one({"username": credentials.username})
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return admin

def prepare_for_mongo(data):
    if isinstance(data.get('created_at'), datetime):
        data['created_at'] = data['created_at'].isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    return item

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Family Tree API"}

# Family routes
@api_router.get("/families", response_model=List[Family])
async def get_families():
    families = await db.families.find().to_list(1000)
    return [Family(**parse_from_mongo(family)) for family in families]

@api_router.post("/families", response_model=Family)
async def create_family(family_data: FamilyCreate):
    family = Family(**family_data.dict())
    family_dict = prepare_for_mongo(family.dict())
    await db.families.insert_one(family_dict)
    return family

@api_router.get("/families/{family_id}", response_model=Family)
async def get_family(family_id: str):
    family = await db.families.find_one({"id": family_id})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return Family(**parse_from_mongo(family))

# Member routes
@api_router.get("/members", response_model=List[Member])
async def get_members():
    members = await db.members.find().to_list(1000)
    return [Member(**parse_from_mongo(member)) for member in members]

@api_router.get("/families/{family_id}/members", response_model=List[Member])
async def get_family_members(family_id: str):
    members = await db.members.find({"family_id": family_id}).to_list(1000)
    return [Member(**parse_from_mongo(member)) for member in members]

@api_router.post("/members", response_model=Member)
async def create_member(member_data: MemberCreate, admin: dict = Depends(verify_admin)):
    member = Member(**member_data.dict())
    member_dict = prepare_for_mongo(member.dict())
    await db.members.insert_one(member_dict)
    return member

@api_router.put("/members/{member_id}", response_model=Member)
async def update_member(member_id: str, member_data: MemberCreate, admin: dict = Depends(verify_admin)):
    member = Member(id=member_id, **member_data.dict())
    member_dict = prepare_for_mongo(member.dict())
    result = await db.members.replace_one({"id": member_id}, member_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, admin: dict = Depends(verify_admin)):
    # Also delete relationships involving this member
    await db.relationships.delete_many({"$or": [{"member1_id": member_id}, {"member2_id": member_id}]})
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# Relationship routes
@api_router.get("/relationships", response_model=List[Relationship])
async def get_relationships():
    relationships = await db.relationships.find().to_list(1000)
    return [Relationship(**parse_from_mongo(rel)) for rel in relationships]

@api_router.get("/members/{member_id}/relationships", response_model=List[Relationship])
async def get_member_relationships(member_id: str):
    relationships = await db.relationships.find({
        "$or": [{"member1_id": member_id}, {"member2_id": member_id}]
    }).to_list(1000)
    return [Relationship(**parse_from_mongo(rel)) for rel in relationships]

@api_router.post("/relationships", response_model=Relationship)
async def create_relationship(rel_data: RelationshipCreate, admin: dict = Depends(verify_admin)):
    relationship = Relationship(**rel_data.dict())
    rel_dict = prepare_for_mongo(relationship.dict())
    await db.relationships.insert_one(rel_dict)
    return relationship

@api_router.delete("/relationships/{relationship_id}")
async def delete_relationship(relationship_id: str, admin: dict = Depends(verify_admin)):
    result = await db.relationships.delete_one({"id": relationship_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"message": "Relationship deleted successfully"}

# Search route
@api_router.get("/search", response_model=SearchResult)
async def search(q: str):
    # Search in members by name, occupation
    member_query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"occupation": {"$regex": q, "$options": "i"}}
        ]
    }
    members = await db.members.find(member_query).to_list(100)
    
    # Search in families by name
    family_query = {"name": {"$regex": q, "$options": "i"}}
    families = await db.families.find(family_query).to_list(100)
    
    return SearchResult(
        members=[Member(**parse_from_mongo(member)) for member in members],
        families=[Family(**parse_from_mongo(family)) for family in families]
    )

# Admin routes
@api_router.post("/admin/setup")
async def setup_admin(admin_data: AdminUserCreate):
    # Check if admin already exists
    existing_admin = await db.admin_users.find_one({"username": admin_data.username})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin user already exists")
    
    admin = AdminUser(
        username=admin_data.username,
        password_hash=hash_password(admin_data.password)
    )
    admin_dict = prepare_for_mongo(admin.dict())
    await db.admin_users.insert_one(admin_dict)
    return {"message": "Admin user created successfully"}

@api_router.get("/admin/verify")
async def verify_admin_endpoint(admin: dict = Depends(verify_admin)):
    return {"message": "Admin verified", "username": admin["username"]}

# Initialize default data
@api_router.post("/initialize")
async def initialize_data():
    # Check if data already exists
    family_count = await db.families.count_documents({})
    if family_count > 0:
        return {"message": "Data already initialized"}
    
    # Create 3 sample families
    families_data = [
        {"name": "गुप्ता परिवार", "description": "Village's oldest family"},
        {"name": "शर्मा परिवार", "description": "Known for their farming expertise"},
        {"name": "वर्मा परिवार", "description": "Skilled craftsmen and artisans"}
    ]
    
    families = []
    for family_data in families_data:
        family = Family(**family_data)
        family_dict = prepare_for_mongo(family.dict())
        await db.families.insert_one(family_dict)
        families.append(family)
    
    # Create sample members for each family
    members_data = [
        # Gupta Family
        {"family_id": families[0].id, "name": "राम गुप्ता", "age": 65, "occupation": "सरपंच", "gender": "पुरुष"},
        {"family_id": families[0].id, "name": "सीता गुप्ता", "age": 60, "occupation": "गृहिणी", "gender": "महिला"},
        {"family_id": families[0].id, "name": "अमित गुप्ता", "age": 35, "occupation": "शिक्षक", "gender": "पुरुष"},
        {"family_id": families[0].id, "name": "प्रिया गुप्ता", "age": 30, "occupation": "नर्स", "gender": "महिला"},
        
        # Sharma Family
        {"family_id": families[1].id, "name": "कृष्ण शर्मा", "age": 58, "occupation": "किसान", "gender": "पुरुष"},
        {"family_id": families[1].id, "name": "राधा शर्मा", "age": 55, "occupation": "गृहिणी", "gender": "महिला"},
        {"family_id": families[1].id, "name": "विकास शर्मा", "age": 32, "occupation": "किसान", "gender": "पुरुष"},
        
        # Verma Family
        {"family_id": families[2].id, "name": "मोहन वर्मा", "age": 62, "occupation": "बढ़ई", "gender": "पुरुष"},
        {"family_id": families[2].id, "name": "गीता वर्मा", "age": 58, "occupation": "गृहिणी", "gender": "महिला"},
        {"family_id": families[2].id, "name": "रोहित वर्मा", "age": 28, "occupation": "बढ़ई", "gender": "पुरुष"}
    ]
    
    members = []
    for member_data in members_data:
        member = Member(**member_data)
        member_dict = prepare_for_mongo(member.dict())
        await db.members.insert_one(member_dict)
        members.append(member)
    
    # Create sample relationships
    relationships_data = [
        # Gupta family relationships
        {"member1_id": members[0].id, "member2_id": members[1].id, "relationship_type": "spouse"},
        {"member1_id": members[0].id, "member2_id": members[2].id, "relationship_type": "father"},
        {"member1_id": members[1].id, "member2_id": members[2].id, "relationship_type": "mother"},
        {"member1_id": members[2].id, "member2_id": members[3].id, "relationship_type": "spouse"},
        
        # Sharma family relationships
        {"member1_id": members[4].id, "member2_id": members[5].id, "relationship_type": "spouse"},
        {"member1_id": members[4].id, "member2_id": members[6].id, "relationship_type": "father"},
        {"member1_id": members[5].id, "member2_id": members[6].id, "relationship_type": "mother"},
        
        # Verma family relationships
        {"member1_id": members[7].id, "member2_id": members[8].id, "relationship_type": "spouse"},
        {"member1_id": members[7].id, "member2_id": members[9].id, "relationship_type": "father"},
        {"member1_id": members[8].id, "member2_id": members[9].id, "relationship_type": "mother"},
    ]
    
    for rel_data in relationships_data:
        relationship = Relationship(**rel_data)
        rel_dict = prepare_for_mongo(relationship.dict())
        await db.relationships.insert_one(rel_dict)
    
    return {"message": "Sample data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()