import { Request, Response } from 'express';
import prisma from '../prisma.js';

const startOfDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const formatDay = (date: Date) => date.toISOString().slice(0, 10);

const getClientIp = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
  return req.ip || req.socket.remoteAddress || '';
};

export const trackSiteVisit = async (req: Request, res: Response) => {
  const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 500) : '/';
  const pageType = typeof req.body?.pageType === 'string' ? req.body.pageType.slice(0, 80) : 'page';
  const listingId = typeof req.body?.listingId === 'string' && req.body.listingId ? req.body.listingId : null;
  const categoryId = typeof req.body?.categoryId === 'string' && req.body.categoryId ? req.body.categoryId : null;
  const userId = typeof req.body?.userId === 'string' && req.body.userId !== 'guest' ? req.body.userId : null;
  const visitorId = typeof req.body?.visitorId === 'string' ? req.body.visitorId.slice(0, 120) : null;
  const referrer = typeof req.body?.referrer === 'string' ? req.body.referrer.slice(0, 500) : req.get('referer') || null;

  await prisma.siteVisit.create({
    data: {
      path,
      pageType,
      listingId,
      categoryId,
      userId,
      visitorId,
      referrer,
      userAgent: (req.get('user-agent') || '').slice(0, 500),
      ip: getClientIp(req)?.slice(0, 120)
    }
  });

  res.json({ success: true });
};

export const getSeoAnalytics = async (_req: Request, res: Response) => {
  const now = new Date();
  const since = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

  const [totalVisits, uniqueVisitors, recentVisits, categoryGroups, listingGroups] = await Promise.all([
    prisma.siteVisit.count({ where: { createdAt: { gte: since } } }),
    prisma.siteVisit.groupBy({ by: ['visitorId'], where: { createdAt: { gte: since }, visitorId: { not: null } } }),
    prisma.siteVisit.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, pageType: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.siteVisit.groupBy({
      by: ['categoryId'],
      where: { createdAt: { gte: since }, categoryId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 10
    }),
    prisma.siteVisit.groupBy({
      by: ['listingId'],
      where: { createdAt: { gte: since }, listingId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { listingId: 'desc' } },
      take: 10
    })
  ]);

  const categoryIds = categoryGroups.map((item) => item.categoryId).filter((id): id is string => Boolean(id));
  const listingIds = listingGroups.map((item) => item.listingId).filter((id): id is string => Boolean(id));
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, slug: true } }),
    prisma.listing.findMany({ where: { id: { in: listingIds } }, select: { id: true, title: true, imageUrl: true, category: { select: { name: true } } } })
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));
  const dayMap = new Map<string, { date: string; visits: number; productViews: number; categoryViews: number }>();

  for (let index = 0; index < 30; index += 1) {
    const day = new Date(since.getTime() + index * 24 * 60 * 60 * 1000);
    const key = formatDay(day);
    dayMap.set(key, { date: key, visits: 0, productViews: 0, categoryViews: 0 });
  }

  for (const visit of recentVisits) {
    const key = formatDay(visit.createdAt);
    const day = dayMap.get(key);
    if (!day) continue;
    day.visits += 1;
    if (visit.pageType === 'product') day.productViews += 1;
    if (visit.pageType === 'category') day.categoryViews += 1;
  }

  res.json({
    totalVisits,
    uniqueVisitors: uniqueVisitors.length,
    dailyVisits: Array.from(dayMap.values()),
    topCategories: categoryGroups.map((item) => ({
      id: item.categoryId,
      name: item.categoryId ? categoryMap.get(item.categoryId)?.name || 'Catégorie supprimée' : 'Catégorie inconnue',
      slug: item.categoryId ? categoryMap.get(item.categoryId)?.slug || '' : '',
      views: item._count._all
    })),
    topProducts: listingGroups.map((item) => ({
      id: item.listingId,
      title: item.listingId ? listingMap.get(item.listingId)?.title || 'Produit supprimé' : 'Produit inconnu',
      imageUrl: item.listingId ? listingMap.get(item.listingId)?.imageUrl || '' : '',
      categoryName: item.listingId ? listingMap.get(item.listingId)?.category?.name || '' : '',
      views: item._count._all
    }))
  });
};
