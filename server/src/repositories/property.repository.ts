import  prisma  from "../prisma";

export async function searchProperties(filters: any) {
  return prisma.property.findMany({
    where: {
      city: filters.city ?? undefined,
      price: {
        gte: filters.priceMin ?? undefined,
        lte: filters.priceMax ?? undefined,
      },
      rooms: filters.rooms ?? undefined
    },
    take: 10,
  });
}
