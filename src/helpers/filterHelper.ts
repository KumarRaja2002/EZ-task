import { and, ilike, eq, ne, gte, lte, sql } from 'drizzle-orm';
import { files } from '../schemas/file';
import { drizzle } from 'drizzle-orm/node-postgres';

export const filterHelper = {

  filesFilter: (query: any, categoryId?: number) => {
    let filters = [];

    if (query && query.search_string) {
      const searchString = `%${query.search_string}%`;
      filters.push(`files.title ILIKE '${searchString}'`);
    }
    if (query.uploaded_by) {
      filters.push(`uploaded_by = ${query.uploaded_by}`);
    }
    if (query.type) {
      filters.push(`type = '${query.type}'`);
    }
    if (categoryId) {
      filters.push(`category_id = ${categoryId}`);
    }
    if (query.date_from && query.date_to) {
      const startDate = new Date(query.date_from)
      const endDate = new Date(query.date_to)
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate && endDate) {
        filters.push(`uploaded_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`);
      }
    }

    filters.push(`files.status = 'active'`)

    return filters.length > 0 ? filters.join(' AND ') : undefined;
  },


  categoriesFilter: (query: any) => {
    let filters = [];

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace('T', ' ').split('.')[0];
    };

    if (query.search_string) {
      filters.push(`categories.name ILIKE '%${query.search_string}%'`)
    }
    if (query.created_by) {
      filters.push(`created_by = ${query.created_by}`);
    }
    if (query.date_field && (query.date_from || query.date_to)) {
      const dateField = `categories.${query.date_field}`;

      const startDate = query.date_from ? formatDateTime(new Date(query.date_from)) : null;
      const endDate = query.date_to ? formatDateTime(new Date(query.date_to)) : null;

      if (startDate && endDate) {
        filters.push(`${dateField} BETWEEN '${startDate}' AND '${endDate}'`);
      } else if (startDate) {
        filters.push(`${dateField} >= '${startDate}'`);
      } else if (endDate) {
        filters.push(`${dateField} <= '${endDate}'`);
      }
    }

    filters.push(`categories.status = 'active'`)
    // filters.push(`files.status = 'active'`);
    return filters.length > 0 ? filters.join(' AND ') : undefined;

  },


  // getFileTypeFilter: (query: any, fileType: string, userId: number) => {
  //   let filters = [];

  //   if (query.name) {
  //     filters.push(sql`${files.name} ILIKE ${'%' + query.name + '%'}`);
  //   }

  //   filters.push(sql`${files.uploaded_by} = ${userId}`);

  //   if (fileType && fileType !== 'all') {
  //     filters.push(sql`${files.type} = ${fileType}`);
  //   }

  //   filters.push(sql`${files.status} = 'active'`);


  //   return filters;
  // },

  // // Filters for breakdown of storage by file type
  // getBreakdownFilters: (userId: number) => {
  //   return [
  //     sql`${files.uploaded_by} = ${userId}`,
  //     sql`${files.status} = 'active'`,
  //   ];
  // },


  archievedCategoriesFilter: (query: any) => {
    let filters = [];

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace('T', ' ').split('.')[0];
    };

    if (query.search_string) {
      filters.push(`name ILIKE '%${query.search_string}%'`);
    }
    if (query.created_by) {
      filters.push(`created_by = ${query.created_by}`);
    }
    if (query.date_field && (query.date_from || query.date_to)) {
      const dateField = query.date_field;
      const startDate = query.date_from ? formatDateTime(new Date(query.date_from)) : null;
      const endDate = query.date_to ? formatDateTime(new Date(query.date_to)) : null;

      if (startDate && endDate) {
        filters.push(`${dateField} BETWEEN '${startDate}' AND '${endDate}'`);
      } else if (startDate) {
        filters.push(`${dateField} >= '${startDate}'`);
      } else if (endDate) {
        filters.push(`${dateField} <= '${endDate}'`);
      }
    }

    filters.push(`categories.status = 'archieved'`);
    return filters.length > 0 ? filters.join(' AND ') : undefined;
  },


  archivedFilesFilter: (query: any, categoryId?: number) => {
    let filters = [];
    const formatDateTime = (date: Date) => {
      return date.toISOString().replace('T', ' ').split('.')[0];
    };
    if (query.name) {
      filters.push(`name ILIKE '%${query.name}%'`);
    }
    if (query.uploaded_by) {
      filters.push(`uploaded_by = ${query.uploaded_by}`);
    }
    if (categoryId) {
      filters.push(`category_id = ${categoryId}`);
    }
    if (query.date_field && (query.date_from || query.date_to)) {
      const dateField = query.date_field;
      const startDate = query.date_from ? formatDateTime(new Date(query.date_from)) : null;
      const endDate = query.date_to ? formatDateTime(new Date(query.date_to)) : null;
      if (startDate && endDate) {
        filters.push(`${dateField} BETWEEN '${startDate}' AND '${endDate}'`);
      } else if (startDate) {
        filters.push(`${dateField} >= '${startDate}'`);
      } else if (endDate) {
        filters.push(`${dateField} <= '${endDate}'`);
      }
    }
    if (query.type) {
      filters.push(`type = '${query.type}'`);
    }
    filters.push(`status = 'archieved'`)
    return filters.length > 0 ? filters.join(' AND ') : undefined;
  },



  newFilesFilter: (query: any, categoryId: number) => {
    let filters = [];

    if (categoryId) {
      filters.push(`category_id = ${categoryId}`);
    }

    if (query && query.search_string) {
      const searchString = `%${query.search_string}%`;
      filters.push(`files.title ILIKE '${searchString}'`);
    }

    if (query.type) {
      filters.push(`type = '${query.type}'`);
    }

    if (query.date_from && query.date_to) {
      const startDate = new Date(query.date_from);
      const endDate = new Date(query.date_to);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filters.push(`uploaded_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`);
    }

    filters.push(`files.status = 'active'`);

    return filters.length > 0 ? filters.join(' AND ') : undefined;
  },
};







