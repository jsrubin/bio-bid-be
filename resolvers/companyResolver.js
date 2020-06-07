module.exports = {
  Query: {
    companies: (parent, args, { prisma }, info) => {
      return prisma.companies();
    },
    company: async (parent, { id }, { prisma }, info) => {
      if (!id) throw new Error("id is required");

      const findUser = await prisma.$exists.company({ id });
      if (!findUser) throw new Error("Company with that id does not exist...");

      return prisma.company({ id });
    },
  },
  Mutation: {
    createCompany: async (parent, args, { prisma, asyncForEach }, info) => {
      const {
        name,
        email,
        phases,
        logoURL,
        website,
        linkedin,
        overview,
        headquarters,
        companySize,
        services,
        regions,
        therapeutics,
      } = args;

      return await prisma.createCompany({
        name,
        email,
        phases: { set: phases },
        logoURL,
        website,
        linkedin,
        overview,
        headquarters,
        companySize,
        services: { connect: services },
        regions: { connect: regions },
        therapeutics: { connect: therapeutics },
      });
    },
    updateCompany: async (
      parent,
      args,
      { prisma, asyncForEach, oldItemRemover },
      info
    ) => {
      const {
        updated_name,
        updated_logoURL,
        updated_website,
        updated_linkedin,
        updated_overview,
        updated_headquarters,
        updated_companySize,
        updated_services,
        updated_specialties,
        updated_regions,
        updated_therapeutics,
        id,
      } = args;

      // If front-end provides updated_services, we remove the old services, thinking
      // that the user is providing a new list to replace the old one.
      // If user provides and empty array, all current services will be removed.
      // If user does not provide updated_services array, nothing happens.
      if (updated_services) {
        await oldItemRemover(
          id, // Company id
          "services", // What table to remove items from
          prisma.company({ id }).services, // Function for listing old items
          prisma.updateCompany // Function to update company and disconnect old records
        );
      }

      // Same process for updated_specialties
      if (updated_specialties) {
        await oldItemRemover(
          id,
          "specialties",
          prisma.company({ id }).specialties,
          prisma.updateCompany
        );
      }

      // Same process for updated_regions
      if (updated_regions) {
        await oldItemRemover(
          id,
          "regions",
          prisma.company({ id }).regions,
          prisma.updateCompany
        );
      }

      // Same process for updated_therapeutics
      if (updated_therapeutics) {
        await oldItemRemover(
          id,
          "therapeutics",
          prisma.company({ id }).therapeutics,
          prisma.updateCompany
        );
      }

      // If the service is not in DB, add it
      if (updated_services) {
        await asyncForEach(
          updated_services,
          prisma.service,
          prisma.createService
        );
      }

      if (updated_specialties) {
        await asyncForEach(
          updated_specialties,
          prisma.specialty,
          prisma.createSpecialty
        );
      }

      if (updated_regions) {
        await asyncForEach(updated_regions, prisma.region, prisma.createRegion);
      }

      if (updated_therapeutics) {
        await asyncForEach(
          updated_therapeutics,
          prisma.therapeutic,
          prisma.createTherapeutic
        );
      }

      return await prisma.updateCompany({
        data: {
          name: updated_name,
          logoURL: updated_logoURL,
          website: updated_website,
          linkedin: updated_linkedin,
          overview: updated_overview,
          headquarters: updated_headquarters,
          companySize: updated_companySize,
          services: { connect: updated_services },
          specialties: { connect: updated_specialties },
          regions: { connect: updated_regions },
          therapeutics: { connect: updated_therapeutics },
        },
        where: { id },
      });
    },
    deleteCompany: (parent, { id }, { prisma }, info) => {
      return prisma.deleteCompany({ id });
    },
  },
  Company: {
    studies: ({ id }, args, { prisma }, info) => {
      return prisma.company({ id }).studies();
    },
    services: (parent, args, { prisma }, info) => {
      console.log({ parent });
      return prisma.company({ id: parent.id }).services();
    },
    regions: ({ id }, args, { prisma }, info) => {
      return prisma.company({ id }).regions();
    },
    therapeutics: ({ id }, args, { prisma }, info) => {
      return prisma.company({ id }).therapeutics();
    },
  },
};
