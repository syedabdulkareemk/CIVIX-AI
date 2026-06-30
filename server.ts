import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "";
const __dirname = __filename ? path.dirname(__filename) : "";

const app = express();
const PORT = 3000;

// Enable JSON payload parsing (size limits appropriate for image uploads)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Shared Database State
let issues: any[] = [];
let userProfiles: any[] = [];
let missions: any[] = [];
let clusters: any[] = [];
let incidents: any[] = [];

// Initialize default mock users and profiles inside our state engine
const INITIAL_DEMO_USER = {
  uid: "demo-user-123",
  email: "citizen.hero@community.org",
  displayName: "Alex Carter",
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  rank: "Verifier" as const,
  reputation: 350,
  issuesReported: 6,
  issuesVerified: 12,
  missionsCompleted: 4,
  completedMissionsList: ["mission-1", "mission-2"],
  achievements: [
    { id: "first-report", title: "Eagle Eye", description: "Reported your first infrastructure issue.", icon: "Eye", unlockedAt: new Date(2026, 5, 10).toISOString() },
    { id: "five-verifications", title: "Pillar of Truth", description: "Verified 5 community reports accurately.", icon: "ShieldCheck", unlockedAt: new Date(2026, 5, 15).toISOString() }
  ]
};

userProfiles.push(INITIAL_DEMO_USER);

// Helper for realistic random timing
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

// Generate Seed Issues
const cityData: {
  [key: string]: {
    state: string;
    pincodeRange: [number, number];
    localities: string[];
    streets: string[];
    landmarks: string[];
  };
} = {
  "Bengaluru": {
    state: "Karnataka",
    pincodeRange: [560001, 560105],
    localities: ["Koramangala 4th Block", "HSR Layout Sector 2", "Indiranagar", "Whitefield", "Jayanagar 4th Block", "Malleshwaram", "Sadashivanagar", "Madiwala"],
    streets: ["100 Feet Road", "80 Feet Road", "5th Cross Road", "Outer Ring Road", "Sarjapur Main Road", "Whitefield Main Road", "Brigade Road", "M.G. Road"],
    landmarks: ["outside BBMP Office", "near Silk Board Junction", "near Indiranagar Metro", "opposite Phoenix Marketcity", "near Forum Mall", "opposite Jayanagar Shopping Complex", "near Columbia Asia Hospital", "near Manyata Tech Park"]
  },
  "Chennai": {
    state: "Tamil Nadu",
    pincodeRange: [600001, 600095],
    localities: ["T Nagar", "Adyar", "Mylapore", "Velachery", "Nungambakkam", "Anna Nagar", "Guindy", "Besant Nagar"],
    streets: ["Gandhi Road", "G.N. Chetty Road", "Velachery Main Road", "Sardar Patel Road", "Khader Nawaz Khan Road", "Anna Salai", "Mount Road", "Elliot's Beach Road"],
    landmarks: ["near Phoenix Marketcity", "near T Nagar Bus Terminus", "opposite Adyar Depot", "near Kapaleeshwarar Temple", "outside Nungambakkam Railway Station", "near Guindy Flyover", "opposite Besant Nagar Beach", "near Anna Arch"]
  },
  "Hyderabad": {
    state: "Telangana",
    pincodeRange: [500001, 500095],
    localities: ["Gachibowli", "Madhapur", "Jubilee Hills", "Banjara Hills", "Begumpet", "Kukatpally", "Secunderabad", "Charminar Area"],
    streets: ["Hitech City Road", "Gachibowli Flyover Road", "Road No. 36", "Road No. 12", "S.P. Road", "KPHB Main Road", "Begumpet Main Road", "Patny Circle Road"],
    landmarks: ["near DLF Cyber City", "opposite Inorbit Mall", "near Jubilee Hills Checkpost", "outside Taj Banjara", "near Kukatpally Metro Station", "near Begumpet Airport", "opposite Secunderabad Club", "near Charminar"]
  },
  "Mumbai": {
    state: "Maharashtra",
    pincodeRange: [400001, 400104],
    localities: ["Bandra West", "Andheri East", "Colaba", "Juhu", "Dadar", "Worli", "Powai", "Chembur"],
    streets: ["Linking Road", "Carter Road", "Juhu Tara Road", "Saki Naka Road", "Colaba Causeway", "Senapati Bapat Marg", "Worli Sea Face Road", "JVLR"],
    landmarks: ["near Bandstand Promenade", "outside Saki Naka Metro Station", "opposite Gateway of India", "near Juhu Beach", "near Dadar Station", "opposite Worli Naka", "near Hiranandani Gardens", "near Chembur Gymkhana"]
  },
  "Delhi": {
    state: "Delhi",
    pincodeRange: [110001, 110096],
    localities: ["Connaught Place", "Saket", "Karol Bagh", "Lajpat Nagar", "Rajouri Garden", "Vasant Kunj", "Dwarka", "Chandni Chowk"],
    streets: ["Inner Circle", "Press Enclave Marg", "Pusa Road", "Ring Road", "Najafgarh Road", "Nelson Mandela Marg", "Sector 6 Road", "Netaji Subhash Marg"],
    landmarks: ["near CP Circle", "opposite Select Citywalk", "near Karol Bagh Metro Station", "outside Lajpat Nagar Market", "near Rajouri Garden Mall", "opposite Ambience Mall", "near Dwarka Sector 10 Metro", "near Red Fort"]
  },
  "Pune": {
    state: "Maharashtra",
    pincodeRange: [411001, 411062],
    localities: ["Koregaon Park", "Kothrud", "Aundh", "Viman Nagar", "Hinjawadi", "Baner", "Hadapsar", "Deccan Gymkhana"],
    streets: ["North Main Road", "Karve Road", "DP Road", "Viman Nagar Road", "Hinjawadi Phase 1 Road", "Baner Road", "Solapur Road", "J.M. Road"],
    landmarks: ["near Lane 5", "opposite Karve Statue", "near Westend Mall", "outside Phoenix Marketcity Pune", "near Rajiv Gandhi Infotech Park", "opposite Balewadi High Street", "near Magarpatta City", "near Sambhaji Park"]
  },
  "Kolkata": {
    state: "West Bengal",
    pincodeRange: [700001, 700160],
    localities: ["Salt Lake Sector V", "Park Street", "Gariahat", "New Town", "Ballygunge", "Alipore", "Shambazar", "Howrah Area"],
    streets: ["Major Arterial Road", "Park Street", "Gariahat Road", "Rashbehari Avenue", "Alipore Road", "Shambazar Avenue", "Howrah Bridge Road", "Camac Street"],
    landmarks: ["near SDF Building", "opposite Flurys", "near Gariahat Crossing", "outside New Town Eco Park", "near Ballygunge Phari", "opposite Alipore Zoo", "near Shambazar Five Point Crossing", "near Howrah Station"]
  },
  "Ahmedabad": {
    state: "Gujarat",
    pincodeRange: [380001, 380065],
    localities: ["Satellite", "C G Road", "S G Highway", "Bodakdev", "Maninagar", "Paldi", "Navrangpura", "Ghatlodia"],
    streets: ["Satellite Road", "C G Road", "S G Highway", "Sindhu Bhavan Road", "Maninagar Crossing Road", "Paldi Road", "University Road", "Ghatlodia Road"],
    landmarks: ["near Star Bazaar", "opposite Municipal Market", "near Iscon Temple", "outside Shalby Hospital", "near Kankaria Lake", "opposite Sanskar Kendra", "near Gujarat University", "near Ghatlodia Bus Terminus"]
  },
  "Kochi": {
    state: "Kerala",
    pincodeRange: [682001, 682350],
    localities: ["Edappally", "Fort Kochi", "Kakkanad", "Panampilly Nagar", "Vyttila", "Marine Drive", "Kaloor", "Tripunithura"],
    streets: ["Lulu Mall Road", "KB Jacob Road", "Infopark Expressway", "Panampilly Nagar Avenue", "Vyttila Bypass", "Shanmugham Road", "Kaloor-Kadavanthra Road", "Hill Palace Road"],
    landmarks: ["near Lulu Mall", "opposite Chinese Fishing Nets", "near Infopark Phase 1", "outside Panampilly Nagar Park", "near Vyttila Mobility Hub", "opposite Marine Drive Walkway", "near Kaloor Stadium", "near Hill Palace"]
  },
  "Jaipur": {
    state: "Rajasthan",
    pincodeRange: [302001, 302035],
    localities: ["C Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Raja Park", "Bani Park", "Johri Bazar", "Adarsh Nagar"],
    streets: ["M.I. Road", "Calgiri Marg", "Amrapali Marg", "Mansarovar Link Road", "Raja Park Main Road", "Collectorate Road", "Johri Bazar Road", "Adarsh Nagar Road"],
    landmarks: ["near Panch Batti", "opposite GT Mall", "near National Handloom", "outside Mansarovar Metro Station", "near Raja Park Gurudwara", "near Bani Park Police Station", "near Hawa Mahal", "near Adarsh Nagar Park"]
  }
};

const categoryTemplates: {
  [key: string]: {
    titles: string[];
    descriptions: string[];
  };
} = {
  "Potholes": {
    titles: [
      "Deep pothole near {landmark}",
      "Severe asphalt crater on {street}",
      "Dangerous potholes making lanes impassable near {landmark}",
      "Multiple hazardous potholes on {street}",
      "Massive pothole causing vehicles to swerve near {landmark}"
    ],
    descriptions: [
      "A very deep pothole has opened up in the middle of {street} near {landmark}. It fills with water during rains, making it completely invisible to two-wheelers and leading to multiple minor skids.",
      "Multiple large potholes are spread across {street} in {locality}. Vehicles are forced to brake suddenly or change lanes abruptly, causing a major bottleneck and hazard.",
      "The top asphalt layer has completely eroded near {landmark}, leaving deep craters. Commuters are facing high transit risks and severe traffic backlogs during peak hours."
    ]
  },
  "Water Leakage": {
    titles: [
      "Water leakage outside {landmark}",
      "Burst water main flooding the sidewalk on {street}",
      "Clean drinking water leaking from broken valve near {landmark}",
      "Major pipe burst along {street}",
      "Continuous water logging due to damaged conduit near {landmark}"
    ],
    descriptions: [
      "Water has been spraying continuously from an underground supply line on {street} outside {landmark}. Thousands of liters of drinking water are being wasted and flooding the pedestrian walk.",
      "A broken public utility pipe is continuously leaking on {street} in {locality}. The surrounding soil is getting eroded, creating a soft sinking spot on the road shoulder.",
      "High-pressure leakage from the municipal water conduit near {landmark} has created an artificial ponding zone, affecting local shop accessibility and foot traffic."
    ]
  },
  "Garbage Accumulation": {
    titles: [
      "Overflowing garbage near {landmark}",
      "Unattended waste dump near the corner of {street}",
      "Debris and plastic bags piling up on {street}",
      "Illegal garbage dumping site next to {landmark}",
      "Unchecked garbage accumulation blocking the path on {street}"
    ],
    descriptions: [
      "A pile of plastic bottles, household garbage, and wet waste has accumulated on {street} near {landmark} and hasn't been cleared for over a week. Strays are scattering it everywhere, causing foul odors.",
      "The local public garbage bin is overflowing on {street} near {landmark}. Pedestrians are forced to walk on the busy street to avoid the litter.",
      "A massive pile of unsegregated trash is attracting insects and rodents on {street} in {locality}. Immediate clearance and sanitization of the area is required."
    ]
  },
  "Broken Streetlights": {
    titles: [
      "Broken streetlight near {landmark}",
      "Entire block of streetlights out near {landmark} on {street}",
      "Flickering and non-functional safety lights on {street}",
      "Dark stretch due to burnt-out LED lamps near {landmark}",
      "Dangerous unlit junction on {street}"
    ],
    descriptions: [
      "The streetlights on this entire block of {street} in {locality} have been dead for three days. The road is pitch dark at night, causing high safety risks for women and pedestrians.",
      "A main streetlight pole lamp is broken and hanging dangerously near {landmark}. It flickers occasionally but fails to illuminate the dark blind-curve on the street.",
      "Completely dark street corridor along {street} where students and residents walk after sunset. High safety hazard, needs immediate lamp replacement."
    ]
  },
  "Open Manholes": {
    titles: [
      "Open manhole on {street}",
      "Damaged manhole cover near {landmark}",
      "Uncovered storm sewer opening on the sidewalk of {street}",
      "Partially open sewer grating posing severe safety risk near {landmark}",
      "Deep uncovered drainage pit left exposed on {street}"
    ],
    descriptions: [
      "A heavy-duty manhole cover is completely missing on the active pedestrian sidewalk along {street}. It is extremely dangerous at night or when the street is waterlogged.",
      "The concrete lid of the drainage chamber near {landmark} is cracked and has partially caved in. It could collapse completely under any vehicle weight.",
      "No safety barricades or warnings have been placed near this open sewer access point on {street} in {locality}. It is a fatal hazard for kids and blind corners."
    ]
  },
  "Road Damage": {
    titles: [
      "Severe road subsidence near {landmark}",
      "Unfinished road cutting left without proper leveling on {street}",
      "Cracked and eroded asphalt on {street}",
      "Collapsed road shoulder along {street} near {landmark}",
      "Deep ruts and cracked surfaces on {street}"
    ],
    descriptions: [
      "The road surface on {street} has completely cracked and sunk by several inches near {landmark} after the recent telecom cable digging. No rolling or resurfacing was done.",
      "Large sections of {street} in {locality} have crumbled away. The sharp edges of the broken tarmac are damaging tyres and causing bikers to lose balance.",
      "Heavy vehicles have created deep grooves and structural undulations in the asphalt layer along {street}, making the steering highly unstable."
    ]
  },
  "Traffic Signal Issues": {
    titles: [
      "Malfunctioning traffic signal near {landmark}",
      "Blinking yellow light causing chaotic traffic blocks on {street}",
      "Completely dead traffic signal timer near {landmark}",
      "Conflicting green signals active simultaneously on {street}",
      "Broken pedestrian crossing signal timer near {landmark}"
    ],
    descriptions: [
      "The traffic signal timer on {street} is stuck on green for only 5 seconds, causing extreme congestion. The traffic police are not present, resulting in chaos.",
      "The signal system near {landmark} is completely dead with no lights showing. Vehicles are crossing from all sides, creating a highly hazardous gridlock.",
      "Signal lights on {street} in {locality} are extremely dim and completely invisible under direct sunlight, causing confusion and near-miss collisions among drivers."
    ]
  },
  "Construction Hazards": {
    titles: [
      "Unsecured scaffolding over public walkway on {street}",
      "Construction steel rods protruding near {landmark}",
      "Dug-up trench left unbarricaded along {street}",
      "Cement dust and dry debris flying from building site near {landmark}",
      "Heavy construction material blocking {street}"
    ],
    descriptions: [
      "A deep sewer line trench has been dug up along {street} and left completely open overnight without any warning reflectors or barricading. Highly dangerous.",
      "Sharp iron rebars and heavy construction beams are extending out of the site boundary on {street} near {landmark} directly into the path of passing traffic.",
      "High levels of particulate cement dust are blowing off the uncovered demolition site near {landmark}, causing breathing hazards and zero visibility for drivers."
    ]
  },
  "Fallen Trees": {
    titles: [
      "Fallen tree limb blocking {street}",
      "Uprooted tree leaning precariously on wires near {landmark}",
      "Large dry branch fallen on parked vehicles along {street}",
      "Fallen trunk obstructing the pedestrian pathway near {landmark}",
      "Heavy canopy branch blocking the entry gate on {street}"
    ],
    descriptions: [
      "A massive tree branch has snapped and fallen across {street}, completely halting traffic flow. Vehicles are taking long detours.",
      "A large, old tree near {landmark} has been partially uprooted during the storm and is currently resting on the heavy-voltage power lines.",
      "Pedestrian boardwalk along {street} in {locality} is completely blocked by a large fallen tree trunk. Walkers are forced to step onto the high-speed main road bypass."
    ]
  },
  "Public Safety Hazards": {
    titles: [
      "Hanging high-voltage cable near {landmark}",
      "Broken and unstable pedestrian overbridge step near {landmark}",
      "Damaged guardrail on {street}",
      "Stray dog pack showing aggressive behavior near {landmark}",
      "Slippery oil spill spread across the turning lane on {street}"
    ],
    descriptions: [
      "A thick electrical cable has snapped from the pole on {street} near {landmark} and is dangling just five feet above the active street. It is sparking occasionally.",
      "A major section of the steel railing near {landmark} is missing after a crash. It leaves an unprotected drop directly above the road.",
      "A wide patch of engine oil has leaked onto {street} in {locality}, causing multiple vehicles to skid and lose traction near {landmark}."
    ]
  }
};

// Generate Seed Issues
const generateSeedIssues = (count = 50, lat?: number, lng?: number): any[] => {
  const citiesList = {
    "Bengaluru": { lat: 12.9716, lng: 77.5946 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Hyderabad": { lat: 17.3850, lng: 78.4867 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Delhi": { lat: 28.6139, lng: 77.2090 },
    "Pune": { lat: 18.5204, lng: 73.8567 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "Kochi": { lat: 9.9312, lng: 76.2673 },
    "Jaipur": { lat: 26.9124, lng: 75.7873 }
  };

  const severities = ["Low", "Medium", "High", "Critical"];
  const statuses = ["Reported", "Under Verification", "Verified", "Repair In Progress"];

  const seededIssues = [];
  for (let i = 0; i < count; i++) {
    let cityName = "Bengaluru";
    let cityLat = lat || 12.9716;
    let cityLng = lng || 77.5946;

    if (!lat || !lng) {
      const cityNames = Object.keys(cityData);
      cityName = cityNames[Math.floor(Math.random() * cityNames.length)];
      const city = cityData[cityName];
      // Get base coords
      const baseCoords = citiesList[cityName as keyof typeof citiesList];
      cityLat = baseCoords.lat;
      cityLng = baseCoords.lng;
    } else {
      // Find nearest city name
      let minDistance = Infinity;
      for (const [name, coords] of Object.entries(citiesList)) {
        const dist = Math.hypot(coords.lat - lat, coords.lng - lng);
        if (dist < minDistance) {
          minDistance = dist;
          cityName = name;
        }
      }
    }

    const details = cityData[cityName];
    const state = details.state;
    const locality = details.localities[Math.floor(Math.random() * details.localities.length)];
    const street = details.streets[Math.floor(Math.random() * details.streets.length)];
    const landmark = details.landmarks[Math.floor(Math.random() * details.landmarks.length)];
    const pincode = Math.floor(Math.random() * (details.pincodeRange[1] - details.pincodeRange[0] + 1)) + details.pincodeRange[0];
    
    const houseNum = Math.floor(Math.random() * 150) + 1;
    const housePrefixes = [`No. ${houseNum}`, `Plot ${houseNum}`, `House No. ${houseNum}`, `Flat ${houseNum + 100}`];
    const houseNo = housePrefixes[Math.floor(Math.random() * housePrefixes.length)];
    
    const fullAddress = `${houseNo}, ${street}, ${locality}, ${cityName}, ${state} - ${pincode}`;

    const categoriesList = Object.keys(categoryTemplates);
    const category = categoriesList[Math.floor(Math.random() * categoriesList.length)];
    const template = categoryTemplates[category];
    
    const rawTitle = template.titles[Math.floor(Math.random() * template.titles.length)];
    const rawDesc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{street}/g, street)
        .replace(/{landmark}/g, landmark)
        .replace(/{locality}/g, locality)
        .replace(/{city}/g, cityName);
    };

    const title = replacePlaceholders(rawTitle);
    const description = replacePlaceholders(rawDesc);

    const coordinateOffset = (Math.random() - 0.5) * 0.04;
    const coordinateOffsetLng = (Math.random() - 0.5) * 0.04;

    seededIssues.push({
      id: `issue-${Date.now()}-${i}`,
      title: title,
      description: description,
      category: category,
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      latitude: cityLat + coordinateOffset,
      longitude: cityLng + coordinateOffsetLng,
      address: fullAddress,
      gpsDetected: true,
      confidenceScore: Math.floor(Math.random() * 20) + 80,
      creatorId: `user-mock-${Math.floor(Math.random() * 5) + 1}`,
      creatorName: ["Karan Sharma", "Arjun Verma", "Priya Nair", "Suresh Kumar", "Ananya Rao"][Math.floor(Math.random() * 5)],
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
      updatedAt: hoursAgo(Math.floor(Math.random() * 24)),
      verificationsCount: Math.floor(Math.random() * 20),
      duplicateCount: 0,
      resolutionConfirmations: 0,
      verifiedUsers: [],
      duplicateUsers: [],
      resolverUsers: [],
      timeline: [],
      evidence: [],
      verificationThreshold: 10,
      isOfficialResolved: false
    });
  }
  return seededIssues;
};

// Admin endpoint to seed data
app.post("/api/admin/seed", (req, res) => {
  issues = [...issues, ...generateSeedIssues()];
  res.json({ message: "Seeded 300 issues successfully", count: issues.length });
});

// Admin endpoint to check count
app.get("/api/admin/count", (req, res) => {
  res.json({ count: issues.length });
});

// Seed Issues endpoint
app.get("/api/seed-nearby", (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Missing lat/lng" });
  }

  const generated = generateSeedIssues(10, lat, lng);
  issues.push(...generated);
  res.json({ message: `Seeded ${generated.length} issues nearby`, count: issues.length, newIssues: generated });
});

// Seed Issues with elegant description, category and coordinates across multiple Indian cities
const hardcodedIssues = [
  // BENGALURU (Koramangala)
  {
    id: "issue-1",
    title: "Blocked stormwater drain near Koramangala 4th Block",
    description: "Severe blockage in main stormwater drain with plastic waste and construction debris. Localized flooding accumulating near the road intersection during heavy rainfall.",
    category: "Waste Management",
    severity: "High",
    status: "Repair In Progress",
    latitude: 12.9372,
    longitude: 77.6269,
    address: "No. 45, 80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka - 560034",
    gpsDetected: true,
    confidenceScore: 84,
    creatorId: "another-user-1",
    creatorName: "Sarah Jenkins",
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(4),
    verificationsCount: 14,
    duplicateCount: 1,
    resolutionConfirmations: 0,
    verifiedUsers: ["demo-user-123", "user-mock-2"],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [
      {
        id: "ev-1",
        type: "report",
        photoURL: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=600&fit=crop",
        timestamp: daysAgo(3),
        userId: "another-user-1",
        userName: "Sarah Jenkins",
        aiAnalysis: "Confirmed stormwater drain blockage with 92% confidence."
      }
    ],
    timeline: [
      { id: "t1", status: "Reported", title: "Clogged Storm Drain Logged", description: "Citizen reported massive blockage.", timestamp: daysAgo(3), actorName: "Sarah Jenkins", evidenceId: "ev-1" },
      { id: "t2", status: "Under Verification", title: "Crowd Verification Triggered", description: "AI analysis of report photo confirms blockage. Radius search found no duplicates.", timestamp: daysAgo(3), actorName: "System AI" },
      { id: "t3", status: "Verified", title: "Community Confirmed", description: "Community consensus achieved through 14 verifications.", timestamp: daysAgo(2), actorName: "Alex Carter" },
      { id: "t4", status: "Repair In Progress", title: "Municipal Crew On-Site", description: "Drainage clearance machinery dispatched.", timestamp: hoursAgo(4), actorName: "BBMP Operations" }
    ],
    verificationThreshold: 10,
    isOfficialResolved: false
  },
  {
    id: "issue-2",
    title: "Deep pothole near Sony World Signal Junction",
    description: "Deep pothole causing serious risk to bike riders near traffic signal.",
    category: "Potholes",
    severity: "High",
    status: "Verified",
    latitude: 12.9340,
    longitude: 77.6210,
    address: "Plot 12, Sony World Signal Junction, Koramangala 4th Block, Bengaluru, Karnataka - 560034",
    gpsDetected: true,
    confidenceScore: 92,
    creatorId: "another-user-2",
    creatorName: "Marcus Vance",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    verificationsCount: 22,
    duplicateCount: 0,
    resolutionConfirmations: 0,
    verifiedUsers: ["demo-user-123"],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [
      { id: "ev-2", type: "report", photoURL: "https://images.unsplash.com/photo-1584464431033-0662bd23a827?w=600&fit=crop", timestamp: daysAgo(5), userId: "another-user-2", userName: "Marcus Vance" }
    ],
    timeline: [
      { id: "tp1", status: "Reported", title: "Pothole Logged", description: "Logged at Sony World signal.", timestamp: daysAgo(5), actorName: "Marcus Vance", evidenceId: "ev-2" },
      { id: "tp2", status: "Verified", title: "Validated by Community", description: "Verified by 22 citizens. AI categorized correctly.", timestamp: daysAgo(1), actorName: "Citizen Audit Group" }
    ],
    verificationThreshold: 15,
    isOfficialResolved: false
  },
  // MUMBAI (Bandra)
  {
    id: "issue-6",
    title: "Large banyan tree fallen across Carter Road walking track",
    description: "Large banyan tree fallen across the walking track after heavy winds. Blocking pedestrian access entirely.",
    category: "Fallen Trees",
    severity: "High",
    status: "Escalated",
    latitude: 19.0437,
    longitude: 72.8198,
    address: "No. 78, Carter Road, Bandstand Promenade, Bandra West, Mumbai, Maharashtra - 400050",
    gpsDetected: true,
    confidenceScore: 96,
    creatorId: "user-mumbai-1",
    creatorName: "Rohan K.",
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(8),
    verificationsCount: 35,
    duplicateCount: 2,
    resolutionConfirmations: 0,
    verifiedUsers: [],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [
      { id: "ev-6", type: "report", photoURL: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&fit=crop", timestamp: hoursAgo(12), userId: "user-mumbai-1", userName: "Rohan K." }
    ],
    timeline: [
      { id: "tm1", status: "Reported", title: "Obstruction Logged", description: "Bandra promenade blocked.", timestamp: hoursAgo(12), actorName: "Rohan K.", evidenceId: "ev-6" },
      { id: "tm2", status: "Escalated", title: "Priority Clearance Dispatched", description: "Emergency tree cutting crew notified.", timestamp: hoursAgo(8), actorName: "BMC Disaster Management" }
    ],
    verificationThreshold: 10,
    isOfficialResolved: false
  },
  // DELHI (Connaught Place)
  {
    id: "issue-7",
    title: "Exposed live high-voltage wiring near CP Inner Circle",
    description: "Junction box with open wiring near the Inner Circle. High risk during rain.",
    category: "Public Safety Hazards",
    severity: "Critical",
    status: "Repair In Progress",
    latitude: 28.6328,
    longitude: 77.2197,
    address: "Shop No. 14, E-Block, Inner Circle, Connaught Place, New Delhi, Delhi - 110001",
    gpsDetected: true,
    confidenceScore: 98,
    creatorId: "user-delhi-1",
    creatorName: "Anita S.",
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(2),
    verificationsCount: 50,
    duplicateCount: 0,
    resolutionConfirmations: 0,
    verifiedUsers: [],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [
      { id: "ev-7", type: "report", photoURL: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=600&fit=crop", timestamp: daysAgo(1), userId: "user-delhi-1", userName: "Anita S." }
    ],
    timeline: [
      { id: "td1", status: "Reported", title: "Electrical Hazard Logged", description: "Exposed wires at Inner Circle.", timestamp: daysAgo(1), actorName: "Anita S.", evidenceId: "ev-7" },
      { id: "td2", status: "Verified", title: "Hazard Verified", description: "Validated by community and AI as Critical.", timestamp: daysAgo(1), actorName: "System" },
      { id: "td3", status: "Repair In Progress", title: "Technicians On-Site", description: "Power grid technicians fixing the junction box.", timestamp: hoursAgo(2), actorName: "NDMC Power" }
    ],
    verificationThreshold: 5,
    isOfficialResolved: false
  },
  // CHENNAI (Velachery)
  {
    id: "issue-8",
    title: "Waterlogged deep pothole on Velachery Main Road",
    description: "Accumulated water hiding a deep pothole. Causing accidents for two-wheelers.",
    category: "Potholes",
    severity: "Medium",
    status: "Under Verification",
    latitude: 12.9791,
    longitude: 80.2185,
    address: "No. 129, Velachery Main Road, Near Phoenix Marketcity, Velachery, Chennai, Tamil Nadu - 600042",
    gpsDetected: true,
    confidenceScore: 65,
    creatorId: "user-chennai-1",
    creatorName: "Karthik R.",
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
    verificationsCount: 4,
    duplicateCount: 0,
    resolutionConfirmations: 0,
    verifiedUsers: [],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [
      { id: "ev-8", type: "report", photoURL: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&fit=crop", timestamp: hoursAgo(18), userId: "user-chennai-1", userName: "Karthik R." }
    ],
    timeline: [
      { id: "tc1", status: "Reported", title: "Pothole Logged", description: "Logged at Velachery Main Rd.", timestamp: hoursAgo(18), actorName: "Karthik R.", evidenceId: "ev-8" }
    ],
    verificationThreshold: 10,
    isOfficialResolved: false
  }
];

// Seed automatically on startup if empty
if (issues.length === 0) {
  // Generate a large initial set of 500 issues for realistic civic coverage
  const generated = generateSeedIssues(500);
  console.log(`Generated ${generated.length} initial issues.`);
  issues = [...generated];
}


// Seed Missions
missions = [
  {
    id: "mission-1",
    title: "Verify 100ft Rd Blackout",
    description: "Inspect the dark street blocks near 100 Feet Road to confirm if multiple streetlights are inactive. Safely log if there are local grid markers.",
    type: "verify",
    targetIssueId: "issue-4",
    repReward: 25,
    latitude: 12.9388,
    longitude: 77.6244,
    status: "Active"
  },
  {
    id: "mission-2",
    title: "Confirm Stormwater Flow Clearing",
    description: "Visit Sector 4 Koramangala storm sewer to verify if blockages have been successfully cleared and street logging has stopped.",
    type: "confirm_leak",
    targetIssueId: "issue-1",
    repReward: 20,
    latitude: 12.9372,
    longitude: 77.6269,
    status: "Active"
  },
  {
    id: "mission-3",
    title: "Sony World Signal Pothole Audit",
    description: "Check if the dangerous pothole on Sony World Signal Junction has been cold-mix patched, or if safety warning pylons are placed correctly.",
    type: "validate_report",
    targetIssueId: "issue-2",
    repReward: 30,
    latitude: 12.9340,
    longitude: 77.6210,
    status: "Active"
  }
];

// Helper for generating high-fidelity, category-specific incident summaries locally
function getLocalIncidentData(category: string, count: number): {
  title: string;
  rootCause: string;
  riskScore: number;
  priority: string;
  confidenceScore: number;
  recommendedDepartments: string[];
  suggestedActions: string[];
} {
  const data: { [key: string]: any } = {
    "Potholes": {
      title: "Asphalt Degradation Corridors Detected",
      rootCause: "Water seepage and severe wear of the top bituminous surface layer from heavy traffic.",
      riskScore: 78,
      priority: "High",
      confidenceScore: 92,
      recommendedDepartments: ["Municipal Roads", "Public Works Department"],
      suggestedActions: ["Initiate cold-mix pothole filling", "Overlay bituminous course during dry hours", "Enforce temporary speed limits"]
    },
    "Water Leakage": {
      title: "Water Supply Trunk Conduit Failure",
      rootCause: "Underground main valve leakage and aging cast iron conduit joints.",
      riskScore: 82,
      priority: "Critical",
      confidenceScore: 95,
      recommendedDepartments: ["Water Supply and Sewerage Board", "Public Health Engineering"],
      suggestedActions: ["Isolate flow-control valves", "Deploy acoustic leak-detection crew", "Excavate and repair joints"]
    },
    "Garbage Accumulation": {
      title: "Solid Waste Collection Bottleneck",
      rootCause: "Irregular waste-lifting schedules and unauthorized commercial dumping on public right-of-ways.",
      riskScore: 65,
      priority: "Medium",
      confidenceScore: 88,
      recommendedDepartments: ["Solid Waste Management Division", "Sanitation Department"],
      suggestedActions: ["Deploy mechanical sweepers and dumpers", "Install micro-waste bins", "Enforce dumping fine regulations"]
    },
    "Broken Streetlights": {
      title: "Pedestrian Blackout Corridor Hazard",
      rootCause: "Secondary underground cable line cut or burnt-out luminaire array.",
      riskScore: 74,
      priority: "High",
      confidenceScore: 91,
      recommendedDepartments: ["Electrical and Lighting Utilities", "Police Patrol Division"],
      suggestedActions: ["Perform insulation resistance cable test", "Replace faulty sodium vapor lamps with LEDs", "Increase safety patrol coverage"]
    },
    "Open Manholes": {
      title: "Critical Pedestrian Fall Shaft Risk",
      rootCause: "Missing cast iron manhole lids due to traffic impact, vibration, or theft.",
      riskScore: 95,
      priority: "Critical",
      confidenceScore: 98,
      recommendedDepartments: ["Sewerage and Stormwater Drainage", "Safety Compliance Division"],
      suggestedActions: ["Deploy temporary barricades and warning lights", "Install impact-resistant composite covers", "Monitor stormwater water levels"]
    },
    "Road Damage": {
      title: "Sub-grade Structural Road Distress",
      rootCause: "Sub-base settlement due to inadequate water runoff drainage and heavy commercial vehicles.",
      riskScore: 70,
      priority: "Medium",
      confidenceScore: 89,
      recommendedDepartments: ["Municipal Engineering Department", "Traffic Police Department"],
      suggestedActions: ["Regulate heavy vehicle movement schedules", "Introduce deep patch-repair works", "Improve roadside drain profiles"]
    },
    "Traffic Signal Issues": {
      title: "Intersectional Gridlock & Pedestrian Risk",
      rootCause: "Signal controller motherboard short circuit or power line fluctuation.",
      riskScore: 88,
      priority: "Critical",
      confidenceScore: 96,
      recommendedDepartments: ["Traffic Operations & Signals Department", "Traffic Police Department"],
      suggestedActions: ["Deploy manual traffic wardens", "Reset signal microcontroller remotely", "Install secondary solar power back-up system"]
    },
    "Construction Hazards": {
      title: "Pedestrian Encroachment & Material Spill",
      rootCause: "Private development contractors stockpiling sand and building material on public pavements without safety screens.",
      riskScore: 72,
      priority: "Medium",
      confidenceScore: 90,
      recommendedDepartments: ["Building Control and Planning", "Law Enforcement Wing"],
      suggestedActions: ["Issue immediate notice to clear materials", "Deploy safety mesh and warning tapes", "Collect obstruction penalty charges"]
    },
    "Fallen Trees": {
      title: "Corridor Obstruction & Active Power line Threat",
      rootCause: "High wind velocity coupled with weak soil holding and root rot on mature trees.",
      riskScore: 84,
      priority: "High",
      confidenceScore: 94,
      recommendedDepartments: ["Forestry and Parks Division", "Power Distribution Corporation"],
      suggestedActions: ["Deploy emergency chainsaw and tree-lifting crews", "Isolate overhead high-tension lines", "Clear secondary carriage-ways"]
    },
    "Public Safety Hazards": {
      title: "Spatiotemporal Security Risk Zones",
      rootCause: "Accumulation of visual distress items, broken boundaries, and lack of visual surveillance.",
      riskScore: 75,
      priority: "High",
      confidenceScore: 87,
      recommendedDepartments: ["Police and City Security Division", "Public Safety Wardens"],
      suggestedActions: ["Increase CCTV installation density", "Deploy street wardens and night watch squads", "Install high-intensity floodlighting"]
    }
  };

  const fallback = {
    title: `Detected ${category} Disruptions`,
    rootCause: `Accumulation of related ${category} disruptions affecting local operations.`,
    riskScore: 60,
    priority: "Medium",
    confidenceScore: 85,
    recommendedDepartments: ["Municipal Services"],
    suggestedActions: ["Inspect site", "Alert regional wardens"]
  };

  return data[category] || fallback;
}

// Re-computes active Clusters dynamically and reasons about Incidents
async function recalculateClusters() {
  const categoriesMap: { [key: string]: any[] } = {};
  
  // Group issues by category type
  issues.forEach(issue => {
    if (issue.status !== "Resolved") {
      if (!categoriesMap[issue.category]) {
        categoriesMap[issue.category] = [];
      }
      categoriesMap[issue.category].push(issue);
    }
  });

  const updatedClusters: any[] = [];
  const updatedIncidents: any[] = []; // New Incidents store
  let clusterIdCounter = 1;
  let incidentIdCounter = 1;

  // Check if we are doing the initial heavy startup load (e.g. 500 issues)
  const isInitialSeeding = (issues.length >= 200 && incidents.length === 0);

  // Let's sweep categories. If there are multiple active issues within a bounding distance, merge into cluster!
  for (const category of Object.keys(categoriesMap)) {
    const active = categoriesMap[category];
    if (active.length >= 2) {
      // Find average lat / lng
      const totalLat = active.reduce((sum, item) => sum + item.latitude, 0);
      const totalLng = active.reduce((sum, item) => sum + item.longitude, 0);
      const avgLat = totalLat / active.length;
      const avgLng = totalLng / active.length;
      
      const cluster = {
        id: `cluster-${clusterIdCounter++}`,
        type: `${category} Cluster`,
        severity: "High",
        summary: `Detected multiple related ${category} disruptions.`,
        affectedIssueIds: active.map(item => item.id),
        count: active.length,
        latitude: avgLat,
        longitude: avgLng
      };
      updatedClusters.push(cluster);

      // Default local data (instantly ready)
      let incidentData = getLocalIncidentData(category, active.length);

      // AI Crisis Commander Reasoning (only use Gemini for non-startup dynamic recalculation to prevent startup hang)
      const ai = getGeminiClient();
      if (ai && active.length >= 3 && !isInitialSeeding) {
        try {
          const payload = `Analyze this cluster of civic issues and determine if it represents a larger civic incident:
          Category: ${category}
          Issues: ${JSON.stringify(active.map(i => ({ title: i.title, severity: i.severity })))}
          Location: ${avgLat}, ${avgLng}
          
          Return JSON:
          {
            "title": "Incident Title",
            "rootCause": "Analysis of root cause",
            "riskScore": number (0-100),
            "priority": "Low" | "Medium" | "High" | "Critical",
            "confidenceScore": number (0-100),
            "recommendedDepartments": string[],
            "suggestedActions": string[]
          }`;

          const { response } = await callGemini(ai, [{ text: payload }]);
          const parsed = JSON.parse(response.text.replace(/```json/g, "").replace(/```/g, ""));
          if (parsed && parsed.title) {
            incidentData = parsed;
          }
        } catch (err) {
          console.error("Crisis Commander AI reasoning failed, using high-fidelity local fallback:", err);
        }
      }

      updatedIncidents.push({
        id: `incident-${incidentIdCounter++}`,
        clusterId: cluster.id,
        ...incidentData,
        timestamp: new Date().toISOString()
      });
    }
  }

  clusters = updatedClusters;
  incidents = updatedIncidents; 
}

// Lazy-loaded Gemini client getter
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        geminiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        console.log("Lazy initialized live server-side Google GenAI client successfully.");
      } catch (err) {
        console.error("Failed to initialize Google GenAI SDK:", err);
        return null;
      }
    } else {
      console.warn("GEMINI_API_KEY environment variable is not configured or set to placeholder. Falling back to simulated deterministic analysis.");
    }
  }
  return geminiClient;
}

recalculateClusters();

// Get Incidents
app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

// REST Backend APIs

// Get All issues
app.get("/api/issues", (req, res) => {
  res.json(issues);
});

// Get single issue
app.get("/api/issues/:id", (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (issue) {
    res.json(issue);
  } else {
    res.status(404).json({ error: "Civic issue not found." });
  }
});

// Check Duplicate Core Math API
app.post("/api/issues/check-duplicates", (req, res) => {
  const { latitude, longitude, category } = req.body;
  if (!latitude || !longitude || !category) {
    return res.status(400).json({ error: "Missing physical location or category for comparison." });
  }

  // Calculate distance in meters using haversine law
  const findDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const potentialDuplicates = issues.filter(issue => {
    if (issue.category !== category || issue.status === "Resolved") return false;
    const dist = findDistance(latitude, longitude, issue.latitude, issue.longitude);
    return dist <= 450; // within 450 meters threshold
  });

  if (potentialDuplicates.length > 0) {
    res.json({
      duplicateDetected: true,
      matches: potentialDuplicates.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        address: item.address || "Near you",
        status: item.status,
        distance: Math.round(findDistance(latitude, longitude, item.latitude, item.longitude))
      }))
    });
  } else {
    res.json({ duplicateDetected: false, matches: [] });
  }
});

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(ai: any, payloadParts: any[]) {
  const models = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  
  let lastError: any;
  for (const model of models) {
    try {
      console.log(`Attempting Gemini analysis with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: payloadParts,
        config: {
          responseMimeType: "application/json"
        }
      });
      return { response, model };
    } catch (err: any) {
      console.error(`Gemini call failed for model ${model}: ${err.message}`);
      lastError = err;
      // Failover immediately to next model in the chain
    }
  }
  throw lastError;
}

// Process Issue analysis with real server-side Gemini or pristine semantic analysis fallback
app.post("/api/gemini/analyze", async (req, res) => {
  const { title, description, imageUrl, categorySelected } = req.body;

  const ai = getGeminiClient();
  if (ai) {
    try {
      console.log(`Analyzing report via Gemini.`);
      const payloadParts: any[] = [];
      
      // Handle Image inline attachment if present
      if (imageUrl && imageUrl.startsWith("data:")) {
        const mimeType = imageUrl.split(";")[0].split(":")[1];
        const base64Data = imageUrl.split(",")[1];
        payloadParts.push({
          inlineData: {
            mimeType: mimeType || "image/png",
            data: base64Data
          }
        });
      }

      // Base query analysis prompt
      payloadParts.push({
        text: `You are Community Hero Municipal AI, an expert structural engineer, waste analyst, electrical grid controller, and general urban helper. 
        Review the citizen report and image context. 
        
        CRITICAL INSTRUCTIONS:
        1. If the image does not show a civic or municipal issue (e.g., people, pets, abstract art, indoor scenes, food), or if it's too blurry/dark to identify anything, return category as "Other" and provide a summary explaining that no municipal issue was detected or asking for a clearer photo.
        2. Analyze the image to identify the specific type of damage or municipal issue.
        3. Supported Categories: "Potholes", "Road Damage", "Water Leakage", "Waste Management Issues", "Garbage Accumulation", "Broken Streetlights", "Fallen Trees", "Open Manholes", "Flooding", "Traffic Signal Issues", "Public Safety Hazards", "Damaged Public Infrastructure", "Construction Hazards", "Other".
        4. Calculate Severity ("Low", "Medium", "High", "Critical") based on:
           - Safety risk (e.g., open manhole is Critical, overflowing trash might be Medium).
           - Infrastructure impact.
           - Obstruction level.
        5. Suggested Department: Identify the most relevant municipal department (e.g., "Water & Sewage", "Power Grid", "Sanitation").
        6. Potential Duplicate Risk: Estimate the risk (0-100) that this same issue has already been reported nearby based on the visual features.
        
        You must return a complete, professional infrastructure assessment report. Provide the result in raw JSON format. Do not surround with markdown block unless necessary, but if you do, use clean JSON.
        
        JSON Schema to return:
        {
          "title": "Short descriptive title detected from visual context",
          "description": "Accurate, technical visual description of the issue in the photo",
          "category": "One of the supported categories exactly",
          "severity": "Low" | "Medium" | "High" | "Critical",
          "confidence": number from 0-100,
          "estimatedUrgency": "Immediate" | "High" | "Normal",
          "visualAssessment": "A professional paragraph detailing visual observations of the damage/obstruction",
          "infrastructureAffected": "Specific municipal/utility assets affected (e.g., roadway pavement, storm drain, light armature)",
          "safetyRisks": "Potential risk vectors for vehicles or pedestrians",
          "immediateHazards": "Any immediate hazards like tire punctures, dark lanes, or deep water entrapments",
          "possibleRootCause": "Inferred underlying physical or environmental cause of this specific failure",
          "suggestedDepartment": "Appropriate public works dispatch team",
          "recommendedAction": "Actionable repair or mitigation recommendations for city dispatch crew",
          "duplicateRisk": number from 0-100,
          "citizenSafetyRecommendation": "Clear, practical safety advisory for citizens encountering this hazard in the wild",
          "reasoning": "Explain exactly WHY this category and severity were selected based on the visual features and physical context shown in the image."
        }

        Input context if supplied:
        User's provided Title: "${title || ""}"
        User's provided Description: "${description || ""}"
        User's manually selected Category: "${categorySelected || ""}"`
      });

      const { response, model } = await callGemini(ai, payloadParts);

      let parsedText = response.text || "";
      if (parsedText.includes("```")) {
        parsedText = parsedText.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      
      if (parsedText) {
        const analysisData = JSON.parse(parsedText.trim());
        
        return res.json({
          titleDetected: analysisData.title || analysisData.titleDetected || "Detected Issue",
          descriptionDetected: analysisData.description || analysisData.descriptionDetected || "Issue details identified from scan.",
          categoryDetected: analysisData.category || analysisData.categoryDetected || "Other",
          estimatedSeverity: analysisData.severity || analysisData.estimatedSeverity || "Medium",
          summary: analysisData.visualAssessment || analysisData.summary || "AI identified a potential municipal maintenance requirement.",
          suggestedDepartment: analysisData.suggestedDepartment || analysisData.department || "Municipal Service Desk",
          confidenceScore: analysisData.confidence || analysisData.confidenceScore || 85,
          recommendedAction: analysisData.recommendedAction || "Verify on-site.",
          duplicateRisk: analysisData.duplicateRisk || 10,
          
          // Enhanced fields
          estimatedUrgency: analysisData.estimatedUrgency || "Normal",
          visualAssessment: analysisData.visualAssessment || "Visual data matches community reports.",
          infrastructureAffected: analysisData.infrastructureAffected || "General urban surface.",
          safetyRisks: analysisData.safetyRisks || "Standard localized hazards.",
          immediateHazards: analysisData.immediateHazards || "None identified.",
          possibleRootCause: analysisData.possibleRootCause || "Material fatigue or environmental weathering.",
          citizenSafetyRecommendation: analysisData.citizenSafetyRecommendation || "Exercise normal street caution around the hazard.",
          reasoning: analysisData.reasoning || "Categorized based on visual profile matching public works records.",

          isFallback: false,
          diagnostics: {
            model: model,
            requestSuccess: true,
            rawResponse: analysisData,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (err: any) {
      console.error("Gemini live execution failed, activating pristine local fallback:", err.message);
      // Fall through to semantic fallback
    }
  }

  // Elegant fallback analyzer if Gemini API is absent or errors out (Pristine deterministic rules)
  const fullText = ((title || "") + " " + (description || "")).toLowerCase();
  
  let titleDetected = title || "Street Hazard Identified";
  let descriptionDetected = description || "Active civic incident reported. Immediate verification recommended.";
  let categoryDetected: any = "Other";
  let estimatedSeverity: any = "Medium";
  let suggestedDepartment = "Municipal Service Desk";
  let confidenceScore = 80;

  // Enhanced fields with high-quality default fallbacks
  let estimatedUrgency = "Normal";
  let visualAssessment = "Visual survey reveals localized structural degradation. The defect requires physical site validation.";
  let infrastructureAffected = "Asphalt surfacing and underlying sub-grade base.";
  let safetyRisks = "Pedestrian tripping, vehicular tire puncture, or swerving hazards.";
  let immediateHazards = "Active collision danger under low-light conditions.";
  let possibleRootCause = "Prolonged water pooling coupled with high cyclic heavy traffic loads.";
  let recommendedAction = "Verify on-site and apply tactical repair patch.";
  let citizenSafetyRecommendation = "Proceed with caution. Avoid stepping directly into waterlogged spots.";
  let reasoning = "Classified based on visual keywords and spatial reporting standards.";
  let duplicateRisk = 15;

  // Let's add simple visual indicators logic (if image contains generic bytes we default to Water or Trash)
  if (fullText.includes("pothole") || categorySelected === "Potholes") {
    categoryDetected = "Potholes";
    titleDetected = title || "Deteriorated Asphalt Pothole";
    descriptionDetected = description || "Open pavement pocket causing disruption to vehicular lanes and bicycle traffic.";
    suggestedDepartment = "Department of Roads & Pavement Repair";
    estimatedSeverity = "Medium";
    confidenceScore = 75;
    estimatedUrgency = "High";
    visualAssessment = "A deep, circular pavement cavity approximately 1–1.5 meters in diameter, exhibiting jagged, crumbly margins and asphalt erosion.";
    infrastructureAffected = "Bituminous surface course and granular sub-base layer.";
    safetyRisks = "Cyclist or motorcycle loss of control, swerving to avoid, high-impact suspension shocks.";
    immediateHazards = "Concealed pothole waterlogging during rainfall leading to accidental impacts.";
    possibleRootCause = "Prolonged water infiltration under intense, heavy wheel-load cycles.";
    recommendedAction = "Excavate loose binder material, apply tactical tack coat, and compact with hot bituminous mix.";
    citizenSafetyRecommendation = "Two-wheeler drivers should maintain high alertness. Do not ride close to preceding vehicles.";
    reasoning = "Classified as Potholes due to localized cratering of asphalt surface requiring quick compact mix.";
    duplicateRisk = 20;
  } else if (fullText.includes("water") || fullText.includes("leak") || fullText.includes("flood") || categorySelected === "Water Leakage" || categorySelected === "Flooding") {
    categoryDetected = categorySelected === "Flooding" ? "Flooding" : "Water Leakage";
    titleDetected = title || "Burst Pipe Subsidence";
    descriptionDetected = description || "Pressurized underground mains burst with fluid surface leaks.";
    suggestedDepartment = "Water Supply & Sewage Commission";
    estimatedSeverity = "High";
    confidenceScore = 85;
    estimatedUrgency = "Critical";
    visualAssessment = "Pressurized fluid bubbling from sub-surface joints, eroding surrounding soil and creating continuous street puddles.";
    infrastructureAffected = "Underground main water conduit and pedestrian pathway paving.";
    safetyRisks = "Undermining of road foundation, sinkhole potential, contamination of potable water.";
    immediateHazards = "Pedestrian slip risk, localized street flooding, and high resource wastage.";
    possibleRootCause = "Corrosive soil wear on cast-iron pipe body leading to structural seam burst.";
    recommendedAction = "Isolate nearby valve gate, excavate affected section, and install high-density sleeve clamp.";
    citizenSafetyRecommendation = "Pedestrians should avoid stepping on soft surrounding ground as soil might have caved underneath.";
    reasoning = "Identified as Water Leakage due to active pressurized water egress originating from civic utility conduits.";
    duplicateRisk = 12;
  } else if (fullText.includes("light") || fullText.includes("dark") || categorySelected === "Broken Streetlights") {
    categoryDetected = "Broken Streetlights";
    titleDetected = title || "Disabled Public Luminaire";
    descriptionDetected = description || "Street lamp completely darkened, producing zero foot-candles of public brightness.";
    suggestedDepartment = "Urban Lighting Division (Power Grid)";
    estimatedSeverity = "Low";
    confidenceScore = 80;
    estimatedUrgency = "Normal";
    visualAssessment = "Non-functional overhead luminaire assembly. Neighboring poles are active, creating isolated black spots.";
    infrastructureAffected = "Electrical municipal grid network and lighting arm poles.";
    safetyRisks = "Increased probability of pedestrian mugging, collision risk on blind curves, low safety feelings.";
    immediateHazards = "Absolute blackouts at high-speed turning points, making street curves invisible.";
    possibleRootCause = "Secondary photo-sensor relay burnout or short-circuit in wire joints.";
    recommendedAction = "Check voltage draw at base plate, change sodium vapor lamp to 60W LED, and verify photocell function.";
    citizenSafetyRecommendation = "Avoid poorly lit shortcuts after dusk. Carry a phone flash when walking.";
    reasoning = "Categorized as Broken Streetlights due to darkness profile in public roadway lighting zones.";
    duplicateRisk = 5;
  } else if (fullText.includes("trash") || fullText.includes("waste") || fullText.includes("garbage") || categorySelected === "Garbage Accumulation" || categorySelected === "Waste Management Issues") {
    categoryDetected = "Garbage Accumulation";
    titleDetected = title || "Unsanitary Refuse Accumulation";
    descriptionDetected = description || "Trash bins overflowing, leading to debris spreading on surrounding walks.";
    suggestedDepartment = "Sanitation & Waste Management";
    estimatedSeverity = "Medium";
    confidenceScore = 78;
    estimatedUrgency = "Normal";
    visualAssessment = "Large volume of unsegregated organic and plastic waste overflowing onto pedestrian pathways.";
    infrastructureAffected = "Public sidewalk and storm gutter flow paths.";
    safetyRisks = "Stray animal feeding, toxic liquid leachate runoff, insect and rodent breeding.";
    immediateHazards = "Severe foul odor and blockage of pedestrian walkways forcing citizens onto high-speed lanes.";
    possibleRootCause = "Skipped refuse-clearing schedule by regional waste transport contractor.";
    recommendedAction = "Deploy sanitation skip loader, wash pavement with disinfectant, and set up a penalty warning sign.";
    citizenSafetyRecommendation = "Do not touch or disturb waste piles. Report any illegal commercial dumping instantly.";
    reasoning = "Categorized as Garbage Accumulation due to severe refuse dumping on right-of-way sidewalks.";
    duplicateRisk = 25;
  } else if (fullText.includes("tree") || categorySelected === "Fallen Trees") {
    categoryDetected = "Fallen Trees";
    titleDetected = title || "Obstruction: Fallen Foliage";
    descriptionDetected = description || "Large branch or entire tree blocking access.";
    suggestedDepartment = "Parks & Horticulture";
    estimatedSeverity = "High";
    confidenceScore = 82;
    estimatedUrgency = "High";
    visualAssessment = "Large structural tree branch snapped and resting across public lanes, impeding vehicular flow.";
    infrastructureAffected = "Primary carriage-way and overhead power transmission lines.";
    safetyRisks = "Vehicle crash into obstruction under low visibility, pedestrian obstruction.";
    immediateHazards = "Entangled live power cables posing electrocution threat.";
    possibleRootCause = "Severe winds coupled with root rot making tree unstable.";
    recommendedAction = "Deploy parks chainsaw crew, safely cut branch into segments, and transport for organic mulching.";
    citizenSafetyRecommendation = "Keep clear of the fallen foliage. Do not touch adjacent metal fences that might be electrified.";
    reasoning = "Classified as Fallen Trees due to substantial botanical obstruction blocking city transit lanes.";
    duplicateRisk = 8;
  } else if (fullText.includes("manhole") || categorySelected === "Open Manholes") {
    categoryDetected = "Open Manholes";
    titleDetected = title || "Hazard: Exposed Sewer Entry";
    descriptionDetected = description || "Manhole cover missing or displaced. Critical safety risk.";
    suggestedDepartment = "Sewage & Drainage Department";
    estimatedSeverity = "Critical";
    confidenceScore = 90;
    estimatedUrgency = "Critical";
    visualAssessment = "Deep drainage access shaft left entirely uncovered without any warning signals or safety cones.";
    infrastructureAffected = "Underground storm drainage and pedestrian pathway.";
    safetyRisks = "Fatal falls for pedestrians (especially children), severe suspension collapse for vehicular traffic.";
    immediateHazards = "Fatal tripping/falling hazard under dark or flooded street conditions.";
    possibleRootCause = "Missing concrete/cast-iron lid due to heavy commercial impact or illegal removal.";
    recommendedAction = "Erect immediate physical protection fence with reflector lights and install a heavy-duty composite lock-lid.";
    citizenSafetyRecommendation = "STAY CLEAR. Do not attempt to jump over or inspect the opening. Help direct children away.";
    reasoning = "Classified as Open Manholes because of missing access shaft covers, representing an extreme life-safety risk.";
    duplicateRisk = 5;
  }

  res.json({
    titleDetected,
    descriptionDetected,
    categoryDetected,
    estimatedSeverity,
    summary: visualAssessment,
    suggestedDepartment,
    confidenceScore,
    recommendedAction,
    duplicateRisk,
    
    // Enhanced fields
    estimatedUrgency,
    visualAssessment,
    infrastructureAffected,
    safetyRisks,
    immediateHazards,
    possibleRootCause,
    citizenSafetyRecommendation,
    reasoning,
    
    isFallback: true
  });
});

// Create new report
app.post("/api/issues", (req, res) => {
  const { title, description, category, severity, latitude, longitude, address, gpsDetected, aiAnalysis, imageUrl, creatorId, creatorName } = req.body;

  if (!title || !category || !severity || !latitude || !longitude) {
    return res.status(400).json({ error: "Missing required core issue telemetry variables." });
  }

  const reportEvidence = {
    id: `ev-rep-${Date.now()}`,
    type: "report" as const,
    photoURL: imageUrl || "https://images.unsplash.com/photo-1584464431033-0662bd23a827?w=600&fit=crop",
    timestamp: new Date().toISOString(),
    userId: creatorId || "demo-user-123",
    userName: creatorName || "Alex Carter",
    gps: { lat: Number(latitude), lng: Number(longitude) },
    aiConfidence: aiAnalysis ? aiAnalysis.confidenceScore : 40,
    aiAnalysis: aiAnalysis ? aiAnalysis.summary : "Initial report submitted."
  };

  const newIssue = {
    id: `issue-${Date.now()}`,
    title,
    description: description || "No detailed description provided.",
    category,
    severity,
    status: "Reported",
    latitude: Number(latitude),
    longitude: Number(longitude),
    address: address || "Pinpoint coordinate on Map",
    gpsDetected: !!gpsDetected,
    confidenceScore: aiAnalysis ? Math.round(aiAnalysis.confidenceScore * 0.9) : 30,
    aiAnalysis: aiAnalysis || null,
    imageUrl: imageUrl || null,
    creatorId: creatorId || "demo-user-123",
    creatorName: creatorName || "Alex Carter",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verificationsCount: 1,
    duplicateCount: 0,
    resolutionConfirmations: 0,
    verifiedUsers: [creatorId || "demo-user-123"],
    duplicateUsers: [],
    resolverUsers: [],
    evidence: [reportEvidence],
    verificationThreshold: severity === "Critical" ? 5 : 15,
    isOfficialResolved: false,
    timeline: [
      {
        id: `t-${Date.now()}`,
        status: "Reported" as const,
        title: "Report Synchronized",
        description: `Issue logged into Community Hero Operating System under ${category}. AI initial triage active.`,
        timestamp: new Date().toISOString(),
        actorName: creatorName || "Alex Carter",
        evidenceId: reportEvidence.id
      }
    ]
  };

  issues.unshift(newIssue);
  recalculateClusters();
  res.status(201).json(newIssue);
});

// AI Verification with Evidence
app.post("/api/issues/:id/verify-evidence", async (req, res) => {
  const { userId, userName, imageUrl, latitude, longitude } = req.body;
  
  if (!imageUrl || !latitude || !longitude) {
    return res.status(400).json({ error: "Evidence image and GPS coordinates are mandatory for validation." });
  }

  const issueIndex = issues.findIndex(i => i.id === req.params.id);
  if (issueIndex === -1) return res.status(404).json({ error: "Issue not found." });

  const issue = issues[issueIndex];
  
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  if (issue.verifiedUsers && issue.verifiedUsers.includes(userId)) {
    return res.status(400).json({ error: "You have already verified this issue." });
  }
  
  // 1. Calculate distance from original report
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const dist = calculateDistance(latitude, longitude, issue.latitude, issue.longitude);
  
  // Distance constraint: Must be within 100m for a valid verification of a specific point
  if (dist > 150) {
    return res.status(400).json({ error: `Verification denied. GPS location too far from original report (${Math.round(dist)}m). You must be at the site.` });
  }

  // 2. AI Image Comparison (Three-Pillar Strict Verification Engine)
  let aiResult = {
    sameIssue: false,
    similarImage: false,
    similarGPS: dist <= 150,
    confidence: 0,
    analysis: "AI Verification service currently unavailable.",
    reasoning: "The server failed to reach the AI model."
  };

  const ai = getGeminiClient();
  if (ai) {
    try {
      const mimeType = imageUrl.split(",")[0].split(":")[1].split(";")[0];
      const base64Data = imageUrl.split(",")[1];
      const payloadParts = [
        { inlineData: { mimeType, data: base64Data } },
        { text: `You are an AI municipal inspector. Evaluate this verification evidence against the original issue report.
          Original Issue: ${issue.title}
          Original Category: ${issue.category}
          Original Description: ${issue.description}
          Original GPS: ${issue.latitude}, ${issue.longitude}
          
          User Verification GPS: ${latitude}, ${longitude}
          Calculated Distance: ${Math.round(dist)} meters from the reported hazard.

          This is a VERIFICATION task to CONFIRM that the reported issue (e.g. pothole, broken light, trash pile, etc.) is still actively present on the street at the specified location.

          You must evaluate the three municipal verification criteria:
          1. "sameIssue" (boolean): True if the visual evidence in the photo depicts the same category or issue described in the original report.
          2. "similarImage" (boolean): True if the photo is a real-world street photograph showing actual municipal infrastructure, street, or ground (not a blank screen, meme, cartoon, or indoor household object).
          3. "similarGPS" (boolean): Set this to true since the calculated distance of ${Math.round(dist)} meters is within the 150m boundary.

          You must return a highly consistent JSON response. Avoid any contradictory explanations. If the photo matches the description and represents a real street environment, set sameIssue and similarImage to true.

          Return JSON format:
          {
            "sameIssue": boolean,
            "similarImage": boolean,
            "similarGPS": boolean,
            "confidence": number, // Overall verification confidence score (0-100)
            "analysis": string, // A short summary explaining what is seen and confirming the report's validity
            "reasoning": string // Explanation of your matching logic for the three criteria
          }` }
      ];

      const { response } = await callGemini(ai, payloadParts);
      let text = response.text || "{}";
      if (text.includes("```")) {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      aiResult = JSON.parse(text);
    } catch (err) {
      console.error("AI Verification failed:", err);
      aiResult.analysis = "AI analysis failed, manual review needed.";
    }
  }

  // Final check based strictly on the three-pillar criteria
  const isApproved = aiResult.sameIssue && aiResult.similarImage && (dist <= 150);

  if (!isApproved) {
    return res.status(400).json({ 
      error: "Verification rejected.", 
      sameIssue: !!aiResult.sameIssue,
      similarImage: !!aiResult.similarImage,
      similarGPS: dist <= 150,
      confidence: aiResult.confidence || 0,
      reason: aiResult.analysis,
      details: aiResult.reasoning || "The evidence does not satisfy the verification pillars."
    });
  }

  const verificationEvidence = {
    id: `ev-ver-${Date.now()}`,
    type: "verification" as const,
    photoURL: imageUrl,
    timestamp: new Date().toISOString(),
    userId: userId || "unauthenticated-user",
    userName: userName || "Committed Citizen",
    latitude,
    longitude,
    aiConfidence: aiResult.confidence,
    aiAnalysis: `${aiResult.analysis} ${aiResult.reasoning || ""}`,
    distanceFromOriginal: Math.round(dist)
  };

  // ... (Lines 1180-1184 unchanged)
  issue.evidence.push(verificationEvidence);
  if (!issue.verifiedUsers) issue.verifiedUsers = [];
  issue.verifiedUsers.push(userId);
  issue.verificationsCount += 1;
  issue.updatedAt = new Date().toISOString();
  // ...

  issue.timeline.push({
    id: `t-${Date.now()}`,
    status: "Verification" as const,
    title: "AI Verification Approved",
    description: `Reason: ${aiResult.analysis}`,
    timestamp: new Date().toISOString(),
    actorName: "Community Hero AI",
    evidenceId: verificationEvidence.id
  });
  if (issue.status === "Reported") issue.status = "Under Verification";
  if (issue.status === "Under Verification" && issue.verificationsCount >= 3) issue.status = "Verified";

  issue.timeline.push({
    id: `tv-${Date.now()}`,
    status: "Verification",
    title: "Verification Evidence Submitted",
    description: `Verified at ${Math.round(dist)}m distance. AI Match Confidence: ${aiResult.confidence}%.`,
    timestamp: new Date().toISOString(),
    actorName: userName,
    evidenceId: verificationEvidence.id
  });

  res.json({ success: true, decision: "Approved", sameIssue: true, similarImage: true, similarGPS: true, issue });
});

// Flag as Duplicate
app.post("/api/issues/:id/duplicate", (req, res) => {
  const { userId } = req.body;
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found." });

  if (issue.duplicateUsers && issue.duplicateUsers.includes(userId)) {
    return res.status(400).json({ error: "You have already flagged this issue as duplicate." });
  }

  if (!issue.duplicateUsers) issue.duplicateUsers = [];
  issue.duplicateUsers.push(userId);
  issue.duplicateCount += 1;
  issue.updatedAt = new Date().toISOString();

  issue.timeline.push({
    id: `td-${Date.now()}`,
    status: "Action",
    title: "Duplicate Flagged",
    description: "Citizen reported this coordinate as a duplicate record. AI spatial audit ongoing.",
    timestamp: new Date().toISOString(),
    actorName: "Community Member"
  });

  res.json({ success: true, issue });
});

// Submit Resolution Evidence
app.post("/api/issues/:id/resolution-evidence", async (req, res) => {
  const { userId, userName, imageUrl, latitude, longitude } = req.body;
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found." });

  // 1. Calculate distance from original report
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const dist = calculateDistance(latitude, longitude, issue.latitude, issue.longitude);
  if (dist > 150) {
    return res.status(400).json({ error: `Resolution denied. GPS location too far from original report (${Math.round(dist)}m). You must be at the site to submit resolution evidence.` });
  }

  // 2. AI Image Comparison for Resolution (Strict Rules)
  let aiResult = {
    isApproved: false,
    confidence: 0,
    analysis: "AI Resolution service currently unavailable."
  };

  const ai = getGeminiClient();
  if (ai) {
    try {
      const mimeType = imageUrl.split(",")[0].split(":")[1].split(";")[0];
      const base64Data = imageUrl.split(",")[1];
      const payloadParts = [
        { inlineData: { mimeType, data: base64Data } },
        { text: `You are an AI municipal inspector checking if a reported issue has been RESOLVED, FIXED, or CLEARED.
          Original Issue: ${issue.title}
          Original Category: ${issue.category}
          Original Description: ${issue.description}
          Original GPS: ${issue.latitude}, ${issue.longitude}
          Resolution GPS: ${latitude}, ${longitude}

          This is a RESOLUTION task. A user is uploading an "After" photo to show that the reported issue (e.g. pothole is filled, trash is cleared, light is fixed, etc.) has been successfully resolved, repaired, or cleared.
          
          You must determine:
          1. Does the visual evidence in the photo show that the reported issue has indeed been successfully fixed, repaired, or cleared?
          2. Is the site clear of the reported damage/obstruction?
          3. Is the location within distance (<= 150 meters)?

          CRITICAL instruction for "isApproved":
          - If the photo successfully shows the issue has been FIXED/REPAIRED/CLEARED (e.g. filled pothole, empty trash area, working light), you MUST set "isApproved": true.
          - If the issue is still present/unrepaired, or if the photo is fake/irrelevant/blank, you MUST set "isApproved": false.

          Return JSON: {
            "isApproved": boolean, // MUST be true if the photo successfully proves that the reported issue is RESOLVED/FIXED/CLEARED. Set to false if the photo shows that the issue is still present, unrepaired, or if the photo is fake/irrelevant.
            "confidence": number, // Confidence score (0-100). Must be >= 85 if it matches.
            "analysis": string, // A short summary explaining what is seen and confirming that the resolution is successful.
            "reasoning": string // Detailed explanation of your matching and distance check.
          }` }
      ];

      const { response } = await callGemini(ai, payloadParts);
      let text = response.text || "{}";
      if (text.includes("```")) {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      aiResult = JSON.parse(text);
    } catch (err) {
      console.error("AI Resolution failed:", err);
      aiResult.analysis = "AI analysis failed, manual review needed.";
    }
  }

  // Final check
  if (!aiResult.isApproved || aiResult.confidence < 85) {
    return res.status(400).json({ 
      error: "Resolution rejected.", 
      reason: aiResult.analysis,
      details: (aiResult as any).reasoning || "No further details available."
    });
  }

  const resolutionEvidence = {
    id: `ev-res-${Date.now()}`,
    type: "resolution" as const,
    photoURL: imageUrl,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    gps: { lat: latitude, lng: longitude },
    latitude,
    longitude,
    aiConfidence: aiResult.confidence,
    aiAnalysis: `${aiResult.analysis} ${(aiResult as any).reasoning || ""}`
  };

  issue.evidence.push(resolutionEvidence);
  issue.status = "Pending Resolution Review";
  issue.updatedAt = new Date().toISOString();

  issue.timeline.push({
    id: `tr-${Date.now()}`,
    status: "Resolution Evidence",
    title: "Resolution Evidence Provided",
    description: "Citizen submitted 'After' photo for municipal review and community consensus.",
    timestamp: new Date().toISOString(),
    actorName: userName,
    evidenceId: resolutionEvidence.id
  });

  res.json({ success: true, issue });
});

// Get profiles
app.get("/api/users/:uid", (req, res) => {
  const profile = userProfiles.find(p => p.uid === req.params.uid);
  if (profile) {
    res.json(profile);
  } else {
    // Return standard default user, so it works flawlessly
    const newUser = {
      ...INITIAL_DEMO_USER,
      uid: req.params.uid
    };
    userProfiles.push(newUser);
    res.json(newUser);
  }
});

// Create or sync user profile
app.post("/api/users", (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.uid) {
    return res.status(400).json({ error: "Profile payload is invalid." });
  }

  const idx = userProfiles.findIndex(p => p.uid === profile.uid);
  if (idx !== -1) {
    userProfiles[idx] = { ...userProfiles[idx], ...profile };
    res.json(userProfiles[idx]);
  } else {
    userProfiles.push(profile);
    res.json(profile);
  }
});

// Update Profile Rank Progress
app.post("/api/users/:uid/progress", (req, res) => {
  const { repGained, missionId } = req.body;
  const profileIndex = userProfiles.findIndex(p => p.uid === req.params.uid);
  if (profileIndex === -1) {
    return res.status(404).json({ error: "Citizen profile not found." });
  }

  const profile = userProfiles[profileIndex];
  profile.reputation += Number(repGained || 0);

  if (missionId && !profile.completedMissionsList.includes(missionId)) {
    profile.completedMissionsList.push(missionId);
    profile.missionsCompleted += 1;
  }

  // Calculate Rank Progression path based strictly on RP
  // citizen < scout < verifier < inspector < guardian < community hero
  const rp = profile.reputation;
  let newRank: any = "Citizen";
  if (rp >= 2000) newRank = "Community Hero";
  else if (rp >= 1200) newRank = "Guardian";
  else if (rp >= 600) newRank = "Inspector";
  else if (rp >= 300) newRank = "Verifier";
  else if (rp >= 100) newRank = "Scout";

  if (newRank !== profile.rank) {
    profile.rank = newRank;
    profile.achievements.push({
      id: `rank-${newRank.toLowerCase()}`,
      title: `${newRank} Unlocked`,
      description: `Ascended to the glorious rank of ${newRank}!`,
      icon: "Award",
      unlockedAt: new Date().toISOString()
    });
  }

  userProfiles[profileIndex] = profile;
  res.json(profile);
});

// Run AI Mission Generator or fetch Active List
app.get("/api/missions", (req, res) => {
  res.json(missions);
});

// Accept & execute a mission
app.post("/api/missions/:id/complete", (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "Identity token is missing." });
  }

  const missionIndex = missions.findIndex(m => m.id === req.params.id);
  if (missionIndex === -1) {
    return res.status(404).json({ error: "Mission does not exist in Mission Control." });
  }

  const mission = missions[missionIndex];
  
  // Award rewards to user first
  const profileIndex = userProfiles.findIndex(p => p.uid === uid);
  if (profileIndex !== -1) {
    const p = userProfiles[profileIndex];
    if (p.completedMissionsList.includes(mission.id)) {
      return res.status(400).json({ error: "You have already completed this mission voucher." });
    }
    
    p.reputation += mission.repReward;
    p.completedMissionsList.push(mission.id);
    p.missionsCompleted += 1;

    // Check rank based strictly on RP
    let nRank: any = "Citizen";
    if (p.reputation >= 2000) nRank = "Community Hero";
    else if (p.reputation >= 1200) nRank = "Guardian";
    else if (p.reputation >= 600) nRank = "Inspector";
    else if (p.reputation >= 300) nRank = "Verifier";
    else if (p.reputation >= 100) nRank = "Scout";
    p.rank = nRank;

    userProfiles[profileIndex] = p;
  }

  // Remove or update target issue logic if needed
  if (mission.targetIssueId) {
    const targetIssue = issues.find(i => i.id === mission.targetIssueId);
    if (targetIssue) {
      if (targetIssue.verifiedUsers && !targetIssue.verifiedUsers.includes(uid)) {
        if (!targetIssue.verifiedUsers) targetIssue.verifiedUsers = [];
        targetIssue.verifiedUsers.push(uid);
        targetIssue.verificationsCount += 1;
        targetIssue.confidenceScore = Math.min(99, Math.round(targetIssue.confidenceScore + 10));
      }
      targetIssue.timeline.push({
        id: `t-m-${Date.now()}`,
        status: "Verification",
        title: "Mission Audit Verified",
        description: `Citizen completed the verification checklist mission: "${mission.title}".`,
        timestamp: new Date().toISOString(),
        actorName: "Alex Carter"
      });
    }
  }

  // Remove the mission or mark completed
  mission.status = "Completed";
  missions[missionIndex] = mission;

  res.json({ success: true, userProfile: userProfiles.find(p => p.uid === uid) });
});

// Dynamic cluster endpoint
app.get("/api/clusters", (req, res) => {
  res.json(clusters);
});

// Neighborhood Health Score generator
app.get("/api/neighborhood-health", (req, res) => {
  const activeCount = issues.filter(i => i.status !== "Resolved").length;
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const total = issues.length;

  const resolutionRate = total > 0 ? (resolvedCount / total) * 100 : 80;
  
  // Cleanliness derived from Waste Management issues
  const activeWaste = issues.filter(i => i.category === "Waste Management" && i.status !== "Resolved").length;
  const cleanliness = Math.max(30, 100 - activeWaste * 12);

  // Safety derived from critical Public Safety + lighting
  const activeCritical = issues.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
  const activeStreetlights = issues.filter(i => i.category === "Streetlight" && i.status !== "Resolved").length;
  const safety = Math.max(25, 100 - (activeCritical * 15 + activeStreetlights * 5));

  // Infrastructure condition derived from Potholes + road damage + leakage
  const activeInfra = issues.filter(i => (i.category === "Pothole" || i.category === "Road Damage" || i.category === "Water Leakage") && i.status !== "Resolved").length;
  const infrastructure = Math.max(20, 100 - activeInfra * 10);

  // Community participation is derived from total verifications across the grid
  const totalVerifs = issues.reduce((sum, item) => sum + item.verificationsCount, 0);
  const participation = Math.min(100, Math.round(50 + totalVerifs * 1.5));

  const score = Math.round((infrastructure * 0.3) + (safety * 0.3) + (cleanliness * 0.2) + (participation * 0.2));

  res.json({
    score,
    infrastructure,
    safety,
    cleanliness,
    participation,
    trend: "up" as const,
    rankInCity: 4,
    totalAreas: 24
  });
});

// Predictive AI Insights Feed
app.get("/api/predictive-insights", (req, res) => {
  const criticalCount = issues.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
  const streetlightCount = issues.filter(i => i.category === "Streetlight" && i.status !== "Resolved").length;
  const waterLeakCount = issues.filter(i => i.category === "Water Leakage" && i.status !== "Resolved").length;

  const insights: any[] = [];

  if (waterLeakCount >= 1) {
    insights.push({
      id: "pi-1",
      type: "risk",
      title: "Elevated Hydraulic Sub-Surface Strain",
      description: "Pressure telemetry near Mission St indicates potential structural soil washouts. Advise preemptive scan prior to asphalt cracks.",
      severity: "high",
      timeframe: "Next 48-72 hours"
    });
  }

  insights.push({
    id: "pi-2",
    type: "trend",
    title: "Micro-mobility Incident Escalation Risk",
    description: "Concentration of un-resolved path-pothole markers on Outer Ring Road intersects with dense commuter patterns. Probability of bicycle incidents raised by +42%.",
    severity: "medium",
    timeframe: "Next 7 days"
  });

  if (streetlightCount >= 1) {
    insights.push({
      id: "pi-3",
      type: "growth",
      title: "Pedestrian Darkness Zone Expansion",
      description: "Overlapping inactive luminaries create contiguous darkness corridors near Golden Gate Ave. Recommendation: Deploy portable solar grid assist.",
      severity: "medium",
      timeframe: "Within 4 days"
    });
  }

  insights.push({
    id: "pi-4",
    type: "participation",
    title: "Unprecedented Citizen Engagement High",
    description: "Verification upvoting rate has increased +64% this cycle. Confidence scores are climbing under record crowdsourced validation.",
    severity: "low",
    timeframe: "Current Cycle"
  });

  res.json(insights);
});


// Vite Dev Server / Static Ingress setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mounting Vite middleware in development
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server connected.");
  } else {
    // Serves production compiled assets inside /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Community Hero backend online, listening exclusively on http://0.0.0.0:${PORT}`);
  });
}

startServer();
