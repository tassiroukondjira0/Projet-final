const User = require('../models/User');
const Booking = require('../models/Booking');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Regroupe des documents par mois (Jan..Dec) pour une année donnée, à partir de leur createdAt.
const countByMonthForYear = async (Model, year, filter = {}) => {
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const results = await Model.aggregate([
    { $match: { ...filter, createdAt: { $gte: start, $lt: end } } },
    { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
  ]);

  const counts = new Array(12).fill(0);
  results.forEach((r) => {
    counts[r._id - 1] = r.count; // $month renvoie 1-12
  });
  return counts;
};

const percentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '+0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Le champ "country" est saisi en texte libre à l'inscription : deux
// utilisateurs au Sénégal peuvent avoir tapé "Sénégal", "senegal" ou
// "SENEGAL ". Une agrégation MongoDB classique ($group sur la valeur brute)
// créerait alors une barre séparée pour chaque variante. On normalise donc
// (accents, casse, espaces) avant de regrouper, tout en gardant comme
// libellé d'affichage l'orthographe la plus utilisée par les utilisateurs.
const normalizeCountryKey = (raw) =>
  raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents (é -> e, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // ignore ponctuation/apostrophes/tirets
    .trim();

const getLocationBreakdown = async () => {
  const users = await User.find({ country: { $nin: [null, ''] } }, 'country').lean();

  const groups = new Map(); // clé normalisée -> { count, labelCounts }
  users.forEach(({ country }) => {
    const raw = (country || '').trim();
    if (!raw) return;

    const key = normalizeCountryKey(raw);
    if (!groups.has(key)) {
      groups.set(key, { count: 0, labelCounts: new Map() });
    }
    const group = groups.get(key);
    group.count += 1;
    group.labelCounts.set(raw, (group.labelCounts.get(raw) || 0) + 1);
  });

  const entries = Array.from(groups.values()).map((group) => {
    let bestLabel = '';
    let bestLabelCount = -1;
    group.labelCounts.forEach((count, label) => {
      if (count > bestLabelCount) {
        bestLabelCount = count;
        bestLabel = label;
      }
    });
    return { label: bestLabel, count: group.count };
  });

  entries.sort((a, b) => b.count - a.count);
  return entries.slice(0, 4);
};

// @desc    Statistiques du dashboard (basées sur les vraies données de la base)
// @route   GET /api/dashboard/overview
// @access  Privé
const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalBookings,
      totalViews,
      thisYearUsers,
      lastYearUsers,
      deviceAgg,
      locationEntries,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Booking.countDocuments(),
      AnalyticsEvent.countDocuments(),
      countByMonthForYear(User, currentYear),
      countByMonthForYear(User, currentYear - 1),
      AnalyticsEvent.aggregate([{ $group: { _id: '$device', count: { $sum: 1 } } }]),
      getLocationBreakdown(),
    ]);

    const deviceLabels = ['iOS', 'Android', 'Windows', 'Mac', 'Linux', 'Other'];
    const deviceValues = deviceLabels.map(
      (label) => deviceAgg.find((d) => d._id === label)?.count ?? 0
    );

    const locationLabels = locationEntries.map((l) => l.label);
    const locationValues = locationEntries.map((l) => l.count);

    res.json({
      stats: [
        {
          id: 'views',
          title: 'Views',
          value: totalViews,
          change: '+0%',
          trend: 'up',
        },
        {
          id: 'visits',
          title: 'Visits',
          value: totalBookings,
          change: '+0%',
          trend: 'up',
        },
        {
          id: 'newUsers',
          title: 'New Users',
          value: newUsersThisMonth,
          change: percentChange(newUsersThisMonth, newUsersLastMonth),
          trend: newUsersThisMonth >= newUsersLastMonth ? 'up' : 'down',
        },
        {
          id: 'activeUsers',
          title: 'Active Users',
          value: activeUsers,
          change: '+0%',
          trend: 'up',
        },
      ],
      totalUsers: {
        labels: MONTH_LABELS,
        thisYear: thisYearUsers,
        lastYear: lastYearUsers,
      },
      trafficByDevice: {
        labels: deviceLabels,
        values: deviceValues,
      },
      trafficByLocation: {
        labels: locationLabels.length ? locationLabels : ['Aucune donnée'],
        values: locationValues.length ? locationValues : [0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Liste complète des clients et coachs (vue admin)
// @route   GET /api/dashboard/clients
// @access  Privé (admin)
//
// Inclut les comptes "client" ET "coach" (mais pas "admin") : le dashboard
// admin utilise cette même liste pour rechercher un coach existant à
// assigner à un cours (voir CoachSelector côté frontend).
const getClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: { $ne: 'admin' } }).sort('-createdAt');
    res.json({ total: clients.length, clients });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getClients };
