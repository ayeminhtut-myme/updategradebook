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
    hintMm: 'အားလုံးကို ကြည့်ရှုနိုင်သည်',
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
    hintMm: 'အသေးစိတ်ရှာမယ်နှင့် ရမှတ်ကြည့်မယ်ကိုသာ ကြည့်ရှုနိုင်သည်',
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
    demoUser: 'NF usr72',
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
export const OWN_STUDENT_ID = 'NF usr72'

const cohortName = 'Gradebook Testers'

function makeStudents(entries: [string, number][]): Student[] {
  return entries.map(([name, progress]) => ({
    id: name,
    name,
    cohort: cohortName,
    place: '—',
    school: '—',
    progress,
    topics: makeTopics(name, progress),
  }))
}

export const levelGroups: LevelGroup[] = [
  {
    id: 'level-2',
    label: 'Level-2',
    labelMm: 'ဒုတိယအဆင့်',
    courses: [
      {
        id: 'l2-myanmar',
        title: 'L2 — Myanmar',
        titleMm: 'ဒုတိယအဆင့် - မြန်မာစာ',
        average: 0.38,
        activeCount: 3,
        totalCount: 3,
        cached: true,
        students: makeStudents([
          ['NF usr12', 0.75],
          ['NF usr18', 0.25],
          ['NF usr24', 0.14],
        ]),
      },
      {
        id: 'l2-math',
        title: 'L2 — Mathematics',
        titleMm: 'ဒုတိယအဆင့် - သင်္ချာ',
        average: 2.07,
        activeCount: 2,
        totalCount: 2,
        cached: true,
        students: makeStudents([
          ['NF usr09', 3.2],
          ['NF usr31', 0.94],
        ]),
      },
    ],
  },
  {
    id: 'level-4',
    label: 'Level-4',
    labelMm: 'စတုတ္ထအဆင့်',
    courses: [
      {
        id: 'facilitator-21c',
        title: '21st Century Facilitator',
        average: 27.41,
        activeCount: 55,
        totalCount: 55,
        cached: true,
        students: makeStudents([
          ['NF usr02', 96],
          ['NF usr14', 88.5],
          ['NF usr27', 74.25],
          ['NF usr33', 61],
          ['NF usr41', 52.75],
          ['NF usr45', 44],
          ['NF usr48', 31.5],
          ['NF usr52', 24],
          ['NF usr55', 18.75],
          ['NF usr58', 9.5],
        ]),
      },
    ],
  },
  {
    id: 'bl-group',
    label: 'Blended Learning',
    labelMm: 'မေးကြမယ်ဖြေကြမယ်',
    courses: [
      {
        id: 'bl-course',
        title: 'Basic Course (With Questionnaire)',
        average: 13.63,
        activeCount: 67,
        totalCount: 67,
        cached: true,
        students: makeStudents([
          ['NF usr72', 100],
          ['NF usr73', 100],
          ['NF usr71', 82],
          ['NF usr69', 62.5],
          ['NF usr83', 62.13],
          ['NF usr70', 60],
          ['NF usr68', 50],
          ['NF usr66', 36.88],
          ['NF usr82', 34.13],
          ['NF usr81', 31.13],
          ['NF usr67', 24.75],
          ['NF usr65', 23.75],
          ['NF usr63', 20],
          ['NF usr62', 17.5],
          ['NF usr64', 17.5],
          ['NF usr79', 16],
          ['NF usr60', 15],
          ['NF usr57', 12.5],
          ['NF usr61', 12.5],
          ['NF usr53', 10],
          ['NF usr59', 10],
        ]),
      },
    ],
  },
]

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
  activeLearners: 166,
  totalStudents: 931,
  scannedStudents: 166,
  elapsedSeconds: 0.3,
  loadingSeconds: 0.0521,
  renderedRecords: 166,
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

export const overallAverage =
  Math.round(
    (levelGroups.flatMap((g) => g.courses).reduce((sum, c) => sum + c.average * c.activeCount, 0) /
      levelGroups.flatMap((g) => g.courses).reduce((sum, c) => sum + c.activeCount, 0)) *
      100,
  ) / 100

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

export const passSummary: PassSummary = (() => {
  const courses = levelGroups.flatMap((g) => g.courses)
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
})()

export type ProgressBucket = {
  start: number
  end: number
  count: number
  tone: 'success' | 'warning' | 'danger'
}

// Distribution of students across 10%-wide progress buckets (0% → 100%),
// colored with the same tone scale as the progress meters.
export const progressDistribution: ProgressBucket[] = Array.from({ length: 10 }, (_, i) => {
  const start = i * 10
  const end = start + 10
  const count = allStudents.filter(
    (s) => s.progress >= start && (i === 9 ? s.progress <= end : s.progress < end),
  ).length
  return { start, end, count, tone: progressTone(start) }
})
