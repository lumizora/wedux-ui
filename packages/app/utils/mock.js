export const activities = [
  {
    id: '1',
    title: '春节特惠活动',
    description:
      '春节期间全场商品8折优惠，购满100元减20元，活动期间还有额外抽奖环节，满足消费条件即可参与，奖品丰厚。',
    status: 'active',
    type: 'discount',
    typeName: '折扣促销',
    startTime: '2026-01-29 00:00',
    endTime: '2026-02-05 23:59',
    budget: 50000,
    targetCount: 500,
    actualCount: 342,
    coverImage: 'https://picsum.photos/seed/spring/600/300',
    tags: ['促销', '节日', '折扣'],
    createdAt: '2026-01-20',
    location: '全国门店',
  },
  {
    id: '2',
    title: '会员日专属福利',
    description:
      '每月18日会员日，积分双倍加成，专属优惠券发放，限时限量不可错过，仅限注册会员参与。',
    status: 'active',
    type: 'promotion',
    typeName: '会员专享',
    startTime: '2026-04-18 10:00',
    endTime: '2026-04-18 23:59',
    budget: 20000,
    targetCount: 300,
    actualCount: 167,
    coverImage: 'https://picsum.photos/seed/member/600/300',
    tags: ['会员', '积分'],
    createdAt: '2026-04-10',
    location: '线上+线下',
  },
  {
    id: '3',
    title: '新品上市发布会',
    description:
      '全新产品系列正式亮相，现场体验区开放，前100名到场客户赠送礼品一份，预约有额外优惠。',
    status: 'ended',
    type: 'event',
    typeName: '线下活动',
    startTime: '2026-03-15 14:00',
    endTime: '2026-03-15 18:00',
    budget: 30000,
    targetCount: 200,
    actualCount: 198,
    coverImage: 'https://picsum.photos/seed/launch/600/300',
    tags: ['新品', '发布会'],
    createdAt: '2026-03-01',
    location: '上海旗舰店',
  },
  {
    id: '4',
    title: '清明假期满减活动',
    description:
      '清明假期三天乐购，满200减30，满500减100，叠加使用优惠券效果更佳，活动不与其他优惠同享。',
    status: 'ended',
    type: 'discount',
    typeName: '折扣促销',
    startTime: '2026-04-04 00:00',
    endTime: '2026-04-06 23:59',
    budget: 40000,
    targetCount: 800,
    actualCount: 723,
    coverImage: 'https://picsum.photos/seed/qingming/600/300',
    tags: ['假期', '满减'],
    createdAt: '2026-03-25',
    location: '全国门店',
  },
  {
    id: '5',
    title: '五一劳动节大促',
    description: '五一五天长假，全场低至6折，爆款商品直降，限时秒杀每天10点开抢，错过再等一年。',
    status: 'draft',
    type: 'discount',
    typeName: '折扣促销',
    startTime: '2026-05-01 00:00',
    endTime: '2026-05-05 23:59',
    budget: 100000,
    targetCount: 2000,
    actualCount: 0,
    coverImage: 'https://picsum.photos/seed/labour/600/300',
    tags: ['大促', '节日', '秒杀'],
    createdAt: '2026-04-12',
    location: '线上+线下',
  },
  {
    id: '6',
    title: '老客户回馈专场',
    description:
      '感谢老客户长期支持，本次活动专属回馈，购买满额享受额外8折，同时赠送积分和精美礼品。',
    status: 'paused',
    type: 'promotion',
    typeName: '会员专享',
    startTime: '2026-04-01 00:00',
    endTime: '2026-04-30 23:59',
    budget: 15000,
    targetCount: 150,
    actualCount: 62,
    coverImage: 'https://picsum.photos/seed/loyal/600/300',
    tags: ['老客户', '回馈'],
    createdAt: '2026-03-28',
    location: '线上',
  },
];

export const stats = {
  totalActivities: 6,
  activeActivities: 2,
  totalParticipants: 1492,
  monthRevenue: 128600,
  monthGrowth: 12.5,
};

export const activityTypes = [
  { value: 'discount', label: '折扣促销' },
  { value: 'promotion', label: '会员专享' },
  { value: 'event', label: '线下活动' },
  { value: 'new', label: '新品推荐' },
];

export const tagOptions = [
  '促销',
  '节日',
  '折扣',
  '会员',
  '积分',
  '新品',
  '发布会',
  '假期',
  '满减',
  '大促',
  '秒杀',
  '老客户',
  '回馈',
  '线下',
  '线上',
];

export const statusConfig = {
  active: { label: '进行中', type: 'success' },
  ended: { label: '已结束', type: 'default' },
  draft: { label: '草稿', type: 'warning' },
  paused: { label: '已暂停', type: 'danger' },
};

export function getActivityById(id) {
  return activities.find((a) => a.id === id) || null;
}

export function getActivitiesByStatus(status) {
  if (!status || status === 'all') return activities;
  return activities.filter((a) => a.status === status);
}
