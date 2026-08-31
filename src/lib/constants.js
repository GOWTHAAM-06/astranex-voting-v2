export const POSITIONS = [
  { id: 'president', label: 'President', icon: 'Crown' },
  { id: 'vice_president', label: 'Vice President', icon: 'Shield' },
  { id: 'secretary', label: 'Secretary', icon: 'FileText' },
  { id: 'joint_secretary', label: 'Joint Secretary', icon: 'Files' },
  { id: 'treasurer', label: 'Treasurer', icon: 'Wallet' },
  { id: 'technical_lead', label: 'Technical Lead', icon: 'Code' },
  { id: 'deputy_technical_lead', label: 'Deputy Technical Lead', icon: 'Terminal' },
  { id: 'discipline_lead', label: 'Discipline Lead Head', icon: 'Scale' },
]

export const SEAT_CAPACITY = {
  president: 1,
  vice_president: 1,
  secretary: 1,
  joint_secretary: 2,
  treasurer: 1,
  technical_lead: 1,
  deputy_technical_lead: 2,
  discipline_lead: 1,
}

export const ELECTION_YEAR = new Date().getFullYear()

export const APP_NAME = 'ASTRANEX'
export const APP_TAGLINE = 'Department Association Election'