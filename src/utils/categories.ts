import { ExpenseCategory } from "../types";

export interface CategoryMeta {
  id: ExpenseCategory;
  label: string;
  color: string;
  bgLight: string;
  borderColor: string;
  badgeClass: string;
  iconName: string;
  description: string;
  defaultLocationSuggestions: string[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "Groceries",
    label: "Groceries",
    color: "#16a34a", // Emerald green
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    iconName: "ShoppingBag",
    description: "Supermarkets, farmer markets & everyday food supplies",
    defaultLocationSuggestions: ["Trader Joe's", "Whole Foods", "Costco", "Walmart Supercenter", "Kroger", "Aldi", "Target Groceries", "Local Farmers Market"],
  },
  {
    id: "Rent",
    label: "Rent",
    color: "#ea580c", // Orange/amber
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    iconName: "Home",
    description: "Monthly apartment or house rent payments",
    defaultLocationSuggestions: ["Landlord / Leasing Office", "Avalon Bay Communities", "Greystar Management", "Zillow Rent Pay", "Private Landlord (Venmo/Zelle)"],
  },
  {
    id: "Housing",
    label: "Housing & Repairs",
    color: "#d97706", // Amber
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    iconName: "Building2",
    description: "Mortgage, maintenance, home repairs & furniture",
    defaultLocationSuggestions: ["Home Depot", "IKEA", "Lowe's", "Ace Hardware", "Plumbing & Repairs Co", "HOA Dues Portal"],
  },
  {
    id: "Travel",
    label: "Travel & Vacations",
    color: "#2563eb", // Blue
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    iconName: "Plane",
    description: "Flights, hotels, vacation stays, rental cars",
    defaultLocationSuggestions: ["Delta Air Lines", "United Airlines", "Airbnb", "Booking.com", "Marriott Hotels", "Expedia", "Hertz Rental Car", "American Airlines"],
  },
  {
    id: "Shopping",
    label: "Shopping & Retail",
    color: "#9333ea", // Purple
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    iconName: "Package",
    description: "Clothing, gadgets, electronics, Amazon, personal goods",
    defaultLocationSuggestions: ["Amazon.com", "Target", "Apple Store", "Zara", "Nike", "Best Buy", "Nordstrom", "Sephora", "Uniqlo"],
  },
  {
    id: "Subscriptions",
    label: "Subscriptions",
    color: "#0891b2", // Cyan
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-200",
    badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-300",
    iconName: "Repeat",
    description: "Streaming, cloud storage, software, memberships & gym",
    defaultLocationSuggestions: ["Netflix", "Spotify", "Amazon Prime", "Apple iCloud / One", "YouTube Premium", "Equinox / Planet Fitness", "ChatGPT Plus", "Disney+"],
  },
  {
    id: "Food & Dining",
    label: "Food & Dining",
    color: "#e11d48", // Rose
    bgLight: "bg-rose-50",
    borderColor: "border-rose-200",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    iconName: "Utensils",
    description: "Restaurants, coffee shops, takeout & food delivery",
    defaultLocationSuggestions: ["Starbucks", "Chipotle", "DoorDash", "Uber Eats", "Sweetgreen", "Local Bistro", "Blue Bottle Coffee", "Shake Shack"],
  },
  {
    id: "Utilities",
    label: "Utilities & Bills",
    color: "#0284c7", // Sky blue
    bgLight: "bg-sky-50",
    borderColor: "border-sky-200",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    iconName: "Zap",
    description: "Electricity, water, gas, home WiFi & mobile phone",
    defaultLocationSuggestions: ["ConEdison / Power Co", "AT&T / Verizon Wireless", "Comcast Xfinity / Spectrum", "City Water Department", "National Grid Gas"],
  },
  {
    id: "Transportation",
    label: "Transportation",
    color: "#4f46e5", // Indigo
    bgLight: "bg-indigo-50",
    borderColor: "border-indigo-200",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
    iconName: "Car",
    description: "Fuel, gas stations, rideshare (Uber/Lyft), transit & parking",
    defaultLocationSuggestions: ["Shell Gas Station", "Uber", "Lyft", "Chevron", "Metro Transit Pass", "SpotHero Parking", "EV Supercharger"],
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    color: "#c026d3", // Fuchsia
    bgLight: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    badgeClass: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
    iconName: "Film",
    description: "Movies, concerts, events, gaming & sporting matches",
    defaultLocationSuggestions: ["AMC Theatres", "Ticketmaster", "PlayStation Network / Steam", "Live Nation Concerts", "Topgolf", "Board Game Cafe"],
  },
  {
    id: "Health & Medical",
    label: "Health & Medical",
    color: "#059669", // Teal/Emerald
    bgLight: "bg-teal-50",
    borderColor: "border-teal-200",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-300",
    iconName: "HeartPulse",
    description: "Doctor visits, pharmacy, dental care & wellness",
    defaultLocationSuggestions: ["CVS Pharmacy", "Walgreens", "Quest Diagnostics", "CityMD Urgent Care", "Dental Studio", "One Medical Clinic"],
  },
  {
    id: "Education",
    label: "Education & Courses",
    color: "#7c3aed", // Violet
    bgLight: "bg-violet-50",
    borderColor: "border-violet-200",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-300",
    iconName: "GraduationCap",
    description: "Books, university, online courses & tutorials",
    defaultLocationSuggestions: ["Coursera", "Udemy", "Barnes & Noble", "O'Reilly Learning", "University Bookstore"],
  },
  {
    id: "Personal Care",
    label: "Personal Care",
    color: "#db2777", // Pink
    bgLight: "bg-pink-50",
    borderColor: "border-pink-200",
    badgeClass: "bg-pink-100 text-pink-800 border-pink-300",
    iconName: "Sparkles",
    description: "Haircuts, salon, grooming & cosmetics",
    defaultLocationSuggestions: ["Local Barber / Hair Salon", "Ulta Beauty", "Massage Envy", "Nail Studio"],
  },
  {
    id: "Investments",
    label: "Investments & Savings",
    color: "#15803d", // Deep green
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
    badgeClass: "bg-green-100 text-green-800 border-green-300",
    iconName: "TrendingUp",
    description: "Index funds, stock market, retirement (401k/IRA)",
    defaultLocationSuggestions: ["Vanguard", "Fidelity Investments", "Robinhood", "Charles Schwab", "Wealthfront"],
  },
  {
    id: "Salary / Income",
    label: "Salary / Income",
    color: "#10b981", // Bright emerald
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    iconName: "DollarSign",
    description: "Monthly salary, freelance earnings, dividends",
    defaultLocationSuggestions: ["Employer Payroll (Direct Deposit)", "Freelance Client Payment", "Stripe Payout", "Consulting Fee"],
  },
  {
    id: "Other",
    label: "Other Expenses",
    color: "#64748b", // Slate
    bgLight: "bg-slate-50",
    borderColor: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    iconName: "MoreHorizontal",
    description: "Miscellaneous and uncategorized expenses",
    defaultLocationSuggestions: ["Local Store", "ATM Cash Withdrawal", "Post Office / USPS", "Gift Shop"],
  },
];

export function getCategoryMeta(category: ExpenseCategory): CategoryMeta {
  const found = CATEGORIES.find((c) => c.id === category);
  if (found) return found;
  return CATEGORIES[CATEGORIES.length - 1]; // Fallback to 'Other'
}
