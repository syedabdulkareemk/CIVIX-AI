export interface CityDetails {
  lat: number;
  lng: number;
  state: string;
  pincodeRange: [number, number];
  localities: string[];
  streets: string[];
  landmarks: string[];
}

export const cityData: { [key: string]: CityDetails } = {
  "Bengaluru": {
    lat: 12.9716,
    lng: 77.5946,
    state: "Karnataka",
    pincodeRange: [560001, 560105],
    localities: ["Koramangala", "HSR Layout Sector 2", "Indiranagar", "Whitefield", "Jayanagar", "Malleshwaram", "Sadashivanagar", "Madiwala"],
    streets: ["100 Feet Road", "80 Feet Road", "5th Cross Road", "Outer Ring Road", "Sarjapur Main Road", "Whitefield Main Road", "Brigade Road", "M.G. Road"],
    landmarks: ["outside BBMP Office", "near Silk Board Junction", "near Indiranagar Metro", "opposite Phoenix Marketcity", "near Forum Mall", "opposite Jayanagar 4th Block Complex", "near Columbia Asia Hospital", "near Manyata Tech Park"]
  },
  "Chennai": {
    lat: 13.0827,
    lng: 80.2707,
    state: "Tamil Nadu",
    pincodeRange: [600001, 600095],
    localities: ["T Nagar", "Adyar", "Mylapore", "Velachery", "Nungambakkam", "Anna Nagar", "Guindy", "Besant Nagar"],
    streets: ["Gandhi Road", "G.N. Chetty Road", "Velachery Main Road", "Sardar Patel Road", "Khader Nawaz Khan Road", "Anna Salai", "Mount Road", "Elliot's Beach Road"],
    landmarks: ["near Phoenix Marketcity", "near T Nagar Bus Terminus", "opposite Adyar Depot", "near Kapaleeshwarar Temple", "outside Nungambakkam Railway Station", "near Guindy Flyover", "opposite Besant Nagar Beach", "near Anna Arch"]
  },
  "Hyderabad": {
    lat: 17.3850,
    lng: 78.4867,
    state: "Telangana",
    pincodeRange: [500001, 500095],
    localities: ["Gachibowli", "Madhapur", "Jubilee Hills", "Banjara Hills", "Begumpet", "Kukatpally", "Secunderabad", "Charminar Area"],
    streets: ["Hitech City Road", "Gachibowli Flyover Road", "Road No. 36", "Road No. 12", "S.P. Road", "KPHB Main Road", "Begumpet Main Road", "Patny Circle Road"],
    landmarks: ["near DLF Cyber City", "opposite Inorbit Mall", "near Jubilee Hills Checkpost", "outside Taj Banjara", "near Kukatpally Metro Station", "near Begumpet Airport", "opposite Secunderabad Club", "near Charminar"]
  },
  "Mumbai": {
    lat: 19.0760,
    lng: 72.8777,
    state: "Maharashtra",
    pincodeRange: [400001, 400104],
    localities: ["Bandra West", "Andheri East", "Colaba", "Juhu", "Dadar", "Worli", "Powai", "Chembur"],
    streets: ["Linking Road", "Carter Road", "Juhu Tara Road", "Saki Naka Road", "Colaba Causeway", "Senapati Bapat Marg", "Worli Sea Face Road", "JVLR"],
    landmarks: ["near Bandstand Promenade", "outside Saki Naka Metro Station", "opposite Gateway of India", "near Juhu Beach", "near Dadar Station", "opposite Worli Naka", "near Hiranandani Gardens", "near Chembur Gymkhana"]
  },
  "Delhi": {
    lat: 28.6139,
    lng: 77.2090,
    state: "Delhi",
    pincodeRange: [110001, 110096],
    localities: ["Connaught Place", "Saket", "Karol Bagh", "Lajpat Nagar", "Rajouri Garden", "Vasant Kunj", "Dwarka", "Chandni Chowk"],
    streets: ["Inner Circle", "Press Enclave Marg", "Pusa Road", "Ring Road", "Najafgarh Road", "Nelson Mandela Marg", "Sector 6 Road", "Netaji Subhash Marg"],
    landmarks: ["near CP Circle", "opposite Select Citywalk", "near Karol Bagh Metro Station", "outside Lajpat Nagar Market", "near Rajouri Garden Mall", "opposite Ambience Mall", "near Dwarka Sector 10 Metro", "near Red Fort"]
  },
  "Pune": {
    lat: 18.5204,
    lng: 73.8567,
    state: "Maharashtra",
    pincodeRange: [411001, 411062],
    localities: ["Koregaon Park", "Kothrud", "Aundh", "Viman Nagar", "Hinjawadi", "Baner", "Hadapsar", "Deccan Gymkhana"],
    streets: ["North Main Road", "Karve Road", "DP Road", "Viman Nagar Road", "Hinjawadi Phase 1 Road", "Baner Road", "Solapur Road", "J.M. Road"],
    landmarks: ["near Lane 5", "opposite Karve Statue", "near Westend Mall", "outside Phoenix Marketcity Pune", "near Rajiv Gandhi Infotech Park", "opposite Balewadi High Street", "near Magarpatta City", "near Sambhaji Park"]
  },
  "Kolkata": {
    lat: 22.5726,
    lng: 88.3639,
    state: "West Bengal",
    pincodeRange: [700001, 700160],
    localities: ["Salt Lake Sector V", "Park Street", "Gariahat", "New Town", "Ballygunge", "Alipore", "Shambazar", "Howrah Area"],
    streets: ["Major Arterial Road", "Park Street", "Gariahat Road", "Rashbehari Avenue", "Alipore Road", "Shambazar Avenue", "Howrah Bridge Road", "Camac Street"],
    landmarks: ["near SDF Building", "opposite Flurys", "near Gariahat Crossing", "outside New Town Eco Park", "near Ballygunge Phari", "opposite Alipore Zoo", "near Shambazar Five Point Crossing", "near Howrah Station"]
  },
  "Ahmedabad": {
    lat: 23.0225,
    lng: 72.5714,
    state: "Gujarat",
    pincodeRange: [380001, 380065],
    localities: ["Satellite", "C G Road", "S G Highway", "Bodakdev", "Maninagar", "Paldi", "Navrangpura", "Ghatlodia"],
    streets: ["Satellite Road", "C G Road", "S G Highway", "Sindhu Bhavan Road", "Maninagar Crossing Road", "Paldi Road", "University Road", "Ghatlodia Road"],
    landmarks: ["near Star Bazaar", "opposite Municipal Market", "near Iscon Temple", "outside Shalby Hospital", "near Kankaria Lake", "opposite Sanskar Kendra", "near Gujarat University", "near Ghatlodia Bus Terminus"]
  },
  "Kochi": {
    lat: 9.9312,
    lng: 76.2673,
    state: "Kerala",
    pincodeRange: [682001, 682350],
    localities: ["Edappally", "Fort Kochi", "Kakkanad", "Panampilly Nagar", "Vyttila", "Marine Drive", "Kaloor", "Tripunithura"],
    streets: ["Lulu Mall Road", "KB Jacob Road", "Infopark Expressway", "Panampilly Nagar Avenue", "Vyttila Bypass", "Shanmugham Road", "Kaloor-Kadavanthra Road", "Hill Palace Road"],
    landmarks: ["near Lulu Mall", "opposite Chinese Fishing Nets", "near Infopark Phase 1", "outside Panampilly Nagar Park", "near Vyttila Mobility Hub", "opposite Marine Drive Walkway", "near Kaloor Stadium", "near Hill Palace"]
  },
  "Jaipur": {
    lat: 26.9124,
    lng: 75.7873,
    state: "Rajasthan",
    pincodeRange: [302001, 302035],
    localities: ["C Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Raja Park", "Bani Park", "Johri Bazar", "Adarsh Nagar"],
    streets: ["M.I. Road", "Calgiri Marg", "Amrapali Marg", "Mansarovar Link Road", "Raja Park Main Road", "Collectorate Road", "Johri Bazar Road", "Adarsh Nagar Road"],
    landmarks: ["near Panch Batti", "opposite GT Mall", "near National Handloom", "outside Mansarovar Metro Station", "near Raja Park Gurudwara", "near Bani Park Police Station", "near Hawa Mahal", "near Adarsh Nagar Park"]
  }
};

export const generateBelievableAddress = (lat: number, lng: number): string => {
  // Find closest city from cityData
  let nearestCity = "Bengaluru";
  let minDistance = Infinity;
  for (const [name, coords] of Object.entries(cityData)) {
    const dist = Math.hypot(coords.lat - lat, coords.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = name;
    }
  }

  const details = cityData[nearestCity];
  const state = details.state;
  
  // Use coordinates to pseudo-randomly but deterministically select address components (so same coordinate gives same address)
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 10000;
  
  const locality = details.localities[Math.floor((seed * 3) % details.localities.length)];
  const street = details.streets[Math.floor((seed * 7) % details.streets.length)];
  const pincode = Math.floor((seed % (details.pincodeRange[1] - details.pincodeRange[0] + 1)) + details.pincodeRange[0]);
  
  const houseNum = Math.floor((seed * 11) % 150) + 1;
  const housePrefixes = [`No. ${houseNum}`, `Plot ${houseNum}`, `House No. ${houseNum}`, `Flat ${houseNum + 100}`];
  const houseNo = housePrefixes[Math.floor((seed * 13) % housePrefixes.length)];

  return `${houseNo}, ${street}, ${locality}, ${nearestCity}, ${state} - ${pincode}`;
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      {
        headers: {
          "User-Agent": "CommunityHero-CivicApplet/1.0"
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (error) {
    console.warn("External reverse geocoding failed, falling back to procedural generation:", error);
  }
  
  // Fallback to procedurally generated highly believable address
  return generateBelievableAddress(lat, lng);
};
