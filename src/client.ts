import type {
    XaraGeoClientConfig,
    SpatialEntity,
    CreateSpatialEntityParams,
    NearbySearchParams,
    PolygonSearchParams,
    Parcel,
    CreateParcelParams,
    CheckParcelOverlapParams,
    ParcelVersion,
    CreateParcelVersionParams,
    ParcelSplitParams,
    ParcelSplitResult,
    ParcelMergeParams,
    ParcelMergeResult,
    ParcelLineageEntry,
    SpatialEvent,
    GetSpatialEventsParams,
    H3StatsParams,
    H3Stat,
    ClusterParams,
    ClusterResult,
    HealthStatus,
    XaraApiError,
    LocationResolveResult,
    BoundaryResolveResult,
    LocationSearchResult,
    DistanceParams,
    DistanceResult,
    NearbyRoadsParams,
    NearbyRoadsResult,
    GSIDEntry,
    CreateGSIDParams,
    GSIDResolveResult,
    GraphNode,
    CreateGraphNodeParams,
    GraphEdge,
    CreateGraphEdgeParams,
    GraphChildrenResult,
    GraphParentsResult,
    GraphConnectedResult,
    GraphNodeDetailResult,
  } from "./types";
  import {
    XaraGeoError,
    XaraAuthError,
    XaraNotFoundError,
    XaraValidationError,
    XaraRateLimitError,
  } from "./errors";

  export class XaraGeoClient {
    private readonly baseUrl: string;
    private readonly tenantId: string;
    private readonly apiKey: string;
    private readonly timeout: number;

    constructor(config: XaraGeoClientConfig) {
      if (!config.baseUrl) throw new Error("baseUrl is required");
      if (!config.tenantId) throw new Error("tenantId is required");
      if (!config.apiKey) throw new Error("apiKey is required");

      this.baseUrl = config.baseUrl.replace(/\/+$/, "");
      this.tenantId = config.tenantId;
      this.apiKey = config.apiKey;
      this.timeout = config.timeout ?? 30000;
    }

    private async request<T>(
      method: string,
      path: string,
      options?: { body?: unknown; params?: Record<string, string | number | undefined> }
    ): Promise<T> {
      let url = `${this.baseUrl}${path}`;

      if (options?.params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(options.params)) {
          if (value !== undefined) {
            searchParams.set(key, String(value));
          }
        }
        const qs = searchParams.toString();
        if (qs) url += `?${qs}`;
      }

      const headers: Record<string, string> = {
        "X-TENANT-ID": this.tenantId,
        "X-API-KEY": this.apiKey,
      };

      if (options?.body) {
        headers["Content-Type"] = "application/json";
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({
            error: response.statusText,
          }))) as XaraApiError;

          switch (response.status) {
            case 401:
            case 403:
              throw new XaraAuthError(errorBody.error);
            case 404:
              throw new XaraNotFoundError(errorBody.error);
            case 400:
              throw new XaraValidationError(errorBody.error, errorBody.reason);
            case 429:
              throw new XaraRateLimitError(errorBody.error);
            default:
              throw new XaraGeoError(errorBody.error, response.status, errorBody.reason);
          }
        }

        return (await response.json()) as T;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof XaraGeoError) throw err;
        if (err instanceof Error && err.name === "AbortError") {
          throw new XaraGeoError("Request timed out", 0);
        }
        throw err;
      }
    }

    async healthCheck(): Promise<HealthStatus> {
      const url = `${this.baseUrl}/healthz`;
      const response = await fetch(url);
      return (await response.json()) as HealthStatus;
    }

    async createSpatialEntity(params: CreateSpatialEntityParams): Promise<SpatialEntity> {
      return this.request<SpatialEntity>("POST", "/spatial/entity", { body: params });
    }

    async searchNearby(params: NearbySearchParams): Promise<SpatialEntity[]> {
      return this.request<SpatialEntity[]>("GET", "/spatial/nearby", {
        params: {
          lat: params.lat,
          lon: params.lon,
          radius: params.radius,
          entity_type: params.entity_type,
        },
      });
    }

    async polygonSearch(params: PolygonSearchParams): Promise<SpatialEntity[]> {
      return this.request<SpatialEntity[]>("POST", "/spatial/within", { body: params });
    }

    async createParcel(params: CreateParcelParams): Promise<Parcel> {
      return this.request<Parcel>("POST", "/spatial/parcel", { body: params });
    }

    async checkParcelOverlap(params: CheckParcelOverlapParams): Promise<Parcel[]> {
      return this.request<Parcel[]>("POST", "/spatial/parcel-check", { body: params });
    }

    async createParcelVersion(parcelId: string, params: CreateParcelVersionParams): Promise<ParcelVersion> {
      return this.request<ParcelVersion>("POST", `/spatial/parcel/${parcelId}/version`, { body: params });
    }

    async getParcelVersions(parcelId: string): Promise<ParcelVersion[]> {
      return this.request<ParcelVersion[]>("GET", `/spatial/parcel/${parcelId}/version`);
    }

    async splitParcel(parcelId: string, params: ParcelSplitParams): Promise<ParcelSplitResult> {
      return this.request<ParcelSplitResult>("POST", `/spatial/parcel/${parcelId}/split`, { body: params });
    }

    async mergeParcels(params: ParcelMergeParams): Promise<ParcelMergeResult> {
      return this.request<ParcelMergeResult>("POST", "/spatial/parcel/merge", { body: params });
    }

    async getParcelLineage(parcelId: string): Promise<ParcelLineageEntry[]> {
      return this.request<ParcelLineageEntry[]>("GET", `/spatial/parcel/${parcelId}/lineage`);
    }

    async getSpatialEvents(params?: GetSpatialEventsParams): Promise<SpatialEvent[]> {
      return this.request<SpatialEvent[]>("GET", "/spatial/events", {
        params: {
          event_type: params?.event_type,
          limit: params?.limit,
        },
      });
    }

    async getH3Stats(params: H3StatsParams): Promise<H3Stat[]> {
      return this.request<H3Stat[]>("GET", "/spatial/h3-stats", {
        params: {
          h3_index: params.h3_index,
          metric_type: params.metric_type,
        },
      });
    }

    async runSpatialCluster(params: ClusterParams): Promise<ClusterResult[]> {
      return this.request<ClusterResult[]>("POST", "/spatial/cluster", { body: params });
    }

    async resolveLocation(lat: number, lng: number): Promise<LocationResolveResult> {
      return this.request<LocationResolveResult>("GET", "/spatial/location/resolve", {
        params: { lat, lng },
      });
    }

    async resolveBoundary(lat: number, lng: number): Promise<BoundaryResolveResult> {
      return this.request<BoundaryResolveResult>("GET", "/spatial/boundary/resolve", {
        params: { lat, lng },
      });
    }

    async searchLocations(q: string, limit?: number): Promise<LocationSearchResult> {
      return this.request<LocationSearchResult>("GET", "/spatial/search/location", {
        params: { q, limit },
      });
    }

    async calculateDistance(params: DistanceParams): Promise<DistanceResult> {
      return this.request<DistanceResult>("POST", "/spatial/distance", { body: params });
    }

    async findNearbyRoads(params: NearbyRoadsParams): Promise<NearbyRoadsResult> {
      return this.request<NearbyRoadsResult>("GET", "/spatial/roads/nearby", {
        params: {
          lat: params.lat,
          lng: params.lng,
          radius: params.radius,
          limit: params.limit,
        },
      });
    }

    async createGSID(params: CreateGSIDParams): Promise<GSIDEntry> {
      return this.request<GSIDEntry>("POST", "/spatial/gsid", {
        body: {
          name: params.name,
          gsid_type: params.gsid_type,
          latitude: params.latitude,
          longitude: params.longitude,
          country: params.country,
          state: params.state,
          city: params.city,
          zone: params.zone,
        },
      });
    }

    async lookupGSID(gsid: string): Promise<GSIDEntry> {
      return this.request<GSIDEntry>("GET", `/spatial/gsid/${gsid}`);
    }

    async resolveGSID(lat: number, lng: number, radius?: number): Promise<GSIDResolveResult> {
      return this.request<GSIDResolveResult>("GET", "/spatial/gsid/resolve", {
        params: { lat, lng, radius },
      });
    }

    async createGraphNode(params: CreateGraphNodeParams): Promise<GraphNode> {
      return this.request<GraphNode>("POST", "/spatial/graph/node", {
        body: {
          node_type: params.node_type,
          name: params.name,
          reference_id: params.reference_id,
          latitude: params.latitude,
          longitude: params.longitude,
        },
      });
    }

    async createGraphEdge(params: CreateGraphEdgeParams): Promise<GraphEdge> {
      return this.request<GraphEdge>("POST", "/spatial/graph/edge", {
        body: {
          from_node_id: params.from_node_id,
          to_node_id: params.to_node_id,
          relation_type: params.relation_type,
        },
      });
    }

    async getGraphChildren(nodeId: string): Promise<GraphChildrenResult> {
      return this.request<GraphChildrenResult>("GET", `/spatial/graph/children/${nodeId}`);
    }

    async getGraphParents(nodeId: string): Promise<GraphParentsResult> {
      return this.request<GraphParentsResult>("GET", `/spatial/graph/parents/${nodeId}`);
    }

    async getGraphConnected(nodeId: string, relation?: string): Promise<GraphConnectedResult> {
      return this.request<GraphConnectedResult>("GET", `/spatial/graph/connected/${nodeId}`, {
        params: { relation },
      });
    }

    async getGraphNode(nodeId: string): Promise<GraphNodeDetailResult> {
      return this.request<GraphNodeDetailResult>("GET", `/spatial/graph/node/${nodeId}`);
    }
  }
  