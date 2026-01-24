import {
  AuthorizationError,
  type AppContext,
} from "@webstudio-is/trpc-interface/index.server";

type DomainVirtual = {
  domain: string;
  status: string;
  verified: boolean;
};

const fetchAndMapDomains = async <
  T extends {
    id: string;
    title: string;
    domain: string;
    createdAt: string;
    [key: string]: unknown;
  },
>(
  projects: T[],
  context: AppContext
) => {
  const projectIds = projects.map((project) => project.id);

  type ProjectWithDomains = T & {
    domainsVirtual: DomainVirtual[];
  };

  if (projectIds.length === 0) {
    return projects.map((project) => ({
      ...project,
      domainsVirtual: [],
    })) as ProjectWithDomains[];
  }

  // Query ProjectDomain and Domain tables
  const domainsData = await context.postgrest.client
    .from("ProjectDomain")
    .select("projectId, Domain!inner(domain, status, txtRecord), txtRecord")
    .in("projectId", projectIds);

  if (domainsData.error) {
    console.error("Error fetching domains:", domainsData.error);
    // Continue without domains rather than failing
  }

  // Map domains to projects
  const domainsByProject = new Map<string, DomainVirtual[]>();
  if (domainsData.data) {
    for (const projectDomain of domainsData.data) {
      if (!domainsByProject.has(projectDomain.projectId)) {
        domainsByProject.set(projectDomain.projectId, []);
      }
      // Type assertion needed for joined data
      const domainData = projectDomain.Domain as unknown as {
        domain: string;
        status: string;
        txtRecord: string;
      };
      const verified = domainData.txtRecord === projectDomain.txtRecord;
      domainsByProject.get(projectDomain.projectId)?.push({
        domain: domainData.domain,
        status: domainData.status,
        verified,
      });
    }
  }

  // Add domains to projects
  return projects.map((project) => ({
    ...project,
    domainsVirtual: project.id ? domainsByProject.get(project.id) || [] : [],
  })) as ProjectWithDomains[];
};

export type DashboardProject = Awaited<ReturnType<typeof findMany>>[number];

export const findMany = async (userId: string, context: AppContext) => {
  if (context.authorization.type !== "user") {
    throw new AuthorizationError(
      "Only logged in users can view the project list"
    );
  }

  if (userId !== context.authorization.userId) {
    throw new AuthorizationError(
      "Only the project owner can view the project list"
    );
  }

  // Query DashboardProject without joins (views don't support FK relations in PostgREST)
  const data = await context.postgrest.client
    .from("DashboardProject")
    .select("*")
    .eq("userId", userId)
    .eq("isDeleted", false)
    .order("createdAt", { ascending: false })
    .order("id", { ascending: false });
  if (data.error) {
    throw data.error;
  }

  const projectIds = data.data
    .map((p) => p.id)
    .filter((id): id is string => id !== null);

  // Fetch assets and latestBuildVirtual separately using the Project table
  const [assetsData, latestBuildsData] = await Promise.all([
    projectIds.length > 0
      ? context.postgrest.client
          .from("Asset")
          .select("*")
          .in("projectId", projectIds)
      : Promise.resolve({ data: [], error: null }),
    projectIds.length > 0
      ? context.postgrest.client
          .from("Project")
          .select("id, latestBuildVirtual (*)")
          .in("id", projectIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Build maps for quick lookup
  const assetsMap = new Map<string, unknown>();
  if (assetsData.data) {
    for (const asset of assetsData.data) {
      assetsMap.set(`${asset.id}-${asset.projectId}`, asset);
    }
  }

  const latestBuildsMap = new Map<string, unknown>();
  if (latestBuildsData.data) {
    for (const project of latestBuildsData.data) {
      latestBuildsMap.set(project.id, project.latestBuildVirtual);
    }
  }

  // Merge data into projects
  const projectsWithRelations = data.data.map((project) => ({
    ...project,
    previewImageAsset: project.previewImageAssetId
      ? assetsMap.get(`${project.previewImageAssetId}-${project.id}`) || null
      : null,
    latestBuildVirtual: project.id
      ? latestBuildsMap.get(project.id) || null
      : null,
  }));

  // Type assertion: These fields are never null in practice (come from Project table which has them as required)
  return await fetchAndMapDomains(
    projectsWithRelations as Array<
      (typeof projectsWithRelations)[number] & {
        id: string;
        title: string;
        domain: string;
        createdAt: string;
      }
    >,
    context
  );
};

export const findManyByIds = async (
  projectIds: string[],
  context: AppContext
) => {
  if (projectIds.length === 0) {
    return [];
  }

  // Query DashboardProject without joins (views don't support FK relations in PostgREST)
  const data = await context.postgrest.client
    .from("DashboardProject")
    .select("*")
    .in("id", projectIds)
    .eq("isDeleted", false)
    .order("createdAt", { ascending: false })
    .order("id", { ascending: false });
  if (data.error) {
    throw data.error;
  }

  const fetchedProjectIds = data.data
    .map((p) => p.id)
    .filter((id): id is string => id !== null);

  // Fetch assets and latestBuildVirtual separately using the Project table
  const [assetsData, latestBuildsData] = await Promise.all([
    fetchedProjectIds.length > 0
      ? context.postgrest.client
          .from("Asset")
          .select("*")
          .in("projectId", fetchedProjectIds)
      : Promise.resolve({ data: [], error: null }),
    fetchedProjectIds.length > 0
      ? context.postgrest.client
          .from("Project")
          .select("id, latestBuildVirtual (*)")
          .in("id", fetchedProjectIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Build maps for quick lookup
  const assetsMap = new Map<string, unknown>();
  if (assetsData.data) {
    for (const asset of assetsData.data) {
      assetsMap.set(`${asset.id}-${asset.projectId}`, asset);
    }
  }

  const latestBuildsMap = new Map<string, unknown>();
  if (latestBuildsData.data) {
    for (const project of latestBuildsData.data) {
      latestBuildsMap.set(project.id, project.latestBuildVirtual);
    }
  }

  // Merge data into projects
  const projectsWithRelations = data.data.map((project) => ({
    ...project,
    previewImageAsset: project.previewImageAssetId
      ? assetsMap.get(`${project.previewImageAssetId}-${project.id}`) || null
      : null,
    latestBuildVirtual: project.id
      ? latestBuildsMap.get(project.id) || null
      : null,
  }));

  // Type assertion: These fields are never null in practice (come from Project table which has them as required)
  return await fetchAndMapDomains(
    projectsWithRelations as Array<
      (typeof projectsWithRelations)[number] & {
        id: string;
        title: string;
        domain: string;
        createdAt: string;
      }
    >,
    context
  );
};
