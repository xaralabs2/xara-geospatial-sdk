export interface XaraGeoClientConfig {
    baseUrl: string;
    tenantId: string;
    apiKey: string;
    timeout?: number;
  }

  export interface SpatialEntity {
    id: string;
    tenant_id: string;
    entity_type: string;
    entity_id: string;
    latitude: number;
    longitude: number;
    geohash: string;
    h3_index: string;
    created_at: string;
  }

  export interface CreateSpatialEntityParams {
    entity_type: string;
    entity_id: string;
    latitude: number;
    longitude: number;
  }

  export interface NearbySearchParams {
    lat: number;
    lon: number;
    radius: number;
    entity_type?: string;
  }

  export interface PolygonSearchParams {
    polygon: number[][];
    entity_type?: string;
  }

  export interface Parcel {
    id: string;
    tenant_id: string;
    property_id: string;
    gpid: string;
    status: string;
    geohash: string;
    h3_index: string;
    area_sq_m: number;
    spatial_hash: string;
    created_at: string;
  }

  export interface CreateParcelParams {
    property_id: string;
    polygon_coordinates: number[][];
  }

  export interface CheckParcelOverlapParams {
    polygon_coordinates: number[][];
  }

  export interface ParcelVersion {
    id: string;
    parcel_id: string;
    version_number: number;
    geometry_hash: string | null;
    valid_from: string;
    valid_to: string | null;
    created_at: string;
  }

  export interface CreateParcelVersionParams {
    polygon_coordinates: number[][];
  }

  export interface ParcelSplitParams {
    child_polygons: number[][][];
  }

  export interface ParcelSplitResult {
    parent_parcel_id: string;
    child_parcels: Parcel[];
    event_type: string;
  }

  export interface ParcelMergeParams {
    parent_parcel_ids: string[];
    merged_polygon: number[][];
  }

  export interface ParcelMergeResult {
    merged_parcel: Parcel;
    parent_parcel_ids: string[];
    event_type: string;
  }

  export interface ParcelLineageEntry {
    id: string;
    parent_parcel_id: string;
    child_parcel_id: string;
    event_type: string;
    created_at: string;
    parent_gpid: string;
    child_gpid: string;
  }

  export interface SpatialEvent {
    id: string;
    tenant_id: string;
    event_type: string;
    entity_type: string;
    entity_id: string;
    payload: Record<string, unknown>;
    created_at: string;
  }

  export interface GetSpatialEventsParams {
    event_type?: string;
    limit?: number;
  }

  export interface H3StatsParams {
    h3_index: string;
    metric_type?: string;
  }

  export interface H3Stat {
    id: string;
    tenant_id: string;
    h3_index: string;
    metric_type: string;
    metric_value: number;
    metric_timestamp: string;
  }

  export interface ClusterParams {
    algorithm: "dbscan" | "kmeans" | "h3";
    entity_type?: string;
    epsilon?: number;
    min_points?: number;
    k?: number;
    resolution?: number;
  }

  export interface ClusterResult {
    cluster_id: number;
    centroid_lat: number;
    centroid_lon: number;
    point_count: number;
    points: Array<{
      id?: string;
      latitude?: number;
      longitude?: number;
      entity_type?: string;
    }>;
  }

  export interface HealthStatus {
    status: string;
  }

  export interface XaraApiError {
    error: string;
    reason?: string;
  }

  export interface Location {
    id: string;
    name: string;
    location_type: string;
    latitude: number;
    longitude: number;
    geohash: string;
    country: string | null;
    state: string | null;
    city: string | null;
    timezone: string | null;
    created_at: string;
  }

  export interface LocationResolveResult {
    resolved: boolean;
    district: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    boundaries: BoundaryMatch[];
    message?: string;
  }

  export interface BoundaryMatch {
    id?: string;
    name: string;
    boundary_type: string;
    country: string | null;
    state: string | null;
    city: string | null;
  }

  export interface BoundaryResolveResult {
    boundaries: BoundaryMatch[];
    count: number;
  }

  export interface LocationSearchResult {
    results: Location[];
    count: number;
  }

  export interface DistanceParams {
    pointA: [number, number];
    pointB: [number, number];
  }

  export interface DistanceResult {
    pointA: { lat: number; lng: number };
    pointB: { lat: number; lng: number };
    distance: {
      meters: number;
      kilometers: number;
    };
  }

  export interface NearbyRoadsParams {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }

  export interface Road {
    id: string;
    name: string;
    road_type: string;
    city: string | null;
    speed_limit: number | null;
    distance_meters: number;
  }

  export interface NearbyRoadsResult {
    roads: Road[];
    count: number;
  }

  export interface GSIDEntry {
    id: string;
    gsid: string;
    name: string;
    gsid_type: string;
    latitude: number;
    longitude: number;
    geohash: string;
    country: string | null;
    country_code: string;
    state: string | null;
    city: string | null;
    zone: string | null;
    created_at: string;
  }

  export interface CreateGSIDParams {
    name: string;
    gsid_type: "city" | "district" | "neighborhood" | "landmark" | "parcel" | "intersection";
    latitude: number;
    longitude: number;
    country?: string;
    state?: string;
    city?: string;
    zone?: string;
  }

  export interface GSIDResolveResult {
    results: (GSIDEntry & { distance_meters: number })[];
    count: number;
  }

  export interface GraphNode {
    id: string;
    graph_node_type: string;
    name: string;
    reference_id: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
  }

  export interface CreateGraphNodeParams {
    node_type: "location" | "boundary" | "road" | "intersection" | "parcel";
    name: string;
    reference_id?: string;
    latitude?: number;
    longitude?: number;
  }

  export interface GraphEdge {
    id: string;
    from_node_id: string;
    to_node_id: string;
    graph_relation_type: string;
    created_at: string;
  }

  export interface CreateGraphEdgeParams {
    from_node_id: string;
    to_node_id: string;
    relation_type: "INSIDE" | "ADJACENT" | "CONNECTS_TO" | "CONNECTED_TO" | "NEAR" | "PART_OF";
  }

  export interface GraphChildrenResult {
    children: GraphNode[];
    count: number;
  }

  export interface GraphParentsResult {
    parents: GraphNode[];
    count: number;
  }

  export interface GraphConnectedResult {
    connected: (GraphNode & { relation: string })[];
    count: number;
  }

  export interface GraphNodeDetailResult {
    node: GraphNode;
    edges: (GraphEdge & {
      from_name: string;
      from_type: string;
      to_name: string;
      to_type: string;
    })[];
  }
  