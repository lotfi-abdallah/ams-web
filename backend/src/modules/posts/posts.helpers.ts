export function buildPostFilters(query: Query): Filters {
  const filters: Filters = {};

  if (query.tags) {
    const normalizedTags = [
      ...new Set(query.tags.split(",").map((tag) => tag.trim())),
    ].filter((tag) => tag.length > 0);

    if (normalizedTags.length > 0) {
      filters.tags = { $in: normalizedTags };
    }
  }

  if (query.from || query.to) {
    const dateFilter: { $gte?: Date; $lte?: Date } = {};

    if (query.from) {
      const fromDate = new Date(query.from);
      if (!Number.isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = fromDate;
      }
    }

    if (query.to) {
      const toDate = new Date(query.to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }
    }

    if (dateFilter.$gte || dateFilter.$lte) {
      filters.date = dateFilter;
    }
  }

  return filters;
}

interface Filters {
  tags?: { $in: string[] };
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface Query {
  tags?: string;
  from?: string;
  to?: string;
}
