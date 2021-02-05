//This map associates each map with its list of 4 sites
const allSites = 
    {"bank": ["Executive Lounge and CEO", "Staff Room and Open Area", "Teller's Office and Archives", "Lockers and CCTV"],
    "border": ["Customs and Supply Room", "Workshop and Ventilation", "Tellers and Bathroom", "Armory Lockers and Archives"],
    "chalet": ["Master Bedroom and Office", "Bar and Gaming Room", "Dining Room and Kitchen", "Wine Cellar and Snowmobile Garage"],
    "clubhouse": ["Gym and Bedroom", "CCTV and Cashroom", "Bar and Stock Room", "Church and Arsenal Room"],
    "coastline": ["Theater and Penthouse", "Hookah Lounge and Billiards Room", "Blue Bar and Sunrise Bar", "Service Entrance and Kitchen"],
    "consulate": ["Consul Office and Meeting Room", "Lobby and Press Room", "Garage and Cafeteria", "Tellers and Archives"],
    "kafe": ["Cocktail Lounge and Bar", "Mining Room and Fireplace Hall", "Reading Room and Fireplace Hall", "Kitchen Service and Kitchen Cooking"],
    "kanal": ["Server Room and Radar Room", "Security Room and Map Room", "Coast Guard Meeting Room and Lounge", "Supply Room and Kayaks"],
    "oregon": ["Main Dorms Hall and Kids Dorm", "Dining Hall and Kitchen", "Meeting Hall and Kitchen", "Laundry Room and Supply Room"],
    "outback": ["Games Room and Laundry Room", "Party Room and Office", "Nature Room and Bushranger Office", "Gear Store and Compressor"],
    "park": ["Office and Initiation Room", "Bunk and Day Care", "Armory and Throne Room", "Lab and Storage"],
    "skyscraper": ["Tea Room and Karaoke", "Exhibition Room and Office", "Kitchen and BBQ", "Bedroom and Bathroom"],
    "villa": ["Aviator Room and Games Room", "Trophy Room and Statuary Room", "Living Room and Library", "Dining Room and Kitchen"]
};

const maps = ["bank", "border", "chalet", "clubhouse", "coastline",
                "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
                "park", "villa"];