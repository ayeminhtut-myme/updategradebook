export type TopicScore = {
  topic: string
  p: number
  a: number
  c: number
  m: number
  l: number
  total: number
}

export type Student = {
  id: string
  name: string
  cohort: string
  place: string
  school: string
  progress: number
  topics: TopicScore[]
}

// Component grading categories shown as columns in the expanded breakdown.
export const topicColumns = ['လေ့လာမှု', 'တက်ရောက်မှု', 'သင်ခန်းစာအလိုက်', 'လစဉ်စစ်ဆေးမှု', 'ဘာသာရပ်တတ်မြှောက်မှု'] as const

// Every course contains exactly 8 topics, numbered (၁)–(၈).
const topicLabels = ['(၁)', '(၂)', '(၃)', '(၄)', '(၅)', '(၆)', '(၇)', '(၈)']

// Deterministic pseudo-random generator so breakdowns are stable across renders.
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Real course structure (see RealData.png) — every course has exactly 8 topics
// and the grading categories are weighted so the breakdown totals 100%:
//   လေ့လာမှု 10%           → 1.25% per topic (10% ÷ 8 topics)
//   တက်ရောက်မှု 10%         → 1.25% per topic (10% ÷ 8 topics)
//   သင်ခန်းစာအလိုက် 30%      → 3.75% per topic (30% ÷ 8 topics)
//   လစဉ်စစ်ဆေးမှု 20%       → two 10% monthly checks on topics (၃) and (၆)
//   ဘာသာရပ်တတ်မြှောက်မှု 30%   → one 30% final on topic (၈)
const P_MAX = 1.25
const A_MAX = 1.25
const C_MAX = 3.75
const M_MAX = 10
const L_MAX = 30
const MONTHLY_CHECK_TOPIC_INDEXES = [2, 5] // topics (၃) and (၆)
const FINAL_TOPIC_INDEX = 7 // topic (၈)

function makeTopics(seedKey: string, progress: number): TopicScore[] {
  const seed = seedKey.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) + Math.round(progress)
  const rand = seeded(seed)
  // Grade items scale with the student's overall progress, so the breakdown
  // total tracks the Progress column (a 100% student totals 100%).
  const ratio = Math.min(1, Math.max(0, progress / 100))
  return topicLabels.map((topic, index) => {
    // Scale each topic's activity by the student's overall progress.
    // A fully completed student (100%) has every topic active.
    const active = ratio >= 1 || rand() < Math.min(0.95, 0.25 + progress / 100)
    const cell = (max: number) => {
      if (!active) return 0
      // Jitter stays >= 1 so a fully completed student (ratio = 1) always
      // saturates at the category maximum, matching RealData.png.
      const v = max * ratio * (1 + rand() * 0.2)
      return Math.round(Math.min(max, v) * 100) / 100
    }
    const p = cell(P_MAX)
    const a = cell(A_MAX)
    const c = cell(C_MAX)
    const m = MONTHLY_CHECK_TOPIC_INDEXES.includes(index) ? cell(M_MAX) : 0
    const l = index === FINAL_TOPIC_INDEX ? cell(L_MAX) : 0
    const total = Math.round((p + a + c + m + l) * 100) / 100
    return { topic, p, a, c, m, l, total }
  })
}

export type Course = {
  id: string
  title: string
  titleMm?: string
  average: number
  activeCount: number
  totalCount: number
  cached: boolean
  students: Student[]
  /** Region dataset metadata — drives the cascading report filters */
  schoolId?: string
  levelId?: string
  teachers?: string[]
}

export type LevelGroup = {
  id: string
  label: string
  labelMm: string
  courses: Course[]
}

export type RoleCapability = {
  role: string
  label: string
  filter: boolean
  result: boolean
  schedule: boolean
  record: boolean
}

export const permissionMatrix: RoleCapability[] = [
  { role: 'manager', label: 'မန်နေဂျာ', filter: true, result: true, schedule: true, record: true },
  { role: 'editingteacher', label: 'ဆရာ', filter: true, result: true, schedule: false, record: false },
  { role: 'teacher', label: 'အကူဆရာ', filter: true, result: true, schedule: false, record: false },
  { role: 'student', label: 'ကျောင်းသား', filter: true, result: true, schedule: false, record: false },
  { role: 'guest', label: 'အပြင်လူ', filter: false, result: false, schedule: false, record: false },
  { role: 'user', label: 'မှတ်ပုံတင်ထားသူ', filter: false, result: false, schedule: false, record: false },
  { role: 'frontpage', label: 'မှတ်ပုံတင်မထားသောသူ', filter: false, result: false, schedule: false, record: false },
  { role: 'coursecreator', label: 'ဘာသာရပ်ဖန်တီးသူ', filter: true, result: true, schedule: false, record: false },
  { role: 'editingteacher2', label: 'ဆရာ ၂', filter: false, result: false, schedule: false, record: false },
  { role: 'ca', label: 'သင်ခန်းစာစီစဉ်သူ', filter: false, result: false, schedule: false, record: false },
]


// ---------------------------------------------------------------------------
// Role profiles — who is currently looking at the report. This drives the
// profile switcher at the top right of the result pane and mirrors the
// permission matrix above: a manager sees everything, a teacher only the
// filter + result sections, and a student only their own result (no filter).
// ---------------------------------------------------------------------------
export type AppRole = 'manager' | 'teacher' | 'student'

export type RoleCapabilities = {
  /** Sidebar custom filter section (အသေးစိတ်ရှာမယ်) */
  filter: boolean
  /** Result pane (ရမှတ်ကြည့်မယ်) */
  result: boolean
  /** When true the result pane is trimmed down to the viewer's own rows only */
  ownResultOnly: boolean
  /** Learner scanner panel (လေ့လာသူများစာရင်း) */
  scanner: boolean
  /** Auto email schedule panel (အလိုအလျောက်ပို့မယ်) */
  schedule: boolean
  /** Delivery records panel (ပို့ပြီးမှတ်တမ်းကြည့်မယ်) */
  record: boolean
  /** Role permission matrix panel (လုပ်ဆောင်ခွင့်များ) */
  permissions: boolean
}

export type RoleProfile = {
  role: AppRole
  labelMm: string
  labelEn: string
  /** Short summary of what this role is allowed to see */
  hintMm: string
  /** Demo identity used while previewing the student's own-result view */
  demoUser?: string
  can: RoleCapabilities
}

export const roleProfiles: RoleProfile[] = [
  {
    role: 'manager',
    labelMm: 'မန်နေဂျာ',
    labelEn: 'Manager',
    // Regional manager demo account — restricted to his own region's schools
    // (see sagaingSchools below and components/manager-region-map.tsx).
    demoUser: 'SAGACR02',
    hintMm: 'စစ်ကိုင်းတိုင်းအတွင်းရှိ အတန်းများကိုသာ ကြည့်ရှုနိုင်သည်',
    can: {
      filter: true,
      result: true,
      ownResultOnly: false,
      scanner: true,
      schedule: true,
      record: true,
      permissions: true,
    },
  },
  {
    role: 'teacher',
    labelMm: 'ဆရာ',
    labelEn: 'Teacher',
    // Demo teacher account — the filter pool and the result pane are scoped to
    // only the courses this teacher actually teaches (getCoursesForTeacher).
    demoUser: 'YaOoNaTER01',
    hintMm: 'မိမိ သင်ကြားနေသော အတန်းနှင့် ဘာသာရပ်များကိုသာ ကြည့်ရှုနိုင်သည်',
    can: {
      filter: true,
      result: true,
      ownResultOnly: false,
      scanner: false,
      schedule: false,
      record: false,
      permissions: false,
    },
  },
  {
    role: 'student',
    labelMm: 'ကျောင်းသား',
    labelEn: 'Student',
    hintMm: 'မိမိ၏ ရမှတ်ကိုသာ ကြည့်ရှုနိုင်သည်',
    demoUser: 'SK usr01',
    can: {
      filter: false,
      result: true,
      ownResultOnly: true,
      scanner: false,
      schedule: false,
      record: false,
      permissions: false,
    },
  },
]

/** The demo student account used to preview the student's own-result view. */
export const OWN_STUDENT_ID = 'SK usr01'

const cohortName = 'Gradebook Testers'

function makeStudents(
  entries: [string, number][],
  scope?: { place?: string; school?: string },
): Student[] {
  return entries.map(([name, progress]) => ({
    id: name,
    name,
    cohort: cohortName,
    place: scope?.place ?? '—',
    school: scope?.school ?? '—',
    progress,
    topics: makeTopics(name, progress),
  }))
}

// ---------------------------------------------------------------------------
// Sagaing region dataset — the "real data" the whole report runs on now.
// A regional manager (demo account SAGACR02) sees the schools inside his own
// region; node coordinates are hand-placed % positions on the game-map canvas
// (components/manager-region-map.tsx) and every course carries school, level
// and teacher metadata so the sidebar filters can cascade top-down.
// ---------------------------------------------------------------------------
export type RegionSchoolTone = 'primary' | 'success' | 'warning' | 'danger'

export type RegionSchool = {
  id: string
  /** School / class name shown on the map node */
  name: string
  /** Short location shown in the နေရာ column of the detail table */
  place: string
  /** Username prefix for this school's demo roster */
  prefix: string
  studentCount: number
  /** Burmese-numeral rendering of studentCount for the map node */
  studentCountMm: string
  teachers: string[]
  coursesMm: string[]
  /** Sample overall progress for the node (လက်ရှိတိုးတက်မှု) */
  progress: number
  /** % position of the node on the game-map canvas */
  pos: { x: number; y: number }
  tone: RegionSchoolTone
}

export const sagaingSchools: RegionSchool[] = [
  {
    id: 'yayu-11',
    name: 'အမှတ်-၁၁ ရေဦး',
    place: 'ရေဦး',
    prefix: 'YU',
    studentCount: 36,
    studentCountMm: '၃၆',
    teachers: ['YaOoNaTER01'],
    coursesMm: ['အခြေခံအဆင့် မြန်မာစာ', 'အခြေခံအဆင့် အင်္ဂလိပ်စာ'],
    progress: 68,
    pos: { x: 5, y: 6 },
    tone: 'primary',
  },
  {
    id: 'wetlet-3',
    name: 'အမှတ်-၃ ဝက်လက်မြို့',
    place: 'ဝက်လက်မြို့',
    prefix: 'WL',
    studentCount: 20,
    studentCountMm: '၂၀',
    teachers: ['WaLaNaTER03', 'WaLaNaVLT02'],
    coursesMm: ['စတုတ္ထအဆင့် အခြေခံကွန်ပြူတာနှင့်အင်တာနက်'],
    progress: 54,
    pos: { x: 66, y: 10 },
    tone: 'success',
  },
  {
    id: 'sagaing-bc',
    name: 'စစ်ကိုင်း ဘကကျောင်း',
    place: 'စစ်ကိုင်း',
    prefix: 'SK',
    studentCount: 70,
    studentCountMm: '၇၀',
    teachers: ['SaKaNaTER01', 'SaKaNaTERTER02', 'SaKaNaVLT01'],
    coursesMm: ['ဒုတိယအဆင့် အင်္ဂလိပ်စာ', 'တတိယအဆင့် အင်္ဂလိပ်စာ'],
    progress: 72,
    pos: { x: 36, y: 48 },
    tone: 'warning',
  },
  {
    id: 'monywa-model',
    name: 'မုံရွာမြို့ စံတော်ဝင်ကျောင်း',
    place: 'မုံရွာမြို့',
    prefix: 'MW',
    studentCount: 30,
    studentCountMm: '၃၀',
    teachers: ['MaYaNaTER01', 'MaYaNaTER02'],
    coursesMm: ['ဒုတိယအဆင့် မြန်မာစာ', 'ဒုတိယအဆင့် သင်္ချာ'],
    progress: 47,
    pos: { x: 5, y: 58 },
    tone: 'danger',
  },
]
// Level templates used to build the per-school / per-level sections.
const schoolLevels = {
  l1: { id: 'school-level-1', label: 'Level-1', labelMm: 'အခြေခံအဆင့်' },
  l2: { id: 'school-level-2', label: 'Level-2', labelMm: 'ဒုတိယအဆင့်' },
  l3: { id: 'school-level-3', label: 'Level-3', labelMm: 'တတိယအဆင့်' },
  l4: { id: 'school-level-4', label: 'Level-4', labelMm: 'စတုတ္ထအဆင့်' },
} as const

type SchoolCourseSpec = {
  level: (typeof schoolLevels)[keyof typeof schoolLevels]
  courseId: string
  title: string
  titleMm: string
  /** သင်ကြားသည့် ဆရာ/ဆရာမ of this course at this school */
  teachers: string[]
  count: number
}

// Which courses each school runs, who teaches them and how the school's
// students split across them — the counts add up to each school's studentCount.
const schoolCourseSpecs: Record<string, SchoolCourseSpec[]> = {
  'yayu-11': [
    {
      level: schoolLevels.l1,
      courseId: 'yayu-l1-myanmar',
      title: 'L1 — Myanmar',
      titleMm: 'အခြေခံအဆင့် - မြန်မာစာ',
      teachers: ['YaOoNaTER01'],
      count: 20,
    },
    {
      level: schoolLevels.l1,
      courseId: 'yayu-l1-english',
      title: 'L1 — English',
      titleMm: 'အခြေခံအဆင့် - အင်္ဂလိပ်စာ',
      teachers: ['YaOoNaTER01'],
      count: 16,
    },
  ],
  'wetlet-3': [
    {
      level: schoolLevels.l4,
      courseId: 'wetlet-l4-computer',
      title: 'L4 — Basic Computer & Internet',
      titleMm: 'စတုတ္ထအဆင့် - အခြေခံကွန်ပြူတာနှင့်အင်တာနက်',
      teachers: ['WaLaNaTER03', 'WaLaNaVLT02'],
      count: 20,
    },
  ],
  'sagaing-bc': [
    {
      level: schoolLevels.l2,
      courseId: 'sagaing-l2-english',
      title: 'L2 — English',
      titleMm: 'ဒုတိယအဆင့် - အင်္ဂလိပ်စာ',
      teachers: ['SaKaNaTER01', 'SaKaNaVLT01'],
      count: 38,
    },
    {
      level: schoolLevels.l3,
      courseId: 'sagaing-l3-english',
      title: 'L3 — English',
      titleMm: 'တတိယအဆင့် - အင်္ဂလိပ်စာ',
      teachers: ['SaKaNaTERTER02', 'SaKaNaVLT01'],
      count: 32,
    },
  ],
  'monywa-model': [
    {
      level: schoolLevels.l2,
      courseId: 'monywa-l2-myanmar',
      title: 'L2 — Myanmar',
      titleMm: 'ဒုတိယအဆင့် - မြန်မာစာ',
      teachers: ['MaYaNaTER01'],
      count: 16,
    },
    {
      level: schoolLevels.l2,
      courseId: 'monywa-l2-math',
      title: 'L2 — Mathematics',
      titleMm: 'ဒုတိယအဆင့် - သင်္ချာ',
      teachers: ['MaYaNaTER02'],
      count: 14,
    },
  ],
}
// Deterministic demo roster for a school: ~12% never started (0%), ~33% sit
// at or above the 60% pass line, the rest are still progressing.
function schoolRosterEntries(prefix: string, count: number): [string, number][] {
  const rand = seeded(prefix.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) + count)
  return Array.from({ length: count }, (_, i) => {
    const roll = rand()
    let progress: number
    if (roll < 0.12) progress = 0
    else if (roll < 0.45) progress = 60 + Math.round(rand() * 40)
    else progress = 5 + Math.round(rand() * 55)
    return [`${prefix} usr${String(i + 1).padStart(2, '0')}`, Math.min(100, progress)]
  })
}

const schoolCourseCache = new Map<string, Course[]>()

function buildSchoolCourses(school: RegionSchool): Course[] {
  const cached = schoolCourseCache.get(school.id)
  if (cached) return cached

  const courses: Course[] = []
  for (const spec of schoolCourseSpecs[school.id] ?? []) {
    const students = makeStudents(schoolRosterEntries(school.prefix, spec.count), {
      place: school.place,
      school: school.name,
    })
    const average =
      Math.round((students.reduce((sum, s) => sum + s.progress, 0) / students.length) * 100) / 100

    courses.push({
      id: spec.courseId,
      title: spec.title,
      titleMm: spec.titleMm,
      average,
      activeCount: students.length,
      totalCount: students.length,
      cached: true,
      students,
      schoolId: school.id,
      levelId: spec.level.id,
      teachers: spec.teachers,
    })
  }

  schoolCourseCache.set(school.id, courses)
  return courses
}

/** Courses of one region school (cached). */
export function getSchoolCourses(schoolId: string): Course[] {
  const school = sagaingSchools.find((s) => s.id === schoolId)
  return school ? buildSchoolCourses(school) : []
}

/** Every course in the region dataset, with school/level/teacher metadata. */
export const regionCourses: Course[] = sagaingSchools.flatMap((s) => buildSchoolCourses(s))

/** Group courses into အတန်း (level) sections in Level-1 → Level-4 order. */
export function groupCoursesByLevel(courses: Course[]): LevelGroup[] {
  const groups: LevelGroup[] = []
  for (const level of Object.values(schoolLevels)) {
    const inLevel = courses.filter((c) => c.levelId === level.id)
    if (inLevel.length > 0) {
      groups.push({ id: level.id, label: level.label, labelMm: level.labelMm, courses: inLevel })
    }
  }
  return groups
}

/** Site-wide result sections — the region dataset grouped by အတန်း. */
export const levelGroups: LevelGroup[] = groupCoursesByLevel(regionCourses)

const schoolGroupsCache = new Map<string, LevelGroup[]>()

/** Level sections for one region school, reusing the standard detail design. */
export function getSchoolGroups(schoolId: string): LevelGroup[] {
  const cached = schoolGroupsCache.get(schoolId)
  if (cached) return cached
  const groups = groupCoursesByLevel(getSchoolCourses(schoolId))
  schoolGroupsCache.set(schoolId, groups)
  return groups
}

/** Every student of one region school (for the school summary counters). */
export function getSchoolStudents(schoolId: string): Student[] {
  return getSchoolCourses(schoolId).flatMap((c) => c.students)
}

/** Courses taught by one ဆရာ/ဆရာမ — the filter pool of the teacher-scoped view. */
export function getCoursesForTeacher(teacherId: string): Course[] {
  return regionCourses.filter((c) => (c.teachers ?? []).includes(teacherId))
}

export type SavedRecord = {
  id: string
  name: string
  nameMm: string
  when: string
  frequency: 'လစဉ်' | 'တစ်ကြိမ်တည်းသာ'
  recipients: string[]
  scope: string[]
  filter: string
}

export const savedRecords: SavedRecord[] = [
  {
    id: 'မှတ်တမ်း - ၁',
    name: 'နောက်တစ်ကြိမ်အတွက် စောင့်ဆိုင်းဆဲ 🟠',
    nameMm: 'မြင်းခြံ အမှတ် ၁ - လစဉ်တိုးတက်မှု',
    when: 'Wed, 1 Aug 2026 · 10:00 AM',
    frequency: 'လစဉ်',
    recipients: ['လက်ခံသူ - aye***@gmail.com', 'han***@gmail.com'],
    scope: ['သင်ယူမှုအဆင့် Level အားလုံး', 'ဘာသာရပ် Course အားလုံး', 'အဖွဲ့ Cohort အားလုံး'],
    filter: 'MGN00201-NF-L2-MYANMAR-LP01-GradebookReport-01082026',
  },
  {
    id: 'မှတ်တမ်း - ၂',
    name: 'ပေးပို့ပြီး 🟢',
    nameMm: 'ရွှေပြည်သာ အမှတ် ၁၆ အတန်း',
    when: 'Fri, 31 Jul 2026 · 9:42 AM',
    frequency: 'တစ်ကြိမ်တည်းသာ',
    recipients: ['လက်ခံသူ - aye***@gmail.com'],
    scope: ['သင်ယူမှုအဆင့် Level အားလုံး', 'ဘာသာရပ် Course အားလုံး', 'အဖွဲ့ Cohort အားလုံး'],
    filter: 'MGN00201-NF-L0-COURSE0-LP00-GradebookReport-31072026',
  },
]

export const scanMeta = {
  activeLearners: 156,
  totalStudents: 156,
  scannedStudents: 156,
  elapsedSeconds: 0.3,
  loadingSeconds: 0.0521,
  renderedRecords: 156,
  lastScan: 'Wednesday, 29 July 2026, 10:27 PM',
  lastScanMm: '၂၀၂၆ ခုနှစ်, ဇူလိုင်လ ၂၉ ရက်, ဗုဒ္ဓဟူးနေ့ မနက် ၁၀:၂၇',
  autoScan: 'Pre-send',
  autoScanMm: 'မပို့မှီနာရီဝက်အလို',
}

export function progressTone(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 75) return 'success'
  if (value >= 50) return 'warning'
  return 'danger'
}

export const allStudents = levelGroups.flatMap((g) => g.courses.flatMap((c) => c.students))

/** Progress-weighted average across a course pool (site-wide or scoped). */
export function weightedAverage(courses: Course[]): number {
  const totalWeight = courses.reduce((sum, c) => sum + c.activeCount, 0)
  if (totalWeight === 0) return 0
  return (
    Math.round((courses.reduce((sum, c) => sum + c.average * c.activeCount, 0) / totalWeight) * 100) /
    100
  )
}

/** Site-wide average across every course in the dataset. */
export const overallAverage = weightedAverage(levelGroups.flatMap((g) => g.courses))

// Pass review — a student passes their relevant course at 60% progress or above.
export const PASS_THRESHOLD = 60

export type PassSummary = {
  threshold: number
  passedStudents: number
  progressingStudents: number
  totalStudents: number
  passedCourses: number
  progressingCourses: number
  totalCourses: number
  passRate: number
}

/** Pass review computed over a course pool (site-wide or scoped). */
export function computePassSummary(courses: Course[]): PassSummary {
  let passedStudents = 0
  let progressingStudents = 0
  let passedCourses = 0
  let progressingCourses = 0

  for (const course of courses) {
    let hasPassed = false
    let hasProgressing = false
    for (const student of course.students) {
      if (student.progress >= PASS_THRESHOLD) {
        passedStudents++
        hasPassed = true
      } else {
        progressingStudents++
        hasProgressing = true
      }
    }
    if (hasPassed) passedCourses++
    if (hasProgressing) progressingCourses++
  }

  const totalStudents = passedStudents + progressingStudents

  return {
    threshold: PASS_THRESHOLD,
    passedStudents,
    progressingStudents,
    totalStudents,
    passedCourses,
    progressingCourses,
    totalCourses: courses.length,
    passRate: totalStudents ? Math.round((passedStudents / totalStudents) * 1000) / 10 : 0,
  }
}

export const passSummary: PassSummary = computePassSummary(levelGroups.flatMap((g) => g.courses))

export type ProgressBucket = {
  start: number
  end: number
  count: number
  tone: 'success' | 'warning' | 'danger'
}

/** Distribution of a student pool across 10%-wide progress buckets (0% → 100%). */
export function progressBucketsFor(students: Student[]): ProgressBucket[] {
  return Array.from({ length: 10 }, (_, i) => {
    const start = i * 10
    const end = start + 10
    const count = students.filter(
      (s) => s.progress >= start && (i === 9 ? s.progress <= end : s.progress < end),
    ).length
    return { start, end, count, tone: progressTone(start) }
  })
}

// Site-wide distribution, colored with the same tone scale as the meters.
export const progressDistribution: ProgressBucket[] = progressBucketsFor(allStudents)

// ---------------------------------------------------------------------------
// Cascading report filters — the sidebar options come straight from the region
// dataset and narrow each other top-down: picking အတန်း restricts ဘာသာရပ်,
// picking ဘာသာရပ် restricts ဆရာ, picking နေရာ restricts everything. Every
// selection is applied to the result pane via matchingCourses().
// ---------------------------------------------------------------------------
export type FilterFacet = 'schools' | 'levels' | 'courses' | 'teachers'

export type FilterSelection = Record<FilterFacet, string[]>

/** Empty selection = အားလုံး (no filtering). */
export const emptyFilters: FilterSelection = { schools: [], levels: [], courses: [], teachers: [] }

/** Sidebar filter state: cascading facets + the learners-only toggle. */
export type FilterUiState = { facets: FilterSelection; activeOnly: boolean }

export function hasActiveFilters(f: FilterSelection): boolean {
  return f.schools.length > 0 || f.levels.length > 0 || f.courses.length > 0 || f.teachers.length > 0
}

function courseMatchesFacets(course: Course, sel: FilterSelection, skip: FilterFacet | null): boolean {
  if (
    skip !== 'schools' &&
    sel.schools.length > 0 &&
    (!course.schoolId || !sel.schools.includes(course.schoolId))
  )
    return false
  if (
    skip !== 'levels' &&
    sel.levels.length > 0 &&
    (!course.levelId || !sel.levels.includes(course.levelId))
  )
    return false
  if (skip !== 'courses' && sel.courses.length > 0 && !sel.courses.includes(course.id)) return false
  if (
    skip !== 'teachers' &&
    sel.teachers.length > 0 &&
    !(course.teachers ?? []).some((t) => sel.teachers.includes(t))
  )
    return false
  return true
}

/** Courses shown in the result pane for the current filter selection. The pool
 * defaults to the whole region dataset; the teacher-scoped view passes only
 * that teacher's courses. */
export function matchingCourses(sel: FilterSelection, pool: Course[] = regionCourses): Course[] {
  return pool.filter((c) => courseMatchesFacets(c, sel, null))
}

/** For each facet, the option values still reachable given the other facets. */
export function availableFilterOptions(
  sel: FilterSelection,
  pool: Course[] = regionCourses,
): Record<FilterFacet, string[]> {
  const facets: FilterFacet[] = ['schools', 'levels', 'courses', 'teachers']
  const out = {} as Record<FilterFacet, string[]>
  for (const facet of facets) {
    const scope = pool.filter((c) => courseMatchesFacets(c, sel, facet))
    const values =
      facet === 'teachers'
        ? scope.flatMap((c) => c.teachers ?? [])
        : scope.map((c) =>
            facet === 'schools' ? c.schoolId : facet === 'levels' ? c.levelId : c.id,
          )
    out[facet] = Array.from(new Set(values.filter((v): v is string => Boolean(v))))
  }
  return out
}

function sameSelection(a: FilterSelection, b: FilterSelection): boolean {
  const facets: FilterFacet[] = ['schools', 'levels', 'courses', 'teachers']
  return facets.every(
    (f) => a[f].length === b[f].length && a[f].every((v) => b[f].includes(v)),
  )
}

/** Drop selections that conflict with the other facets (keeps the cascade consistent). */
export function pruneFilters(
  sel: FilterSelection,
  pool: Course[] = regionCourses,
): FilterSelection {
  let current = sel
  for (let i = 0; i < 5; i++) {
    const avail = availableFilterOptions(current, pool)
    const next: FilterSelection = {
      schools: current.schools.filter((id) => avail.schools.includes(id)),
      levels: current.levels.filter((id) => avail.levels.includes(id)),
      courses: current.courses.filter((id) => avail.courses.includes(id)),
      teachers: current.teachers.filter((id) => avail.teachers.includes(id)),
    }
    if (sameSelection(next, current)) return next
    current = next
  }
  return current
}

/** တိုးတက်မှုရှိသော လေ့လာသူများသာ — trim each course to learners with progress > 0. */
export function applyLearnerVisibility(courses: Course[], activeOnly: boolean): Course[] {
  if (!activeOnly) return courses
  return courses
    .map((c) => {
      const shown = c.students.filter((s) => s.progress > 0)
      return { ...c, students: shown, activeCount: shown.length, totalCount: c.students.length }
    })
    .filter((c) => c.students.length > 0)
}

export type FilterOption = { id: string; labelMm: string }

/** သင်ကြားသည့် ဆရာ/ဆရာမ usernames, in canonical LMS order. */
const canonicalTeacherOrder = [
  'YaOoNaTER01',
  'WaLaNaTER03',
  'WaLaNaVLT02',
  'SaKaNaTER01',
  'SaKaNaTERTER02',
  'SaKaNaVLT01',
  'MaYaNaTER01',
  'MaYaNaTER02',
]

/** Filter options derived from a course pool. The site view passes every
 * course; the teacher-scoped view passes only that teacher's courses, so his
 * filter facets only ever list the options that concern him. */
export function filterOptionsForCourses(courses: Course[]): Record<FilterFacet, FilterOption[]> {
  const schoolIds = Array.from(new Set(courses.map((c) => c.schoolId ?? '')))
  const levelIds = Array.from(new Set(courses.map((c) => c.levelId ?? '')))
  const teacherIds = Array.from(new Set(courses.flatMap((c) => c.teachers ?? [])))
  return {
    schools: sagaingSchools
      .filter((s) => schoolIds.includes(s.id))
      .map((s) => ({ id: s.id, labelMm: s.name })),
    levels: Object.values(schoolLevels)
      .filter((l) => levelIds.includes(l.id))
      .map((l) => ({ id: l.id, labelMm: l.labelMm })),
    courses: courses.map((c) => ({ id: c.id, labelMm: c.titleMm ?? c.title })),
    teachers: canonicalTeacherOrder
      .filter((t) => teacherIds.includes(t))
      .map((t) => ({ id: t, labelMm: t })),
  }
}






