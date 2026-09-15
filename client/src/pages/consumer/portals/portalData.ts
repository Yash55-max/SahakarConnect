import {
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
} from '../../../components/common/Icons';

export interface ServicePackage {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  baseRate: number;
  nsqfLevel: number;
  turnaroundTime: string;
  description: string;
  includes: string[];
}

export interface TradePortalConfig {
  id: 'plumbing' | 'electrical' | 'carpentry' | 'appliances';
  name: string;
  hindiName: string;
  societyName: string;
  statutoryCode: string;
  icon: any;
  accentColor: string;
  badgeClass: string;
  activeTradesmen: number;
  averageRating: number;
  completedJobsCount: number;
  inspectionWarrantyDays: number;
  safetyChecklist: string[];
  packages: ServicePackage[];
}

export const TRADE_PORTALS: Record<string, TradePortalConfig> = {
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing & Sanitary Works Portal',
    hindiName: 'नलसाजी एवं स्वच्छता सेवा सहकारी पोर्टल',
    societyName: 'Delhi Urban Plumbers & Sanitary Technicians PSCS',
    statutoryCode: 'BIS 12183:2020 / Uniform Illustrated Plumbing Code - India',
    icon: PlumbingIcon,
    accentColor: '#0284c7',
    badgeClass: 'bg-primary text-white',
    activeTradesmen: 18,
    averageRating: 4.9,
    completedJobsCount: 1420,
    inspectionWarrantyDays: 30,
    safetyChecklist: [
      'PEX & CPVC pressure-tested fittings',
      'Lead-free brass valves and eco-aerators',
      'Underground acoustic leak sensor diagnosis',
      'Statutory 30-day post-service joint warranty',
    ],
    packages: [
      {
        id: 'plumb-leakage-joint',
        name: 'Concealed Pipeline & Joint Leakage Repair',
        hindiName: 'पाइपलाइन व जोड़ों के रिसाव की मरम्मत',
        category: 'Plumbing',
        baseRate: 750,
        nsqfLevel: 4,
        turnaroundTime: '45-60 mins',
        description: 'Acoustic detection and precision repair of concealed wall joints, PPR/CPVC lines, and shower mixers without unnecessary masonry demolition.',
        includes: ['Pressure leak acoustic testing', 'High-grade solvent fusion repair', 'Water flow balancing test'],
      },
      {
        id: 'plumb-sanitary-fitting',
        name: 'Complete Bathroom Sanitary Fixture Overhaul',
        hindiName: 'बाथरूम सेनेटरी फिटिंग स्थापना व मरम्मत',
        category: 'Plumbing',
        baseRate: 1400,
        nsqfLevel: 5,
        turnaroundTime: '90-120 mins',
        description: 'Comprehensive installation and realignment of wall-hung commodes, concealed cisterns, thermostatic diverters, and health faucets.',
        includes: ['Dual-flush valve calibration', 'Anti-siphon trap alignment', 'Silicone sanitary waterproofing'],
      },
      {
        id: 'plumb-motor-pump',
        name: 'Overhead Tank & Pressure Booster Pump Setup',
        hindiName: 'पानी की मोटर व प्रेशर बूस्टर पंप मरम्मत',
        category: 'Plumbing',
        baseRate: 1100,
        nsqfLevel: 4,
        turnaroundTime: '60-90 mins',
        description: 'Submersible and centrifugal pump wiring, automatic float switch installation, check-valve replacement, and air-lock bleeding.',
        includes: ['Motor winding insulation test', 'Auto-cutoff sensor calibration', 'Air-pocket purge & pressure check'],
      },
      {
        id: 'plumb-drain-cleaning',
        name: 'Heavy-Duty Sewer Line & Trap Jetting',
        hindiName: 'सीवर लाइन व ड्रेन ब्लॉकेज की गहन सफाई',
        category: 'Plumbing',
        baseRate: 950,
        nsqfLevel: 3,
        turnaroundTime: '60-80 mins',
        description: 'Mechanical snake and pressurized hydro-jet clearing of solid grease, roots, and blockages in main kitchen/bathroom discharge shafts.',
        includes: ['Rotary snake line clearing', 'Bio-enzyme pipe conditioning', 'Odor-trap seal inspection'],
      },
      {
        id: 'plumb-water-purifier-piping',
        name: 'Central RO & Commercial Water Line Routing',
        hindiName: 'आरओ व कमर्शियल वाटर लाइन पाइपलाइन स्थापना',
        category: 'Plumbing',
        baseRate: 850,
        nsqfLevel: 4,
        turnaroundTime: '45-60 mins',
        description: 'Food-grade multi-layer composite piping installation for domestic and commercial water filtration systems with independent bypass valves.',
        includes: ['Food-grade composite tube routing', 'T-joint isolation valve installation', 'Static pressure leak testing'],
      },
    ],
  },

  electrical: {
    id: 'electrical',
    name: 'Electrical Engineering & Wiremen Portal',
    hindiName: 'विद्युत अभियांत्रिकी एवं वायरमैन सहकारी पोर्टल',
    societyName: 'Delhi Power & Precision Electricians PSCS',
    statutoryCode: 'Central Electricity Authority (CEA) / IS 732 Wiring Regulations',
    icon: ElectricalIcon,
    accentColor: '#d97706',
    badgeClass: 'bg-warning text-dark',
    activeTradesmen: 24,
    averageRating: 4.85,
    completedJobsCount: 1890,
    inspectionWarrantyDays: 45,
    safetyChecklist: [
      'Digital insulation resistance testing (Megger)',
      'Class-1 calibrated multi-meters & insulated tools (1000V rated)',
      'Earthing loop impedance validation (IS 3043)',
      'Certified wireman licensing under Indian Electricity Rules',
    ],
    packages: [
      {
        id: 'elec-short-circuit-mcb',
        name: 'Short Circuit Tripping Diagnosis & MCB Array Balancing',
        hindiName: 'शॉर्ट सर्किट जांच व एमसीबी लोड संतुलन',
        category: 'Electrical',
        baseRate: 1200,
        nsqfLevel: 5,
        turnaroundTime: '60-90 mins',
        description: 'Thermal camera diagnosis of overloaded phases, neutral leakage detection, and installation of dual-pole RCCB / MCB isolators.',
        includes: ['Thermal hotspot scan', 'RCCB 30mA earth-leakage trip test', 'Sub-circuit load redistribution'],
      },
      {
        id: 'elec-inverter-battery',
        name: 'Inverter UPS Installation & Dedicated Wiring Line',
        hindiName: 'इनवर्टर यूपीएस स्थापना व बैकअप लाइन वायरिंग',
        category: 'Electrical',
        baseRate: 1500,
        nsqfLevel: 4,
        turnaroundTime: '90-120 mins',
        description: 'Pure sine wave inverter connection, tubular battery acid level & terminal treatment, and dedicated bypass switch integration.',
        includes: ['High-current battery terminal lugs', 'Bypass rotary switch installation', 'Neutral backfeed isolation check'],
      },
      {
        id: 'elec-copper-earthing',
        name: 'Chemical / Copper Plate Earthing System Overhaul',
        hindiName: 'अर्थिंग प्रणाली स्थापना व प्रतिरोध जांच',
        category: 'Electrical',
        baseRate: 2200,
        nsqfLevel: 5,
        turnaroundTime: '120-180 mins',
        description: 'Excavation, copper plate / GI pipe bonding, BFC chemical compound backfill, and earth pit resistance verification under 2 Ohms.',
        includes: ['Earth pit resistance verification', 'Copper strip bonding', 'Pit inspection chamber installation'],
      },
      {
        id: 'elec-switchboard-rewire',
        name: 'Modular Switchboard Upgrade & Smart Dimmer Fitting',
        hindiName: 'मॉड्यूलर स्विचबोर्ड स्थापना व स्मार्ट वायरिंग',
        category: 'Electrical',
        baseRate: 850,
        nsqfLevel: 3,
        turnaroundTime: '45-60 mins',
        description: 'Replacement of legacy switches with fire-retardant polycarbonate modular plates, smart Wi-Fi relays, and heavy-duty 16A AC sockets.',
        includes: ['FR grade copper jumpering', 'Concealed metal box anchoring', 'Socket load continuity test'],
      },
      {
        id: 'elec-chandelier-lighting',
        name: 'Heavy Decorative Lighting & False Ceiling Fixtures',
        hindiName: 'झूमर व फॉल्स सीलिंग लाइट स्थापना',
        category: 'Electrical',
        baseRate: 950,
        nsqfLevel: 4,
        turnaroundTime: '60-90 mins',
        description: 'Precision ceiling stud anchoring, concealed profile LED driver heat sinking, and dimmable driver synchronization.',
        includes: ['Ceiling load test anchor', 'SMPS power supply driver check', 'Multi-channel remote pairing'],
      },
    ],
  },

  carpentry: {
    id: 'carpentry',
    name: 'Artisans & Woodcraftsmen Cooperative Portal',
    hindiName: 'काष्ठशिल्प एवं बढ़ईगीरी कारीगर सहकारी पोर्टल',
    societyName: 'Delhi Craftsmen & Wood Technicians PSCS',
    statutoryCode: 'IS 2202 Timber Standards / MSDE Joinery Standards Level 4',
    icon: CarpentryIcon,
    accentColor: '#b45309',
    badgeClass: 'bg-danger text-white',
    activeTradesmen: 15,
    averageRating: 4.92,
    completedJobsCount: 1150,
    inspectionWarrantyDays: 60,
    safetyChecklist: [
      'Kiln-seasoned anti-termite treated wood',
      'Laser-aligned soft-close hydraulic hinges',
      'High-security multi-point deadbolt alignment',
      'VOC-compliant eco-friendly PU / melamine sealants',
    ],
    packages: [
      {
        id: 'carp-door-lock-security',
        name: 'High-Security Deadbolt Lock & Hinges Alignment',
        hindiName: 'सुरक्षा लॉक स्थापना व दरवाजा संरेखण',
        category: 'Carpentry',
        baseRate: 850,
        nsqfLevel: 4,
        turnaroundTime: '45-60 mins',
        description: 'Mortise lock routing, magnetic biometric lock installation, door planer leveling, and heavy-duty stainless steel ball-bearing hinges fitting.',
        includes: ['Chisel mortise lock routing', 'Door sag and clearance truing', 'Striker plate anti-pry reinforcement'],
      },
      {
        id: 'carp-modular-kitchen-service',
        name: 'Modular Kitchen Drawers & Hydraulic Lift Repair',
        hindiName: 'मॉड्यूलर किचन चैनल व हाइड्रोलिक हिंज मरम्मत',
        category: 'Carpentry',
        baseRate: 1350,
        nsqfLevel: 5,
        turnaroundTime: '90-120 mins',
        description: 'Tandem box realignment, soft-close hydraulic strut replacement, cutlery tray truing, and water-resistant edge banding touch-up.',
        includes: ['Tandem drawer slide leveling', 'Gas strut pressure renewal', 'Moisture barrier silicone seal'],
      },
      {
        id: 'carp-furniture-assembly',
        name: 'Engineered Wood Wardrobe & Bed Assembly',
        hindiName: 'अलमारी व बेड असेंबली एवं मजबूतीकरण',
        category: 'Carpentry',
        baseRate: 1100,
        nsqfLevel: 4,
        turnaroundTime: '90-150 mins',
        description: 'Precision minifix cam-lock assembly, back-panel square squaring, headboard anchoring, and heavy load reinforcement brackets.',
        includes: ['Cam-lock and dowel alignment', 'Anti-tipping wall tether install', 'Drawer slider glide lubrication'],
      },
      {
        id: 'carp-wood-polishing',
        name: 'PU / Melamine Wood Polish & Surface Restoration',
        hindiName: 'लकड़ी की पॉलिश व सतह नवीनीकरण',
        category: 'Carpentry',
        baseRate: 1800,
        nsqfLevel: 4,
        turnaroundTime: '180-240 mins',
        description: 'Multi-grit surface sanding, grain filler application, stain matching, and high-gloss / matte polyurethane protective coat spraying.',
        includes: ['Multi-grit orbital sanding', 'Teak/Walnut tone color matching', 'Dual-coat scratch-proof sealer'],
      },
      {
        id: 'carp-custom-partition',
        name: 'Acoustic Wall Paneling & Room Divider Partition',
        hindiName: 'दीवार पैनलिंग व पार्टीशन फ्रेमिंग कार्य',
        category: 'Carpentry',
        baseRate: 2400,
        nsqfLevel: 5,
        turnaroundTime: '180-300 mins',
        description: 'Aluminium/wood sub-frame fabrication, soundproofing rockwool infill, veneer-faced fluted panels, and concealed wire chases.',
        includes: ['Framework plumb line leveling', 'Concealed wiring conduit route', 'Fluted panel interlocking'],
      },
    ],
  },

  appliances: {
    id: 'appliances',
    name: 'Electro-Mechanical & Home Appliance Portal',
    hindiName: 'घरेलू उपकरण एवं शीतलन सेवा सहकारी पोर्टल',
    societyName: 'Delhi Electro-Mechanical Appliance Technicians PSCS',
    statutoryCode: 'Bureau of Energy Efficiency (BEE) / MoEFCC Ozone Depleting Substances Rules',
    icon: ApplianceIcon,
    accentColor: '#4f46e5',
    badgeClass: 'bg-info text-dark',
    activeTradesmen: 20,
    averageRating: 4.88,
    completedJobsCount: 2100,
    inspectionWarrantyDays: 45,
    safetyChecklist: [
      'Digital manifold pressure gauges (R32 / R410A / R600a)',
      '100% genuine copper replacement tubing and filter driers',
      'High-pressure dual-pump jet washing jackets',
      'Ohmic motor winding and capacitor capacitance verification',
    ],
    packages: [
      {
        id: 'app-ac-jet-service',
        name: 'Inverter Split AC Foam Jet Deep Servicing & Coil Wash',
        hindiName: 'इन्वर्टर एसी फोम जेट वाश व संपूर्ण सर्विस',
        category: 'Appliances',
        baseRate: 799,
        nsqfLevel: 4,
        turnaroundTime: '60-80 mins',
        description: 'Indoor waterproof jacket assembly, biodegradable chemical foam coil wash, outdoor condenser pressure jetting, and suction pressure check.',
        includes: ['Blower wheel mold removal', 'Condensate drain line flush', 'Sub-cooling thermal delta check'],
      },
      {
        id: 'app-ac-gas-charge',
        name: 'AC Nitrogen Leak Testing & Zero-Moisture Gas Refill',
        hindiName: 'एसी गैस रिफिल व नाइट्रोजन लीकेज टेस्ट',
        category: 'Appliances',
        baseRate: 2200,
        nsqfLevel: 5,
        turnaroundTime: '90-120 mins',
        description: 'High-pressure nitrogen leak test (350 PSI), flare nut brazing, two-stage vacuum pump evacuation, and gram-accurate electronic gas recharge.',
        includes: ['350 PSI Nitrogen pressure hold', 'Deep vacuum to 500 microns', 'Digital weigh-scale gas injection'],
      },
      {
        id: 'app-washing-machine-overhaul',
        name: 'Front / Top Load Washing Machine Drum & Spider Repair',
        hindiName: 'वाशिंग मशीन ड्रम, बेयरिंग व मोटर मरम्मत',
        category: 'Appliances',
        baseRate: 1250,
        nsqfLevel: 4,
        turnaroundTime: '90-120 mins',
        description: 'Vibration balancing, tub bearing and oil seal replacement, drain motor unclogging, and digital PCB error code debugging.',
        includes: ['Heavy-duty bearing puller service', 'Water inlet solenoid test', 'Spin cycle dynamic balancing test'],
      },
      {
        id: 'app-refrigerator-cooling',
        name: 'Frost-Free Refrigerator Defrost & Compressor Overhaul',
        hindiName: 'फ्रिज कूलिंग समस्या, थर्मोस्टेट व कंप्रेसर जांच',
        category: 'Appliances',
        baseRate: 1150,
        nsqfLevel: 4,
        turnaroundTime: '60-90 mins',
        description: 'Bimetal thermostat testing, defrost heater continuity check, fan motor lubrication, and inverter inverter inverter driver board diagnostics.',
        includes: ['Defrost timer & sensor check', 'Capillary line vacuum clearance', 'Door gasket suction test'],
      },
      {
        id: 'app-ro-water-purifier',
        name: 'Multi-Stage RO + UV Water Purifier Membrane Renewal',
        hindiName: 'आरओ वाटर प्यूरीफायर मेंब्रेन व संपूर्ण सर्विस',
        category: 'Appliances',
        baseRate: 950,
        nsqfLevel: 4,
        turnaroundTime: '45-60 mins',
        description: 'Sediment and carbon pre-filter replacement, 80 GPD high-TDS membrane test, booster pump pressure check, and UV lamp verification.',
        includes: ['TDS reduction level testing', 'Booster pump 100 PSI gauge test', 'Food-grade sanitization flush'],
      },
    ],
  },
};
