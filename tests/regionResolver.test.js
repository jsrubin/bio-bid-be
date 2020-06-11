const regionResolver = require("../resolvers/regionResolver");

const dummyRegion = { data: { region: { id: 1, name: "Region" } } };
const dummyRegions = {
  data: {
    regions: [{ id: 1, name: "Region 1" }, { id: 2, name: "Region 2 " }],
  },
};

const prisma = {
  $exists: { region: jest.fn() },
  regions: jest.fn(() => dummyRegions),
  region: jest.fn(() => dummyRegion),
  createRegion: jest.fn(() => dummyRegion),
  updateRegion: jest.fn(() => dummyRegion),
  deleteRegion: jest.fn(() => dummyRegion),
};

describe("Query", () => {
  const region = jest.spyOn(regionResolver.Query, "region");
  const regions = jest.spyOn(regionResolver.Query, "regions");
  const searchRegions = jest.spyOn(regionResolver.Query, "searchRegions");
  const params = [{}, {}, { prisma }, {}];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("regions()", () => {
    it("calls prisma.regions", () => {
      regions(...params);

      expect(prisma.regions).toHaveBeenCalled();
      expect(prisma.regions).toHaveBeenCalledTimes(1);
    });
  });

  describe("region()", () => {
    it("calls prisma.region with name", () => {
      const params = [{}, { name: "Company" }, { prisma }, {}];
      region(...params);

      expect(prisma.region).toHaveBeenCalled();
      expect(prisma.region).toHaveBeenCalledTimes(1);
      expect(prisma.region).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Company" })
      );
    });
  });

  describe("searchRegions()", () => {
    const params = [{}, { search: "as" }, { prisma }, {}];

    it("throws an error if search length is less than 3 characters", async () => {
      const request = async () => await searchRegions(...params);
      await expect(() => request()).rejects.toThrow(
        "Please enter a search term at least 3 characters"
      );
      expect(prisma.regions).not.toHaveBeenCalled();
    });
  });
});

describe("Mutation", () => {
  const createRegion = jest.spyOn(regionResolver.Mutation, "createRegion");
  const updateRegion = jest.spyOn(regionResolver.Mutation, "updateRegion");

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createRegion()", () => {
    it("throws an error if there is a region with same name", async () => {
      const params = [{}, { name: "Company" }, { prisma }, {}];
      prisma.$exists.region.mockImplementation(() => true);

      await expect(createRegion(...params)).rejects.toThrow(
        `There is a service named '${
          params[1].name
        }' already, please enter a different name.`
      );
      expect(prisma.createRegion).not.toHaveBeenCalled();
    });

    it("calls prisma.createRegion()", async () => {
      const params = [{}, { name: "Company" }, { prisma }, {}];
      prisma.$exists.region.mockImplementation(() => false);

      await createRegion(...params);

      expect(prisma.createRegion).toHaveBeenCalledTimes(1);
    });
  });
});
