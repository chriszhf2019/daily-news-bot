/**
 * 分类枚举 - 整个应用的 category 唯一真源
 */

var CATEGORIES = [
  { key: 'AI',            label: 'AI 前沿',   icon: '🤖', accent: 'purple' },
  { key: 'tech',          label: '科技',       icon: '🚀', accent: 'blue'   },
  { key: 'finance',       label: '财经',       icon: '💰', accent: 'amber'  },
  { key: 'international', label: '国际',       icon: '🌍', accent: 'emerald'},
  { key: 'sports',        label: '体育',       icon: '⚽', accent: 'rose'   },
  { key: 'custom',        label: '自定义',     icon: '📝', accent: 'indigo' }
]

var CATEGORY_BY_KEY = {}
for (var i = 0; i < CATEGORIES.length; i++) {
  CATEGORY_BY_KEY[CATEGORIES[i].key] = CATEGORIES[i]
}

export function resolveCategory(category) {
  if (!category) return CATEGORY_BY_KEY.tech
  if (CATEGORY_BY_KEY[category]) return CATEGORY_BY_KEY[category]
  var lower = String(category).toLowerCase()
  for (var j = 0; j < CATEGORIES.length; j++) {
    var c = CATEGORIES[j]
    if (c.key.toLowerCase() === lower || c.label === category) return c
  }
  return CATEGORY_BY_KEY.custom
}

export function listCategoryFilters() {
  var result = [{ key: 'all', label: '全部', icon: '📊' }]
  for (var i = 0; i < CATEGORIES.length; i++) result.push(CATEGORIES[i])
  return result
}

export { CATEGORIES, CATEGORY_BY_KEY }
